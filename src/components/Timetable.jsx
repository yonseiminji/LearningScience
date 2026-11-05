import { study, WEEKDAYS, DAY_START_MINUTES, DAY_END_MINUTES, clockMinutes } from '../studyModel.js'

const HOUR_HEIGHT = 52
const hours = []
for (let minute = DAY_START_MINUTES; minute < DAY_END_MINUTES; minute += 60) {
  const hour = minute / 60
  hours.push(`${String(hour).padStart(2, '0')}:00`)
}

export default function Timetable() {
  const span = DAY_END_MINUTES - DAY_START_MINUTES

  return (
    <div className="timetable">
      <h1>시간표</h1>
      <p className="summary">이번 학기 수업을 읽기 전용으로 보여 줍니다.</p>
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
                <div key={label} className="cal-hour" style={{ height: HOUR_HEIGHT }}>
                  {label}
                </div>
              ))}
            </div>
            {WEEKDAYS.map((day) => (
              <div
                key={day.index}
                className="cal-col"
                role="cell"
                style={{ height: (span / 60) * HOUR_HEIGHT }}
              >
                {hours.map((label, index) => (
                  <span key={label} className="cal-rule" style={{ top: index * HOUR_HEIGHT }} />
                ))}
                {study.courses
                  .filter((course) => course.day_index === day.index)
                  .map((course) => {
                    const start = clockMinutes(course.start)
                    const end = clockMinutes(course.end)
                    const top = ((start - DAY_START_MINUTES) / 60) * HOUR_HEIGHT
                    const height = ((end - start) / 60) * HOUR_HEIGHT
                    return (
                      <article
                        key={course.id}
                        className={`class-block tone-${course.tone}`}
                        style={{ top, height }}
                        aria-label={`${course.name}, ${course.day_label} ${course.start}부터 ${course.end}, ${course.room}`}
                      >
                        <p className="class-name">{course.name}</p>
                        <p className="class-meta">
                          {course.start}–{course.end}
                        </p>
                        <p className="class-meta">{course.room}</p>
                      </article>
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
