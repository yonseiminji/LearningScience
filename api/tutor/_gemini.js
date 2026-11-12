// The one place the model is called.
//
// The key lives in Vercel's environment and never leaves the server; the
// browser talks only to /api/tutor/*. The model is named by GEMINI_MODEL so a
// cheaper or newer Flash model can be swapped in without a deploy of code.

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

/**
 * Asks the model for JSON of a given shape and parses it.
 * `responseSchema` makes the model answer in that shape; the caller still
 * checks the result, because a well-shaped answer can still be wrong.
 */
export async function generateJson({ systemInstruction, prompt, responseSchema, maxOutputTokens = 1200 }) {
  const ai = getClient()
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
    throw new ApiError(502, '모델 응답을 받지 못했어요.', String(error?.message || error))
  }

  const text = response?.text
  if (!text) throw new ApiError(502, '모델이 빈 응답을 보냈어요.')
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError(502, '모델 응답이 올바른 JSON이 아니에요.')
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
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST만 받아요.', code: 405 })
    try {
      const body = await readJsonBody(req)
      await fn(req, res, body)
    } catch (error) {
      fail(res, error)
    }
  }
}
