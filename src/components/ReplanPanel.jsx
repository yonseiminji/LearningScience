import { useMemo, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import BearPanel from './BearPanel.jsx'
import { CLASS_CHECK, validatePlan } from '../planValidation.js'
import {
  SHORT_MINUTES,
  buildPlan,
  createProposal,
  formatKoreanDate,
  formatSlotDateTime,
  formatSlotSentence,
  freeSlots,
  planEntriesOf,
} from '../weekPlan.js'

const BEAR = '/brand/gomgomi-question.webp'

// 계획 다시 짜기. Only reachable from a planned step whose hour has gone by.
// The wording stays on what is next — 아직이에요, 다시 — and never names the
// miss as a delay or a failure.
//
// The rebuilt plan goes through the same gate as a new one, so moving one
// sitting cannot quietly land it on top of a class or another sitting. If it
// is refused, the plan already saved is left untouched.
export default function ReplanPanel({ entry, plan, stepCompletion = {}, onSave, onClose }) {
  const [slotId, setSlotId] = useState(null)
  const [minutes, setMinutes] = useState(entry.minutes)
  const [refusal, setRefusal] = useState(null)

  const slots = useMemo(() => freeSlots(new Date(), 8), [])
  const taken = new Set(
    planEntriesOf(plan)
      .filter((item) => item.stepId !== entry.stepId)
      .map((item) => item.scheduledAt),
  )
  const chosenSlot = slots.find((slot) => slot.id === slotId) || null
  const label = `${entry.subjectName} ${entry.stepNumber}단계`

  function buildNext(slot) {
    const proposal = createProposal(
      planEntriesOf(plan).map((item) =>
        item.stepId === entry.stepId
          ? { stepId: item.stepId, scheduledAt: slot.id, minutes }
          : { stepId: item.stepId, scheduledAt: item.scheduledAt, minutes: item.minutes },
      ),
    )
    return buildPlan(proposal, {
      source: plan?.source || 'mock',
      review: plan?.review || {},
      settings: plan?.settings || {},
    })
  }

  function trySave() {
    if (!chosenSlot) return
    const next = buildNext(chosenSlot)
    const result = validatePlan(next, { stepCompletion, previousPlan: plan })
    if (result.ok) {
      onSave(next, result)
      return
    }
    setRefusal(result)
  }

  const preview = chosenSlot ? validatePlan(buildNext(chosenSlot), { stepCompletion, previousPlan: plan }) : null
  const classCheckSkipped = preview?.checks.classConflict === CLASS_CHECK.SKIPPED_NO_TIMETABLE

  return (
    <BearPanel
      title="곰곰이와 계획 다시 짜기"
      subtitle="목표일이 지난 단계가 있을 때만"
      titleId="replan-title"
      scrollKey={`${slotId}-${minutes}-${refusal ? 'x' : ''}`}
      onClose={onClose}
    >
      <div className="chat-row">
        <img src={BEAR} alt="" />
        <div className="chat-bear">
          <p>
            <b>{label}</b>는 아직이에요.
          </p>
          <p>언제 다시 해 볼까요?</p>
        </div>
      </div>
      <p className="plan-note replan-dates">
        {entry.targetDate ? `원래 목표: ${formatKoreanDate(entry.targetDate)}` : null}
        {entry.targetDate && entry.dueAt ? ' · ' : null}
        {entry.dueAt ? `마감: ${formatKoreanDate(entry.dueAt)}` : null}
      </p>

      <div className="slot-grid">
        {slots.map((slot) => {
          const used = taken.has(slot.id)
          return (
            <button
              key={slot.id}
              type="button"
              className={slot.id === slotId ? 'slot-chip is-on' : 'slot-chip'}
              aria-pressed={slot.id === slotId}
              disabled={used}
              onClick={() => {
                setSlotId(slot.id)
                setRefusal(null)
              }}
            >
              {formatSlotDateTime(slot.date)}
              {used ? <span className="slot-used">이미 정함</span> : null}
            </button>
          )
        })}
      </div>
      {slots.length === 0 ? <p className="plan-note">이번 주와 다음 주 시간표에 빈 시간이 없어요.</p> : null}

      {minutes > SHORT_MINUTES ? (
        <button
          type="button"
          className="chat-chip replan-shorter"
          onClick={() => {
            setMinutes(SHORT_MINUTES)
            setRefusal(null)
          }}
        >
          시간을 {SHORT_MINUTES}분으로 줄일래요
        </button>
      ) : (
        <p className="plan-note">한 번에 {minutes}분으로 해 볼게요.</p>
      )}

      {chosenSlot ? (
        <>
          <div className="chat-row">
            <img src={BEAR} alt="" />
            <div className="chat-bear">
              <p>
                {formatSlotSentence(chosenSlot.date)} · {label} · {minutes}분
              </p>
              <p>이렇게 할까요?</p>
            </div>
          </div>

          {refusal ? (
            <div className="plan-refusal" role="alert">
              <p className="plan-refusal-title">
                <TriangleAlert aria-hidden="true" size={16} />이 시간으로는 바꿀 수 없어요
              </p>
              <ul>
                {refusal.errors.map((error, index) => (
                  <li key={`${error.code}-${index}`}>{error.message}</li>
                ))}
              </ul>
              <p className="plan-note">다른 시간을 골라 주세요. 지금 저장된 계획은 그대로예요.</p>
            </div>
          ) : null}

          {!refusal && preview?.warnings.length ? (
            <div className="plan-caution">
              {preview.warnings.map((warning, index) => (
                <p key={`${warning.code}-${index}`}>{warning.message}</p>
              ))}
            </div>
          ) : null}

          {classCheckSkipped ? (
            <p className="plan-note">등록된 시간표가 없어서 수업 시간과 겹치는지는 확인하지 못했어요.</p>
          ) : null}

          <div className="plan-answers">
            <button type="button" className="chat-chip" onClick={trySave}>
              좋아요
            </button>
            <button
              type="button"
              className="chat-chip"
              onClick={() => {
                setSlotId(null)
                setRefusal(null)
              }}
            >
              다른 시간 고를래요
            </button>
          </div>
        </>
      ) : null}
    </BearPanel>
  )
}
