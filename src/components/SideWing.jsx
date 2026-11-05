import ChagokBlocks from './ChagokBlocks.jsx'
import { courseById } from '../studyModel.js'

function WeekIcon() {
  return (
    <svg className="wing-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9h16M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CourseIcon() {
  return (
    <svg className="wing-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5 12 4l8 3.5L12 11 4 7.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 9.2v4.2c0 .8 1.8 2.1 4 2.1s4-1.3 4-2.1V9.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function LearnedIcon() {
  return (
    <svg className="wing-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 0 6 22V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 18.5h12" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function SideWing({ wing, week, nextTask }) {
  const talked = courseById(wing.most_talked_course_id)
  const weekText =
    week.total === 0
      ? '이번 주에 담은 할 일은 아직 없어요'
      : week.done === week.total
        ? `할 일 ${week.total}개를 모두 끝냈어요`
        : `할 일 ${week.total}개 중 ${week.done}개를 끝냈어요`

  return (
    <aside className="wing" aria-label="이번 주 보충 정보">
      <section className="wing-group">
        <h2>
          <WeekIcon />
          이번주
        </h2>
        <p>{weekText}</p>
        {week.total > 0 ? <ChagokBlocks done={week.done} total={week.total} /> : null}
        {nextTask ? (
          <p className="wing-next">
            다음 마감 · {nextTask.course?.name} · {nextTask.next.action}
            <span className="due-chip">{nextTask.dueLabel}</span>
          </p>
        ) : null}
      </section>
      <section className="wing-group">
        <h2>
          <CourseIcon />
          가장 많이 이야기한 수업
        </h2>
        <p className="wing-strong">{talked ? talked.name : '아직 없어요'}</p>
      </section>
      <section className="wing-group">
        <h2>
          <LearnedIcon />
          최근에 배운 것
        </h2>
        <ul className="learned">
          {wing.learned.map((item) => {
            const course = courseById(item.course_id)
            return (
              <li key={`${item.course_id}-${item.word}`}>
                <span className="learned-word">{item.word}</span>
                <span className="learned-course">{course ? course.name : ''}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}
