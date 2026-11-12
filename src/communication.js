// 소통 준비하기: helping a learner put a question into words they can send.
//
// Every question 곰곰이 asks, every choice, every prepared sentence lives in
// src/data/communication.mock.json. This module reads that file and returns a
// CommunicationDraft; it holds no copy of its own and touches no React.
//
// The seam for a real model is generateDraft() below. A Communication Agent
// returning the same CommunicationDraft from the same inputs changes nothing
// above it — docs/Commu_SysPrompt.txt is the prompt it would run.
//
// What this generator will not do: it does not read, summarise or answer the
// learner's free text, because there is no model behind it. When the text is
// their own rather than one of the prepared examples, the sentence is a
// template wrapped around their words, and the panel says so. Nothing is
// added that the learner did not supply — no name, no student number, no time
// they did not agree.

import mock from './data/communication.mock.json'

export const COMMUNICATION_SOURCE = mock.mode // 'mock' today
export const COPY = mock.copy
export const STEPS = mock.steps
export const INFORMATION_STATES = mock.copy.informationStates
export const INFORMATION_STATE_LABELS = mock.copy.informationStateLabels

// Where the text in the box came from. The generator branches on it, and the
// panel never calls a prepared sentence a reading of something the learner
// typed themselves.
export const CONTEXT_SOURCE = { EXAMPLE: 'example', USER: 'user' }

// How the draft was arrived at. Carried on the draft so a screen cannot be
// mistaken about which it is holding.
export const DRAFT_BASIS = { PREPARED: 'prepared-example', TEMPLATE: 'user-template' }

// ─── reading the mock ────────────────────────────────────────────────────

export function recipients() {
  return mock.recipients
}

export function recipientById(recipientId) {
  return mock.recipients.find((item) => item.recipientId === recipientId) || null
}

export function situationsFor(recipientId) {
  return recipientById(recipientId)?.situations || []
}

export function situationById(recipientId, situationId) {
  return situationsFor(recipientId).find((item) => item.situationId === situationId) || null
}

export function informationItemsFor(recipientId, situationId) {
  return situationById(recipientId, situationId)?.informationItems || []
}

export function channelsFor(recipientId) {
  const allowed = recipientById(recipientId)?.channels || []
  return allowed.map((id) => mock.channels.find((channel) => channel.id === id)).filter(Boolean)
}

export function channelLabel(channelId) {
  return mock.channels.find((channel) => channel.id === channelId)?.label || ''
}

export function exampleContextFor(recipientId, situationId) {
  return situationById(recipientId, situationId)?.exampleContext || ''
}

// ─── session state ───────────────────────────────────────────────────────

export function emptySession() {
  return {
    recipientId: null,
    situationId: null,
    information: [],
    contextSource: null,
    contextText: '',
    channel: null,
  }
}

export function statusOf(information, key) {
  return information.find((entry) => entry.key === key)?.status || null
}

export function setStatus(information, key, status) {
  const without = information.filter((entry) => entry.key !== key)
  return status ? [...without, { key, status }] : without
}

// A different situation asks about different things, so the answers to the
// old one mean nothing. The panel confirms before calling this.
export function clearSituationAnswers(session) {
  return { ...session, situationId: null, information: [], contextSource: null, contextText: '' }
}

export function informationComplete(session) {
  const items = informationItemsFor(session.recipientId, session.situationId)
  return items.length > 0 && items.every((item) => statusOf(session.information, item.key))
}

function labelsByStatus(session, status) {
  return informationItemsFor(session.recipientId, session.situationId)
    .filter((item) => statusOf(session.information, item.key) === status)
    .map((item) => item.label)
}

export function knownLabels(session) {
  return labelsByStatus(session, 'known')
}

// 알고 싶어요 and 잘 모르겠어요 both become things to ask about.
export function askLabels(session) {
  return [...labelsByStatus(session, 'unknown'), ...labelsByStatus(session, 'unsure')]
}

// Is the box still holding the prepared example, untouched? Only then may the
// prepared sentence stand for it.
export function usingExample(session) {
  if (session.contextSource !== CONTEXT_SOURCE.EXAMPLE) return false
  const example = exampleContextFor(session.recipientId, session.situationId)
  return example !== '' && session.contextText.trim() === example.trim()
}

// ─── Korean particles ────────────────────────────────────────────────────

// 조사 is chosen by whether the last syllable has a final consonant, so
// '마감 기한은' and '작업 범위는' both come out right and 은(는) never appears.
function hasJongseong(word) {
  const last = String(word || '').trim().slice(-1)
  const code = last.charCodeAt(0)
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return null
  return (code - 0xac00) % 28 !== 0
}

function withParticle(word, withJong, withoutJong) {
  const jong = hasJongseong(word)
  return `${word}${jong === null ? withoutJong : jong ? withJong : withoutJong}`
}

// ─── the template, for text the learner wrote themselves ─────────────────

function joinKorean(list) {
  return list.join(', ')
}

function templateFor(session) {
  const isProfessor = session.recipientId === 'professor'
  const known = knownLabels(session)
  const ask = askLabels(session)
  const context = session.contextText.trim()
  const channel = session.channel
  const blocks = []

  if (isProfessor) {
    // '(학번) (이름)' is a blank for the learner to fill, the same convention
    // the prepared sentences use — not an invented identity.
    if (channel === 'email') {
      blocks.push('교수님, 안녕하세요. 강의를 수강하고 있는 (학번) (이름)입니다.\n질문드릴 것이 있어 연락드립니다.')
    } else if (channel === 'message') {
      blocks.push('교수님, 안녕하세요. 질문드릴 것이 있습니다.')
    } else {
      blocks.push('교수님, 여쭤보고 싶은 것이 있습니다.')
    }
  } else if (channel === 'message') {
    blocks.push('안녕하세요. 과제 관련해서 확인하고 싶은 게 있어서 연락드려요.')
  } else {
    blocks.push('과제 관련해서 잠깐 확인하고 싶은 게 있어요.')
  }

  if (context) blocks.push(context)

  const closing = []
  if (known.length > 0) {
    const subject = withParticle(joinKorean(known), '은', '는')
    closing.push(isProfessor ? `${subject} 확인했습니다.` : `${subject} 알고 있어요.`)
  }
  if (ask.length > 0) {
    const object = withParticle(joinKorean(ask), '을', '를')
    closing.push(isProfessor ? `${object} 알려 주시면 감사하겠습니다.` : `${object} 확인하고 싶어요.`)
  }
  if (closing.length > 0) blocks.push(closing.join(' '))

  if (isProfessor) {
    blocks.push(channel === 'in_person' ? '시간 괜찮으실 때 여쭤봐도 될까요?' : '확인해 주시면 감사하겠습니다.')
  } else {
    blocks.push(channel === 'in_person' ? '알려 주면 좋겠어요.' : '확인하고 알려 주면 고맙겠어요.')
  }

  // 대면 질문 is spoken: one run of sentences, no blank lines.
  if (channel === 'in_person') return blocks.join(' ')
  if (channel === 'message') return blocks.join('\n')
  return blocks.join('\n\n')
}

// ─── the generator ───────────────────────────────────────────────────────

/**
 * The only place a sentence is decided. Replace this with a Communication
 * Agent call that returns the same shape and nothing above it changes.
 *
 * @param session { recipientId, situationId, information, contextSource, contextText, channel }
 * @returns CommunicationDraft
 */
export function generateDraft(session, { source = COMMUNICATION_SOURCE } = {}) {
  const situation = situationById(session.recipientId, session.situationId)
  const prepared = situation?.mockDrafts?.[session.channel] || ''
  const fromExample = usingExample(session) && prepared !== ''

  const generatedText = fromExample ? prepared : templateFor(session)
  const identifiedNeeds = fromExample ? situation.identifiedNeeds || [] : askLabels(session)

  return {
    schemaVersion: mock.schemaVersion,
    source,
    status: generatedText ? 'ready' : 'incomplete',
    recipientId: session.recipientId,
    situationId: session.situationId,
    channel: session.channel,
    // how this sentence came about, so no screen can present a prepared
    // example as a reading of what the learner typed
    basis: fromExample ? DRAFT_BASIS.PREPARED : DRAFT_BASIS.TEMPLATE,
    identifiedNeeds,
    draft: { generatedText, editedText: null, isUserEdited: false },
  }
}

export function applyEdit(draft, text) {
  const changed = text !== draft.draft.generatedText
  return {
    ...draft,
    status: changed ? 'edited' : 'ready',
    draft: { ...draft.draft, editedText: changed ? text : null, isUserEdited: changed },
  }
}

// Back to what the generator produced, keeping nothing of the edit.
export function restoreOriginal(draft) {
  return { ...draft, status: 'ready', draft: { ...draft.draft, editedText: null, isUserEdited: false } }
}

// What the learner copies: their own wording when they changed anything.
export function finalText(draft) {
  if (!draft) return ''
  return draft.draft.isUserEdited ? (draft.draft.editedText ?? '') : draft.draft.generatedText
}

export function introFor(draft) {
  const recipient = recipientById(draft?.recipientId)
  if (!recipient) return ''
  return draft.basis === DRAFT_BASIS.PREPARED ? recipient.outputIntroExample : recipient.outputIntroCustom
}
