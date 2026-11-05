import { useEffect } from 'react'
import { BookOpen, Brain, Users } from 'lucide-react'
import ChagokBlocks from './ChagokBlocks.jsx'
import { data, ddayLabel, formatDue, stepCounts } from '../assignmentModel.js'

const ICONS = { BookOpen, Users, Brain }

export default function TodoPage({ stepCompletion, focusSubjectId, onToggleStep, onOpen }) {
  useEffect(() => {
    if (!focusSubjectId) return
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
      <p className="summary">과목마다 작은 확인 단계로 나누어 두었습니다.</p>
      {subjects.map((subject) => {
        const assignment = data.assignments.find((item) => item.subjectId === subject.id)
        if (!assignment) return null
        const Icon = ICONS[subject.icon] || BookOpen
        const counts = stepCounts(assignment, stepCompletion)
        return (
          <section
            key={subject.id}
            id={`todo-${subject.id}`}
            className={`panel${subject.id === focusSubjectId ? ' is-focus' : ''}`}
            aria-labelledby={`todo-${subject.id}-title`}
          >
            <div className="todo-head">
              <div>
                <p className="card-course">
                  <Icon aria-hidden="true" /> {subject.name}
                </p>
                <h2 id={`todo-${subject.id}-title`}>{assignment.title}</h2>
              </div>
              <ChagokBlocks done={counts.done} total={counts.total} />
            </div>
            <p className="due-row">
              <span>{formatDue(assignment.dueAt)}</span>{' '}
              <span className="due-chip">{ddayLabel(assignment.dueAt)}</span>
            </p>
            <ul className="check-list">
              {assignment.steps.map((step) => {
                const checked = Boolean(stepCompletion[step.id])
                return (
                  <li key={step.id} className={checked ? 'is-done' : ''}>
                    <label>
                      <input type="checkbox" checked={checked} onChange={() => onToggleStep(assignment, step.id)} />
                      <span>{step.title}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <button type="button" className="btn primary" onClick={() => onOpen(subject.id)}>
              자세히 보기
            </button>
          </section>
        )
      })}
    </div>
  )
}
