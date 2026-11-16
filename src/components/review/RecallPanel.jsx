import { useMemo, useState } from 'react'
import { AlertTriangle, Check, Circle, CircleDashed, RotateCcw } from 'lucide-react'
import { BLANK, buildCloze, gradeCloze } from '../../features/retrieval/cloze.js'
import { conceptsInChunks } from '../../utils/conceptSearch.js'
import KNOWLEDGE from '../../data/socialization_knowledge.js'

const BEAR = '/brand/gomgomi.webp'

/**
 * 인출 연습하기 — three ways in, easiest first.
 *
 * A blank page is the strongest form of retrieval and the one most likely to
 * be abandoned: someone who cannot start writes nothing and learns nothing.
 * The first two levels lower the cost of starting without handing back the
 * answer. Filling a blank still means producing the word; explaining one
 * concept still means producing the sentence. Neither is recognition.
 */
const LEVELS = [
  { id: 'cloze', label: '빈칸 채우기', hint: '강의 문장에서 한 단어를 떠올려요' },
  { id: 'concept', label: '내 말로 개념 설명하기', hint: '개념 하나를 골라 설명해요' },
  { id: 'all', label: '오늘 배운 것 전부 적어보기', hint: '기억나는 내용을 모두 적어요' },
]

export default function RecallPanel({ chunks = [], busy, error, result, onSubmit, onAgain }) {
  const [level, setLevel] = useState(null)
  const [attempt, setAttempt] = useState('')
  const [conceptId, setConceptId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  const cloze = useMemo(() => buildCloze(chunks), [chunks])
  const found = useMemo(() => conceptsInChunks(chunks), [chunks])
  const byId = useMemo(() => new Map(KNOWLEDGE.concepts.map((item) => [item.conceptId, item])), [])
  const concept = conceptId ? byId.get(conceptId) : null

  function restart() {
    setAttempt('')
    setConceptId(null)
    setAnswers({})
    setChecked(false)
    onAgain()
  }

  if (result) return <Result result={result} onAgain={restart} />

  if (!level) {
    return (
      <section className="review-result" aria-label="인출 연습하기">
        <h3>
          <img src={BEAR} alt="" width="22" height="22" className="recall-bear" />
          오늘 무엇을 배웠나요?
        </h3>
        <p className="review-muted">기억에서 꺼내 보는 연습이에요. 어느 쪽부터 할지 골라 주세요.</p>
        <ul className="recall-levels">
          {LEVELS.map((item, at) => (
            <li key={item.id}>
              <button type="button" className="recall-level" onClick={() => setLevel(item.id)}>
                <span className="recall-level-step">{at + 1}</span>
                <b>{item.label}</b>
                <span>{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const back = (
    <button type="button" className="btn" onClick={() => setLevel(null)}>
      다른 방법 고르기
    </button>
  )

  if (level === 'cloze') {
    const done = checked
    return (
      <section className="review-result" aria-label="인출 연습하기">
        <h3>
          <img src={BEAR} alt="" width="22" height="22" className="recall-bear" />
          빈칸에 들어갈 말을 적어 보세요
        </h3>
        {cloze.length === 0 ? (
          <p className="review-muted">이 강의에서는 빈칸을 만들 문장을 찾지 못했어요. 다른 방법을 골라 주세요.</p>
        ) : (
          <ol className="recall-cloze">
            {cloze.map((item) => {
              const mark = done ? gradeCloze(item, answers[item.id]) : null
              return (
                <li key={item.id} className={mark ? `is-${mark}` : undefined}>
                  <p>{item.text.split(BLANK)[0]}<span className="recall-blank">{answers[item.id] || BLANK}</span>{item.text.split(BLANK)[1]}</p>
                  {done ? (
                    <p className="recall-cloze-answer">
                      {mark === 'right' ? <Check aria-hidden="true" size={14} /> : <Circle aria-hidden="true" size={14} />}
                      {item.answer}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={answers[item.id] || ''}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      placeholder="빈칸에 들어갈 말"
                      aria-label={item.text}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        )}
        <div className="recall-actions">
          {!done && cloze.length > 0 ? (
            <button type="button" className="btn primary" onClick={() => setChecked(true)}>
              다 적었어요
            </button>
          ) : null}
          {done ? (
            <button type="button" className="btn" onClick={() => { setAnswers({}); setChecked(false) }}>
              <RotateCcw aria-hidden="true" size={15} />
              다시 해 보기
            </button>
          ) : null}
          {back}
        </div>
      </section>
    )
  }

  if (level === 'concept') {
    return (
      <section className="review-result" aria-label="인출 연습하기">
        <h3>
          <img src={BEAR} alt="" width="22" height="22" className="recall-bear" />
          곰곰이에게 개념 하나를 설명해 볼까요?
        </h3>
        <div className="concept-picker" role="group" aria-label="개념 선택">
          {found.map((item) => (
            <button
              key={item.conceptId}
              type="button"
              className={conceptId === item.conceptId ? 'chat-chip is-on' : 'chat-chip'}
              aria-pressed={conceptId === item.conceptId}
              onClick={() => setConceptId(item.conceptId)}
            >
              {byId.get(item.conceptId)?.termKo}
            </button>
          ))}
        </div>
        {concept ? (
          <Writing
            title={`${concept.termKo}, 아는 대로 적어 보세요`}
            placeholder="예) 사회에서 살아가는 법을 배우는 과정이에요"
            rows={5}
            min={10}
            value={attempt}
            onChange={setAttempt}
            busy={busy}
            error={error}
            onSubmit={() => onSubmit(attempt, conceptId)}
            extra={back}
          />
        ) : (
          <>
            <p className="review-muted">설명해 볼 개념을 하나 골라 주세요.</p>
            <div className="recall-actions">{back}</div>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="review-result" aria-label="인출 연습하기">
      <h3>
        <img src={BEAR} alt="" width="22" height="22" className="recall-bear" />
        오늘 무엇을 배웠나요?
      </h3>
      <p className="review-muted">강의를 다시 보지 말고, 떠오르는 내용을 순서 없이 적어도 괜찮아요.</p>
      <Writing
        title="오늘 강의에서 기억나는 걸 전부 적어 볼까요?"
        placeholder="예) 사회화는 사회의 규범을 배우는 과정이다. 자아는 다른 사람과의 상호작용에서 발달한다…"
        rows={10}
        min={10}
        value={attempt}
        onChange={setAttempt}
        busy={busy}
        error={error}
        onSubmit={() => onSubmit(attempt, null)}
        extra={back}
      />
    </section>
  )
}

function Writing({ title, placeholder, rows, min, value, onChange, busy, error, onSubmit, extra }) {
  const ready = value.trim().length >= min
  return (
    <div className="recall-ask">
      <p className="recall-prompt">{title}</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        maxLength={4000}
        placeholder={placeholder}
        aria-label={title}
      />
      {error ? (
        <p role="alert" className="concept-error">
          {error}
        </p>
      ) : null}
      <div className="recall-actions">
        <button type="button" className="btn primary" disabled={!ready || Boolean(busy)} onClick={onSubmit}>
          {busy ? '읽고 있어요…' : '다 적었어요'}
        </button>
        {extra}
      </div>
    </div>
  )
}

function Result({ result, onAgain }) {
  return (
    <section className="review-result" aria-label="인출 연습하기">
      <h3>떠올린 내용</h3>
      {result.nudge ? <p className="recall-nudge">{result.nudge}</p> : null}

      <ul className="recall-points">
        {result.covered.map((item) => (
          <li key={item.id} className="is-covered">
            <Check aria-hidden="true" size={15} />
            {item.statement}
          </li>
        ))}
        {result.partial.map((item) => (
          <li key={item.id} className="is-partial">
            <CircleDashed aria-hidden="true" size={15} />
            {item.statement}
            <em>조금 더 떠올려 볼까요</em>
          </li>
        ))}
        {result.missing.map((item) => (
          <li key={item.id} className="is-missing">
            <Circle aria-hidden="true" size={15} />
            {item.statement}
          </li>
        ))}
      </ul>

      {result.mixups?.length ? (
        <div className="recall-mixups">
          <p className="concept-watch">
            <AlertTriangle aria-hidden="true" size={14} />
            다시 볼 부분이 있어요
          </p>
          <ul>
            {result.mixups.map((item) => (
              <li key={item.said}>
                <span className="recall-said">{item.said}</span>
                <span className="recall-instead">{item.instead}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="review-muted">{result.note}</p>

      <p className="recall-mine">
        <b>내가 적은 글</b>
        {result.attempt}
      </p>

      <button type="button" className="btn" onClick={onAgain}>
        <RotateCcw aria-hidden="true" size={15} />
        다시 해 보기
      </button>
    </section>
  )
}
