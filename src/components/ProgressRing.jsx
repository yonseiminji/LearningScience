const RING_R = 22
const RING_C = 2 * Math.PI * RING_R

export default function ProgressRing({ done, total }) {
  const ratio = total ? done / total : 0
  return (
    <span className="ring" role="img" aria-label={`${total}단계 중 ${done}단계 완료`}>
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="ring-track" cx="26" cy="26" r={RING_R} />
        {done > 0 ? (
          <circle className="ring-fill" cx="26" cy="26" r={RING_R} strokeDasharray={`${RING_C * ratio} ${RING_C}`} />
        ) : null}
      </svg>
      <span className="ring-num num" aria-hidden="true">
        {done}/{total}
      </span>
    </span>
  )
}
