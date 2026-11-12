import { ChevronLeft, ClipboardList, Headphones, RotateCcw } from 'lucide-react'
import GuideView from './GuideView.jsx'
import LectureUnderstanding from './LectureUnderstanding.jsx'

// One lecture, three kinds of work, stacked in the order a week runs:
// understand the class, do the assignment, then review on your own.
// The sections snap to the top of the screen, and a section longer than the
// screen still scrolls freely.
export default function LecturePage({
  subject,
  assignment,
  notes,
  onAddNote,
  onRemoveNote,
  onBack,
  guideProps,
}) {
  return (
    <div className="lecture-page">
      <button type="button" className="guide-back" onClick={onBack}>
        <ChevronLeft aria-hidden="true" size={16} />
        홈으로
      </button>

      <header className="lecture-head">
        <p className="guide-subject">
          <span className={`subject-dot dot-${subject?.colorToken}`} aria-hidden="true" />
          {subject?.name}
        </p>
        <h1>{subject?.name} 강의탭</h1>
        <p className="lecture-lead">이 강의에서 할 일을 세 가지로 나누어 두었어요.</p>
      </header>

      <section className="lecture-section" id="lecture-understand" aria-labelledby="lecture-understand-title">
        <h2 className="lecture-section-title" id="lecture-understand-title">
          <Headphones aria-hidden="true" size={22} />
          강의 이해 지원
        </h2>
        <LectureUnderstanding
          lectureId={subject?.id}
          notes={notes}
          onAddNote={onAddNote}
          onRemoveNote={onRemoveNote}
        />
      </section>

      <section className="lecture-section" id="lecture-assignment" aria-labelledby="lecture-assignment-title">
        <h2 className="lecture-section-title" id="lecture-assignment-title">
          <ClipboardList aria-hidden="true" size={22} />
          과제 수행
        </h2>
        {assignment ? (
          <GuideView {...guideProps} assignment={assignment} subject={subject} embedded />
        ) : (
          <p className="hint">이 강의에는 등록된 과제가 없어요.</p>
        )}
      </section>

      <section className="lecture-section" id="lecture-review" aria-labelledby="lecture-review-title">
        <h2 className="lecture-section-title" id="lecture-review-title">
          <RotateCcw aria-hidden="true" size={22} />
          복습 및 개인 공부
        </h2>
        <div className="placeholder-card">
          <p className="placeholder-tag">준비 중</p>
          <p>
            올려 둔 강의 기록으로 복습 문제를 만들고 개인 공부를 기록하는 기능을 준비하고 있어요. 아직 동작하지 않아요.
          </p>
          <p className="hint">지금은 ‘강의 이해 지원’에 강의 기록을 모아 두는 것까지 할 수 있어요.</p>
        </div>
      </section>
    </div>
  )
}
