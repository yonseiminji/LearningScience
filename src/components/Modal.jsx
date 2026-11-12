import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// A dialog that keeps focus inside itself while it is open, restores focus to
// whatever opened it, and closes on Escape or a click on the backdrop.
// Closing this way never carries out the dialog's action.
export default function Modal({ titleId, labelledBy, className = '', onClose, children }) {
  const panelRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    openerRef.current = document.activeElement
    const panel = panelRef.current
    const first = panel?.querySelector(FOCUSABLE)
    ;(first || panel)?.focus()

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (item) => item.offsetParent !== null || item === document.activeElement,
      )
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      body.style.overflow = previousOverflow
      const opener = openerRef.current
      if (opener && typeof opener.focus === 'function') opener.focus()
    }
  }, [onClose])

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`level-dialog modal-panel ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || titleId}
        tabIndex={-1}
      >
        {children}
      </div>
    </>
  )
}
