import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const BEAR = '/brand/gomgomi.webp'

// 곰곰이 popup. A centred window rather than a side rail: the planning
// conversation needs room, and everything said so far stays scrollable above
// the part being answered. Escape and the backdrop close it.
export default function BearPanel({ title, subtitle, titleId, scrollKey, onClose, children }) {
  const bodyRef = useRef(null)

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = previousOverflow
    }
  }, [onClose])

  // follow the conversation down as it grows, without taking scrolling away
  useEffect(() => {
    const node = bodyRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [scrollKey])

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div className="plan-popup" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="plan-popup-head">
          <img className="plan-popup-bear" src={BEAR} alt="" />
          <div className="plan-popup-titles">
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p className="plan-popup-sub">{subtitle}</p> : null}
          </div>
          <button type="button" className="chat-close" onClick={onClose} aria-label="닫기">
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="plan-popup-body" ref={bodyRef}>
          {children}
        </div>
      </div>
    </>,
    document.body,
  )
}
