// The 곰곰이 planning conversation, read from data rather than written into
// the screen.
//
// Today the answers come from src/data/planAgent.mock.json. The seam is the
// agent interface below: a turn names what to say, which widget collects the
// answer, and where each answer leads. Swapping the mock for a real agent means
// replacing `script` with a response of the same shape — the screen asks the
// agent for a turn and never holds the wording itself.

import script from './data/planAgent.mock.json'

export const PLAN_AGENT_SOURCE = script.source
export const PLAN_AGENT_TITLE = script.title

// Fills {name} placeholders. Values are plain strings the screen already has.
export function fill(template, values = {}) {
  if (typeof template !== 'string') return ''
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match))
}

export function firstTurnId(hasPlanned) {
  return hasPlanned ? script.start.returning : script.start.firstTime
}

export function getTurn(id) {
  return script.turns[id] || null
}

export function optionById(turnId, optionId) {
  return getTurn(turnId)?.options?.find((option) => option.id === optionId) || null
}

// What an answer changes, beyond moving to the next turn. Keeping this in the
// data means '시간을 더 짧게' can start at 10 minutes without the screen
// knowing why.
export function effectsOf(turnId, optionId) {
  return optionById(turnId, optionId)?.effect || {}
}

export function nextTurnId(turnId, optionId) {
  const option = optionById(turnId, optionId)
  return option?.next || getTurn(turnId)?.next || null
}

export function labelOf(turnId, optionId) {
  return optionById(turnId, optionId)?.label || ''
}
