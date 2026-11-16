// POST /api/tutor/quiz — 선택한 강의 구간으로 문제 만들기
//
// The model only ever sees the chunks the learner picked, and every question
// it returns must point back at one of them. Questions that cannot be checked
// against the text are dropped rather than shown: a question the learner
// cannot verify against the lecture is worse than one fewer question.
//
// The answer travels with the question but sealed: the browser holds a token
// it cannot open, and /api/tutor/answer opens it to mark. See _seal.js for why
// an in-memory answer key cannot work across two Vercel Functions.

import { Type } from '@google/genai'
import { ApiError, generateJson, handler, sendJson } from '../_lib/gemini.js'
import { checkRate, finishRate, requireChunks, requireOneOf, requireString } from '../_lib/limit.js'
import { seal } from './_seal.js'
import { SYSTEM } from '../_lib/prompts/quiz.js'

const QUESTION_TYPES = ['ox', 'blank']

// The instruction is in English; everything it asks the model to WRITE is in
// Korean. The rules the server's own verifier depends on are stated here too,
// so a model that follows the prompt and a model that passes verifyQuestions
// are asking for the same thing. Where the two could disagree, this schema
// and those checks win.
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topicTag: { type: Type.STRING },
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

// What the browser is allowed to see, plus the sealed answer it will hand
// back when the learner commits. Nothing readable about the answer is here.
function publicQuestion(question) {
  return {
    questionId: question.questionId,
    type: question.type,
    questionText: question.questionText,
    sourceChunkIds: question.sourceChunkIds,
    evidenceText: question.evidenceText,
    answerToken: seal({
      questionId: question.questionId,
      answer: question.answer,
      acceptableAnswers: question.acceptableAnswers,
      explanation: question.explanation,
      sourceChunkIds: question.sourceChunkIds,
      evidenceText: question.evidenceText,
    }),
  }
}

export default handler(async (req, res, body) => {
  const slot = await checkRate(req)
  try {

  const materialId = requireString(body.materialId, 'materialId', { max: 200 })
  const chunks = requireChunks(body.chunks)
  const questionTypes = Array.isArray(body.questionTypes) && body.questionTypes.length
    ? body.questionTypes.map((type) => requireOneOf(type, QUESTION_TYPES, 'questionTypes'))
    : QUESTION_TYPES
  const questionCount = Math.min(Math.max(Number(body.questionCount) || 3, 1), 5)

  const passage = chunks.map((chunk) => `[${chunk.chunkId}]\n${chunk.text}`).join('\n\n')
  const wanted = questionTypes.includes('blank') && questionTypes.includes('ox')
    ? `ox ${Math.max(questionCount - 1, 1)} and blank 1`
    : `${questionTypes.join('/')} ${questionCount}`

  // The allowed ids are named rather than left to be read off the passage
  // headers, so 'cite only these' is a list the model can check itself
  // against. The lecture text stays below, as data.
  const data = await generateJson({
    systemInstruction: SYSTEM,
    prompt: `Target: ${wanted}. Fewer is correct when the text cannot support them.
Allowed sourceChunkIds (use only these): ${chunks.map((chunk) => chunk.chunkId).join(', ')}

Lecture chunks:
${passage}`,
    responseSchema: SCHEMA,
    // Not cached today, but the prompt carries chunk ids, so if it ever is,
    // a hit's ids must land on this request's rather than the recording's.
    chunkIds: chunks.map((chunk) => chunk.chunkId),
  })

  const { kept, dropped } = verifyQuestions(data.questions, chunks)
  if (kept.length === 0) {
    throw new ApiError(422, '이 구간으로는 확인할 수 있는 문제를 만들지 못했어요. 다른 구간을 골라 주세요.')
  }

  sendJson(res, 200, {
    schemaVersion: 1,
    provider: 'gemini',
    quizId: `quiz-${Date.now().toString(36)}`,
    materialId,
    // What the chunks were about, for the lecture card's study record. The
    // subject and the time are the app's to supply, never the model's.
    topicTag: typeof data.topicTag === 'string' ? data.topicTag.trim().slice(0, 60) : '',
    questions: kept.map(publicQuestion),
    droppedCount: dropped.length,
  })
  } finally {
    await finishRate(slot)
  }
})
