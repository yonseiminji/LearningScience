import { Check } from 'lucide-react'
import { COMFORTABLE_CHARS, selectionSize, selectionTooLong, timeLabel } from '../../utils/chunkSearch.js'

// 강의 구간 선택하기. Which stretch of the lecture to be tested on. Only the
// chosen paragraphs are sent on, so the questions can only be about what the
// learner chose to study.
export default function ChunkSelector({ material, selectedIds, onChange, onContinue }) {
  const chunks = material.chunks || []
  const chosen = chunks.filter((chunk) => selectedIds.includes(chunk.chunkId))
  const tooLong = selectionTooLong(chosen)

  function toggle(chunkId) {
    onChange(selectedIds.includes(chunkId) ? selectedIds.filter((id) => id !== chunkId) : [...selectedIds, chunkId])
  }

  return (
    <section className="review-result" aria-label="강의 구간 선택하기">
      <h3>공부할 내용 선택하기</h3>
      <p className="review-muted">문제로 풀어 볼 구간을 하나 이상 골라 주세요. 고른 부분만 문제의 근거가 돼요.</p>

      <ul className="review-pick-list">
        {chunks.map((chunk) => {
          const on = selectedIds.includes(chunk.chunkId)
          return (
            <li key={chunk.chunkId}>
              <label className={on ? 'review-pick is-on' : 'review-pick'}>
                <input type="checkbox" checked={on} onChange={() => toggle(chunk.chunkId)} />
                <span className="review-pick-box" aria-hidden="true">{on ? <Check size={14} /> : null}</span>
                <span className="review-pick-body">
                  <span className="review-chunk-meta">
                    {chunk.index + 1}. {timeLabel(chunk) || chunk.chunkId}
                  </span>
                  <span className="review-pick-text">{chunk.text}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="review-row review-sticky-foot">
        <span className="review-muted">
          {chosen.length}개 구간 · {selectionSize(chosen).toLocaleString()}자
        </span>
        <button type="button" className="review-primary" disabled={chosen.length === 0} onClick={onContinue}>
          이 구간으로 문제 만들기
        </button>
      </div>
      {tooLong ? (
        <p className="review-note">
          고른 분량이 {COMFORTABLE_CHARS.toLocaleString()}자를 넘어요. 한 번에 다 보기보다 구간을 나눠 가며 공부하면
          문제도 더 또렷해져요.
        </p>
      ) : null}
    </section>
  )
}
