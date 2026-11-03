import { useState } from 'react'
import mockTask from './data/mock_task.json'
import { isSampleInstruction, stepsForLevel } from './taskModel.js'
import TaskInput from './components/TaskInput.jsx'
import RequirementView from './components/RequirementView.jsx'
import StepCard from './components/StepCard.jsx'
import SupportLevelDialog from './components/SupportLevelDialog.jsx'

const MISMATCH_MESSAGE =
  '이 데모는 샘플 과제만 분석할 수 있습니다. 입력한 문장이 샘플과 달라 분석 결과를 보여 드리지 않습니다.'

export default function App() {
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
  const [levelDialogOpen, setLevelDialogOpen] = useState(false)

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

  function toggleComplete(id) {
    setCompletedByLevel((current) => {
      const list = current[supportLevel]
      const next = list.includes(id) ? list.filter((stepId) => stepId !== id) : [...list, id]
      return { ...current, [supportLevel]: next }
    })
  }

  const steps = supportLevel ? stepsForLevel(mockTask, supportLevel) : []
  const activeIndex = supportLevel
    ? Math.min(indexByLevel[supportLevel] ?? 0, Math.max(steps.length - 1, 0))
    : 0
  const completedIds = supportLevel ? completedByLevel[supportLevel] : []
  const levelData = supportLevel ? mockTask.support_levels[supportLevel] : null
  const showPlanner = status === 'ready' && supportLevel && steps.length > 0
  const showDialog = levelDialogOpen && (status === 'choosing' || status === 'ready')

  return (
    <div className="shell">
      <header className="topbar">
        <div className="frame bar">
          <div className="brand">
            <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 4.5v15M6 4.5h8.5M6 19.5h8.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span>학습 길잡이</span>
          </div>
          <p className="scope">샘플 과제</p>
        </div>
      </header>

      <main id="main" className="canvas">
        <div className="frame">
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
                onPrevious={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                onNext={() => setActiveIndex(Math.min(steps.length - 1, activeIndex + 1))}
                onSelect={setActiveIndex}
                onToggleComplete={toggleComplete}
                onChangeLevel={() => setLevelDialogOpen(true)}
              />
              <RequirementView task={mockTask} />
            </>
          ) : (
            <>
              <div className="title-block">
                <h1>과제 분석</h1>
                <p className="summary">샘플로 넣은 대학 과제입니다.</p>
              </div>
              <section className="panel" aria-label="과제 지시문 입력">
                <TaskInput
                  value={draft}
                  onChange={(value) => {
                    setDraft(value)
                    if (status === 'mismatch') setStatus('editing')
                  }}
                  onAnalyze={analyze}
                  onRestore={restoreSample}
                  message={status === 'mismatch' ? MISMATCH_MESSAGE : ''}
                />
              </section>
            </>
          )}
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
