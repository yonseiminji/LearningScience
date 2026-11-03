import { segmentInstruction } from '../taskModel.js'

export default function RequirementView({ task }) {
  const { segments, missing } = segmentInstruction(
    task.original_instruction,
    task.requirements,
  )

  const marked = segments.filter((segment) => segment.type === 'requirement')

  return (
    <section className="panel" aria-labelledby="instruction-heading">
      <h2 id="instruction-heading">과제 지시문</h2>
      <p className="instruction">
        {segments.map((segment, index) =>
          segment.type === 'text' ? (
            <span key={`text-${index}`}>{segment.text}</span>
          ) : (
            <mark key={segment.id} className="req">
              {segment.text}
            </mark>
          ),
        )}
      </p>
      {marked.length > 0 ? (
        <ul className="req-legend" aria-label="표시된 요구사항">
          {marked.map((segment) => (
            <li key={segment.id}>
              <span className="req-label">{segment.label}</span>
              <span className="req-phrase">{segment.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {missing.length > 0 ? (
        <ul className="req-legend">
          {missing.map((requirement) => (
            <li key={requirement.id}>
              <span className="req-label">{requirement.label}</span>
              <span className="req-phrase">{requirement.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
