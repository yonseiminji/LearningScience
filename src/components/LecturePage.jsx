import { useMemo } from 'react'
import { ChevronLeft, ClipboardList, Headphones, RotateCcw } from 'lucide-react'
import GuideView from './GuideView.jsx'
import LectureUnderstanding from './LectureUnderstanding.jsx'
import ReviewStudyPage from './review/ReviewStudyPage.jsx'
import { materialsFor } from '../lectureNotes.js'

// One lecture, three kinds of work, stacked in the order a week runs:
// understand the class, do the assignment, then review on your own.
// The page scrolls freely: the sections are told apart by their cards and
// headings, not by pulling the viewport to a boundary.
export default function LecturePage({
  subject,
  assignment,
  notes,
  onAddNote,
  onRemoveNote,
  onBack,
  guideProps,
}) {
  // the TXT files 강의 이해 지원 already holds, in the shape 복습 및 개인 공부
  // reads. One upload, two sections — no second uploader.
  const materials = useMemo(() => materialsFor(notes), [notes])

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
        <p className="section-lead">
          ‘강의 이해 지원’에 올린 강의 기록으로 공부해요. 문제와 설명은 고른 구간의 <b>강의 원문만</b> 근거로 만들고,
          근거가 모자라면 만들지 않아요.
        </p>
        <ReviewStudyPage courseId={subject?.id} materials={materials} showHeading={false} />
      </section>
    </div>
  )
}
