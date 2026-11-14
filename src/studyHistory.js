import { seoulDateString } from './planTime.js'

// The most recent study activity per subject, kept in the browser.
//
// What this records is WHAT was studied, never how well. A topic tag comes
// from the lecture chunks the learner chose, not from whether they answered
// correctly, and nothing here should be read as a measure of understanding.
//
// Only the tag and the chunk ids are kept. The model's text and the learner's
// answers stay where they were and are not written to storage.
const KEY = 'chagok.studyHistory.v1'

export const ACTIVITY = {
  quizAnswer: 'quiz_answer',
  tutorSupport: 'tutor_support',
}

function storage() {
  try {
    return window.localStorage
  } catch {
    // private mode, disabled storage, or no window at all
    return null
  }
}

/** Every subject's latest record, keyed by subjectId. `{}` when there is none. */
export function readStudyHistory() {
  const store = storage()
  if (!store) return {}
  try {
    const parsed = JSON.parse(store.getItem(KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function writeStudyHistory(history) {
  const store = storage()
  if (!store) return
  try {
    store.setItem(KEY, JSON.stringify(history))
  } catch {
    // a full or refused quota is not worth interrupting the lesson over
  }
}

/**
 * Records one completed activity and returns the whole history.
 *
 * `studiedAt` is the moment this is called, which is the moment the learner
 * finished something — not when the quiz was generated. A quiz made and left
 * unanswered never reaches here.
 *
 * An empty or missing tag is kept empty. The card has wording for a visit
 * with no named topic, and inventing one would put words in the lecture's
 * mouth.
 */
export function recordStudy({ subjectId, topicTag, activityType, sourceChunkIds = [] }) {
  if (!subjectId) return readStudyHistory()
  const tag = typeof topicTag === 'string' ? topicTag.trim() : ''
  const record = {
    subjectId,
    lastStudiedAt: new Date().toISOString(),
    lastStudiedContent: tag.slice(0, 60),
    activityType: activityType === ACTIVITY.tutorSupport ? ACTIVITY.tutorSupport : ACTIVITY.quizAnswer,
    sourceChunkIds: Array.isArray(sourceChunkIds) ? sourceChunkIds.filter((id) => typeof id === 'string').slice(0, 8) : [],
  }
  const history = { ...readStudyHistory(), [subjectId]: record }
  writeStudyHistory(history)
  return history
}

/** Whole days between two instants, by Asia/Seoul calendar date. */
export function seoulDaysSince(iso, now = new Date()) {
  const then = seoulDateString(iso)
  const today = seoulDateString(now)
  if (!then || !today) return null
  const diff = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${then}T00:00:00Z`)) / 86400000)
  return Number.isFinite(diff) ? diff : null
}

/**
 * The lines the lecture card shows. First the when, then the what — and the
 * what only when the tag is there to say it.
 */
export function studyLines(record, now = new Date()) {
  if (!record?.lastStudiedAt) return ['아직 공부한 기록이 없어요. 같이 시작해볼까요?']
  const days = seoulDaysSince(record.lastStudiedAt, now)
  const lines = []
  // A record dated ahead of today means a clock moved; treat it as today
  // rather than announcing a negative number of days.
  if (days === null || days <= 0) lines.push('오늘 함께 공부했어요.')
  else lines.push(`마지막으로 공부한 지 ${days}일이 지났어요.`)
  if (record.lastStudiedContent) lines.push(`${record.lastStudiedContent}까지 같이 공부했어요.`)
  return lines
}
