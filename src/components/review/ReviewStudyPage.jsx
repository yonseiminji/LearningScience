import { useEffect, useMemo, useRef, useState } from 'react'
import MaterialSelector from './MaterialSelector.jsx'
import ReviewModeGrid from './ReviewModeGrid.jsx'
import LectureChunks from './LectureChunks.jsx'
import ChunkSelector from './ChunkSelector.jsx'
import QuizPanel from './QuizPanel.jsx'
import SupportPanel from './SupportPanel.jsx'
import ConceptPanel from './ConceptPanel.jsx'
import RecallPanel from './RecallPanel.jsx'
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
  // { ahead, message } while a request is queued behind others, null otherwise.
  const [waiting, setWaiting] = useState(null)
  const [error, setError] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [recall, setRecall] = useState(null)
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
    setRecall(null)
    setExplanation(null)
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
    setWaiting(null)
    setError(null)
    try {
      // A queued request can sit for up to 45 seconds. Without this the
      // learner watches an unchanging '만들고 있어요' and has no way to tell
      // a queue from a hang.
      const value = await work({
        onWait: (info) => { if (id === requestId.current) setWaiting(info) },
      })
      if (id === requestId.current) return value
      return null
    } catch (failure) {
      // the learner's answers stay; only the message changes
      if (id === requestId.current) setError(failure.message || '요청을 처리하지 못했어요.')
      return null
    } finally {
      if (id === requestId.current) {
        setBusy(null)
        setWaiting(null)
      }
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
      // The picker is already on screen — this card opens on it — so say what
      // is missing and leave them where they are.
      setError('문제로 풀어 볼 구간을 하나 이상 골라 주세요.')
      return
    }
    const data = await run('quiz', ({ onWait }) =>
      tutorService.createQuiz({ material, chunkIds: selectedChunkIds, onWait }),
    )
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

  async function explainConcept({ conceptId, supportType, chunkIds }) {
    setExplanation(null)
    const picked = chunksByIds(chunks, chunkIds)
    const data = await run('explain', ({ onWait }) =>
      tutorService.explainConcept({ material, conceptId, supportType, chunks: picked, onWait }),
    )
    if (data) {
      setExplanation(data)
      onStudied?.(ACTIVITY.support, { topicTag: data.conceptId })
    }
  }

  async function checkRecall(attempt, conceptId, rubricId) {
    const data = await run('recall', ({ onWait }) =>
      tutorService.checkRecall({ material, attempt, conceptId, rubricId, onWait }),
    )
    if (!data) return
    // Whichever level ran, what 부족한 부분 다시 학습하기 needs is the same
    // list: concepts to shore up, each with the words to ask about. For a
    // whole-lecture recall the model names them; for one concept it is that
    // concept, if anything of it did not come back.
    const needsSupport =
      data.scope === 'concept'
        ? (data.partial.length || data.missing.length)
          ? [{
              conceptId: data.conceptId,
              termKo: data.title,
              why: '아직 떠오르지 않은 내용이 있어요.',
              questionText: [...data.partial, ...data.missing].map((item) => item.statement).join(' '),
              userAnswer: attempt,
              chunkIds: [],
            }]
          : []
        : (data.reinforce || []).map((item) => ({
            ...item,
            questionText: item.why,
            userAnswer: attempt,
            chunkIds: [],
          }))
    // The learner's own words stay on screen beside the reading of them;
    // nothing is stored beyond this session.
    setRecall({ ...data, kind: data.scope === 'concept' ? 'concept' : 'all', attempt, needsSupport })
    onStudied?.(ACTIVITY.quiz, { topicTag: conceptId || data.covered?.[0]?.conceptId })
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

  // 인출 연습하기 is always open now: it starts on its own picker, so
  // there is no earlier card to visit first.
  const disabledModes = []
  if (!quiz && !recall) disabledModes.push('support')

  // No sentence explains the lock. The card is dimmed and does not respond,
  // which says it on sight and needs no reading.

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
              setMode(next)
            }}
          />

          {busy === 'quiz' ? (
            <p role="status">
              {waiting
                ? waiting.ahead > 0
                  ? `앞에 ${waiting.ahead}명이 기다리고 있어요. 순서가 되면 바로 만들어 드릴게요.`
                  : '지금 함께 쓰는 사람이 많아요. 조금만 기다려 주세요.'
                : '고른 구간으로 문제를 만들고 있어요…'}
            </p>
          ) : null}
          {/* 개념 이해하기 shows its own, right under the buttons that caused
              it. Showing both put the same sentence twice on one screen. */}
          {error && mode !== 'concept' ? (
            <p role="alert" className="review-error">
              {error}
            </p>
          ) : null}

          {mode === 'source' ? <LectureChunks material={material} /> : null}

          {/* Free recall over the whole lecture: a blank page, not a list of
              questions. Generated questions will sit beside this later; the
              quiz machinery below is kept for them. */}
          {mode === 'quiz' ? (
            <RecallPanel
              chunks={chunks}
              busy={busy === 'recall'}
              waiting={waiting}
              error={error}
              result={recall}
              onSubmit={checkRecall}
              onGraded={(graded) => {
                setRecall(graded)
                onStudied?.(ACTIVITY.quiz, { topicTag: graded.needsSupport[0]?.conceptId })
              }}
              onAgain={() => setRecall(null)}
            />
          ) : null}

          {mode === 'concept' ? (
            <ConceptPanel
              material={material}
              chunks={selectedChunkIds.length ? chunksByIds(chunks, selectedChunkIds) : chunks}
              busy={busy === 'explain' ? 'explain' : null}
              error={error}
              explanation={explanation}
              waiting={waiting}
              onExplain={explainConcept}
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
              recall={recall}
            />
          ) : null}
        </>
      ) : null}
    </section>
  )
}
