/** True only for the bundled sample. Anything else is outside this demo. */
export function isSampleInstruction(input, task) {
  return input.trim() === task.original_instruction.trim()
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
    .sort((a, b) => a.index - b.index)

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
