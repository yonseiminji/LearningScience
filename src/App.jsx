import { useState } from 'react'
import { CalendarDays, House, Plus, SquarePen } from 'lucide-react'
import { data, assignmentForSubject, firstOpenStep, overallCounts } from './assignmentModel.js'
import SubjectBoard from './components/SubjectBoard.jsx'
import TodoPage from './components/TodoPage.jsx'
import Timetable from './components/Timetable.jsx'
import GuideView from './components/GuideView.jsx'
import LecturePage from './components/LecturePage.jsx'
import SideWing from './components/SideWing.jsx'
import ChatRoom from './components/ChatRoom.jsx'

const NAV = [
  { id: 'home', label: '홈', icon: House },
  { id: 'tasks', label: '나의 할 일', icon: SquarePen },
  { id: 'timetable', label: '시간표', icon: CalendarDays },
]

export default function App() {
  const [view, setView] = useState('home')
  const [focusSubjectId, setFocusSubjectId] = useState(null)
  const [guideSubjectId, setGuideSubjectId] = useState(data.subjects[0].id)
  const [activeStepId, setActiveStepId] = useState(null)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatSubjectId, setChatSubjectId] = useState(data.subjects[0].id)
  const [stepCompletion, setStepCompletion] = useState(() => ({ ...data.initialProgress.stepCompletion }))
  const [criterionCompletion, setCriterionCompletion] = useState(() => ({
    ...data.initialProgress.criterionCompletion,
  }))
  const [criterionResponses, setCriterionResponses] = useState(() => ({
    ...data.initialProgress.criterionResponses,
  }))
  // Lecture transcripts, kept per subject so one lecture's notes never show
  // under another. Browser-only: nothing is uploaded or stored on a server.
  const [lectureNotes, setLectureNotes] = useState({})

  const counts = overallCounts(stepCompletion)
  const guideAssignment = assignmentForSubject(guideSubjectId)
  const guideSubject = data.subjects.find((subject) => subject.id === guideSubjectId)
  const currentStepId = activeStepId || firstOpenStep(guideAssignment, stepCompletion)?.id

  function markStep(assignment, stepId, complete) {
    const step = assignment.steps.find((item) => item.id === stepId)
    if (!step) return
    setStepCompletion((current) => ({ ...current, [stepId]: complete }))
    setCriterionCompletion((current) => {
      const next = { ...current }
      for (const criterion of step.completionCriteria) next[criterion.id] = complete
      return next
    })
    if (complete) {
      const index = assignment.steps.findIndex((item) => item.id === stepId)
      const following = assignment.steps.slice(index + 1).find((item) => item.id !== stepId && !stepCompletion[item.id])
      if (following && (view === 'guide' || view === 'lecture') && assignment.subjectId === guideSubjectId) {
        setActiveStepId(following.id)
      }
    }
  }

  function toggleStep(assignment, stepId) {
    markStep(assignment, stepId, !stepCompletion[stepId])
  }

  function openGuide(subjectId) {
    const assignment = assignmentForSubject(subjectId)
    setGuideSubjectId(subjectId)
    setActiveStepId(firstOpenStep(assignment, stepCompletion)?.id || null)
    setView('guide')
  }

  function openLecture(subjectId) {
    const assignment = assignmentForSubject(subjectId)
    setGuideSubjectId(subjectId)
    setActiveStepId(firstOpenStep(assignment, stepCompletion)?.id || null)
    setView('lecture')
    window.scrollTo({ top: 0 })
  }

  function addLectureNote(subjectId, note) {
    setLectureNotes((current) => ({ ...current, [subjectId]: [...(current[subjectId] || []), note] }))
  }

  function removeLectureNote(subjectId, fileId) {
    setLectureNotes((current) => ({
      ...current,
      [subjectId]: (current[subjectId] || []).filter((note) => note.fileId !== fileId),
    }))
  }

  function openSubjectTasks(subjectId) {
    setFocusSubjectId(subjectId)
    setView('tasks')
  }

  function openTasks() {
    setFocusSubjectId(null)
    setView('tasks')
  }

  function openChat(subjectId) {
    if (subjectId) setChatSubjectId(subjectId)
    setChatOpen(true)
  }

  function submitCriterion(step, criterionId, raw) {
    const text = raw.trim()
    if (!text) return
    const nextCriteria = { ...criterionCompletion, [criterionId]: true }
    setCriterionResponses((current) => ({ ...current, [criterionId]: text }))
    setCriterionCompletion(nextCriteria)
    if (step.completionCriteria.every((criterion) => nextCriteria[criterion.id])) {
      markStep(guideAssignment, step.id, true)
    }
  }

  // Everything GuideView needs, shared by the standalone view and the
  // 과제 수행 section of the lecture page.
  const guideProps = {
    stepCompletion,
    criterionCompletion,
    criterionResponses,
    activeStepId: currentStepId,
    onSelectStep: setActiveStepId,
    onChangeResponse: (id, value) => setCriterionResponses((current) => ({ ...current, [id]: value })),
    onSubmitCriterion: submitCriterion,
    onCompleteStep: (assignment, stepId) => markStep(assignment, stepId, true),
    onBack: () => setView('home'),
    onAskHelp: () => openChat(guideSubjectId),
  }

  const isFocusView = view === 'guide' || view === 'lecture'

  return (
    <div className={isFocusView ? 'shell is-guide' : 'shell'}>
      <header className="topbar">
        <div className="frame bar">
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className="nav-btn"
                  aria-current={view === item.id ? 'page' : undefined}
                  onClick={() => {
                    setFocusSubjectId(null)
                    setView(item.id)
                  }}
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <button type="button" className="btn primary register" onClick={() => setRegisterOpen(true)}>
            <Plus aria-hidden="true" size={18} />
            시간표 등록
          </button>
        </div>
      </header>

      <main id="main" className="canvas">
        <div className="frame layout">
          <div className="main-col">
            {view === 'home' ? (
              <>
                <section className="hero">
                  <h1 className="sr-only">차곡차곡: 느린학습자를 위한 학습 플래너</h1>
                  <img className="hero-banner" src="/brand/hero-banner.webp" alt="곰곰이와 함께 한 단계씩 공부를 정리해요" />
                  <p className="hint">{data.notes[0]}</p>
                </section>
                <SubjectBoard stepCompletion={stepCompletion} onOpen={openLecture} />
              </>
            ) : null}
            {view === 'tasks' ? (
              <TodoPage
                stepCompletion={stepCompletion}
                focusSubjectId={focusSubjectId}
                onToggleStep={toggleStep}
                onOpen={openGuide}
              />
            ) : null}
            {view === 'timetable' ? <Timetable onOpenSubject={openSubjectTasks} /> : null}
            {view === 'guide' && guideAssignment ? (
              <GuideView {...guideProps} assignment={guideAssignment} subject={guideSubject} />
            ) : null}
            {view === 'lecture' ? (
              <LecturePage
                subject={guideSubject}
                assignment={guideAssignment}
                notes={lectureNotes[guideSubjectId] || []}
                onAddNote={(note) => addLectureNote(guideSubjectId, note)}
                onRemoveNote={(fileId) => removeLectureNote(guideSubjectId, fileId)}
                onBack={() => setView('home')}
                guideProps={guideProps}
              />
            ) : null}
          </div>
          <SideWing
            counts={counts}
            stepCompletion={stepCompletion}
            onOpenTasks={openTasks}
            onOpenChat={() => openChat(isFocusView ? guideSubjectId : focusSubjectId)}
          />
        </div>
      </main>

      {registerOpen || chatOpen ? <div className="scrim" aria-hidden="true" /> : null}
      {registerOpen ? (
        <dialog className="level-dialog" open aria-labelledby="register-title">
          <h2 id="register-title">시간표 등록</h2>
          <p>
            이 화면은 데모예요. 데모로 등록된 수업은 다음과 같아요.
          </p>
          <ul className="check-list">
            {data.demoSchedule.map((item) => (
              <li key={item.id}>
                {data.subjects.find((subject) => subject.id === item.subjectId)?.name} · {item.start}–{item.end} · {item.room}
              </li>
            ))}
          </ul>
          <button type="button" className="btn primary" onClick={() => setRegisterOpen(false)}>
            닫기
          </button>
        </dialog>
      ) : null}

      {chatOpen ? (
        <ChatRoom
          subjectId={chatSubjectId}
          onSubject={setChatSubjectId}
          stepCompletion={stepCompletion}
          criterionCompletion={criterionCompletion}
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </div>
  )
}
