// Which Chapter 5 concepts a stretch of transcript actually mentions.
//
// The same keyword match the server runs, kept here so the picker can grey out
// concepts the lecture never reached without a round trip. The server repeats
// the check: this copy decides what is offered, not what is allowed.

import KNOWLEDGE from '../data/socialization_knowledge.js'

export function conceptsInChunks(chunks = []) {
  const hits = []
  for (const concept of KNOWLEDGE.concepts) {
    const names = [concept.termKo, concept.termEn, ...(concept.aliases || [])].filter(Boolean)
    const chunkIds = chunks
      .filter((chunk) => names.some((name) => String(chunk?.text || '').includes(name)))
      .map((chunk) => chunk.chunkId)
    if (chunkIds.length) hits.push({ conceptId: concept.conceptId, chunkIds })
  }
  return hits
}
