import { useEffect, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Circle, Play } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import ProgressRing from './ProgressRing.jsx'
import { data, ddayLabel, dueChipClass, formatDue, stepCounts } from '../assignmentModel.js'
import { formatMonthDay, stepTargetDate } from '../weekPlan.js'

export default function TodoPage({ stepCompletion, focusSubjectId, onToggleStep, onOpen }) {
  const reduce = useReducedMotion()
  // one subject open at a time; a class clicked in the timetable opens that subject
  const [openId, setOpenId] = useState(focusSubjectId || data.subjects[0]?.id)

  useEffect(() => {
    if (!focusSubjectId) return
    setOpenId(focusSubjectId)
    document.getElementById(`todo-${focusSubjectId}`)?.scrollIntoView({ block: 'start' })
  }, [focusSubjectId])

  const subjects = [...data.subjects].sort((a, b) => {
    if (a.id === focusSubjectId) return -1
    if (b.id === focusSubjectId) return 1
    return 0
  })

  return (
    <div className="todo-page">
      <h1>{focusSubjectId ? `${data.subjects.find((item) => item.id === focusSubjectId)?.name} 할 일` : '나의 할 일'}</h1>
      <p className="summary">과목마다 작은 단계로 나누어 두었어요</p>
      <div className="todo-list">
        {subjects.map((subject) => {
          const assignment = data.assignments.find((item) => item.subjectId === subject.id)
          if (!assignment) return null
          const counts = stepCounts(assignment, stepCompletion)
          const open = openId === subject.id
          const nextStep = assignment.steps.find((step) => !stepCompletion[step.id])
          const bodyId = `todo-${subject.id}-steps`
          return (
            <section
              key={subject.id}
              id={`todo-${subject.id}`}
              className={`todo-item${open ? ' is-open' : ''}${subject.id === focusSubjectId ? ' is-focus' : ''}`}
              aria-labelledby={`todo-${subject.id}-title`}
            >
              <button
                type="button"
                className="todo-row"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() => setOpenId(open ? null : subject.id)}
              >
                <span className="todo-subject">
                  <span className={`subject-dot dot-${subject.colorToken}`} aria-hidden="true" />
                  {subject.name}
                </span>
                <span className="todo-main">
                  <span id={`todo-${subject.id}-title`} className="todo-title">
                    {assignment.title}
                  </span>
                  <span className="due-row">
                    <span className={dueChipClass(assignment.dueAt)}>{ddayLabel(assignment.dueAt)}</span>
                    <span>{formatDue(assignment.dueAt)}</span>
                  </span>
                </span>
                <ProgressRing done={counts.done} total={counts.total} />
                <span className="todo-chevron" aria-hidden="true">
                  <ChevronDown size={20} />
                </span>
              </button>
              {open ? (
                <div id={bodyId} className="todo-body">
                  <ul className="check-list">
                    {assignment.steps.map((step, index) => {
                      const checked = Boolean(stepCompletion[step.id])
                      const isNext = nextStep?.id === step.id
                      // only the step in hand carries a target date, so the
                      // list does not read as a wall of deadlines
                      const target = isNext ? stepTargetDate(assignment, index) : null
                      return (
                        <li key={step.id} className={`${checked ? 'is-done' : ''}${isNext ? ' is-next' : ''}`}>
                          <label>
                            <input type="checkbox" checked={checked} onChange={() => onToggleStep(assignment, step.id)} />
                            <motion.span
                              initial={false}
                              animate={reduce || !checked ? { scale: 1 } : { scale: [0.96, 1] }}
                              transition={{ duration: reduce ? 0 : 0.2 }}
                            >
                              {step.title}
                            </motion.span>
                            {target ? <span className="step-target">목표 {formatMonthDay(target)}</span> : null}
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
                  <button type="button" className="btn todo-open" onClick={() => onOpen(subject.id)}>
                    자세히 보기
                    <ChevronRight aria-hidden="true" size={16} />
                  </button>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}
