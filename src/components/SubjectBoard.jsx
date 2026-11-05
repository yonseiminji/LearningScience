import { BookOpen, Brain, House, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import ChagokBlocks from './ChagokBlocks.jsx'
import { data, ddayLabel, formatDue, stepCounts } from '../assignmentModel.js'

const ICONS = { BookOpen, Users, Brain }

export default function SubjectBoard({ stepCompletion, onToggleStep, onOpen }) {
  const reduce = useReducedMotion()

  return (
    <motion.section
      className="board"
      aria-labelledby="now-heading"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.2, 0, 0, 1] }}
    >
      <h2 id="now-heading" className="board-title">
        <House aria-hidden="true" />
        지금 무엇을 해야 하지?
      </h2>
      <div className="subject-grid">
        {data.subjects.map((subject) => {
          const assignment = data.assignments.find((item) => item.subjectId === subject.id)
          if (!assignment) return null
          const Icon = ICONS[subject.icon] || BookOpen
          const counts = stepCounts(assignment, stepCompletion)
          return (
            <article key={subject.id} id={`subject-${subject.id}`} className={`subject-card tone-${subject.colorToken}`}>
              <div className="card-top">
                <Icon aria-hidden="true" />
                <span>{subject.name}</span>
              </div>
              <h3>{assignment.title}</h3>
              <p className="due-row">
                <span>{formatDue(assignment.dueAt)}</span>{' '}
                <span className="due-chip">{ddayLabel(assignment.dueAt)}</span>
              </p>
              <ChagokBlocks done={counts.done} total={counts.total} />
              <p className="num count-line">
                {counts.done}/{counts.total}
              </p>
              <ul className="check-list">
                {assignment.steps.map((step) => {
                  const checked = Boolean(stepCompletion[step.id])
                  return (
                    <li key={step.id} className={checked ? 'is-done' : ''}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleStep(assignment, step.id)}
                        />
                        <motion.span
                          initial={false}
                          animate={reduce || !checked ? { scale: 1 } : { scale: [0.96, 1] }}
                          transition={{ duration: reduce ? 0 : 0.2 }}
                        >
                          {step.title}
                        </motion.span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              {assignment.demoOnly ? <p className="hint">데모용 가상 자료</p> : null}
              <button type="button" className="btn primary" onClick={() => onOpen(subject.id)}>
                자세히 보기
              </button>
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
