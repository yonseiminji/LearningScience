import Bear from './Bear.jsx'
import {
  INFORMATION_STATES,
  INFORMATION_STATE_LABELS,
  informationItemsFor,
  recipientById,
  statusOf,
} from '../../communication.js'

// STEP 2: for each thing worth checking, 알고 있어요 / 알고 싶어요 / 잘
// 모르겠어요. Nothing is pre-selected, and all of them have to be answered —
// what the learner does not know is what the question will be about.
export default function InformationSelector({ recipientId, situationId, information, onChange }) {
  const recipient = recipientById(recipientId)
  const items = informationItemsFor(recipientId, situationId)
  if (!recipient || items.length === 0) return null

  return (
    <>
      <Bear>
        <p>{recipient.informationQuestion}</p>
      </Bear>
      <ul className="commu-items">
        {items.map((item) => {
          const current = statusOf(information, item.key)
          return (
            <li key={item.key} className={current ? 'is-answered' : ''}>
              <span className="commu-item-label">{item.label}</span>
              <span className="commu-states">
                {INFORMATION_STATES.map((state) => (
                  <button
                    key={state}
                    type="button"
                    className={state === current ? `commu-state is-on is-${state}` : 'commu-state'}
                    aria-pressed={state === current}
                    onClick={() => onChange(item.key, state === current ? null : state)}
                  >
                    {INFORMATION_STATE_LABELS[state]}
                  </button>
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}
