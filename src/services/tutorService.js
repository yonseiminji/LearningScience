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

// Set VITE_TUTOR_STRICT=1 on Preview to stop the fallback. Normally an
// unreachable endpoint quietly becomes the demo questions, which is right for
// a learner and wrong for a deployment check: a broken route, a refused
// method and a missing key all look like a working screen. Strict mode lets
// the error through so it can be read.
const STRICT = import.meta.env?.VITE_TUTOR_STRICT === '1' || import.meta.env?.VITE_TUTOR_STRICT === 'true'

async function withFallback(call, fallback) {
  try {
    return await call()
  } catch (error) {
    if (STRICT) throw error
    if (error instanceof TutorApiError && error.isUnavailable) return fallback()
    throw error
  }
}

export const tutorService = {
  /** Questions come back with their answers sealed, not in the clear. */
  createQuiz({ material, chunkIds, onWait }) {
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
          }, { onWait })
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

  /**
   * 개념 이해 지원. No mock fallback, on purpose.
   *
   * Everywhere else a dead endpoint quietly becomes the demo content, which
   * keeps a learner moving. Here it would be a lie with a citation on it: the
   * screen already shows the checked definition, so a failure can surface as
   * a failure and still leave something correct on the page.
   */
  explainConcept({ material, conceptId, supportType, chunks, onWait }) {
    return tutorApi
      .explain({
        materialId: material.materialId,
        conceptId,
        supportType,
        lectureChunks: chunks.map(({ chunkId, text }) => ({ chunkId, text })),
      }, { onWait })
      .then((data) => ({ ...data, provider: 'gemini' }))
  },

  /**
   * 통 인출 대조. No mock fallback, for the same reason explain has
   * none: a made-up reading of what the learner wrote would be worse than
   * saying the check could not run.
   */
  checkRecall({ material, attempt, conceptId, rubricId, onWait }) {
    return tutorApi.recall({ materialId: material.materialId, attempt, conceptId, rubricId }, { onWait })
  },

  /** Steps for one assignment, at the granularity the learner asked for.
   *  Nothing is stored: what comes back is a proposal for them to edit. */
  createSteps({ subjectId, subjectName, instruction, chunkingLevel, onWait }) {
    return withFallback(
      () =>
        tutorApi
          .chunk({ subjectId, subjectName, instruction, chunkingLevel }, { onWait })
          .then((data) => ({ ...data, provider: 'gemini' })),
      () => mockTutorService.createSteps(),
    )
  },
}

export const SUPPORT_TYPES = [
  { id: 'term', label: '용어의 뜻을 모르겠어요' },
  { id: 'comparison', label: '두 개념의 차이가 헷갈려요' },
  { id: 'question', label: '문제에서 무엇을 묻는지 모르겠어요' },
]
