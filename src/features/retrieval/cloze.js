// 빈칸 채우기 — made from the transcript, graded here, no model involved.
//
// The sentence is the lecture's own, and the blank is a term the knowledge
// base already knows, so there is nothing to generate and nothing that could
// be invented. Grading is an exact match against that term and the names the
// knowledge base records for it — which is honest here in a way that string
// similarity is not anywhere else: the answer is one specific word, not a
// meaning to be judged.
//
// This is the easiest of the three levels. The sentence hands back most of
// the context and asks for one word, which is where someone starts when a
// blank page is too much.

import KNOWLEDGE from '../../data/socialization_knowledge.js'

export const BLANK = '____'

/** Terms worth blanking: the concept names, longest first so 사회화 기관 wins over 사회화. */
export function termsToBlank() {
  const out = []
  for (const concept of KNOWLEDGE.concepts) {
    for (const name of [concept.termKo, ...(concept.aliases || [])]) {
      if (name && name.length >= 2 && /^[가-힣 ·]+$/.test(name)) {
        out.push({ term: name, conceptId: concept.conceptId, termKo: concept.termKo })
      }
    }
  }
  return out.sort((a, b) => b.term.length - a.term.length)
}

function sentencesOf(text) {
  return String(text || '')
    .replace(/^교수자:\s*/gm, '')
    .split(/(?<=[.?!])\s+/)
    .map((line) => line.replace(/^교수자:\s*/, '').trim())
    .filter(Boolean)
}

/**
 * One blank per sentence, at most one sentence per concept.
 *
 * Spreading across concepts rather than taking the first dozen sentences:
 * eight blanks all asking for 사회화 would be one question asked eight times.
 */
export function buildCloze(chunks = [], { limit = 8 } = {}) {
  const terms = termsToBlank()
  const items = []
  const usedConcepts = new Set()

  for (const chunk of chunks) {
    for (const sentence of sentencesOf(chunk.text)) {
      // Long enough to carry context, short enough to read in one go.
      if (sentence.length < 25 || sentence.length > 160) continue
      const hit = terms.find((entry) => !usedConcepts.has(entry.conceptId) && sentence.includes(entry.term))
      if (!hit) continue
      // The rest of the sentence has to be able to point at the answer. '이
      // 부분을 ____이라고 합니다' refers to the paragraph before it and is
      // unanswerable on its own, so a short remainder is not enough.
      const rest = sentence.replace(hit.term, '').replace(/[^가-힣]/g, '')
      if (rest.length < 20) continue
      if (/^(이|그|여기|저)/.test(sentence)) continue

      usedConcepts.add(hit.conceptId)
      items.push({
        id: `${chunk.chunkId}-${hit.conceptId}`,
        chunkId: chunk.chunkId,
        conceptId: hit.conceptId,
        // The term that was actually removed, not the concept's heading: an
        // alias matched the sentence, and showing 미드의 자아 발달 단계 for a
        // blank that swallowed 준비 단계 answers a different question.
        answer: hit.term,
        accepted: [...new Set([hit.term, ...acceptedFor(hit.conceptId)])],
        text: sentence.replace(hit.term, BLANK),
      })
      if (items.length >= limit) return items
      break // one blank per sentence, and move on
    }
  }
  return items
}

function acceptedFor(conceptId) {
  const concept = KNOWLEDGE.concepts.find((item) => item.conceptId === conceptId)
  if (!concept) return []
  return [concept.termKo, ...(concept.aliases || [])].filter(Boolean)
}

/** Spaces and the interpuncts the lecture uses are not what is being tested. */
export function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s·.,'"]/g, '')
}

export function gradeCloze(item, answer) {
  const given = normalize(answer)
  if (!given) return 'empty'
  return item.accepted.some((name) => normalize(name) === given) ? 'right' : 'other'
}
