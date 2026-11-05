import ChagokBlocks from './ChagokBlocks.jsx'
import { ddayLabel, formatDue, subjectById } from '../assignmentModel.js'

export default function SideWing({ counts, nextAssignment, talkedName, recentTitles, onOpenChat }) {
  const talked = talkedName ? subjectById(talkedName) : null

  return (
    <aside className="wing" aria-label="보충 정보">
      <section className="wing-group">
        <h2>이번주</h2>
        <p className="wing-count">
          <ChagokBlocks done={counts.done} total={counts.total} />
          <span className="num">
            {counts.done}/{counts.total}
          </span>
        </p>
        {nextAssignment ? (
          <p className="wing-next">
            {subjectById(nextAssignment.subjectId)?.name} · {formatDue(nextAssignment.dueAt)}{' '}
            <span className="due-chip">{ddayLabel(nextAssignment.dueAt)}</span>
          </p>
        ) : (
          <p>남은 마감이 없어요.</p>
        )}
      </section>
      <section className="wing-group">
        <h2>가장 많이 이야기한 수업</h2>
        <p className="wing-strong">{talked ? talked.name : '아직 없어요'}</p>
      </section>
      <section className="wing-group">
        <h2>최근에 배운 것</h2>
        {recentTitles.length ? (
          <ul className="learned">
            {recentTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        ) : (
          <p>아직 확인한 단계가 없어요.</p>
        )}
      </section>
      <button type="button" className="bear-fab" onClick={onOpenChat}>
        <img src="/brand/gomgomi.webp" alt="" />
        수업 이야기
      </button>
    </aside>
  )
}
