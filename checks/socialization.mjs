import { readFileSync, readdirSync } from 'node:fs'
import KNOWLEDGE from '/home/claude/learningscience/src/data/socialization_knowledge.js'
import {
  LIMITS,
  SUPPORT_TYPES,
  conceptEvidence,
  conceptIds,
  conceptsInChunks,
  findConcept,
  limitChunks,
} from '/home/claude/learningscience/api/_lib/socialization.js'
import { DIAGRAMS, graphFor } from '/home/claude/learningscience/src/features/conceptGraph/fromLexicon.js'

let pass = 0
let fail = 0
const is = (label, got, want) => {
  const ok = Object.is(got, want)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
const ok = (label, cond) => is(label, Boolean(cond), true)

console.log('\n[A] 지식베이스가 요약 문서의 개념을 담는다')
// Scoped to the one transcript now in docs/lectures.
is('개념 수', KNOWLEDGE.concepts.length, 21)
ok('모든 개념에 한·영 표제어', KNOWLEDGE.concepts.every((c) => c.termKo && c.termEn))
ok('모든 개념에 정의', KNOWLEDGE.concepts.every((c) => c.definitionKo?.length > 10))
// Page numbers are gone: the BCcampus bundle says the uploaded text has no
// page boundaries and that it did not guess labels, so citations are by
// section and line.
ok('모든 개념에 원전 절', KNOWLEDGE.concepts.every((c) => c.source?.section))
ok('교재에 있는 개념에는 행 번호', KNOWLEDGE.concepts.filter((c) => c.source.inEdition !== false).every((c) => c.source.lines?.length))
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

console.log('\n[C] 관계도 4개는 사전에서 그린다')
// The Mermaid path is gone: the premade visuals, /api/tutor/diagram and the
// renderer that imported mermaid. What the learner sees is SVG laid out here
// from the relation lexicon, so these are the diagrams to check.
is('관계도 4개', DIAGRAMS.length, 4)
const graphs = DIAGRAMS.map((item) => graphFor(item.diagramId))
ok('네 개 다 그려짐', graphs.every(Boolean))
ok('모든 관계도에 제목', graphs.every((g) => g.title?.length > 1))
ok('모든 관계도에 근거 줄번호', graphs.every((g) => g.lines.length > 0))
ok('관계도의 conceptIds 가 전부 실재', DIAGRAMS.every((item) => item.conceptIds.every(findConcept)))
ok('노드는 전부 어떤 관계가 이름 붙인 것', graphs.every((g) =>
  g.nodes.every((n) => g.edges.some((e) => e.from === n.id || e.to === n.id) || n.parts.length > 0)))
ok('mermaid 를 쓰는 코드 없음', !readFileSync('/home/claude/learningscience/src/components/review/ConceptPanel.jsx', 'utf8').includes('mermaid'))

console.log('\n[C2] 기관 관계도가 이 판이 다루는 범위를 넘지 않는다')
// §5.3 gives a section each to family, peer groups, school, workplace and
// mass media. Religion appears once as a societal factor alongside race and
// class, government once as a Swedish parental-leave policy. Neither is an
// agent in this edition, which is why the lexicon marks REL-09 and REL-10
// unsupported — and why nothing else may still claim otherwise.
const agents = JSON.stringify(graphFor('agents'))
ok('종교를 독립 기관으로 세우지 않음', !agents.includes('종교'))
ok('정부를 독립 기관으로 세우지 않음', !agents.includes('정부'))
ok('기관 개념 설명도 마찬가지', !JSON.stringify(findConcept('agents-of-socialization')).match(/종교|정부/))
ok('대중매체는 남아 있음', JSON.stringify(findConcept('agents-of-socialization')).includes('대중매체'))

console.log('\n[E] 단계 관계도의 순서')
is('단계 순서',
  ['준비 단계', '놀이 단계', '게임 단계', '일반화된 타자 이해']
    .filter((label) => graphFor('mead').nodes.some((n) => n.id === label)).join(' → '),
  '준비 단계 → 놀이 단계 → 게임 단계 → 일반화된 타자 이해')
ok('비교 관계도는 선후로 그리지 않음',
  !graphFor('anticipatory_vs_resocialization').edges.some((e) => e.type === 'PRECEDES'))

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
is('supportType 4종', SUPPORT_TYPES.join(), 'simple,example,analogy,comparison')
ok('explain 이 정의를 요청에서 받지 않음', !explain.includes('body.definition'))
ok('explain 이 서버에서 개념을 조회', explain.includes('findConcept(conceptId)'))
ok('explain 이 출처 id 를 걸러냄', explain.includes('sentChunkIds.has'))
ok('explain 이 사례·비유를 생성물로 강제 표시', explain.includes("supportType === 'example' || supportType === 'analogy'"))
ok('explain 이 고정 정의를 항상 동봉', explain.includes('definitionKo: concept.definitionKo'))
// The gate that broke it: materialId is a generated upload id, so pinning it
// to the knowledge base's demo id rejected every real lecture with a 400.
ok('explain 이 materialId 를 고정값과 대조하지 않음', !explain.includes("[MATERIAL_ID]"))
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
// diagram.js was one of the two handlers checked here; with it gone the
// check covers every handler instead, which is where it should have been.
// Underscore files are helpers, not routes, and send nothing.
for (const name of readdirSync('/home/claude/learningscience/api/tutor').filter((n) => !n.startsWith('_'))) {
  const text = readFileSync(`/home/claude/learningscience/api/tutor/${name}`, 'utf8')
  const calls = [...text.matchAll(/sendJson\(\s*\w+\s*,\s*([^,\s]+)/g)].map((m) => m[1])
  ok(`${name} 의 sendJson 두 번째 인자가 숫자`, calls.length > 0 && calls.every((a) => /^\d+$/.test(a)))
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
ok('diagram 은 등록 해제', !api.functions['api/tutor/diagram.js'])
const client = readFileSync('/home/claude/learningscience/src/services/tutorApi.js', 'utf8')
ok('클라이언트에 기존 4개 유지', ['quiz:', 'answer:', 'support:', 'chunk:'].every((n) => client.includes(n)))
ok('클라이언트에 explain 있음', client.includes('explain:'))
ok('클라이언트에 diagram 없음', !client.includes('diagram:'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
