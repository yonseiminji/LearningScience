import { useState } from 'react'
import mockTask from './data/mock_task.json'
import { isSampleInstruction } from './taskModel.js'
import TaskInput from './components/TaskInput.jsx'
import RequirementView from './components/RequirementView.jsx'
import StepCard from './components/StepCard.jsx'

const MISMATCH_MESSAGE =
  '이 데모는 샘플 과제만 분석할 수 있습니다. 입력한 문장이 샘플과 달라 분석 결과를 보여 드리지 않습니다.'

export default function App() {
  const [draft, setDraft] = useState(mockTask.original_instruction)
  const [status, setStatus] = useState('editing')
  const [activeIndex, setActiveIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState([])

  function analyze() {
    if (!isSampleInstruction(draft, mockTask)) {
      setStatus('mismatch')
      return
    }
    setStatus('ready')
    setActiveIndex(0)
    setCompletedIds([])
  }

  function restoreSample() {
    setDraft(mockTask.original_instruction)
    setStatus('editing')
  }

  function toggleComplete(id) {
    setCompletedIds((current) =>
      current.includes(id) ? current.filter((stepId) => stepId !== id) : [...current, id],
    )
  }

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
          {status === 'ready' ? (
            <>
              <StepCard
                steps={mockTask.steps}
                summary={mockTask.summary}
                activeIndex={activeIndex}
                completedIds={completedIds}
                onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
                onNext={() =>
                  setActiveIndex((index) => Math.min(mockTask.steps.length - 1, index + 1))
                }
                onToggleComplete={toggleComplete}
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
    </div>
  )
}
