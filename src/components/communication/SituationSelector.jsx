import { ChevronRight } from 'lucide-react'
import Bear from './Bear.jsx'
import { recipientById, situationsFor } from '../../communication.js'

// STEP 1, second half: one of the three difficulties for the chosen person.
// Changing it later throws away answers about other information, so the panel
// asks first and shows that question here.
export default function SituationSelector({ recipientId, value, pending, onSelect, onConfirm, onCancel }) {
  const recipient = recipientById(recipientId)
  if (!recipient) return null

  return (
    <>
      <Bear>
        <p>{recipient.situationQuestion}</p>
      </Bear>
      <div className="commu-choices">
        {situationsFor(recipientId).map((item) => (
          <button
            key={item.situationId}
            type="button"
            className={item.situationId === value ? 'commu-choice is-on' : 'commu-choice'}
            onClick={() => onSelect(item.situationId)}
          >
            {item.label}
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ))}
      </div>
      {pending ? (
        <div className="plan-caution" role="alert">
          <p>상황을 바꾸면 앞에서 고른 정보와 적어 둔 내용이 지워져요. 바꿀까요?</p>
          <div className="commu-row">
            <button type="button" className="btn primary" onClick={onConfirm}>
              바꿀게요
            </button>
            <button type="button" className="btn" onClick={onCancel}>
              그대로 둘래요
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
