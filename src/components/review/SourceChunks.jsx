import { chunksByIds, timeLabel } from '../../utils/chunkSearch.js'

// The lecture's own words, quoted. Marked as 강의 원문 so it is never mistaken
// for something a model wrote, and carrying the recording time only when the
// file had one.
export default function SourceChunks({ ids = [], chunks = [] }) {
  const matches = chunksByIds(chunks, ids)
  if (!matches.length) return <p className="review-muted">연결된 원문이 없어요.</p>
  return (
    <div className="review-sources" aria-label="관련 강의 원문">
      {matches.map((chunk) => (
        <blockquote key={chunk.chunkId}>
          <small>
            강의 원문 · {chunk.chunkId}
            {timeLabel(chunk) ? ` · ${timeLabel(chunk)}` : ''}
          </small>
          <p>{chunk.text}</p>
        </blockquote>
      ))}
    </div>
  )
}
