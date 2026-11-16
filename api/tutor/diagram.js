// POST /api/tutor/diagram — 개념 관계도
//
// mode=template returns a Mermaid string that was written and checked ahead of
// time. No model is called, so there is nothing to validate: the answer is the
// same every time the same concept is picked, which is what the spec asks for.
//
// mode=generated is not served here. Letting a model write Mermaid directly is
// the one approach the spec rules out, and the safe version of it — model
// proposes nodes and edges, server checks them against the allowed set and
// builds the string itself — is phase 4. validateDiagram and toMermaid are
// already written for that; until a human has reviewed the allowed relations
// per concept, this endpoint refuses rather than guesses.

import { ApiError, handler, sendJson } from '../_lib/gemini.js'
import { checkRate, finishRate, requireOneOf, requireString } from '../_lib/limit.js'
import { findConcept, findVisual } from '../_lib/socialization.js'

export default handler(async (request, response) => {
  const slot = await checkRate(request)
  try {
  const body = request.body || {}

  // materialId is a label, not a gate. It names the upload the chunks came
  // from, and uploads carry generated ids — pinning it to the knowledge
  // base's own id rejected every real lecture with a 400.
  requireString(body.materialId, 'materialId', { max: 120 })
  const mode = body.mode || 'template'
  requireOneOf(mode, ['template', 'generated'], 'mode')
  const conceptId = requireString(body.conceptId, 'conceptId', { max: 80 })

  const concept = findConcept(conceptId)
  if (!concept) throw new ApiError(400, `다루지 않는 개념이에요: ${conceptId}`)

  if (mode === 'generated') {
    throw new ApiError(501, '관계도 자동 생성은 아직 제공하지 않아요. 검증된 도식만 보여드려요.')
  }

  const visualId = body.visualId || concept.visualId
  const visual = visualId ? findVisual(visualId) : null
  if (!visual) {
    throw new ApiError(404, `‘${concept.termKo}’에는 아직 준비된 관계도가 없어요.`)
  }
  if (!visual.conceptIds.includes(conceptId)) {
    throw new ApiError(400, '이 개념의 관계도가 아니에요.')
  }

  // Only chunk ids the caller actually sent may come back out.
  const sourceChunkIds = Array.isArray(body.lectureChunks)
    ? body.lectureChunks.map((item) => item?.chunkId).filter((id) => typeof id === 'string')
    : []

  sendJson(response, 200, {
    conceptId,
    visualId: visual.visualId,
    mode: 'template',
    diagramType: visual.diagramType,
    title: visual.title,
    mermaidCode: visual.mermaidCode,
    altText: visual.altText,
    caveat: visual.caveat,
    sourceConceptIds: [conceptId],
    sourceChunkIds,
    // True because this string was checked before it shipped, not because a
    // model said so. A template that a person has not yet read against the
    // textbook says so here rather than claiming more than it has.
    validated: true,
    humanReviewed: visual.reviewed === true,
  })
  } finally {
    await finishRate(slot)
  }
})
