import { ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { data } from '../assignmentModel.js'
import { studyLines } from '../studyHistory.js'

// The same subjects as 나의 과제, without the assignment, the deadline or the
// progress ring. This tab is for picking a lecture to work on, so a due date
// here would only pull attention back to the thing the other tab is for.
//
// Each card says when the subject was last studied with the Tutor and what
// was covered. That is a record of what was read, not a verdict on how well
// it was understood, and the wording stays on the first side of that line.
// With no record there is no blank to fill in — the card asks to begin.
export default function LectureBoard({ onOpen, studyHistory = {} }) {
  const reduce = useReducedMotion()

  return (
    <motion.section
      className="board"
      aria-labelledby="lectures-heading"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.2, 0, 0, 1] }}
    >
      <h2 id="lectures-heading" className="board-title">
        강의
      </h2>
      <div className="subject-grid">
        {data.subjects.map((subject) => {
          const lines = studyLines(studyHistory[subject.id])
          return (
            <article key={subject.id} className={`subject-card lecture-card tone-${subject.colorToken}`}>
              <div className="card-top">
                <span className={`subject-dot dot-${subject.colorToken}`} aria-hidden="true" />
                <span>{subject.name}</span>
              </div>
              <div className="lecture-recent">
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button type="button" className="btn subject-open" onClick={() => onOpen(subject.id)}>
                강의탭 이동
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
