import { useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, Lightbulb, Network, Sparkles } from 'lucide-react'
import KNOWLEDGE from '../../data/socialization_knowledge.js'
import ConceptGraph from './ConceptGraph.jsx'
import { diagramsForConcept, graphFor } from '../../features/conceptGraph/fromLexicon.js'
import { conceptsInChunks } from '../../utils/conceptSearch.js'

const SUPPORTS = [
  { id: 'simple', label: '쉽게 설명' },
  { id: 'example', label: '구체적 사례' },
  { id: 'analogy', label: '비유' },
  { id: 'comparison', label: '비교' },
]

/**
 * 강의 이해: pick a concept, read the checked definition, then ask for help.
 *
 * The definition on screen is never generated. It comes from the knowledge
 * base and appears the moment a concept is picked, so there is something
 * correct to read before any model is called and something left standing if
 * the call fails.
 *
 * Only concepts the transcript actually mentions can be picked. The textbook
 * knows more than the lecture covered, and offering to explain a concept the
 * class never reached would be answering from the book alone.
 */
export default function ConceptPanel({
  material,
  chunks = [],
  busy,
  error,
  onExplain,
  explanation,
}) {
  const [conceptId, setConceptId] = useState(null)
  const [showGraph, setShowGraph] = useState(false)

  const found = useMemo(() => conceptsInChunks(chunks), [chunks])
  const byId = useMemo(() => new Map(KNOWLEDGE.concepts.map((item) => [item.conceptId, item])), [])
  const concept = conceptId ? byId.get(conceptId) : null
  const hit = found.find((item) => item.conceptId === conceptId)
  const charts = useMemo(
    () => (conceptId ? diagramsForConcept(conceptId).map((item) => graphFor(item.diagramId)).filter(Boolean) : []),
    [conceptId],
  )

  // The transcript decides, not the file it came from. An earlier version
  // compared material.id against the knowledge base's own id, which is a demo
  // string no uploaded file can ever carry — so every real lecture, the
  // socialization one included, was told it was the wrong unit.
  if (found.length === 0) {
    return (
      <section className="concept-panel">
        <p className="concept-note">
          이 강의에서 다루는 개념을 찾지 못했어요. 지금은 <b>사회화</b>(Chapter 5) 개념만 준비되어 있어요.
        </p>
      </section>
    )
  }

  return (
    <section className="concept-panel">
      <h3 className="concept-head">교과서 개념</h3>
      <div className="concept-picker" role="group" aria-label="개념 선택">
        {found.map((item) => {
          const entry = byId.get(item.conceptId)
          return (
            <button
              key={item.conceptId}
              type="button"
              className={conceptId === item.conceptId ? 'chat-chip is-on' : 'chat-chip'}
              aria-pressed={conceptId === item.conceptId}
              onClick={() => {
                setConceptId(item.conceptId)
                setShowGraph(false)
              }}
            >
              {entry.termKo}
            </button>
          )
        })}
      </div>

      {concept ? (
        <>
          <div className="concept-card">
            <p className="concept-term">
              <BookOpen aria-hidden="true" size={15} />
              {concept.termKo} <span>{concept.termEn}</span>
            </p>
            <p className="concept-def">{concept.definitionKo}</p>
            {concept.keyPoints?.length ? (
              <ul className="concept-points">
                {concept.keyPoints.map((point) => {
                  // '준비 단계: 타인의 행동을…' — lead with the term.
                  const at = point.indexOf(':')
                  return at > 0 ? (
                    <li key={point}>
                      <b>{point.slice(0, at)}</b>
                      {point.slice(at)}
                    </li>
                  ) : (
                    <li key={point}>{point}</li>
                  )
                })}
              </ul>
            ) : null}
            {concept.misconceptions?.length ? (
              <p className="concept-watch">
                <AlertTriangle aria-hidden="true" size={14} />
                {concept.misconceptions[0]}
              </p>
            ) : null}
            <p className="concept-source">
              {concept.source.inEdition === false
                ? `${KNOWLEDGE.scope.publisher} ${KNOWLEDGE.scope.book} · 이 판에서는 따로 다루지 않아요`
                : `${KNOWLEDGE.scope.publisher} ${KNOWLEDGE.scope.book} · §${concept.source.section}`}
            </p>
          </div>

          <div className="concept-actions" role="group" aria-label="이해 지원 선택">
            {SUPPORTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="btn"
                disabled={Boolean(busy)}
                onClick={() => onExplain({ conceptId, supportType: item.id, chunkIds: hit?.chunkIds || [] })}
              >
                {item.label}
              </button>
            ))}
            {charts.length > 0 ? (
              <button
                type="button"
                className="btn"
                aria-pressed={showGraph}
                onClick={() => setShowGraph((prev) => !prev)}
              >
                <Network aria-hidden="true" size={15} />
                {showGraph ? '관계도 닫기' : '관계도 보기'}
              </button>
            ) : null}
          </div>

          {busy ? <p className="concept-note">설명을 만들고 있어요…</p> : null}
          {error ? (
            <p role="alert" className="concept-error">
              {error}
            </p>
          ) : null}

          {explanation && explanation.conceptId === conceptId ? (
            <article className="concept-answer">
              <h4>
                <Lightbulb aria-hidden="true" size={15} />
                {explanation.title}
              </h4>
              {explanation.isGeneratedExample ? (
                <p className="concept-flag">
                  <Sparkles aria-hidden="true" size={13} />
                  AI가 만든 예시예요. 교재에 실린 사례가 아니에요.
                </p>
              ) : null}
              <p>{explanation.explanation}</p>
              {explanation.status !== 'ok' ? (
                <p className="concept-watch is-plain">
                  <AlertTriangle aria-hidden="true" size={14} />
                  {explanation.status === 'conflicting_sources'
                    ? '강의 설명과 교재 정의가 달라요. 위의 교재 정의를 함께 봐 주세요.'
                    : '근거가 더 필요해요. 강의 구간을 더 골라 보세요.'}
                </p>
              ) : null}
              <p className="concept-source">
                {explanation.sourceLabel}
                {explanation.sourceChunkIds?.length ? ` · 강의 ${explanation.sourceChunkIds.join(', ')}` : ''}
              </p>
              {explanation.warnings?.map((warning) => (
                <p key={warning} className="concept-note">{warning}</p>
              ))}
            </article>
          ) : null}

          {/* Drawn here from the relation lexicon — no model, no round trip,
              nothing to go wrong when thirty people open it at once. */}
          {showGraph
            ? charts.map((chart) => (
                <figure key={chart.diagramId} className="concept-diagram">
                  <figcaption>
                    <Network aria-hidden="true" size={15} />
                    {chart.title}
                  </figcaption>
                  <ConceptGraph graph={chart} />
                </figure>
              ))
            : null}
        </>
      ) : null}

      {!concept ? <p className="concept-note">개념을 하나 고르면 교재의 정의부터 보여드려요.</p> : null}
    </section>
  )
}
