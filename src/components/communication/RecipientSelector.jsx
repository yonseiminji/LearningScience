import { ChevronRight } from 'lucide-react'
import Bear from './Bear.jsx'
import { COPY, recipients } from '../../communication.js'

// STEP 1, first half: 조원과 소통하기 / 교수님께 질문하기.
export default function RecipientSelector({ value, onSelect }) {
  return (
    <>
      <Bear>
        <p>{COPY.recipientQuestion}</p>
      </Bear>
      <div className="commu-choices">
        {recipients().map((item) => (
          <button
            key={item.recipientId}
            type="button"
            className={item.recipientId === value ? 'commu-choice is-on' : 'commu-choice'}
            onClick={() => onSelect(item.recipientId)}
          >
            {item.label}
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ))}
      </div>
      <p className="commu-hint">지금은 문장을 잘 쓰지 않아도 괜찮아요. 하나씩 고르면 필요한 질문을 정리할 수 있어요.</p>
    </>
  )
}
