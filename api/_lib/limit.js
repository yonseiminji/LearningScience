// A ceiling on how often one caller may ask the model, and on how much text
// each ask may carry. Both guard the bill as much as the service.
//
// In memory, so it holds within one serverless instance and resets when that
// instance recycles. Enough to stop a loop or an open tab from running up a
// cost; a real deployment needs a shared store.

import { ApiError } from './gemini.js'

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const calls = new Map()

function callerOf(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRate(req) {
  const caller = callerOf(req)
  const now = Date.now()
  const recent = (calls.get(caller) || []).filter((at) => now - at < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    throw new ApiError(429, '요청이 너무 잦아요. 잠시 뒤에 다시 시도해 주세요.')
  }
  recent.push(now)
  calls.set(caller, recent)
  if (calls.size > 5000) calls.clear() // keep the map from growing without bound
}

export function requireString(value, field, { max = 4000, min = 1 } = {}) {
  if (typeof value !== 'string' || value.trim().length < min) {
    throw new ApiError(400, `${field} 값이 필요해요.`)
  }
  if (value.length > max) throw new ApiError(413, `${field}가 너무 길어요.`)
  return value
}

export function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw new ApiError(400, `${field} 값이 올바르지 않아요.`)
  return value
}

export function requireChunks(value, { maxCount = 12, maxChars = 12000 } = {}) {
  if (!Array.isArray(value) || value.length === 0) throw new ApiError(400, '강의 청크가 필요해요.')
  if (value.length > maxCount) throw new ApiError(413, `한 번에 ${maxCount}개까지만 보낼 수 있어요.`)
  let total = 0
  for (const chunk of value) {
    if (typeof chunk?.chunkId !== 'string' || typeof chunk?.text !== 'string') {
      throw new ApiError(400, '청크 형식이 올바르지 않아요.')
    }
    total += chunk.text.length
  }
  if (total > maxChars) throw new ApiError(413, '보낸 강의 내용이 너무 길어요. 구간을 나눠 주세요.')
  return value
}
