import { useState } from 'react'
import { BookOpenCheck, ExternalLink, Mic } from 'lucide-react'
import ClovaGuideDialog from './ClovaGuideDialog.jsx'
import RecordingNoticeDialog from './RecordingNoticeDialog.jsx'
import TxtUpload from './TxtUpload.jsx'
import { CLOVANOTE_URL, readClovaGuideSeen, writeClovaGuideSeen } from '../lectureNotes.js'

// 강의 이해 지원.
//
// 차곡차곡 records nothing itself. The learner records and transcribes in
// ClovaNote, then brings the TXT file back here. One dialog is open at a time:
// a first-time learner sees the walkthrough, then the pre-recording notice,
// and only the confirm button opens the external site.
export default function LectureUnderstanding({ lectureId, notes, onAddNote, onRemoveNote }) {
  const [dialog, setDialog] = useState(null) // null | 'guide' | 'notice'
  const [afterGuide, setAfterGuide] = useState(false)

  function startRecording() {
    if (readClovaGuideSeen()) {
      setDialog('notice')
      return
    }
    setAfterGuide(true)
    setDialog('guide')
  }

  function finishGuide() {
    writeClovaGuideSeen()
    if (afterGuide) {
      setAfterGuide(false)
      setDialog('notice')
      return
    }
    setDialog(null)
  }

  function closeGuide() {
    setAfterGuide(false)
    setDialog(null)
  }

  function openClovanote() {
    setDialog(null)
    window.open(CLOVANOTE_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <p className="section-lead">
        강의를 녹음하고 글로 바꿔 두면 수업을 다시 따라가기 쉬워져요. 녹음과 변환은 네이버 클로바노트에서 하고, 바꾼
        TXT 파일을 여기에 올려 두세요.
      </p>

      <div className="understand-actions">
        <button type="button" className="btn primary" onClick={startRecording}>
          <Mic aria-hidden="true" size={18} />
          강의 녹음하기
        </button>
        <button type="button" className="btn" onClick={() => setDialog('guide')}>
          <BookOpenCheck aria-hidden="true" size={18} />
          클로바노트 사용법 보기
        </button>
        <a className="external-note" href={CLOVANOTE_URL} target="_blank" rel="noopener noreferrer">
          clovanote.naver.com
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </div>

      <p className="hint understand-hint">
        차곡차곡은 녹음을 직접 하지 않아요. ‘강의 녹음하기’를 누르면 확인 사항을 보여 드린 뒤 클로바노트를 새 탭에서 열어요.
      </p>

      <div className="understand-upload">
        <h3 className="subsection-title">강의 기록 올리기</h3>
        <TxtUpload lectureId={lectureId} notes={notes} onAdd={onAddNote} onRemove={onRemoveNote} />
      </div>

      {dialog === 'guide' ? <ClovaGuideDialog onClose={closeGuide} onDone={finishGuide} /> : null}
      {dialog === 'notice' ? (
        <RecordingNoticeDialog onCancel={() => setDialog(null)} onConfirm={openClovanote} />
      ) : null}
    </>
  )
}
