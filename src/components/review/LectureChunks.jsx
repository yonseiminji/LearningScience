import { hasTimestamps, timeLabel } from '../../utils/chunkSearch.js'

// 강의 원문 확인하기. The file as it was uploaded, split into numbered
// paragraphs and nothing else — no summary, no rewriting. What the learner
// reads here is what the lecture said.
export default function LectureChunks({ material }) {
  const chunks = material.chunks || []
  return (
    <section className="review-result" aria-label="강의 원문 확인하기">
      <h3>강의 원문 확인하기</h3>
      <p className="review-muted">
        올린 파일을 문단 단위로 나누어 그대로 보여 줘요. 요약하거나 고치지 않았어요.
        {hasTimestamps(chunks) ? ' 파일에 적혀 있던 시각도 함께 표시해요.' : ''}
      </p>
      <ol className="review-chunk-list">
        {chunks.map((chunk) => (
          <li key={chunk.chunkId}>
            <p className="review-chunk-meta">
              {chunk.index + 1}. {chunk.chunkId}
              {timeLabel(chunk) ? ` · ${timeLabel(chunk)}` : ''}
              {chunk.speaker ? ` · ${chunk.speaker}` : ''}
            </p>
            <p className="review-chunk-text">{chunk.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
