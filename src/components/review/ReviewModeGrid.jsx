import { FileText, ListChecks, ListTree, RefreshCw } from 'lucide-react'

// The four ways in, in the order a sitting runs: read it, choose a stretch of
// it, test yourself on that stretch, then go back to whatever did not stick.
const MODES = [
  { id: 'source', title: '강의 내용 확인하기', description: '강의 원문 확인하기', Icon: FileText },
  { id: 'select', title: '강의 구간 선택하기', description: '공부할 내용 선택하기', Icon: ListTree },
  { id: 'quiz', title: '이해 여부 점검하기', description: 'AI가 만든 OX·빈칸 문제 풀기', Icon: ListChecks },
  { id: 'support', title: '부족한 부분 다시 학습하기', description: '어려운 부분을 선택하고 원문 다시 보기', Icon: RefreshCw },
]

export default function ReviewModeGrid({ activeMode, onSelect, disabledModes = [] }) {
  return (
    <div className="review-mode-grid" role="group" aria-label="학습 기능 선택">
      {MODES.map(({ id, title, description, Icon }) => (
        <button
          key={id}
          type="button"
          className={`review-mode-card ${activeMode === id ? 'active' : ''}`}
          aria-pressed={activeMode === id}
          disabled={disabledModes.includes(id)}
          onClick={() => onSelect(id)}
        >
          <Icon size={23} aria-hidden="true" />
          <strong>{title}</strong>
          <span>{description}</span>
        </button>
      ))}
    </div>
  )
}
