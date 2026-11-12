/**
 * Splitting a lecture TXT into chunks, and finding the ones a question is
 * about. No embeddings, no vector database — a deterministic paragraph split
 * and a keyword match, which is what this version calls for.
 *
 * Chunks carry where they came from: their order, their character span in the
 * original text, and — only when the file actually has them — the recording
 * times and speaker written in it. A file without timecodes gets none; an
 * invented time would point at a recording that does not exist.
 */

// 클로바노트 식 머리글: [00:00~02:19] 교수자
const TIME_HEADER = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\s*[~-]\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/
const TIME_SINGLE = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/

function splitParagraphs(content) {
  const text = String(content || '').replace(/\r\n/g, '\n')
  const parts = []
  let cursor = 0
  for (const piece of text.split(/\n\s*\n/)) {
    const start = text.indexOf(piece, cursor)
    cursor = start + piece.length
    const trimmed = piece.trim()
    if (!trimmed) continue
    parts.push({ text: trimmed, startChar: start + piece.indexOf(trimmed), endChar: start + piece.indexOf(trimmed) + trimmed.length })
  }
  return parts
}

// Pulls a timecode header out of the top of a paragraph, if there is one.
// It is usually the first line, but a section title can sit above it
// ('[전체 전사문]' then '[00:00~02:19] 교수자'), so the first couple of lines
// are checked. Only the matched line is taken out; the rest stays as written.
const HEADER_SEARCH_LINES = 2

function readTimeHeader(paragraph) {
  const lines = paragraph.split('\n')
  for (let at = 0; at < Math.min(HEADER_SEARCH_LINES, lines.length); at += 1) {
    const line = lines[at].trim()
    const ranged = TIME_HEADER.exec(line)
    const single = ranged ? null : TIME_SINGLE.exec(line)
    if (!ranged && !single) continue

    const speaker = (ranged ? ranged[3] : single[2]).trim()
    const body = lines
      .filter((_, index) => index !== at)
      .join('\n')
      .trim()
    return {
      startTime: ranged ? ranged[1] : single[1],
      endTime: ranged ? ranged[2] : null,
      speaker: speaker || null,
      body: body || speaker,
    }
  }
  return null
}

function splitLong(text, maxChars) {
  if (text.length <= maxChars) return [text]
  const out = []
  let buffer = ''
  for (const sentence of text.split(/(?<=[.!?。])\s+/)) {
    if (buffer && buffer.length + sentence.length + 1 > maxChars) {
      out.push(buffer.trim())
      buffer = ''
    }
    if (sentence.length > maxChars) {
      if (buffer) {
        out.push(buffer.trim())
        buffer = ''
      }
      for (let at = 0; at < sentence.length; at += maxChars) out.push(sentence.slice(at, at + maxChars))
    } else {
      buffer += `${buffer ? ' ' : ''}${sentence}`
    }
  }
  if (buffer.trim()) out.push(buffer.trim())
  return out
}

export function createChunks(materialId, content, maxChars = 650) {
  const chunks = []
  for (const paragraph of splitParagraphs(content)) {
    const header = readTimeHeader(paragraph.text)
    const body = header ? header.body : paragraph.text
    if (!body) continue
    for (const piece of splitLong(body, maxChars)) {
      const index = chunks.length
      chunks.push({
        chunkId: `${materialId}-chunk-${String(index + 1).padStart(3, '0')}`,
        materialId,
        index,
        text: piece,
        startChar: paragraph.startChar,
        endChar: paragraph.endChar,
        // only present when the file carried them
        ...(header?.startTime ? { startTime: header.startTime } : {}),
        ...(header?.endTime ? { endTime: header.endTime } : {}),
        ...(header?.speaker ? { speaker: header.speaker } : {}),
      })
    }
  }
  return chunks
}

export function hasTimestamps(chunks = []) {
  return chunks.some((chunk) => Boolean(chunk.startTime))
}

export function timeLabel(chunk) {
  if (!chunk?.startTime) return ''
  return chunk.endTime ? `${chunk.startTime}~${chunk.endTime}` : chunk.startTime
}

/** Keyword overlap, two or three chunks back. Nothing found means no evidence,
 *  which the caller must treat as insufficient rather than guessing. */
export function retrieveChunks(chunks, query, topK = 3) {
  const keywords = String(query).toLowerCase().match(/[가-힣a-z0-9]{2,}/g) || []
  const unique = [...new Set(keywords)]
  if (!unique.length) return []
  return chunks
    .map((chunk) => ({
      ...chunk,
      score: unique.reduce((score, token) => score + (chunk.text.toLowerCase().includes(token) ? 1 : 0), 0),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, topK)
}

export function chunksByIds(chunks = [], ids = []) {
  return ids.map((id) => chunks.find((chunk) => chunk.chunkId === id)).filter(Boolean)
}

// Long selections make for vague questions. The panel uses this to suggest
// studying in shorter runs rather than refusing the selection.
export const COMFORTABLE_CHARS = 2400

export function selectionSize(chunks = []) {
  return chunks.reduce((total, chunk) => total + chunk.text.length, 0)
}

export function selectionTooLong(chunks = []) {
  return selectionSize(chunks) > COMFORTABLE_CHARS
}
