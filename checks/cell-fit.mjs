import { CELL_MINUTES, fitInCell } from '/home/claude/learningscience/src/weekPlan.js'
import { DAY_END, DAY_START } from '/home/claude/learningscience/src/assignmentModel.js'

let pass = 0
let fail = 0
function is(label, got, want) {
  const ok = got === want
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : ` — got ${got}, want ${want}`}`)
  ok ? (pass += 1) : (fail += 1)
}

// The demo timetable: 월 10:00–11:15, 화 13:00–14:15, 수 15:00–16:15,
// 목 10:00–11:15, 금 09:00–10:15. Find a Monday to anchor on.
const MON = '2026-11-16'
const SAT = '2026-11-21'

console.log('\n[A] 빈 칸은 정각에 놓인다')
is('토 09:00 칸 → 09:00', fitInCell(SAT, 9 * 60, 20), 9 * 60)
is('토 14:00 칸 → 14:00', fitInCell(SAT, 14 * 60, 40), 14 * 60)

console.log('\n[B] 수업이 끝나는 11:15 틈을 버리지 않는다')
is('월 10:00 칸은 수업 중 → 없음', fitInCell(MON, 10 * 60, 20), null)
is('월 11:00 칸 → 11:15 (수업 끝나는 시각)', fitInCell(MON, 11 * 60, 20), 11 * 60 + 15)
is('월 11:00 칸, 40분도 들어감', fitInCell(MON, 11 * 60, 40), 11 * 60 + 15)
is('월 12:00 칸 → 12:00 (수업 영향 없음)', fitInCell(MON, 12 * 60, 40), 12 * 60)

console.log('\n[C] 길이에 따라 칸이 열리고 닫힌다')
is('월 11:00 칸, 45분은 11:15+45=12:00 로 아슬하게 들어감', fitInCell(MON, 11 * 60, 45), 11 * 60 + 15)
is('금 10:00 칸 → 10:15', fitInCell('2026-11-20', 10 * 60, 20), 10 * 60 + 15)
is('금 09:00 칸은 수업 중 → 없음', fitInCell('2026-11-20', 9 * 60, 10), null)

console.log('\n[D] 하루 경계를 넘지 않는다')
is('토 17:00 칸, 40분 → 17:00', fitInCell(SAT, 17 * 60, 40), 17 * 60)
is('토 17:00 칸, 70분은 18:00 넘김 → 없음', fitInCell(SAT, 17 * 60, 70), null)
is('마지막 칸은 DAY_END 직전', DAY_START + 8 * CELL_MINUTES, DAY_END - CELL_MINUTES)

console.log('\n[E] 이미 잡힌 블록을 피한다')
const taken = [{ dateString: SAT, startMinutes: 14 * 60, minutes: 20 }]
is('토 14:00 칸, 14:00–14:20 이 찼으면 → 14:20', fitInCell(SAT, 14 * 60, 20, taken), 14 * 60 + 20)
is('토 14:00 칸, 40분은 14:20+40=15:00 로 들어감', fitInCell(SAT, 14 * 60, 40, taken), 14 * 60 + 20)
is('토 15:00 칸은 영향 없음', fitInCell(SAT, 15 * 60, 20, taken), 15 * 60)

const full = [{ dateString: SAT, startMinutes: 14 * 60, minutes: 60 }]
is('칸이 통째로 찼으면 → 없음', fitInCell(SAT, 14 * 60, 10, full), null)

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
