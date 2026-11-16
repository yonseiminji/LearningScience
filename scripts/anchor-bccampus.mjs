// Re-anchor the knowledge base to the BCcampus chapter.
//
// Run once, by hand. The corpus itself is not shipped: 773KB of textbook has
// no business in a browser bundle, and what the app needs from it is a
// section and a line per concept, which this writes in.
import { writeFileSync, readFileSync } from 'node:fs'
import { socializationKO as K } from '/home/claude/learningscience/docs/bccampus-ch05/bccampus_socialization_ch05_ko.js'

const PATH = '/home/claude/learningscience/src/data/socialization_knowledge.js'
const raw = readFileSync(PATH, 'utf8')
const head = raw.slice(0, raw.indexOf('export default '))
const data = JSON.parse(raw.slice(raw.indexOf('export default ') + 15))

const body = K.blocks.filter(b => b.kind === 'body' || b.kind === 'heading')
const termByKo = new Map(K.terms.map(t => [t.ko, t]))
const termByEn = new Map(K.terms.map(t => [t.en.toLowerCase(), t]))

// This corpus marks a definition as 전인습적 수준(preconventional stage)에서는 —
// the Korean term immediately followed by the English in brackets. A block
// shaped that way is where the chapter introduces the term, which is a better
// citation than wherever it happens to be mentioned first.
function anchorFor(names, en) {
  const defining = body.find(b =>
    names.some(n => new RegExp(`${escape(n)}\\s*\\(`).test(b.textKo || '')) ||
    (en && new RegExp(`${escape(en)}\\s*\\)`, 'i').test(b.textKo || '')))
  if (defining) return defining
  return body.find(b =>
    names.some(n => (b.textKo || '').includes(n)) ||
    (en && (b.originalEn || '').toLowerCase().includes(en.toLowerCase())))
}
const escape = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Concepts this Canadian edition does not treat as its own topic. Lecture 3
// teaches them from the US edition; saying the chapter covers them would be
// a citation to something it does not say.
const NOT_IN_EDITION = new Set(['religion-as-agent', 'government-as-agent'])

let anchored = 0
for (const concept of data.concepts) {
  if (NOT_IN_EDITION.has(concept.conceptId)) {
    concept.source = { section: '5.3', lines: null, inEdition: false }
    continue
  }
  const names = [concept.termKo, ...(concept.aliases || [])].filter(Boolean)
  const hit = anchorFor(names, concept.termEn)
  if (!hit) { console.log(`  ✗ ${concept.termKo}`); continue }
  concept.source = { section: hit.section, lines: [hit.sourceLine], inEdition: true }
  anchored += 1

  // The chapter's own Korean for the same idea, so a lecture that uses either
  // wording still opens the card.
  const extra = []
  const exact = termByKo.get(concept.termKo) || termByEn.get(String(concept.termEn).toLowerCase())
  if (exact) extra.push(exact.ko, ...(exact.aliasesKo || []))
  for (const name of extra) {
    if (name && name !== concept.termKo && !concept.aliases.includes(name)) concept.aliases.push(name)
  }
}

data.scope = {
  book: 'Introduction to Sociology – 3rd Canadian Edition',
  author: 'William Little',
  publisher: 'BCcampus',
  year: 2023,
  chapter: 5,
  sourceUrl: K.metadata.sourceUrl,
  licence: 'CC BY 4.0 (일부 제3자 자료는 별도 권리)',
  // The bundle is explicit that the uploaded text has no page boundaries and
  // that page labels were not guessed. So neither do we: citations are by
  // section, and by line where there is one.
  pages: '인쇄 쪽수는 확인되지 않아 인용하지 않습니다. 절과 행 번호로 표시해요.',
  note: 'Chapter 5 사회화를 다룹니다. 업로드한 강의 전사문에 나오는 개념만 화면에 보여요.',
  derivedFrom: 'bccampus_socialization_ch05_ko.js (543 blocks, 47 terms)',
}

writeFileSync(PATH, head + 'export default ' + JSON.stringify(data, null, 2) + '\n')
console.log(`  출처 재지정 ${anchored}/${data.concepts.length}개`)
console.log(`  이 판에 없는 개념 ${NOT_IN_EDITION.size}개는 inEdition:false 로 표시`)
