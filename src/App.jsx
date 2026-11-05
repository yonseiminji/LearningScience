import { useState } from 'react'
import mockTask from './data/mock_task.json'
import { isSampleInstruction, stepsForLevel } from './taskModel.js'
import {
  analyzedStatus,
  initialSimpleDone,
  nextDeadline,
  seoulToday,
  simpleTasksWithStatus,
  study,
  weekProgress,
} from './studyModel.js'
import TaskInput from './components/TaskInput.jsx'
import RequirementView from './components/RequirementView.jsx'
import StepCard from './components/StepCard.jsx'
import SupportLevelDialog from './components/SupportLevelDialog.jsx'
import SideWing from './components/SideWing.jsx'
import TaskBoard from './components/TaskBoard.jsx'
import TodoPage from './components/TodoPage.jsx'
import Timetable from './components/Timetable.jsx'

const MISMATCH_MESSAGE =
  '이 데모는 샘플 과제만 분석할 수 있습니다. 입력한 문장이 샘플과 달라 분석 결과를 보여 드리지 않습니다.'

const NAV = [
  { id: 'home', label: '홈' },
  { id: 'tasks', label: '나의 할 일' },
  { id: 'timetable', label: '시간표' },
]

export default function App() {
  const [view, setView] = useState('home')
  const [openTaskId, setOpenTaskId] = useState(null)
  const [draft, setDraft] = useState(mockTask.original_instruction)
  const [status, setStatus] = useState('editing')
  const [supportLevel, setSupportLevel] = useState(null)
  const [indexByLevel, setIndexByLevel] = useState({
    standard: 0,
    detailed: 0,
    micro: 0,
  })
  const [completedByLevel, setCompletedByLevel] = useState({
    standard: [],
    detailed: [],
    micro: [],
  })
  const [simpleDone, setSimpleDone] = useState(initialSimpleDone)
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)

  const today = seoulToday()
  const simpleTasks = simpleTasksWithStatus(simpleDone, today)
  const steps = supportLevel ? stepsForLevel(mockTask, supportLevel) : []
  const activeIndex = supportLevel
    ? Math.min(indexByLevel[supportLevel] ?? 0, Math.max(steps.length - 1, 0))
    : 0
  const completedIds = supportLevel ? completedByLevel[supportLevel] : []
  const levelData = supportLevel ? mockTask.support_levels[supportLevel] : null
  const analyzed = analyzedStatus(mockTask, supportLevel, completedIds)
  const showPlanner = status === 'ready' && supportLevel && steps.length > 0
  const showDialog = levelDialogOpen && (status === 'choosing' || status === 'ready')

  function analyze() {
    if (!isSampleInstruction(draft, mockTask)) {
      setStatus('mismatch')
      setLevelDialogOpen(false)
      return
    }
    setStatus('choosing')
    setLevelDialogOpen(true)
  }

  function selectLevel(level) {
    setSupportLevel(level)
    setStatus('ready')
    setLevelDialogOpen(false)
  }

  function closeLevelDialog() {
    setLevelDialogOpen(false)
    if (status === 'choosing') setStatus('editing')
  }

  function restoreSample() {
    setDraft(mockTask.original_instruction)
    setStatus('editing')
  }

  function setActiveIndex(nextIndex) {
    setIndexByLevel((current) => ({ ...current, [supportLevel]: nextIndex }))
  }

  function toggleAnalyzed(id) {
    setCompletedByLevel((current) => {
      const list = current[supportLevel]
      const next = list.includes(id) ? list.filter((stepId) => stepId !== id) : [...list, id]
      return { ...current, [supportLevel]: next }
    })
  }

  function toggleSimple(taskId, stepId) {
    setSimpleDone((current) => {
      const list = current[taskId] || []
      const next = list.includes(stepId) ? list.filter((id) => id !== stepId) : [...list, stepId]
      return { ...current, [taskId]: next }
    })
  }

  function toggleOpen(id, forceOpen) {
    setOpenTaskId((current) => {
      if (forceOpen) return id
      return current === id ? null : id
    })
  }

  function openGuide() {
    setView('guide')
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="frame bar">
          <div className="brand">
            <img className="logo" src="/brand/logo.webp" alt="차곡차곡" />
            <img className="mascot" src="/brand/gomgomi.webp" alt="곰곰이" />
          </div>
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nav-btn"
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="canvas">
        <div className="frame layout">
          <div className="main-col">
            {view === 'home' ? (
              <TaskBoard
                analyzedTask={mockTask}
                analyzed={analyzed}
                simpleTasks={simpleTasks}
                openTaskId={openTaskId}
                onToggleOpen={toggleOpen}
                onToggleSimple={toggleSimple}
                onOpenGuide={openGuide}
              />
            ) : null}
            {view === 'tasks' ? (
              <TodoPage
                analyzed={analyzed}
                completedIds={completedIds}
                simpleTasks={simpleTasks}
                onToggleSimple={toggleSimple}
                onToggleAnalyzed={toggleAnalyzed}
                onOpenGuide={openGuide}
              />
            ) : null}
            {view === 'timetable' ? <Timetable /> : null}
            {view === 'guide' ? (
              <Guide
                showPlanner={showPlanner}
                draft={draft}
                status={status}
                steps={steps}
                activeIndex={activeIndex}
                completedIds={completedIds}
                levelData={levelData}
                onDraft={(value) => {
                  setDraft(value)
                  if (status === 'mismatch') setStatus('editing')
                }}
                onAnalyze={analyze}
                onRestore={restoreSample}
                onPrevious={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                onNext={() => setActiveIndex(Math.min(steps.length - 1, activeIndex + 1))}
                onSelect={setActiveIndex}
                onToggleComplete={toggleAnalyzed}
                onChangeLevel={() => setLevelDialogOpen(true)}
                onBack={() => setView('home')}
              />
            ) : null}
          </div>
          <SideWing
            wing={study.wing}
            week={weekProgress(simpleTasks, analyzed)}
            nextTask={nextDeadline(simpleTasks)}
          />
        </div>
      </main>
      {showDialog ? (
        <SupportLevelDialog
          levels={mockTask.support_levels}
          selected={supportLevel}
          onSelect={selectLevel}
          onCancel={closeLevelDialog}
        />
      ) : null}
    </div>
  )
}

function Guide({
  showPlanner,
  draft,
  status,
  steps,
  activeIndex,
  completedIds,
  levelData,
  onDraft,
  onAnalyze,
  onRestore,
  onPrevious,
  onNext,
  onSelect,
  onToggleComplete,
  onChangeLevel,
  onBack,
}) {
  return (
    <div className="guide">
      <button type="button" className="btn ghost" onClick={onBack}>
        할 일 보드로
      </button>
      {showPlanner ? (
        <>
          <div className="goal-band">
            <p className="goal-title">{mockTask.title}</p>
            <p className="summary">{mockTask.summary}</p>
          </div>
          <StepCard
            steps={steps}
            activeIndex={activeIndex}
            completedIds={completedIds}
            supportLabel={levelData.label}
            hasMoreSteps={levelData.has_more_steps === true}
            onPrevious={onPrevious}
            onNext={onNext}
            onSelect={onSelect}
            onToggleComplete={onToggleComplete}
            onChangeLevel={onChangeLevel}
          />
          <RequirementView task={mockTask} />
        </>
      ) : (
        <>
          <div className="title-block">
            <h1>과제 안내</h1>
            <p className="summary">{mockTask.title}</p>
          </div>
          <section className="panel" aria-label="과제 지시문 입력">
            <TaskInput
              value={draft}
              onChange={onDraft}
              onAnalyze={onAnalyze}
              onRestore={onRestore}
              message={status === 'mismatch' ? MISMATCH_MESSAGE : ''}
            />
          </section>
        </>
      )}
    </div>
  )
}
