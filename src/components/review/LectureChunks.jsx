import { useDeferredValue, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { hasTimestamps, timeLabel } from '../../utils/chunkSearch.js'

/**
 * Split a paragraph into the parts that match and the parts that do not.
 *
 * Matching is done on the text itself rather than by writing HTML, so a
 * paragraph that happens to contain angle brackets stays a paragraph and
 * nothing the learner types can become markup.
 */
export function splitMatches(text, term) {
  const needle = term.trim().toLowerCase()
  if (!needle) return [{ text, hit: false }]
  const parts = []
  const hay = text.toLowerCase()
  let at = 0
  for (;;) {
    const found = hay.indexOf(needle, at)
    if (found === -1) break
    if (found > at) parts.push({ text: text.slice(at, found), hit: false })
    parts.push({ text: text.slice(found, found + needle.length), hit: true })
    at = found + needle.length
  }
  if (at < text.length) parts.push({ text: text.slice(at), hit: false })
  return parts.length ? parts : [{ text, hit: false }]
}

export function countMatches(chunks, term) {
  const needle = term.trim().toLowerCase()
  if (!needle) return { hits: 0, chunks: 0 }
  let hits = 0
  let marked = 0
  for (const chunk of chunks) {
    const found = String(chunk.text || '')
      .toLowerCase()
      .split(needle).length - 1
    if (found > 0) marked += 1
    hits += found
  }
  return { hits, chunks: marked }
}

// 강의 원문 확인하기. The file as it was uploaded, split into numbered
// paragraphs and nothing else — no summary, no rewriting. What the learner
// reads here is what the lecture said.
export default function LectureChunks({ material }) {
  const chunks = material.chunks || []
  const [term, setTerm] = useState('')
  // The list is long and every keystroke re-splits every paragraph, so the
  // field stays responsive while the highlighting catches up.
  const query = useDeferredValue(term)

  const found = useMemo(() => countMatches(chunks, query), [chunks, query])
  const searching = query.trim().length > 0
  // Hiding the misses would make 'where does this appear' impossible to see
  // in context, so everything stays and only the matches are marked.
  const shown = useMemo(
    () => chunks.map((chunk) => ({ chunk, parts: splitMatches(chunk.text, query) })),
    [chunks, query],
  )

  return (
    <section className="review-result" aria-label="강의 원문 확인하기">
      <h3>강의 원문 확인하기</h3>

      <div className="lecture-search">
        <Search aria-hidden="true" size={16} />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="강의에서 찾을 말을 적어 보세요"
          aria-label="강의 원문에서 찾기"
        />
        {term ? (
          <button type="button" className="lecture-search-clear" onClick={() => setTerm('')} aria-label="찾기 지우기">
            <X aria-hidden="true" size={15} />
          </button>
        ) : null}
      </div>
      {searching ? (
        <p className="review-muted" role="status">
          {found.hits > 0 ? `${found.hits}군데에서 찾았어요. 문단 ${found.chunks}개에 있어요.` : '찾는 말이 강의에 없어요.'}
        </p>
      ) : null}

      <p className="review-muted">
        올린 전사문을 문단 단위로 나누어 그대로 보여 줘요. 요약하거나 고치지 않았어요.
        {hasTimestamps(chunks) ? ' 파일에 적혀 있던 시각도 함께 표시해요.' : ''}
      </p>
      <ol className="review-chunk-list">
        {shown.map(({ chunk, parts }) => (
          <li key={chunk.chunkId} className={searching && parts.some((part) => part.hit) ? 'is-hit' : undefined}>
            <p className="review-chunk-meta">
              {chunk.index + 1}. {chunk.chunkId}
              {timeLabel(chunk) ? ` · ${timeLabel(chunk)}` : ''}
              {chunk.speaker ? ` · ${chunk.speaker}` : ''}
            </p>
            <p className="review-chunk-text">
              {parts.map((part, at) =>
                part.hit ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <mark key={at}>{part.text}</mark>
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={at}>{part.text}</span>
                ),
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
