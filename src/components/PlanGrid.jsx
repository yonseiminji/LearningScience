import { useEffect, useRef, useState } from 'react'
import { DAY_END, DAY_START, subjectById } from '../assignmentModel.js'
import { CELL_MINUTES, fitInCell, weekGrid } from '../weekPlan.js'
import { fromSeoulDate } from '../planTime.js'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const SPAN = DAY_END - DAY_START
const HOURS = Array.from({ length: Math.floor(SPAN / CELL_MINUTES) }, (_, at) => DAY_START + at * CELL_MINUTES)

function clockLabel(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/**
 * One week of the timetable, with the study block the learner is placing.
 *
 * Length first, then place: a 40-minute block and a 10-minute one do not fit
 * the same gaps, so the grid cannot say which cells are open until it knows
 * how long the sitting is. The buttons sit above the grid for that reason.
 *
 * Every hour of every day is a cell, and a cell is the drop target. Earlier
 * this dragged by the pixel and rewrote the time on every pointer move, which
 * meant aiming a 20-minute sliver at a half-hour line and watching it stick
 * whenever the path crossed a class. An hour-tall box is a target you can
 * actually hit, so the drag now only picks a cell and the time is settled on
 * release. Tapping a cell does the same thing without dragging at all.
 *
 * Dragging is not required: the block is a button, and the arrow keys move it
 * by an hour or a day.
 */
export default function PlanGrid({
  value,
  minutes,
  onChange,
  now = new Date(),
  busy = [],
  durations = [],
  onMinutesChange,
  durationLabel = '한 번에',
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [hover, setHover] = useState(null)
  const draggingRef = useRef(false)
  const days = weekGrid(now, weekOffset)

  // Follow the block when it moves to the other week, so it stays on screen.
  useEffect(() => {
    if (!value) return
    const here = days.some((day) => day.dateString === value.dateString)
    if (!here) setWeekOffset((prev) => (prev === 0 ? 1 : 0))
    // days is derived from weekOffset; reacting to the value alone is right
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.dateString])

  function place(dateString, hourStart) {
    const start = fitInCell(dateString, hourStart, minutes, busy)
    if (start === null) return false
    onChange({ dateString, startMinutes: start })
    return true
  }

  // elementFromPoint rather than arithmetic on the grid rect: the columns have
  // gaps and padding, and reading the cell under the pointer cannot drift.
  function cellFromPoint(event) {
    const found = document.elementFromPoint(event.clientX, event.clientY)
    const cell = found?.closest?.('[data-cell]')
    if (!cell) return null
    return { dateString: cell.dataset.date, hourStart: Number(cell.dataset.hour) }
  }

  function onPointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    draggingRef.current = true
    setHover(null)
  }

  function onPointerMove(event) {
    if (!draggingRef.current) return
    const at = cellFromPoint(event)
    if (!at) return setHover(null)
    setHover({ ...at, start: fitInCell(at.dateString, at.hourStart, minutes, busy) })
  }

  function onPointerUp(event) {
    if (!draggingRef.current) return
    draggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    const at = cellFromPoint(event)
    if (at) place(at.dateString, at.hourStart)
    setHover(null)
  }

  function onKeyDown(event) {
    if (!value) return
    const index = days.findIndex((day) => day.dateString === value.dateString)
    const hour = Math.floor(value.startMinutes / CELL_MINUTES) * CELL_MINUTES
    const moves = {
      ArrowUp: () => place(value.dateString, hour - CELL_MINUTES),
      ArrowDown: () => place(value.dateString, hour + CELL_MINUTES),
      ArrowLeft: () => index > 0 && place(days[index - 1].dateString, hour),
      ArrowRight: () => index < days.length - 1 && place(days[index + 1].dateString, hour),
    }
    if (!moves[event.key]) return
    event.preventDefault()
    moves[event.key]()
  }

  const top = (start) => ((start - DAY_START) / SPAN) * 100
  const height = (length) => (length / SPAN) * 100

  return (
    <div className="plan-grid-wrap">
      {durations.length > 0 && onMinutesChange ? (
        <div className="plan-grid-length">
          <span className="plan-grid-length-label">{durationLabel}</span>
          {durations.map((value_) => (
            <button
              key={value_}
              type="button"
              className={value_ === minutes ? 'chat-chip is-on' : 'chat-chip'}
              aria-pressed={value_ === minutes}
              onClick={() => onMinutesChange(value_)}
            >
              {value_}분
            </button>
          ))}
        </div>
      ) : null}

      <div className="plan-grid-head">
        <button type="button" className="btn" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>
          이번 주
        </button>
        <button type="button" className="btn" disabled={weekOffset === 1} onClick={() => setWeekOffset(1)}>
          다음 주
        </button>
        <p className="plan-grid-hint">칸을 누르면 그 시간으로 옮겨가요. 블록을 끌어다 놓아도 돼요.</p>
      </div>

      <div className="plan-grid">
        <span className="plan-grid-corner" aria-hidden="true" />
        <div className="plan-grid-names" aria-hidden="true">
          {days.map((day) => {
            const date = fromSeoulDate(day.dateString, 12)
            return (
              <span key={day.dateString} className="plan-grid-name">
                {DAY_NAMES[day.weekday]}
                <b>{date ? date.getDate() : ''}</b>
              </span>
            )
          })}
        </div>

        {/* Hours and cells share one row track, so the labels sit on the lines
            by construction instead of by a percentage that has to be kept in
            step with the day-name row's height. */}
        <div className="plan-grid-hours" aria-hidden="true">
          {HOURS.map((at) => (
            <span key={at}>{clockLabel(at)}</span>
          ))}
          <span className="plan-grid-hour-last">{clockLabel(DAY_END)}</span>
        </div>

        <div className="plan-grid-days">
          {days.map((day) => {
            const mine = value?.dateString === day.dateString ? value : null
            return (
              <div key={day.dateString} className="plan-grid-day">
                {HOURS.map((at) => {
                  const open = fitInCell(day.dateString, at, minutes, busy) !== null
                  const lit = hover?.dateString === day.dateString && hover?.hourStart === at
                  return (
                    <button
                      key={at}
                      type="button"
                      data-cell=""
                      data-date={day.dateString}
                      data-hour={at}
                      className={`plan-grid-cell${open ? '' : ' is-shut'}${lit ? (open ? ' is-over' : ' is-over-shut') : ''}`}
                      disabled={!open}
                      onClick={() => place(day.dateString, at)}
                      aria-label={`${DAY_NAMES[day.weekday]}요일 ${clockLabel(at)}${open ? '' : ' (놓을 수 없어요)'}`}
                    />
                  )
                })}

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

                {/* Where the block would land if the pointer let go here. */}
                {hover?.dateString === day.dateString && hover.start !== null ? (
                  <span
                    className="plan-grid-ghost"
                    style={{ top: `${top(hover.start)}%`, height: `${height(minutes)}%` }}
                  >
                    {clockLabel(hover.start)}
                  </span>
                ) : null}

                {mine ? (
                  <button
                    type="button"
                    className={`plan-grid-block${hover ? ' is-dragging' : ''}`}
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
