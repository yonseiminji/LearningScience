import { useState } from 'react'
import { data, subjectById } from '../assignmentModel.js'

const CHOICES = ['과제를 어떻게 시작해요?', '수업 내용이 어려워요']

export default function ChatRoom({ subjectId, onSubject, onTalk, onClose }) {
  const subject = subjectById(subjectId) || data.subjects[0]
  const assignment = data.assignments.find((item) => item.subjectId === subject.id)
  const [log, setLog] = useState([])
  const [draft, setDraft] = useState('')

  function reply(text) {
    const answers = {
      '학습과학':
        '먼저 인지부하 이론의 기본 개념을 살펴보세요. 그다음, 공부하면서 어렵거나 복잡하다고 느꼈던 경험을 하나 떠올려 보세요.',
      
      '사회학':
        '먼저 일상에서 나타나는 사회적 현상을 관찰해 보세요. 사람들이 어떻게 상호작용하는지 살펴보고, 인상 깊었던 사례를 기록해 보세요.',
      
      '교육심리학':
        '먼저 학습 동기와 관련된 이론을 살펴보세요. 그다음, 학습 의욕이 높아지거나 낮아졌던 경험을 떠올리고 이론과 연결해 보세요.'
    }

const answer = answers[subject.name] ??
  '어떤 부분이 어려운지 알려주세요. 함께 하나씩 살펴볼게요.'
    setLog((current) => [...current, { role: 'me', text }, { role: 'bear', text: answer }])
    onTalk(subject.id)
  }

  return (
    <dialog className="chat-dialog" open aria-labelledby="chat-title">
      <div className="chat-head">
        <img src="/brand/gomgomi.webp" alt="" />
        <div>
          <h2 id="chat-title">수업별 이야기 방</h2>
        </div>
        <button type="button" className="btn ghost" onClick={onClose}>
          닫기
        </button>
      </div>
      <div className="chat-subjects" role="tablist" aria-label="수업 선택">
        {data.subjects.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === subject.id}
            className="nav-btn"
            onClick={() => onSubject(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="chat-log" aria-live="polite">
        {log.length === 0 ? <p className="hint">어떤 도움이 필요하신가요?</p> : null}
        {log.map((item, index) => (
          <p key={`${item.role}-${index}`} className={item.role === 'me' ? 'chat-me' : 'chat-bear'}>
            {item.text}
          </p>
        ))}
      </div>
      <div className="chat-choices">
        {CHOICES.map((choice) => (
          <button key={choice} type="button" className="btn ghost" onClick={() => reply(choice)}>
            {choice}
          </button>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault()
          const text = draft.trim()
          if (!text) return
          setDraft('')
          reply(text)
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          이야기
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="짧게 적어 보세요"
        />
        <button type="submit" className="btn primary">
          보내기
        </button>
      </form>
    </dialog>
  )
}
