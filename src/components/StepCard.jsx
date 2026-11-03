import { useEffect, useRef, useState } from 'react'
import { completedCount, completionPercent } from '../taskModel.js'

export default function StepCard({
  steps,
  summary,
  activeIndex,
  completedIds,
  onPrevious,
  onNext,
  onToggleComplete,
}) {
  const step = steps[activeIndex]
  const done = completedCount(steps, completedIds)
  const total = steps.length
  const percent = completionPercent(steps, completedIds)
  const isDone = completedIds.includes(step.id)
  const atStart = activeIndex === 0
  const atEnd = activeIndex === steps.length - 1

  const seenStep = useRef(null)
  const [swapping, setSwapping] = useState(false)

  useEffect(() => {
    if (seenStep.current === null || seenStep.current === step.id) {
      seenStep.current = step.id
      return
    }
    seenStep.current = step.id
    setSwapping(true)
    const timer = window.setTimeout(() => setSwapping(false), 220)
    return () => window.clearTimeout(timer)
  }, [step.id])

  return (
    <div className="work">
      <section className="panel current" aria-labelledby="current-step-title">
        <div
          className={swapping ? 'step-copy is-swap' : 'step-copy'}
          aria-live="polite"
        >
          <h1 id="current-step-title">{step.title}</h1>
          <p className="summary">{summary}</p>
          <p className="description">{step.description}</p>
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
            <button
              type="button"
              className="btn ghost"
              onClick={onPrevious}
              disabled={atStart}
            >
              이전
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={onNext}
              disabled={atEnd}
            >
              다음
            </button>
          </div>
        </div>
      </section>

      <section className="panel progress-panel" aria-labelledby="progress-heading">
        <div className="progress-head">
          <h2 id="progress-heading">진행</h2>
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
        {percent === 100 ? (
          <p className="all-done">모든 단계를 마쳤습니다.</p>
        ) : null}
        <ol className="step-list">
          {steps.map((item, index) => {
            const itemDone = completedIds.includes(item.id)
            const current = index === activeIndex
            const state = itemDone ? '완료' : current ? '진행 중' : '대기'
            return (
              <li key={item.id} aria-current={current ? 'step' : undefined}>
                <span className="step-name">{item.title}</span>
                <span className={itemDone ? 'step-state done' : 'step-state'}>{state}</span>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
