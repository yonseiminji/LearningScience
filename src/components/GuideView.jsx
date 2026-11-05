import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import ChagokBlocks from './ChagokBlocks.jsx'
import { segmentInstruction, stepCounts } from '../assignmentModel.js'

export default function GuideView({
  assignment,
  subject,
  stepCompletion,
  criterionCompletion,
  criterionResponses,
  activeStepId,
  onSelectStep,
  onChangeResponse,
  onSubmitCriterion,
  onCompleteStep,
  onBack,
}) {
  const reduce = useReducedMotion()
  const step = assignment.steps.find((item) => item.id === activeStepId) || assignment.steps[0]
  const counts = stepCounts(assignment, stepCompletion)
  const segments = segmentInstruction(assignment)

  return (
    <div className="guide">
      <button type="button" className="btn ghost" onClick={onBack}>
        돌아가기
      </button>
      <p className="card-course">{subject?.name}</p>
      <h1>{assignment.title}</h1>
      <div className="due-row">
        <ChagokBlocks done={counts.done} total={counts.total} />
        <span className="num">
          {counts.done}/{counts.total}
        </span>
      </div>

      <section className="panel" aria-labelledby="instruction-heading">
        <h2 id="instruction-heading">과제 지시문</h2>
        <p className="instruction">
          {segments.map((segment, index) =>
            segment.type === 'text' ? (
              <span key={`t-${index}`}>{segment.text}</span>
            ) : (
              <mark key={segment.id} className="req">
                {segment.text}
              </mark>
            ),
          )}
        </p>
        <ul className="req-legend" aria-label="표시된 요구사항">
          {assignment.requirements.map((requirement) => (
            <li key={requirement.id}>
              <span className="req-label">{requirement.label}</span>
              <span>{requirement.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="work">
        <section className="panel current" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              {step.prerequisiteTip ? <p className="hint">먼저: {step.prerequisiteTip}</p> : null}
              {step.completionCriteria.map((criterion) => {
                const done = Boolean(criterionCompletion[criterion.id])
                return (
                  <form
                    key={criterion.id}
                    className="criterion"
                    onSubmit={(event) => {
                      event.preventDefault()
                      onSubmitCriterion(step, criterion.id, criterionResponses[criterion.id] || '')
                    }}
                  >
                    <p className="criterion-text">
                      <span className="req-label">완료 기준</span> {criterion.text}
                    </p>
                    <label htmlFor={criterion.id}>{criterion.inputLabel}</label>
                    <input
                      id={criterion.id}
                      type="text"
                      value={criterionResponses[criterion.id] ?? ''}
                      placeholder={criterion.placeholder}
                      onChange={(event) => onChangeResponse(criterion.id, event.target.value)}
                    />
                    <button type="submit" className="btn ghost">
                      {done ? '기록됨' : '이 기준 기록'}
                    </button>
                  </form>
                )
              })}
              <button
                type="button"
                className="btn primary"
                onClick={() => onCompleteStep(assignment, step.id)}
                disabled={Boolean(stepCompletion[step.id])}
              >
                {stepCompletion[step.id] ? '이 단계 완료됨' : '이 단계 완료'}
              </button>
            </motion.div>
          </AnimatePresence>
        </section>

        <section className="panel" aria-labelledby="step-list-heading">
          <h2 id="step-list-heading">단계</h2>
          <ol className="step-list">
            {assignment.steps.map((item) => {
              const current = item.id === step.id
              const done = Boolean(stepCompletion[item.id])
              return (
                <li key={item.id} aria-current={current ? 'step' : undefined}>
                  <button type="button" className="step-jump" onClick={() => onSelectStep(item.id)}>
                    <span className="step-name">{item.title}</span>
                    <span className={done ? 'step-state done' : 'step-state'}>{done ? '완료' : current ? '진행 중' : '대기'}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
