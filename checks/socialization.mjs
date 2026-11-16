import { readFileSync } from 'node:fs'
import KNOWLEDGE from '/home/claude/learningscience/src/data/socialization_knowledge.js'
import VISUALS from '/home/claude/learningscience/src/data/socialization_visuals.js'
import {
  LIMITS,
  SUPPORT_TYPES,
  conceptEvidence,
  conceptIds,
  conceptsInChunks,
  findConcept,
  findVisual,
  limitChunks,
  toMermaid,
  validateDiagram,
} from '/home/claude/learningscience/api/_lib/socialization.js'

let pass = 0
let fail = 0
const is = (label, got, want) => {
  const ok = Object.is(got, want)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
const ok = (label, cond) => is(label, Boolean(cond), true)

console.log('\n[A] 지식베이스가 요약 문서의 개념을 담는다')
// 14 from the summary document, 11 more from lectures 2 and 3.
is('개념 수', KNOWLEDGE.concepts.length, 25)
ok('모든 개념에 한·영 표제어', KNOWLEDGE.concepts.every((c) => c.termKo && c.termEn))
ok('모든 개념에 정의', KNOWLEDGE.concepts.every((c) => c.definitionKo?.length > 10))
ok('모든 개념에 원전 절·쪽', KNOWLEDGE.concepts.every((c) => c.source?.section && c.source?.pages))
ok('conceptId 중복 없음', new Set(conceptIds()).size === KNOWLEDGE.concepts.length)
ok('related 가 전부 실재하는 개념', KNOWLEDGE.concepts.every((c) => (c.related || []).every(findConcept)))
ok('visualId 가 전부 실재하는 도식', KNOWLEDGE.concepts.every((c) => !c.visualId || findVisual(c.visualId)))
is('5장만 다룸', KNOWLEDGE.scope.chapter, 5)

console.log('\n[B] 요약 문서가 경고한 오개념이 기록돼 있다')
ok('거울 자아 ↔ 일반화된 타자 혼동', findConcept('looking-glass-self').misconceptions.some((m) => m.includes('일반화된 타자')))
ok('잠재적 교육과정 ≠ 몰래 계획한 수업', findConcept('hidden-curriculum').misconceptions.some((m) => m.includes('몰래')))
ok('사회화 ≠ 사교', findConcept('socialization').misconceptions.some((m) => m.includes('socializing')))
ok('본성/양육은 경쟁 요인이 아님', findConcept('nature-nurture').misconceptions.some((m) => m.includes('경쟁')))
ok('미드 단계는 인과가 아님', findConcept('mead-stages').misconceptions.some((m) => m.includes('인과')))

console.log('\n[C] 도식 4개가 명세대로다')
is('도식 수', VISUALS.visuals.length, 4)
for (const id of ['agents-of-socialization-v1', 'mead-self-development-v1', 'socialization-comparison-v1', 'hidden-curriculum-v1']) {
  ok(`${id} 존재`, findVisual(id))
}
ok('노드 상한 지킴', VISUALS.visuals.every((v) => v.nodes.length <= VISUALS.limits.maxNodes))
ok('엣지 상한 지킴', VISUALS.visuals.every((v) => v.edges.length <= VISUALS.limits.maxEdges))
ok('모든 도식에 대체 텍스트', VISUALS.visuals.every((v) => v.altText?.length > 20))
ok('모든 도식에 해석 주의', VISUALS.visuals.every((v) => v.caveat?.length > 10))
ok('엣지 관계가 전부 허용 목록', VISUALS.visuals.every((v) => v.edges.every((e) => VISUALS.relations[e.relation])))
ok('엣지 끝점이 전부 노드 목록', VISUALS.visuals.every((v) => v.edges.every((e) => v.nodes.includes(e.from) && v.nodes.includes(e.to))))
ok('도식의 conceptIds 가 전부 실재', VISUALS.visuals.every((v) => v.conceptIds.every(findConcept)))
ok('mermaid 에 HTML 라벨 없음', VISUALS.visuals.every((v) => !/<[a-z]/i.test(v.mermaidCode)))
ok('mermaid 에 click 이벤트 없음', VISUALS.visuals.every((v) => !v.mermaidCode.includes('click ')))

console.log('\n[D] 비교 도식은 선후 관계로 그리지 않는다')
const cmp = findVisual('socialization-comparison-v1')
ok('예기↔재사회화는 contrasts_with', cmp.edges.some((e) => e.relation === 'contrasts_with'))
ok('둘 사이에 화살표 관계 없음', !cmp.edges.some((e) => e.relation === 'precedes_stage' && ['예기 사회화', '재사회화'].includes(e.from) && ['예기 사회화', '재사회화'].includes(e.to)))
ok('금지 엣지로 등록됨', VISUALS.forbiddenEdges.length >= 2)

console.log('\n[E] 단계 도식의 순서')
const mead = findVisual('mead-self-development-v1')
is('단계 순서', mead.nodes.join(' → '), '준비 단계 → 놀이 단계 → 게임 단계 → 일반화된 타자 이해')
ok('모두 precedes_stage', mead.edges.every((e) => e.relation === 'precedes_stage'))

console.log('\n[F] 도식 데이터 검증기')
is('올바른 도식은 통과', validateDiagram({ visualId: 'hidden-curriculum-v1', nodes: mead.nodes.slice(0, 0).concat(findVisual('hidden-curriculum-v1').nodes), edges: findVisual('hidden-curriculum-v1').edges }).ok, true)
is('없는 도식은 거부', validateDiagram({ visualId: 'nope-v1', nodes: [], edges: [] }).ok, false)
is('허용되지 않은 노드 거부', validateDiagram({ visualId: 'hidden-curriculum-v1', nodes: ['우주선'], edges: [] }).ok, false)
is('허용되지 않은 관계 거부', validateDiagram({ visualId: 'mead-self-development-v1', nodes: mead.nodes, edges: [{ from: '준비 단계', to: '놀이 단계', relation: 'causes' }] }).ok, false)
const banned = validateDiagram({
  visualId: 'socialization-comparison-v1',
  nodes: cmp.nodes,
  edges: [{ from: '예기 사회화', to: '재사회화', relation: 'precedes_stage', fromConceptId: 'anticipatory-socialization', toConceptId: 'resocialization' }],
})
is('예기→재사회화 선후 관계 거부', banned.ok, false)
ok('거부 이유를 말함', banned.problems.some((p) => p.includes('선후')))
is('노드 11개 거부', validateDiagram({ visualId: 'hidden-curriculum-v1', nodes: Array.from({ length: 11 }, (_, i) => `n${i}`), edges: [] }).ok, false)

console.log('\n[G] Mermaid 는 서버가 조립한다')
const built = toMermaid({ visualId: 'hidden-curriculum-v1', nodes: findVisual('hidden-curriculum-v1').nodes, edges: findVisual('hidden-curriculum-v1').edges })
ok('flowchart 로 시작', built.startsWith('flowchart'))
ok('노드 라벨이 따옴표 안에', built.includes('["줄 서기"]'))
is('없는 도식이면 null', toMermaid({ visualId: 'nope', nodes: [], edges: [] }), null)

console.log('\n[H] 길이 제한')
const many = Array.from({ length: 6 }, (_, i) => ({ chunkId: `c-${i}`, text: 'x'.repeat(2000) }))
const cut = limitChunks(many)
is('청크 3개까지', cut.chunks.length, LIMITS.maxChunks)
is('청크당 1500자까지', cut.chunks[0].text.length, LIMITS.maxChunkChars)
is('버린 개수를 보고', cut.droppedChunks, 3)
is('잘랐다고 보고', cut.truncated, true)
is('관련 개념 포함 최대 3개', conceptEvidence('socialization').length, 3)
is('없는 개념이면 null', conceptEvidence('nope'), null)

console.log('\n[I] 전사문에 있는 개념만 활성화')
const chunks = [
  { chunkId: 'c-1', text: '오늘은 잠재적 교육과정에 대해 이야기합니다. 학교에서 줄을 서는 것도 배움입니다.' },
  { chunkId: 'c-2', text: '또래집단은 비슷한 나이의 친구들입니다.' },
]
const found = conceptsInChunks(chunks).hits.map((h) => h.conceptId)
ok('잠재적 교육과정 찾음', found.includes('hidden-curriculum'))
ok('또래집단 찾음', found.includes('peer-group'))
ok('나오지 않은 총체적 시설은 빠짐', !found.includes('total-institution'))
is('잠재적 교육과정의 출처 청크', conceptsInChunks(chunks).hits.find((h) => h.conceptId === 'hidden-curriculum').chunkIds.join(), 'c-1')
is('빈 전사문', conceptsInChunks([]).hits.length, 0)

console.log('\n[J] 엔드포인트 계약')
const explain = readFileSync('/home/claude/learningscience/api/tutor/explain.js', 'utf8')
const diagram = readFileSync('/home/claude/learningscience/api/tutor/diagram.js', 'utf8')
is('supportType 4종', SUPPORT_TYPES.join(), 'simple,example,analogy,comparison')
ok('explain 이 정의를 요청에서 받지 않음', !explain.includes('body.definition'))
ok('explain 이 서버에서 개념을 조회', explain.includes('findConcept(conceptId)'))
ok('explain 이 출처 id 를 걸러냄', explain.includes('sentChunkIds.has'))
ok('explain 이 사례·비유를 생성물로 강제 표시', explain.includes("supportType === 'example' || supportType === 'analogy'"))
ok('explain 이 고정 정의를 항상 동봉', explain.includes('definitionKo: concept.definitionKo'))
ok('diagram template 은 모델을 부르지 않음', !diagram.includes('generateJson'))
ok('diagram generated 는 501', diagram.includes('501'))
ok('diagram 이 입력에 없는 chunkId 를 만들지 않음', diagram.includes('body.lectureChunks'))
// The gate that broke it: materialId is a generated upload id, so pinning it
// to the knowledge base's demo id rejected every real lecture with a 400.
ok('explain 이 materialId 를 고정값과 대조하지 않음', !explain.includes("[MATERIAL_ID]"))
ok('diagram 이 materialId 를 고정값과 대조하지 않음', !diagram.includes("[MATERIAL_ID]"))
ok('explain 이 materialId 를 문자열로만 받음', explain.includes("requireString(body.materialId"))

console.log('\n[L] 화면: 범위 판정은 전사문으로 한다')
const panel = readFileSync('/home/claude/learningscience/src/components/review/ConceptPanel.jsx', 'utf8')
ok('material.id 비교가 사라짐', !/material\?\.id ===/.test(panel))
ok('전사문에서 찾은 개념으로 판정', panel.includes('found.length === 0'))
const grid = readFileSync('/home/claude/learningscience/src/components/review/ReviewModeGrid.jsx', 'utf8')
const ids = [...grid.matchAll(/\{ id: '([a-z]+)'/g)].map((m) => m[1])
is('카드 4개', ids.length, 4)
is('카드 순서', ids.join(','), 'source,concept,quiz,support')
const page = readFileSync('/home/claude/learningscience/src/components/review/ReviewStudyPage.jsx', 'utf8')
ok("select 모드가 사라짐", !page.includes("mode === 'select'"))
// 인출 연습하기 now opens on free recall; chunk picking returns with the
// generated questions the quiz machinery is kept for.
ok('인출 연습하기가 통 인출을 보여줌', page.includes("mode === 'quiz' ? (") && page.includes('<RecallPanel'))
ok('quiz 카드는 잠기지 않음', !page.includes("disabledModes.push('quiz')"))
const service = readFileSync('/home/claude/learningscience/src/services/tutorService.js', 'utf8')
ok('클라이언트가 material.materialId 를 보냄', !/materialId: material\.id\b/.test(service))

console.log('\n[M] sendJson 은 (res, status, payload)')
// The bug: sendJson(response, {...}) put the body in the status slot, so
// res.status({}) threw a TypeError, which was not an ApiError, which the
// error handler flattened into '알 수 없는 오류가 생겼어요'.
for (const [label, text] of [['explain', explain], ['diagram', diagram]]) {
  const calls = [...text.matchAll(/sendJson\(\s*\w+\s*,\s*([^,\s]+)/g)].map((m) => m[1])
  ok(`${label} 의 sendJson 두 번째 인자가 숫자`, calls.length > 0 && calls.every((a) => /^\d+$/.test(a)))
}
const lib = readFileSync('/home/claude/learningscience/api/_lib/gemini.js', 'utf8')
ok('예기치 못한 오류도 원인을 말함', !lib.includes("'알 수 없는 오류가 생겼어요.'"))
ok('오류 이름과 메시지를 담음', lib.includes('error?.name') && lib.includes('error?.message'))
ok('스택은 디버그에서만', lib.includes('error?.stack'))

console.log('\n[N] 오류는 한 번만 보인다')
ok('페이지 오류는 concept 모드에서 숨김', page.includes("error && mode !== 'concept'"))
ok('개념 패널이 자기 오류를 알림', panel.includes('role="alert"'))

console.log('\n[K] 기존 API 계약은 그대로')
const api = JSON.parse(readFileSync('/home/claude/learningscience/vercel.json', 'utf8'))
for (const path of ['api/tutor/quiz.js', 'api/tutor/answer.js', 'api/tutor/support.js', 'api/planner/chunk.js']) {
  ok(`${path} 유지`, api.functions[path])
}
ok('explain 등록', api.functions['api/tutor/explain.js'])
ok('diagram 등록', api.functions['api/tutor/diagram.js'])
const client = readFileSync('/home/claude/learningscience/src/services/tutorApi.js', 'utf8')
ok('클라이언트에 기존 4개 유지', ['quiz:', 'answer:', 'support:', 'chunk:'].every((n) => client.includes(n)))
ok('클라이언트에 explain·diagram 추가', client.includes('explain:') && client.includes('diagram:'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
