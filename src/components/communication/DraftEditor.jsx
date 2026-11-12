import { useRef, useState } from 'react'
import { Check, Copy, RefreshCw, Undo2 } from 'lucide-react'
import Bear from './Bear.jsx'
import { COPY, DRAFT_BASIS, applyEdit, finalText, introFor, restoreOriginal } from '../../communication.js'

// STEP 4: the sentence, in the learner's hands.
//
// What 곰곰이 says above it depends on where the sentence came from. A
// prepared example gets the spec's wording; a sentence built around text the
// learner typed says plainly that nothing read it.
export default function DraftEditor({ draft, onDraft, onRegenerate }) {
  const [copied, setCopied] = useState(null) // null | 'ok' | 'failed'
  const textareaRef = useRef(null)
  if (!draft) return null

  const edited = draft.draft.isUserEdited

  async function copyText() {
    try {
      await navigator.clipboard.writeText(finalText(draft))
      setCopied('ok')
    } catch {
      setCopied('failed')
      const node = textareaRef.current
      if (node) {
        node.focus()
        node.select()
      }
    }
  }

  return (
    <>
      <Bear>
        <p>{introFor(draft)}</p>
      </Bear>

      {draft.basis === DRAFT_BASIS.TEMPLATE ? (
        <p className="commu-hint">
          적어 주신 내용은 고치지 않고 그대로 넣었어요. 곰곰이가 뜻을 읽은 것은 아니에요.
        </p>
      ) : null}

      {draft.identifiedNeeds.length > 0 ? (
        <div className="commu-field">
          <span className="commu-field-label">확인하려는 것</span>
          <ul className="commu-needs">
            {draft.identifiedNeeds.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="commu-hint">{COPY.editHint}</p>
      <textarea
        ref={textareaRef}
        className="commu-textarea is-draft"
        rows={10}
        value={finalText(draft)}
        aria-label="질문 문장"
        onChange={(event) => {
          onDraft(applyEdit(draft, event.target.value))
          setCopied(null)
        }}
      />
      {edited ? <p className="commu-hint">직접 고친 문장이에요. 원래 문장은 그대로 보관하고 있어요.</p> : null}

      <div className="commu-row">
        <button type="button" className="btn primary" onClick={copyText}>
          <Copy aria-hidden="true" size={16} />
          {COPY.copyButton}
        </button>
        <button type="button" className="btn" disabled={!edited} onClick={() => { onDraft(restoreOriginal(draft)); setCopied(null) }}>
          <Undo2 aria-hidden="true" size={16} />
          {COPY.restoreButton}
        </button>
        <button type="button" className="btn" onClick={() => { onRegenerate(); setCopied(null) }}>
          <RefreshCw aria-hidden="true" size={16} />
          {COPY.regenerateButton}
        </button>
      </div>

      {copied === 'ok' ? (
        <p className="commu-copied" role="status">
          <Check aria-hidden="true" size={14} />
          {COPY.copySuccess}
        </p>
      ) : null}
      {copied === 'failed' ? (
        <p className="plan-note" role="status">
          {COPY.copyFailure}
        </p>
      ) : null}
      <p className="plan-note">{COPY.noSendNotice}</p>
    </>
  )
}
