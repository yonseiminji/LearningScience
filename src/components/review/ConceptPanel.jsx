import { useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, Lightbulb, Network, Sparkles } from 'lucide-react'
import KNOWLEDGE from '../../data/socialization_knowledge.js'
import ConceptDiagram from './ConceptDiagram.jsx'
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
export default function ConceptPanel({ material, chunks = [], busy, error, onExplain, onDiagram, explanation, diagram }) {
  const [conceptId, setConceptId] = useState(null)

  const found = useMemo(() => conceptsInChunks(chunks), [chunks])
  const byId = useMemo(() => new Map(KNOWLEDGE.concepts.map((item) => [item.conceptId, item])), [])
  const concept = conceptId ? byId.get(conceptId) : null
  const hit = found.find((item) => item.conceptId === conceptId)

  const supported = material?.id === KNOWLEDGE.materialId

  if (!supported) {
    return (
      <section className="concept-panel">
        <p className="concept-note">
          개념 관계도는 아직 <b>사회화</b> 강의에서만 쓸 수 있어요. 다른 단원은 준비 중이에요.
        </p>
      </section>
    )
  }

  if (found.length === 0) {
    return (
      <section className="concept-panel">
        <p className="concept-note">
          강의 내용에서 다룬 개념을 찾지 못했어요. 먼저 <b>강의 구간 선택하기</b>에서 공부할 부분을 골라 주세요.
        </p>
      </section>
    )
  }

  return (
    <section className="concept-panel">
      <h3 className="concept-head">강의에서 다룬 개념</h3>
      <div className="concept-picker" role="group" aria-label="개념 선택">
        {found.map((item) => {
          const entry = byId.get(item.conceptId)
          return (
            <button
              key={item.conceptId}
              type="button"
              className={conceptId === item.conceptId ? 'chat-chip is-on' : 'chat-chip'}
              aria-pressed={conceptId === item.conceptId}
              onClick={() => setConceptId(item.conceptId)}
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
                {concept.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
            {concept.misconceptions?.length ? (
              <p className="concept-watch">
                <AlertTriangle aria-hidden="true" size={14} />
                {concept.misconceptions[0]}
              </p>
            ) : null}
            <p className="concept-source">
              OpenStax Introduction to Sociology 3e · {concept.source.section}절 {concept.source.pages}쪽
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
            {concept.visualId ? (
              <button
                type="button"
                className="btn"
                disabled={Boolean(busy)}
                onClick={() => onDiagram({ conceptId, visualId: concept.visualId, chunkIds: hit?.chunkIds || [] })}
              >
                <Network aria-hidden="true" size={15} />
                관계도 보기
              </button>
            ) : null}
          </div>

          {busy ? <p className="concept-note">{busy === 'diagram' ? '관계도를 가져오고 있어요…' : '설명을 만들고 있어요…'}</p> : null}
          {error ? <p className="concept-error">{error}</p> : null}

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
                <p className="concept-watch">
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

          {diagram && diagram.conceptId === conceptId ? <ConceptDiagram diagram={diagram} /> : null}
        </>
      ) : (
        <p className="concept-note">개념을 하나 고르면 교재의 정의부터 보여드려요.</p>
      )}
    </section>
  )
}
