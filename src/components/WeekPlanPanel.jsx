import { useMemo, useState } from 'react'
import { CalendarPlus, Check, Eye, Printer } from 'lucide-react'
import BearPanel from './BearPanel.jsx'
import PlanSheet from './PlanSheet.jsx'
import { PLAN_AGENT_TITLE, effectsOf, fill, firstTurnId, getTurn, labelOf, nextTurnId } from '../planAgent.js'
import {
  DEFAULT_MINUTES,
  DURATIONS,
  MAX_PICKS,
  SORT_MODES,
  buildPlan,
  createEntry,
  formatMonthDay,
  formatSlotLabel,
  formatSlotSentence,
  freeSlots,
  labelFor,
  planCandidates,
  sortCandidates,
} from '../weekPlan.js'

const BEAR = '/brand/gomgomi-question.webp'
// the order the conversation runs in, so earlier turns stay on screen
const FLOW = ['intro', 'review', 'adjust', 'pick', 'schedule', 'done']
const rank = (id) => FLOW.indexOf(id)

function Bear({ children }) {
  return (
    <div className="chat-row">
      <img src={BEAR} alt="" />
      <div className="chat-bear">{children}</div>
    </div>
  )
}

function Me({ children }) {
  return <p className="chat-me">{children}</p>
}

// 이번 주 계획 세우기.
//
// What 곰곰이 says, and where each answer leads, comes from the agent
// (src/planAgent.js, backed by a mock script today). This screen only knows
// how to draw each widget and collect the answer, so the conversation can move
// to a real agent without being rewritten.
//
// Everything said so far stays on screen: picking steps and setting times are
// one scrolling conversation, not two pages.
export default function WeekPlanPanel({ stepCompletion, hasPlanned, onSave, onClose }) {
  const [stage, setStage] = useState(() => firstTurnId(hasPlanned))
  const [answers, setAnswers] = useState({ lastWeek: null, adjust: null })
  const [effects, setEffects] = useState({})
  const [exampleOpen, setExampleOpen] = useState(false)
  const [sortMode, setSortMode] = useState('due')
  const [picked, setPicked] = useState([])
  const [scheduleIndex, setScheduleIndex] = useState(0)
  const [draft, setDraft] = useState([])
  const [slotId, setSlotId] = useState(null)
  const [minutes, setMinutes] = useState(null)

  const candidates = useMemo(() => planCandidates(stepCompletion), [stepCompletion])
  const sorted = useMemo(() => sortCandidates(candidates, sortMode), [candidates, sortMode])
  const slots = useMemo(() => freeSlots(new Date(), 8), [])
  const example = useMemo(() => {
    const rows = sortCandidates(planCandidates(stepCompletion), 'due').slice(0, 3)
    const free = freeSlots(new Date(), 6)
    return rows
      .map((row, index) =>
        free[index] ? createEntry({ row, slot: free[index], minutes: index === rows.length - 1 ? 10 : 20 }) : null,
      )
      .filter(Boolean)
  }, [stepCompletion])

  const reached = (id) => rank(stage) >= rank(id)
  const maxPicks = effects.maxPicks ?? MAX_PICKS
  const defaultMinutes = effects.defaultMinutes ?? DEFAULT_MINUTES
  const pickedRows = picked.map((id) => candidates.find((row) => row.stepId === id)).filter(Boolean)
  const currentRow = reached('schedule') ? pickedRows[scheduleIndex] : null
  const currentMinutes = minutes ?? defaultMinutes
  const chosenSlot = slots.find((slot) => slot.id === slotId) || null
  const usedSlotIds = new Set(draft.map((entry) => entry.scheduledAt))
  const minPicks = Math.min(2, sorted.length)

  const introTurn = getTurn('intro')
  const reviewTurn = getTurn('review')
  const adjustTurn = getTurn('adjust')
  const pickTurn = getTurn('pick')
  const scheduleTurn = getTurn('schedule')
  const doneTurn = getTurn('done')
  const subtitle = getTurn(stage)?.subtitle || ''

  function answer(turnId, optionId, field) {
    setAnswers((current) => ({ ...current, [field]: optionId }))
    setEffects((current) => ({ ...current, ...effectsOf(turnId, optionId) }))
    const next = nextTurnId(turnId, optionId)
    if (next) setStage(next)
  }

  function togglePick(stepId) {
    setPicked((current) => {
      if (current.includes(stepId)) return current.filter((id) => id !== stepId)
      if (current.length >= maxPicks) return current
      return [...current, stepId]
    })
  }

  function commitSlot() {
    if (!currentRow || !chosenSlot) return
    setDraft([...draft, createEntry({ row: currentRow, slot: chosenSlot, minutes: currentMinutes })])
    setSlotId(null)
    setMinutes(null)
    if (scheduleIndex + 1 < pickedRows.length) setScheduleIndex(scheduleIndex + 1)
    else setStage(nextTurnId('schedule') || 'done')
  }

  // the document the conversation hands back
  const plan = buildPlan({
    entries: draft,
    review: answers,
    settings: { sortMode, maxPicks, defaultMinutes },
  })
  const scrollKey = `${stage}-${draft.length}-${answers.lastWeek}-${answers.adjust}-${exampleOpen}-${slotId}`

  return (
    <BearPanel
      title={PLAN_AGENT_TITLE}
      subtitle={subtitle}
      titleId="week-plan-title"
      scrollKey={scrollKey}
      onClose={onClose}
    >
      {/* ── 처음이면 예시, 둘째 주부터는 돌아보기 ── */}
      {hasPlanned ? (
        <>
          <Bear>
            {reviewTurn.say.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Bear>
          {!answers.lastWeek ? (
            <div className="plan-answers">
              {reviewTurn.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="chat-chip"
                  onClick={() => answer('review', option.id, reviewTurn.field)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <Me>{labelOf('review', answers.lastWeek)}</Me>
              {nextTurnId('review', answers.lastWeek) === 'adjust' ? (
                <>
                  <Bear>
                    {adjustTurn.say.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </Bear>
                  {!answers.adjust ? (
                    <div className="plan-answers">
                      {adjustTurn.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="chat-chip"
                          onClick={() => answer('adjust', option.id, adjustTurn.field)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Me>{labelOf('adjust', answers.adjust)}</Me>
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      ) : (
        <>
          <Bear>
            {introTurn.say.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Bear>
          <div className="start-choices">
            {introTurn.options.map((option) => {
              const Icon = option.action === 'toggleExample' ? Eye : CalendarPlus
              const on = option.action === 'toggleExample' && exampleOpen
              return (
                <button
                  key={option.id}
                  type="button"
                  className={on ? 'start-card is-on' : 'start-card'}
                  aria-pressed={option.action === 'toggleExample' ? exampleOpen : undefined}
                  disabled={reached('pick')}
                  onClick={() =>
                    option.action === 'toggleExample' ? setExampleOpen((open) => !open) : setStage(option.next)
                  }
                >
                  <Icon aria-hidden="true" size={36} />
                  <span className="start-card-title">{option.label}</span>
                  <span className="start-card-sub">{option.hint}</span>
                </button>
              )
            })}
          </div>
          {exampleOpen ? <PlanSheet entries={example} tag="예시" className="is-example" /> : null}
        </>
      )}

      {/* ── 1/2 이번 주에 할 단계 고르기 ── */}
      {reached('pick') ? (
        <>
          <Bear>
            <p>{pickTurn.sayBySort[sortMode]}</p>
            <p>{fill(pickTurn.ask, { picks: pickTurn.picksLabel[String(maxPicks)] })}</p>
          </Bear>
          <div className="plan-sort">
            <span className="plan-sort-label">{pickTurn.sortLabel}</span>
            {SORT_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={mode.id === sortMode ? 'chat-chip is-on' : 'chat-chip'}
                aria-pressed={mode.id === sortMode}
                disabled={reached('schedule')}
                onClick={() => setSortMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <ul className="pick-list">
            {sorted.map((row) => {
              const on = picked.includes(row.stepId)
              const locked = reached('schedule')
              const full = !on && picked.length >= maxPicks
              if (locked && !on) return null
              return (
                <li key={row.stepId}>
                  <label className={`pick-item${on ? ' is-on' : ''}${full ? ' is-full' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={full || locked}
                      onChange={() => togglePick(row.stepId)}
                    />
                    <span className="pick-box" aria-hidden="true">
                      {on ? <Check size={14} /> : null}
                    </span>
                    <span className="pick-main">
                      <span className="pick-title">{labelFor(row)}</span>
                      <span className="pick-sub">{row.stepTitle}</span>
                    </span>
                    <span className="pick-dates">
                      <span className="pick-target">목표 {formatMonthDay(row.targetDate)}</span>
                      <span className="pick-due">마감 {formatMonthDay(row.dueDate)}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          {!reached('schedule') ? (
            <>
              <p className="plan-note">{pickTurn.note}</p>
              <div className="chat-choices">
                <button
                  type="button"
                  className="btn primary"
                  disabled={picked.length < minPicks}
                  onClick={() => setStage(pickTurn.next)}
                >
                  {fill(pickTurn.confirmLabel, { count: picked.length })}
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {/* ── 2/2 언제 할지 정하기: 정한 것은 대화로 남고 다음 단계가 이어짐 ── */}
      {reached('schedule') ? (
        <>
          <Me>{fill(pickTurn.confirmLabel, { count: picked.length })}</Me>
          {draft.map((entry) => (
            <div key={entry.stepId}>
              <Bear>
                <p>{fill(scheduleTurn.ask, { step: `${entry.subjectName} ${entry.stepNumber}단계` })}</p>
              </Bear>
              <Me>
                {formatSlotLabel(entry.scheduledAt)} · {entry.minutes}분
              </Me>
            </div>
          ))}
        </>
      ) : null}

      {currentRow ? (
        <>
          <Bear>
            <p>{fill(scheduleTurn.ask, { step: labelFor(currentRow) })}</p>
          </Bear>
          <div className="slot-grid">
            {slots.map((slot) => {
              const used = usedSlotIds.has(slot.id)
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={slot.id === slotId ? 'slot-chip is-on' : 'slot-chip'}
                  aria-pressed={slot.id === slotId}
                  disabled={used}
                  onClick={() => setSlotId(slot.id)}
                >
                  {formatSlotLabel(slot.date)}
                  {used ? <span className="slot-used">이미 정함</span> : null}
                </button>
              )
            })}
          </div>
          {slots.length === 0 ? <p className="plan-note">{scheduleTurn.emptyNote}</p> : null}

          <div className="plan-sort">
            <span className="plan-sort-label">{scheduleTurn.durationLabel}</span>
            {DURATIONS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === currentMinutes ? 'chat-chip is-on' : 'chat-chip'}
                aria-pressed={value === currentMinutes}
                onClick={() => setMinutes(value)}
              >
                {value}분
              </button>
            ))}
          </div>
          {answers.adjust === 'shorter' && minutes === null ? (
            <p className="plan-note">{scheduleTurn.effectNote.shorter}</p>
          ) : null}

          {chosenSlot ? (
            <>
              <Bear>
                {scheduleTurn.confirmSay.map((line) => (
                  <p key={line}>
                    {fill(line, {
                      slot: formatSlotSentence(chosenSlot.date),
                      step: labelFor(currentRow),
                      minutes: currentMinutes,
                    })}
                  </p>
                ))}
              </Bear>
              <div className="plan-answers">
                {scheduleTurn.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="chat-chip"
                    onClick={() => (option.action === 'commitSlot' ? commitSlot() : setSlotId(null))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {/* ── 완성 ── */}
      {stage === 'done' ? (
        <>
          <Bear>
            {doneTurn.say.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Bear>
          <PlanSheet entries={plan.entries} title={doneTurn.sheetTitle} />
          <div className="chat-choices">
            {doneTurn.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                className={action.primary ? 'btn primary' : 'btn'}
                onClick={() => (action.id === 'save' ? onSave(plan) : window.print())}
              >
                {action.id === 'print' ? <Printer aria-hidden="true" size={16} /> : null}
                {action.label}
              </button>
            ))}
          </div>
          <PlanSheet entries={plan.entries} className="print-sheet" />
        </>
      ) : null}
    </BearPanel>
  )
}
