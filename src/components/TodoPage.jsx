import ChagokBlocks from './ChagokBlocks.jsx'

export default function TodoPage({
  analyzed,
  completedIds,
  simpleTasks,
  onToggleSimple,
  onToggleAnalyzed,
  onOpenGuide,
}) {
  return (
    <div className="todo-page">
      <h1>나의 할 일</h1>
      <p className="summary">과제마다 작은 확인 단계로 나누어 두었습니다.</p>

      <section className="panel" aria-labelledby="analyzed-todo">
        <div className="todo-head">
          <div>
            <p className="card-course">{analyzed.course?.name}</p>
            <h2 id="analyzed-todo">{analyzed.title}</h2>
          </div>
          {analyzed.ready ? <ChagokBlocks done={analyzed.done} total={analyzed.total} /> : null}
        </div>
        <p>마감 {analyzed.deadlineText}</p>
        {analyzed.ready ? (
          <ul className="check-list">
            {analyzed.steps.map((step) => {
              const checked = completedIds.includes(step.id)
              return (
                <li key={step.id} className={checked ? 'is-done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleAnalyzed(step.id)}
                    />
                    <span>
                      {step.action}
                      <small>{step.completion_criteria}</small>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="hint">단계 크기를 고르면 이 과제의 확인 단계가 여기에 나타납니다.</p>
        )}
        <button type="button" className="btn primary" onClick={onOpenGuide}>
          과제 안내 열기
        </button>
      </section>

      {simpleTasks.map((task) => (
        <section className="panel" key={task.id} aria-labelledby={`todo-${task.id}`}>
          <div className="todo-head">
            <div>
              <p className="card-course">{task.course?.name}</p>
              <h2 id={`todo-${task.id}`}>{task.title}</h2>
            </div>
            <ChagokBlocks done={task.done} total={task.total} />
          </div>
          <p>
            {task.dueLabel}
            <span className="num">
              {' '}
              {task.done}/{task.total}
            </span>
          </p>
          {task.facts?.length ? (
            <dl className="spec">
              {task.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.text}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <ul className="check-list">
            {task.steps.map((step) => {
              const checked = task.doneIds.includes(step.id)
              return (
                <li key={step.id} className={checked ? 'is-done' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSimple(task.id, step.id)}
                    />
                    <span>{step.action}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
