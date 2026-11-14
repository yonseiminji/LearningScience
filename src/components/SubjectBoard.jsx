import { ArrowRight, ChevronRight, MessageCircle } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { data } from '../assignmentModel.js'
import { COPY } from '../communication.js'

export default function SubjectBoard({ stepCompletion, onOpen, onOpenCommunication }) {
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
        나의 과제
      </h2>
      <div className="subject-grid">
        {data.subjects.map((subject) => {
          const assignment = data.assignments.find((item) => item.subjectId === subject.id)
          if (!assignment) return null
          // firstOpenStep falls back to the last step so navigation always has
          // somewhere to go. Here an absent next step has to stay absent, or a
          // finished assignment would advertise work that is already done.
          const nextStep = assignment.steps.find((step) => !stepCompletion[step.id])
          return (
            <article key={subject.id} id={`subject-${subject.id}`} className={`subject-card tone-${subject.colorToken}`}>
              <div className="card-top">
                <span className={`subject-dot dot-${subject.colorToken}`} aria-hidden="true" />
                <span>{subject.name}</span>
              </div>
              <h3>{assignment.title}</h3>
              {/* One step, not a fraction. A fraction needs a denominator,
                  and once an instruction is chunked automatically there is no
                  telling what that denominator will be; a step name also says
                  plainly that this is the assignment's progress and not the
                  subject's. */}
              <p className="next-step">
                {nextStep ? (
                  <>
                    <span className="next-step-label">다음단계:</span> {nextStep.title}
                  </>
                ) : (
                  '모든 단계를 마쳤어요.'
                )}
              </p>
              <button type="button" className="btn subject-open" onClick={() => onOpen(subject.id)}>
                강의탭 이동
                <ChevronRight aria-hidden="true" size={16} />
              </button>
            </article>
          )
        })}

        {/* 소통 준비하기 sits with the week's work: asking someone is one of
            the things a stuck learner can do next. */}
        <article className="subject-card commu-card">
          <span className="commu-card-icon" aria-hidden="true">
            <MessageCircle size={20} />
          </span>
          <div className="commu-card-main">
            <h3>{COPY.homeTitle}</h3>
            <p>{COPY.homeDescription}</p>
          </div>
          <button type="button" className="btn primary commu-card-open" onClick={onOpenCommunication}>
            {COPY.homeTitle}
            <ArrowRight aria-hidden="true" size={16} />
          </button>
        </article>
      </div>
    </motion.section>
  )
}
