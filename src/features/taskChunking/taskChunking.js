// Task chunking: an assignment instruction turned into steps the learner can
// start on, at a granularity they choose.
//
// Everything here is pure. The model lives behind /api/tutor/chunk, the
// registry lives in assignmentModel, and the screen holds the selection. This
// file only decides what is valid and what shape things take, so the same
// rules apply on the way in from an upload and on the way out to a plan.

export const CHUNK_LEVELS = [
  {
    id: 'low',
    label: '단계 적게',
    blurb: '큰 단계로 간단하게 나눠요. 과제의 전체 흐름을 보고 싶을 때 추천해요.',
    min: 3,
    max: 4,
  },
  {
    id: 'medium',
    label: '단계 중간',
    blurb: '해야 할 일을 적당한 크기로 나눠요. 어디서부터 시작할지 고민될 때 추천해요.',
    min: 5,
    max: 6,
  },
  {
    id: 'high',
    label: '단계 많이',
    blurb: '작은 행동으로 자세하게 나눠요. 과제를 시작하기 막막할 때 추천해요.',
    min: 7,
    max: 8,
  },
]

export const DEFAULT_LEVEL = 'medium'

export function levelById(id) {
  return CHUNK_LEVELS.find((level) => level.id === id) || null
}

export const INPUT_ERROR = '과제 단계를 만들지 못했어요. 다시 시도해 주세요.'

export const MAX_INSTRUCTION = 6000

// ─── what the learner types ──────────────────────────────────────────────

function filled(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Checks the instruction before any model call. Returns `{ ok, instruction,
 * errors }`. There is no JSON to parse now — the learner pastes the
 * assignment as their lecturer wrote it.
 */
export function parseInstruction(text, { subjectName } = {}) {
  const errors = []
  const clean = typeof text === 'string' ? text.trim() : ''
  if (!clean) errors.push({ field: 'instruction', message: '과제 지시문을 입력해 주세요.' })
  else if (clean.length < 10) errors.push({ field: 'instruction', message: '지시문이 너무 짧아요. 과제 내용을 조금 더 적어 주세요.' })
  else if (clean.length > MAX_INSTRUCTION) {
    errors.push({ field: 'instruction', message: `지시문은 ${MAX_INSTRUCTION}자까지 넣을 수 있어요. 지금은 ${clean.length}자예요.` })
  }
  if (subjectName !== undefined && !filled(subjectName)) {
    errors.push({ field: 'subject', message: '과목을 고르거나 새 과목 이름을 적어 주세요.' })
  }
  return { ok: errors.length === 0, instruction: clean, errors }
}

// ─── what the model sends back ───────────────────────────────────────────

const DATE_IN_TEXT = /\d{1,4}\s*[년/.-]\s*\d{1,2}\s*[월/.-]\s*\d{1,2}|\d{4}-\d{2}-\d{2}|\d{1,2}월\s*\d{1,2}일/

/**
 * Checks a whole chunking result against the request it came from.
 *
 * Rejected outright: anything decidable by inspection — missing titles or
 * descriptions, duplicate step ids, requirement ids pointing at nothing.
 *
 * Returned as warnings: a step count outside the chosen range, a date absent
 * from the instruction, a requirement no step carries. Those are judgements
 * about meaning that a schema check cannot settle, and the learner is the one
 * who can see whether they matter.
 */
export function verifyChunkResult(data, { level, instruction = '' }) {
  const want = levelById(level)
  const errors = []
  const warnings = []

  const rawRequirements = Array.isArray(data?.assignment?.requirements) ? data.assignment.requirements : []
  const requirements = rawRequirements
    .filter((item) => filled(item?.requirementId) && filled(item?.text))
    .map((item) => ({ requirementId: item.requirementId.trim(), text: item.text.trim() }))
  if (requirements.length === 0) errors.push('과제 요구사항을 읽지 못했어요.')

  const known = new Set(requirements.map((item) => item.requirementId))
  const rawSteps = Array.isArray(data?.steps) ? data.steps : []
  if (rawSteps.length === 0) {
    return { ok: false, steps: [], requirements, errors: ['단계를 하나도 받지 못했어요.'], warnings, title: '', dueAt: null }
  }

  const seenIds = new Set()
  const seenTitles = new Set()
  const steps = []
  rawSteps.forEach((step, index) => {
    const title = typeof step?.title === 'string' ? step.title.trim() : ''
    const description = typeof step?.description === 'string' ? step.description.trim() : ''
    const stepId = typeof step?.stepId === 'string' ? step.stepId.trim() : ''
    if (!title) {
      errors.push(`${index + 1}번째 단계에 제목이 없어요.`)
      return
    }
    if (!description) {
      errors.push(`‘${title}’ 단계에 설명이 없어요.`)
      return
    }
    if (stepId && seenIds.has(stepId)) {
      errors.push(`단계 ID가 겹쳐요: ${stepId}`)
      return
    }
    const titleKey = title.replace(/\s+/g, '')
    if (seenTitles.has(titleKey)) {
      errors.push(`‘${title}’ 단계가 중복돼요.`)
      return
    }
    if (stepId) seenIds.add(stepId)
    seenTitles.add(titleKey)

    const ids = Array.isArray(step?.requirementIds) ? step.requirementIds.filter((id) => typeof id === 'string') : []
    const unknown = ids.filter((id) => !known.has(id))
    if (unknown.length > 0) {
      warnings.push(`‘${title}’이(가) 없는 요구사항을 가리켜요: ${unknown.join(', ')}`)
    }
    steps.push({
      stepId,
      title,
      description,
      prerequisiteTip: '',
      criteria: [],
      requirementIds: ids.filter((id) => known.has(id)),
    })
  })

  if (steps.length === 0) errors.push('쓸 수 있는 단계가 남지 않았어요.')
  if (want && steps.length > 0 && (steps.length < want.min || steps.length > want.max)) {
    warnings.push(`‘${want.label}’은 보통 ${want.min}~${want.max}단계인데 ${steps.length}단계가 만들어졌어요.`)
  }

  // A date in a step that is nowhere in the instruction was not taken from the
  // assignment. Flagged rather than dropped: the learner can see the step and
  // decide, and a step is not worthless for carrying one wrong clause.
  for (const step of steps) {
    const found = `${step.title} ${step.description}`.match(DATE_IN_TEXT)
    if (found && !instruction.includes(found[0])) {
      warnings.push(`‘${step.title}’에 과제 지시문에 없는 날짜가 있어요. 확인해 주세요.`)
    }
  }

  const covered = new Set(steps.flatMap((step) => step.requirementIds))
  const missing = requirements.filter((item) => !covered.has(item.requirementId))
  if (missing.length > 0) {
    warnings.push(`요구사항 ${missing.length}개가 어느 단계에도 연결되지 않았어요: ${missing.map((m) => m.text).join(', ')}`)
  }

  return {
    ok: errors.length === 0,
    steps,
    requirements,
    errors,
    warnings,
    title: String(data?.assignment?.assignmentTitle || '').trim(),
    dueAt: data?.assignment?.dueAt || null,
  }
}

/** Which requirements lose their only step when `kept` is what gets applied. */
export function droppedRequirements(allSteps, kept, requirements) {
  const keptKeys = new Set(kept.map((row) => row.key))
  const covered = new Set(allSteps.filter((row) => keptKeys.has(row.key)).flatMap((row) => row.requirementIds || []))
  return requirements.filter((item) => !covered.has(item.requirementId))
}

// ─── turning them into Assignment.steps[] ────────────────────────────────

export function slugify(text) {
  const ascii = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return ascii || `tc${Date.now().toString(36)}`
}

function criterion(id, text) {
  return {
    id,
    text,
    inputLabel: '완료되었나요?',
    placeholder: '',
    inputType: 'text',
    required: false,
  }
}

/**
 * Gives a generated step the shape the rest of the app already reads.
 *
 * When the model offered no completion criteria, one is built from the step's
 * own title. That is structure, not content: it asks whether the step is done
 * and invents no detail about what doing it would involve.
 */
export function toAssignmentStep(step, { prefix, index, source = 'gemini' }) {
  const id = `${prefix}-s${index + 1}`
  const criteria = step.criteria?.length
    ? step.criteria.map((text, at) => criterion(`${id}-c${at + 1}`, text))
    : [criterion(`${id}-c1`, `‘${step.title}’을 마쳤나요?`)]
  return {
    id,
    title: step.title,
    description: step.description,
    prerequisiteTip: step.prerequisiteTip || '',
    completionCriteria: criteria,
    source,
  }
}

/** A step the learner typed. No description is invented for it. */
export function userStep(title) {
  const clean = String(title || '').trim()
  if (!clean) return null
  return {
    title: clean,
    description: '직접 추가한 단계예요.',
    prerequisiteTip: '',
    criteria: [],
    requirementIds: [],
    source: 'user',
  }
}

/**
 * Last gate before anything is written to the registry: ids unique and
 * present, titles and descriptions filled, at least one step.
 */
export function verifyFinalSteps(steps) {
  const errors = []
  if (!Array.isArray(steps) || steps.length === 0) return { ok: false, errors: ['단계를 하나 이상 골라 주세요.'] }
  const ids = new Set()
  for (const step of steps) {
    if (!filled(step?.id)) errors.push('단계 ID가 없어요.')
    else if (ids.has(step.id)) errors.push(`단계 ID가 겹쳐요: ${step.id}`)
    else ids.add(step.id)
    if (!filled(step?.title)) errors.push('제목이 없는 단계가 있어요.')
    if (!filled(step?.description)) errors.push(`‘${step?.title || '제목 없음'}’에 설명이 없어요.`)
    if (!Array.isArray(step?.completionCriteria) || step.completionCriteria.length === 0) {
      errors.push(`‘${step?.title || '제목 없음'}’에 완료 조건이 없어요.`)
    }
  }
  return { ok: errors.length === 0, errors }
}
