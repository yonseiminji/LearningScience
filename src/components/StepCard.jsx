import { useEffect, useRef, useState } from 'react'
import { completedCount, completionPercent, prerequisiteAction } from '../taskModel.js'

export default function StepCard({
  steps,
  activeIndex,
  completedIds,
  supportLabel,
  hasMoreSteps,
  onPrevious,
  onNext,
  onSelect,
  onToggleComplete,
  onChangeLevel,
}) {
  const step = steps[activeIndex]
  const done = completedCount(steps, completedIds)
  const total = steps.length
  const percent = completionPercent(steps, completedIds)
  const isDone = step ? completedIds.includes(step.id) : false
  const atStart = activeIndex === 0
  const atEnd = activeIndex === steps.length - 1
  const prior = step ? prerequisiteAction(steps, step) : ''

  const seenStep = useRef(null)
  const listRef = useRef(null)
  const [swapping, setSwapping] = useState(false)

  useEffect(() => {
    if (!step) return
    if (seenStep.current === null || seenStep.current === step.id) {
      seenStep.current = step.id
      return
    }
    seenStep.current = step.id
    setSwapping(true)
    const timer = window.setTimeout(() => setSwapping(false), 220)
    return () => window.clearTimeout(timer)
  }, [step])

  useEffect(() => {
    const list = listRef.current
    const node = list?.querySelector('[aria-current="step"]')
    if (!list || !node) return
    const listRect = list.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    if (nodeRect.top < listRect.top) {
      list.scrollTop -= listRect.top - nodeRect.top
    } else if (nodeRect.bottom > listRect.bottom) {
      list.scrollTop += nodeRect.bottom - listRect.bottom
    }
  }, [activeIndex, steps])

  if (!step) return null

  return (
    <div className="work">
      <section className="panel current" aria-labelledby="current-step-title">
        <div className={swapping ? 'step-copy is-swap' : 'step-copy'} aria-live="polite">
          <h1 id="current-step-title">{step.action}</h1>
          <p className="description">
            <span className="req-label">완료 기준</span> {step.completion_criteria}
          </p>
          {step.example ? <p className="hint">예시: {step.example}</p> : null}
          {prior ? <p className="hint">먼저: {prior}</p> : null}
        </div>
        <div className="step-actions">
          <button
            type="button"
            className={isDone ? 'btn ghost' : 'btn primary'}
            aria-pressed={isDone}
            onClick={() => onToggleComplete(step.id)}
          >
            {isDone ? '완료 해제' : '이 단계 완료'}
          </button>
          <div className="nav-pair">
            <button type="button" className="btn ghost" onClick={onPrevious} disabled={atStart}>
              이전
            </button>
            <button type="button" className="btn ghost" onClick={onNext} disabled={atEnd}>
              다음
            </button>
          </div>
        </div>
      </section>

      <section className="panel progress-panel" aria-labelledby="progress-heading">
        <div className="progress-head">
          <div>
            <h2 id="progress-heading">진행</h2>
            {supportLabel ? <p className="level-line">{supportLabel}</p> : null}
          </div>
          <p className="percent num">{percent}%</p>
        </div>
        <div
          className="track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`완료 ${done}단계, 전체 ${total}단계, ${percent}퍼센트`}
          aria-label="완료한 단계 비율"
        >
          <div className="fill" style={{ '--p': percent / 100 }} />
        </div>
        <div className="bar-ends">
          <span>완료 {done}단계</span>
          <span>전체 {total}단계</span>
        </div>
        {percent === 100 ? <p className="all-done">모든 단계를 마쳤습니다.</p> : null}
        <button type="button" className="btn ghost level-change" onClick={onChangeLevel}>
          단계 크기 바꾸기
        </button>
        <ol className="step-list" ref={listRef}>
          {steps.map((item, index) => {
            const itemDone = completedIds.includes(item.id)
            const current = index === activeIndex
            const state = itemDone ? '완료' : current ? '진행 중' : '대기'
            return (
              <li key={item.id} aria-current={current ? 'step' : undefined}>
                <label className="step-check">
                  <input
                    type="checkbox"
                    checked={itemDone}
                    aria-label={`${item.action} 완료`}
                    onChange={() => onToggleComplete(item.id)}
                  />
                </label>
                <button type="button" className="step-jump" onClick={() => onSelect(index)}>
                  <span className="step-name">{item.action}</span>
                  <span className="step-criteria">{item.completion_criteria}</span>
                </button>
                <span className={itemDone ? 'step-state done' : 'step-state'}>{state}</span>
              </li>
            )
          })}
        </ol>
        {hasMoreSteps ? (
          <p className="more-note">이 목록 뒤에도 남은 단계가 있습니다. 지금 단계가 과제 전체를 대신하지는 않습니다.</p>
        ) : null}
      </section>
    </div>
  )
}
