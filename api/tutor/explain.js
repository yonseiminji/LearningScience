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
import { checkRate, requireChunks, requireOneOf, requireString } from '../_lib/limit.js'
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

export default handler(async (request, response) => {
  checkRate(request)
  const body = request.body || {}

  // materialId is a label, not a gate. It names the upload the chunks came
  // from, and uploads carry generated ids — pinning it to the knowledge
  // base's own id rejected every real lecture with a 400.
  requireString(body.materialId, 'materialId', { max: 120 })
  const supportType = requireOneOf(body.supportType, SUPPORT_TYPES, 'supportType')
  const conceptId = requireString(body.conceptId, 'conceptId', { max: 80 })
  const chunks = requireChunks(body.lectureChunks)
  const userQuestion = body.userQuestion ? requireString(body.userQuestion, 'userQuestion', { max: 400 }) : ''

  const concept = findConcept(conceptId)
  if (!concept) throw new ApiError(400, `다루지 않는 개념이에요: ${conceptId}`)

  const { chunks: kept, truncated } = limitChunks(chunks)
  const evidence = conceptEvidence(conceptId)

  const prompt = [
    `[교재 개념 항목]\n${JSON.stringify(evidence, null, 2)}`,
    `[강의 전사문]\n${kept.map((item) => `(${item.chunkId}) ${item.text}`).join('\n\n')}`,
    userQuestion ? `[학생의 질문]\n${userQuestion}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const data = await generateJson({
    systemInstruction: `${COMMON}\n\n${BY_TYPE[supportType]}`,
    prompt,
    responseSchema: SCHEMA,
    maxOutputTokens: 1200,
  })

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
    sourceLabel: `강의 전사문 + OpenStax ${concept.source.section}절`,
    warnings,
  })
})
