// POST /api/tutor/recall — 통 인출 대조
//
// The learner wrote down everything they could remember of the lecture, with
// the transcript closed. This reads it against the rubric and reports which
// statements it can find.
//
// It is deliberately not marking. No score comes back and none can: the
// response has no field for one, the prompt forbids the vocabulary, and what
// the screen shows is the statements reached and the statements still to
// reach, in the lecture's own words.
//
// What the model may decide is narrow — membership of a closed, numbered list
// — and everything it returns is checked against what was sent. An id for a
// statement that does not exist never reaches the screen, and `missing` is
// worked out here rather than accepted, so the parts cannot disagree.

import { Type } from '@google/genai'
import { ApiError, generateJson, handler, sendJson } from '../_lib/gemini.js'
import { SYSTEM, prompt } from '../_lib/prompts/recall.js'
import { checkRate, requireString } from '../_lib/limit.js'
import RUBRIC from '../../src/data/socialization_rubric.js'
import { findConcept } from '../_lib/socialization.js'

const MAX_ATTEMPT = 4000

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    covered: { type: Type.ARRAY, items: { type: Type.STRING } },
    partial: { type: Type.ARRAY, items: { type: Type.STRING } },
    mixups: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { said: { type: Type.STRING }, instead: { type: Type.STRING } },
        required: ['said', 'instead'],
      },
    },
    reinforce: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { conceptId: { type: Type.STRING }, why: { type: Type.STRING } },
        required: ['conceptId', 'why'],
      },
    },
    nudge: { type: Type.STRING },
  },
  required: ['covered', 'partial', 'mixups', 'reinforce', 'nudge'],
}

export default handler(async (request, response) => {
  checkRate(request)
  const body = request.body || {}

  requireString(body.materialId, 'materialId', { max: 120 })
  const attempt = requireString(body.attempt, 'attempt', { max: MAX_ATTEMPT })

  // Two scopes, one reading. The whole lecture is checked against the rubric;
  // a single concept against its own key points. Same shape of task either
  // way — membership of a closed, numbered list — so the same prompt and the
  // same validation serve both.
  const scope = body.conceptId ? 'concept' : 'lecture'
  let title = RUBRIC.title
  let items = RUBRIC.items
  let note = RUBRIC.note

  if (scope === 'concept') {
    const concept = findConcept(body.conceptId)
    if (!concept) throw new ApiError(400, `다루지 않는 개념이에요: ${body.conceptId}`)
    if (!concept.keyPoints?.length) throw new ApiError(409, '이 개념에는 아직 대조할 항목이 없어요.')
    title = concept.termKo
    note = `${concept.termKo}에 대해 교재가 짚는 내용이에요.`
    items = concept.keyPoints.map((point, at) => ({
      id: `K${at + 1}`,
      statement: point,
      conceptId: concept.conceptId,
      weight: 'core',
      cues: [concept.termKo],
    }))
  } else if ((body.rubricId || RUBRIC.rubricId) !== RUBRIC.rubricId) {
    throw new ApiError(400, '이 강의에는 아직 대조할 항목이 없어요.')
  }

  const data = await generateJson({
    systemInstruction: SYSTEM,
    prompt: prompt({
      rubricTitle: title,
      items,
      attempt,
      concepts: [...new Set(items.map((item) => item.conceptId))]
        .map(findConcept)
        .filter(Boolean)
        .map((item) => ({ conceptId: item.conceptId, termKo: item.termKo })),
    }),
    responseSchema: SCHEMA,
    maxOutputTokens: 1400,
  })

  const byId = new Map(items.map((item) => [item.id, item]))
  const keep = (ids) => [...new Set(ids || [])].filter((id) => byId.has(id))

  const covered = keep(data.covered)
  // A statement cannot be both reached and half-reached; the fuller reading
  // of the learner's own words wins.
  const partial = keep(data.partial).filter((id) => !covered.includes(id))
  const missing = items.map((item) => item.id).filter((id) => !covered.includes(id) && !partial.includes(id))

  const out = (ids) =>
    ids.map((id) => {
      const item = byId.get(id)
      return { id, statement: item.statement, conceptId: item.conceptId, weight: item.weight }
    })

  // Which concepts to shore up, named by the model but only from concepts
  // that exist and that this list actually covers. 부족한 부분 다시 학습하기
  // reads this, so an id nobody can look up would be a dead card there.
  const inScope = new Set(items.map((item) => item.conceptId))
  const reinforce = (data.reinforce || [])
    .filter((item) => item && inScope.has(item.conceptId) && findConcept(item.conceptId))
    .slice(0, 3)
    .map((item) => ({
      conceptId: item.conceptId,
      termKo: findConcept(item.conceptId).termKo,
      why: String(item.why || '').slice(0, 200),
    }))

  sendJson(response, 200, {
    scope,
    rubricId: scope === 'lecture' ? RUBRIC.rubricId : null,
    conceptId: scope === 'concept' ? body.conceptId : null,
    title,
    note,
    covered: out(covered),
    partial: out(partial),
    missing: out(missing),
    mixups: (data.mixups || [])
      .filter((item) => item && typeof item.said === 'string' && typeof item.instead === 'string')
      .slice(0, 4)
      .map((item) => ({ said: item.said.slice(0, 160), instead: item.instead.slice(0, 200) })),
    reinforce,
    nudge: String(data.nudge || '').slice(0, 140),
  })
})
