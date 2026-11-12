// POST /api/tutor/answer — 학생 응답 채점
//
// The answer arrives sealed, as the token that went out with the question.
// This is the first moment it is readable at all, and the first moment the
// learner is told what it was.
//
// No model call: marking is a comparison, and spending a request on it would
// make it slower, costlier and less predictable.

import { ApiError, handler, sendJson } from './_gemini.js'
import { checkRate, requireString } from './_limit.js'
import { gradeAnswer } from './_grade.js'
import { unseal } from './_seal.js'

export default handler(async (req, res, body) => {
  checkRate(req)

  const questionId = requireString(body.questionId, 'questionId', { max: 200 })
  const sealed = unseal(body.answerToken)
  // the token is bound to its own question, so one cannot be used to mark
  // another
  if (sealed.questionId !== questionId) throw new ApiError(400, '문제 정보가 맞지 않아요.')

  // an empty answer is a wrong answer, not a bad request
  const userAnswer = typeof body.userAnswer === 'string' ? body.userAnswer.slice(0, 500) : ''
  const isCorrect = gradeAnswer(sealed, userAnswer)

  sendJson(res, 200, {
    schemaVersion: 1,
    questionId,
    userAnswer,
    result: isCorrect ? 'correct' : 'incorrect',
    // revealed only now that the learner's answer is in
    correctAnswer: sealed.answer,
    acceptableAnswers: sealed.acceptableAnswers || [],
    explanation: sealed.explanation || '',
    sourceChunkIds: sealed.sourceChunkIds || [],
    evidenceText: sealed.evidenceText || '',
  })
})
