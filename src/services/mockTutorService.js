// The fallback, for when the Tutor API is not reachable.
//
// These questions were written and checked by hand against the demo lecture —
// §5 of the spec allows pre-reviewed questions as a stand-in. They are not
// generated, and nothing here claims they were: every result carries
// provider: 'mock', and the panel says on screen which one answered.
//
// Answers sit in this module rather than in the rendered props, so they are
// not in the page a learner is looking at. They are still in the bundle: that
// is the honest limit of a client-side fallback, and the reason the real path
// marks on the server.

import { retrieveChunks } from '../utils/chunkSearch.js'
import { gradeAnswer } from './grade.js'

const VETTED = [
  {
    key: 'working-memory-limit',
    find: '작업기억',
    type: 'ox',
    questionText: '작업기억은 한 번에 담을 수 있는 양에 제한이 있다.',
    answer: 'O',
    explanation: '강의 원문은 작업기억의 용량에 제한이 있다고 설명해요.',
  },
  {
    key: 'working-memory-blank',
    find: '작업기억',
    type: 'blank',
    questionText: '학습 정보를 잠시 유지하고 처리하는 기억을 무엇이라고 하나요?',
    answer: '작업기억',
    acceptableAnswers: ['작업 기억'],
    explanation: '작업기억은 정보를 잠시 유지하고 처리하는 인지 체계예요.',
  },
  {
    key: 'extrinsic-load',
    find: '외재적 인지부하',
    type: 'ox',
    questionText: '외재적 인지부하는 자료를 제시하는 방식과 관련될 수 있다.',
    answer: 'O',
    explanation: '자료를 불필요하게 복잡하게 제시하면 외재적 인지부하가 커질 수 있어요.',
  },
]

const quizzes = new Map()

function pick(chunks) {
  const out = []
  for (const item of VETTED) {
    const found = retrieveChunks(chunks, item.find, 1)[0]
    if (!found) continue
    out.push({
      questionId: `mock-${item.key}`,
      type: item.type,
      questionText: item.questionText,
      answer: item.answer,
      acceptableAnswers: item.acceptableAnswers || [],
      sourceChunkIds: [found.chunkId],
      evidenceText: found.text.slice(0, 160),
      explanation: item.explanation,
    })
  }
  return out
}

export const mockTutorService = {
  provider: 'mock',

  async createQuiz({ material, chunkIds = [] }) {
    const pool = chunkIds.length
      ? material.chunks.filter((chunk) => chunkIds.includes(chunk.chunkId))
      : material.chunks
    const questions = pick(pool)
    if (questions.length === 0) {
      const error = new Error('이 구간에 맞는 시연용 문제가 없어요. 다른 구간을 골라 보세요.')
      error.code = 'no-demo-questions'
      throw error
    }
    const quizId = `mock-quiz-${Date.now().toString(36)}`
    quizzes.set(quizId, questions)
    return {
      provider: 'mock',
      quizId,
      materialId: material.materialId,
      droppedCount: 0,
      questions: questions.map(({ questionId, type, questionText, sourceChunkIds, evidenceText }) => ({
        questionId,
        type,
        questionText,
        sourceChunkIds,
        evidenceText,
      })),
    }
  },

  async submitAnswer({ quizId, questionId, userAnswer }) {
    const question = (quizzes.get(quizId) || []).find((item) => item.questionId === questionId)
    if (!question) throw new Error('문제를 찾지 못했어요. 문제를 다시 만들어 주세요.')
    const isCorrect = gradeAnswer(question, userAnswer)
    return {
      provider: 'mock',
      quizId,
      questionId,
      userAnswer,
      result: isCorrect ? 'correct' : 'incorrect',
      correctAnswer: question.answer,
      acceptableAnswers: question.acceptableAnswers,
      explanation: question.explanation,
      sourceChunkIds: question.sourceChunkIds,
      evidenceText: question.evidenceText,
    }
  },

  // Chunking cannot be faked. Quiz has hand-vetted questions about known
  // paragraphs to fall back on; an assignment the learner just uploaded has
  // nothing prepared, and splitting it without reading it would be making
  // steps up. So this says plainly that the Tutor is not connected.
  async createSteps() {
    const error = new Error('Tutor가 연결되지 않아 과제를 단계로 나눌 수 없어요. 잠시 뒤 다시 시도해 주세요.')
    error.code = 'tutor-unavailable'
    throw error
  },

  // No model, so no explanation is written. The lecture text is shown instead,
  // which is what the support is ultimately pointing at anyway.
  async requestSupport({ supportType, chunks = [] }) {
    return {
      provider: 'mock',
      supportType,
      status: 'insufficient_evidence',
      response:
        'Tutor가 연결되지 않아 설명을 만들지 못했어요. 아래 강의 원문을 다시 읽어 보면서 어디가 막히는지 짚어 보세요.',
      sourceChunkIds: chunks.map((chunk) => chunk.chunkId),
      sourceText: '',
    }
  },
}
