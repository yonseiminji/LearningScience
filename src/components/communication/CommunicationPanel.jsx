import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ChannelSelector from './ChannelSelector.jsx'
import ContextInput from './ContextInput.jsx'
import DraftEditor from './DraftEditor.jsx'
import InformationSelector from './InformationSelector.jsx'
import RecipientSelector from './RecipientSelector.jsx'
import SituationSelector from './SituationSelector.jsx'
import {
  COPY,
  STEPS,
  channelsFor,
  clearSituationAnswers,
  emptySession,
  generateDraft,
  informationComplete,
  recipientById,
  setStatus,
  situationById,
} from '../../communication.js'

// 소통 준비하기, four steps.
//
//   1 상대방과 상황 · 2 확인할 정보 · 3 현재 상황 입력 · 4 질문 문장
//
// Step 1 holds two questions in turn: who, then what is hard. The panel owns
// the flow and nothing else — every question comes from the mock file and
// every sentence from generateDraft(), so a Communication Agent behind that
// one function would change nothing here.
export default function CommunicationPanel({ session, onSession, step, onStep, draft, onDraft, onFinish }) {
  // asking to go back to the recipient question when there is work to lose
  const [pendingReset, setPendingReset] = useState(false)
  const recipient = recipientById(session.recipientId)
  const situation = situationById(session.recipientId, session.situationId)
  const channels = channelsFor(session.recipientId)

  // step 1 shows the situation question once someone is chosen
  const onSituationHalf = step === 0 && Boolean(session.recipientId)
  const stepLabel = step === 0 ? (onSituationHalf ? '상황 선택' : '상대방 선택') : STEPS[step]?.label || ''

  function update(patch) {
    onSession({ ...session, ...patch })
  }

  function build(next) {
    const withChannel = next.channel ? next : { ...next, channel: channels[0]?.id || null }
    onSession(withChannel)
    onDraft(generateDraft(withChannel))
  }

  const canAdvance =
    step === 0
      ? Boolean(session.situationId)
      : step === 1
        ? informationComplete(session)
        : step === 2
          ? session.contextText.trim() !== ''
          : false

  function next() {
    if (step === 2) {
      build(session)
      onStep(3)
      return
    }
    onStep(step + 1)
  }

  // Back to the very first question. Everything after the recipient belongs to
  // a situation that is no longer chosen, so it goes with it.
  function resetToRecipient() {
    onSession(emptySession())
    onDraft(null)
    onStep(0)
    setPendingReset(false)
  }

  function askToResetRecipient() {
    if (hasAnswers(session)) setPendingReset(true)
    else resetToRecipient()
  }

  function back() {
    if (step === 0 && onSituationHalf) {
      askToResetRecipient()
      return
    }
    onStep(Math.max(0, step - 1))
  }

  return (
    <>
      <p className="commu-disclaimer">{COPY.disclaimer}</p>
      <p className="commu-step">
        {step + 1} / {STEPS.length} · {stepLabel}
      </p>

      {session.recipientId && (onSituationHalf || step > 0) ? (
        <p className="commu-trail">
          <button type="button" className="commu-trail-step" onClick={askToResetRecipient}>
            {recipient?.label}
            <span className="commu-trail-change">바꾸기</span>
          </button>
          {situation ? (
            <button type="button" className="commu-trail-step" onClick={() => onStep(0)} disabled={step === 0}>
              {situation.label.replace(/\.$/, '')}
              {step > 0 ? <span className="commu-trail-change">바꾸기</span> : null}
            </button>
          ) : null}
        </p>
      ) : null}

      {pendingReset ? (
        <div className="plan-caution" role="alert">
          <p>처음부터 다시 고르면 지금까지 고른 정보와 적어 둔 내용이 지워져요. 다시 고를까요?</p>
          <div className="commu-row">
            <button type="button" className="btn primary" onClick={resetToRecipient}>
              다시 고를게요
            </button>
            <button type="button" className="btn" onClick={() => setPendingReset(false)}>
              그대로 둘래요
            </button>
          </div>
        </div>
      ) : null}

      {step === 0 && !onSituationHalf ? (
        <RecipientSelector
          value={session.recipientId}
          onSelect={(recipientId) => {
            onSession({
              ...session,
              recipientId,
              situationId: null,
              information: [],
              contextSource: null,
              contextText: '',
              channel: null,
            })
            onDraft(null)
          }}
        />
      ) : null}

      {onSituationHalf ? (
        <SituationSelectorWithConfirm
          session={session}
          onSession={onSession}
          onDraft={onDraft}
          onAdvance={() => onStep(1)}
        />
      ) : null}

      {step === 1 ? (
        <InformationSelector
          recipientId={session.recipientId}
          situationId={session.situationId}
          information={session.information}
          onChange={(key, status) => update({ information: setStatus(session.information, key, status) })}
        />
      ) : null}

      {step === 2 ? (
        <ContextInput
          recipientId={session.recipientId}
          situationId={session.situationId}
          contextText={session.contextText}
          contextSource={session.contextSource}
          onChange={(contextText, contextSource) => update({ contextText, contextSource })}
        />
      ) : null}

      {step === 3 ? (
        <>
          <ChannelSelector
            recipientId={session.recipientId}
            value={session.channel}
            onSelect={(channel) => build({ ...session, channel })}
          />
          <DraftEditor draft={draft} onDraft={onDraft} onRegenerate={() => build(session)} />
        </>
      ) : null}

      <div className="commu-row commu-nav">
        {step > 0 || onSituationHalf ? (
          <button type="button" className="btn" onClick={back}>
            <ChevronLeft aria-hidden="true" size={16} />
            이전 단계
          </button>
        ) : null}
        {step < 3 && (step > 0 || onSituationHalf) ? (
          <button type="button" className="btn primary" disabled={!canAdvance} onClick={next}>
            {step === 2 ? '질문 문장 만들기' : '다음 단계'}
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ) : null}
        {step === 3 ? (
          <button type="button" className="btn primary commu-finish" onClick={onFinish}>
            <Check aria-hidden="true" size={16} />
            완료하기
          </button>
        ) : null}
        {!canAdvance && step === 1 ? <span className="commu-hint">모든 항목을 하나씩 골라 주세요.</span> : null}
        {!canAdvance && step === 2 ? <span className="commu-hint">한 줄이라도 적어 주세요.</span> : null}
      </div>
    </>
  )
}

// Changing an already-chosen situation discards answers about other
// information, so it is confirmed before anything is cleared.
function SituationSelectorWithConfirm({ session, onSession, onDraft, onAdvance }) {
  const [pending, setPending] = useState(null)
  return (
    <SituationSelector
      recipientId={session.recipientId}
      value={session.situationId}
      pending={pending}
      onSelect={(situationId) => {
        if (session.situationId && session.situationId !== situationId && hasAnswers(session)) {
          setPending(situationId)
          return
        }
        onSession({ ...session, situationId, information: [], contextSource: null, contextText: '' })
        onDraft(null)
        onAdvance()
      }}
      onConfirm={() => {
        onSession({ ...clearSituationAnswers(session), situationId: pending })
        onDraft(null)
        setPending(null)
        onAdvance()
      }}
      onCancel={() => setPending(null)}
    />
  )
}

function hasAnswers(session) {
  return session.information.length > 0 || session.contextText.trim() !== ''
}
