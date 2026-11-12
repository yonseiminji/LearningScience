// What the review screens call. One interface, two possible answerers.
//
//   Gemini, through /api/tutor/*   — the real path
//   the vetted demo questions      — when those endpoints are not reachable
//
// Every result carries `provider`, and the panel shows which one answered. A
// screen never has to guess, and a demo question is never passed off as a
// generated one.

import { TutorApiError, tutorApi } from './tutorApi.js'
import { mockTutorService } from './mockTutorService.js'

async function withFallback(call, fallback) {
  try {
    return await call()
  } catch (error) {
    if (error instanceof TutorApiError && error.isUnavailable) return fallback()
    throw error
  }
}

export const tutorService = {
  /** Questions come back with their answers sealed, not in the clear. */
  createQuiz({ material, chunkIds }) {
    const chunks = material.chunks.filter((chunk) => chunkIds.includes(chunk.chunkId))
    return withFallback(
      () =>
        tutorApi
          .quiz({
            materialId: material.materialId,
            selectedChunkIds: chunkIds,
            chunks: chunks.map(({ chunkId, text }) => ({ chunkId, text })),
            questionTypes: ['ox', 'blank'],
            questionCount: 3,
          })
          .then((data) => ({ ...data, provider: 'gemini' })),
      () => mockTutorService.createQuiz({ material, chunkIds }),
    )
  },

  /** The answerToken came with the question and is opaque to this side; the
   *  server opens it to mark. */
  submitAnswer({ quizId, questionId, answerToken, userAnswer }) {
    if (String(quizId).startsWith('mock-')) {
      return mockTutorService.submitAnswer({ quizId, questionId, userAnswer })
    }
    return withFallback(
      () => tutorApi.answer({ questionId, answerToken, userAnswer }).then((d) => ({ ...d, provider: 'gemini' })),
      () => mockTutorService.submitAnswer({ quizId, questionId, userAnswer }),
    )
  },

  requestSupport({ questionId, questionText, userAnswer, isCorrect, supportType, chunks }) {
    const payload = {
      questionId,
      questionText,
      userAnswer,
      isCorrect,
      supportType,
      retrievedChunks: chunks.map(({ chunkId, text }) => ({ chunkId, text })),
    }
    return withFallback(
      () => tutorApi.support(payload).then((d) => ({ ...d, provider: 'gemini' })),
      () => mockTutorService.requestSupport({ supportType, chunks }),
    )
  },
}

export const SUPPORT_TYPES = [
  { id: 'term', label: '용어의 뜻을 모르겠어요' },
  { id: 'comparison', label: '두 개념의 차이가 헷갈려요' },
  { id: 'question', label: '문제에서 무엇을 묻는지 모르겠어요' },
]
