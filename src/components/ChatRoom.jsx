import { useState } from 'react'
import { data, subjectById } from '../assignmentModel.js'

const CHOICES = ['과제를 어떻게 시작해요?', '수업 내용이 어려워요']

export default function ChatRoom({ subjectId, onSubject, onTalk, onClose }) {
  const subject = subjectById(subjectId) || data.subjects[0]
  const assignment = data.assignments.find((item) => item.subjectId === subject.id)
  const [log, setLog] = useState([])
  const [draft, setDraft] = useState('')

  function reply(text) {
    const answer = `${subject.name} 이야기방은 미리 준비된 예시예요. 실시간 답변이 아닙니다. ${assignment ? `「${assignment.title}」 과제는 할 일 단계에서 직접 적어요.` : ''}`
    setLog((current) => [...current, { role: 'me', text }, { role: 'bear', text: answer }])
    onTalk(subject.id)
  }

  return (
    <dialog className="chat-dialog" open aria-labelledby="chat-title">
      <div className="chat-head">
        <img src="/brand/gomgomi.webp" alt="" />
        <div>
          <h2 id="chat-title">수업별 이야기 방</h2>
          <p>곰곰이의 말은 미리 준비된 예시입니다.</p>
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
        {log.length === 0 ? <p className="hint">버튼을 고르거나 짧게 적어 보세요.</p> : null}
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
