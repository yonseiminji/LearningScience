// The point of three transcripts: what the learner sees must follow the file.
import { readFileSync } from 'node:fs'
import { createChunks } from '/home/claude/learningscience/src/utils/chunkSearch.js'
import { conceptsInChunks } from '/home/claude/learningscience/src/utils/conceptSearch.js'
import { buildCloze } from '/home/claude/learningscience/src/features/retrieval/cloze.js'
import { RUBRICS, pickRubric, rubricById } from '/home/claude/learningscience/src/data/socialization_rubric.js'
import K from '/home/claude/learningscience/src/data/socialization_knowledge.js'

let pass = 0, fail = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)

const L = {
  one: createChunks('a', readFileSync('/mnt/user-data/uploads/32fe3d71-socialization_lecture1_socialization.txt','utf8')),
  two: createChunks('b', readFileSync('/mnt/user-data/uploads/500ec903-socialization_lecture2_moral_development.txt','utf8')),
  three: createChunks('c', readFileSync('/mnt/user-data/uploads/06030f02-socialization_lecture3_institutional_agents.txt','utf8')),
}
const ids = (chunks) => conceptsInChunks(chunks).map(h => h.conceptId)

console.log('\n[A] 강의마다 다른 개념이 열린다')
is('1강 루브릭', pickRubric(L.one).rubricId, 'socialization-lecture-v1')
is('2강 루브릭', pickRubric(L.two).rubricId, 'moral-development-v1')
is('3강 루브릭', pickRubric(L.three).rubricId, 'institutional-agents-v1')
ok('셋이 서로 다른 개념 집합', new Set([ids(L.one).join(), ids(L.two).join(), ids(L.three).join()]).size === 3)
ok('1강에만 미드·거울 자아', ids(L.one).includes('mead-stages') && !ids(L.two).includes('mead-stages') && !ids(L.three).includes('mead-stages'))
ok('2강에만 콜버그·길리건', ['kohlberg-levels','gilligan-critique'].every(c => ids(L.two).includes(c) && !ids(L.one).includes(c) && !ids(L.three).includes(c)))
ok('3강에만 물질문화·공주 문화', ['material-culture','princess-culture'].every(c => ids(L.three).includes(c) && !ids(L.one).includes(c) && !ids(L.two).includes(c)))

console.log('\n[B] 스치듯 나온 말로 카드를 열지 않는다')
// 정부 appears in lecture 2 only in 정부 부패에 항의한 시위.
ok('2강에 정부 카드 없음', !ids(L.two).includes('government-as-agent'))
ok('3강에는 정부 카드 있음', ids(L.three).includes('government-as-agent'))

console.log('\n[C] 강의마다 다른 빈칸이 나온다')
for (const [name, chunks] of Object.entries(L)) {
  const items = buildCloze(chunks)
  ok(`${name}: 빈칸이 만들어짐`, items.length >= 4)
  ok(`${name}: 머리말에서 뽑지 않음`, !items.some(i => i.text.includes('과목:') || i.text.includes('단원:')))
  ok(`${name}: 답이 문장에 남지 않음`, items.every(i => !i.text.includes(i.answer)))
  ok(`${name}: 개념이 겹치지 않음`, new Set(items.map(i => i.conceptId)).size === items.length)
}
const texts = Object.values(L).map(c => buildCloze(c).map(i => i.text).join())
ok('세 강의의 빈칸이 서로 다름', new Set(texts).size === 3)

console.log('\n[D] 루브릭이 자기 강의에 뿌리내렸다')
for (const rubric of RUBRICS) {
  ok(`${rubric.rubricId}: id 중복 없음`, new Set(rubric.items.map(i => i.id)).size === rubric.items.length)
  ok(`${rubric.rubricId}: 개념이 모두 실재`, rubric.items.every(i => K.concepts.some(c => c.conceptId === i.conceptId)))
  ok(`${rubric.rubricId}: 모든 항목에 단서`, rubric.items.every(i => i.cues?.length > 0))
  ok(`${rubric.rubricId}: weight 가 올바름`, rubric.items.every(i => ['core','supporting'].includes(i.weight)))
}
const anchored = (rubric, chunks) => rubric.items.filter(i => !i.cues.some(c => chunks.map(x=>x.text).join('\n').includes(c))).map(i => i.id)
is('1강 항목이 전사문에 근거', anchored(RUBRICS[0], L.one).join(), '')
is('2강 항목이 전사문에 근거', anchored(RUBRICS[1], L.two).join(), '')
is('3강 항목이 전사문에 근거', anchored(RUBRICS[2], L.three).join(), '')
ok('rubricId 로 찾을 수 있음', RUBRICS.every(r => rubricById(r.rubricId) === r))
is('모르는 id 는 null', rubricById('nope'), null)
is('관계없는 글은 루브릭 없음', pickRubric([{ text: '미적분 극한과 연속' }]), null)

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
