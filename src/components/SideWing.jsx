import { ListChecks } from 'lucide-react'
import ChagokBlocks from './ChagokBlocks.jsx'
import { data, ddayLabel, dueChipClass, subjectById } from '../assignmentModel.js'

function dueDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return match ? `${Number(match[2])}월 ${Number(match[3])}일` : ''
}

export default function SideWing({ counts, stepCompletion, onOpenTasks, onOpenChat }) {
  const left = counts.total - counts.done
  const upcoming = data.assignments.slice().sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const nearestOpenId = upcoming.find((assignment) => assignment.steps.some((step) => !stepCompletion[step.id]))?.id

  return (
    <aside className="wing" aria-label="이번 주 계획">
      <section className="wing-group">
        <h2>이번주</h2>
        <div className="wing-count">
          <ChagokBlocks done={counts.done} total={counts.total} />
          <span className="num">
            {counts.done}/{counts.total}
          </span>
        </div>
      </section>
      <section className="wing-group">
        <h2>다가오는 마감</h2>
        <ul className="due-list">
          {upcoming.map((assignment) => {
            const subject = subjectById(assignment.subjectId)
            const finished = assignment.steps.every((step) => stepCompletion[step.id])
            return (
              <li key={assignment.id} className={finished ? 'is-done' : ''}>
                <span className={`subject-dot dot-${subject?.colorToken}`} aria-hidden="true" />
                <span className="due-name">{subject?.name}</span>
                <span className="due-date">{finished ? '완료' : dueDate(assignment.dueAt)}</span>
                <span className={`${dueChipClass(assignment.dueAt)}${assignment.id === nearestOpenId ? ' is-near' : ''}`}>
                  {ddayLabel(assignment.dueAt)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="wing-group">
        <h2>이번 주 남은 할 일</h2>
        <p className="wing-left">
          {left > 0 ? (
            <>
              <b className="num">{left}</b>단계 남았어요
            </>
          ) : (
            '모두 끝냈어요'
          )}
        </p>
        <button type="button" className="btn ghost wing-tasks" onClick={onOpenTasks}>
          <ListChecks aria-hidden="true" size={16} />
          나의 할 일 보기
        </button>
      </section>
      <button type="button" className="bear-fab" onClick={onOpenChat}>
        <img src="/brand/gomgomi-question.webp" alt="" />
        질문하기
      </button>
    </aside>
  )
}
