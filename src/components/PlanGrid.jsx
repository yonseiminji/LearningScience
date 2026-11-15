import { useEffect, useRef, useState } from 'react'
import { DAY_END, DAY_START, subjectById } from '../assignmentModel.js'
import { SNAP_MINUTES, blockFits, weekGrid } from '../weekPlan.js'
import { fromSeoulDate } from '../planTime.js'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const SPAN = DAY_END - DAY_START
const HOUR_PX = 46

function clockLabel(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function snap(minutes) {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
}

/**
 * One week of the timetable, with the study block the learner is placing.
 *
 * Classes are drawn where they are and cannot be moved. The study block
 * starts at a time worked out from the gaps between them, and from there the
 * learner drags it anywhere it fits. A position that overlaps a class or
 * falls outside the day is refused while dragging rather than corrected
 * afterwards, so the block never lands somewhere it cannot stay.
 *
 * Dragging is not the only way: the block is a button, and the arrow keys
 * move it by half an hour or a day. A pointer is not something to require.
 */
export default function PlanGrid({ value, minutes, onChange, now = new Date(), busy = [] }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const gridRef = useRef(null)
  const days = weekGrid(now, weekOffset)

  // Follow the block when it moves to the other week, so it stays on screen.
  useEffect(() => {
    if (!value) return
    const here = days.some((day) => day.dateString === value.dateString)
    if (!here) setWeekOffset((prev) => (prev === 0 ? 1 : 0))
    // days is derived from weekOffset; reacting to the value alone is right
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.dateString])

  function place(dateString, startMinutes) {
    const start = snap(Math.max(DAY_START, Math.min(startMinutes, DAY_END - minutes)))
    if (!blockFits(dateString, start, minutes)) return
    if (overlapsBusy(dateString, start)) return
    onChange({ dateString, startMinutes: start })
  }

  function overlapsBusy(dateString, start) {
    return busy.some(
      (item) =>
        item.dateString === dateString && start < item.startMinutes + item.minutes && start + minutes > item.startMinutes,
    )
  }

  function fromPointer(event) {
    const grid = gridRef.current
    if (!grid) return null
    const box = grid.getBoundingClientRect()
    const column = Math.floor(((event.clientX - box.left) / box.width) * days.length)
    const day = days[Math.max(0, Math.min(column, days.length - 1))]
    const offset = ((event.clientY - box.top) / box.height) * SPAN
    return { dateString: day.dateString, startMinutes: DAY_START + offset - minutes / 2 }
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function onPointerMove(event) {
    if (!dragging) return
    const at = fromPointer(event)
    if (at) place(at.dateString, at.startMinutes)
  }

  function onPointerUp(event) {
    if (!dragging) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    setDragging(false)
  }

  function onKeyDown(event) {
    if (!value) return
    const index = days.findIndex((day) => day.dateString === value.dateString)
    const moves = {
      ArrowUp: () => place(value.dateString, value.startMinutes - SNAP_MINUTES),
      ArrowDown: () => place(value.dateString, value.startMinutes + SNAP_MINUTES),
      ArrowLeft: () => index > 0 && place(days[index - 1].dateString, value.startMinutes),
      ArrowRight: () => index < days.length - 1 && place(days[index + 1].dateString, value.startMinutes),
    }
    if (!moves[event.key]) return
    event.preventDefault()
    moves[event.key]()
  }

  const top = (start) => ((start - DAY_START) / SPAN) * 100
  const height = (length) => (length / SPAN) * 100

  return (
    <div className="plan-grid-wrap">
      <div className="plan-grid-head">
        <button type="button" className="btn" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>
          이번 주
        </button>
        <button type="button" className="btn" disabled={weekOffset === 1} onClick={() => setWeekOffset(1)}>
          다음 주
        </button>
        <p className="plan-grid-hint">블록을 끌어서 옮기거나, 선택한 뒤 화살표 키로 옮길 수 있어요.</p>
      </div>

      <div className="plan-grid">
        <div className="plan-grid-hours" aria-hidden="true">
          {Array.from({ length: Math.floor(SPAN / 60) + 1 }, (_, at) => (
            <span key={at} style={{ top: `${(at * 60 * 100) / SPAN}%` }}>
              {clockLabel(DAY_START + at * 60)}
            </span>
          ))}
        </div>

        <div className="plan-grid-days" ref={gridRef} style={{ height: `${(SPAN / 60) * HOUR_PX}px` }}>
          {days.map((day) => {
            const mine = value?.dateString === day.dateString ? value : null
            const date = fromSeoulDate(day.dateString, 12)
            return (
              <div key={day.dateString} className="plan-grid-day">
                <span className="plan-grid-dayname">
                  {DAY_NAMES[day.weekday]}
                  <b>{date ? date.getDate() : ''}</b>
                </span>

                {day.classes.map((item) => (
                  <span
                    key={item.id}
                    className="plan-grid-class"
                    style={{ top: `${top(item.from)}%`, height: `${height(item.to - item.from)}%` }}
                    title={`${subjectById(item.subjectId)?.name || ''} ${item.start}–${item.end}`}
                  >
                    {subjectById(item.subjectId)?.name || '수업'}
                  </span>
                ))}

                {busy
                  .filter((item) => item.dateString === day.dateString)
                  .map((item) => (
                    <span
                      key={`${item.dateString}-${item.startMinutes}`}
                      className="plan-grid-taken"
                      style={{ top: `${top(item.startMinutes)}%`, height: `${height(item.minutes)}%` }}
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  ))}

                {mine ? (
                  <button
                    type="button"
                    className={`plan-grid-block${dragging ? ' is-dragging' : ''}`}
                    style={{ top: `${top(mine.startMinutes)}%`, height: `${height(minutes)}%` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onKeyDown={onKeyDown}
                    aria-label={`${DAY_NAMES[day.weekday]}요일 ${clockLabel(mine.startMinutes)}부터 ${minutes}분. 화살표 키로 옮겨요.`}
                  >
                    {clockLabel(mine.startMinutes)}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
