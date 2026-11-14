import { CalendarPlus, Check, ListChecks, RotateCcw } from 'lucide-react'
import ChagokBlocks from './ChagokBlocks.jsx'
import { data, ddayLabel, dueChipClass, subjectById } from '../assignmentModel.js'
import { entryStatus, formatSlotLabel, sortEntries } from '../weekPlan.js'

function dueDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return match ? `${Number(match[2])}월 ${Number(match[3])}일` : ''
}

export default function SideWing({ stepCompletion, planEntries = [], onStartPlan, onReplan, onOpenTasks, onOpenChat }) {
  // 이번주 is the week the learner actually took on, not every step in every
  // assignment. Before a plan exists there is nothing to count, so the block
  // asks for one instead of showing a dozen empty squares.
  const plan = sortEntries(planEntries)
  const planned = plan.length
  const done = plan.filter((entry) => stepCompletion[entry.stepId]).length
  const upcoming = data.assignments.slice().sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const nearestOpenId = upcoming.find((assignment) => assignment.steps.some((step) => !stepCompletion[step.id]))?.id

  return (
    <aside className="wing" aria-label="이번 주 계획">
      <section className="wing-group wing-week">
        <h2>이번주</h2>
        {planned === 0 ? (
          <>
            <p className="wing-empty">아직 이번 주 계획이 없어요. 할 단계를 두세 개만 골라 볼까요?</p>
            <button type="button" className="btn primary wing-plan-start" onClick={onStartPlan}>
              <CalendarPlus aria-hidden="true" size={16} />
              이번 주 계획 세우기
            </button>
          </>
        ) : (
          <>
            <div className="wing-count">
              <ChagokBlocks done={done} total={planned} />
              <span className="num">
                {done}/{planned}
              </span>
            </div>
            <div className="wing-plan">
              <h3>이번 주 계획</h3>
              <ul className="wing-plan-list">
                {plan.map((entry) => {
                  const status = entryStatus(entry, stepCompletion)
                  return (
                    <li key={entry.stepId} className={`is-${status}`}>
                      <span className="wing-plan-when">
                        {formatSlotLabel(entry.scheduledAt)}
                      </span>
                      <span className="wing-plan-what">
                        <span className="wing-plan-step">
                          {entry.subjectName} {entry.stepNumber}단계 · {entry.minutes}분
                        </span>
                        {status === 'done' ? (
                          <span className="wing-plan-state is-done">
                            <Check aria-hidden="true" size={13} />다 했어요
                          </span>
                        ) : status === 'missed' ? (
                          <>
                            <span className="wing-plan-state">아직이에요</span>
                            <button type="button" className="btn wing-replan" onClick={() => onReplan(entry)}>
                              <RotateCcw aria-hidden="true" size={13} />
                              다시 정하기
                            </button>
                          </>
                        ) : (
                          <span className="wing-plan-sub">{entry.stepTitle}</span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
            <button type="button" className="btn ghost wing-tasks" onClick={onOpenTasks}>
              <ListChecks aria-hidden="true" size={16} />
              나의 할 일 보기
            </button>
            <button type="button" className="btn wing-plan-start" onClick={onStartPlan}>
              <CalendarPlus aria-hidden="true" size={16} />
              계획 다시 세우기
            </button>
          </>
        )}
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

      <button type="button" className="bear-fab" onClick={onOpenChat}>
        <img src="/brand/gomgomi-question.webp" alt="" />
        질문하기
      </button>
    </aside>
  )
}
