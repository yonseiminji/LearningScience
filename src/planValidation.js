// Everything a plan has to survive before it is stored.
//
// Two layers, on purpose:
//   1. JSON Schema — shape, types, allowed values (src/schemas/*.schema.json)
//   2. validatePlan — the things a schema cannot know: does this step exist,
//      is it already finished, does this hour collide with a class.
//
// The mock planner and a future LLM agent go through the same gate. Nothing
// here touches React, the DOM or storage, so the backend can run it unchanged
// when the agent moves server-side.
//
// Errors block the save. Warnings do not — they are shown and the learner
// decides. A missing timetable is neither: it is reported as a check that was
// skipped, so "no conflict" is never confused with "not looked at".

import proposalSchema from './schemas/planProposal.schema.json'
import documentSchema from './schemas/planDocument.schema.json'
import { validateAgainstSchema } from './jsonSchema.js'
import { classConflictAt, findStep, hasSchedule, planEntriesOf, planningWindow } from './weekPlan.js'
import { formatSeoulSlot, isDateOnly, isUtcIso, toDate } from './planTime.js'

export const PLAN_ERROR = {
  SCHEMA_INVALID: 'SCHEMA_INVALID',
  INVALID_TIMESTAMP: 'INVALID_TIMESTAMP',
  INVALID_DATE: 'INVALID_DATE',
  TOO_MANY_ENTRIES: 'TOO_MANY_ENTRIES',
  UNKNOWN_STEP: 'UNKNOWN_STEP',
  DUPLICATE_STEP: 'DUPLICATE_STEP',
  ALREADY_DONE: 'ALREADY_DONE',
  ENTRY_OVERLAP: 'ENTRY_OVERLAP',
  CLASS_CONFLICT: 'CLASS_CONFLICT',
  PAST_SCHEDULE: 'PAST_SCHEDULE',
  OUT_OF_WINDOW: 'OUT_OF_WINDOW',
}

export const PLAN_WARNING = {
  AFTER_DUE: 'AFTER_DUE',
}

export const CLASS_CHECK = {
  CHECKED: 'checked',
  SKIPPED_NO_TIMETABLE: 'skipped-no-timetable',
}

function nameOf(entry) {
  if (entry?.subjectName && entry?.stepNumber) return `${entry.subjectName} ${entry.stepNumber}단계`
  const found = findStep(entry?.stepId)
  if (found) {
    const subject = found.assignment.subjectId
    return `${subject} ${found.index + 1}단계`
  }
  return entry?.stepId ? `단계 ${entry.stepId}` : '단계'
}

function endOf(entry) {
  const start = toDate(entry.scheduledAt)
  if (!start) return null
  const minutes = Number.isFinite(entry.minutes) ? entry.minutes : 0
  return new Date(start.getTime() + minutes * 60000)
}

export function validateProposal(proposal) {
  const schema = validateAgainstSchema(proposal, proposalSchema)
  return {
    ok: schema.ok,
    errors: schema.errors.map((error) => ({
      code: PLAN_ERROR.SCHEMA_INVALID,
      path: error.path,
      message: `제안 형식이 맞지 않아요 (${error.path || '전체'}: ${error.message})`,
    })),
  }
}

/**
 * @param plan    Plan Document (the output of buildPlan)
 * @param context stepCompletion, now, previousPlan — entries already saved are
 *                exempt from the "not in the past" rule, because 계획 다시
 *                짜기 edits a plan whose hour has already gone by.
 */
export function validatePlan(plan, { stepCompletion = {}, now = new Date(), previousPlan = null } = {}) {
  const errors = []
  const warnings = []
  const entries = planEntriesOf(plan)
  const at = toDate(now) || new Date()

  // An entry whose stepId is not in the assignment data could not be filled
  // in, so every field buildPlan would have supplied is missing. Reporting
  // nine schema errors for it buries the one that matters, so those are left
  // to the reference check below.
  const unfilled = new Set()
  entries.forEach((entry, index) => {
    if (!findStep(entry.stepId)) unfilled.add(`/entries/${index}/`)
  })
  const fromUnfilledEntry = (path) =>
    typeof path === 'string' && [...unfilled].some((prefix) => path.startsWith(prefix))

  // 1. shape, types and allowed values
  const schema = validateAgainstSchema(plan, documentSchema)
  const schemaOkIgnoringUnfilled = schema.errors.every((error) => fromUnfilledEntry(error.path))
  for (const error of schema.errors) {
    if (fromUnfilledEntry(error.path)) continue
    errors.push({
      code: PLAN_ERROR.SCHEMA_INVALID,
      path: error.path,
      message: `계획 형식이 맞지 않아요 (${error.path || '전체'}: ${error.message})`,
    })
  }

  // 2. real dates and real instants, not just well-shaped strings
  if (plan?.createdAt && !isUtcIso(plan.createdAt)) {
    errors.push({ code: PLAN_ERROR.INVALID_TIMESTAMP, path: '/createdAt', message: '계획을 만든 시각이 올바르지 않아요.' })
  }
  if (plan?.weekOf && !isDateOnly(plan.weekOf)) {
    errors.push({ code: PLAN_ERROR.INVALID_DATE, path: '/weekOf', message: '주차 날짜가 실제 달력에 없는 날짜예요.' })
  }
  entries.forEach((entry, index) => {
    if (!isUtcIso(entry.scheduledAt)) {
      errors.push({
        code: PLAN_ERROR.INVALID_TIMESTAMP,
        stepId: entry.stepId,
        path: `/entries/${index}/scheduledAt`,
        message: `${nameOf(entry)}의 시간이 올바르지 않아요.`,
      })
    }
    if (entry.dueAt !== undefined && !isUtcIso(entry.dueAt) && !unfilled.has(`/entries/${index}/`)) {
      errors.push({
        code: PLAN_ERROR.INVALID_TIMESTAMP,
        stepId: entry.stepId,
        path: `/entries/${index}/dueAt`,
        message: `${nameOf(entry)}의 마감 시각이 올바르지 않아요.`,
      })
    }
    if (
      entry.targetDate !== null &&
      entry.targetDate !== undefined &&
      !isDateOnly(entry.targetDate) &&
      !unfilled.has(`/entries/${index}/`)
    ) {
      errors.push({
        code: PLAN_ERROR.INVALID_DATE,
        stepId: entry.stepId,
        path: `/entries/${index}/targetDate`,
        message: `${nameOf(entry)}의 목표일이 실제 달력에 없는 날짜예요.`,
      })
    }
  })

  // 3. no more steps than the week was set to hold
  const maxPicks = plan?.settings?.maxPicks
  if (Number.isFinite(maxPicks) && entries.length > maxPicks) {
    errors.push({
      code: PLAN_ERROR.TOO_MANY_ENTRIES,
      message: `이번 주에는 ${maxPicks}개까지 담기로 했는데 ${entries.length}개가 들어 있어요.`,
    })
  }

  // 4. the step has to exist, and 5. only once
  const seen = new Map()
  for (const entry of entries) {
    if (!findStep(entry.stepId)) {
      errors.push({
        code: PLAN_ERROR.UNKNOWN_STEP,
        stepId: entry.stepId,
        message: `‘${entry.stepId}’에 해당하는 단계를 과제에서 찾지 못했어요. 다시 골라 주세요.`,
      })
    }
    if (seen.has(entry.stepId)) {
      errors.push({
        code: PLAN_ERROR.DUPLICATE_STEP,
        stepId: entry.stepId,
        message: `${nameOf(entry)}가 두 번 들어 있어요. 하나만 남겨 주세요.`,
      })
    } else {
      seen.set(entry.stepId, entry)
    }
  }

  // 6. a step already ticked off does not go back into a plan
  for (const entry of entries) {
    if (stepCompletion[entry.stepId]) {
      errors.push({
        code: PLAN_ERROR.ALREADY_DONE,
        stepId: entry.stepId,
        message: `${nameOf(entry)}는 이미 끝낸 단계예요. 다른 단계를 골라 주세요.`,
      })
    }
  }

  // 7. two sittings must not run into each other
  const timed = entries
    .filter((entry) => toDate(entry.scheduledAt))
    .map((entry) => ({ entry, start: toDate(entry.scheduledAt), end: endOf(entry) }))
    .sort((a, b) => a.start - b.start)
  for (let i = 1; i < timed.length; i += 1) {
    const previous = timed[i - 1]
    const current = timed[i]
    if (current.start < previous.end) {
      errors.push({
        code: PLAN_ERROR.ENTRY_OVERLAP,
        stepId: current.entry.stepId,
        message: `${nameOf(previous.entry)}와 ${nameOf(current.entry)}의 시간이 겹쳐요. 한쪽을 다른 시간으로 옮겨 주세요.`,
      })
    }
  }

  // 8. and must not run into a registered class — unless there is no timetable
  const classCheck = hasSchedule() ? CLASS_CHECK.CHECKED : CLASS_CHECK.SKIPPED_NO_TIMETABLE
  if (classCheck === CLASS_CHECK.CHECKED) {
    for (const entry of entries) {
      if (!toDate(entry.scheduledAt)) continue
      const clash = classConflictAt(entry.scheduledAt, entry.minutes)
      if (clash) {
        errors.push({
          code: PLAN_ERROR.CLASS_CONFLICT,
          stepId: entry.stepId,
          message: `${nameOf(entry)}를 정한 시간에 수업(${clash.start}–${clash.end})이 있어요. 다른 시간으로 옮겨 주세요.`,
        })
      }
    }
  }

  // 9. a newly planned hour cannot be in the past. An hour already saved may
  //    be — that is exactly what 계획 다시 짜기 exists to fix.
  const already = new Set(
    planEntriesOf(previousPlan).map((entry) => `${entry.stepId}@${entry.scheduledAt}`),
  )
  for (const entry of entries) {
    const start = toDate(entry.scheduledAt)
    if (!start) continue
    const isNew = !already.has(`${entry.stepId}@${entry.scheduledAt}`)
    if (isNew && start.getTime() < at.getTime()) {
      errors.push({
        code: PLAN_ERROR.PAST_SCHEDULE,
        stepId: entry.stepId,
        message: `${nameOf(entry)}를 이미 지난 시간(${formatSeoulSlot(entry.scheduledAt, at)})에 잡았어요. 앞으로의 시간을 골라 주세요.`,
      })
    }
  }

  // 10. and has to fall inside the window the app plans over
  const window = planningWindow(at)
  const windowEnd = toDate(window.endIso)
  for (const entry of entries) {
    const start = toDate(entry.scheduledAt)
    if (!start || !windowEnd) continue
    if (start.getTime() > windowEnd.getTime()) {
      errors.push({
        code: PLAN_ERROR.OUT_OF_WINDOW,
        stepId: entry.stepId,
        message: `${nameOf(entry)}가 계획할 수 있는 기간(다음 주까지)을 넘었어요. 더 가까운 시간을 골라 주세요.`,
      })
    }
  }

  // a sitting after its own deadline is allowed, but worth saying out loud
  for (const entry of entries) {
    const start = toDate(entry.scheduledAt)
    const due = toDate(entry.dueAt)
    if (start && due && start.getTime() > due.getTime()) {
      warnings.push({
        code: PLAN_WARNING.AFTER_DUE,
        stepId: entry.stepId,
        message: `${nameOf(entry)}를 정한 시간이 과제 마감 뒤예요. 마감 전으로 옮기는 게 좋아요.`,
      })
    }
  }

  const blockedSteps = [...new Set(errors.map((error) => error.stepId).filter(Boolean))]

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    blockedSteps,
    checks: {
      schema: schemaOkIgnoringUnfilled ? 'pass' : 'fail',
      references: errors.some((e) => e.code === PLAN_ERROR.UNKNOWN_STEP) ? 'fail' : 'pass',
      conflicts: errors.some((e) => e.code === PLAN_ERROR.ENTRY_OVERLAP || e.code === PLAN_ERROR.CLASS_CONFLICT)
        ? 'fail'
        : 'pass',
      classConflict: classCheck,
    },
    unsupportedSchemaKeywords: schema.unsupportedKeywords,
  }
}
