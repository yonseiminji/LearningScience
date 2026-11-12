import { useEffect, useState } from 'react'
import { CalendarCheck, Check, ChevronDown, ChevronRight, Circle, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import ProgressRing from './ProgressRing.jsx'
import { data, ddayLabel, dueChipClass, formatDue } from '../assignmentModel.js'
import { formatMonthDay, formatSlotLabel, planBySubject, planEntriesOf } from '../weekPlan.js'

// 나의 할 일 is this week's plan, not the whole backlog. It reads the plan
// document the 곰곰이 conversation produced: only the steps the learner set
// aside time for appear here, in the order they set them.
export default function TodoPage({ plan, stepCompletion, focusSubjectId, onToggleStep, onOpen }) {
  const reduce = useReducedMotion()
  const groups = planBySubject(plan, stepCompletion)
  const [openId, setOpenId] = useState(focusSubjectId || groups[0]?.subjectId || null)

  useEffect(() => {
    if (!focusSubjectId) return
    setOpenId(focusSubjectId)
    document.getElementById(`todo-${focusSubjectId}`)?.scrollIntoView({ block: 'start' })
  }, [focusSubjectId])

  const ordered = [...groups].sort((a, b) => {
    if (a.subjectId === focusSubjectId) return -1
    if (b.subjectId === focusSubjectId) return 1
    return 0
  })

  const title = focusSubjectId
    ? `${data.subjects.find((item) => item.id === focusSubjectId)?.name} 할 일`
    : '나의 할 일'

  return (
    <div className="todo-page">
      <div className="todo-page-head">
        <div>
          <h1>{title}</h1>
          <p className="summary">
            {planEntriesOf(plan).length > 0
              ? '이번 주에 하기로 한 단계예요'
              : '이번 주 계획을 세우면 여기에 모여요'}
          </p>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="todo-empty">
          <CalendarCheck aria-hidden="true" size={32} />
          <p className="todo-empty-title">아직 이번 주 계획이 없어요</p>
          <p className="hint">
            ‘이번주’ 칸에서 계획을 세우면, 이번 주에 하기로 한 단계가 여기에 모여요.
          </p>
        </div>
      ) : (
        <div className="todo-list">
          {ordered.map((group) => {
            const open = openId === group.subjectId
            const nextEntry = group.entries.find((entry) => !stepCompletion[entry.stepId])
            const bodyId = `todo-${group.subjectId}-steps`
            return (
              <section
                key={group.subjectId}
                id={`todo-${group.subjectId}`}
                className={`todo-item${open ? ' is-open' : ''}${group.subjectId === focusSubjectId ? ' is-focus' : ''}`}
                aria-labelledby={`todo-${group.subjectId}-title`}
              >
                <button
                  type="button"
                  className="todo-row"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => setOpenId(open ? null : group.subjectId)}
                >
                  <span className="todo-subject">
                    <span className={`subject-dot dot-${group.colorToken}`} aria-hidden="true" />
                    {group.subjectName}
                  </span>
                  <span className="todo-main">
                    <span id={`todo-${group.subjectId}-title`} className="todo-title">
                      {group.assignmentTitle}
                    </span>
                    <span className="due-row">
                      <span className={dueChipClass(group.dueAt)}>{ddayLabel(group.dueAt)}</span>
                      <span>{formatDue(group.dueAt)}</span>
                    </span>
                  </span>
                  <ProgressRing done={group.done} total={group.total} />
                  <span className="todo-chevron" aria-hidden="true">
                    <ChevronDown size={20} />
                  </span>
                </button>
                {open ? (
                  <div id={bodyId} className="todo-body">
                    <ul className="check-list">
                      {group.entries.map((entry) => {
                        const checked = Boolean(stepCompletion[entry.stepId])
                        const isNext = nextEntry?.stepId === entry.stepId
                        const assignment = data.assignments.find((item) => item.id === entry.assignmentId)
                        return (
                          <li key={entry.stepId} className={`${checked ? 'is-done' : ''}${isNext ? ' is-next' : ''}`}>
                            <label>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggleStep(assignment, entry.stepId)}
                              />
                              <motion.span
                                initial={false}
                                animate={reduce || !checked ? { scale: 1 } : { scale: [0.96, 1] }}
                                transition={{ duration: reduce ? 0 : 0.2 }}
                              >
                                {entry.stepTitle}
                              </motion.span>
                              <span className="step-when">
                                {formatSlotLabel(entry.scheduledAt)} · {entry.minutes}분
                              </span>
                              {/* only the step in hand carries a target date */}
                              {isNext && entry.targetDate ? (
                                <span className="step-target">목표 {formatMonthDay(entry.targetDate)}</span>
                              ) : null}
                              {checked ? (
                                <span className="step-status is-done">
                                  <Check aria-hidden="true" size={12} />
                                  완료
                                </span>
                              ) : isNext ? (
                                <span className="step-status is-now">
                                  <Play aria-hidden="true" size={12} />
                                  진행 중
                                </span>
                              ) : (
                                <span className="step-status is-wait">
                                  <Circle aria-hidden="true" size={12} />
                                  대기
                                </span>
                              )}
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                    <button type="button" className="btn todo-open" onClick={() => onOpen(group.subjectId)}>
                      자세히 보기
                      <ChevronRight aria-hidden="true" size={16} />
                    </button>
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
