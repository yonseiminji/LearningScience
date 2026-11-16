// The server's view of the Chapter 5 knowledge base.
//
// The client sends a conceptId and nothing else about the textbook: a
// definition that arrived in a request is not a definition, it is user input.
// Everything the model is told about a concept is looked up here, and
// everything it returns is checked back against here.

import KNOWLEDGE from '../../src/data/socialization_knowledge.js'

export const MATERIAL_ID = KNOWLEDGE.materialId
export const SUPPORT_TYPES = ['simple', 'example', 'analogy', 'comparison']

const BY_ID = new Map(KNOWLEDGE.concepts.map((item) => [item.conceptId, item]))

export function conceptIds() {
  return [...BY_ID.keys()]
}

export function findConcept(conceptId) {
  return BY_ID.get(conceptId) || null
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

export { KNOWLEDGE }
