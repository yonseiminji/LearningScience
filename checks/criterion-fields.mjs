import { readFileSync } from 'node:fs'
import { toAssignmentStep, verifyChunkResult } from '/home/claude/learningscience/src/features/taskChunking/taskChunking.js'

let pass = 0
let fail = 0
function is(label, got, want) {
  const ok = got === want
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
function ok(label, cond) {
  is(label, Boolean(cond), true)
}

const INSTRUCTION = '인지부하 이론을 설명하는 보고서를 쓰세요. 자료를 1개 이상 찾고 핵심 개념을 2개 이상 정리합니다.'
const MODEL = {
  assignment: {
    assignmentTitle: '인지부하 보고서',
    dueAt: '',
    requirements: [{ requirementId: 'req-001', keyword: '자료 1개 이상', text: '자료를 1개 이상 찾습니다.', kind: 'content' }],
  },
  steps: [
    {
      stepId: 'step-001',
      title: '자료 찾기',
      description: '기본 개념을 확인할 자료를 확보해요.',
      tip: '먼저 인지부하가 작업기억의 제한과 관련된다는 점을 떠올려 보세요.',
      requirementIds: ['req-001'],
      completionCriteria: [
        { text: '자료를 1개 이상 찾아요', inputLabel: '찾은 자료의 제목을 적어요', placeholder: "예) 강의 교재의 '인지부하' 부분" },
      ],
    },
  ],
}

console.log('\n[A] Gemini 가 돌려준 세 필드가 끝까지 전달된다')
const parsed = verifyChunkResult(MODEL, { level: 'low', instruction: INSTRUCTION })
const step = toAssignmentStep(parsed.steps[0], { prefix: 'x', index: 0 })
is('tip 이 prerequisiteTip 으로', step.prerequisiteTip, MODEL.steps[0].tip)
is('기준 text', step.completionCriteria[0].text, '자료를 1개 이상 찾아요')
is('기준 inputLabel', step.completionCriteria[0].inputLabel, '찾은 자료의 제목을 적어요')
is('기준 placeholder', step.completionCriteria[0].placeholder, "예) 강의 교재의 '인지부하' 부분")

console.log('\n[B] 문장형 플레이스홀더는 버린다 (박스가 자기 문구로 대체)')
function holder(value) {
  const one = JSON.parse(JSON.stringify(MODEL))
  one.steps[0].completionCriteria[0].placeholder = value
  const got = verifyChunkResult(one, { level: 'low', instruction: INSTRUCTION })
  return toAssignmentStep(got.steps[0], { prefix: 'x', index: 0 }).completionCriteria[0].placeholder
}
is('…찾았어요. → 버림', holder('예) 리뷰 논문 1편을 찾았어요.'), '')
is('…있어요 → 버림', holder('예) 두 개념이 모두 들어 있어요'), '')
is('…했다 → 버림', holder('예) 자료를 확보했다'), '')
is('명사구는 통과', holder('예) 강의 교재 3장'), '예) 강의 교재 3장')
is('예) 가 없어도 붙여줌', holder('강의 교재 3장'), '예) 강의 교재 3장')
is('마침표만 떼어냄', holder('예) 강의 교재 3장.'), '예) 강의 교재 3장')
is('빈 값', holder(''), '')

console.log('\n[C] 필드가 없어도 깨지지 않는다 (예전 응답 모양)')
const bare = JSON.parse(JSON.stringify(MODEL))
delete bare.steps[0].tip
bare.steps[0].completionCriteria = [{ text: '자료를 찾아요' }]
const old = toAssignmentStep(verifyChunkResult(bare, { level: 'low', instruction: INSTRUCTION }).steps[0], { prefix: 'y', index: 0 })
is('tip 없으면 빈 문자열', old.prerequisiteTip, '')
is('inputLabel 없으면 빈 문자열', old.completionCriteria[0].inputLabel, '')
is('placeholder 없으면 빈 문자열', old.completionCriteria[0].placeholder, '')
is('text 는 남음', old.completionCriteria[0].text, '자료를 찾아요')

console.log('\n[D] 기본 3과목도 같은 모양이다')
const mock = JSON.parse(readFileSync('/home/claude/learningscience/src/data/assignments.mock.json', 'utf8'))
const all = mock.assignments.flatMap((a) => a.steps.flatMap((s) => s.completionCriteria))
is('기준 개수', all.length, 30)
ok('완료되었나요? 가 하나도 없음', !all.some((c) => c.inputLabel === '완료되었나요?'))
ok('inputLabel 이 모두 적어요 로 끝남', all.every((c) => /적어요$/.test(c.inputLabel)))
ok('text 가 모두 요 로 끝남', all.every((c) => /요$/.test(c.text)))
ok('placeholder 가 모두 예) 로 시작', all.every((c) => c.placeholder.startsWith('예) ')))
const sentence = all.filter((c) => /(했어요|있어요|찾았어요|적었어요)[.]?$/.test(c.placeholder))
is('문장형 플레이스홀더 수', sentence.length, 0)
ok('모든 단계에 tip 이 있음', mock.assignments.every((a) => a.steps.every((s) => s.prerequisiteTip)))

console.log('\n[E] 스키마와 프롬프트가 세 필드를 요구한다')
const api = readFileSync('/home/claude/learningscience/api/planner/chunk.js', 'utf8')
ok('스키마에 tip', /tip:\s*\{\s*type:\s*Type\.STRING\s*\}/.test(api))
ok('스키마 required 에 inputLabel, placeholder', /required:\s*\['text',\s*'inputLabel',\s*'placeholder'\]/.test(api))
ok('프롬프트가 완료되었나요? 를 금지', api.includes('Never 완료되었나요?'))
ok('프롬프트가 명사구를 요구', api.includes('NOUN PHRASE'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
