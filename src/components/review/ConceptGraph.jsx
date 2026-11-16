import { useMemo } from 'react'
import { layoutGraph } from '../../features/conceptGraph/layout.js'
import { LIST_PREFIX, STYLE, edgeLabel } from '../../features/conceptGraph/relationStyle.js'
import { describeGraph } from '../../features/conceptGraph/fromLexicon.js'

const HEADS = {
  solid: { id: 'cg-solid', fill: 'var(--accent)' },
}

// A contrast is not a step in the flow, so it does not share the flow's ink.
const TONE = { ink: 'var(--accent)', warn: 'var(--contrast-line)' }

/**
 * The concept diagram, drawn from typed relations rather than parsed prose.
 *
 * No Mermaid and no layout library. The graphs are small and the shapes they
 * need are few, and drawing them here is what lets a relation's meaning reach
 * the picture: PRECEDES gets an arrow because order has a direction,
 * DEFINED_AS does not because a term and its gloss are not a flow.
 *
 * The SVG is built as React elements, so nothing is ever injected as HTML.
 */
export default function ConceptGraph({ graph, caveat }) {
  const laid = useMemo(() => layoutGraph(graph.nodes, graph.edges), [graph])
  const alt = useMemo(() => describeGraph(graph), [graph])

  const pad = 14
  const width = laid.width + pad * 2
  const height = laid.height + pad * 2

  return (
    <div className="concept-graph">
      <div className="concept-graph-scroll">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={alt}
          className="concept-graph-svg"
        >
          <defs>
            {Object.values(HEADS).map((head) => (
              <marker
                key={head.id}
                id={head.id}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={head.fill} stroke="var(--accent)" strokeWidth="1" />
              </marker>
            ))}
          </defs>

          <g transform={`translate(${pad} ${pad})`}>
            {laid.edges.map((edge) => {
              const style = STYLE[edge.type] || STYLE.FACILITATES
              const head = style.head === 'none' ? undefined : `url(#${HEADS[style.head].id})`
              const stroke = TONE[style.tone] || TONE.ink
              return (
                <g key={edge.relationId}>
                  <polyline
                    points={edge.points.map((point) => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={style.width}
                    strokeDasharray={style.dash || undefined}
                    strokeLinejoin="round"
                    markerEnd={head}
                    opacity={edge.type === 'DEFINED_AS' ? 0.55 : 0.85}
                  />
                  {/* The relation's own wording when it fits, in full on
                      hover when it does not. */}
                  {edge.relationKo ? <title>{edge.relationKo}</title> : null}
                  {edgeLabel(edge) ? (
                    <text
                      x={edge.label.x}
                      y={edge.label.y}
                      textAnchor={edge.label.anchor}
                      className={style.tone === 'warn' ? 'concept-graph-edge-label is-contrast' : 'concept-graph-edge-label'}
                    >
                      {edgeLabel(edge)}
                    </text>
                  ) : null}
                </g>
              )
            })}

            {laid.nodes.map((node) => {
              const mid = node.x + node.w / 2
              let rowTop = node.y + node.headH
              return (
                <g key={node.id}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.w}
                    height={node.h}
                    rx="8"
                    className={node.note ? 'concept-graph-note' : 'concept-graph-box'}
                  />
                  <text x={mid} y={node.y + 14} textAnchor="middle" className="concept-graph-label">
                    {node.lines.map((line, at) => (
                      <tspan key={line} x={mid} dy={at === 0 ? 4 : 18}>
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {/* Parts of the concept, as rows under its heading. */}
                  {node.parts.map((part) => {
                    const h = Math.max(24, part.lines.length * 18 + 8)
                    const top = rowTop
                    rowTop += h
                    return (
                      <g key={part.relationId}>
                        <rect x={node.x} y={top} width={node.w} height={h} className="concept-graph-part" />
                        <text x={mid} y={top + 11} textAnchor="middle" className="concept-graph-part-label">
                          {part.lines.map((line, at) => (
                            <tspan key={line} x={mid} dy={at === 0 ? 4 : 18}>
                              {line}
                            </tspan>
                          ))}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {graph.listed?.length ? (
        <ul className="concept-graph-list">
          {graph.listed.map((item) => (
            <li key={item.relationId}>
              <b>{LIST_PREFIX[item.type] || ''}</b>
              {item.text}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Each key draws the line it is naming, so 'dotted' does not have to
          be matched to a line somewhere above by memory. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="concept-graph-defs">
        <defs>
          {Object.values(HEADS).map((head) => (
            <marker
              key={head.id}
              id={`${head.id}-key`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={head.fill} stroke="var(--accent)" strokeWidth="1" />
            </marker>
          ))}
        </defs>
      </svg>

      <ul className="concept-graph-key">
        {graph.nodes.some((node) => node.parts?.length) ? (
          <li>
            <svg width="34" height="14" aria-hidden="true" className="concept-graph-swatch">
              <rect x="1" y="1" width="32" height="5.5" rx="1.5" className="concept-graph-box" />
              <rect x="1" y="7" width="32" height="6" rx="1.5" className="concept-graph-part" />
            </svg>
            상자 안의 칸은 그 개념을 이루는 <b>부분</b>이에요
          </li>
        ) : null}
        {graph.types.map((type) => {
          const style = STYLE[type] || STYLE.FACILITATES
          return (
            <li key={type}>
              <svg width="34" height="14" aria-hidden="true" className="concept-graph-swatch">
                <line
                  x1="1"
                  y1="7"
                  x2={style.head === 'none' ? 33 : 26}
                  y2="7"
                  stroke={TONE[style.tone] || TONE.ink}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash || undefined}
                  markerEnd={style.head === 'none' ? undefined : `url(#${HEADS[style.head].id}-key)`}
                />
              </svg>
              <b>{STYLE[type]?.label || type}</b>
              {TYPE_WORDS[type] || type}
            </li>
          )
        })}
      </ul>

      {caveat ? <p className="concept-watch">{caveat}</p> : null}
      <p className="concept-source">OpenStax Introduction to Sociology 3e · {graph.pages.join(', ')}쪽</p>
    </div>
  )
}

// What the line style means. The word on each line comes from the relation
// itself, so these describe the kind rather than repeat the label.
const TYPE_WORDS = {
  IS_A: '상위 개념에 속해요',
  PART_OF: '전체의 한 부분이에요',
  EXAMPLE_OF: '개념의 사례예요',
  // Two of the three are a next step; the last is what the steps arrive at.
  PRECEDES: '앞뒤 순서나 결과예요. 원인이 아니에요',
  CAUSES: '원인과 결과예요',
  FACILITATES: '기여하거나 매개해요',
  // Not always a definition. Mostly it is what the concept takes as its
  // object — 준비 단계 → 타인의 행동 is what gets imitated, not a gloss.
  DEFINED_AS: '그 개념이 다루는 내용이에요',
  CONTRASTS_WITH: '나란히 두고 비교해요',
}
