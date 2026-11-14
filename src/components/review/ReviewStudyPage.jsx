import { useEffect, useMemo, useRef, useState } from 'react'
import MaterialSelector from './MaterialSelector.jsx'
import ReviewModeGrid from './ReviewModeGrid.jsx'
import LectureChunks from './LectureChunks.jsx'
import ChunkSelector from './ChunkSelector.jsx'
import QuizPanel from './QuizPanel.jsx'
import SupportPanel from './SupportPanel.jsx'
import { tutorService } from '../../services/tutorService.js'
import { chunksByIds, retrieveChunks } from '../../utils/chunkSearch.js'
import { ACTIVITY } from '../../studyHistory.js'
import './reviewStudy.css'

// 복습 및 개인 공부.
//
// A sitting runs: read the lecture → choose a stretch of it → answer questions
// about that stretch → go back to whatever did not stick. The Tutor only ever
// sees the paragraphs the learner picked, and every answer it gives points
// back at them.
//
// Errors are held apart from the work: a failed request shows a message and
// leaves the quiz, the answers given so far and the selection exactly where
// they were.
export default function ReviewStudyPage({ courseId, materials = [], showHeading = true, onStudied }) {
  const [materialId, setMaterialId] = useState('')
  const [mode, setMode] = useState(null)
  const [selectedChunkIds, setSelectedChunkIds] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [results, setResults] = useState({})
  const [support, setSupport] = useState(null)
  const [busy, setBusy] = useState(null) // null | 'quiz' | 'answer' | 'support'
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const available = useMemo(() => materials.filter((item) => item.courseId === courseId), [materials, courseId])
  const material = available.find((item) => item.materialId === materialId) || null
  const chunks = material?.chunks || []

  // a different subject, or a file that is gone, means a different lecture:
  // its questions and answers go with it
  function resetStudy() {
    requestId.current += 1
    setMode(null)
    setSelectedChunkIds([])
    setQuiz(null)
    setResults({})
    setSupport(null)
    setBusy(null)
    setError(null)
  }

  useEffect(() => {
    setMaterialId('')
    resetStudy()
  }, [courseId])

  useEffect(() => {
    if (materialId && !available.some((item) => item.materialId === materialId)) {
      setMaterialId('')
      resetStudy()
    }
  }, [available, materialId])

  function changeMaterial(id) {
    setMaterialId(id)
    resetStudy()
  }

  async function run(kind, work) {
    const id = ++requestId.current
    setBusy(kind)
    setError(null)
    try {
      const value = await work()
      if (id === requestId.current) return value
      return null
    } catch (failure) {
      // the learner's answers stay; only the message changes
      if (id === requestId.current) setError(failure.message || '요청을 처리하지 못했어요.')
      return null
    } finally {
      if (id === requestId.current) setBusy(null)
    }
  }

  // Returning without a word here is how a missing step looks like a broken
  // feature: nothing is requested and nothing is said. Say which step is
  // missing, and for a missing selection open the screen that fixes it.
  async function makeQuiz() {
    if (!material) {
      setError('먼저 공부할 강의를 선택해 주세요.')
      return
    }
    if (selectedChunkIds.length === 0) {
      setError('문제로 풀어 볼 구간을 하나 이상 골라 주세요.')
      setMode('select')
      return
    }
    const data = await run('quiz', () => tutorService.createQuiz({ material, chunkIds: selectedChunkIds }))
    if (!data) return
    setQuiz(data)
    setResults({})
    setSupport(null)
    setMode('quiz')
  }

  async function submitAnswer(question, userAnswer) {
    if (!quiz) return
    const data = await run('answer', () =>
      tutorService.submitAnswer({
        quizId: quiz.quizId,
        questionId: question.questionId,
        answerToken: question.answerToken,
        userAnswer,
      }),
    )
    if (!data) return
    setResults((prev) => ({ ...prev, [question.questionId]: data }))
    // Answering is the point at which something was studied. A quiz that was
    // generated and then abandoned leaves no trace, which is why the tag has
    // waited here since generation instead of being recorded on arrival.
    // Whether the answer was right has no bearing on it.
    onStudied?.({
      subjectId: courseId,
      topicTag: quiz.topicTag,
      activityType: ACTIVITY.quizAnswer,
      sourceChunkIds: question.sourceChunkIds,
    })
  }

  async function requestSupport(question, result, supportType) {
    // the paragraphs the question was built from come first; a keyword search
    // only fills in when there are none
    const sourced = chunksByIds(chunks, question.sourceChunkIds)
    const retrieved = sourced.length > 0 ? sourced : retrieveChunks(chunks, question.questionText, 3)
    if (retrieved.length === 0) {
      setError('이 문제와 이어지는 강의 원문을 찾지 못했어요.')
      return
    }
    const data = await run('support', () =>
      tutorService.requestSupport({
        questionId: question.questionId,
        questionText: question.questionText,
        userAnswer: result?.userAnswer || '',
        isCorrect: result?.result === 'correct',
        supportType,
        chunks: retrieved,
      }),
    )
    if (!data) return
    setSupport({ ...data, questionId: question.questionId })
    // Only a supported answer counts: with no evidence there was nothing to
    // study, and without a tag there is nothing to name.
    if (data.status === 'supported' && data.topicTag?.trim()) {
      onStudied?.({
        subjectId: courseId,
        topicTag: data.topicTag,
        activityType: ACTIVITY.tutorSupport,
        sourceChunkIds: data.sourceChunkIds,
      })
    }
  }

  function retryQuestion() {
    if (!support) return
    setResults((prev) => {
      const next = { ...prev }
      delete next[support.questionId]
      return next
    })
    setSupport(null)
    setMode('quiz')
  }

  const disabledModes = []
  if (selectedChunkIds.length === 0 && !quiz) disabledModes.push('quiz')
  if (!quiz) disabledModes.push('support')

  // A greyed-out card with no reason reads as a fault. Name the step that
  // would turn it on.
  const blockedHint = disabledModes.includes('quiz')
    ? '‘강의 구간 선택하기’에서 구간을 고르면 문제를 만들 수 있어요.'
    : disabledModes.includes('support')
      ? '문제를 한 번 풀면 ‘부족한 부분 다시 학습하기’를 쓸 수 있어요.'
      : ''

  return (
    <section className="review-study">
      {showHeading ? <h2>복습 및 개인 공부</h2> : null}
      <MaterialSelector materials={available} value={materialId} onChange={changeMaterial} />

      {material ? (
        <>
          <h3>무엇을 공부할까요?</h3>
          <ReviewModeGrid
            activeMode={mode}
            disabledModes={disabledModes}
            onSelect={(next) => {
              setError(null)
              if (next === 'quiz' && !quiz) {
                makeQuiz()
                return
              }
              setMode(next)
            }}
          />

          {blockedHint && !error ? <p className="review-muted">{blockedHint}</p> : null}
          {busy === 'quiz' ? <p role="status">고른 구간으로 문제를 만들고 있어요…</p> : null}
          {error ? (
            <p role="alert" className="review-error">
              {error}
            </p>
          ) : null}

          {mode === 'source' ? <LectureChunks material={material} /> : null}

          {mode === 'select' ? (
            <ChunkSelector
              material={material}
              selectedIds={selectedChunkIds}
              onChange={setSelectedChunkIds}
              onContinue={makeQuiz}
            />
          ) : null}

          {mode === 'quiz' && quiz ? (
            <QuizPanel
              quiz={quiz}
              chunks={chunks}
              results={results}
              provider={quiz.provider}
              busy={busy === 'answer'}
              onSubmit={submitAnswer}
              onFinish={() => setMode('support')}
            />
          ) : null}

          {mode === 'support' ? (
            <SupportPanel
              quiz={quiz}
              results={results}
              chunks={chunks}
              support={support}
              busy={busy === 'support'}
              onRequest={requestSupport}
              onRetry={retryQuestion}
            />
          ) : null}
        </>
      ) : null}
    </section>
  )
}
