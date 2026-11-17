// Input validation, output verification, and — the part the spec calls 중요 —
// whether a newly registered assignment's stepIds are actually recognised by
// findStep, buildPlan and validatePlan.
import {
  CHUNK_LEVELS, DEFAULT_LEVEL, parseInstruction, verifyChunkResult, droppedRequirements, normalizeDueAt,
  toAssignmentStep, userStep, verifyFinalSteps, slugify,
} from '/home/claude/learningscience/src/features/taskChunking/taskChunking.js'
import { data, ensureSubject, assignmentsForSubject, freeIdPrefix, registerAssignment, hasStepId } from '/home/claude/learningscience/src/assignmentModel.js'
import { findStep, buildPlan, createProposal, planCandidates } from '/home/claude/learningscience/src/weekPlan.js'
import { validatePlan } from '/home/claude/learningscience/src/planValidation.js'
import { EXAMPLE_INSTRUCTION, EXAMPLE_LEVEL, EXAMPLE_RESULT, EXAMPLE_SUBJECT } from '/home/claude/learningscience/src/features/taskChunking/exampleResult.js'
import { readFileSync } from 'node:fs'

let pass = 0, fail = 0
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  ok ? (pass += 1) : (fail += 1)
}

console.log('\n[A] 지시문 입력 검증 — JSON 이 아니라 과제 제시문')
const INSTR = 'VAE와 GAN의 기본 원리를 조사하고 두 모델의 학습 방식을 비교하는 보고서를 작성하세요.'
check('정상 입력 통과', parseInstruction(INSTR, { subjectName: '생성형 AI' }).ok)
check('빈 지시문 거부', !parseInstruction('   ', { subjectName: 'x' }).ok)
check('너무 짧으면 거부', !parseInstruction('보고서', { subjectName: 'x' }).ok)
check('6000자 초과 거부', !parseInstruction('가'.repeat(6001), { subjectName: 'x' }).ok)
check('과목 없으면 거부', !parseInstruction(INSTR, { subjectName: '  ' }).ok)
check('과목 검사를 요구하지 않으면 통과', parseInstruction(INSTR).ok)
check('어떤 항목이 잘못됐는지 알려 줌',
  parseInstruction('', { subjectName: '' }).errors.map((e) => e.field).sort().join(',') === 'instruction,subject')

console.log('\n[B] Gemini 응답 검증')
const REQS = [
  { requirementId: 'req-001', keyword: 'VAE 구조', text: 'VAE의 구조와 원리를 설명해요.', kind: 'content' },
  { requirementId: 'req-002', keyword: '분량', text: 'A4 3장 이내로 작성해요.', kind: 'submission' },
]
const okResult = {
  assignment: { assignmentTitle: 'VAE와 GAN 비교 보고서', dueAt: null, requirements: REQS },
  steps: [
    { stepId: 'step-001', title: 'VAE 구조 조사', description: 'Encoder 와 Decoder 를 정리해요.', requirementIds: ['req-001'],
      completionCriteria: [{ text: '구조 설명 정리' }] },
    { stepId: 'step-002', title: 'GAN 구조 조사', description: 'Generator 와 Discriminator 를 정리해요.', requirementIds: ['req-002'], completionCriteria: [] },
    { stepId: 'step-003', title: '비교 정리', description: '두 모델을 견주어 적어요.', requirementIds: ['req-001', 'req-002'], completionCriteria: [] },
  ],
}
const ctx = { level: 'low', instruction: INSTR }
const okCheck = verifyChunkResult(okResult, ctx)
check('정상 응답 통과', okCheck.ok)
check('요구사항을 읽어 냄', okCheck.requirements.length === 2)
check('제목을 읽어 냄', okCheck.title === 'VAE와 GAN 비교 보고서')
check('dueAt 없으면 null', okCheck.dueAt === null)
check('한국어 마감일도 ISO 로', (() => {
  const r = verifyChunkResult({ ...okResult, assignment: { ...okResult.assignment, dueAt: '2026년 11월 29일 23시 59분' } }, ctx)
  return r.dueAt === '2026-11-29T23:59'
})())
check('시간이 없으면 시간을 만들지 않음', normalizeDueAt('2026년 11월 29일') === '2026-11-29')
check('읽을 수 없으면 null', normalizeDueAt('학기 말까지') === null)
check('요구사항 없으면 거부',
  !verifyChunkResult({ assignment: { assignmentTitle: 't', requirements: [] }, steps: okResult.steps }, ctx).ok)
check('제목 없는 단계 거부',
  !verifyChunkResult({ ...okResult, steps: [{ stepId: 's', title: '', description: 'x', requirementIds: [] }] }, ctx).ok)
check('설명 없는 단계 거부',
  !verifyChunkResult({ ...okResult, steps: [{ stepId: 's', title: 'x', description: '', requirementIds: [] }] }, ctx).ok)
check('stepId 중복 거부',
  verifyChunkResult({ ...okResult, steps: [okResult.steps[0], { ...okResult.steps[1], stepId: 'step-001' }] }, ctx)
    .errors.some((e) => e.includes('겹쳐요')))
check('없는 requirementId 는 경고하고 떼어 냄', (() => {
  const r = verifyChunkResult({ ...okResult, steps: [{ stepId: 'a', title: 'a', description: 'b', requirementIds: ['req-001', 'req-999'] }] }, ctx)
  return r.warnings.some((w) => w.includes('req-999')) && r.steps[0].requirementIds.length === 1
})())
check('개수 범위 벗어나면 경고',
  verifyChunkResult({ ...okResult, steps: okResult.steps.slice(0, 1) }, ctx).warnings.some((w) => w.includes('3~4')))
check('지시문에 없는 날짜는 경고',
  verifyChunkResult({ ...okResult, steps: [{ stepId: 'a', title: '12월 1일까지 내기', description: '제출해요.', requirementIds: ['req-001', 'req-002'] }] }, ctx)
    .warnings.some((w) => w.includes('날짜')))
check('연결 안 된 요구사항 경고',
  verifyChunkResult({ ...okResult, steps: [{ stepId: 'a', title: 'VAE 만', description: '정리해요.', requirementIds: ['req-001'] }] }, ctx)
    .warnings.some((w) => w.includes('요구사항')))

check('keyword 와 kind 를 보존함',
  okCheck.requirements[0].keyword === 'VAE 구조' && okCheck.requirements[1].kind === 'submission')
check('keyword 가 없으면 text 로 대체 (잘라내지 않음)', (() => {
  const r = verifyChunkResult({ ...okResult, assignment: { ...okResult.assignment,
    requirements: [{ requirementId: 'req-001', text: '아주 긴 요구사항 문장입니다만 잘리지는 않아야 해요.', kind: 'content' }] } }, ctx)
  return r.requirements[0].keyword === '아주 긴 요구사항 문장입니다만 잘리지는 않아야 해요.'
})())
// The screen used to supply one prompt for every box. It no longer does: the
// model returns the check, the line saying what to type and a noun-phrase
// example, and each is carried through even when the model omits it.
check('완료 조건의 세 필드를 가져옴',
  okCheck.steps[0].criteria[0].text === '구조 설명 정리' &&
  'inputLabel' in okCheck.steps[0].criteria[0] &&
  'placeholder' in okCheck.steps[0].criteria[0])

console.log('\n[B2] 제외한 단계가 요구사항을 데려가는지')
const asRows = okCheck.steps.map((s, i) => ({ key: `g${i}`, ...s }))
check('전부 고르면 빠지는 요구사항 없음', droppedRequirements(asRows, asRows, okCheck.requirements).length === 0)
check('VAE 단계들을 빼면 req-001 이 빠짐', (() => {
  const kept = asRows.filter((r) => !r.requirementIds.includes('req-001'))
  return droppedRequirements(asRows, kept, okCheck.requirements).map((r) => r.requirementId).join(',') === 'req-001'
})())

console.log('\n[C] 단계 변환과 최종 검증')
const prefix = freeIdPrefix('tc-test')
// 검증을 거친 단계를 쓴다 — 패널이 실제로 넘기는 것과 같은 값
const converted = okCheck.steps.map((s, i) => toAssignmentStep(s, { prefix, index: i }))
check('Assignment.steps 스키마 필드', Object.keys(converted[0]).sort().join(',') ===
  'completionCriteria,description,id,prerequisiteTip,requirementIds,source,title')
check('완료 조건이 비지 않음', converted.every((s) => s.completionCriteria.length > 0))
check('완료 조건 질문이 단계로 전달됨', converted[0].completionCriteria[0].text === '구조 설명 정리')
check('완료 조건이 없던 단계도 질문 하나를 받음',
  converted[1].completionCriteria[0].text.includes('GAN 구조 조사'))
// 이 응답에는 placeholder 가 없으므로 빈 값이 맞다. 모델이 보내면 담긴다 —
// criterion-fields.mjs 가 그쪽을 본다.
check('placeholder 가 없으면 빈 값',
  converted.every((s) => s.completionCriteria.every((c) => c.placeholder === '')))
check('난이도 점수를 매길 수 있는 모양',
  converted.every((s) => Array.isArray(s.requirementIds)))
check('ID 고유', new Set(converted.map((s) => s.id)).size === converted.length)
const mine = userStep('  내가 쓴 단계  ', '  내가 쓴 설명  ')
check('직접 추가 단계 생성', mine?.title === '내가 쓴 단계' && mine.source === 'user')
check('직접 쓴 설명이 그대로 들어감', mine.description === '내가 쓴 설명')
check('설명을 비우면 추가했다는 말만', userStep('제목만').description === '직접 추가한 단계예요.')
check('공백만이면 거부', userStep('   ') === null)
const withUser = [...converted, toAssignmentStep(mine, { prefix, index: converted.length, source: 'user' })]
check('최종 검증 통과', verifyFinalSteps(withUser).ok)
check('ID 중복이면 거부', !verifyFinalSteps([withUser[0], withUser[0]]).ok)
check('0개면 거부', !verifyFinalSteps([]).ok)

console.log('\n[D] 중요 — 등록한 단계를 계획 함수가 인식하는가')
const before = { assignments: data.assignments.length, candidates: planCandidates({}).length }
const subjectId = ensureSubject('테스트과목').id
const made = registerAssignment({
  id: prefix, subjectId, title: '테스트 과제', dueAt: '2026-12-01T23:59', demoOnly: false,
  instructionOriginal: INSTR, instructions: [INSTR],
  requirements: [{ id: `${prefix}-r1`, label: '이론', text: '이론 조사', highlight: '', kind: 'content' }],
  steps: withUser, source: 'task-chunking',
})
check('등록 성공', !!made)
check('같은 ID 재등록은 거부', registerAssignment({ id: prefix, steps: [] }) === null)
check('기존 mock 과제가 그대로', data.assignments.length === before.assignments + 1)
check('hasStepId 가 새 단계를 봄', hasStepId(withUser[0].id))
check('findStep 이 새 단계를 찾음', findStep(withUser[0].id)?.step.title === 'VAE 구조 조사')
check('findStep 이 직접 추가 단계도 찾음', findStep(withUser.at(-1).id)?.step.title === '내가 쓴 단계')
check('planCandidates 에 새 단계가 들어옴', planCandidates({}).length === before.candidates + withUser.length)

const proposal = createProposal([{ stepId: withUser[0].id, scheduledAt: '2026-11-17T05:00:00.000Z', minutes: 60 }])
const plan = buildPlan(proposal)
check('buildPlan 이 hydrate 함', plan.entries[0]?.stepTitle === 'VAE 구조 조사')
check('hydrate 가 과목명을 채움', plan.entries[0]?.subjectName === '테스트과목')
const verdict = validatePlan(plan)
check('validatePlan 이 UNKNOWN_STEP 을 내지 않음',
  !verdict.errors.some((e) => e.code === 'UNKNOWN_STEP'),
  verdict.errors.map((e) => e.code).join(',') || '오류 없음')

console.log('\n[G] 같은 과목에 과제가 둘일 때')
const again = ensureSubject('테스트과목')
check('같은 이름이면 기존 과목에 붙음', again.id === subjectId && again.created === false)
check('새 이름이면 과목을 만들고 created=true', ensureSubject('처음 보는 과목').created === true)
const p3 = freeIdPrefix('tc-second')
registerAssignment({
  id: p3, subjectId, title: '두 번째 과제', dueAt: null, demoOnly: false,
  instructionOriginal: INSTR, instructions: [INSTR],
  requirements: [{ id: p3 + '-r1', label: 'A4 3장', text: 'A4 3장 이내로 써요.', highlight: '', kind: 'submission' }],
  steps: [toAssignmentStep({ title: '두 번째 단계', description: '설명이에요.', criteria: [] }, { prefix: p3, index: 0 })],
  source: 'task-chunking',
})
check('같은 과목에 과제가 둘 다 등록됨', assignmentsForSubject(subjectId).length === 2)
check('홈은 과제 단위라 둘 다 카드가 됨',
  data.assignments.filter((a) => a.subjectId === subjectId).length === 2)
check('두 번째 과제의 단계도 findStep 이 찾음', findStep(p3 + '-s1')?.step.title === '두 번째 단계')

console.log('\n[H] 어긋난 requirementId')
const drift = verifyChunkResult({
  assignment: { assignmentTitle: 't', dueAt: '', requirements: [
    { requirementId: 'req-001', keyword: 'A', text: 'A 예요.', kind: 'content' },
    { requirementId: 'req-006', keyword: 'B', text: 'B 예요.', kind: 'content' },
  ] },
  steps: [
    { stepId: 's1', title: '하나', description: '설명이에요.', requirementIds: ['get-006'], completionCriteria: [] },
    { stepId: 's2', title: '둘', description: '설명이에요.', requirementIds: ['req-999'], completionCriteria: [] },
  ],
}, { level: 'low', instruction: INSTR })
check('접두사만 틀린 ID 는 번호로 복구', drift.steps[0].requirementIds.join(',') === 'req-006')
check('복구된 것은 경고하지 않음', !drift.warnings.some((w) => w.includes('get-006')))
check('없는 번호는 그대로 경고', drift.warnings.some((w) => w.includes('req-999')))
check('없는 번호는 연결에서 빠짐', drift.steps[1].requirementIds.length === 0)

console.log('\n[E] 수준 정의')
check('세 가지', CHUNK_LEVELS.length === 3)
check('기본값 medium', DEFAULT_LEVEL === 'medium')
check('권장 범위 3~4 / 5~6 / 7~8',
  CHUNK_LEVELS.map((l) => `${l.min}-${l.max}`).join(',') === '3-4,5-6,7-8')
check('slug 가 한글에서도 ID 를 만듦', /^[a-z0-9-]+$/.test(slugify('인지부하 보고서')))

console.log('\n[F] 순서 조정이 적용까지 이어지는가')
// 패널이 rows 를 재배열한 뒤 그 순서대로 변환한다 — 같은 경로를 재현
const reordered = [okCheck.steps[2], okCheck.steps[0], okCheck.steps[1]]
const p2 = freeIdPrefix('tc-order')
const out = reordered.map((s, i) => toAssignmentStep(s, { prefix: p2, index: i }))
check('바뀐 순서대로 ID 가 매겨짐', out.map((s) => s.id).join(',') === `${p2}-s1,${p2}-s2,${p2}-s3`)
check('첫 단계가 재배열한 그 단계', out[0].title === '비교 정리')
check('순서를 바꿔도 최종 검증 통과', verifyFinalSteps(out).ok)


console.log('\n[X] 미리 준비한 예시 결과')
// The example has to survive every check a live answer survives, or it is a
// demo of something the product cannot actually produce.
const exLevel = CHUNK_LEVELS.find((item) => item.id === EXAMPLE_LEVEL)
const ex = verifyChunkResult(EXAMPLE_RESULT, { level: EXAMPLE_LEVEL, instruction: EXAMPLE_INSTRUCTION })
check('실제 검증을 통과', ex.ok)
check('오류 없음', ex.errors.length === 0)
check('경고 없음', ex.warnings.length === 0)
check(`단계 수가 ‘${exLevel.label}’ 범위 안 (${exLevel.min}~${exLevel.max})`,
  ex.steps.length >= exLevel.min && ex.steps.length <= exLevel.max)
check('과제 제목을 읽어냄', ex.title.length > 0)
check('마감이 지시문의 날짜와 같음', ex.dueAt === '2026-11-29T23:59')
const exRows = ex.steps.map((item, index) => ({ key: `x${index}`, ...item, source: 'example' }))
check('빠진 요구사항 없음', droppedRequirements(exRows, exRows, ex.requirements).length === 0)
const exSteps = exRows.map((row, index) => toAssignmentStep(row, { prefix: 'tc-example', index, source: row.source }))
check('최종 검증까지 통과', verifyFinalSteps(exSteps).ok)
check('모든 단계에 완료 조건', exSteps.every((item) => item.completionCriteria.length > 0))
check('모든 단계에 팁', exSteps.every((item) => item.prerequisiteTip.length > 0))

// The constraint this feature is most able to break: an answer the model did
// not give must never arrive looking like one it did.
const panel = readFileSync('/home/claude/learningscience/src/features/taskChunking/TaskChunkingPanel.jsx', 'utf8')
const onFailure = panel.slice(panel.indexOf('} catch (failure) {'), panel.indexOf('} finally {'))
check('생성 실패가 예시를 대신 띄우지 않음', !onFailure.includes('showExample') && !onFailure.includes('EXAMPLE_RESULT'))
check('예시는 사용자가 눌러야 열림', panel.includes('onClick={showExample}'))
check('예시로 만든 단계는 example 로 표시', panel.includes("source: 'example'"))
check('예시 화면이 예시라고 밝힘', panel.includes('예시로 만든 결과예요'))
check('예시를 띄우면 지시문도 예시로 바뀜', panel.includes('setText(EXAMPLE_INSTRUCTION)'))
check('실제 생성은 예시 표시를 끔', panel.includes('setIsExample(false)'))
// The example skips the screen that asks for a subject, so it has to bring
// one. ensureSubject('') does not refuse an empty name -- it registers a
// subject called nothing, and the card then shows a dot beside a blank.
check('예시가 과목명을 함께 채움', panel.includes('setNewSubject(EXAMPLE_SUBJECT)'))
check('이름 없는 과목은 등록되지 않음', panel.includes("setError('과목 이름을 적어 주세요.')"))
check('과목명이 없으면 완료 버튼이 꺼짐', panel.includes('chosen.length === 0 || !subjectName'))
check('예시 과목명이 비어 있지 않음', EXAMPLE_SUBJECT.trim().length > 0)

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exit(fail > 0 ? 1 : 0)
