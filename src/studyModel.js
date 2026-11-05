import study from './data/study.json'
import { stepsForLevel } from './taskModel.js'

export const WEEKDAYS = [
  { index: 1, label: '월' },
  { index: 2, label: '화' },
  { index: 3, label: '수' },
  { index: 4, label: '목' },
  { index: 5, label: '금' },
]

export const DAY_START_MINUTES = 9 * 60
export const DAY_END_MINUTES = 21 * 60

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

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function ddayLabel(date, today) {
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return '마감 지남'
  if (diff === 0) return '오늘 마감'
  if (diff === 1) return '내일 마감'
  if (diff < 7) return `D-${diff}`
  return `${date.getMonth() + 1}월 ${date.getDate()}일 마감`
}

export function courseById(id) {
  return study.courses.find((course) => course.id === id) || null
}

export function initialSimpleDone() {
  const done = {}
  for (const task of study.simple_tasks) {
    done[task.id] = task.steps.filter((step) => step.done).map((step) => step.id)
  }
  return done
}

export function clockMinutes(value) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export function simpleTasksWithStatus(simpleDone, today = seoulToday()) {
  return study.simple_tasks
    .map((task) => {
      const doneIds = simpleDone[task.id] || []
      const due = addDays(today, task.due_offset_days)
      const next = task.steps.find((step) => !doneIds.includes(step.id)) || null
      return {
        ...task,
        course: courseById(task.course_id),
        due,
        dueLabel: ddayLabel(due, today),
        done: doneIds.length,
        total: task.steps.length,
        doneIds,
        next,
        finished: !next,
      }
    })
    .sort((a, b) => a.due - b.due || a.title.localeCompare(b.title, 'ko'))
}

export function analyzedStatus(task, supportLevel, completedIds) {
  const steps = supportLevel ? stepsForLevel(task, supportLevel) : []
  const done = steps.filter((step) => completedIds.includes(step.id)).length
  return {
    id: task.task_id,
    title: task.title,
    summary: task.summary,
    course: courseById('learning-science'),
    deadlineText: task.requirements?.deadline?.display || '',
    steps,
    done,
    total: steps.length,
    ready: Boolean(supportLevel && steps.length),
    next: steps.find((step) => !completedIds.includes(step.id)) || null,
    finished: Boolean(supportLevel) && steps.length > 0 && done === steps.length,
  }
}

export function weekProgress(simpleTasks, analyzed) {
  let total = 0
  let done = 0
  for (const task of simpleTasks) {
    total += task.total
    done += task.done
  }
  if (analyzed.ready) {
    total += analyzed.total
    done += analyzed.done
  }
  return { total, done }
}

export function nextDeadline(simpleTasks) {
  return simpleTasks.find((task) => !task.finished) || null
}

export { study }
