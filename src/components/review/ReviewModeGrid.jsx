import { FileText, ListChecks, Network, RefreshCw } from 'lucide-react'

// Four ways in, in the order a sitting runs: read it, get the concepts
// straight, practise pulling it back out, then return to whatever did not
// stick. The mode id stays 'quiz' because it is woven through the page's
// state; only what the learner reads has changed. Choosing
// which stretch of the lecture to work on used to be a fifth card; it is now
// the first screen of 인출 연습하기, because picking a stretch was never
// a thing anyone came here to do — it was the setup for making questions.
const MODES = [
  { id: 'source', title: '강의 내용 확인하기', description: '강의 원문 확인하기', Icon: FileText },
  { id: 'concept', title: '개념 이해하기', description: '개념 뜻·사례·관계도 보기', Icon: Network },
  { id: 'quiz', title: '인출 연습하기', description: '구간을 고르고 기억에서 꺼내 보기', Icon: ListChecks },
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
