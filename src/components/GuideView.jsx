import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronDown, ChevronLeft, CircleCheck, FileText, Lightbulb } from 'lucide-react'
import ProgressRing from './ProgressRing.jsx'
import { ddayLabel, dueChipClass, formatDue, formatDueLabel, segmentInstruction, stepCounts } from '../assignmentModel.js'

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
  onAskHelp,
  embedded = false,
}) {
  // Inside the lecture page the section heading already carries the level, so
  // the assignment and step titles step down one rank.
  const Title = embedded ? 'h3' : 'h1'
  const StepTitle = embedded ? 'h4' : 'h2'
  const reduce = useReducedMotion()
  const [instructionOpen, setInstructionOpen] = useState(false)
  // 'content' is what the work must say; everything else — 분량, 글자 크기,
  // 파일 형식, 제출처 — is about handing it in.
  const submission = assignment.requirements.filter((item) => item.kind !== 'content')
  const keywords = assignment.requirements.filter((item) => item.kind === 'content')
  const step = assignment.steps.find((item) => item.id === activeStepId) || assignment.steps[0]
  const stepIndex = assignment.steps.findIndex((item) => item.id === step.id)
  const counts = stepCounts(assignment, stepCompletion)
  const segments = segmentInstruction(assignment)

  return (
    <div className={embedded ? 'guide is-embedded' : 'guide'}>
      {embedded ? null : (
        <button type="button" className="guide-back" onClick={onBack}>
          <ChevronLeft aria-hidden="true" size={16} />
          홈으로
        </button>
      )}

      <header className="guide-head">
        <div>
          <p className="guide-subject">
            <span className={`subject-dot dot-${subject?.colorToken}`} aria-hidden="true" />
            {subject?.name}
          </p>
          <Title>{assignment.title}</Title>
          <p className="due-row">
            <span className={dueChipClass(assignment.dueAt)}>{ddayLabel(assignment.dueAt)}</span>
            <span>{formatDue(assignment.dueAt)}</span>
          </p>
        </div>
        <ProgressRing done={counts.done} total={counts.total} />
      </header>

      {/* all steps as one path; each step can be opened directly */}
      <nav className="guide-card step-path" aria-label="단계">
        <ol>
          {assignment.steps.map((item, index) => {
            const current = item.id === step.id
            const done = Boolean(stepCompletion[item.id])
            return (
              <li key={item.id} className={`${done ? 'is-done' : ''}${current ? ' is-current' : ''}`}>
                <button type="button" onClick={() => onSelectStep(item.id)} aria-current={current ? 'step' : undefined}>
                  <span className="step-dot" aria-hidden="true">
                    {done ? <Check size={16} /> : index + 1}
                  </span>
                  <span className="step-label">
                    {item.title}
                    <span className={`step-state${done ? ' is-done' : current ? ' is-current' : ''}`}>
                      {done ? '완료' : current ? '진행 중' : '대기'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* the instruction stays folded; its key points are always visible */}
      <section className={`guide-card instruction-fold${instructionOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="fold-toggle"
          aria-expanded={instructionOpen}
          aria-controls="instruction-body"
          onClick={() => setInstructionOpen((open) => !open)}
        >
          <span className="fold-title" id="instruction-heading">
            과제 지시문
          </span>
          <span className="source-tag is-prof">
            <FileText aria-hidden="true" size={14} />
            교수님 요구사항
          </span>
          <span className="fold-chips">
            {assignment.requirements.map((requirement) => (
              <span key={requirement.id} className="fold-chip">
                {requirement.highlight || requirement.label}
              </span>
            ))}
          </span>
          <span className="fold-arrow" aria-hidden="true">
            <ChevronDown size={18} />
          </span>
        </button>
        {instructionOpen ? (
          <div id="instruction-body" className="fold-body">
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
            {/* Three things to carry out of the instruction: when it is due,
                what handing it in demands, and what it is about. One row per
                requirement made a long list of truncated labels; this is the
                summary a learner can hold in their head. */}
            <ul className="req-legend" aria-label="과제 요건 요약">
              <li>
                <span className="req-label">마감일</span>
                <span>{formatDueLabel(assignment.dueAt) || '정해지지 않았어요'}</span>
              </li>
              {submission.length > 0 ? (
                <li>
                  <span className="req-label">제출 조건</span>
                  <ul className="req-points">
                    {submission.map((item) => (
                      <li key={item.id} title={item.text}>
                        {item.label || item.text}
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
              {keywords.length > 0 ? (
                <li>
                  <span className="req-label">키워드</span>
                  <span className="req-keywords">
                    {keywords.map((item) => (
                      <span key={item.id} className="fold-chip">
                        {item.label}
                      </span>
                    ))}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </section>

      {/* only the current step */}
      <section className="guide-card step-card" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
          >
            <p className="step-eyebrow">
              {stepIndex + 1}단계 / {assignment.steps.length}단계
            </p>
            <StepTitle>{step.title}</StepTitle>
            <p className="step-desc">{step.description}</p>
            {step.prerequisiteTip ? (
              <p className="step-tip">
                <Lightbulb aria-hidden="true" size={16} />
                {step.prerequisiteTip}
              </p>
            ) : null}
            <p className="criteria-heading">이 단계를 마치려면</p>
            {step.completionCriteria.map((criterion, index) => {
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
                  <label className="criterion-text" htmlFor={criterion.id}>
                    <span className={`criterion-num${done ? ' is-done' : ''}`} aria-hidden="true">
                      {done ? <Check size={14} /> : index + 1}
                    </span>
                    {criterion.text}
                  </label>
                  <div className="criterion-field">
                    <input
                      id={criterion.id}
                      type="text"
                      value={criterionResponses[criterion.id] ?? ''}
                      placeholder={criterion.placeholder}
                      onChange={(event) => onChangeResponse(criterion.id, event.target.value)}
                    />
                    <button type="submit" className={done ? 'btn ghost criterion-save is-done' : 'btn ghost criterion-save'}>
                      {done ? <Check aria-hidden="true" size={16} /> : <CircleCheck aria-hidden="true" size={16} />}
                      {done ? '완료됨' : '완료'}
                    </button>
                  </div>
                </form>
              )
            })}
            <div className="step-foot">
            <button
              type="button"
              className="btn primary step-done"
              onClick={() => onCompleteStep(assignment, step.id)}
              disabled={Boolean(stepCompletion[step.id])}
            >
              <CircleCheck aria-hidden="true" size={16} />
              {stepCompletion[step.id] ? '이 단계 완료됨' : '이 단계 완료'}
            </button>
            <div className="help-row">
              <p>막혔나요?</p>
              <button type="button" className="help-btn" onClick={onAskHelp}>
                <img src="/brand/gomgomi-question.webp" alt="" />
                도움받기
              </button>
            </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  )
}
