import { formatSlotLabel, slotFromIso } from '../weekPlan.js'

// The 이번 주 계획 table. Used in the panel, and again as the printable sheet
// a learner can stick in a notebook.
export default function PlanSheet({ entries, title = '이번 주 계획', tag, className = '' }) {
  return (
    <div className={`plan-sheet ${className}`.trim()}>
      <p className="plan-sheet-title">
        {title}
        {tag ? <span className="plan-tag">{tag}</span> : null}
      </p>
      <ul className="plan-rows">
        {entries.map((entry) => (
          <li key={entry.key || entry.stepId}>
            <span className="plan-when">{entry.slotLabel || formatSlotLabel(slotFromIso(entry.slotIso, entry.nextWeek))}</span>
            <span className="plan-what">
              <span className="plan-step">{entry.label || `${entry.subjectName} ${entry.stepNumber}단계`}</span>
              <span className="plan-detail">
                {entry.stepTitle} · {entry.minutes}분
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
