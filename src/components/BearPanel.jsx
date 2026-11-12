import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const BEAR = '/brand/gomgomi-question.webp'

// The 곰곰이 side panel shell: same frame as the class chat, with a title, a
// one-line subtitle and a close button. Escape closes it.
export default function BearPanel({ title, subtitle, titleId, onClose, children }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      {/* <dialog open> so it picks up the .chat-dialog[open] placement rules */}
      <dialog className="chat-dialog bear-panel" open aria-labelledby={titleId}>
        <div className="chat-head">
          <img src={BEAR} alt="" />
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p className="chat-sub">{subtitle}</p> : null}
          </div>
          <button type="button" className="chat-close" onClick={onClose} aria-label="닫기">
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="chat-log bear-panel-body">{children}</div>
      </dialog>
    </>,
    document.body,
  )
}
