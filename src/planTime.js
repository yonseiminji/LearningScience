// Time for the planner: stored in UTC, reasoned about in Asia/Seoul.
//
// Every timestamp that leaves this app is UTC ISO 8601 with milliseconds
// (`2026-11-13T02:00:00.000Z`). Every date, weekday and week boundary is
// worked out in Asia/Seoul, whatever timezone the browser happens to be in,
// and every clock face a learner reads is Seoul too.
//
// Korea has no daylight saving and has been fixed at +09:00 since 1988, so a
// constant offset is exact here. It is written once, below, rather than left
// implicit in Date's local-time getters.
//
// Pure: no React, no DOM. The backend can run these unchanged.

export const SEOUL_OFFSET_MINUTES = 9 * 60
export const SEOUL_TIME_ZONE = 'Asia/Seoul'

const MINUTE_MS = 60000
const DAY_MS = 86400000
const UTC_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

// ─── parsing and shape ───────────────────────────────────────────────────

export function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof value !== 'string' || value === '') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isUtcIso(value) {
  return typeof value === 'string' && UTC_ISO.test(value) && toDate(value) !== null
}

export function isDateOnly(value) {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false
  // rejects 2026-02-30 and friends: the calendar has to agree
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

// Any accepted timestamp written the one way we store it. `+09:00` input from
// the assignment file comes out as the same instant in UTC.
export function toUtcIso(value) {
  const date = toDate(value)
  return date ? date.toISOString() : null
}

// ─── reading a timestamp as Seoul wall-clock ─────────────────────────────

function seoulShifted(value) {
  const date = toDate(value)
  return date ? new Date(date.getTime() + SEOUL_OFFSET_MINUTES * MINUTE_MS) : null
}

export function seoulFields(value) {
  const shifted = seoulShifted(value)
  if (!shifted) return null
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  }
}

export function seoulDateString(value) {
  const f = seoulFields(value)
  if (!f) return null
  return `${f.year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`
}

export function seoulWeekday(value) {
  return seoulFields(value)?.weekday ?? null
}

export function seoulMinutesOfDay(value) {
  const f = seoulFields(value)
  return f ? f.hour * 60 + f.minute : null
}

export function seoulClock(value) {
  const f = seoulFields(value)
  if (!f) return ''
  return `${String(f.hour).padStart(2, '0')}:${String(f.minute).padStart(2, '0')}`
}

// ─── building a timestamp from Seoul wall-clock ──────────────────────────

export function fromSeoul(year, month, day, hour = 0, minute = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - SEOUL_OFFSET_MINUTES * MINUTE_MS)
}

// 'YYYY-MM-DD' plus a Seoul time of day, as an instant.
export function fromSeoulDate(dateString, hour = 0, minute = 0) {
  if (!isDateOnly(dateString)) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return fromSeoul(year, month, day, hour, minute)
}

export function addSeoulDays(dateString, days) {
  const start = fromSeoulDate(dateString, 12) // midday, so a shift cannot slip a day
  if (!start) return null
  return seoulDateString(new Date(start.getTime() + days * DAY_MS))
}

// Monday of the Seoul week a given instant falls in, as 'YYYY-MM-DD'.
export function seoulMondayOf(value) {
  const date = seoulDateString(value)
  if (!date) return null
  const weekday = seoulWeekday(value) // 0 = Sunday
  const back = (weekday + 6) % 7
  return addSeoulDays(date, -back)
}

// ─── display ─────────────────────────────────────────────────────────────

// '금 11:00', or '다음 주 월 09:00' when it falls in the week after `now`.
export function formatSeoulSlot(value, now = new Date()) {
  const f = seoulFields(value)
  if (!f) return ''
  return `${nextWeekPrefix(value, now)}${DAY_NAMES[f.weekday]} ${seoulClock(value)}`
}

// '금요일 11시' — the spoken form 곰곰이 uses when confirming.
export function formatSeoulSentence(value, now = new Date()) {
  const f = seoulFields(value)
  if (!f) return ''
  const clock = f.minute === 0 ? `${f.hour}시` : `${f.hour}시 ${f.minute}분`
  return `${nextWeekPrefix(value, now)}${DAY_NAMES[f.weekday]}요일 ${clock}`
}

function nextWeekPrefix(value, now) {
  const monday = seoulMondayOf(now)
  const nextMonday = monday ? addSeoulDays(monday, 7) : null
  const date = seoulDateString(value)
  return nextMonday && date && date >= nextMonday ? '다음 주 ' : ''
}

export function formatMonthDay(value) {
  const f = seoulFields(value) || dateOnlyFields(value)
  return f ? `${f.month}/${f.day}` : ''
}

export function formatKoreanDate(value) {
  const f = seoulFields(value) || dateOnlyFields(value)
  return f ? `${f.month}월 ${f.day}일` : ''
}

// 'YYYY-MM-DD' is a calendar date, not an instant: read it as written rather
// than as UTC midnight, which would shift it a day in Seoul.
function dateOnlyFields(value) {
  if (!isDateOnly(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

export function dateOnly(value) {
  return dateOnlyFields(value)
}
