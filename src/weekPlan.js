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

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const DAY_MS = 86400000

// ─── dates ───────────────────────────────────────────────────────────────

export function mondayOf(date) {
  const day = startOfDay(date)
  const offset = (day.getDay() + 6) % 7 // Monday = 0
  return new Date(day.getTime() - offset * DAY_MS)
}

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

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (value.date instanceof Date) return value.date
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function nextWeekPrefix(date, now = new Date()) {
  return date.getTime() >= mondayOf(now).getTime() + 7 * DAY_MS ? '다음 주 ' : ''
}

export function formatClock(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatSlotLabel(value, now = new Date()) {
  const date = toDate(value)
  if (!date) return ''
  return `${nextWeekPrefix(date, now)}${DAY_NAMES[date.getDay()]} ${formatClock(date)}`
}

export function formatSlotSentence(value, now = new Date()) {
  const date = toDate(value)
  if (!date) return ''
  const minute = date.getMinutes()
  const clock = minute === 0 ? `${date.getHours()}시` : `${date.getHours()}시 ${minute}분`
  return `${nextWeekPrefix(date, now)}${DAY_NAMES[date.getDay()]}요일 ${clock}`
}

export function formatIsoDate(date) {
  if (!date) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

// ─── the plan itself ─────────────────────────────────────────────────────

export function createEntry({ row, slot, minutes }) {
  return {
    stepId: row.stepId,
    assignmentId: row.assignmentId,
    assignmentTitle: row.assignmentTitle,
    subjectId: row.subjectId,
    subjectName: row.subjectName,
    colorToken: row.colorToken,
    stepNumber: row.stepNumber,
    stepTitle: row.stepTitle,
    targetDate: formatIsoDate(row.targetDate),
    dueAt: row.dueAt,
    scheduledAt: slot.id,
    minutes,
  }
}

export function sortEntries(entries) {
  return entries.slice().sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
}

// 'done' | 'waiting' | 'missed'. 'missed' only means the hour set aside has
// gone by and the step is not ticked — never phrased as a failure.
export function entryStatus(entry, stepCompletion, now = new Date()) {
  if (stepCompletion[entry.stepId]) return 'done'
  return new Date(entry.scheduledAt).getTime() < now.getTime() ? 'missed' : 'waiting'
}

// The plan as a document. This is the shape the screen hands back and the
// shape 나의 할 일 reads: one week, the few steps taken on, and when.
export function buildPlan({ entries, review = {}, settings = {}, source = 'mock', now = new Date() }) {
  return {
    schemaVersion: 1,
    source,
    createdAt: now.toISOString(),
    weekOf: formatIsoDate(mondayOf(now)),
    review: { lastWeek: review.lastWeek ?? null, adjust: review.adjust ?? null },
    settings: {
      sortMode: settings.sortMode ?? 'due',
      maxPicks: settings.maxPicks ?? MAX_PICKS,
      defaultMinutes: settings.defaultMinutes ?? DEFAULT_MINUTES,
    },
    entries: sortEntries(entries),
  }
}

export function planEntriesOf(plan) {
  return Array.isArray(plan?.entries) ? plan.entries : []
}

// 나의 할 일 reads this: the planned steps gathered per subject, with the
// assignment they belong to. Nothing that was not planned appears.
export function planBySubject(plan, stepCompletion = {}) {
  const groups = []
  for (const entry of sortEntries(planEntriesOf(plan))) {
    let group = groups.find((item) => item.subjectId === entry.subjectId)
    if (!group) {
      const assignment = data.assignments.find((item) => item.id === entry.assignmentId)
      group = {
        subjectId: entry.subjectId,
        subjectName: entry.subjectName,
        colorToken: entry.colorToken,
        assignmentId: entry.assignmentId,
        assignmentTitle: entry.assignmentTitle || assignment?.title || '',
        dueAt: entry.dueAt || assignment?.dueAt || '',
        entries: [],
      }
      groups.push(group)
    }
    group.entries.push(entry)
  }
  for (const group of groups) {
    group.done = group.entries.filter((entry) => stepCompletion[entry.stepId]).length
    group.total = group.entries.length
  }
  return groups
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
