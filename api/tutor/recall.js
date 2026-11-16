// POST /api/tutor/recall — 곰곰이한테 설명하기
//
// The learner wrote an explanation from memory with the definition hidden.
// This reads it back against the concept's own key points and reports which
// ones it can find. It is deliberately not marking: no score comes back, and
// the screen that shows the result shows the textbook definition beside it,
// so what the learner gets is the gap rather than a verdict.
//
// What the model may decide is narrow — which of a numbered list it can find
// — and everything it returns is checked against what was sent. An index for
// a point that does not exist never reaches the screen, and `missing` is
// worked out here rather than accepted, so the two halves cannot disagree.

import { Type } from '@google/genai'
import { ApiError, generateJson, handler, sendJson } from '../_lib/gemini.js'
import { SYSTEM, prompt } from '../_lib/prompts/recall.js'
import { checkRate, requireString } from '../_lib/limit.js'
import { findConcept } from '../_lib/socialization.js'

const MAX_ATTEMPT = 1200

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    covered: { type: Type.ARRAY, items: { type: Type.INTEGER } },
    conflict: { type: Type.STRING },
    nudge: { type: Type.STRING },
  },
  required: ['covered', 'conflict', 'nudge'],
}

export default handler(async (request, response) => {
  checkRate(request)
  const body = request.body || {}

  requireString(body.materialId, 'materialId', { max: 120 })
  const conceptId = requireString(body.conceptId, 'conceptId', { max: 80 })
  const attempt = requireString(body.attempt, 'attempt', { max: MAX_ATTEMPT })

  const concept = findConcept(conceptId)
  if (!concept) throw new ApiError(400, `다루지 않는 개념이에요: ${conceptId}`)

  const keyPoints = concept.keyPoints || []
  if (keyPoints.length === 0) {
    throw new ApiError(409, '이 개념에는 아직 대조할 핵심 항목이 없어요.')
  }

  const data = await generateJson({
    systemInstruction: SYSTEM,
    prompt: prompt({
      termKo: concept.termKo,
      definitionKo: concept.definitionKo,
      keyPoints,
      attempt,
    }),
    responseSchema: SCHEMA,
    maxOutputTokens: 600,
  })

  // Only indices that exist, each once, in the order the points are listed.
  const covered = [...new Set(data.covered || [])]
    .filter((at) => Number.isInteger(at) && at >= 0 && at < keyPoints.length)
    .sort((a, b) => a - b)
  const missing = keyPoints.map((_, at) => at).filter((at) => !covered.includes(at))

  sendJson(response, 200, {
    conceptId,
    // Text, not indices, so the screen never has to look anything up.
    covered: covered.map((at) => keyPoints[at]),
    missing: missing.map((at) => keyPoints[at]),
    conflict: String(data.conflict || '').slice(0, 200),
    nudge: String(data.nudge || '').slice(0, 120),
    // The definition travels with the result: this is the moment it stops
    // being hidden, and it should not need a second request to appear.
    definitionKo: concept.definitionKo,
    misconceptions: concept.misconceptions || [],
    sourceLabel: `OpenStax ${concept.source.section}절 ${concept.source.pages}쪽`,
  })
})
