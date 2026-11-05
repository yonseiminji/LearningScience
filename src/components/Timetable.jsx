import { data, DAY_END, DAY_START, WEEKDAYS, clockMinutes, subjectById } from '../assignmentModel.js'

const HOUR = 52
const hours = []
for (let minute = DAY_START; minute < DAY_END; minute += 60) {
  hours.push(`${String(minute / 60).padStart(2, '0')}:00`)
}

export default function Timetable({ onOpenSubject }) {
  const span = DAY_END - DAY_START

  return (
    <div className="timetable">
      <h1>시간표</h1>
      <p className="summary">수업을 누르면 그 과목의 할 일로 이동합니다. 등록은 데모이며 저장되지 않습니다.</p>
      <div className="cal-scroll">
        <div className="cal" role="table" aria-label="주간 수업 시간표">
          <div className="cal-head" role="row">
            <div className="cal-time-head" role="columnheader">
              시간
            </div>
            {WEEKDAYS.map((day) => (
              <div key={day.index} className="cal-day" role="columnheader">
                {day.label}
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
              <div key={day.index} className="cal-col" role="cell" style={{ height: (span / 60) * HOUR }}>
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
                        style={{ top, height }}
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
