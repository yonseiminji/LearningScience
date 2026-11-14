// The browser's side of the serverless functions: /api/tutor/* for the
// lecture tutor, /api/planner/* for splitting an assignment into steps.
//
// It never holds a key and never talks to Google: the server does both. If
// these endpoints are not deployed — a local `vite dev` with no functions,
// say — the calls fail and tutorService falls back to the vetted demo
// questions, saying so on screen.

async function post(path, body) {
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
  if (!response.ok) throw new TutorApiError(data?.error || '요청이 실패했어요.', response.status)
  return data
}

export class TutorApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
  /** Worth trying the demo questions instead? A missing or unreachable
   *  function is; a refusal with a reason is not. */
  get isUnavailable() {
    return this.status === 0 || this.status === 404 || this.status === 405 || this.status === 503
  }
}

export const tutorApi = {
  quiz: (payload) => post('/api/tutor/quiz', payload),
  answer: (payload) => post('/api/tutor/answer', payload),
  support: (payload) => post('/api/tutor/support', payload),
  chunk: (payload) => post('/api/planner/chunk', payload),
}
