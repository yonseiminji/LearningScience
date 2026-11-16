// Turning the relation lexicon into something drawable.
//
// Nothing is invented here. A node exists because a relation names it, an edge
// exists because the lexicon has that row, and the row carries the section and
// line its evidence was found on. Where the lexicon is silent the picture is
// silent too.
//
// Relations the BCcampus edition does not support are marked inactive in the
// lexicon and never reach a diagram. They are not deleted: 'no evidence in
// this edition' is not 'false', and an audit should still be able to see
// what was dropped and why.

import LEXICON from '../../data/socialization_relations.js'
import { LIST_TAIL, isListed, isPart } from './relationStyle.js'

export const DIAGRAMS = [
  { diagramId: 'agents', title: '사회화 기관', conceptIds: ['socialization', 'agents-of-socialization', 'peer-group'] },
  { diagramId: 'mead', title: '미드의 자아 발달 단계', conceptIds: ['mead-stages', 'self', 'generalized-other'] },
  { diagramId: 'hidden', title: '잠재적 교육과정', conceptIds: ['hidden-curriculum'] },
  {
    diagramId: 'anticipatory_vs_resocialization',
    title: '예기 사회화와 재사회화',
    conceptIds: ['anticipatory-socialization', 'resocialization'],
  },
]

export function diagramsForConcept(conceptId) {
  return DIAGRAMS.filter((item) => item.conceptIds.includes(conceptId))
}

export function relationsFor(diagramId) {
  return LEXICON.relations.filter(
    (item) => item.isActive !== false && (item.diagramIds || []).includes(diagramId),
  )
}

/**
 * The nodes and edges of one diagram, in the order the lexicon lists them.
 *
 * Node identity is the Korean label, because that is what the lexicon joins
 * on: 사회화 appearing as the object of nine relations is one node, not nine.
 */
export function graphFor(diagramId) {
  const rows = relationsFor(diagramId)
  if (rows.length === 0) return null

  const seen = new Map()
  const add = (label) => {
    if (!seen.has(label)) seen.set(label, { id: label, label })
    return label
  }

  // Kinds, parts and examples are listed under the picture, so their nodes
  // never enter it — an example box would otherwise sit in the graph with
  // nothing structural attached to it.
  const listed = rows
    .filter((row) => isListed(row.relationType))
    .map((row) => ({
      relationId: row.id,
      type: row.relationType,
      subject: row.subjectKo,
      object: row.objectKo,
      text: `${row.subjectKo} — ${row.objectKo}${LIST_TAIL[row.relationType] || ''}`,
      lines: row.sourceLines || [],
    }))

  // Parts become rows inside their whole's box, so they are neither a line
  // nor a list item; the whole keeps its place in the graph.
  const parts = new Map()
  for (const row of rows.filter((row) => isPart(row.relationType))) {
    const into = parts.get(row.objectKo) || []
    into.push({ label: row.subjectKo, relationId: row.id, lines: row.sourceLines || [] })
    parts.set(row.objectKo, into)
  }

  const edges = rows
    .filter((row) => !isListed(row.relationType) && !isPart(row.relationType))
    .map((row) => ({
      from: add(row.subjectKo),
      to: add(row.objectKo),
      type: row.relationType,
      relationKo: row.relationKo,
      lines: row.sourceLines || [],
      relationId: row.id,
      note: row.semanticNote || '',
    }))

  // A whole with no other relation would otherwise never get a box.
  for (const whole of parts.keys()) add(whole)

  const meta = DIAGRAMS.find((item) => item.diagramId === diagramId)
  return {
    diagramId,
    title: meta?.title || diagramId,
    nodes: [...seen.values()].map((node) => ({ ...node, parts: parts.get(node.id) || [] })),
    edges,
    listed,
    lines: [...new Set(rows.flatMap((row) => row.sourceLines || []))].sort((a, b) => a - b),
    types: [...new Set(edges.map((edge) => edge.type))],
    listedTypes: [...new Set(listed.map((item) => item.type))],
  }
}

/** Plain sentences for a reader who cannot see the picture. */
export function describeGraph(graph) {
  const say = {
    IS_A: '의 한 종류예요',
    PART_OF: '의 한 부분이에요',
    EXAMPLE_OF: '의 사례예요',
    PRECEDES: '다음에 와요',
    CAUSES: '를 일으켜요',
    FACILITATES: '로 이어져요',
    DEFINED_AS: '로 설명돼요',
    CONTRASTS_WITH: '와 비교돼요',
  }
  const drawn = graph.edges.map((edge) => `${edge.from}은(는) ${edge.to}${say[edge.type] || '와 이어져요'}.`)
  const extra = (graph.listed || []).map((item) => `${item.subject}은(는) ${item.object}${say[item.type] || '와 이어져요'}.`)
  const inner = graph.nodes
    .filter((node) => node.parts?.length)
    .map((node) => `${node.label}은(는) ${node.parts.map((part) => part.label).join(', ')}(으)로 이루어져요.`)
  return [...drawn, ...inner, ...extra].join(' ')
}
