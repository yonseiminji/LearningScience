import { ExternalLink, ShieldCheck } from 'lucide-react'
import Modal from './Modal.jsx'
import { CLOVANOTE_URL } from '../lectureNotes.js'

// Shown before the learner leaves for the external recording service.
// Only the confirm button opens the site: Escape and the backdrop just close.
export default function RecordingNoticeDialog({ onCancel, onConfirm }) {
  return (
    <Modal titleId="recording-notice-title" className="notice-dialog" onClose={onCancel}>
      <h2 id="recording-notice-title" className="dialog-title">
        <ShieldCheck aria-hidden="true" size={20} />
        녹음 전 확인했나요?
      </h2>
      <div className="notice-body">
        <p>강의 녹음 전 학칙 및 교수자의 녹음 허용 여부를 확인해 주세요.</p>
        <p>
          타인의 개인정보나 사적인 대화가 녹음되지 않도록 주의하고, 녹음 파일은 본인 학습 목적으로만 사용하며 허락 없이
          공유하지 마세요.
        </p>
        <p className="notice-law">
          강의 내용과 비공개 대화는 「저작권법」 및 「통신비밀보호법」 등에 따라 보호될 수 있습니다.
        </p>
      </div>
      <p className="notice-target">
        확인하면 아래 주소를 새 탭에서 열어요.
        <a href={CLOVANOTE_URL} target="_blank" rel="noopener noreferrer">
          {CLOVANOTE_URL}
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn" onClick={onCancel}>
          취소
        </button>
        <button type="button" className="btn primary" onClick={onConfirm}>
          <ExternalLink aria-hidden="true" size={16} />
          확인했습니다
        </button>
      </div>
    </Modal>
  )
}
