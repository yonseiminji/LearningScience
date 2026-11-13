// The one place the model is called.
//
// The key lives in Vercel's environment and never leaves the server; the
// browser talks only to /api/tutor/*. The model is named by GEMINI_MODEL so a
// cheaper or newer Flash model can be swapped in without a deploy of code.

import { createHash } from 'node:crypto'
import { GoogleGenAI } from '@google/genai'

export const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

let client = null

export function hasApiKey() {
  return Boolean(process.env.GEMINI_API_KEY)
}

function getClient() {
  if (!hasApiKey()) throw new ApiError(503, 'GEMINI_API_KEY가 설정되지 않았어요.')
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  return client
}

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

// ─── observing the exchange ──────────────────────────────────────────────

// Set TUTOR_DEBUG=1 on Preview only. It logs what was sent to the model and
// what came back, so the two can be read side by side in Vercel's Runtime
// Logs. The key is never logged, and nothing here changes the response body:
// the raw model text holds the answers, so it stays in the server log.
export function debugEnabled() {
  return process.env.TUTOR_DEBUG === '1' || process.env.TUTOR_DEBUG === 'true'
}

// Short id so a request line and its response line can be paired in a log
// stream that interleaves concurrent invocations.
function traceId() {
  return Math.random().toString(36).slice(2, 10)
}

// One JSON line per entry. Vercel splits multi-line output into separate
// entries, which scrambles the pairing, so each log is a single line.
function logLine(tag, payload) {
  try {
    console.log(tag, JSON.stringify(payload))
  } catch {
    console.log(tag, '(직렬화할 수 없는 값)')
  }
}

// Vercel caps a runtime log line at 4KB and silently cuts the rest, and the
// system instruction alone is past that. So long text goes out in numbered
// parts, each inside the cap, and the metadata line says how many to expect.
//
// The budget is in bytes, not characters: a Korean syllable is three bytes in
// UTF-8, so a 3000-character slice of a lecture is 9KB and would be cut.
const LOG_PART_BYTES = 3400

// Split by code point so a surrogate pair is never broken in half.
function byteParts(text) {
  const parts = []
  let buffer = ''
  let size = 0
  for (const character of Array.from(String(text ?? ''))) {
    const width = Buffer.byteLength(character, 'utf8')
    if (size + width > LOG_PART_BYTES && buffer) {
      parts.push(buffer)
      buffer = ''
      size = 0
    }
    buffer += character
    size += width
  }
  if (buffer || parts.length === 0) parts.push(buffer)
  return parts
}

function logText(tag, id, text) {
  const parts = byteParts(text)
  parts.forEach((part, at) => logLine(`${tag}:${at + 1}/${parts.length}`, { id, text: part }))
  return parts.length
}

// The system instruction is the same on every call of a deploy and is in the
// repo, so its fingerprint is enough to tell which version answered.
function fingerprint(text) {
  return createHash('sha256').update(String(text ?? ''), 'utf8').digest('hex').slice(0, 8)
}

function finishReasonOf(response) {
  return response?.candidates?.[0]?.finishReason || null
}

/**
 * Asks the model for JSON of a given shape and parses it.
 * `responseSchema` makes the model answer in that shape; the caller still
 * checks the result, because a well-shaped answer can still be wrong.
 */
export async function generateJson({ systemInstruction, prompt, responseSchema, maxOutputTokens = 1200 }) {
  const ai = getClient()
  const debug = debugEnabled()
  const id = debug ? traceId() : null
  const startedAt = Date.now()

  if (debug) {
    logLine('[tutor:req]', {
      id,
      model: MODEL,
      maxOutputTokens,
      temperature: 0.2,
      systemChars: systemInstruction?.length ?? 0,
      systemHash: fingerprint(systemInstruction),
      promptChars: prompt?.length ?? 0,
      promptBytes: Buffer.byteLength(String(prompt ?? ''), 'utf8'),
    })
    logText('[tutor:prompt]', id, prompt)
  }

  let response
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens,
        temperature: 0.2,
      },
    })
  } catch (error) {
    if (debug) logLine('[tutor:err]', { id, ms: Date.now() - startedAt, error: String(error?.message || error) })
    throw new ApiError(502, '모델 응답을 받지 못했어요.', String(error?.message || error))
  }

  const reason = finishReasonOf(response)
  const text = response?.text

  if (debug) {
    const usage = response?.usageMetadata || {}
    logLine('[tutor:res]', {
      id,
      ms: Date.now() - startedAt,
      finishReason: reason,
      promptTokens: usage.promptTokenCount ?? null,
      outputTokens: usage.candidatesTokenCount ?? null,
      totalTokens: usage.totalTokenCount ?? null,
      textChars: text?.length ?? 0,
    })
    logText('[tutor:answer]', id, text)
  }

  // Why the model stopped decides what went wrong. Without this, a reply cut
  // off at the token ceiling and a reply that broke the schema both arrive as
  // 'not valid JSON' and the cause is unreadable.
  if (reason === 'MAX_TOKENS') {
    throw new ApiError(502, '모델 응답이 길이 제한에서 잘렸어요.', `finishReason=MAX_TOKENS maxOutputTokens=${maxOutputTokens} textChars=${text?.length ?? 0}`)
  }
  if (reason === 'SAFETY' || reason === 'PROHIBITED_CONTENT' || reason === 'RECITATION') {
    throw new ApiError(502, '모델이 이 내용에는 응답하지 않았어요.', `finishReason=${reason}`)
  }

  if (!text) throw new ApiError(502, '모델이 빈 응답을 보냈어요.', `finishReason=${reason}`)
  try {
    return JSON.parse(text)
  } catch {
    // The snippet goes to the server log through ApiError.detail, never to the
    // learner: fail() sends only `message`.
    throw new ApiError(502, '모델 응답이 올바른 JSON이 아니에요.', `finishReason=${reason} 앞부분=${text.slice(0, 300)}`)
  }
}

// ─── request plumbing shared by the three endpoints ──────────────────────

export const MAX_BODY_CHARS = 60000

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  let size = 0
  for await (const piece of req) {
    size += piece.length
    if (size > MAX_BODY_CHARS * 4) throw new ApiError(413, '요청이 너무 커요.')
    chunks.push(piece)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new ApiError(400, '요청 본문이 올바른 JSON이 아니에요.')
  }
}

export function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export function fail(res, error) {
  const status = error instanceof ApiError ? error.status : 500
  const message = error instanceof ApiError ? error.message : '알 수 없는 오류가 생겼어요.'
  // detail is for the server log, not the learner
  if (!(error instanceof ApiError)) console.error('[tutor]', error)
  else if (error.detail) console.error('[tutor]', error.message, error.detail)
  sendJson(res, status, { error: message, code: status })
}

/** Wraps a handler: POST only, body parsed, errors turned into JSON. */
export function handler(fn) {
  return async (req, res) => {
    // A refused method is logged under debug, because the browser turns a 405
    // into the demo questions without a word and the refusal would otherwise
    // leave no trace of itself.
    if (req.method !== 'POST') {
      if (debugEnabled()) logLine('[tutor:405]', { method: req.method, url: req.url })
      return sendJson(res, 405, { error: 'POST만 받아요.', code: 405 })
    }
    if (debugEnabled()) logLine('[tutor:hit]', { method: req.method, url: req.url, hasApiKey: hasApiKey() })
    try {
      const body = await readJsonBody(req)
      await fn(req, res, body)
    } catch (error) {
      fail(res, error)
    }
  }
}
