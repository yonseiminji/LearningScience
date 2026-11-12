// POST /api/tutor/answer — 학생 응답 채점
//
// The marking happens here because the answer is here. The question went out
// without it, so this is the first moment the learner can see whether they
// were right — and the first moment the right answer is sent at all.
//
// No model call: this is a comparison, and spending a request on it would
// make marking slower, costlier and less predictable.

import { handler, sendJson } from './_gemini.js'
import { checkRate, requireString } from './_limit.js'
import { gradeAnswer } from './_grade.js'
import { loadQuestion } from './_store.js'

export default handler(async (req, res, body) => {
  checkRate(req)

  const quizId = requireString(body.quizId, 'quizId', { max: 200 })
  const questionId = requireString(body.questionId, 'questionId', { max: 200 })
  // an empty answer is a wrong answer, not a bad request
  const userAnswer = typeof body.userAnswer === 'string' ? body.userAnswer.slice(0, 500) : ''

  const { question } = loadQuestion(quizId, questionId)
  const isCorrect = gradeAnswer(question, userAnswer)

  sendJson(res, 200, {
    schemaVersion: 1,
    quizId,
    questionId,
    userAnswer,
    result: isCorrect ? 'correct' : 'incorrect',
    // revealed only now that the answer is in
    correctAnswer: question.answer,
    acceptableAnswers: question.acceptableAnswers,
    explanation: question.explanation,
    sourceChunkIds: question.sourceChunkIds,
    evidenceText: question.evidenceText,
  })
})
