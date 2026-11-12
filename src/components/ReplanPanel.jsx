import { useMemo, useState } from 'react'
import BearPanel from './BearPanel.jsx'
import {
  SHORT_MINUTES,
  formatKoreanDate,
  formatSlotLabel,
  formatSlotSentence,
  freeSlots,
} from '../weekPlan.js'

const BEAR = '/brand/gomgomi-question.webp'

// 계획 다시 짜기. Only reachable from a planned step whose hour has gone by.
// The wording stays on what is next — 아직이에요, 다시 — and never names the
// miss as a delay or a failure.
export default function ReplanPanel({ entry, otherSlotIsos = [], onSave, onClose }) {
  const [slotId, setSlotId] = useState(null)
  const [minutes, setMinutes] = useState(entry.minutes)

  const slots = useMemo(() => freeSlots(new Date(), 8), [])
  const taken = new Set(otherSlotIsos)
  const chosenSlot = slots.find((slot) => slot.id === slotId) || null
  const label = `${entry.subjectName} ${entry.stepNumber}단계`
  const target = entry.targetDate ? new Date(entry.targetDate) : null
  const due = entry.dueAt ? new Date(entry.dueAt) : null

  return (
    <BearPanel
      title="곰곰이와 계획 다시 짜기"
      subtitle="목표일이 지난 단계가 있을 때만"
      titleId="replan-title"
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
        {target ? `원래 목표: ${formatKoreanDate(target)}` : null}
        {target && due ? ' · ' : null}
        {due ? `마감: ${formatKoreanDate(due)}` : null}
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
              onClick={() => setSlotId(slot.id)}
            >
              {formatSlotLabel(slot)}
              {used ? <span className="slot-used">이미 정함</span> : null}
            </button>
          )
        })}
      </div>
      {slots.length === 0 ? <p className="plan-note">이번 주와 다음 주 시간표에 빈 시간이 없어요.</p> : null}

      {minutes > SHORT_MINUTES ? (
        <button type="button" className="chat-chip replan-shorter" onClick={() => setMinutes(SHORT_MINUTES)}>
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
                {formatSlotSentence(chosenSlot)} · {label} · {minutes}분
              </p>
              <p>이렇게 할까요?</p>
            </div>
          </div>
          <div className="plan-answers">
            <button
              type="button"
              className="chat-chip"
              onClick={() => onSave({ ...entry, scheduledAt: chosenSlot.id, minutes })}
            >
              좋아요
            </button>
            <button type="button" className="chat-chip" onClick={() => setSlotId(null)}>
              다른 시간 고를래요
            </button>
          </div>
        </>
      ) : null}
    </BearPanel>
  )
}
