import { data, DAY_END, DAY_START, WEEKDAYS, clockMinutes, seoulToday, subjectById } from '../assignmentModel.js'

const HOUR = 52
// show only the hours that have classes: from DAY_START to the hour after the last class ends
const lastEnd = Math.max(...data.demoSchedule.map((item) => clockMinutes(item.end)))
const VIEW_END = Math.min(DAY_END, Math.ceil(lastEnd / 60) * 60)
const hours = []
for (let minute = DAY_START; minute < VIEW_END; minute += 60) {
  hours.push(`${String(minute / 60).padStart(2, '0')}:00`)
}

export default function Timetable({ onOpenSubject }) {
  const span = VIEW_END - DAY_START
  const todayIndex = seoulToday().getDay()

  return (
    <div className="timetable">
      <div className="tt-head">
        <h1>시간표</h1>
        <p className="summary">수업을 누르면 그 과목의 할 일로 이동해요</p>
      </div>
      <div className="cal-scroll">
        <div className="cal" role="table" aria-label="주간 수업 시간표">
          <div className="cal-head" role="row">
            <div className="cal-time-head" role="columnheader">
              <span className="sr-only">시간</span>
            </div>
            {WEEKDAYS.map((day) => (
              <div key={day.index} className={day.index === todayIndex ? 'cal-day is-today' : 'cal-day'} role="columnheader">
                {day.label}
                {day.index === todayIndex ? <span className="today-chip">오늘</span> : null}
              </div>
            ))}
          </div>
          <div className="cal-body">
            <div className="cal-times" aria-hidden="true">
              {hours.map((label) => (
                <div key={label} className="cal-hour" style={{ height: HOUR }}>
                  {label}
                </div>
              ))}
            </div>
            {WEEKDAYS.map((day) => (
              <div
                key={day.index}
                className={day.index === todayIndex ? 'cal-col is-today' : 'cal-col'}
                role="cell"
                style={{ height: (span / 60) * HOUR }}
              >
                {hours.map((label, index) => (
                  <span key={label} className="cal-rule" style={{ top: index * HOUR }} />
                ))}
                {data.demoSchedule
                  .filter((item) => item.dayOfWeek === day.index)
                  .map((item) => {
                    const subject = subjectById(item.subjectId)
                    const top = ((clockMinutes(item.start) - DAY_START) / 60) * HOUR
                    const height = ((clockMinutes(item.end) - clockMinutes(item.start)) / 60) * HOUR
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`class-block tone-${subject?.colorToken || 'brown'}`}
                        style={{ top: top + 2, height: height - 4 }}
                        onClick={() => onOpenSubject(item.subjectId)}
                      >
                        <span className="class-name">{subject?.name}</span>
                        <span className="class-meta">
                          {item.start}–{item.end}
                        </span>
                        <span className="class-meta">{item.room}</span>
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
