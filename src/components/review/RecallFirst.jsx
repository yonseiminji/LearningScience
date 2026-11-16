import { useState } from 'react'
import { AlertTriangle, BookOpen, Check, Circle } from 'lucide-react'

/**
 * 곰곰이한테 설명하기 — pull it out of memory before reading it again.
 *
 * The definition is hidden while this is on screen, because an explanation
 * written with the answer in view is copying, and copying is the thing
 * retrieval practice is an alternative to. Hiding it is the whole mechanism.
 *
 * What comes back is a gap, not a grade. No score, no count, no 맞다/틀리다:
 * the points the learner reached and the ones still to reach, with the
 * textbook's own words beside them. Skipping is a button, not a failure —
 * a concept met for the first time has nothing to retrieve yet.
 */
export default function RecallFirst({ concept, busy, error, result, onSubmit, onSkip }) {
  const [attempt, setAttempt] = useState('')
  const ready = attempt.trim().length >= 2

  if (result) {
    return (
      <div className="recall-result">
        {result.nudge ? <p className="recall-nudge">{result.nudge}</p> : null}

        <ul className="recall-points">
          {result.covered.map((point) => (
            <li key={point} className="is-covered">
              <Check aria-hidden="true" size={15} />
              {point}
            </li>
          ))}
          {result.missing.map((point) => (
            <li key={point} className="is-missing">
              <Circle aria-hidden="true" size={15} />
              {point}
            </li>
          ))}
        </ul>

        {result.conflict ? (
          <p className="concept-watch">
            <AlertTriangle aria-hidden="true" size={14} />
            {result.conflict}
          </p>
        ) : null}

        <p className="recall-mine">
          <b>내가 쓴 설명</b>
          {result.attempt}
        </p>
      </div>
    )
  }

  return (
    <div className="recall-ask">
      <p className="recall-prompt">
        <BookOpen aria-hidden="true" size={15} />
        <b>{concept.termKo}</b>, 곰곰이한테 설명해 볼까요?
      </p>
      <p className="review-muted">교재를 보지 않고 떠오르는 대로 적어 보세요. 맞게 쓰지 않아도 괜찮아요.</p>
      <textarea
        value={attempt}
        onChange={(event) => setAttempt(event.target.value)}
        rows={4}
        maxLength={1200}
        placeholder="예) 사람이 사회에서 살아가는 법을 배우는 과정이에요"
        aria-label={`${concept.termKo}을(를) 내 말로 설명하기`}
      />
      {error ? (
        <p role="alert" className="concept-error">
          {error}
        </p>
      ) : null}
      <div className="recall-actions">
        <button type="button" className="btn primary" disabled={!ready || Boolean(busy)} onClick={() => onSubmit(attempt)}>
          {busy ? '읽고 있어요…' : '다 적었어요'}
        </button>
        <button type="button" className="btn" onClick={onSkip}>
          건너뛰고 설명 보기
        </button>
      </div>
    </div>
  )
}
