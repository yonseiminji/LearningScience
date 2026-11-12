// 이번 주 계획: deciding WHEN to do steps that are already split up.
//
// No React here, so the rules stay readable and the panels can change without
// touching them. Nothing is sent anywhere; the plan lives in React state and,
// for "have I planned before", in localStorage.

import { DAY_END, DAY_START, clockMinutes, data, subjectById } from './assignmentModel.js'

export const DURATIONS = [10, 20, 40]
export const DEFAULT_MINUTES = 20
export const SHORT_MINUTES = 10
export const MAX_PICKS = 3
export const FEWER_PICKS = 2

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const DAY_MS = 86400000

// ─── dates ───────────────────────────────────────────────────────────────

export function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function parseDueDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

// Counted back from the deadline: the last step lands two days before it, and
// each earlier step one day before the next. A target already in the past is
// left as it is — that is what 계획 다시 짜기 is for.
export function stepTargetDate(assignment, stepIndex) {
  const due = parseDueDate(assignment?.dueAt)
  if (!due) return null
  const total = assignment.steps.length
  const daysBefore = 2 + (total - 1 - stepIndex)
  return new Date(due.getTime() - daysBefore * DAY_MS)
}

export function formatMonthDay(date) {
  if (!date) return ''
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function formatKoreanDate(date) {
  if (!date) return ''
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export function formatSlotLabel(slot) {
  if (!slot) return ''
  const prefix = slot.nextWeek ? '다음 주 ' : ''
  return `${prefix}${DAY_NAMES[slot.date.getDay()]} ${slot.time}`
}

export function formatSlotSentence(slot) {
  if (!slot) return ''
  const hour = slot.date.getHours()
  const minute = slot.date.getMinutes()
  const clock = minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`
  const prefix = slot.nextWeek ? '다음 주 ' : ''
  return `${prefix}${DAY_NAMES[slot.date.getDay()]}요일 ${clock}`
}

// ─── the steps a learner can plan ────────────────────────────────────────

// How hard a step looks from the data we have: more completion criteria means
// more to satisfy, and a later step builds on the ones before it. There is no
// difficulty field in the assignment file, and this does not invent one — it
// is only an ordering for the '어려운 것부터' toggle.
function difficultyRank(step, stepIndex) {
  return step.completionCriteria.length * 10 + stepIndex
}

export function planCandidates(stepCompletion) {
  const rows = []
  for (const assignment of data.assignments) {
    assignment.steps.forEach((step, index) => {
      if (stepCompletion[step.id]) return
      rows.push({
        stepId: step.id,
        stepTitle: step.title,
        stepNumber: index + 1,
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        subjectId: assignment.subjectId,
        subjectName: subjectById(assignment.subjectId)?.name || '',
        colorToken: subjectById(assignment.subjectId)?.colorToken || '',
        dueAt: assignment.dueAt,
        dueDate: parseDueDate(assignment.dueAt),
        targetDate: stepTargetDate(assignment, index),
        difficulty: difficultyRank(step, index),
      })
    })
  }
  return rows
}

export const SORT_MODES = [
  { id: 'due', label: '마감이 가까운 것부터' },
  { id: 'difficulty', label: '어려운 것부터' },
]

export function sortCandidates(rows, mode) {
  const sorted = rows.slice()
  if (mode === 'difficulty') {
    sorted.sort((a, b) => b.difficulty - a.difficulty || a.dueAt.localeCompare(b.dueAt))
  } else {
    sorted.sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.stepNumber - b.stepNumber)
  }
  return sorted
}

export function labelFor(row) {
  return `${row.subjectName} ${row.stepNumber}단계`
}

// ─── free time in the timetable ──────────────────────────────────────────

function mondayOf(date) {
  const day = startOfDay(date)
  const offset = (day.getDay() + 6) % 7 // Monday = 0
  return new Date(day.getTime() - offset * DAY_MS)
}

function classesOn(dayOfWeek) {
  return data.demoSchedule.filter((item) => item.dayOfWeek === dayOfWeek)
}

const AFTERNOON = 14 * 60

function freeHoursOn(day, now) {
  const busy = classesOn(day.getDay())
  const hours = []
  for (let minutes = DAY_START; minutes + 60 <= DAY_END; minutes += 60) {
    const taken = busy.some((item) => minutes < clockMinutes(item.end) && minutes + 60 > clockMinutes(item.start))
    if (taken) continue
    const at = new Date(day)
    at.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
    if (at.getTime() <= now.getTime()) continue
    hours.push({ minutes, at })
  }
  return hours
}

// Weekday hours the timetable leaves empty, from now on. At most two a day —
// one earlier, one after lunch — so the choice reads as "which day" rather
// than a wall of consecutive hours. This week first, then next week, so there
// is always something to choose late in the week.
export function freeSlots(now = new Date(), wanted = 8) {
  const slots = []
  const thisMonday = mondayOf(now)

  for (let week = 0; week < 2; week += 1) {
    for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
      const day = new Date(thisMonday.getTime() + (week * 7 + dayOffset) * DAY_MS)
      const hours = freeHoursOn(day, now)
      if (hours.length === 0) continue
      const picks = [hours[0]]
      const afternoon = hours.find((hour) => hour.minutes >= AFTERNOON && hour !== hours[0])
      if (afternoon) picks.push(afternoon)
      for (const pick of picks) {
        slots.push({
          id: pick.at.toISOString(),
          date: pick.at,
          time: `${String(pick.at.getHours()).padStart(2, '0')}:${String(pick.at.getMinutes()).padStart(2, '0')}`,
          nextWeek: week === 1,
        })
      }
    }
    if (slots.length >= wanted) break
  }
  return slots.slice(0, wanted)
}

export function slotFromIso(iso, nextWeek = false) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return {
    id: iso,
    date,
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    nextWeek,
  }
}

// ─── the plan itself ─────────────────────────────────────────────────────

export function createEntry({ row, slot, minutes }) {
  return {
    stepId: row.stepId,
    subjectId: row.subjectId,
    assignmentId: row.assignmentId,
    stepNumber: row.stepNumber,
    stepTitle: row.stepTitle,
    subjectName: row.subjectName,
    colorToken: row.colorToken,
    targetIso: row.targetDate ? row.targetDate.toISOString() : null,
    dueAt: row.dueAt,
    slotIso: slot.id,
    nextWeek: Boolean(slot.nextWeek),
    minutes,
  }
}

export function sortEntries(entries) {
  return entries.slice().sort((a, b) => a.slotIso.localeCompare(b.slotIso))
}

// 'done' | 'waiting' | 'missed'. 'missed' only means the hour set aside has
// gone by and the step is not ticked — never phrased as a failure.
export function entryStatus(entry, stepCompletion, now = new Date()) {
  if (stepCompletion[entry.stepId]) return 'done'
  return new Date(entry.slotIso).getTime() < now.getTime() ? 'missed' : 'waiting'
}

export function missedEntries(entries, stepCompletion, now = new Date()) {
  return sortEntries(entries).filter((entry) => entryStatus(entry, stepCompletion, now) === 'missed')
}

// ─── has this learner planned before? ────────────────────────────────────

const PLANNED_KEY = 'chagok.weekPlan.planned'

export function readHasPlanned() {
  try {
    return window.localStorage.getItem(PLANNED_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeHasPlanned() {
  try {
    window.localStorage.setItem(PLANNED_KEY, 'true')
  } catch {
    // storage unavailable: the example simply shows again
  }
}

// ─── 지난주 돌아보기 ──────────────────────────────────────────────────────

export const LAST_WEEK_ANSWERS = [
  { id: 'all', label: '계획대로 했어요' },
  { id: 'some', label: '일부만 했어요' },
  { id: 'none', label: '못 했어요' },
]

export const ADJUST_ANSWERS = [
  { id: 'shorter', label: '시간을 더 짧게 해 볼래요' },
  { id: 'fewer', label: '단계를 더 적게 해 볼래요' },
  { id: 'other-time', label: '다른 시간에 할래요' },
]

export function defaultMinutesFor(adjust) {
  return adjust === 'shorter' ? SHORT_MINUTES : DEFAULT_MINUTES
}

export function maxPicksFor(adjust) {
  return adjust === 'fewer' ? FEWER_PICKS : MAX_PICKS
}

// An example plan for a first-time learner, built from the real steps so the
// shape matches what they are about to make. It is labelled 예시 and is never
// saved.
export function examplePlan(stepCompletion) {
  const rows = sortCandidates(planCandidates(stepCompletion), 'due').slice(0, 3)
  const slots = freeSlots(new Date(), 6)
  return rows.map((row, index) => ({
    key: row.stepId,
    label: labelFor(row),
    stepTitle: row.stepTitle,
    minutes: index === rows.length - 1 ? SHORT_MINUTES : DEFAULT_MINUTES,
    slotLabel: slots[index] ? formatSlotLabel(slots[index]) : '',
  }))
}
