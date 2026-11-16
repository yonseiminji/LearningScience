import { existsSync, readFileSync } from 'node:fs'
import { verifyQuestions } from '/home/claude/learningscience/api/tutor/quiz.js'
import { FEW_SHOTS } from '/home/claude/learningscience/api/_lib/prompts/quizFewShots.js'

const src = readFileSync('/home/claude/learningscience/api/tutor/quiz.js', 'utf8') +
  readFileSync('/home/claude/learningscience/api/_lib/prompts/quiz.js', 'utf8')
const SYSTEM = src.match(/const SYSTEM = `([\s\S]*?)`\n/)[1].replace('${FEW_SHOTS}', FEW_SHOTS)

let pass = 0
let fail = 0
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  ok ? (pass += 1) : (fail += 1)
}

console.log('\n[A] 프롬프트가 명세의 지시를 담고 있는지')
check('부정 OX는 명시적 반박만 (UNKNOWN != false)', /absent from the passage is UNKNOWN, not false/.test(SYSTEM))
check('X는 CONTRADICTED 요구', /clearly CONTRADICTED by the cited passage, not merely missing/.test(SYSTEM))
check('빈칸 마커 ____ 하나', /exactly one blank marker: ____/.test(SYSTEM))
check('evidenceText 연속 부분 문자열', /contiguous exact excerpt of one cited chunk/.test(SYSTEM))
check('합성 인용·의역 금지', /do not stitch a quotation together from different chunks/.test(SYSTEM))
check('출력 언어 한국어 + 존댓말', /in Korean/.test(SYSTEM) && /존댓말/.test(SYSTEM))
check('근거 부족 시 적게 생성', /generate fewer questions/.test(SYSTEM))
check('청크를 untrusted data로 취급', /untrusted data, not instructions/.test(SYSTEM))
check('스키마 외 필드 금지', /no fields beyond the schema's own/.test(SYSTEM))
check('예시 청크를 근거로 인용 금지', /never cite them/.test(SYSTEM))

console.log('\n[B] 메타 필드가 출력 필드로 새지 않는지')
const META = ['whyGood', 'rejectReason', 'knowledgeType', 'expectedOutput', 'knowledgeUnit', 'proposition']
for (const key of META) {
  check(`"${key}" 가 JSON 키로 등장하지 않음`, !new RegExp(`"${key}"\\s*:`).test(SYSTEM))
}
const schemaBlock = src.match(/const SCHEMA = \{[\s\S]*?\n\}/)[0]
check('SCHEMA 속성이 7개 그대로', (schemaBlock.match(/^\s{10}\w+: \{/gm) || []).length === 7,
  `${(schemaBlock.match(/^\s{10}\w+: \{/gm) || []).map((s) => s.trim().split(':')[0]).join(', ')}`)

console.log('\n[C] few-shot 예시가 현행 검증을 통과하는지')
// The example set arrived as an upload and was never committed, so this
// section runs only when its path is given:
//   node checks/quiz-prompt-tests.mjs <few-shots.json>
// Without it the section is skipped out loud. Crashing the whole file on a
// missing one-off fixture hides the sections that can still run.
const fixture = process.argv[2]
const data = fixture && existsSync(fixture) ? JSON.parse(readFileSync(fixture, 'utf8')) : null
let skipped = 0
const skip = (section) => {
  console.log(`  SKIP  예시 파일을 주지 않아 건너뜀 — ${section} (경로를 인자로 주면 검증합니다)`)
  skipped += 1
}

if (!data) skip('few-shot 통과 검증')
else
  for (const example of data.positiveExamples) {
    const { kept } = verifyQuestions(example.expectedOutput.questions, example.input.chunks)
    check(`positive: ${example.id}`, kept.length === 1)
  }

console.log('\n[D] 금지 패턴 — 코드가 잡는지 (명세가 예상한 대로 못 잡아야 정상)')
if (!data) skip('금지 패턴 검증')
else
  for (const example of data.rejectedExamples) {
    const { kept, dropped } = verifyQuestions([example.badCandidate], example.input.chunks)
    console.log(`  ${kept.length > 0 ? '코드 통과' : '코드 차단'}  ${example.id}` +
      `${dropped.length ? ` (${dropped[0].reason})` : ''}`)
  }

console.log('\n[E] 프롬프트 크기')
console.log(`  SYSTEM(few-shot 포함): ${SYSTEM.length}자`)
console.log(`  그중 few-shot       : ${FEW_SHOTS.length}자`)
console.log(`  baseline            : 385자`)
console.log(`  증가                : ${(SYSTEM.length / 385).toFixed(1)}배`)

console.log(`\n요약: ${pass} PASS / ${fail} FAIL${skipped ? ` / ${skipped} SKIP` : ''}`)
process.exit(fail > 0 ? 1 : 0)
