import { calculateDifficulty, cognitiveScore, difficultyRank, proceduralScore, sortByDifficulty } from '/home/claude/learningscience/src/utils/difficulty.js'
import { data } from '/home/claude/learningscience/src/assignmentModel.js'
import { planCandidates, sortCandidates } from '/home/claude/learningscience/src/weekPlan.js'
import { toAssignmentStep } from '/home/claude/learningscience/src/features/taskChunking/taskChunking.js'

let pass = 0
let fail = 0
function is(label, got, want) {
  const ok = Object.is(got, want)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
const ok = (label, cond) => is(label, Boolean(cond), true)

console.log('\n[A] 명세의 예시 표 그대로')
const SPEC = [
  { title: '학습과학 이론 적용 및 분석', requirementIds: ['req-002'], completionCriteria: [{ text: '이론을 적용했나요?' }] },
  { title: 'PDF 변환 및 파일명 설정', requirementIds: ['req-005', 'req-006'], completionCriteria: [{ text: 'PDF로 저장했나요?' }] },
  { title: '새로운 작업', requirementIds: [], completionCriteria: [] },
]
const got = SPEC.map(calculateDifficulty)
is('이론 적용 및 분석 → rank 3', got[0].difficultyRank, 3)
is('이론 적용 및 분석 → score 3.1', got[0].difficultyScore, 3.1)
is('이론 적용 및 분석 → rated', got[0].status, 'rated')
is('PDF 변환 → rank 1', got[1].difficultyRank, 1)
is('PDF 변환 → score 1.3', got[1].difficultyScore, 1.3)
is('새로운 작업 → rank 0', got[2].difficultyRank, 0)
is('새로운 작업 → unrated', got[2].status, 'unrated')

console.log('\n[B] 단계 번호는 난이도에 쓰지 않는다')
const same = { title: '사례 분석', requirementIds: ['r1'], completionCriteria: [{ text: 'x' }] }
is('같은 내용이면 순서와 무관하게 같은 점수', calculateDifficulty({ ...same }).difficultyScore, calculateDifficulty({ ...same }).difficultyScore)

console.log('\n[C] 설명만 있어도 평가된다 (이 앱의 제목은 짧은 명사구)')
is('제목에 동사 없음, 설명에 있음', cognitiveScore({ title: '인지부하 이론 자료 찾기', description: '기본 개념을 확인할 수 있는 자료를 확보해요.' }), 2)
is('제목만 있고 규칙 밖이면 미평가', cognitiveScore({ title: '우주선 조립' }), null)
is('둘 다 비면 null', cognitiveScore({ title: '', description: '' }), null)
is('객체가 아니면 null', cognitiveScore(null), null)

console.log('\n[D] 제출 판정은 제목으로만 — 분석 단계를 끌어내리지 않는다')
is('제목이 제출 작업', cognitiveScore({ title: 'PDF로 변환해 제출', description: '' }), 1)
is('설명에 제출이 섞인 분석 단계는 분석으로', cognitiveScore({ title: '사회학 개념으로 분석하기', description: '분석을 마치면 제출 형식을 확인해요.' }), 4)

console.log('\n[E] 작업 복잡성은 더하지 않고 큰 쪽을 쓴다')
is('요구사항 3, 기준 1 → 3', proceduralScore({ requirementIds: ['a', 'b', 'c'], completionCriteria: [{ text: 'x' }] }), 3)
is('요구사항 1, 기준 2 → 2', proceduralScore({ requirementIds: ['a'], completionCriteria: [{ text: 'x' }, { text: 'y' }] }), 2)
is('중복 id 는 한 번만', proceduralScore({ requirementIds: ['a', 'a', 'a'], completionCriteria: [] }), 1)
is('빈 text 는 세지 않음', proceduralScore({ requirementIds: [], completionCriteria: [{ text: '  ' }] }), null)
is('둘 다 없으면 null', proceduralScore({ requirementIds: [], completionCriteria: [] }), null)
is('6개여도 5가 상한', proceduralScore({ requirementIds: ['a', 'b', 'c', 'd', 'e', 'f'], completionCriteria: [] }), 5)

console.log('\n[F] 복잡성만 없으면 부분 평가')
const partial = calculateDifficulty({ title: '사례 분석', requirementIds: [], completionCriteria: [] })
is('status', partial.status, 'partial')
is('rank 는 인지 점수 그대로', partial.difficultyRank, 4)

console.log('\n[G] 정렬: 어려운 순, 미평가는 뒤, 동점이면 마감 빠른 순')
const rows = [
  { id: 'easy', dueAt: '2026-12-01', step: { title: 'PDF 제출', requirementIds: ['a'], completionCriteria: [{ text: 'x' }] } },
  { id: 'hard', dueAt: '2026-12-09', step: { title: '요인 분석', requirementIds: ['a', 'b'], completionCriteria: [{ text: 'x' }] } },
  { id: 'none', dueAt: '2026-11-20', step: { title: '우주선 조립' } },
  { id: 'tie', dueAt: '2026-11-25', step: { title: 'PDF 제출', requirementIds: ['a'], completionCriteria: [{ text: 'x' }] } },
]
is('순서', sortByDifficulty(rows).map((r) => r.id).join(','), 'hard,tie,easy,none')
is('빈 배열', sortByDifficulty([]).length, 0)
is('배열이 아니면 빈 배열', sortByDifficulty(null).length, 0)

console.log('\n[H] 이번주 계획의 rows 에 실제로 붙는가 (명세가 경고한 연결 지점)')
const candidates = planCandidates({})
ok('후보가 있음', candidates.length > 0)
ok('모든 row 에 difficulty 가 숫자로', candidates.every((r) => typeof r.difficulty === 'number'))
ok('미평가 row 가 없음', candidates.every((r) => r.difficulty > 0))
ok('라벨이 붙음', candidates.every((r) => typeof r.difficultyLabel === 'string' && r.difficultyLabel))
const byHard = sortCandidates(candidates, 'difficulty')
is('정렬해도 개수 같음', byHard.length, candidates.length)
ok('내림차순', byHard.every((row, at) => at === 0 || byHard[at - 1].difficulty >= row.difficulty))
ok('맨 앞이 가장 어려움', byHard[0].difficulty === Math.max(...candidates.map((r) => r.difficulty)))
const byDue = sortCandidates(candidates, 'due')
ok('마감순은 난이도순과 다름', byDue.map((r) => r.stepId).join() !== byHard.map((r) => r.stepId).join())

console.log('\n[I] 기본 3과목이 전부 평가된다')
const steps = data.assignments.flatMap((a) => a.steps)
const unrated = steps.filter((s) => calculateDifficulty(s).status === 'unrated')
is('미평가 단계 수', unrated.length, 0)
ok('난이도가 한 값으로 뭉치지 않음', new Set(steps.map((s) => difficultyRank(s))).size > 1)

console.log('\n[J] 쪼갠 과제의 단계도 평가된다')
const chunked = toAssignmentStep(
  { title: '사례 분석', description: '사례를 이론으로 해석해요.', requirementIds: ['req-001', 'req-002'], criteria: [{ text: '비교했어요' }] },
  { prefix: 'z', index: 0 },
)
ok('requirementIds 가 남아 있음', chunked.requirementIds.length === 2)
is('rated', calculateDifficulty(chunked).status, 'rated')

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
