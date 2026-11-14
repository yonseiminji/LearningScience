// Carrying the answer without letting the learner read it.
//
// /api/tutor/quiz and /api/tutor/answer are two Vercel Functions, so they are
// two lambdas and never share memory: an answer key held in a Map on one is
// simply not there when the other runs. Keeping the key out of the browser
// therefore cannot be done by keeping it on "the server" — there is no single
// server.
//
// So the answer travels with the question, sealed. The browser holds an opaque
// token it cannot open; /api/tutor/answer opens it with a key only the
// environment has. Stateless, so it works across instances and across a
// redeploy, and nothing expires out from under a learner mid-quiz.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { ApiError } from '../_lib/gemini.js'

const TTL_MS = 6 * 60 * 60 * 1000 // six hours: long enough for any one sitting

// A dedicated secret is better, but deriving one from the API key means the
// feature works with the single variable the deploy already needs.
function key() {
  const source = process.env.TUTOR_SECRET || process.env.GEMINI_API_KEY
  if (!source) throw new ApiError(503, '서버 설정이 끝나지 않았어요.')
  return createHash('sha256').update(`chagok-tutor:${source}`).digest()
}

export function seal(payload) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const body = Buffer.concat([
    cipher.update(JSON.stringify({ ...payload, exp: Date.now() + TTL_MS }), 'utf8'),
    cipher.final(),
  ])
  return [iv, cipher.getAuthTag(), body].map((part) => part.toString('base64url')).join('.')
}

export function unseal(token) {
  if (typeof token !== 'string') throw new ApiError(400, '문제 정보가 없어요.')
  const parts = token.split('.')
  if (parts.length !== 3) throw new ApiError(400, '문제 정보를 읽지 못했어요.')
  let payload
  try {
    const [iv, tag, body] = parts.map((part) => Buffer.from(part, 'base64url'))
    const decipher = createDecipheriv('aes-256-gcm', key(), iv)
    decipher.setAuthTag(tag)
    payload = JSON.parse(Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8'))
  } catch {
    // a tampered or re-signed token fails the auth tag, not just the parse
    throw new ApiError(400, '문제 정보를 읽지 못했어요.')
  }
  if (!payload?.exp || Date.now() > payload.exp) {
    throw new ApiError(410, '문제가 오래됐어요. 문제를 다시 만들어 주세요.')
  }
  return payload
}
