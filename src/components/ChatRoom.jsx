import { useEffect, useRef, useState } from 'react'
import { ArrowUp, CircleCheck, FileText, ListChecks, X } from 'lucide-react'
import { data, subjectById } from '../assignmentModel.js'
import CommunicationWizard from './CommunicationWizard.jsx'
import { COPY } from '../communication.js'

// 곰곰이 answers two different needs, so the panel carries two tabs.
// 과제 도움받기 is the class chat; 소통 준비하기 helps put a question into
// words to send someone. Neither replaces the other.
const TABS = [
  { id: 'help', label: '과제 도움받기' },
  { id: 'commu', label: '소통 준비하기' },
]

const BEAR = '/brand/gomgomi-question.webp'

// help types the learner can pick instead of writing a question from scratch
const HELP_TYPES = [
  { id: 'start', label: '어디서 시작해야 할지 모르겠어요' },
  { id: 'words', label: '어려운 말이 있어요' },
  { id: 'check', label: '제대로 했는지 확인하고 싶어요' },
]

const FREE_ANSWERS = {
  '학습과학':
    '먼저 인지부하 이론의 기본 개념을 살펴보세요. 그다음, 공부하면서 어렵거나 복잡하다고 느꼈던 경험을 하나 떠올려 보세요.',
  '사회학':
    '먼저 일상에서 나타나는 사회적 현상을 관찰해 보세요. 사람들이 어떻게 상호작용하는지 살펴보고, 인상 깊었던 사례를 기록해 보세요.',
  '교육심리학':
    '먼저 학습 동기와 관련된 이론을 살펴보세요. 그다음, 학습 의욕이 높아지거나 낮아졌던 경험을 떠올리고 이론과 연결해 보세요.',
}

const stripExample = (text = '') => text.replace(/^예\)\s*/, '')

// all help text comes from the current step and assignment in the data file
function hintFor(type, step, assignment, criterionCompletion) {
  if (type === 'start') {
    return step.prerequisiteTip ? [step.prerequisiteTip] : [`먼저 "${step.completionCriteria[0]?.text}"부터 해 보세요.`]
  }
  if (type === 'words') {
    return [
      '과제 지시문의 핵심 말을 쉽게 풀면 이래요.',
      ...assignment.requirements.map((requirement) => `· ${requirement.label}: ${requirement.text}`),
      '다른 말이 어렵다면 아래 칸에 적어 보내 주세요.',
    ]
  }
  return [
    `이 단계의 완료 기준은 ${step.completionCriteria.length}가지예요.`,
    ...step.completionCriteria.map(
      (criterion) => `${criterionCompletion[criterion.id] ? '✓' : '○'} ${criterion.text}${criterionCompletion[criterion.id] ? ' (저장됨)' : ''}`,
    ),
  ]
}

function exampleFor(step) {
  return ['다른 학생은 이렇게 적었어요.', ...step.completionCriteria.map((criterion) => `· ${stripExample(criterion.placeholder)}`)]
}

function stepsFor(step) {
  return [
    `"${step.title}"를 작게 나누면 이래요.`,
    ...step.completionCriteria.map((criterion, index) => `${index + 1}. ${criterion.text}`),
    `${step.completionCriteria.length + 1}. 다 했으면 '이 단계 완료'를 눌러요`,
  ]
}

export default function ChatRoom({
  subjectId,
  onSubject,
  stepCompletion,
  criterionCompletion,
  tab = 'help',
  onTab,
  commuSession,
  onCommuSession,
  commuStep,
  onCommuStep,
  commuDraft,
  onCommuDraft,
  onClose,
}) {
  const subject = subjectById(subjectId) || data.subjects[0]
  const assignment = data.assignments.find((item) => item.subjectId === subject.id)
  const step = assignment.steps.find((item) => !stepCompletion[item.id]) || null
  const [log, setLog] = useState([])
  const [mode, setMode] = useState('types')
  const [draft, setDraft] = useState('')
  const logRef = useRef(null)

  // keep the newest message in view
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, mode, tab, commuStep])

  function say(entries) {
    setLog((current) => [...current, ...entries])
  }

  function pickType(type) {
    if (!step) {
      say([{ role: 'me', text: type.label }, { role: 'bear', lines: ['이 과제는 모든 단계를 마쳤어요. 다른 수업을 골라 보세요.'] }])
      return
    }
    say([
      { role: 'me', text: type.label },
      { role: 'bear', label: '힌트', lines: hintFor(type.id, step, assignment, criterionCompletion) },
    ])
    setMode('levels')
  }

  function moreHelp(level) {
    if (level === 'example') say([{ role: 'me', text: '예시 보기' }, { role: 'bear', label: '구체적 예시', lines: exampleFor(step) }])
    if (level === 'steps') say([{ role: 'me', text: '하나씩 따라 하기' }, { role: 'bear', label: '세부 행동 안내', lines: stepsFor(step) }])
    if (level === 'done') {
      say([{ role: 'me', text: '이제 할 수 있어요' }, { role: 'bear', lines: ['좋아요. 직접 해 보고, 막히면 다시 불러 주세요.'] }])
      setMode('types')
    }
  }

  function freeReply(text) {
    const answer = FREE_ANSWERS[subject.name] ?? '어떤 부분이 어려운지 알려주세요. 함께 하나씩 살펴볼게요.'
    say([{ role: 'me', text }, { role: 'bear', lines: [answer] }])
  }

  return (
    <dialog className="chat-dialog" open aria-labelledby="chat-title">
      <div className="chat-head">
        <img src={BEAR} alt="" />
        <div>
          <h2 id="chat-title">곰곰이에게 질문하기</h2>
          <p className="chat-sub">
            {tab === 'commu'
              ? COPY.wizardSubtitle
              : step
                ? `지금 단계: ${step.title}`
                : '이 과제는 모든 단계를 마쳤어요'}
          </p>
        </div>
        <button type="button" className="chat-close" onClick={onClose} aria-label="닫기">
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <div className="chat-tabs" role="tablist" aria-label="곰곰이 기능 선택">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === tab}
            className="chat-tab"
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'commu' ? (
        <div className="chat-log commu-body" ref={logRef}>
          <CommunicationWizard
            session={commuSession}
            onSession={onCommuSession}
            step={commuStep}
            onStep={onCommuStep}
            draft={commuDraft}
            onDraft={onCommuDraft}
          />
        </div>
      ) : (
      <>
      <div className="chat-subjects" role="tablist" aria-label="수업 선택">
        {data.subjects.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === subject.id}
            className="nav-btn"
            onClick={() => {
              onSubject(item.id)
              setLog([])
              setMode('types')
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="chat-log" aria-live="polite" ref={logRef}>
        <div className="chat-row">
          <img src={BEAR} alt="" />
          <p className="chat-bear">어떤 점이 어려운가요? 하나를 골라 보세요</p>
        </div>
        {log.map((item, index) =>
          item.role === 'me' ? (
            <p key={`me-${index}`} className="chat-me">
              {item.text}
            </p>
          ) : (
            <div key={`bear-${index}`} className="chat-row">
              <img src={BEAR} alt="" />
              <div className="chat-bear">
                {item.label ? <span className="help-level">{item.label}</span> : null}
                {item.lines.map((line, lineIndex) => (
                  <p key={lineIndex}>{line}</p>
                ))}
              </div>
            </div>
          ),
        )}
        {/* choices sit right under 곰곰이's last message so the eye moves straight down */}
        {mode === 'types' ? (
        <div className="help-types">
          {HELP_TYPES.map((type) => {
            return (
              <button key={type.id} type="button" className="help-type" onClick={() => pickType(type)}>
                {type.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="chat-choices">
          <button type="button" className="chat-chip" onClick={() => moreHelp('example')}>
            <FileText aria-hidden="true" size={16} />
            예시 보기
          </button>
          <button type="button" className="chat-chip" onClick={() => moreHelp('steps')}>
            <ListChecks aria-hidden="true" size={16} />
            하나씩 따라 하기
          </button>
          <button type="button" className="chat-chip" onClick={() => moreHelp('done')}>
            <CircleCheck aria-hidden="true" size={16} />
            이제 할 수 있어요
          </button>
        </div>
      )}
      </div>
      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault()
          const text = draft.trim()
          if (!text) return
          setDraft('')
          freeReply(text)
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
        <button type="submit" className="btn primary chat-send" aria-label="보내기">
          <ArrowUp aria-hidden="true" size={18} />
        </button>
      </form>
      </>
      )}
    </dialog>
  )
}
