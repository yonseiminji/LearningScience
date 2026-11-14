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
    max: 10,
  },
]

export const DEFAULT_LEVEL = 'medium'

export function levelById(id) {
  return CHUNK_LEVELS.find((level) => level.id === id) || null
}

export const INPUT_ERROR = '과제 정보를 읽지 못했어요. JSON 형식과 필수 항목을 확인한 뒤 다시 업로드해 주세요.'

// ─── what the learner uploads ────────────────────────────────────────────

const ISO_LIKE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/

function filled(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Checks an uploaded assignment JSON. Returns `{ ok, assignment, errors }`.
 *
 * `errors` names the field at fault so the screen can say more than that
 * something was wrong. A null dueAt is not a fault: an assignment with no
 * stated deadline stays without one rather than being given an invented date.
 */
export function parseAssignmentInput(text) {
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, assignment: null, errors: [{ field: null, message: 'JSON 형식이 올바르지 않아요.' }] }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, assignment: null, errors: [{ field: null, message: '가장 바깥이 객체 하나여야 해요.' }] }
  }

  const errors = []
  const need = (field, label) => {
    if (!(field in raw)) errors.push({ field, message: `${label}이(가) 없어요.` })
    else if (!filled(raw[field])) errors.push({ field, message: `${label}이(가) 비어 있어요.` })
  }
  need('subjectName', '과목 이름')
  need('assignmentTitle', '과제 제목')
  need('instruction', '과제 지시문')

  if (!('requirements' in raw)) {
    errors.push({ field: 'requirements', message: '요구사항이 없어요.' })
  } else if (!Array.isArray(raw.requirements)) {
    errors.push({ field: 'requirements', message: '요구사항은 문자열 배열이어야 해요.' })
  } else if (raw.requirements.length === 0) {
    errors.push({ field: 'requirements', message: '요구사항이 하나 이상 있어야 해요.' })
  } else if (!raw.requirements.every(filled)) {
    errors.push({ field: 'requirements', message: '비어 있는 요구사항이 있어요.' })
  }

  if (!('dueAt' in raw)) {
    errors.push({ field: 'dueAt', message: '마감일 항목이 없어요. 없다면 null로 적어 주세요.' })
  } else if (raw.dueAt !== null) {
    if (typeof raw.dueAt !== 'string' || !ISO_LIKE.test(raw.dueAt) || Number.isNaN(Date.parse(raw.dueAt))) {
      errors.push({ field: 'dueAt', message: '마감일이 날짜 형식이 아니에요. 없다면 null로 적어 주세요.' })
    }
  }

  if (errors.length > 0) return { ok: false, assignment: null, errors }

  return {
    ok: true,
    errors: [],
    assignment: {
      subjectName: raw.subjectName.trim(),
      assignmentTitle: raw.assignmentTitle.trim(),
      instruction: raw.instruction.trim(),
      requirements: raw.requirements.map((item) => item.trim()),
      dueAt: raw.dueAt === null ? null : raw.dueAt,
    },
  }
}

// ─── what the model sends back ───────────────────────────────────────────

const DATE_IN_TEXT = /\d{1,4}\s*[년/.-]\s*\d{1,2}\s*[월/.-]\s*\d{1,2}|\d{4}-\d{2}-\d{2}|\d{1,2}월\s*\d{1,2}일/

/**
 * Checks generated steps against the request they came from.
 *
 * Two of these cannot be settled by inspection — whether every requirement is
 * covered, and whether a submission condition was invented — so they come back
 * as warnings for the learner to judge, not as rejections. Everything that CAN
 * be decided mechanically is decided here and rejected.
 */
export function verifySteps(rawSteps, { level, instruction = '', requirements = [] }) {
  const want = levelById(level)
  const errors = []
  const warnings = []

  if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
    return { ok: false, steps: [], errors: ['단계를 하나도 받지 못했어요.'], warnings }
  }

  const seen = new Set()
  const steps = []
  rawSteps.forEach((step, index) => {
    const title = typeof step?.title === 'string' ? step.title.trim() : ''
    const description = typeof step?.description === 'string' ? step.description.trim() : ''
    if (!title) {
      errors.push(`${index + 1}번째 단계에 제목이 없어요.`)
      return
    }
    if (!description) {
      errors.push(`'${title}' 단계에 설명이 없어요.`)
      return
    }
    const key = title.replace(/\s+/g, '')
    if (seen.has(key)) {
      errors.push(`'${title}' 단계가 중복돼요.`)
      return
    }
    seen.add(key)
    steps.push({
      title,
      description,
      prerequisiteTip: typeof step?.prerequisiteTip === 'string' ? step.prerequisiteTip.trim() : '',
      criteria: Array.isArray(step?.completionCriteria)
        ? step.completionCriteria.filter(filled).map((text) => text.trim()).slice(0, 3)
        : [],
      requirementIndexes: Array.isArray(step?.requirementIndexes)
        ? step.requirementIndexes.filter((n) => Number.isInteger(n) && n >= 0 && n < requirements.length)
        : [],
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
    const text = `${step.title} ${step.description}`
    const found = text.match(DATE_IN_TEXT)
    if (found && !instruction.includes(found[0])) {
      warnings.push(`‘${step.title}’에 과제 지시문에 없는 날짜가 있어요. 확인해 주세요.`)
    }
  }

  const covered = new Set(steps.flatMap((step) => step.requirementIndexes))
  const missing = requirements.map((text, index) => ({ text, index })).filter(({ index }) => !covered.has(index))
  if (missing.length > 0) {
    warnings.push(`요구사항 ${missing.length}개가 어느 단계에도 연결되지 않았어요: ${missing.map((m) => m.text).join(', ')}`)
  }

  return { ok: errors.length === 0, steps, errors, warnings }
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
    requirementIndexes: [],
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
