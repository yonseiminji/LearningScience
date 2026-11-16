import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import RecallPanel from '/home/claude/learningscience/src/components/review/RecallPanel.jsx'
import SupportPanel from '/home/claude/learningscience/src/components/review/SupportPanel.jsx'
import { createChunks } from '/home/claude/learningscience/src/utils/chunkSearch.js'
import R from '/home/claude/learningscience/src/data/socialization_rubric.js'

let bad = 0
const chk = (l, c) => { console.log(`${c?'PASS':'FAIL'}  ${l}`); if (!c) bad++ }
const chunks = createChunks('n', readFileSync('/mnt/user-data/uploads/1932cc96-socialization_lecture.txt','utf8'))
const base = { chunks, onSubmit(){}, onGraded(){}, onAgain(){} }

console.log('\n[A] 고르는 화면')
const menu = renderToStaticMarkup(<RecallPanel {...base} />)
chk('오늘 무엇을 배웠나요', menu.includes('오늘 무엇을 배웠나요'))
chk('곰 아이콘', menu.includes('gomgomi.webp'))
chk('강의 전사문을 바탕으로', menu.includes('강의 전사문을 바탕으로'))
chk('세 선택지', ['빈칸 채우기','내 말로 개념 설명하기','오늘 배운 것 전부 적어보기'].every(s => menu.includes(s)))
chk('번호가 아니라 아이콘', !menu.includes('recall-level-step') && menu.includes('recall-level-icon'))
chk('1 2 3 숫자 없음', !/>[123]<\/span>/.test(menu))

console.log('\n[B] 머리말 문장은 빈칸이 되지 않는다')
const cloze = renderToStaticMarkup(<RecallPanel {...base} />)
chk('과목: 이 안 나옴', !cloze.includes('과목:'))

console.log('\n[C] 부족한 부분: 세 단계 모두에서 열린다')
const kinds = [
  ['빈칸', { kind: 'cloze', needsSupport: [{ conceptId: 'self', termKo: '자아', why: '빈칸에서 떠오르지 않았어요.', questionText: '우리는 태어날 때부터…', userAnswer: '', chunkIds: ['c-3'] }] }],
  ['개념', { kind: 'concept', needsSupport: [{ conceptId: 'socialization', termKo: '사회화', why: '아직 떠오르지 않은 내용이 있어요.', questionText: '…', userAnswer: 'x', chunkIds: [] }] }],
  ['통째', { kind: 'all', needsSupport: [{ conceptId: 'hidden-curriculum', termKo: '잠재적 교육과정', why: '학교 이야기가 빠져 있었어요.', questionText: 'y', userAnswer: 'z', chunkIds: [] }] }],
]
for (const [label, recall] of kinds) {
  const html = renderToStaticMarkup(<SupportPanel quiz={null} results={{}} chunks={chunks} recall={recall} onRequest={()=>{}} onRetry={()=>{}} />)
  chk(`${label}: 개념이 목록에 뜸`, html.includes(recall.needsSupport[0].termKo))
  chk(`${label}: 이유가 보임`, html.includes(recall.needsSupport[0].why))
  chk(`${label}: 문제 풀라는 안내 없음`, !html.includes('문제를 풀어'))
}
const clean = renderToStaticMarkup(<SupportPanel quiz={null} results={{}} chunks={chunks} recall={{ kind:'all', needsSupport: [] }} onRequest={()=>{}} onRetry={()=>{}} />)
chk('빠진 곳 없으면 그렇게 말함', clean.includes('빠진 곳이 없었어요'))
const none = renderToStaticMarkup(<SupportPanel quiz={null} results={{}} chunks={chunks} onRequest={()=>{}} onRetry={()=>{}} />)
chk('인출 전에는 안내만', none.includes('아직 인출 연습을 하지 않았어요'))

console.log('\n[D] 결과 화면')
const pick = i => ({ id: R.items[i].id, statement: R.items[i].statement, conceptId: R.items[i].conceptId, weight: R.items[i].weight })
const res = renderToStaticMarkup(<RecallPanel {...base} result={{
  kind:'all', title: R.title, note: R.note, covered: [pick(0)], partial: [], missing: [pick(10)],
  mixups: [], nudge: '잘 적으셨어요.', attempt: '사회화는 규범을 배우는 것', needsSupport: [] }} />)
for (const [l, s, w] of [['도달', R.items[0].statement, true], ['남음', R.items[10].statement, true], ['점수 없음', '점', false], ['정답 표현 없음', '정답', false]])
  { const hit = res.includes(s) === w; console.log(`${hit?'PASS':'FAIL'}  ${l}`); if (!hit) bad++ }
process.exitCode = bad ? 1 : 0
