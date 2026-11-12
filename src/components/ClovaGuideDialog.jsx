import { useState } from 'react'
import { ChevronLeft, ChevronRight, LogIn, UserPlus } from 'lucide-react'
import Modal from './Modal.jsx'

const CASES = {
  join: {
    id: 'join',
    icon: UserPlus,
    choice: '클로바노트를 처음 사용해요',
    title: '클로바노트를 처음 사용해요',
    image: '/guide/Clova_Join.png',
    alt: '클로바노트 첫 화면. 오른쪽 위 ‘개인용 시작하기’ 버튼이 빨간 네모로 표시되어 있어요.',
    target: '개인용 시작하기',
    steps: [
      '클로바노트 사이트에서 오른쪽 위의 ‘개인용 시작하기’ 버튼을 눌러요.',
      '네이버 계정으로 로그인하면 개인용 클로바노트를 바로 쓸 수 있어요.',
      '사용하려면 네이버 계정과 클로바노트 서비스 가입이 필요해요.',
    ],
  },
  login: {
    id: 'login',
    icon: LogIn,
    choice: '이미 클로바노트를 사용하고 있어요',
    title: '이미 클로바노트를 사용하고 있어요',
    image: '/guide/Clova_Login.png',
    alt: '클로바노트 첫 화면. 오른쪽 끝 ‘로그인’ 버튼이 빨간 네모로 표시되어 있어요.',
    target: '로그인',
    steps: [
      '클로바노트 사이트에서 오른쪽 끝의 ‘로그인’ 버튼을 눌러요.',
      '쓰고 있던 네이버 계정으로 로그인하면 기존 노트를 그대로 볼 수 있어요.',
      '녹음을 마치면 텍스트로 변환한 뒤 TXT 파일로 내려받아요.',
    ],
  },
}

// Walkthrough for the external transcription service. 차곡차곡 does not sign in
// to that service or track whether the learner has an account there: this is a
// picture of its front page and where to click.
export default function ClovaGuideDialog({ onClose, onDone }) {
  const [caseId, setCaseId] = useState(null)
  const current = caseId ? CASES[caseId] : null

  return (
    <Modal titleId="clova-guide-title" className="clova-dialog" onClose={onClose}>
      <h2 id="clova-guide-title" className="dialog-title">
        클로바노트 사용법
      </h2>

      {!current ? (
        <>
          <p className="dialog-lead">
            강의 녹음과 텍스트 변환은 네이버 클로바노트에서 해요. 어느 쪽에 가까운지 골라 주세요.
          </p>
          <div className="help-types">
            {Object.values(CASES).map((item) => {
              const Icon = item.icon
              return (
                <button key={item.id} type="button" className="help-type" onClick={() => setCaseId(item.id)}>
                  <Icon aria-hidden="true" size={18} />
                  <span>{item.choice}</span>
                  <ChevronRight aria-hidden="true" size={18} className="help-type-arrow" />
                </button>
              )
            })}
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onDone}>
              안내 완료
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="dialog-lead">{current.title}</p>
          <figure className="clova-figure">
            <img src={current.image} alt={current.alt} />
            <figcaption>
              빨간 네모로 표시된 <strong>{current.target}</strong> 버튼을 눌러 주세요.
            </figcaption>
          </figure>
          <ol className="clova-steps">
            {current.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={() => setCaseId(null)}>
              <ChevronLeft aria-hidden="true" size={16} />
              뒤로
            </button>
            <button type="button" className="btn primary" onClick={onDone}>
              안내 완료
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
