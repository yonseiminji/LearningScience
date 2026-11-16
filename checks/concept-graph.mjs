import LEXICON from '/home/claude/learningscience/src/data/socialization_relations.js'
import { DIAGRAMS, describeGraph, diagramsForConcept, graphFor } from '/home/claude/learningscience/src/features/conceptGraph/fromLexicon.js'
import { CHAR, MAX_LINE, layerOf, layoutGraph, pickOrientation, wrap } from '/home/claude/learningscience/src/features/conceptGraph/layout.js'
import { FAMILY, LISTED, LIST_PREFIX, STYLE, isDirected, isListed, isNoteNode, isPart } from '/home/claude/learningscience/src/features/conceptGraph/relationStyle.js'

let pass = 0
let fail = 0
const is = (label, got, want) => {
  const ok = Object.is(got, want)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
const ok = (label, cond) => is(label, Boolean(cond), true)

console.log('\n[A] 사전이 그대로 들어왔다')
is('관계 30개', LEXICON.relations.length, 30)
is('유형 8개', LEXICON.relationTypes.length, 8)
ok('모든 관계에 근거 쪽수', LEXICON.relations.every((r) => (r.sourcePages || []).length > 0))
ok('모든 유형이 그리거나 적히거나 표가 되거나', LEXICON.relationTypes.every((t) => STYLE[t.id] || isListed(t.id) || isPart(t.id)))
ok('모든 유형에 가족 정의', LEXICON.relationTypes.every((t) => FAMILY[t.id]))

console.log('\n[B] 근거 없는 유형은 지어내지 않는다')
is('CAUSES 항목', LEXICON.relations.filter((r) => r.relationType === 'CAUSES').length, 0)
is('CONTRASTS_WITH 항목', LEXICON.relations.filter((r) => r.relationType === 'CONTRASTS_WITH').length, 0)
ok('그래도 모양은 준비돼 있음', STYLE.CAUSES && STYLE.CONTRASTS_WITH)

console.log('\n[C] 화살표는 방향이 있는 관계에만')
is('PRECEDES 화살촉', STYLE.PRECEDES.head, 'solid')
is('DEFINED_AS 화살촉 없음', STYLE.DEFINED_AS.head, 'none')
is('CONTRASTS_WITH 화살촉 없음', STYLE.CONTRASTS_WITH.head, 'none')
is('CONTRASTS_WITH 는 점선', STYLE.CONTRASTS_WITH.dash, '6 4')
is('CONTRASTS_WITH 는 다른 색', STYLE.CONTRASTS_WITH.tone, 'warn')
is('CONTRASTS_WITH 라벨', STYLE.CONTRASTS_WITH.label, '대조 (Contrasts with)')
ok('대조만 경고색', Object.entries(STYLE).filter(([, s]) => s.tone === 'warn').map(([k]) => k).join() === 'CONTRASTS_WITH')
ok('CAUSES 가 가장 굵음', Object.values(STYLE).every((s) => s.width <= STYLE.CAUSES.width))

console.log('\n[C2] 분류 관계는 그리지 않고 적는다')
is('적을 유형 2개', LISTED.join(), 'IS_A,EXAMPLE_OF')
is('PART_OF 는 적지 않고 표로', isListed('PART_OF'), false)
ok('PART_OF 만 표', isPart('PART_OF') && !isPart('IS_A') && !isPart('PRECEDES'))
ok('셋 다 선 모양이 없음', LISTED.every((type) => !STYLE[type]))
ok('셋 다 접두어가 있음', LISTED.every((type) => LIST_PREFIX[type]))
is('EXAMPLE_OF 접두어', LIST_PREFIX.EXAMPLE_OF, 'Ex.')
ok('그리는 유형은 적지 않음', ['PRECEDES', 'CAUSES', 'FACILITATES', 'DEFINED_AS', 'CONTRASTS_WITH'].every((t) => !isListed(t)))
is('PRECEDES 라벨이 인과가 아님을 말함', STYLE.PRECEDES.label, '다음')
is('CONTRASTS_WITH 만 무향', isDirected('CONTRASTS_WITH'), false)
ok('나머지는 유향', ['PRECEDES', 'CAUSES', 'FACILITATES', 'DEFINED_AS'].every(isDirected))

console.log('\n[D] 줄바꿈')
is('짧은 라벨은 한 줄', wrap('사회화').length, 1)
const longest = '학교생활에서 규칙·차례·행정 절차를 배우는 경험'
ok('26자 라벨은 여러 줄', wrap(longest).length > 1)
ok('모든 줄이 상한 이하', wrap(longest).every((line) => line.length <= MAX_LINE || !line.includes(' ')))
is('어절을 쪼개지 않음', wrap(longest).join(' '), longest)
is('빈 문자열', wrap('').join(''), '')
ok('공백 없는 긴 단어는 그대로', wrap('가'.repeat(20))[0].length === 20)

console.log('\n[E] 층 나누기')
const chain = [
  { from: 'a', to: 'b', type: 'PRECEDES' },
  { from: 'b', to: 'c', type: 'PRECEDES' },
]
const depth = layerOf(['a', 'b', 'c'], chain)
is('체인 깊이', [depth.get('a'), depth.get('b'), depth.get('c')].join(), '0,1,2')
const fan = [
  { from: 'x', to: 'z', type: 'FACILITATES' },
  { from: 'y', to: 'z', type: 'FACILITATES' },
]
const d2 = layerOf(['x', 'y', 'z'], fan)
is('모이는 꼴은 뿌리가 같은 층', `${d2.get('x')}${d2.get('y')}${d2.get('z')}`, '001')
const sym = layerOf(['p', 'q'], [{ from: 'p', to: 'q', type: 'CONTRASTS_WITH' }])
is('비교 관계는 같은 층', `${sym.get('p')}${sym.get('q')}`, '00')
const cyc = layerOf(['m', 'n'], [{ from: 'm', to: 'n', type: 'PRECEDES' }, { from: 'n', to: 'm', type: 'PRECEDES' }])
ok('순환이 있어도 멈춤', Number.isFinite(cyc.get('m')) && Number.isFinite(cyc.get('n')))

console.log('\n[F] 방향 자동 판정')
is('순수 체인은 가로', pickOrientation(['a', 'b', 'c'], chain), 'LR')
is('갈라지면 세로', pickOrientation(['x', 'y', 'z'], fan), 'TB')

console.log('\n[G] 네 도식이 모두 그려진다')
is('도식 4개', DIAGRAMS.length, 4)
for (const item of DIAGRAMS) {
  const graph = graphFor(item.diagramId)
  ok(`${item.diagramId} 그래프 생성`, graph && graph.nodes.length > 0 && graph.edges.length > 0)
  const laid = layoutGraph(graph.nodes, graph.edges)
  ok(`${item.diagramId} 모든 노드에 좌표`, laid.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)))
  ok(`${item.diagramId} 겹치는 노드 없음`, noOverlap(laid.nodes))
  ok(`${item.diagramId} 캔버스 안에 들어감`, laid.nodes.every((n) => n.x >= 0 && n.y >= 0 && n.x + n.w <= laid.width + 1 && n.y + n.h <= laid.height + 1))
  ok(`${item.diagramId} 모든 간선이 양 끝을 찾음`, laid.edges.length === graph.edges.length)
  ok(`${item.diagramId} 모든 간선이 직각`, laid.edges.every(rightAngled))
  ok(`${item.diagramId} 간선 라벨 좌표 있음`, laid.edges.every((e) => Number.isFinite(e.label.x) && Number.isFinite(e.label.y)))
  ok(`${item.diagramId} 근거 쪽수 있음`, graph.pages.length > 0)
  ok(`${item.diagramId} 그려진 엣지에 분류 관계 없음`, graph.edges.every((e) => !isListed(e.type)))
  ok(`${item.diagramId} 노드는 그려진 엣지에서만 나옴`, graph.nodes.every((n) => graph.edges.some((e) => e.from === n.id || e.to === n.id)))
}

console.log('\n[G2] 분류 관계가 목록으로 빠진다')
const hidden = graphFor('hidden')
is('잠재적 교육과정: 예시 3개가 목록으로', hidden.listed.length, 3)
ok('모두 EXAMPLE_OF', hidden.listed.every((x) => x.type === 'EXAMPLE_OF'))
ok('목록 문장이 사례 → 개념 방향', hidden.listed.every((x) => x.text.includes('잠재적 교육과정의 사례')))
ok('예시 노드는 그림에 없음', !hidden.nodes.some((n) => n.id.includes('승자·패자')))
const agents = graphFor('agents')
is('사회화 기관: IS_A 한 개가 목록으로', agents.listed.filter((x) => x.type === 'IS_A').length, 1)
ok('가족 — 사회화 기관의 한 종류', agents.listed.some((x) => x.text === '가족 — 사회화 기관의 한 종류'))
const avr = graphFor('anticipatory_vs_resocialization')
is('예기/재사회화: PART_OF 는 목록에 없음', avr.listed.filter((x) => x.type === 'PART_OF').length, 0)

console.log('\n[G3] 부분은 상자 안의 칸이 된다')
const whole = avr.nodes.find((n) => n.id === '재사회화')
is('재사회화가 두 부분을 가짐', whole.parts.length, 2)
ok('버리는 과정이 그 안에', whole.parts.some((p) => p.label.includes('버리는 과정')))
ok('부분이 따로 노드가 되지 않음', !avr.nodes.some((n) => n.id.includes('버리는 과정')))
const laidAvr = layoutGraph(avr.nodes, avr.edges)
const box = laidAvr.nodes.find((n) => n.id === '재사회화')
ok('표 높이가 머리말보다 큼', box.h > box.headH)
ok('부분 없는 상자는 머리말이 전부', laidAvr.nodes.filter((n) => n.parts.length === 0).every((n) => n.h === n.headH))

console.log('\n[G4] 빠졌던 단계 연결이 메워졌다')
const chainNow = graphFor('mead').edges.filter((e) => e.type === 'PRECEDES').map((e) => `${e.from}→${e.to}`)
is('PRECEDES 세 개', chainNow.length, 3)
ok('놀이→게임 생김', chainNow.includes('놀이 단계→게임 단계'))
ok('준비→놀이→게임→일반화 순서', chainNow.join() === '준비 단계→놀이 단계,놀이 단계→게임 단계,게임 단계→일반화된 타자 이해')
is('mead 는 목록이 빔', graphFor('mead').listed.length, 0)

// Every segment runs straight across or straight down: no diagonals.
function rightAngled(edge) {
  for (let at = 0; at < edge.points.length - 1; at += 1) {
    const a = edge.points[at]
    const b = edge.points[at + 1]
    if (a.x !== b.x && a.y !== b.y) return false
  }
  return edge.points.length >= 2
}

function noOverlap(nodes) {
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i]
      const b = nodes[j]
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) return false
    }
  }
  return true
}

console.log('\n[H] 사전에 없는 연결은 그리지 않는다')
const mead = graphFor('mead')
const links = mead.edges.filter((e) => e.type === 'PRECEDES').map((e) => `${e.from}→${e.to}`)
is('PRECEDES 세 개', links.length, 3)
ok('준비→놀이 있음', links.includes('준비 단계→놀이 단계'))
ok('게임→일반화된 타자 이해 있음', links.includes('게임 단계→일반화된 타자 이해'))
ok('놀이→게임 있음 (REL-30)', links.includes('놀이 단계→게임 단계'))

console.log('\n[I] 정의 대상은 개념이 아니라 설명으로 그린다')
const edges = mead.edges
ok('타인의 행동 은 설명 상자', isNoteNode('타인의 행동', edges))
ok('놀이 단계 는 개념 상자', !isNoteNode('놀이 단계', edges))

console.log('\n[J] 같은 개념은 같은 그림을 준다')
const a1 = JSON.stringify(layoutGraph(graphFor('agents').nodes, graphFor('agents').edges))
const a2 = JSON.stringify(layoutGraph(graphFor('agents').nodes, graphFor('agents').edges))
is('두 번 그려도 동일', a1 === a2, true)
is('없는 도식은 null', graphFor('nope'), null)
is('사회화는 agents 도식', diagramsForConcept('socialization').map((d) => d.diagramId).join(), 'agents')
is('도식 없는 개념', diagramsForConcept('nature-nurture').length, 0)

console.log('\n[K] 대체 설명')
const alt = describeGraph(graphFor('hidden'))
ok('문장으로 나옴', alt.length > 30 && alt.includes('잠재적 교육과정'))
const h = graphFor('hidden')
is('그린 것과 적은 것 모두 문장으로', alt.split('.').filter(Boolean).length, h.edges.length + h.listed.length)
ok('부분도 대체 설명에', describeGraph(avr).includes('이루어져요'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
