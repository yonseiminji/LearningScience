import { renderToStaticMarkup } from 'react-dom/server'
import RecallPanel from '/home/claude/learningscience/src/components/review/RecallPanel.jsx'
import R from '/home/claude/learningscience/src/data/socialization_rubric.js'
let bad = 0
const chk = (l, c) => { console.log(`${c?'PASS':'FAIL'}  ${l}`); if (!c) bad++ }
const ask = renderToStaticMarkup(<RecallPanel onSubmit={()=>{}} onAgain={()=>{}} />)
chk('빈 화면: 통 인출 요청', ask.includes('기억나는 걸 전부 적어'))
chk('빈 화면: 루브릭 항목이 안 보임', !ask.includes(R.items[0].statement))
chk('빈 화면: 강의 다시 보지 말라고', ask.includes('강의를 다시 보지 말고'))

const pick = (i) => ({ id: R.items[i].id, statement: R.items[i].statement, conceptId: R.items[i].conceptId, weight: R.items[i].weight })
const res = renderToStaticMarkup(<RecallPanel onAgain={()=>{}} result={{
  title: R.title, note: R.note,
  covered: [pick(0)], partial: [pick(3)], missing: [pick(10), pick(15)],
  mixups: [{ said: '사회화는 친구를 많이 사귀는 것', instead: '사회화는 규범과 기대를 배우는 과정이에요' }],
  nudge: '규범 이야기를 잘 적으셨어요. 자아 쪽도 떠올려 볼까요?', attempt: '사회화는 규범을 배우는 것',
}} />)
for (const [l, s, w] of [
  ['도달', R.items[0].statement, true],
  ['일부', R.items[3].statement, true],
  ['남음', R.items[10].statement, true],
  ['잘못 안 것: 쓴 말', '친구를 많이 사귀는 것', true],
  ['잘못 안 것: 강의 내용', '규범과 기대를 배우는 과정', true],
  ['내가 적은 글', '사회화는 규범을 배우는 것', true],
  ['다시 해 보기', '다시 해 보기', true],
  ['점수 없음', '점', false],
  ['개수 없음', '개 중', false],
  ['정답 표현 없음', '정답', false],
  ['틀림 표현 없음', '틀렸', false],
]) { const hit = res.includes(s) === w; console.log(`${hit?'PASS':'FAIL'}  ${l}`); if (!hit) bad++ }
process.exitCode = bad ? 1 : 0
