// Marking a blank-fill answer, shared by the fallback and the server.
//
// Spacing and case are ignored, and so is a trailing 이에요/예요 — a learner
// who writes the right word should not lose it to punctuation. Nothing looser:
// two words that merely look alike are not the same answer, and string
// similarity would mark a wrong one right.

export function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,!?·]+$/u, '')
    .replace(/(이에요|예요|입니다|이다)$/u, '')
}

export function gradeAnswer(question, userAnswer) {
  const given = normalize(userAnswer)
  if (!given) return false
  return [question.answer, ...(question.acceptableAnswers || [])].some(
    (candidate) => normalize(candidate) === given,
  )
}
