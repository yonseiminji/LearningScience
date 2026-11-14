import { useMemo, useRef, useState } from 'react'
import { Check, CheckSquare, Plus, RotateCcw, Square, Trash2, Upload } from 'lucide-react'
import {
  CHUNK_LEVELS,
  DEFAULT_LEVEL,
  INPUT_ERROR,
  levelById,
  parseAssignmentInput,
  toAssignmentStep,
  userStep,
  verifyFinalSteps,
  verifySteps,
} from './taskChunking.js'
import { createSubject, freeIdPrefix, registerAssignment } from '../../assignmentModel.js'
import { tutorService } from '../../services/tutorService.js'
import { slugify } from './taskChunking.js'
import './taskChunking.css'

// 과제 단계 나누기.
//
// Four screens: paste the assignment, choose how finely to split it, wait,
// then edit what came back. Nothing touches the assignment registry until the
// last button, so a learner can regenerate and change their mind as often as
// they like and the planner never sees a half-made assignment.
//
// The generated list and the learner's choices are kept apart: `proposal`
// holds what the model returned, `excluded` and `added` hold what the learner
// did about it. Regenerating replaces the first and clears the second.
export default function TaskChunkingPanel({ onApplied, onClose }) {
  const [step, setStep] = useState('input') // input | level | review
  const [text, setText] = useState('')
  const [assignment, setAssignment] = useState(null)
  const [inputErrors, setInputErrors] = useState([])
  const [level, setLevel] = useState(DEFAULT_LEVEL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [proposal, setProposal] = useState(null) // { steps, warnings, provider }
  const [excluded, setExcluded] = useState(() => new Set())
  const [added, setAdded] = useState([])
  const [draft, setDraft] = useState('')
  const fileRef = useRef(null)

  const rows = useMemo(() => {
    const generated = (proposal?.steps || []).map((item, index) => ({ key: `g${index}`, ...item, source: 'gemini' }))
    const mine = added.map((item, index) => ({ key: `u${index}`, ...item, source: 'user' }))
    return [...generated, ...mine]
  }, [proposal, added])

  const chosen = rows.filter((row) => !excluded.has(row.key))

  function readInput(value) {
    setText(value)
    setInputErrors([])
  }

  function confirmInput() {
    const result = parseAssignmentInput(text)
    if (!result.ok) {
      setAssignment(null)
      setInputErrors(result.errors)
      return
    }
    setAssignment(result.assignment)
    setInputErrors([])
    setStep('level')
  }

  async function pickFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    readInput(await file.text())
    event.target.value = ''
  }

  async function generate() {
    if (!assignment || busy) return
    setBusy(true)
    setError(null)
    try {
      const data = await tutorService.createSteps({ assignment, level })
      const checked = verifySteps(data.steps, {
        level,
        instruction: assignment.instruction,
        requirements: assignment.requirements,
      })
      if (!checked.ok) {
        // The previous proposal stays on screen; a failed regeneration must
        // not cost the learner the list they already had.
        setError(`만들어진 단계를 쓸 수 없어요. ${checked.errors[0]}`)
        return
      }
      setProposal({ steps: checked.steps, warnings: checked.warnings, provider: data.provider })
      setExcluded(new Set())
      setAdded([])
      setStep('review')
    } catch (failure) {
      setError(failure?.message || '단계를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.')
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
    const made = userStep(draft)
    if (!made) return
    setAdded((prev) => [...prev, made])
    setDraft('')
  }

  function apply() {
    if (!assignment || chosen.length === 0) return
    const prefix = freeIdPrefix(`tc-${slugify(assignment.assignmentTitle).slice(0, 24)}`)
    const steps = chosen.map((row, index) => toAssignmentStep(row, { prefix, index, source: row.source }))
    const checked = verifyFinalSteps(steps)
    if (!checked.ok) {
      setError(checked.errors[0])
      return
    }
    const subjectId = createSubject(assignment.subjectName)
    const made = registerAssignment({
      id: prefix,
      subjectId,
      title: assignment.assignmentTitle,
      dueAt: assignment.dueAt,
      demoOnly: false,
      instructionOriginal: assignment.instruction,
      instructions: [assignment.instruction],
      requirements: assignment.requirements.map((label, index) => ({
        id: `${prefix}-r${index + 1}`,
        label: label.slice(0, 20),
        text: label,
        highlight: '',
        kind: 'content',
      })),
      steps,
      source: 'task-chunking',
    })
    if (!made) {
      setError('같은 과제가 이미 있어요.')
      return
    }
    onApplied?.(made)
  }

  const want = levelById(level)

  return (
    <section className="chunk-panel" aria-labelledby="chunk-title">
      <header className="chunk-head">
        <h2 id="chunk-title">과제 단계 나누기</h2>
        {onClose ? (
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        ) : null}
      </header>

      {step === 'input' ? (
        <div className="chunk-body">
          <p className="section-lead">AI로 정리한 과제 JSON을 붙여넣거나 업로드해 주세요.</p>
          <textarea
            className="chunk-input"
            rows={10}
            value={text}
            onChange={(event) => readInput(event.target.value)}
            placeholder={'{\n  "subjectName": "학습과학",\n  "assignmentTitle": "…",\n  "instruction": "…",\n  "requirements": ["…"],\n  "dueAt": null\n}'}
          />
          {inputErrors.length > 0 ? (
            <div className="chunk-errors" role="alert">
              <p>{INPUT_ERROR}</p>
              <ul>
                {inputErrors.map((item) => (
                  <li key={`${item.field}-${item.message}`}>
                    {item.field ? <code>{item.field}</code> : null} {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="chunk-actions">
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden="true" size={16} />
              파일 올리기
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={pickFile} />
            <button type="button" className="btn primary" onClick={confirmInput} disabled={!text.trim()}>
              과제 정보 확인하기
            </button>
          </div>
        </div>
      ) : null}

      {step === 'level' ? (
        <div className="chunk-body">
          <p className="chunk-assignment">
            <b>{assignment.assignmentTitle}</b>
            <span>
              {assignment.subjectName} · 요구사항 {assignment.requirements.length}개
              {assignment.dueAt ? '' : ' · 마감일 미확인'}
            </span>
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
                    <b>{item.label}</b>
                    <span>{item.blurb}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {error ? <p className="chunk-error" role="alert">{error}</p> : null}
          <div className="chunk-actions">
            <button type="button" className="btn" onClick={() => setStep('input')} disabled={busy}>
              과제 다시 넣기
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

      {step === 'review' && proposal ? (
        <div className="chunk-body">
          <h3 className="chunk-question">이 단계대로 과제를 진행해 볼까요?</h3>
          <p className="section-lead">
            곰곰이가 나눈 단계를 확인해 보세요. 필요 없는 단계는 선택을 해제하고, 빠진 단계는 직접 추가할 수 있어요.
          </p>

          {proposal.warnings.length > 0 ? (
            <div className="chunk-warnings">
              {proposal.warnings.map((line) => (
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
            {rows.map((row) => (
              <li key={row.key} className={excluded.has(row.key) ? 'is-off' : ''}>
                <label>
                  <input type="checkbox" checked={!excluded.has(row.key)} onChange={() => toggle(row.key)} />
                  <span className="chunk-step-main">
                    <b>{row.title}</b>
                    <span>{row.description}</span>
                  </span>
                </label>
                {row.source === 'user' ? (
                  <button
                    type="button"
                    className="chunk-remove"
                    aria-label={`${row.title} 지우기`}
                    onClick={() => setAdded((prev) => prev.filter((_, at) => `u${at}` !== row.key))}
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                ) : null}
              </li>
            ))}
          </ol>

          <div className="chunk-add">
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addStep()
                }
              }}
              placeholder="새로운 단계 추가"
              aria-label="새로운 단계 제목"
            />
            <button type="button" className="btn" onClick={addStep} disabled={!draft.trim()}>
              <Plus aria-hidden="true" size={16} />
              추가
            </button>
          </div>

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
          {want ? <p className="chunk-note">‘{want.label}’으로 만든 {proposal.steps.length}단계예요.</p> : null}
        </div>
      ) : null}
    </section>
  )
}
