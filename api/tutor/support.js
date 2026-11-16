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
import { generateJson, handler, sendJson } from '../_lib/gemini.js'
import { COMMON, PROMPTS } from '../_lib/prompts/support.js'
import { checkRate, finishRate, requireChunks, requireOneOf, requireString } from '../_lib/limit.js'

export const SUPPORT_TYPES = ['term', 'comparison', 'question']

// The support prompts moved from explaining to scaffolding: the learner is
// going to retry the question, so the goal is the smallest useful clue plus
// something to check for themselves, not a finished answer.
//
// Two things this prompt asks for are not enforced anywhere in code, and must
// not be read as guaranteed: that the response withholds the answer, and that
// sourceText is really a quotation. /support receives no answerToken, so the
// server cannot tell what the answer is, let alone whether it leaked.
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['supported', 'insufficient_evidence'] },
    response: { type: Type.STRING },
    sourceText: { type: Type.STRING },
    usedChunkIds: { type: Type.ARRAY, items: { type: Type.STRING } },
    topicTag: { type: Type.STRING },
  },
  required: ['status', 'response'],
}

export default handler(async (req, res, body) => {
  const slot = await checkRate(req)
  try {

  const supportType = requireOneOf(body.supportType, SUPPORT_TYPES, 'supportType')
  const questionText = requireString(body.questionText, 'questionText', { max: 1000 })
  const chunks = requireChunks(body.retrievedChunks, { maxCount: 3, maxChars: 2400 })
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
    // What was studied, for the lecture card. Only meaningful alongside a
    // supported answer: with no evidence there is nothing to have studied.
    topicTag: status === 'supported' && typeof data.topicTag === 'string' ? data.topicTag.trim().slice(0, 60) : '',
  })
  } finally {
    await finishRate(slot)
  }
})
