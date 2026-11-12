// POST /api/tutor/quiz — 선택한 강의 구간으로 문제 만들기
//
// The model only ever sees the chunks the learner picked, and every question
// it returns must point back at one of them. Questions that cannot be checked
// against the text are dropped rather than shown: a question the learner
// cannot verify against the lecture is worse than one fewer question.
//
// Answers do not travel with the questions. They are kept in _store.js and
// /api/tutor/answer does the marking.

import { Type } from '@google/genai'
import { ApiError, generateJson, handler, sendJson } from './_gemini.js'
import { checkRate, requireChunks, requireOneOf, requireString } from './_limit.js'
import { newQuizId, saveQuiz } from './_store.js'

const QUESTION_TYPES = ['ox', 'blank']

const SYSTEM = `당신은 한국 대학생의 복습을 돕는 조교입니다.
주어진 강의 원문만 근거로 이해 확인 문제를 만듭니다.

규칙:
- 원문에 적혀 있는 내용만 묻습니다. 원문에 없는 사실, 숫자, 이름을 만들지 않습니다.
- 각 문제마다 근거가 된 원문 문장을 evidenceText에 그대로 옮깁니다. 요약하거나 고쳐 쓰지 않습니다.
- evidenceText는 반드시 제공된 청크 안에 글자 그대로 있어야 합니다.
- ox 문제의 answer는 "O" 또는 "X"입니다.
- blank 문제의 answer는 원문에 나오는 낱말이며, evidenceText 안에 그 낱말이 있어야 합니다.
- 문제는 한국어 존댓말로, 한 문장으로 씁니다.
- 원문이 문제를 만들기에 모자라면 그 문제를 빼고 적게 만듭니다.`

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: QUESTION_TYPES },
          questionText: { type: Type.STRING },
          answer: { type: Type.STRING },
          acceptableAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
          sourceChunkIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          evidenceText: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ['type', 'questionText', 'answer', 'sourceChunkIds', 'evidenceText', 'explanation'],
      },
    },
  },
  required: ['questions'],
}

const loose = (value) => String(value || '').replace(/\s+/g, '')

/**
 * Keeps only questions the server can check against the text it sent.
 * Returns the survivors and why the rest were dropped, so the panel can say
 * how many were set aside rather than silently showing fewer.
 */
export function verifyQuestions(raw, chunks) {
  const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk.text]))
  const kept = []
  const dropped = []

  for (const [index, question] of (raw || []).entries()) {
    const reject = (reason) => dropped.push({ index, reason, questionText: question?.questionText || '' })

    if (!QUESTION_TYPES.includes(question?.type)) {
      reject('문제 유형이 올바르지 않음')
      continue
    }
    if (!question.questionText?.trim() || !question.answer?.trim()) {
      reject('문제나 정답이 비어 있음')
      continue
    }
    const ids = (question.sourceChunkIds || []).filter((id) => byId.has(id))
    if (ids.length === 0) {
      reject('보낸 청크를 가리키지 않음')
      continue
    }
    const evidence = loose(question.evidenceText)
    if (!evidence) {
      reject('근거 문장이 비어 있음')
      continue
    }
    const grounded = ids.some((id) => loose(byId.get(id)).includes(evidence))
    if (!grounded) {
      reject('근거 문장이 원문에 없음')
      continue
    }
    if (question.type === 'ox' && !['O', 'X'].includes(question.answer.trim().toUpperCase())) {
      reject('OX 정답이 O나 X가 아님')
      continue
    }
    // a blank's answer has to be a word from the evidence, which is the one
    // thing a server can check about whether the question is really grounded
    if (question.type === 'blank' && !loose(question.evidenceText).includes(loose(question.answer))) {
      reject('빈칸 정답이 근거 문장에 없음')
      continue
    }

    kept.push({
      questionId: `q-${index + 1}-${Math.random().toString(36).slice(2, 7)}`,
      type: question.type,
      questionText: question.questionText.trim(),
      answer: question.type === 'ox' ? question.answer.trim().toUpperCase() : question.answer.trim(),
      acceptableAnswers: (question.acceptableAnswers || []).filter((a) => typeof a === 'string' && a.trim()),
      sourceChunkIds: ids,
      evidenceText: question.evidenceText.trim(),
      explanation: question.explanation?.trim() || '',
    })
  }
  return { kept, dropped }
}

// what the browser is allowed to see
function publicQuestion(question) {
  return {
    questionId: question.questionId,
    type: question.type,
    questionText: question.questionText,
    sourceChunkIds: question.sourceChunkIds,
    evidenceText: question.evidenceText,
  }
}

export default handler(async (req, res, body) => {
  checkRate(req)

  const materialId = requireString(body.materialId, 'materialId', { max: 200 })
  const chunks = requireChunks(body.chunks)
  const questionTypes = Array.isArray(body.questionTypes) && body.questionTypes.length
    ? body.questionTypes.map((type) => requireOneOf(type, QUESTION_TYPES, 'questionTypes'))
    : QUESTION_TYPES
  const questionCount = Math.min(Math.max(Number(body.questionCount) || 3, 1), 5)

  const passage = chunks.map((chunk) => `[${chunk.chunkId}]\n${chunk.text}`).join('\n\n')
  const wanted = questionTypes.includes('blank') && questionTypes.includes('ox')
    ? `OX ${Math.max(questionCount - 1, 1)}문항과 빈칸 1문항`
    : `${questionTypes.join('/')} ${questionCount}문항`

  const data = await generateJson({
    systemInstruction: SYSTEM,
    prompt: `아래 강의 원문으로 ${wanted}을 만들어 주세요.\n\n${passage}`,
    responseSchema: SCHEMA,
  })

  const { kept, dropped } = verifyQuestions(data.questions, chunks)
  if (kept.length === 0) {
    throw new ApiError(422, '이 구간으로는 확인할 수 있는 문제를 만들지 못했어요. 다른 구간을 골라 주세요.')
  }

  const quizId = newQuizId(materialId)
  saveQuiz({ quizId, materialId, questions: kept })

  sendJson(res, 200, {
    schemaVersion: 1,
    provider: 'gemini',
    quizId,
    materialId,
    questions: kept.map(publicQuestion),
    droppedCount: dropped.length,
  })
})
