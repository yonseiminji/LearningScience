import { useState } from 'react'
import { AlertTriangle, Check, CircleDashed, Circle, PenLine, RotateCcw } from 'lucide-react'

/**
 * 인출 연습하기 — write down everything you remember, then see what came back.
 *
 * A free recall over the whole lecture rather than questions about it. There
 * is nothing to recognise and nothing to choose from: the page is blank and
 * the learner fills it, which is the part that does the work. Questions come
 * later and will sit alongside this, not replace it.
 *
 * The result is a gap, not a grade. Reached, half-reached and still to reach,
 * in the lecture's own words, with no count and no score anywhere — the
 * response has no field for one.
 */
export default function RecallPanel({ busy, error, result, onSubmit, onAgain }) {
  const [attempt, setAttempt] = useState('')
  const ready = attempt.trim().length >= 10

  if (result) {
    return (
      <section className="review-result" aria-label="인출 연습하기">
        <h3>떠올린 내용</h3>
        {result.nudge ? <p className="recall-nudge">{result.nudge}</p> : null}

        <ul className="recall-points">
          {result.covered.map((item) => (
            <li key={item.id} className="is-covered">
              <Check aria-hidden="true" size={15} />
              {item.statement}
            </li>
          ))}
          {result.partial.map((item) => (
            <li key={item.id} className="is-partial">
              <CircleDashed aria-hidden="true" size={15} />
              {item.statement}
              <em>조금 더 떠올려 볼까요</em>
            </li>
          ))}
          {result.missing.map((item) => (
            <li key={item.id} className="is-missing">
              <Circle aria-hidden="true" size={15} />
              {item.statement}
            </li>
          ))}
        </ul>

        {result.mixups?.length ? (
          <div className="recall-mixups">
            <p className="concept-watch">
              <AlertTriangle aria-hidden="true" size={14} />
              다시 볼 부분이 있어요
            </p>
            <ul>
              {result.mixups.map((item) => (
                <li key={item.said}>
                  <span className="recall-said">{item.said}</span>
                  <span className="recall-instead">{item.instead}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="review-muted">{result.note}</p>

        <p className="recall-mine">
          <b>내가 적은 글</b>
          {result.attempt}
        </p>

        <button type="button" className="btn" onClick={onAgain}>
          <RotateCcw aria-hidden="true" size={15} />
          다시 해 보기
        </button>
      </section>
    )
  }

  return (
    <section className="review-result" aria-label="인출 연습하기">
      <h3>기억나는 대로 적어 보세요</h3>
      <p className="review-muted">
        강의를 다시 보지 말고, 떠오르는 내용을 순서 없이 적어도 괜찮아요. 많이 적을수록 기억에 더 오래 남아요.
      </p>
      <div className="recall-ask">
        <p className="recall-prompt">
          <PenLine aria-hidden="true" size={15} />
          오늘 강의에서 기억나는 걸 전부 적어 볼까요?
        </p>
        <textarea
          value={attempt}
          onChange={(event) => setAttempt(event.target.value)}
          rows={10}
          maxLength={4000}
          placeholder="예) 사회화는 사회의 규범을 배우는 과정이다. 자아는 다른 사람과의 상호작용에서 발달한다…"
          aria-label="강의에서 기억나는 내용 적기"
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
          {!ready ? <span className="review-muted">조금만 더 적어 주세요.</span> : null}
        </div>
      </div>
    </section>
  )
}
