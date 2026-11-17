// Limits that hold across Vercel instances.
//
// The in-memory limiter in limit.js counts calls inside one function instance.
// Vercel runs many, and a cold one starts with an empty map, so under the
// load it was written for — thirty people at once — it throttles close to
// nothing. The quota it is meant to protect is shared, so the counter has to
// be shared too.
//
// Upstash over its REST API, reached with plain fetch: no package to install,
// and nothing to run. With the env vars unset everything here degrades to the
// per-instance behaviour and says so, so a local run or a preview without a
// store still works — just without the guarantee.

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL || ''
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''

export function sharedStoreReady() {
  return Boolean(URL_BASE && TOKEN)
}

/** One Redis command over REST. Returns null when the store is unreachable. */
async function command(parts) {
  if (!sharedStoreReady()) return null
  try {
    const response = await fetch(`${URL_BASE}/${parts.map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      // A limiter that hangs is worse than one that is absent: the request it
      // is guarding would time out before the model was ever called.
      signal: AbortSignal.timeout(1200),
    })
    if (!response.ok) return null
    const body = await response.json()
    return body?.result ?? null
  } catch {
    return null
  }
}

/**
 * How many calls this key has seen in the current window.
 *
 * A fixed window rather than a sliding one: at this size the difference does
 * not matter, and INCR with EXPIRE is one round trip where a sliding window
 * is several.
 */
export async function bump(key, windowSeconds) {
  const count = await command(['INCR', key])
  if (count === null) return null
  if (Number(count) === 1) await command(['EXPIRE', key, String(windowSeconds)])
  return Number(count)
}

/**
 * Take one of a fixed number of concurrent slots, or be told to wait.
 *
 * Slots are held by a counter with a short expiry rather than a lock, so a
 * function that dies mid-call cannot hold one for ever — the worst case is
 * that the slot frees itself a few seconds late.
 */
export async function takeSlot(key, cap, holdSeconds = 30) {
  const count = await command(['INCR', key])
  if (count === null) return { ok: true, shared: false, ahead: 0 }
  if (Number(count) === 1) await command(['EXPIRE', key, String(holdSeconds)])
  if (Number(count) > cap) {
    await command(['DECR', key])
    return { ok: false, shared: true, ahead: Number(count) - cap }
  }
  return { ok: true, shared: true, ahead: 0 }
}

export async function releaseSlot(key) {
  const count = await command(['DECR', key])
  // A late release from an expired window can drive this negative; floor it
  // so the next window does not start with free slots it should not have.
  if (count !== null && Number(count) < 0) await command(['SET', key, '0'])
}

/**
 * Hold the shared budget and a slot for one actual model call.
 *
 * These guard the Gemini quota, so they are taken where the quota is spent --
 * around the call itself -- and not when a request arrives. A request served
 * from the prompt cache reaches Google not at all, and used to spend a minute
 * of budget anyway: thirty learners asking thirty questions that were all
 * recorded got ten 429s and a 20-second wait for answers already sitting on
 * disk. The limiter was throttling the thing built to relieve it.
 *
 * Returns a refusal rather than throwing, so this file stays independent of
 * gemini.js; the caller owns ApiError and turns this into one.
 */
export async function reserveModelCall({ key = 'slots:gemini', perMinute, concurrency }) {
  const minute = Math.floor(Date.now() / 60000)
  const used = await bump(`rpm:${minute}`, 90)
  if (used !== null && used > perMinute) {
    return {
      ok: false,
      message: '지금 함께 쓰는 사람이 많아요. 20초쯤 뒤에 다시 해 주세요.',
      meta: { retryAfterMs: 20000 },
    }
  }
  const slot = await takeSlot(key, concurrency)
  if (!slot.ok) {
    return {
      ok: false,
      message: slot.ahead > 0 ? `앞에 ${slot.ahead}명이 기다리고 있어요. 곧 순서가 와요.` : '잠시만 기다려 주세요.',
      meta: { retryAfterMs: 2500 + Math.floor(Math.random() * 1500), ahead: slot.ahead },
    }
  }
  return { ok: true, slot, key }
}

export async function releaseModelCall(reservation) {
  if (reservation?.slot?.shared) await releaseSlot(reservation.key)
}
