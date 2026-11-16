import { useState } from 'react'
import { Check, X } from 'lucide-react'
import SourceChunks from './SourceChunks.jsx'
import { SUPPORT_TYPES } from '../../services/tutorService.js'

// 부족한 부분 다시 학습하기.
//
// A question the learner got wrong, or one they got right but still want help
// with, and then what kind of stuck they are: a word, a difference between two
// ideas, or the question itself. Each kind asks the Tutor differently.
//
// The lecture text is shown beside whatever comes back, in its own block, so
// the two are never read as one voice. When the lecture does not cover it, the
// Tutor says so rather than inventing an explanation.
export default function SupportPanel({ quiz, results, chunks, support, busy, onRequest, onRetry, recall }) {
  const [questionId, setQuestionId] = useState(null)
  const questions = quiz?.questions || []
  const answered = questions.filter((question) => results[question.questionId])
  const chosen = questions.find((question) => question.questionId === questionId) || null
  const chosenResult = chosen ? results[chosen.questionId] : null

  // Until generated questions land, what the learner has is a free recall,
  // and its unreached statements are exactly the parts worth reading again.
  // No model is called for this: the statements are already written down.
  if (answered.length === 0 && recall) {
    const again = [...(recall.partial || []), ...(recall.missing || [])]
    return (
      <section className="review-result" aria-label="부족한 부분 다시 학습하기">
        <h3>어려운 부분을 선택하고 원문 다시 보기</h3>
        {again.length === 0 ? (
          <p>떠올린 내용에 빠진 곳이 없었어요. 강의 원문을 한 번 더 훑어봐도 좋아요.</p>
        ) : (
          <>
            <p className="review-muted">인출 연습에서 아직 떠오르지 않은 내용이에요. 강의 원문에서 이 부분을 찾아 읽어 보세요.</p>
            <ul className="recall-points">
              {again.map((item) => (
                <li key={item.id} className="is-missing">
                  {item.statement}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    )
  }

  if (answered.length === 0) {
    return (
      <section className="review-result" aria-label="부족한 부분 다시 학습하기">
        <h3>어려운 부분을 선택하고 원문 다시 보기</h3>
        <p>아직 인출 연습을 하지 않았어요. 먼저 ‘인출 연습하기’에서 기억나는 내용을 적어 보세요.</p>
      </section>
    )
  }

  return (
    <section className="review-result" aria-label="부족한 부분 다시 학습하기">
      <h3>어려운 부분을 선택하고 원문 다시 보기</h3>
      <p className="review-muted">다시 볼 문제를 고르세요. 맞힌 문제도 고를 수 있어요.</p>

      <ul className="review-pick-list">
        {answered.map((question) => {
          const result = results[question.questionId]
          const on = question.questionId === questionId
          return (
            <li key={question.questionId}>
              <button
                type="button"
                className={on ? 'review-pick is-on' : 'review-pick'}
                onClick={() => setQuestionId(on ? null : question.questionId)}
              >
                <span className={result.result === 'correct' ? 'review-correct' : 'review-wrong'}>
                  {result.result === 'correct' ? <Check size={14} /> : <X size={14} />}
                </span>
                <span className="review-pick-body">
                  <span className="review-pick-text">{question.questionText}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {chosen ? (
        <div className="review-item">
          <p>
            <strong>어떤 점이 어려운가요?</strong>
          </p>
          <div className="review-chip-list">
            {SUPPORT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className="review-secondary"
                disabled={busy}
                onClick={() => onRequest(chosen, chosenResult, type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
          {busy ? <p role="status">강의 원문에서 찾아보고 있어요…</p> : null}

          {support && support.questionId === chosen.questionId ? (
            <div className="review-support">
              <p className="review-chunk-meta">
                {support.provider === 'gemini' ? 'Tutor가 강의 원문을 보고 정리한 내용' : 'Tutor 미연결'}
                {' · '}
                {SUPPORT_TYPES.find((type) => type.id === support.supportType)?.label}
              </p>
              <p>{support.response}</p>
              {support.status === 'insufficient_evidence' ? (
                <p className="review-note">강의 원문에 이 부분을 설명할 근거가 모자라서, 설명을 만들지 않았어요.</p>
              ) : null}
              {support.sourceText ? (
                <blockquote className="review-quote">
                  <small>Tutor가 인용한 문장</small>
                  <p>{support.sourceText}</p>
                </blockquote>
              ) : null}
              <SourceChunks ids={support.sourceChunkIds} chunks={chunks} />
              <button type="button" className="review-primary" onClick={onRetry}>
                이 문제 다시 풀어보기
              </button>
            </div>
          ) : (
            <SourceChunks ids={chosen.sourceChunkIds} chunks={chunks} />
          )}
        </div>
      ) : null}
    </section>
  )
}
