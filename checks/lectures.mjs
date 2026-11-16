// The uploaded transcript decides what the learner sees.
import { readFileSync } from 'node:fs'
import { createChunks } from '/home/claude/learningscience/src/utils/chunkSearch.js'
import { conceptsInChunks } from '/home/claude/learningscience/src/utils/conceptSearch.js'
import { buildCloze } from '/home/claude/learningscience/src/features/retrieval/cloze.js'
import { RUBRICS, pickRubric, rubricById } from '/home/claude/learningscience/src/data/socialization_rubric.js'
import K from '/home/claude/learningscience/src/data/socialization_knowledge.js'

let pass = 0, fail = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)

const LECTURE = '/home/claude/learningscience/docs/lectures/socialization_lecture1.txt'
const text = readFileSync(LECTURE, 'utf8')
const chunks = createChunks('a', text)
const found = conceptsInChunks(chunks).map(h => h.conceptId)

console.log('\n[A] 이 전사문이 범위를 정한다')
is('루브릭 하나', RUBRICS.length, 1)
is('판별됨', pickRubric(chunks).rubricId, 'socialization-lecture-v2')
is('관계없는 글은 루브릭 없음', pickRubric([{ text: '미적분 극한과 연속' }]), null)
ok('rubricId 로 찾을 수 있음', rubricById('socialization-lecture-v2') === RUBRICS[0])
is('모르는 id 는 null', rubricById('nope'), null)

console.log('\n[B] 지식베이스가 이 강의와 맞는다')
is('개념 수', K.concepts.length, 21)
is('강의에서 찾은 개념 수', found.length, 21)
is('강의에 없는 개념', K.concepts.filter(c => !found.includes(c.conceptId)).map(c => c.termKo).join(', '), '')
ok('이 판 밖인 개념이 없음', K.concepts.every(c => c.source.inEdition !== false))
ok('related 가 모두 실재', K.concepts.every(c => (c.related||[]).every(r => K.concepts.some(x => x.conceptId === r))))

console.log('\n[C] 물러난 강의의 흔적이 없다')
const gone = ['moral-development','kohlberg-levels','gilligan-critique','religion-as-agent','government-as-agent','princess-culture','significant-others']
for (const id of gone) ok(`${id} 없음`, !K.concepts.some(c => c.conceptId === id))
ok('루브릭도 참조하지 않음', RUBRICS.every(r => r.items.every(i => !gone.includes(i.conceptId))))

console.log('\n[D] 이 강의가 새로 가르치는 것')
for (const id of ['i-and-me','rite-of-passage','individual-agency']) {
  const c = K.concepts.find(x => x.conceptId === id)
  ok(`${id} 있음`, Boolean(c))
  ok(`${id} 강의에서 찾힘`, found.includes(id))
  ok(`${id} 교재 출처 있음`, c?.source?.section && c?.source?.lines?.length)
}

console.log('\n[E] 빈칸')
const items = buildCloze(chunks)
ok('빈칸이 만들어짐', items.length >= 5)
ok('머리말에서 뽑지 않음', !items.some(i => /과목:|주제:|참고 교재:|라이선스/.test(i.text)))
ok('답이 문장에 남지 않음', items.every(i => !i.text.includes(i.answer)))
ok('개념이 겹치지 않음', new Set(items.map(i => i.conceptId)).size === items.length)

console.log('\n[F] 루브릭이 전사문에 뿌리내렸다')
const r = RUBRICS[0]
is('항목 수', r.items.length, 28)
ok('id 중복 없음', new Set(r.items.map(i => i.id)).size === r.items.length)
ok('개념이 모두 실재', r.items.every(i => K.concepts.some(c => c.conceptId === i.conceptId)))
ok('weight 가 올바름', r.items.every(i => ['core','supporting'].includes(i.weight)))
is('근거 없는 항목', r.items.filter(i => !i.cues.some(q => text.includes(q))).map(i => i.id).join(', '), '')
ok('교재 판본을 밝힘', r.source.includes('BCcampus'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
