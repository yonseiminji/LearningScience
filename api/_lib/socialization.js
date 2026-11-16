// The server's view of the Chapter 5 knowledge base.
//
// The client sends a conceptId and nothing else about the textbook: a
// definition that arrived in a request is not a definition, it is user input.
// Everything the model is told about a concept is looked up here, and
// everything it returns is checked back against here.

import KNOWLEDGE from '../../src/data/socialization_knowledge.js'
import VISUALS from '../../src/data/socialization_visuals.js'

export const MATERIAL_ID = KNOWLEDGE.materialId
export const SUPPORT_TYPES = ['simple', 'example', 'analogy', 'comparison']

const BY_ID = new Map(KNOWLEDGE.concepts.map((item) => [item.conceptId, item]))
const VISUAL_BY_ID = new Map(VISUALS.visuals.map((item) => [item.visualId, item]))

export function conceptIds() {
  return [...BY_ID.keys()]
}

export function findConcept(conceptId) {
  return BY_ID.get(conceptId) || null
}

export function findVisual(visualId) {
  return VISUAL_BY_ID.get(visualId) || null
}

/** Caps from the spec, applied to what actually reaches the model. */
// A paragraph of this transcript is about 650 characters, so these caps are
// well clear of real input. They are here so that nothing can send far more
// than a paragraph or two: the ceiling used to allow 72KB into one support
// call, which is a token bill nobody meant to sign.
export const LIMITS = {
  maxChunks: 3,
  maxChunkChars: 1200,
  maxConcepts: 3,
  maxConceptChars: 1000,
}

/**
 * The chunks the model is allowed to see.
 *
 * Trimmed rather than rejected: a learner who picked a long passage should
 * get an answer about its opening, not an error. The caller is told what was
 * dropped so the response can say so.
 */
export function limitChunks(chunks) {
  const kept = chunks.slice(0, LIMITS.maxChunks).map((item) => ({
    chunkId: item.chunkId,
    text: String(item.text || '').slice(0, LIMITS.maxChunkChars),
  }))
  return {
    chunks: kept,
    droppedChunks: Math.max(0, chunks.length - kept.length),
    truncated: chunks
      .slice(0, LIMITS.maxChunks)
      .some((item) => String(item.text || '').length > LIMITS.maxChunkChars),
  }
}

/** The concept plus at most two related ones, as the prompt's evidence. */
export function conceptEvidence(conceptId) {
  const main = findConcept(conceptId)
  if (!main) return null
  const related = (main.related || [])
    .map(findConcept)
    .filter(Boolean)
    .slice(0, LIMITS.maxConcepts - 1)
  return [main, ...related].map((item) => ({
    conceptId: item.conceptId,
    termKo: item.termKo,
    termEn: item.termEn,
    definitionKo: item.definitionKo,
    keyPoints: item.keyPoints,
    misconceptions: item.misconceptions,
    source: item.source,
  }))
}

/**
 * Which concepts the lecture actually covers.
 *
 * Keyword matching over the chunk text, which is all the spec asks for at this
 * stage. A concept the transcript never mentions stays inactive rather than
 * being explained from the textbook alone — the lecture decides the scope.
 */
export function conceptsInChunks(chunks) {
  const text = chunks.map((item) => String(item.text || '')).join('\n')
  const hits = []
  for (const concept of KNOWLEDGE.concepts) {
    const names = [concept.termKo, concept.termEn, ...(concept.aliases || [])]
    const chunkIds = chunks
      .filter((chunk) => names.some((name) => name && String(chunk.text || '').includes(name)))
      .map((chunk) => chunk.chunkId)
    if (chunkIds.length) hits.push({ conceptId: concept.conceptId, chunkIds })
  }
  return { hits, scanned: text.length }
}

/**
 * Whether a diagram's shape is one the textbook supports.
 *
 * Mermaid parsing and conceptual soundness are different checks, and only the
 * second one is here. A stage diagram drawn as cause and effect parses
 * perfectly and still teaches the wrong thing.
 */
export function validateDiagram({ visualId, nodes = [], edges = [] }) {
  const visual = findVisual(visualId)
  const problems = []
  if (!visual) return { ok: false, problems: [`알 수 없는 도식입니다: ${visualId}`] }

  const allowed = new Set(visual.nodes)
  if (nodes.length > VISUALS.limits.maxNodes) problems.push(`노드가 ${VISUALS.limits.maxNodes}개를 넘습니다.`)
  if (edges.length > VISUALS.limits.maxEdges) problems.push(`엣지가 ${VISUALS.limits.maxEdges}개를 넘습니다.`)
  for (const node of nodes) if (!allowed.has(node)) problems.push(`허용되지 않은 노드입니다: ${node}`)

  for (const edge of edges) {
    if (!VISUALS.relations[edge.relation]) problems.push(`허용되지 않은 관계입니다: ${edge.relation}`)
    if (!allowed.has(edge.from) || !allowed.has(edge.to)) problems.push(`허용되지 않은 엣지입니다: ${edge.from} → ${edge.to}`)
    const banned = VISUALS.forbiddenEdges.find(
      (rule) => rule.from === edge.fromConceptId && rule.to === edge.toConceptId && rule.relation === edge.relation,
    )
    if (banned) problems.push(banned.why)
  }
  return { ok: problems.length === 0, problems }
}

/** Mermaid built here, from checked data — never a string the model wrote. */
export function toMermaid({ visualId, nodes, edges }) {
  const visual = findVisual(visualId)
  if (!visual) return null
  const key = new Map(nodes.map((name, at) => [name, `N${at}`]))
  const lines = [visual.diagramType === 'flowchart' ? 'flowchart TD' : 'flowchart TD']
  for (const [name, id] of key) lines.push(`  ${id}["${name.replace(/"/g, '')}"]`)
  for (const edge of edges) {
    const rel = VISUALS.relations[edge.relation]
    const label = rel.label ? `|${rel.label}|` : ''
    lines.push(`  ${key.get(edge.from)} ${rel.arrow}${label} ${key.get(edge.to)}`)
  }
  return lines.join('\n')
}

export { KNOWLEDGE, VISUALS }
