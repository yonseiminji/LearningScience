// POST /api/tutor/explain — 개념 이해 지원 (쉬운 설명 / 사례 / 비유 / 비교)
//
// Two sources, ranked. The lecture transcript decides what was covered and how
// far an answer may go. The checked textbook entry supplies the definition.
// The model is allowed to choose the wording and to invent an everyday example
// — nothing else.
//
// The definition never comes from the request. A client could send any text it
// liked as "the textbook says"; the server looks the concept up itself and the
// model is told to keep that meaning. When the two sources disagree, the model
// reports the clash instead of blending them into something neither said.

import { Type } from '@google/genai'
import { ApiError, generateJson, handler, sendJson } from '../_lib/gemini.js'
import { BY_TYPE, COMMON } from '../_lib/prompts/explain.js'
import { checkRate, finishRate, requireChunks, requireOneOf, requireString } from '../_lib/limit.js'
import { SUPPORT_TYPES, conceptEvidence, findConcept, limitChunks } from '../_lib/socialization.js'

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['ok', 'insufficient_evidence', 'conflicting_sources'] },
    title: { type: Type.STRING },
    explanation: { type: Type.STRING },
    isGeneratedExample: { type: Type.BOOLEAN },
    sourceChunkIds: { type: Type.ARRAY, items: { type: Type.STRING } },
    sourceConceptIds: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['status', 'title', 'explanation', 'isGeneratedExample', 'sourceChunkIds', 'sourceConceptIds'],
}

/**
 * Exactly what the model is sent for one request.
 *
 * Exported so the cache build asks the same question the handler asks. If it
 * rebuilt the prompt itself the two would drift, and a drifted prompt is a
 * cache that never hits — or worse, hits on a question nobody asked.
 */
export function explainRequest({ conceptId, supportType, chunks, userQuestion = '' }) {
  const concept = findConcept(conceptId)
  if (!concept) return null
  const { chunks: kept, truncated } = limitChunks(chunks)
  const evidence = conceptEvidence(conceptId)
  const prompt = [
    `[교재 개념 항목]\n${JSON.stringify(evidence, null, 2)}`,
    `[강의 전사문]\n${kept.map((item) => `(${item.chunkId}) ${item.text}`).join('\n\n')}`,
    userQuestion ? `[학생의 질문]\n${userQuestion}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  return {
    concept,
    evidence,
    kept,
    truncated,
    call: {
      systemInstruction: `${COMMON}\n\n${BY_TYPE[supportType]}`,
      prompt,
      responseSchema: SCHEMA,
      maxOutputTokens: 1200,
      // So a cached answer's source ids land on the ids this request sent.
      chunkIds: kept.map((item) => item.chunkId),
    },
  }
}

export default handler(async (request, response) => {
  const slot = await checkRate(request)
  try {
  const body = request.body || {}

  // materialId is a label, not a gate. It names the upload the chunks came
  // from, and uploads carry generated ids — pinning it to the knowledge
  // base's own id rejected every real lecture with a 400.
  requireString(body.materialId, 'materialId', { max: 120 })
  const supportType = requireOneOf(body.supportType, SUPPORT_TYPES, 'supportType')
  const conceptId = requireString(body.conceptId, 'conceptId', { max: 80 })
  // A concept the lecture keeps returning to appears in more than eight
  // chunks -- 사회화 is in eleven of twelve -- and the client sends every one
  // of them. The default cap rejected that with a 413, so the most central
  // concept in the chapter answered nothing at all, while limitChunks right
  // below was built to trim exactly this case and says so. This guard bounds
  // the upload; limitChunks decides what the model sees, which is the first
  // three. Raising it moves no cache key, since the prompt is built from
  // those three either way.
  const chunks = requireChunks(body.lectureChunks, { maxCount: 24, maxChars: 24000 })
  const userQuestion = body.userQuestion ? requireString(body.userQuestion, 'userQuestion', { max: 400 }) : ''

  const built = explainRequest({ conceptId, supportType, chunks, userQuestion })
  if (!built) throw new ApiError(400, `다루지 않는 개념이에요: ${conceptId}`)
  const { concept, evidence, kept, truncated } = built

  const data = await generateJson(built.call)

  // Ids are checked rather than trusted: a returned id the request never
  // contained is a citation to something that was not read.
  const sentChunkIds = new Set(kept.map((item) => item.chunkId))
  const sentConceptIds = new Set(evidence.map((item) => item.conceptId))
  const warnings = []

  const sourceChunkIds = (data.sourceChunkIds || []).filter((id) => sentChunkIds.has(id))
  const sourceConceptIds = (data.sourceConceptIds || []).filter((id) => sentConceptIds.has(id))
  if (sourceChunkIds.length !== (data.sourceChunkIds || []).length) warnings.push('입력에 없는 전사문 출처를 걸러냈어요.')
  if (sourceConceptIds.length !== (data.sourceConceptIds || []).length) warnings.push('입력에 없는 개념 출처를 걸러냈어요.')
  // How many chunks fitted is our plumbing, not the learner's business; it
  // told them a number they could do nothing with. Dropping a chunk is still
  // worth knowing about in the log, which generateJson already records.
  if (truncated) warnings.push('강의 내용이 길어 앞부분만 보고 답했어요.')

  // An example or analogy that comes back unflagged gets flagged here. The
  // learner has to be able to tell an invented illustration from the book.
  const generated = supportType === 'example' || supportType === 'analogy'
  if (generated && data.isGeneratedExample === false) warnings.push('생성한 예시로 표시했어요.')

  sendJson(response, 200, {
    conceptId,
    supportType,
    status: data.status,
    title: data.title,
    explanation: data.explanation,
    // The fixed definition always travels with the answer, so the screen can
    // show it even when the generated part is unusable.
    definitionKo: concept.definitionKo,
    misconceptions: concept.misconceptions,
    isGeneratedExample: generated ? true : Boolean(data.isGeneratedExample),
    sourceChunkIds,
    sourceConceptIds,
    sourceLabel: `강의 전사문 + 교재 §${concept.source.section}`,
    warnings,
  })
  } finally {
    await finishRate(slot)
  }
})
