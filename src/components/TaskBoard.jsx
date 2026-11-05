import ChagokBlocks from './ChagokBlocks.jsx'

function SimpleDetail({ task, onToggle }) {
  return (
    <div className="task-detail">
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
                  onChange={() => onToggle(task.id, step.id)}
                />
                <span>{step.action}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AnalyzedDetail({ task, analyzed, onOpenGuide }) {
  return (
    <div className="task-detail">
      <p>{task.summary}</p>
      <p className="deadline">
        마감 {analyzed.deadlineText}
        <span className="hint"> 연도는 지시문에 없습니다.</span>
      </p>
      <ul className="content-list">
        {task.requirements.content.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button type="button" className="btn primary" onClick={onOpenGuide}>
        과제 안내 열기
      </button>
    </div>
  )
}

function TaskCard({ id, courseName, title, dueLabel, done, total, open, onToggleOpen, children }) {
  return (
    <article id={`task-${id}`} className={`task-card${open ? ' is-open' : ''}`}>
      <button type="button" className="task-open" aria-expanded={open} onClick={onToggleOpen}>
        <span className="card-course">{courseName}</span>
        <span className="card-title">{title}</span>
        <span className="card-meta">
          {total > 0 ? <ChagokBlocks done={done} total={total} /> : null}
          <span className="due-chip">{dueLabel}</span>
          <span className="num">{total ? `${done}/${total}` : '단계 미선택'}</span>
        </span>
      </button>
      {open ? children : null}
    </article>
  )
}

export default function TaskBoard({
  analyzedTask,
  analyzed,
  simpleTasks,
  openTaskId,
  onToggleOpen,
  onToggleSimple,
  onOpenGuide,
}) {
  const urgent = simpleTasks.find((task) => !task.finished)
  const analyzedNext = analyzed.ready ? analyzed.next : null
  let answer = '남은 할 일이 없어요'
  let detail = '보드의 과제를 모두 마쳤습니다.'
  let openTarget = null

  if (urgent) {
    answer = urgent.next.action
    detail = `${urgent.course?.name} · ${urgent.title}`
    openTarget = () => {
      onToggleOpen(urgent.id, true)
      window.requestAnimationFrame(() => {
        document.getElementById(`task-${urgent.id}`)?.scrollIntoView({ block: 'nearest' })
      })
    }
  } else if (!analyzed.ready) {
    answer = '과제 지시문을 확인하고 단계 크기를 고르기'
    detail = analyzed.title
    openTarget = onOpenGuide
  } else if (analyzedNext) {
    answer = analyzedNext.action
    detail = analyzed.title
    openTarget = onOpenGuide
  }

  return (
    <div className="board">
      <p className="question">지금 무엇을 해야 하지?</p>
      <section className="now-card" aria-labelledby="now-action">
        <p className="now-label">지금 할 일</p>
        <h1 id="now-action">{answer}</h1>
        <p className="summary">{detail}</p>
        {openTarget ? (
          <button type="button" className="btn primary" onClick={openTarget}>
            이 할 일 열기
          </button>
        ) : null}
      </section>

      <div className="task-stack">
        <TaskCard
          id={analyzed.id}
          courseName={analyzed.course?.name}
          title={analyzed.title}
          dueLabel={`마감 ${analyzed.deadlineText}`}
          done={analyzed.done}
          total={analyzed.ready ? analyzed.total : 0}
          open={openTaskId === analyzed.id}
          onToggleOpen={() => onToggleOpen(analyzed.id)}
        >
          <AnalyzedDetail task={analyzedTask} analyzed={analyzed} onOpenGuide={onOpenGuide} />
        </TaskCard>
        {simpleTasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            courseName={task.course?.name}
            title={task.title}
            dueLabel={task.dueLabel}
            done={task.done}
            total={task.total}
            open={openTaskId === task.id}
            onToggleOpen={() => onToggleOpen(task.id)}
          >
            <SimpleDetail task={task} onToggle={onToggleSimple} />
          </TaskCard>
        ))}
      </div>
    </div>
  )
}
