import { deadlineNote, formatRows, segmentInstruction, signalPhrases } from '../taskModel.js'

export default function RequirementView({ task }) {
  const phrases = signalPhrases(task)
  const { segments } = segmentInstruction(task.original_instruction, phrases)
  const marked = segments.filter((segment) => segment.type === 'requirement')
  const content = task.requirements?.content || []
  const rows = formatRows(task)
  const deadline = task.requirements?.deadline
  const lateNote = deadlineNote(deadline)

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
        <ul className="req-legend" aria-label="지시문에서 표시된 구절">
          {marked.map((segment) => (
            <li key={segment.id}>
              <span className="req-label">{segment.label}</span>
              <span className="req-phrase">{segment.text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="req-group">
        <h3>내용</h3>
        <ul>
          {content.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="req-group">
        <h3>형식</h3>
        <dl className="spec">
          {rows.map((row) => (
            <div key={row.id}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="req-group">
        <h3>마감</h3>
        {deadline?.display ? <p className="deadline">{deadline.display}</p> : null}
        {lateNote ? <p className="hint">{lateNote}</p> : null}
      </div>
    </section>
  )
}
