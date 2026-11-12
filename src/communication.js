// 소통 준비하기: helping a learner put a question into words they can send.
//
// The wording, the choices and the questions all come from
// src/data/communication.mock.json. This module reads that file and composes
// the draft; it holds no copy of its own.
//
// The seam for a real model is generateDraft() below. Swapping the mock for an
// LLM means returning the same CommunicationDraft from the same inputs —
// docs/Commu_SysPrompt.txt is the prompt it would run. The wizard does not
// know which one answered.
//
// Pure: no React, no DOM, no clipboard.

import mock from './data/communication.mock.json'

export const COMMUNICATION_SOURCE = mock.mode // 'mock' today
export const COPY = mock.copy
export const FLOW = mock.flow
export const INFORMATION_STATES = mock.copy.informationStates
export const INFORMATION_STATE_LABELS = mock.copy.informationStateLabels

export const CHANNELS = {
  email: { id: 'email', label: '이메일' },
  message: { id: 'message', label: '메시지' },
  face_to_face: { id: 'face_to_face', label: '대면 질문' },
}

// The learner answers these four; the sentence screen that follows is the
// result, not a step. (The mock's `flow` also names `draft` and
// `edit-and-copy`, which share that one screen.)
export const STEPS = [
  { id: 'recipient', label: '상대방 선택' },
  { id: 'situation', label: '상황 선택' },
  { id: 'information', label: '확인할 정보' },
  { id: 'context', label: '상황 입력' },
]

export function recipients() {
  return mock.recipients
}

export function recipientById(id) {
  return mock.recipients.find((item) => item.id === id) || null
}

export function situationsFor(recipientId) {
  return recipientById(recipientId)?.situations || []
}

export function situationById(recipientId, situationId) {
  return situationsFor(recipientId).find((item) => item.id === situationId) || null
}

export function informationItemsFor(recipientId, situationId) {
  return situationById(recipientId, situationId)?.informationItems || []
}

export function channelsFor(recipientId) {
  return (recipientById(recipientId)?.channels || []).map((id) => CHANNELS[id]).filter(Boolean)
}

export function channelLabel(id) {
  return CHANNELS[id]?.label || ''
}

// ─── state ───────────────────────────────────────────────────────────────

export function emptySession() {
  return {
    recipientId: null,
    situationId: null,
    information: [],
    contextText: '',
    channel: null,
    identity: { courseName: '', studentName: '', studentNumber: '' },
  }
}

export function statusOf(information, itemId) {
  return information.find((entry) => entry.itemId === itemId)?.status || null
}

export function setStatus(information, itemId, status) {
  const without = information.filter((entry) => entry.itemId !== itemId)
  return status ? [...without, { itemId, status }] : without
}

// Changing the situation makes the previous answers meaningless: they were
// about other information items. The wizard asks before calling this.
export function clearSituationAnswers(session) {
  return { ...session, situationId: null, information: [] }
}

// Every information item needs an answer before the learner moves on.
export function informationComplete(session) {
  const items = informationItemsFor(session.recipientId, session.situationId)
  return items.length > 0 && items.every((item) => statusOf(session.information, item.id))
}

function labelsByStatus(session, status) {
  const items = informationItemsFor(session.recipientId, session.situationId)
  return items.filter((item) => statusOf(session.information, item.id) === status).map((item) => item.label)
}

export function knownLabels(session) {
  return labelsByStatus(session, 'known')
}

// '알고 싶어요' and '잘 모르겠어요' both become questions; the first is a
// direct ask, the second an ask to go over it again.
export function askLabels(session) {
  return [...labelsByStatus(session, 'unknown'), ...labelsByStatus(session, 'unsure')]
}

// ─── the draft ───────────────────────────────────────────────────────────

// 조사는 앞 글자의 받침에 따라 갈린다. '마감 기한은' / '작업 범위는'처럼
// 쓰려면 글자를 봐야 하므로, '은(는)' 같은 표기는 쓰지 않는다.
function hasJongseong(word) {
  const last = (word || '').trim().slice(-1)
  const code = last.charCodeAt(0)
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return null // 한글이 아니면 판단하지 않음
  return (code - 0xac00) % 28 !== 0
}

function withParticle(word, withJong, withoutJong) {
  const jong = hasJongseong(word)
  if (jong === null) return `${word}${withoutJong}`
  return `${word}${jong ? withJong : withoutJong}`
}

function joinKorean(list) {
  return list.join(', ')
}

function professorOpening(channel, courseName) {
  const course = courseName ? `${courseName} ` : ''
  if (channel === 'face_to_face') return [`교수님, ${course}수업 관련해 여쭤볼 것이 있습니다.`]
  return [`교수님, 안녕하세요.`, `${course}강의를 수강하고 있는 학생입니다.`]
}

function teammateOpening(channel) {
  if (channel === 'face_to_face') return ['과제 관련해서 잠깐 확인하고 싶은 게 있어요.']
  return ['안녕하세요. 과제 관련해서 확인하고 싶은 게 있어서 연락드려요.']
}

function closing(recipientId, channel) {
  if (recipientId === 'professor') {
    if (channel === 'email') return '확인해 주시면 감사하겠습니다.'
    if (channel === 'message') return '확인 부탁드립니다. 감사합니다.'
    return '알려 주시면 감사하겠습니다.'
  }
  if (channel === 'message') return '확인하고 알려 주면 고맙겠어요.'
  return '알려 주면 좋겠어요.'
}

// Does this session match the worked example shipped in the mock file? Only
// then is its hand-written sentence used — the free text has to match too, so
// the example never stands in for something the learner actually typed.
function matchesDemo(session) {
  const demo = mock.demoSession
  if (!demo) return false
  if (session.recipientId !== demo.recipientId) return false
  if (session.situationId !== demo.situationId) return false
  if (session.channel !== demo.channel) return false
  if (session.contextText.trim() !== demo.contextText.trim()) return false
  const sameInformation = demo.information.every(
    (entry) => statusOf(session.information, entry.itemId) === entry.status,
  )
  return sameInformation && session.information.length === demo.information.length
}

/**
 * Composes the message from what the learner chose and typed.
 *
 * The free text is carried through as written. This generator does not read
 * it, summarise it or answer it — it has no model behind it, and pretending
 * otherwise would be the one thing a learner could not check. Nothing is
 * added that the learner did not supply: no name, no student number, no
 * course they did not pick.
 */
export function generateDraft(session) {
  const recipient = recipientById(session.recipientId)
  if (!recipient || !session.situationId || !session.channel) return ''
  if (matchesDemo(session)) return mock.demoSession.draft.generatedText

  const situation = situationById(session.recipientId, session.situationId)
  const isProfessor = session.recipientId === 'professor'
  const course = session.identity.courseName
  const known = knownLabels(session)
  const ask = askLabels(session)

  // Paragraphs, so an email breaks where a reader expects and a message does
  // not sprawl.
  const paragraphs = []

  const opening = isProfessor ? professorOpening(session.channel, course) : teammateOpening(session.channel)
  paragraphs.push(opening.join(' '))

  const lead = []
  if (isProfessor) {
    lead.push(`${course ? `${course} ` : ''}과제와 관련해 질문드립니다.`)
  } else if (situation) {
    // the situation labels are already whole sentences in the learner's voice
    lead.push(situation.label)
  }
  const context = session.contextText.trim()
  if (context) lead.push(context)
  if (lead.length > 0) paragraphs.push(lead.join(' '))

  const closingLines = []
  if (known.length > 0) {
    const subject = withParticle(joinKorean(known), '은', '는')
    closingLines.push(isProfessor ? `${subject} 확인했습니다.` : `${subject} 알고 있어요.`)
  }
  if (ask.length > 0) {
    const object = withParticle(joinKorean(ask), '을', '를')
    closingLines.push(
      isProfessor ? `${object} 알려 주시면 좋겠습니다.` : `${object} 확인하고 싶어요.`,
    )
  }
  if (closingLines.length > 0) paragraphs.push(closingLines.join(' '))

  paragraphs.push(closing(session.recipientId, session.channel))

  // 대면 질문 is spoken: one run of sentences, no blank lines.
  if (session.channel === 'face_to_face') return paragraphs.join(' ')
  if (session.channel === 'message') return paragraphs.join('\n')
  return paragraphs.join('\n\n')
}

let sequence = 0

// The shape the wizard renders and the shape an LLM would have to return.
// `source` says who wrote it, so a screen can never be mistaken about it.
export function createDraft(session, { source = COMMUNICATION_SOURCE } = {}) {
  sequence += 1
  const generatedText = generateDraft(session)
  return {
    schemaVersion: mock.schemaVersion,
    source,
    sessionId: `commu-${Date.now()}-${sequence}`,
    recipientId: session.recipientId,
    situationId: session.situationId,
    information: session.information,
    contextText: session.contextText,
    channel: session.channel,
    identity: { ...session.identity },
    draft: { generatedText, editedText: null, isUserEdited: false },
    status: 'draft',
  }
}

export function applyEdit(draft, text) {
  const edited = text === draft.draft.generatedText ? null : text
  return {
    ...draft,
    draft: { ...draft.draft, editedText: edited, isUserEdited: edited !== null },
    status: edited === null ? 'draft' : 'edited',
  }
}

// What the learner copies: their own wording if they changed anything.
export function finalText(draft) {
  if (!draft) return ''
  return draft.draft.isUserEdited ? draft.draft.editedText ?? '' : draft.draft.generatedText
}
