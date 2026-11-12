// POST /api/tutor/support — 어려움 유형에 따른 학습 지원
//
// Three kinds of stuck, three different prompts and three different shapes of
// answer. All of them are held to the same line: the lecture text is the only
// source. When the retrieved chunks do not cover the question, the model says
// so and the learner is pointed back at the lecture — an invented explanation
// is the one thing that would make this untrustworthy.
//
// question-type support must not give the answer away: the learner is still
// going to retry the question.

import { Type } from '@google/genai'
import { generateJson, handler, sendJson } from './_gemini.js'
import { checkRate, requireChunks, requireOneOf, requireString } from './_limit.js'

export const SUPPORT_TYPES = ['term', 'comparison', 'question']

const COMMON = `당신은 한국 대학생의 복습을 돕는 조교입니다.
아래 강의 원문에 적혀 있는 내용만 근거로 답합니다.

규칙:
- 원문에 없는 설명, 예시, 정의를 만들지 않습니다.
- 근거가 모자라면 status를 "insufficient_evidence"로 두고 response에 무엇이 부족한지 한 문장으로 적습니다.
- 인용한 원문 문장은 sourceText에 그대로 옮깁니다.
- 한국어 존댓말로, 세 문장을 넘기지 않습니다.`

const PROMPTS = {
  term: `${COMMON}
- 학생이 모르는 낱말의 뜻을, 원문에 쓰인 범위 안에서 풀어 설명합니다.
- 원문이 그 낱말을 정의하지 않았다면 정의를 지어내지 않습니다.`,
  comparison: `${COMMON}
- 두 개념이 강의에서 어떻게 구분되는지 정리합니다.
- 원문에 적히지 않은 차이는 만들지 않습니다. 원문이 한쪽만 다룬다면 그렇게 말합니다.`,
  question: `${COMMON}
- 문제가 무엇을 묻는지 쉬운 말로 다시 설명합니다.
- 정답을 알려 주거나 암시하지 않습니다. 학생은 이 문제를 다시 풀 것입니다.`,
}

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['supported', 'insufficient_evidence'] },
    response: { type: Type.STRING },
    sourceText: { type: Type.STRING },
    usedChunkIds: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['status', 'response'],
}

export default handler(async (req, res, body) => {
  checkRate(req)

  const supportType = requireOneOf(body.supportType, SUPPORT_TYPES, 'supportType')
  const questionText = requireString(body.questionText, 'questionText', { max: 1000 })
  const chunks = requireChunks(body.retrievedChunks, { maxCount: 4, maxChars: 6000 })
  const questionId = typeof body.questionId === 'string' ? body.questionId.slice(0, 200) : null
  const userAnswer = typeof body.userAnswer === 'string' ? body.userAnswer.slice(0, 500) : ''
  const isCorrect = body.isCorrect === true

  const passage = chunks.map((chunk) => `[${chunk.chunkId}]\n${chunk.text}`).join('\n\n')
  const asked = {
    term: '이 문제에 나온 낱말의 뜻을 모르겠다고 합니다.',
    comparison: '이 문제에 나온 두 개념의 차이가 헷갈린다고 합니다.',
    question: '이 문제가 무엇을 묻는지 모르겠다고 합니다.',
  }[supportType]

  const data = await generateJson({
    systemInstruction: PROMPTS[supportType],
    prompt: `문제: ${questionText}
학생의 답: ${userAnswer || '(답하지 않음)'} (${isCorrect ? '정답' : '오답'})
학생의 어려움: ${asked}

강의 원문:
${passage}`,
    responseSchema: SCHEMA,
    maxOutputTokens: 600,
  })

  const sent = new Set(chunks.map((chunk) => chunk.chunkId))
  const usedChunkIds = (data.usedChunkIds || []).filter((id) => sent.has(id))
  const status = data.status === 'supported' && data.response?.trim() ? 'supported' : 'insufficient_evidence'

  sendJson(res, 200, {
    schemaVersion: 1,
    provider: 'gemini',
    supportType,
    questionId,
    status,
    response: data.response?.trim() || '강의 원문에서 이 부분을 설명할 근거를 찾지 못했어요.',
    // only chunks that were actually sent; a model naming another is ignored
    sourceChunkIds: usedChunkIds.length > 0 ? usedChunkIds : chunks.map((chunk) => chunk.chunkId),
    sourceText: typeof data.sourceText === 'string' ? data.sourceText.trim() : '',
  })
})
