import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import RecallPanel from '/home/claude/learningscience/src/components/review/RecallPanel.jsx'
import R from '/home/claude/learningscience/src/data/socialization_rubric.js'

let bad = 0
const chk = (l, c) => { console.log(`${c?'PASS':'FAIL'}  ${l}`); if (!c) bad++ }
const text = readFileSync('/mnt/user-data/uploads/1932cc96-socialization_lecture.txt','utf8')
const chunks = text.split(/\n\n+/).filter(p => p.startsWith('교수자:')).map((t,i) => ({ chunkId: 'c-'+(i+1), text: t }))
const base = { chunks, onSubmit(){}, onAgain(){} }

const menu = renderToStaticMarkup(<RecallPanel {...base} />)
chk('첫 화면: 오늘 무엇을 배웠나요', menu.includes('오늘 무엇을 배웠나요'))
chk('첫 화면: 곰 아이콘', menu.includes('gomgomi.webp'))
chk('세 선택지', ['빈칸 채우기','내 말로 개념 설명하기','오늘 배운 것 전부 적어보기'].every(s => menu.includes(s)))
chk('쉬운 것부터', menu.indexOf('빈칸 채우기') < menu.indexOf('오늘 배운 것 전부'))
chk('삭제된 문구 없음', !menu.includes('많이 적을수록'))
chk('루브릭 항목이 안 보임', !menu.includes(R.items[0].statement))

const pick = i => ({ id: R.items[i].id, statement: R.items[i].statement, conceptId: R.items[i].conceptId, weight: R.items[i].weight })
const res = renderToStaticMarkup(<RecallPanel {...base} result={{
  title: R.title, note: R.note, covered: [pick(0)], partial: [pick(3)], missing: [pick(10)],
  mixups: [{ said: '사회화는 친구를 많이 사귀는 것', instead: '규범과 기대를 배우는 과정이에요' }],
  nudge: '규범 이야기를 잘 적으셨어요.', attempt: '사회화는 규범을 배우는 것' }} />)
for (const [l, s, w] of [
  ['결과: 도달', R.items[0].statement, true],
  ['결과: 남음', R.items[10].statement, true],
  ['결과: 내가 적은 글', '사회화는 규범을 배우는 것', true],
  ['결과: 점수 없음', '점', false],
  ['결과: 정답 표현 없음', '정답', false],
  ['결과: 틀림 표현 없음', '틀렸', false],
]) { const hit = res.includes(s) === w; console.log(`${hit?'PASS':'FAIL'}  ${l}`); if (!hit) bad++ }
process.exitCode = bad ? 1 : 0
