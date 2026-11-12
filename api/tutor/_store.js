// Where the answers live.
//
// A quiz leaves the server without its answers: the browser gets the
// questions, the answers stay here, and /api/tutor/answer does the marking.
// Otherwise the answer key is a right-click away.
//
// In memory, with a time limit, so it holds for the length of a sitting on one
// serverless instance. A learner who is routed elsewhere mid-quiz will be told
// the quiz expired rather than marked wrongly. A real deployment needs a
// shared store; this is the seam for it.

import { ApiError } from './_gemini.js'

const TTL_MS = 60 * 60 * 1000 // one hour
const MAX_ENTRIES = 500
const quizzes = new Map()

function sweep() {
  const now = Date.now()
  for (const [id, entry] of quizzes) {
    if (now - entry.createdAt > TTL_MS) quizzes.delete(id)
  }
  if (quizzes.size > MAX_ENTRIES) {
    const oldest = [...quizzes.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)
    for (const [id] of oldest.slice(0, quizzes.size - MAX_ENTRIES)) quizzes.delete(id)
  }
}

export function saveQuiz({ quizId, materialId, questions }) {
  sweep()
  quizzes.set(quizId, { quizId, materialId, questions, createdAt: Date.now() })
}

export function loadQuestion(quizId, questionId) {
  const quiz = quizzes.get(quizId)
  if (!quiz) {
    throw new ApiError(410, '문제가 만료됐어요. 문제를 다시 만들어 주세요.')
  }
  const question = quiz.questions.find((item) => item.questionId === questionId)
  if (!question) throw new ApiError(404, '그 문제를 찾지 못했어요.')
  return { quiz, question }
}

export function newQuizId(materialId) {
  const random = Math.random().toString(36).slice(2, 10)
  return `quiz-${materialId.slice(-8)}-${Date.now().toString(36)}-${random}`
}
