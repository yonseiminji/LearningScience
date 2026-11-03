import { segmentInstruction } from '../taskModel.js'

export default function RequirementView({ task }) {
  const { segments, missing } = segmentInstruction(
    task.original_instruction,
    task.requirements,
  )

  return (
    <section className="panel" aria-labelledby="instruction-heading">
      <h2 id="instruction-heading">과제 지시문</h2>
      <p className="instruction">
        {segments.map((segment, index) =>
          segment.type === 'text' ? (
            <span key={`text-${index}`}>{segment.text}</span>
          ) : (
            <span key={segment.id} className="req">
              {segment.text}
              <span className="req-label"> ({segment.label})</span>
            </span>
          ),
        )}
      </p>
      {missing.length > 0 ? (
        <ul className="missing-reqs">
          {missing.map((requirement) => (
            <li key={requirement.id}>
              <span className="req-label">{requirement.label}</span>
              <span>{requirement.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
