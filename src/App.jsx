import { useMemo, useState } from 'react'
import { CalendarDays, House, Plus, SquarePen } from 'lucide-react'
import { data, assignmentForSubject, firstOpenStep, overallCounts, nextOpenAssignment } from './assignmentModel.js'
import SubjectBoard from './components/SubjectBoard.jsx'
import TodoPage from './components/TodoPage.jsx'
import Timetable from './components/Timetable.jsx'
import GuideView from './components/GuideView.jsx'
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
  const [talkCounts, setTalkCounts] = useState({})
  const [recentIds, setRecentIds] = useState([])
  const [stepCompletion, setStepCompletion] = useState(() => ({ ...data.initialProgress.stepCompletion }))
  const [criterionCompletion, setCriterionCompletion] = useState(() => ({
    ...data.initialProgress.criterionCompletion,
  }))
  const [criterionResponses, setCriterionResponses] = useState(() => ({
    ...data.initialProgress.criterionResponses,
  }))

  const counts = overallCounts(stepCompletion)
  const nextAssignment = nextOpenAssignment(stepCompletion)
  const guideAssignment = assignmentForSubject(guideSubjectId)
  const guideSubject = data.subjects.find((subject) => subject.id === guideSubjectId)
  const currentStepId = activeStepId || firstOpenStep(guideAssignment, stepCompletion)?.id

  const talkedId = useMemo(() => {
    let best = ''
    let score = 0
    for (const [id, count] of Object.entries(talkCounts)) {
      if (count > score) {
        score = count
        best = id
      }
    }
    return best
  }, [talkCounts])

  const recentTitles = recentIds
    .map((id) => data.assignments.flatMap((assignment) => assignment.steps).find((step) => step.id === id)?.title)
    .filter(Boolean)

  function markStep(assignment, stepId, complete) {
    const step = assignment.steps.find((item) => item.id === stepId)
    if (!step) return
    setStepCompletion((current) => ({ ...current, [stepId]: complete }))
    setRecentIds((current) => {
      const without = current.filter((id) => id !== stepId)
      return complete ? [stepId, ...without].slice(0, 5) : without
    })
    setCriterionCompletion((current) => {
      const next = { ...current }
      for (const criterion of step.completionCriteria) next[criterion.id] = complete
      return next
    })
    if (complete) {
      const index = assignment.steps.findIndex((item) => item.id === stepId)
      const following = assignment.steps.slice(index + 1).find((item) => item.id !== stepId && !stepCompletion[item.id])
      if (following && view === 'guide' && assignment.subjectId === guideSubjectId) {
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

  function openSubjectTasks(subjectId) {
    setFocusSubjectId(subjectId)
    setView('tasks')
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

  return (
    <div className="shell">
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
          <img className="logo" src="/brand/logo.webp" alt="차곡차곡" />
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
                  <h1>차곡차곡: 느린학습자를 위한 학습 플래너</h1>
                  <p className="hero-tip">큰 과제도 작은 단계로 나누면 시작하기 쉬워져요. ((여기에 넣을 슬로건 추천 받아요오...))</p>
                  <p className="hint">{data.notes[0]}</p>
                </section>
                <SubjectBoard stepCompletion={stepCompletion} onToggleStep={toggleStep} onOpen={openGuide} />
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
              <GuideView
                assignment={guideAssignment}
                subject={guideSubject}
                stepCompletion={stepCompletion}
                criterionCompletion={criterionCompletion}
                criterionResponses={criterionResponses}
                activeStepId={currentStepId}
                onSelectStep={setActiveStepId}
                onChangeResponse={(id, value) =>
                  setCriterionResponses((current) => ({ ...current, [id]: value }))
                }
                onSubmitCriterion={submitCriterion}
                onCompleteStep={(assignment, stepId) => markStep(assignment, stepId, true)}
                onBack={() => setView('home')}
              />
            ) : null}
          </div>
          <SideWing
            counts={counts}
            nextAssignment={nextAssignment}
            talkedName={talkedId}
            recentTitles={recentTitles}
            onOpenChat={() => {
              const id = view === 'guide' ? guideSubjectId : focusSubjectId
              if (id) setChatSubjectId(id)
              setChatOpen(true)
            }}
          />
        </div>
      </main>

      {registerOpen ? (
        <dialog className="level-dialog" open aria-labelledby="register-title">
          <h2 id="register-title">시간표 등록</h2>
          <p>
            이 화면은 데모입니다. 데모로 등록된 데이터는 다음과 같습니다 :).
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
          onTalk={(subjectId) =>
            setTalkCounts((current) => ({ ...current, [subjectId]: (current[subjectId] || 0) + 1 }))
          }
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </div>
  )
}
