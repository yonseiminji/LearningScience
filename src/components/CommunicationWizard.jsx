import { useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw } from 'lucide-react'
import { data } from '../assignmentModel.js'
import {
  COPY,
  INFORMATION_STATES,
  INFORMATION_STATE_LABELS,
  STEPS,
  applyEdit,
  channelsFor,
  clearSituationAnswers,
  createDraft,
  finalText,
  informationComplete,
  informationItemsFor,
  recipientById,
  recipients,
  setStatus,
  situationById,
  situationsFor,
  statusOf,
} from '../communication.js'

const BEAR = '/brand/gomgomi-question.webp'

function Bear({ children }) {
  return (
    <div className="chat-row">
      <img src={BEAR} alt="" />
      <div className="chat-bear">{children}</div>
    </div>
  )
}

// 소통 준비하기.
//
// Four questions the learner answers, then the sentence. Every word 곰곰이
// says comes from src/data/communication.mock.json, and the sentence is
// composed by src/communication.js — this screen only collects answers and
// shows what came back, so an LLM behind that module would change nothing
// here.
export default function CommunicationWizard({ session, onSession, step, onStep, draft, onDraft }) {
  const [copied, setCopied] = useState(null) // null | 'ok' | 'manual'
  const [pendingSituation, setPendingSituation] = useState(null)
  const [pendingChannel, setPendingChannel] = useState(null)
  const textareaRef = useRef(null)

  const recipient = recipientById(session.recipientId)
  const situation = situationById(session.recipientId, session.situationId)
  const items = informationItemsFor(session.recipientId, session.situationId)
  const channels = channelsFor(session.recipientId)
  const atResult = step >= STEPS.length
  const stepIndex = Math.min(step, STEPS.length - 1)

  function update(patch) {
    onSession({ ...session, ...patch })
  }

  function go(next) {
    setCopied(null)
    onStep(next)
  }

  function buildDraft(next = session) {
    const withChannel = next.channel ? next : { ...next, channel: channels[0]?.id || null }
    if (!withChannel.channel) return
    onSession(withChannel)
    onDraft(createDraft(withChannel))
    go(STEPS.length)
  }

  function pickRecipient(id) {
    onSession({ ...session, recipientId: id, situationId: null, information: [], channel: null })
    onDraft(null)
    go(1)
  }

  function pickSituation(id) {
    if (session.situationId && session.situationId !== id && session.information.length > 0) {
      setPendingSituation(id)
      return
    }
    update({ situationId: id, information: [] })
    go(2)
  }

  function confirmSituation() {
    const id = pendingSituation
    setPendingSituation(null)
    onSession({ ...clearSituationAnswers(session), situationId: id })
    onDraft(null)
    go(2)
  }

  function chooseChannel(id) {
    if (draft?.draft.isUserEdited && id !== session.channel) {
      setPendingChannel(id)
      return
    }
    const next = { ...session, channel: id }
    onSession(next)
    onDraft(createDraft(next))
    setCopied(null)
  }

  function confirmChannel() {
    const id = pendingChannel
    setPendingChannel(null)
    const next = { ...session, channel: id }
    onSession(next)
    onDraft(createDraft(next))
    setCopied(null)
  }

  async function copyText() {
    const text = finalText(draft)
    try {
      await navigator.clipboard.writeText(text)
      setCopied('ok')
    } catch {
      // clipboard blocked (no permission, or not a secure context): select the
      // text so the learner can copy it themselves
      setCopied('manual')
      const node = textareaRef.current
      if (node) {
        node.focus()
        node.select()
      }
    }
  }

  return (
    <>
      <p className="commu-disclaimer">{COPY.disclaimer}</p>
      <p className="commu-step">
        {atResult ? (
          <>{COPY.previewHeading}</>
        ) : (
          <>
            {stepIndex + 1} / {STEPS.length} · {STEPS[stepIndex].label}
          </>
        )}
      </p>

      {session.recipientId && step > 0 ? (
        <p className="commu-trail">
          <span>{recipient?.label}</span>
          {situation ? <span>{situation.label.replace(/\.$/, '')}</span> : null}
        </p>
      ) : null}

      {/* 1 · 상대방 선택 */}
      {step === 0 ? (
        <>
          <Bear>
            <p>누구에게 질문하거나 도움을 요청하려고 하나요?</p>
          </Bear>
          <div className="commu-choices">
            {recipients().map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === session.recipientId ? 'commu-choice is-on' : 'commu-choice'}
                onClick={() => pickRecipient(item.id)}
              >
                {item.label}
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            ))}
          </div>
          <p className="commu-hint">지금은 문장을 잘 쓰지 않아도 괜찮아요. 하나씩 고르면 필요한 질문을 정리할 수 있어요.</p>
        </>
      ) : null}

      {/* 2 · 상황 선택 */}
      {step === 1 && recipient ? (
        <>
          <Bear>
            <p>{recipient.situationQuestion}</p>
          </Bear>
          <div className="commu-choices">
            {situationsFor(session.recipientId).map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === session.situationId ? 'commu-choice is-on' : 'commu-choice'}
                onClick={() => pickSituation(item.id)}
              >
                {item.label}
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            ))}
          </div>
          {pendingSituation ? (
            <div className="plan-caution" role="alert">
              <p>상황을 바꾸면 앞에서 고른 정보가 지워져요. 바꿀까요?</p>
              <div className="commu-row">
                <button type="button" className="btn primary" onClick={confirmSituation}>
                  바꿀게요
                </button>
                <button type="button" className="btn" onClick={() => setPendingSituation(null)}>
                  그대로 둘래요
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {/* 3 · 확인할 정보 */}
      {step === 2 && situation ? (
        <>
          <Bear>
            <p>{COPY.informationQuestion}</p>
          </Bear>
          <ul className="commu-items">
            {items.map((item) => {
              const current = statusOf(session.information, item.id)
              return (
                <li key={item.id} className={current ? 'is-answered' : ''}>
                  <span className="commu-item-label">{item.label}</span>
                  <span className="commu-states">
                    {INFORMATION_STATES.map((state) => (
                      <button
                        key={state}
                        type="button"
                        className={state === current ? `commu-state is-on is-${state}` : 'commu-state'}
                        aria-pressed={state === current}
                        onClick={() =>
                          update({
                            information: setStatus(session.information, item.id, state === current ? null : state),
                          })
                        }
                      >
                        {INFORMATION_STATE_LABELS[state]}
                      </button>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
          <div className="commu-row">
            <button
              type="button"
              className="btn primary"
              disabled={!informationComplete(session)}
              onClick={() => go(3)}
            >
              다 골랐어요
              <ChevronRight aria-hidden="true" size={16} />
            </button>
            {!informationComplete(session) ? <span className="commu-hint">모든 항목을 하나씩 골라 주세요.</span> : null}
          </div>
        </>
      ) : null}

      {/* 4 · 상황 입력 */}
      {step === 3 && recipient ? (
        <>
          <Bear>
            <p>{recipient.contextQuestion}</p>
          </Bear>
          <div className="commu-field">
            <span className="commu-field-label">어떤 수업인가요? (선택)</span>
            <div className="commu-row">
              {data.subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  className={
                    session.identity.courseName === subject.name ? 'chat-chip is-on' : 'chat-chip'
                  }
                  aria-pressed={session.identity.courseName === subject.name}
                  onClick={() =>
                    update({
                      identity: {
                        ...session.identity,
                        courseName: session.identity.courseName === subject.name ? '' : subject.name,
                      },
                    })
                  }
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
          <label className="commu-field">
            <span className="commu-field-label">현재 상황</span>
            <textarea
              className="commu-textarea"
              rows={5}
              value={session.contextText}
              placeholder={COPY.contextPlaceholder}
              onChange={(event) => update({ contextText: event.target.value })}
            />
          </label>
          <div className="commu-row">
            <button
              type="button"
              className="btn primary"
              disabled={session.contextText.trim() === ''}
              onClick={() => buildDraft()}
            >
              질문 문장 만들기
              <ChevronRight aria-hidden="true" size={16} />
            </button>
            {session.contextText.trim() === '' ? (
              <span className="commu-hint">한 줄이라도 적어 주세요.</span>
            ) : null}
          </div>
        </>
      ) : null}

      {/* 결과 · 확인하고 고치고 복사 */}
      {atResult && draft ? (
        <>
          <Bear>
            <p>{recipient?.outputIntro}</p>
          </Bear>

          <div className="commu-field">
            <span className="commu-field-label">어디에 보낼 건가요?</span>
            <div className="commu-row">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  className={channel.id === session.channel ? 'chat-chip is-on' : 'chat-chip'}
                  aria-pressed={channel.id === session.channel}
                  onClick={() => chooseChannel(channel.id)}
                >
                  {channel.label}
                </button>
              ))}
            </div>
          </div>

          {pendingChannel ? (
            <div className="plan-caution" role="alert">
              <p>매체를 바꾸면 고친 내용이 사라져요. 바꿀까요?</p>
              <div className="commu-row">
                <button type="button" className="btn primary" onClick={confirmChannel}>
                  바꿀게요
                </button>
                <button type="button" className="btn" onClick={() => setPendingChannel(null)}>
                  그대로 둘래요
                </button>
              </div>
            </div>
          ) : null}

          <p className="commu-hint">{COPY.editHint}</p>
          <textarea
            ref={textareaRef}
            className="commu-textarea is-draft"
            rows={10}
            value={finalText(draft)}
            onChange={(event) => {
              onDraft(applyEdit(draft, event.target.value))
              setCopied(null)
            }}
            aria-label="질문 문장"
          />
          {draft.draft.isUserEdited ? <p className="commu-hint">직접 고친 문장이에요.</p> : null}

          <div className="commu-row">
            <button type="button" className="btn primary" onClick={copyText}>
              <Copy aria-hidden="true" size={16} />
              {COPY.copyButton}
            </button>
            <button type="button" className="btn" onClick={() => onDraft(createDraft(session))}>
              <RefreshCw aria-hidden="true" size={16} />
              문장 다시 만들기
            </button>
          </div>

          {copied === 'ok' ? (
            <p className="commu-copied" role="status">
              <Check aria-hidden="true" size={14} />
              {COPY.copySuccess}
            </p>
          ) : null}
          {copied === 'manual' ? (
            <p className="plan-note" role="status">
              복사가 막혀 있어요. 위 문장이 선택돼 있으니 Ctrl+C(맥은 ⌘+C)로 복사해 주세요.
            </p>
          ) : null}
          <p className="plan-note">이 화면은 문장을 만들어 줄 뿐, 메일이나 메시지를 대신 보내지는 않아요.</p>
        </>
      ) : null}

      {step > 0 ? (
        <button type="button" className="btn commu-back" onClick={() => go(step - 1)}>
          <ChevronLeft aria-hidden="true" size={16} />
          이전 단계
        </button>
      ) : null}
    </>
  )
}
