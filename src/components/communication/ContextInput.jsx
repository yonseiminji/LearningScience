import { Sparkles } from 'lucide-react'
import Bear from './Bear.jsx'
import { CONTEXT_SOURCE, COPY, exampleContextFor, recipientById, situationById } from '../../communication.js'

// STEP 3: the learner's own words. 예시 사용하기 fills the box with the
// prepared example for this situation; typing over it makes the text theirs
// again, and contextSource follows, because only an untouched example may be
// answered with a prepared sentence.
export default function ContextInput({ recipientId, situationId, contextText, contextSource, onChange }) {
  const recipient = recipientById(recipientId)
  const situation = situationById(recipientId, situationId)
  const example = exampleContextFor(recipientId, situationId)
  if (!recipient || !situation) return null

  const usingExample = contextSource === CONTEXT_SOURCE.EXAMPLE && contextText.trim() === example.trim()

  return (
    <>
      <Bear>
        <p>{recipient.contextQuestion}</p>
      </Bear>

      {example ? (
        <div className="commu-example">
          <p className="commu-example-head">
            <span className="commu-example-tag">{COPY.exampleBadge}</span>
            {situation.exampleSource === 'spec' ? '명세에 있는 예시예요.' : '시연용으로 적어 둔 예시예요.'}
          </p>
          <p className="commu-example-text">{example}</p>
          <button
            type="button"
            className="btn"
            onClick={() => onChange(example, CONTEXT_SOURCE.EXAMPLE)}
            disabled={usingExample}
          >
            <Sparkles aria-hidden="true" size={16} />
            {usingExample ? '예시를 사용 중이에요' : COPY.useExampleButton}
          </button>
        </div>
      ) : null}

      <label className="commu-field">
        <span className="commu-field-label">현재 상황</span>
        <textarea
          className="commu-textarea"
          rows={5}
          value={contextText}
          placeholder={COPY.contextPlaceholder}
          onChange={(event) => {
            const text = event.target.value
            const source = text.trim() === example.trim() && example ? CONTEXT_SOURCE.EXAMPLE : CONTEXT_SOURCE.USER
            onChange(text, text.trim() === '' ? null : source)
          }}
        />
      </label>
    </>
  )
}
