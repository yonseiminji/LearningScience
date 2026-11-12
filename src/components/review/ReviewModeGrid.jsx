import { FileText, BookOpenText, ListChecks, RefreshCw } from 'lucide-react';

const MODES = [
  { id: 'summary', title: '강의 내용 확인하기', description: '원문과 핵심 요약', Icon: FileText },
  { id: 'concepts', title: '핵심 내용 파악하기', description: '어려운 용어 쉽게 이해하기', Icon: BookOpenText },
  { id: 'quiz', title: '이해 여부 점검하기', description: 'OX와 빈칸 문제 풀기', Icon: ListChecks },
  { id: 'review', title: '부족한 부분 다시 학습하기', description: '오답과 강의 원문 복습', Icon: RefreshCw },
];
export default function ReviewModeGrid({ activeMode, onSelect }) {
  return (
    <div className="review-mode-grid" role="group" aria-label="학습 기능 선택">
      {MODES.map(({ id, title, description, Icon }) => (
        <button key={id} type="button" className={`review-mode-card ${activeMode === id ? 'active' : ''}`}
          aria-pressed={activeMode === id} onClick={() => onSelect(id)}>
          <Icon size={23} aria-hidden="true"/><strong>{title}</strong><span>{description}</span>
        </button>
      ))}
    </div>
  );
}
