import { renderToStaticMarkup } from 'react-dom/server'
import RecallFirst from '/home/claude/learningscience/src/components/review/RecallFirst.jsx'
import ConceptPanel from '/home/claude/learningscience/src/components/review/ConceptPanel.jsx'
import K from '/home/claude/learningscience/src/data/socialization_knowledge.js'
const c = K.concepts.find(x => x.conceptId === 'socialization')
let bad = 0
const chk = (l, cond) => { console.log(`${cond?'PASS':'FAIL'}  ${l}`); if (!cond) bad++ }

const ask = renderToStaticMarkup(<RecallFirst concept={c} onSubmit={()=>{}} onSkip={()=>{}} />)
chk('물어보는 화면: 곰곰이 호출', ask.includes('곰곰이한테 설명해 볼까요'))
chk('물어보는 화면: 정의가 안 보임', !ask.includes(c.definitionKo))
chk('물어보는 화면: 핵심 항목도 안 보임', !ask.includes(c.keyPoints[0]))
chk('물어보는 화면: 건너뛰기 있음', ask.includes('건너뛰고'))
chk('물어보는 화면: 안심 문구', ask.includes('맞게 쓰지 않아도 괜찮아요'))

const res = renderToStaticMarkup(<RecallFirst concept={c} result={{
  covered: [c.keyPoints[0]], missing: [c.keyPoints[1], c.keyPoints[2]],
  conflict: '', nudge: '좋아요. 문화가 이어지는 쪽도 떠올려 볼까요?', attempt: '사회에서 사는 법 배우기' }} />)
chk('결과: 도달한 항목', res.includes(c.keyPoints[0]))
chk('결과: 남은 항목', res.includes(c.keyPoints[1]))
chk('결과: 내가 쓴 설명 보존', res.includes('사회에서 사는 법 배우기'))
chk('결과: 점수/개수 없음', !/\d+\s*(개|점)/.test(res.replace(/<[^>]+>/g,'')))
chk('결과: 정답·틀림 표현 없음', !res.includes('정답') && !res.includes('틀렸'))

// the stale-result bug
const base = { material: { materialId: 'f', chunks: [] }, chunks: [{ chunkId:'c1', text:'사회화는 과정입니다. 또래집단도 나옵니다.' }], onExplain(){}, onDiagram(){}, onRecall(){} }
const stale = renderToStaticMarkup(<ConceptPanel {...base} recall={{ conceptId: 'peer-group', covered: [], missing: [], attempt: 'x' }} />)
chk('다른 개념 결과가 있어도 화면이 비지 않음', stale.includes('기억에서 꺼내 보는 연습') || stale.includes('곰곰이한테'))
process.exitCode = bad ? 1 : 0
