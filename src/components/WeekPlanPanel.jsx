import { useMemo, useState } from 'react'
import { CalendarPlus, Check, Eye, Printer } from 'lucide-react'
import BearPanel from './BearPanel.jsx'
import PlanSheet from './PlanSheet.jsx'
import {
  ADJUST_ANSWERS,
  DURATIONS,
  LAST_WEEK_ANSWERS,
  SORT_MODES,
  createEntry,
  defaultMinutesFor,
  examplePlan,
  formatMonthDay,
  formatSlotLabel,
  formatSlotSentence,
  freeSlots,
  labelFor,
  maxPicksFor,
  planCandidates,
  sortCandidates,
  sortEntries,
} from '../weekPlan.js'

const BEAR = '/brand/gomgomi-question.webp'
const ORDER = ['start', 'pick', 'schedule', 'done']

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

// 이번 주 계획 세우기. The steps are already split up by the assignment data;
// what is decided here is which few to take on this week and when.
//
// Everything said so far stays on screen. Picking steps and setting times are
// one scrolling conversation, not two pages, so a learner can look back at
// what they chose while deciding the next thing.
export default function WeekPlanPanel({ stepCompletion, hasPlanned, onSave, onClose }) {
  const [stage, setStage] = useState('start')
  const [lastWeek, setLastWeek] = useState(null)
  const [adjust, setAdjust] = useState(null)
  const [exampleOpen, setExampleOpen] = useState(false)
  const [sortMode, setSortMode] = useState('due')
  const [picked, setPicked] = useState([])
  const [scheduleIndex, setScheduleIndex] = useState(0)
  const [draft, setDraft] = useState([])
  const [slotId, setSlotId] = useState(null)
  const [minutes, setMinutes] = useState(null)

  const candidates = useMemo(() => planCandidates(stepCompletion), [stepCompletion])
  const sorted = useMemo(() => sortCandidates(candidates, sortMode), [candidates, sortMode])
  const example = useMemo(() => examplePlan(stepCompletion), [stepCompletion])
  const slots = useMemo(() => freeSlots(new Date(), 8), [])

  const reached = (name) => ORDER.indexOf(stage) >= ORDER.indexOf(name)
  const maxPicks = maxPicksFor(adjust)
  const pickedRows = picked.map((id) => candidates.find((row) => row.stepId === id)).filter(Boolean)
  const currentRow = reached('schedule') ? pickedRows[scheduleIndex] : null
  const currentMinutes = minutes ?? defaultMinutesFor(adjust)
  const chosenSlot = slots.find((slot) => slot.id === slotId) || null
  const usedSlotIds = new Set(draft.map((entry) => entry.slotIso))
  const minPicks = Math.min(2, sorted.length)

  const subtitle =
    stage === 'start'
      ? hasPlanned
        ? '지난주 돌아보기'
        : '처음 사용할 때만 · 예시 계획'
      : stage === 'pick'
        ? '1/2 · 이번 주에 할 단계 고르기'
        : stage === 'schedule'
          ? '2/2 · 언제 할지 정하기'
          : '이번 주 계획 완성'

  function answerLastWeek(id) {
    setLastWeek(id)
    if (id === 'all') setStage('pick')
  }

  function answerAdjust(id) {
    setAdjust(id)
    setStage('pick')
  }

  function togglePick(stepId) {
    setPicked((current) => {
      if (current.includes(stepId)) return current.filter((id) => id !== stepId)
      if (current.length >= maxPicks) return current
      return [...current, stepId]
    })
  }

  function confirmSlot() {
    if (!currentRow || !chosenSlot) return
    setDraft([...draft, createEntry({ row: currentRow, slot: chosenSlot, minutes: currentMinutes })])
    setSlotId(null)
    setMinutes(null)
    if (scheduleIndex + 1 < pickedRows.length) setScheduleIndex(scheduleIndex + 1)
    else setStage('done')
  }

  const finished = sortEntries(draft)
  const scrollKey = `${stage}-${draft.length}-${lastWeek}-${adjust}-${exampleOpen}-${slotId}`

  return (
    <BearPanel
      title="곰곰이와 이번 주 계획 세우기"
      subtitle={subtitle}
      titleId="week-plan-title"
      scrollKey={scrollKey}
      onClose={onClose}
    >
      {/* ── 시작: 처음이면 예시, 둘째 주부터는 돌아보기 ── */}
      {hasPlanned ? (
        <>
          <Bear>
            <p>지난주 계획, 어땠나요?</p>
          </Bear>
          {!lastWeek ? (
            <div className="plan-answers">
              {LAST_WEEK_ANSWERS.map((answer) => (
                <button key={answer.id} type="button" className="chat-chip" onClick={() => answerLastWeek(answer.id)}>
                  {answer.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <Me>{LAST_WEEK_ANSWERS.find((answer) => answer.id === lastWeek)?.label}</Me>
              {lastWeek !== 'all' ? (
                <>
                  <Bear>
                    <p>이번 주에는 어떻게 해 볼까요?</p>
                  </Bear>
                  {!adjust ? (
                    <div className="plan-answers">
                      {ADJUST_ANSWERS.map((answer) => (
                        <button
                          key={answer.id}
                          type="button"
                          className="chat-chip"
                          onClick={() => answerAdjust(answer.id)}
                        >
                          {answer.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Me>{ADJUST_ANSWERS.find((answer) => answer.id === adjust)?.label}</Me>
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      ) : (
        <>
          <Bear>
            <p>먼저 예시를 볼까요?</p>
          </Bear>
          <div className="start-choices">
            <button
              type="button"
              className={exampleOpen ? 'start-card is-on' : 'start-card'}
              aria-pressed={exampleOpen}
              disabled={reached('pick')}
              onClick={() => setExampleOpen((open) => !open)}
            >
              <Eye aria-hidden="true" size={36} />
              <span className="start-card-title">먼저 예시를 볼까요</span>
              <span className="start-card-sub">다른 학생의 한 주를 먼저 봐요</span>
            </button>
            <button
              type="button"
              className="start-card"
              disabled={reached('pick')}
              onClick={() => setStage('pick')}
            >
              <CalendarPlus aria-hidden="true" size={36} />
              <span className="start-card-title">나도 세워 볼게요</span>
              <span className="start-card-sub">이번 주에 할 단계를 골라요</span>
            </button>
          </div>
          {exampleOpen ? <PlanSheet entries={example} tag="예시" className="is-example" /> : null}
        </>
      )}

      {/* ── 1/2 이번 주에 할 단계 고르기 ── */}
      {reached('pick') ? (
        <>
          <Bear>
            <p>{sortMode === 'difficulty' ? '어려운 순서로 정리했어요.' : '마감이 가까운 순서로 정리했어요.'}</p>
            <p>이번 주에 할 단계를 {maxPicks === 2 ? '2개' : '2~3개'}만 골라 보세요.</p>
          </Bear>
          <div className="plan-sort">
            <span className="plan-sort-label">순서</span>
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
              <p className="plan-note">
                목표일은 마감일에서 거꾸로 계산해 마지막 단계를 마감 1–2일 전으로 잡았어요.
              </p>
              <div className="chat-choices">
                <button
                  type="button"
                  className="btn primary"
                  disabled={picked.length < minPicks}
                  onClick={() => setStage('schedule')}
                >
                  {picked.length}개 골랐어요
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {/* ── 2/2 언제 할지 정하기: 정한 것은 대화로 남고 다음 단계가 이어짐 ── */}
      {reached('schedule') ? (
        <>
          <Me>{picked.length}개 골랐어요</Me>
          {draft.map((entry) => (
            <div key={entry.stepId}>
              <Bear>
                <p>
                  <b>
                    {entry.subjectName} {entry.stepNumber}단계
                  </b>
                  는 언제 할까요?
                </p>
              </Bear>
              <Me>
                {formatSlotLabel({ date: new Date(entry.slotIso), nextWeek: entry.nextWeek })} · {entry.minutes}분
              </Me>
            </div>
          ))}
        </>
      ) : null}

      {currentRow ? (
        <>
          <Bear>
            <p>
              <b>{labelFor(currentRow)}</b>는 언제 할까요?
            </p>
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
                  {formatSlotLabel(slot)}
                  {used ? <span className="slot-used">이미 정함</span> : null}
                </button>
              )
            })}
          </div>
          {slots.length === 0 ? <p className="plan-note">이번 주와 다음 주 시간표에 빈 시간이 없어요.</p> : null}

          <div className="plan-sort">
            <span className="plan-sort-label">한 번에</span>
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
          {adjust === 'shorter' && minutes === null ? (
            <p className="plan-note">지난주에 “시간을 더 짧게 해 볼래요”를 골라서 10분이 선택돼 있어요.</p>
          ) : null}

          {chosenSlot ? (
            <>
              <Bear>
                <p>
                  {formatSlotSentence(chosenSlot)} · {labelFor(currentRow)} · {currentMinutes}분
                </p>
                <p>이렇게 할까요?</p>
              </Bear>
              <div className="plan-answers">
                <button type="button" className="chat-chip" onClick={confirmSlot}>
                  좋아요
                </button>
                <button type="button" className="chat-chip" onClick={() => setSlotId(null)}>
                  다른 시간 고를래요
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {/* ── 완성 ── */}
      {stage === 'done' ? (
        <>
          <Bear>
            <p>이번 주 계획이 완성됐어요.</p>
          </Bear>
          <PlanSheet entries={finished} />
          <div className="chat-choices">
            <button type="button" className="btn primary" onClick={() => onSave(finished)}>
              홈에 저장
            </button>
            <button type="button" className="btn" onClick={() => window.print()}>
              <Printer aria-hidden="true" size={16} />
              인쇄하기
            </button>
          </div>
          <PlanSheet entries={finished} className="print-sheet" />
        </>
      ) : null}
    </BearPanel>
  )
}
