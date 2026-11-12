import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import SourceChunks from './SourceChunks.jsx'

// 이해 여부 점검하기. One question at a time, and the answer arrives only
// after the learner has committed to theirs — the questions come from the
// server without their answers, and the marking happens there.
export default function QuizPanel({ quiz, chunks, results, onSubmit, onFinish, busy, provider }) {
  const [index, setIndex] = useState(0)
  const [draft, setDraft] = useState({})

  const questions = quiz.questions || []
  const question = questions[index]
  if (!question) return null

  const result = results[question.questionId]
  const given = draft[question.questionId] ?? ''
  const answered = Boolean(result)
  const lastOne = index === questions.length - 1

  return (
    <section className="review-result" aria-label="이해 여부 점검하기">
      <div className="review-between">
        <h3>이해 여부 점검하기</h3>
        <span className="review-muted">
          {index + 1} / {questions.length}
        </span>
      </div>

      {provider === 'mock' ? (
        <p className="review-note">
          Tutor가 연결되지 않아 미리 검토해 둔 시연용 문제를 보여 주고 있어요. AI가 만든 문제가 아니에요.
        </p>
      ) : (
        <p className="review-muted">고른 강의 구간을 근거로 만든 문제예요.</p>
      )}
      {quiz.droppedCount > 0 ? (
        <p className="review-note">근거를 확인하지 못한 문제 {quiz.droppedCount}개는 빼고 보여 줘요.</p>
      ) : null}

      <div className="review-item">
        <p>
          <strong>
            {index + 1}. {question.questionText}
          </strong>
        </p>

        {question.type === 'ox' ? (
          <div className="review-choices">
            {['O', 'X'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`answer-${question.questionId}`}
                  value={option}
                  disabled={answered || busy}
                  checked={given === option}
                  onChange={() => setDraft((prev) => ({ ...prev, [question.questionId]: option }))}
                />{' '}
                {option}
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            aria-label={`${index + 1}번 빈칸 답변`}
            placeholder="답을 입력하세요"
            value={given}
            disabled={answered || busy}
            onChange={(event) => setDraft((prev) => ({ ...prev, [question.questionId]: event.target.value }))}
          />
        )}

        {!answered ? (
          <div className="review-row">
            <button
              type="button"
              className="review-primary"
              disabled={!String(given).trim() || busy}
              onClick={() => onSubmit(question, given)}
            >
              {busy ? '채점하고 있어요…' : '정답 확인하기'}
            </button>
          </div>
        ) : (
          <div className="review-feedback">
            <strong className={result.result === 'correct' ? 'review-correct' : 'review-wrong'}>
              {result.result === 'correct' ? (
                <>
                  <Check aria-hidden="true" size={14} /> 정답이에요.
                </>
              ) : (
                <>
                  <X aria-hidden="true" size={14} /> 다시 살펴봐요. 정답: {result.correctAnswer}
                </>
              )}
            </strong>
            {result.explanation ? <p>{result.explanation}</p> : null}
            <SourceChunks ids={result.sourceChunkIds} chunks={chunks} />
          </div>
        )}
      </div>

      <div className="review-row">
        <button type="button" className="review-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ChevronLeft aria-hidden="true" size={16} />
          이전 문제
        </button>
        {!lastOne ? (
          <button type="button" className="review-secondary" onClick={() => setIndex(index + 1)}>
            다음 문제
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ) : (
          <button type="button" className="review-primary" onClick={onFinish}>
            다 풀었어요
          </button>
        )}
      </div>
    </section>
  )
}
