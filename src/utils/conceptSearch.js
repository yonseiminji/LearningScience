// Which Chapter 5 concepts a stretch of transcript actually covers.
//
// The server runs the same check; this copy decides what is offered, not what
// is allowed.

import KNOWLEDGE from '../data/socialization_knowledge.js'

// Below this, a name is too common to stand on its own: 자아, 직장 and 종교
// all appear in passing in sentences about something else, and a passing
// mention should not open a card explaining a concept the lecture never
// taught.
const SHORT_NAME = 3

const WORD = /[가-힣A-Za-z]{2,}/g

/** Content words from what the textbook says about a concept. */
function evidenceWords(concept) {
  const text = [...(concept.keyPoints || []), ...(concept.misconceptions || []), concept.definitionKo].join(' ')
  return [...new Set(String(text).match(WORD) || [])].filter((word) => word.length >= 3)
}

function namesOf(concept) {
  return [concept.termKo, concept.termEn, ...(concept.aliases || [])].filter(Boolean)
}

/**
 * A concept counts when the lecture names it.
 *
 * A short name has to be corroborated: the lecture must also use at least two
 * of the words the textbook uses about that concept. Otherwise a passing
 * mention of the word opens a card explaining something this lecture never
 * taught, which is worse than leaving it closed.
 */
export function conceptsInChunks(chunks = []) {
  const whole = chunks.map((chunk) => String(chunk?.text || '')).join('\n')
  const hits = []

  for (const concept of KNOWLEDGE.concepts) {
    const names = namesOf(concept)
    const matched = names.filter((name) => whole.includes(name))
    if (matched.length === 0) continue

    const strong = matched.some((name) => name.length >= SHORT_NAME)
    if (!strong) {
      const support = evidenceWords(concept).filter((word) => whole.includes(word)).length
      if (support < 2) continue
    }

    const chunkIds = chunks
      .filter((chunk) => names.some((name) => String(chunk?.text || '').includes(name)))
      .map((chunk) => chunk.chunkId)
    hits.push({ conceptId: concept.conceptId, chunkIds })
  }
  return hits
}
