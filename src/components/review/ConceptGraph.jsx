import { useMemo } from 'react'
import { layoutGraph } from '../../features/conceptGraph/layout.js'
import { STYLE } from '../../features/conceptGraph/relationStyle.js'
import { describeGraph } from '../../features/conceptGraph/fromLexicon.js'

const HEADS = {
  solid: { id: 'cg-solid', fill: 'var(--accent)' },
  hollow: { id: 'cg-hollow', fill: 'var(--card)' },
}

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
              return (
                <g key={edge.relationId}>
                  <line
                    x1={edge.a.x}
                    y1={edge.a.y}
                    x2={edge.b.x}
                    y2={edge.b.y}
                    stroke="var(--accent)"
                    strokeWidth={style.width}
                    strokeDasharray={style.dash || undefined}
                    markerEnd={head}
                    opacity={edge.type === 'DEFINED_AS' ? 0.55 : 0.85}
                  />
                  {style.label ? (
                    <text
                      x={edge.mid.x}
                      y={edge.mid.y - 4}
                      textAnchor="middle"
                      className="concept-graph-edge-label"
                    >
                      {style.label}
                    </text>
                  ) : null}
                </g>
              )
            })}

            {laid.nodes.map((node) => (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx="8"
                  className={node.note ? 'concept-graph-note' : 'concept-graph-box'}
                />
                <text x={node.x + node.w / 2} y={node.y + 14} textAnchor="middle" className="concept-graph-label">
                  {node.lines.map((line, at) => (
                    <tspan key={line} x={node.x + node.w / 2} dy={at === 0 ? 4 : 18}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <ul className="concept-graph-key">
        {graph.types.map((type) => (
          <li key={type}>
            <b>{STYLE[type]?.label || type}</b>
            {TYPE_WORDS[type] || type}
          </li>
        ))}
      </ul>

      {caveat ? <p className="concept-watch">{caveat}</p> : null}
      <p className="concept-source">OpenStax Introduction to Sociology 3e · {graph.pages.join(', ')}쪽</p>
    </div>
  )
}

const TYPE_WORDS = {
  IS_A: '상위 개념에 속해요',
  PART_OF: '전체의 한 부분이에요',
  EXAMPLE_OF: '개념의 사례예요',
  PRECEDES: '순서가 뒤예요. 원인이 아니에요',
  CAUSES: '원인과 결과예요',
  FACILITATES: '기여하거나 매개해요',
  DEFINED_AS: '뜻을 풀어 설명해요',
  CONTRASTS_WITH: '나란히 두고 비교해요',
}
