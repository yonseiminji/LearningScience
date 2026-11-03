import { useEffect, useRef } from 'react'

const CHOICES = [
  {
    value: 'standard',
    label: '지금 바로 시작할 수 있어요',
    icon: 'broad',
  },
  {
    value: 'detailed',
    label: '조금 더 작은 단계가 필요해요',
    icon: 'detailed',
  },
  {
    value: 'micro',
    label: '아주 작은 행동부터 시작하고 싶어요',
    icon: 'micro',
  },
]

function LevelIcon({ name }) {
  if (name === 'broad') {
    return (
      <svg className="level-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 7h16M4 12h16M4 17h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name === 'detailed') {
    return (
      <svg className="level-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 6h16M4 10h12M4 14h16M4 18h8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg className="level-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 7.5h6M7.5 14v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SupportLevelDialog({ levels, selected, onSelect, onCancel }) {
  const dialogRef = useRef(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    const current =
      dialog.querySelector('[aria-pressed="true"]') || dialog.querySelector('.level-option')
    current?.focus()

    function handleCancel(event) {
      event.preventDefault()
      onCancelRef.current()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="level-dialog"
      aria-labelledby="level-dialog-title"
      aria-describedby="level-dialog-note"
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel()
      }}
    >
      <h2 id="level-dialog-title">과제를 시작하기에 어떤 상태인가요?</h2>
      <p className="level-note" id="level-dialog-note">
        단계의 크기만 고릅니다. 이 선택은 능력이나 진단을 뜻하지 않습니다.
      </p>
      <ul className="level-options">
        {CHOICES.map((choice) => {
          const pressed = selected === choice.value
          const levelLabel = levels?.[choice.value]?.label
          return (
            <li key={choice.value}>
              <button
                type="button"
                className="level-option"
                aria-pressed={pressed}
                onClick={() => onSelect(choice.value)}
              >
                <LevelIcon name={choice.icon} />
                <span className="choice-copy">
                  <span className="choice-label">{choice.label}</span>
                  {levelLabel ? <span className="choice-meta">{levelLabel}</span> : null}
                </span>
                {pressed ? <span className="choice-state">선택됨</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          닫기
        </button>
      </div>
    </dialog>
  )
}
