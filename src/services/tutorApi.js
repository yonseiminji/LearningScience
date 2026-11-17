// The browser's side of the serverless functions: /api/tutor/* for the
// lecture tutor, /api/planner/* for splitting an assignment into steps.
//
// It never holds a key and never talks to Google: the server does both. If
// these endpoints are not deployed — a local `vite dev` with no functions,
// say — the calls fail and tutorService falls back to the vetted demo
// questions, saying so on screen.

// How long a queued caller will keep waiting before giving up. Long enough
// for a classroom to drain, short enough that nobody stares at a spinner.
const MAX_WAIT_MS = 45000

/**
 * Send, and wait our turn if the server says to.
 *
 * A full queue answers 429 with how long to wait and how many are ahead, and
 * that is not an error — the request has not been refused, only deferred. The
 * screen says so and the call retries itself. Anything else is thrown.
 *
 * `onWait` lets the screen report the position; without it the wait is silent.
 */
async function post(path, body, { onWait } = {}) {
  const until = Date.now() + MAX_WAIT_MS
  for (;;) {
    try {
      return await send(path, body)
    } catch (error) {
      const wait = error instanceof TutorApiError ? error.retryAfterMs : 0
      if (!wait || Date.now() + wait > until) throw error
      onWait?.({ ahead: error.ahead, message: error.message })
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
  }
}

async function send(path, body) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new TutorApiError('서버에 연결하지 못했어요.', 0)
  }

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // an HTML error page means the function is not deployed at this path
    throw new TutorApiError('서버 응답을 읽지 못했어요.', response.status)
  }
  if (!response.ok) {
    throw new TutorApiError(data?.error || '요청이 실패했어요.', response.status, {
      retryAfterMs: Number(data?.retryAfterMs) || 0,
      ahead: Number(data?.ahead) || 0,
    })
  }
  return data
}

export class TutorApiError extends Error {
  constructor(message, status, meta = {}) {
    super(message)
    this.status = status
    this.retryAfterMs = meta.retryAfterMs || 0
    this.ahead = meta.ahead || 0
  }

  /**
   * Worth trying the demo questions instead?
   *
   * A missing or unreachable function is. A busy model is not: 503 used to
   * mean 'no function at this path' here, and now it also means 'Google is
   * overloaded' — swapping in demo content every time the class gets busy
   * would hand out written-in-advance answers as if they were the Tutor's.
   * A busy model is a wait, and the caller waits.
   */
  get isUnavailable() {
    return this.status === 0 || this.status === 404 || this.status === 405
  }
}

// Every one takes the options post takes, so a caller can pass onWait and
// turn a silent forty-five seconds into a queue position on screen.
export const tutorApi = {
  quiz: (payload, options) => post('/api/tutor/quiz', payload, options),
  answer: (payload, options) => post('/api/tutor/answer', payload, options),
  support: (payload, options) => post('/api/tutor/support', payload, options),
  explain: (payload, options) => post('/api/tutor/explain', payload, options),
  recall: (payload, options) => post('/api/tutor/recall', payload, options),
  chunk: (payload, options) => post('/api/planner/chunk', payload, options),
}
