// 이번 주 계획: deciding WHEN to do steps that are already split up.
//
// Two shapes, one direction:
//
//   PlanProposal   { entries: [{ stepId, scheduledAt, minutes }] }
//       │            what a planner decides — the mock one today, an LLM
//       │            agent later. Nothing a planner could get wrong by
//       │            copying it from somewhere.
//       ▼  buildPlan()
//   Plan Document  7 top-level fields, 12 per entry
//                    titles, subjects, deadlines and step order looked up
//                    from the assignment data. This is what the app stores
//                    and what every screen reads.
//
// Timestamps are UTC ISO with milliseconds. Dates, weekdays and week
// boundaries are worked out in Asia/Seoul (src/planTime.js). Screens convert
// back to Seoul for display.
//
// Pure: no React, no DOM.

import { DAY_END, DAY_START, clockMinutes, data, subjectById } from './assignmentModel.js'
import {
  addSeoulDays,
  fromSeoulDate,
  isDateOnly,
  isUtcIso,
  seoulDateString,
  seoulMinutesOfDay,
  seoulMondayOf,
  seoulWeekday,
  toDate,
  toUtcIso,
} from './planTime.js'

export { formatKoreanDate, formatMonthDay, isDateOnly, isUtcIso, toUtcIso } from './planTime.js'

export const DURATIONS = [10, 20, 40]
export const DEFAULT_MINUTES = 20
export const SHORT_MINUTES = 10
export const MAX_PICKS = null // no cap: a learner takes on what they can
export const PLAN_SCHEMA_VERSION = 1

export const SORT_MODES = [
  { id: 'due', label: '마감이 가까운 것부터' },
  { id: 'difficulty', label: '어려운 것부터' },
]

// ─── display helpers (Seoul) ─────────────────────────────────────────────

export {
  formatSeoulDateTime as formatSlotDateTime,
  formatSeoulSentence as formatSlotSentence,
  formatSeoulSlot as formatSlotLabel,
} from './planTime.js'

// ─── target dates ────────────────────────────────────────────────────────

// Counted back from the deadline in Seoul: the last step lands two days
// before it, each earlier step one day before the next. Returns 'YYYY-MM-DD'.
// A target already in the past is left as it is — that is what 계획 다시 짜기
// is for, and validation allows it.
export function stepTargetDate(assignment, stepIndex) {
  const due = seoulDateString(assignment?.dueAt)
  if (!due) return null
  const total = assignment.steps.length
  return addSeoulDays(due, -(2 + (total - 1 - stepIndex)))
}

// ─── the steps a learner can plan ────────────────────────────────────────

// How hard a step looks from the data we have: more completion criteria means
// more to satisfy, and a later step builds on the ones before it. There is no
// difficulty field in the assignment file, and this does not invent one — it
// is only an ordering for the '어려운 것부터' toggle.
function difficultyRank(step, stepIndex) {
  return step.completionCriteria.length * 10 + stepIndex
}

export function findStep(stepId) {
  for (const assignment of data.assignments) {
    const index = assignment.steps.findIndex((step) => step.id === stepId)
    if (index >= 0) return { assignment, step: assignment.steps[index], index }
  }
  return null
}

function rowFor(assignment, step, index) {
  const subject = subjectById(assignment.subjectId)
  return {
    stepId: step.id,
    stepTitle: step.title,
    stepNumber: index + 1,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    subjectId: assignment.subjectId,
    subjectName: subject?.name || '',
    colorToken: subject?.colorToken || '',
    dueAt: toUtcIso(assignment.dueAt),
    targetDate: stepTargetDate(assignment, index),
    difficulty: difficultyRank(step, index),
  }
}

export function planCandidates(stepCompletion) {
  const rows = []
  for (const assignment of data.assignments) {
    assignment.steps.forEach((step, index) => {
      if (stepCompletion[step.id]) return
      rows.push(rowFor(assignment, step, index))
    })
  }
  return rows
}

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

const AFTERNOON = 14 * 60

export function hasSchedule() {
  return Array.isArray(data.demoSchedule) && data.demoSchedule.length > 0
}

export function classesOn(weekday) {
  return (data.demoSchedule || []).filter((item) => item.dayOfWeek === weekday)
}

// Does a sitting of `minutes` starting at `startIso` run into a class?
export function classConflictAt(startIso, minutes) {
  const weekday = seoulWeekday(startIso)
  const start = seoulMinutesOfDay(startIso)
  if (weekday === null || start === null) return null
  const end = start + minutes
  return (
    classesOn(weekday).find(
      (item) => start < clockMinutes(item.end) && end > clockMinutes(item.start),
    ) || null
  )
}

function freeHoursOn(dateString, now) {
  const weekday = seoulWeekday(fromSeoulDate(dateString, 12))
  const busy = classesOn(weekday)
  const hours = []
  for (let minutes = DAY_START; minutes + 60 <= DAY_END; minutes += 60) {
    const taken = busy.some((item) => minutes < clockMinutes(item.end) && minutes + 60 > clockMinutes(item.start))
    if (taken) continue
    const at = fromSeoulDate(dateString, Math.floor(minutes / 60), minutes % 60)
    if (!at || at.getTime() <= toDate(now).getTime()) continue
    hours.push({ minutes, at })
  }
  return hours
}

// Weekday hours the timetable leaves empty, from now on, over this week and
// the next.
//
// Offered a day at a time rather than as a wall of consecutive hours: one
// earlier hour and one after lunch per day first, so the choice reads as
// "which day". Only when more are asked for than that gives — a learner who
// took on many steps this week — are the remaining hours added, still in day
// order.
export function freeSlots(now = new Date(), wanted = 8) {
  const monday = seoulMondayOf(now)
  if (!monday) return []

  const byDay = []
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const dateString = addSeoulDays(monday, dayOffset)
    const weekday = seoulWeekday(fromSeoulDate(dateString, 12))
    if (weekday === 0 || weekday === 6) continue // the timetable is 월–금
    const hours = freeHoursOn(dateString, now)
    if (hours.length > 0) byDay.push(hours)
  }

  const taken = new Set()
  const slots = []
  const add = (hour) => {
    const id = hour.at.toISOString()
    if (taken.has(id)) return
    taken.add(id)
    slots.push({ id, date: hour.at })
  }

  for (const hours of byDay) add(hours[0])
  for (const hours of byDay) {
    const afternoon = hours.find((hour) => hour.minutes >= AFTERNOON)
    if (afternoon) add(afternoon)
  }
  if (slots.length < wanted) {
    for (const hours of byDay) for (const hour of hours) add(hour)
  }

  return slots.sort((a, b) => a.date - b.date).slice(0, Math.max(wanted, 1))
}

// How far ahead a plan may reach: from now to the end of next week, in Seoul.
// freeSlots never offers anything outside it, and validation enforces it.
export function planningWindow(now = new Date()) {
  const monday = seoulMondayOf(now)
  const lastDay = monday ? addSeoulDays(monday, 13) : null
  const end = lastDay ? fromSeoulDate(lastDay, 23, 59) : null
  return {
    startIso: toUtcIso(now),
    endIso: end ? new Date(end.getTime() + 59999).toISOString() : null,
  }
}

// ─── PlanProposal ────────────────────────────────────────────────────────

// What a planner hands over. Three fields, nothing it could copy wrongly.
export function createProposalEntry({ stepId, scheduledAt, minutes }) {
  return { stepId, scheduledAt: toUtcIso(scheduledAt) || scheduledAt, minutes }
}

export function createProposal(entries = []) {
  return { entries: entries.map(createProposalEntry) }
}

export function proposalEntriesOf(proposal) {
  return Array.isArray(proposal?.entries) ? proposal.entries : []
}

// ─── Plan Document ───────────────────────────────────────────────────────

// Hydrates one proposal entry from the assignment data. Returns null when the
// stepId is not in that data; validation reports it as an error.
export function hydrateEntry(proposalEntry) {
  const found = findStep(proposalEntry?.stepId)
  if (!found) return null
  const row = rowFor(found.assignment, found.step, found.index)
  return {
    stepId: row.stepId,
    assignmentId: row.assignmentId,
    assignmentTitle: row.assignmentTitle,
    subjectId: row.subjectId,
    subjectName: row.subjectName,
    colorToken: row.colorToken,
    stepNumber: row.stepNumber,
    stepTitle: row.stepTitle,
    targetDate: row.targetDate,
    dueAt: row.dueAt,
    scheduledAt: toUtcIso(proposalEntry.scheduledAt) || proposalEntry.scheduledAt,
    minutes: proposalEntry.minutes,
  }
}

export function sortEntries(entries) {
  return entries.slice().sort((a, b) => {
    const left = toDate(a.scheduledAt)?.getTime() ?? 0
    const right = toDate(b.scheduledAt)?.getTime() ?? 0
    return left - right
  })
}

// Builds the stored document from a proposal. Entries whose stepId is unknown
// are kept with the fields the proposal gave, so validation can name them
// rather than them vanishing silently.
export function buildPlan(proposal, { source = 'mock', review = {}, settings = {}, now = new Date() } = {}) {
  const entries = proposalEntriesOf(proposal).map((entry) => hydrateEntry(entry) || { ...entry })
  return {
    schemaVersion: PLAN_SCHEMA_VERSION,
    source,
    createdAt: toUtcIso(now),
    weekOf: seoulMondayOf(now),
    review: { lastWeek: review.lastWeek ?? null, adjust: review.adjust ?? null },
    settings: {
      sortMode: settings.sortMode ?? 'due',
      maxPicks: settings.maxPicks ?? MAX_PICKS,
      defaultMinutes: settings.defaultMinutes ?? DEFAULT_MINUTES,
    },
    entries: sortEntries(entries),
  }
}

// A stored document back to the proposal it came from — what an agent would
// have had to produce. Used by validation and by 다시 정하기.
export function planToProposal(plan) {
  return createProposal(
    planEntriesOf(plan).map(({ stepId, scheduledAt, minutes }) => ({ stepId, scheduledAt, minutes })),
  )
}

export function planEntriesOf(plan) {
  return Array.isArray(plan?.entries) ? plan.entries : []
}

// 나의 할 일 and the home board read this: the planned steps gathered per
// subject. Nothing that was not planned appears.
export function planBySubject(plan, stepCompletion = {}) {
  const groups = []
  for (const entry of sortEntries(planEntriesOf(plan))) {
    let group = groups.find((item) => item.subjectId === entry.subjectId)
    if (!group) {
      group = {
        subjectId: entry.subjectId,
        subjectName: entry.subjectName,
        colorToken: entry.colorToken,
        assignmentId: entry.assignmentId,
        assignmentTitle: entry.assignmentTitle,
        dueAt: entry.dueAt,
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

// 'done' | 'waiting' | 'missed'. 'missed' only means the hour set aside has
// gone by and the step is not ticked — never phrased as a failure.
export function entryStatus(entry, stepCompletion, now = new Date()) {
  if (stepCompletion[entry.stepId]) return 'done'
  const at = toDate(entry.scheduledAt)
  return at && at.getTime() < toDate(now).getTime() ? 'missed' : 'waiting'
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
