import { useState } from 'react'
import { ArrowDown, ArrowUp, Check, CheckSquare, Plus, RotateCcw, Square, Trash2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  CHUNK_LEVELS,
  DEFAULT_LEVEL,
  droppedRequirements,
  parseInstruction,
  slugify,
  toAssignmentStep,
  userStep,
  verifyChunkResult,
  verifyFinalSteps,
} from './taskChunking.js'
import { createSubject, data, freeIdPrefix, registerAssignment } from '../../assignmentModel.js'
import { tutorService } from '../../services/tutorService.js'
import Modal from '../../components/Modal.jsx'
import './taskChunking.css'

const NEW_SUBJECT = '__new__'

// 과제 단계 나누기.
//
// Three screens inside one dialog: type the assignment, choose how finely to
// split it, then edit what came back. Nothing touches the assignment registry
// until the last button, so the learner can regenerate and change their mind
// as often as they like and the planner never sees a half-made assignment.
//
// What the model returned and what the learner did about it stay apart:
// `result` holds the generated list untouched, `rows` is the working copy they
// reorder, uncheck and add to. Regenerating replaces both.
export default function TaskChunkingPanel({ onApplied, onClose }) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState('input') // input | level | review
  const [subjectChoice, setSubjectChoice] = useState(data.subjects[0]?.id || NEW_SUBJECT)
  const [newSubject, setNewSubject] = useState('')
  const [text, setText] = useState('')
  const [inputErrors, setInputErrors] = useState([])
  const [level, setLevel] = useState(DEFAULT_LEVEL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [rows, setRows] = useState([])
  const [excluded, setExcluded] = useState(() => new Set())
  const [draft, setDraft] = useState('')
  const [draftNote, setDraftNote] = useState('')

  const isNew = subjectChoice === NEW_SUBJECT
  const subjectName = isNew ? newSubject.trim() : data.subjects.find((s) => s.id === subjectChoice)?.name || ''
  const chosen = rows.filter((row) => !excluded.has(row.key))
  const willDrop = result ? droppedRequirements(rows, chosen, result.requirements) : []

  function confirmInput() {
    const checked = parseInstruction(text, { subjectName })
    if (!checked.ok) {
      setInputErrors(checked.errors)
      return
    }
    setInputErrors([])
    setStep('level')
  }

  async function generate() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const data_ = await tutorService.createSteps({
        subjectId: isNew ? null : subjectChoice,
        subjectName,
        instruction: text.trim(),
        chunkingLevel: level,
      })
      const checked = verifyChunkResult(data_, { level, instruction: text.trim() })
      if (!checked.ok) {
        // The previous list stays on screen: a failed regeneration must not
        // cost the learner what they already had.
        setError(`만들어진 단계를 쓸 수 없어요. ${checked.errors[0]}`)
        return
      }
      setResult(checked)
      setRows(checked.steps.map((item, index) => ({ key: `g${index}`, ...item, source: 'gemini' })))
      setExcluded(new Set())
      setStep('review')
    } catch (failure) {
      setError(failure?.message || '과제 단계를 만들지 못했어요. 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  function toggle(key) {
    setExcluded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function addStep() {
    const made = userStep(draft, draftNote)
    if (!made) return
    // A key that cannot collide however many have been added and removed.
    setRows((prev) => [...prev, { key: `u${Date.now().toString(36)}`, ...made }])
    setDraft('')
    setDraftNote('')
  }

  // Order is the learner's to set: the model proposes a sequence, but only
  // they know what they want to do first.
  function move(index, by) {
    setRows((prev) => {
      const at = index + by
      if (at < 0 || at >= prev.length) return prev
      const next = prev.slice()
      ;[next[index], next[at]] = [next[at], next[index]]
      return next
    })
  }

  function apply() {
    if (chosen.length === 0) return
    const prefix = freeIdPrefix(`tc-${slugify(result.title || subjectName).slice(0, 24)}`)
    const steps = chosen.map((row, index) => toAssignmentStep(row, { prefix, index, source: row.source }))
    const checked = verifyFinalSteps(steps)
    if (!checked.ok) {
      setError(checked.errors[0])
      return
    }
    const subjectId = isNew ? createSubject(subjectName) : subjectChoice
    const made = registerAssignment({
      id: prefix,
      subjectId,
      title: result.title || `${subjectName} 과제`,
      dueAt: result.dueAt,
      demoOnly: false,
      instructionOriginal: text.trim(),
      instructions: [text.trim()],
      requirements: result.requirements.map((item, index) => ({
        id: `${prefix}-r${index + 1}`,
        label: item.keyword,
        text: item.text,
        highlight: '',
        kind: item.kind,
      })),
      steps,
      source: 'task-chunking',
    })
    if (!made) {
      setError('같은 과제가 이미 있어요.')
      return
    }
    onApplied?.(made, { subjectAdded: isNew, subjectName })
  }

  const listTransition = reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }

  return (
    <Modal titleId="chunk-title" className="chunk-modal" onClose={onClose}>
      <section className="chunk-panel">
        <header className="chunk-head">
          <h2 id="chunk-title">과제 단계 나누기</h2>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </header>

        {step === 'input' ? (
          <div className="chunk-body">
            <p className="section-lead">과제 지시문을 입력해 주세요. 곰곰이가 읽고 단계로 나눠 줄게요.</p>

            <label className="chunk-field">
              <span>과목</span>
              <select value={subjectChoice} onChange={(event) => setSubjectChoice(event.target.value)}>
                {data.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
                <option value={NEW_SUBJECT}>새 과목 직접 입력</option>
              </select>
            </label>
            {isNew ? (
              <label className="chunk-field">
                <span>새 과목 이름</span>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(event) => setNewSubject(event.target.value)}
                  placeholder="예) 생성형 AI"
                />
              </label>
            ) : null}

            <label className="chunk-field">
              <span>과제 지시문</span>
              <textarea
                className="chunk-input"
                rows={9}
                value={text}
                onChange={(event) => {
                  setText(event.target.value)
                  setInputErrors([])
                }}
                placeholder="예) VAE와 GAN의 기본 원리를 조사하고 두 모델의 학습 방식을 비교하는 보고서를 A4 3장 이내로 작성하세요. 모델 구조를 설명하는 그림을 최소 1개 포함하고, 참고한 자료의 출처를 명시하세요."
              />
            </label>

            {inputErrors.length > 0 ? (
              <div className="chunk-errors" role="alert">
                <ul>
                  {inputErrors.map((item) => (
                    <li key={item.message}>{item.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="chunk-actions">
              <button type="button" className="btn primary" onClick={confirmInput} disabled={!text.trim()}>
                과제 올리기
              </button>
            </div>
          </div>
        ) : null}

        {step === 'level' ? (
          <div className="chunk-body">
            <p className="chunk-assignment">
              <b>{subjectName}</b>
              <span>{text.trim().slice(0, 90)}{text.trim().length > 90 ? '…' : ''}</span>
            </p>
            <h3 className="chunk-question">과제를 얼마나 자세하게 나눌까요?</h3>
            <ul className="chunk-levels">
              {CHUNK_LEVELS.map((item) => (
                <li key={item.id}>
                  <label className={level === item.id ? 'is-on' : ''}>
                    <input
                      type="radio"
                      name="chunk-level"
                      value={item.id}
                      checked={level === item.id}
                      onChange={() => setLevel(item.id)}
                    />
                    <span className="chunk-level-main">
                      <b>
                        {item.label}
                        <span className="chunk-level-range">
                          {item.min}~{item.max}단계
                        </span>
                      </b>
                      <span>{item.blurb}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {error ? <p className="chunk-error" role="alert">{error}</p> : null}
            <div className="chunk-actions">
              <button type="button" className="btn" onClick={() => setStep('input')} disabled={busy}>
                과제 다시 쓰기
              </button>
              <button type="button" className="btn primary" onClick={generate} disabled={busy}>
                {busy ? '만드는 중…' : '과제 단계 만들기'}
              </button>
            </div>
            {busy ? (
              <div className="chunk-loading" role="status">
                <span className="chunk-spinner" aria-hidden="true" />
                <p>곰곰이가 과제를 작은 단계로 나누고 있어요…</p>
                <p className="chunk-loading-sub">과제에서 해야 할 일과 제출 조건을 확인하고 있어요.</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 'review' && result ? (
          <div className="chunk-body">
            <h3 className="chunk-question">과제를 단계별로 나눴어요. 필요한 단계를 골라 보세요.</h3>
            <p className="section-lead">
              필요 없는 단계는 제외하고, 빠진 단계는 직접 추가해 보세요. 화살표로 순서도 바꿀 수 있어요.
            </p>

            {result.warnings.length > 0 ? (
              <div className="chunk-warnings">
                {result.warnings.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            <div className="chunk-bulk">
              <button type="button" className="btn" onClick={() => setExcluded(new Set())}>
                <CheckSquare aria-hidden="true" size={16} />
                전체 선택
              </button>
              <button type="button" className="btn" onClick={() => setExcluded(new Set(rows.map((row) => row.key)))}>
                <Square aria-hidden="true" size={16} />
                전체 해제
              </button>
              <span className="chunk-count">
                {chosen.length}개 선택됨 <span className="num">/ {rows.length}</span>
              </span>
            </div>

            <ol className="chunk-steps">
              <AnimatePresence initial={false}>
                {rows.map((row, index) => (
                  <motion.li
                    key={row.key}
                    layout
                    transition={listTransition}
                    initial={reduce ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    className={excluded.has(row.key) ? 'is-off' : ''}
                  >
                    <label>
                      <input type="checkbox" checked={!excluded.has(row.key)} onChange={() => toggle(row.key)} />
                      <span className="chunk-step-main">
                        <b>{row.title}</b>
                        <span>{row.description}</span>
                      </span>
                    </label>
                    <span className="chunk-tools">
                      <button
                        type="button"
                        className="chunk-tool"
                        aria-label={`${row.title} 위로`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        className="chunk-tool"
                        aria-label={`${row.title} 아래로`}
                        disabled={index === rows.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown aria-hidden="true" size={15} />
                      </button>
                      {row.source === 'user' ? (
                        <button
                          type="button"
                          className="chunk-tool"
                          aria-label={`${row.title} 지우기`}
                          onClick={() => setRows((prev) => prev.filter((item) => item.key !== row.key))}
                        >
                          <Trash2 aria-hidden="true" size={15} />
                        </button>
                      ) : null}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>

            <div className="chunk-add">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    document.getElementById('chunk-add-note')?.focus()
                  }
                }}
                placeholder="새로운 단계 제목"
                aria-label="새로운 단계 제목"
              />
              <input
                id="chunk-add-note"
                type="text"
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addStep()
                  }
                }}
                placeholder="설명 (선택)"
                aria-label="새로운 단계 설명"
              />
              <button type="button" className="btn" onClick={addStep} disabled={!draft.trim()}>
                <Plus aria-hidden="true" size={16} />
                추가
              </button>
            </div>

            {/* Unchecking a step can take a requirement with it. Said before
                applying, while it can still be undone. */}
            {willDrop.length > 0 ? (
              <div className="chunk-warnings">
                <p>
                  빼 둔 단계 때문에 요구사항 {willDrop.length}개가 어느 단계에도 들어가지 않아요:{' '}
                  {willDrop.map((item) => item.text).join(', ')}
                </p>
              </div>
            ) : null}

            {error ? <p className="chunk-error" role="alert">{error}</p> : null}

            <div className="chunk-actions">
              <button type="button" className="btn" onClick={() => setStep('level')} disabled={busy}>
                <RotateCcw aria-hidden="true" size={16} />
                단계 다시 나누기
              </button>
              <button type="button" className="btn primary" onClick={apply} disabled={chosen.length === 0}>
                <Check aria-hidden="true" size={16} />
                선택한 단계 적용하기
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </Modal>
  )
}
