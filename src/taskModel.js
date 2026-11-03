/** True only for the bundled sample. Anything else is outside this demo. */
export function isSampleInstruction(input, task) {
  return input.trim() === task.original_instruction.trim()
}

const FORMAT_LABELS = {
  length: '분량',
  font_size: '글자 크기',
  font_family: '글꼴',
}

/**
 * Phrases drawn from the task payload that can be marked in the instruction.
 * A phrase is only marked later if it actually occurs in the source text.
 */
export function signalPhrases(task) {
  const requirements = task.requirements || {}
  const phrases = []

  if (Array.isArray(requirements.content)) {
    requirements.content.forEach((text, index) => {
      if (typeof text === 'string' && text) {
        phrases.push({ id: `content-${index}`, text, label: '내용' })
      }
    })
  }

  if (requirements.format && typeof requirements.format === 'object') {
    for (const [key, text] of Object.entries(requirements.format)) {
      if (typeof text === 'string' && text) {
        phrases.push({
          id: `format-${key}`,
          text,
          label: FORMAT_LABELS[key] || key,
        })
      }
    }
  }

  if (typeof requirements.deadline?.display === 'string' && requirements.deadline.display) {
    phrases.push({
      id: 'deadline',
      text: requirements.deadline.display,
      label: '마감',
    })
  }

  return phrases
}

/** Formatting rows for the requirement section. Labels are UI names; values come from the task. */
export function formatRows(task) {
  const format = task.requirements?.format || {}
  return Object.entries(format)
    .filter(([, value]) => typeof value === 'string' && value)
    .map(([key, value]) => ({
      id: key,
      label: FORMAT_LABELS[key] || key,
      value,
    }))
}

/** Short note derived from the deadline flag. Empty when the payload does not say. */
export function deadlineNote(deadline) {
  if (!deadline || typeof deadline.late_submission_allowed !== 'boolean') return ''
  return deadline.late_submission_allowed
    ? '늦은 제출이 가능합니다.'
    : '늦은 제출은 받지 않습니다.'
}

export function stepsForLevel(task, level) {
  return task.support_levels?.[level]?.steps ?? []
}

/** Action text of a prerequisite step, when the payload names one. */
export function prerequisiteAction(steps, step) {
  if (!step?.prerequisite) return ''
  const prior = steps.find((item) => item.id === step.prerequisite)
  return prior?.action || ''
}

/**
 * Split the instruction on requirement phrases from the task payload.
 * Labels travel with the phrase so highlighting is not colour alone.
 * Phrases that are not in the instruction are returned as `missing`.
 */
export function segmentInstruction(instruction, requirements) {
  const hits = requirements
    .map((requirement) => ({
      ...requirement,
      index: instruction.indexOf(requirement.text),
    }))
    .filter((requirement) => requirement.index >= 0)
    .sort((a, b) => a.index - b.index || b.text.length - a.text.length)

  const segments = []
  let cursor = 0

  for (const requirement of hits) {
    if (requirement.index < cursor) continue
    if (requirement.index > cursor) {
      segments.push({
        type: 'text',
        text: instruction.slice(cursor, requirement.index),
      })
    }
    segments.push({
      type: 'requirement',
      id: requirement.id,
      text: requirement.text,
      label: requirement.label,
    })
    cursor = requirement.index + requirement.text.length
  }

  if (cursor < instruction.length) {
    segments.push({ type: 'text', text: instruction.slice(cursor) })
  }

  const found = new Set(
    segments.filter((segment) => segment.type === 'requirement').map((segment) => segment.id),
  )

  return {
    segments,
    missing: requirements.filter((requirement) => !found.has(requirement.id)),
  }
}

/**
 * Share of steps the student has marked done.
 * The open step does not count until it is completed.
 */
export function completionPercent(steps, completedIds) {
  if (!steps.length) return 0
  const done = steps.filter((step) => completedIds.includes(step.id)).length
  return Math.round((done / steps.length) * 100)
}

export function completedCount(steps, completedIds) {
  return steps.filter((step) => completedIds.includes(step.id)).length
}
