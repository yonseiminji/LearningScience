import data from './data/assignments.mock.json'

export function subjectById(id) {
  return data.subjects.find((subject) => subject.id === id) || null
}

export function assignmentForSubject(subjectId) {
  return data.assignments.find((assignment) => assignment.subjectId === subjectId) || null
}

export function formatDue(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || '')
  if (!match) return ''
  return `마감 ${Number(match[2])}월 ${Number(match[3])}일 ${match[4]}:${match[5]}`
}

export function seoulToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const [year, month, day] = parts.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function ddayLabel(iso, today = seoulToday()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  if (!match) return ''
  const due = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return '마감 지남'
  if (diff === 0) return 'D-DAY'
  return `D-${diff}`
}

// D-day chip turns coral when the due date is 7 days away or closer
export function dueChipClass(iso, today = seoulToday()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  if (!match) return 'due-chip'
  const due = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  return diff <= 7 ? 'due-chip is-soon' : 'due-chip'
}

export function stepCounts(assignment, stepCompletion) {
  const total = assignment?.steps.length || 0
  const done = assignment?.steps.filter((step) => stepCompletion[step.id]).length || 0
  return { done, total }
}

export function overallCounts(stepCompletion) {
  return data.assignments.reduce(
    (sum, assignment) => {
      const counts = stepCounts(assignment, stepCompletion)
      return { done: sum.done + counts.done, total: sum.total + counts.total }
    },
    { done: 0, total: 0 },
  )
}

export function nextOpenAssignment(stepCompletion) {
  return (
    data.assignments
      .filter((assignment) => assignment.steps.some((step) => !stepCompletion[step.id]))
      .slice()
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0] || null
  )
}

export function firstOpenStep(assignment, stepCompletion) {
  return assignment.steps.find((step) => !stepCompletion[step.id]) || assignment.steps.at(-1) || null
}

export function segmentInstruction(assignment) {
  const instruction = assignment.instructionOriginal || ''
  const hits = assignment.requirements
    .map((requirement) => ({
      ...requirement,
      index: requirement.highlight ? instruction.indexOf(requirement.highlight) : -1,
    }))
    .filter((requirement) => requirement.index >= 0)
    .sort((a, b) => a.index - b.index || b.highlight.length - a.highlight.length)

  const segments = []
  let cursor = 0
  for (const requirement of hits) {
    if (requirement.index < cursor) continue
    if (requirement.index > cursor) {
      segments.push({ type: 'text', text: instruction.slice(cursor, requirement.index) })
    }
    segments.push({
      type: 'mark',
      id: requirement.id,
      text: requirement.highlight,
      label: requirement.label,
    })
    cursor = requirement.index + requirement.highlight.length
  }
  if (cursor < instruction.length) {
    segments.push({ type: 'text', text: instruction.slice(cursor) })
  }
  return segments
}

export const WEEKDAYS = [
  { index: 1, label: '월' },
  { index: 2, label: '화' },
  { index: 3, label: '수' },
  { index: 4, label: '목' },
  { index: 5, label: '금' },
]

export const DAY_START = 9 * 60
export const DAY_END = 18 * 60

export function clockMinutes(value) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export { data }
