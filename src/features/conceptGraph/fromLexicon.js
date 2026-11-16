// Turning the relation lexicon into something drawable.
//
// Nothing is invented here. A node exists because a relation names it, an edge
// exists because the lexicon has that row, and the row carries the page it
// came from. Where the lexicon is silent the picture is silent too — most
// visibly in 미드의 자아 발달 단계, where the source review recorded 준비→놀이
// and 게임→일반화된 타자 but no 놀이→게임, so the chain is drawn with that
// link missing rather than closed on our say-so.

import LEXICON from '../../data/socialization_relations.js'
import { LIST_TAIL, isListed } from './relationStyle.js'

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
  return LEXICON.relations.filter((item) => (item.diagramIds || []).includes(diagramId))
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
      pages: row.sourcePages || [],
    }))

  const edges = rows
    .filter((row) => !isListed(row.relationType))
    .map((row) => ({
      from: add(row.subjectKo),
      to: add(row.objectKo),
      type: row.relationType,
      relationKo: row.relationKo,
      pages: row.sourcePages || [],
      relationId: row.id,
      note: row.semanticNote || '',
    }))

  const meta = DIAGRAMS.find((item) => item.diagramId === diagramId)
  return {
    diagramId,
    title: meta?.title || diagramId,
    nodes: [...seen.values()],
    edges,
    listed,
    pages: [...new Set(rows.flatMap((row) => row.sourcePages || []))].sort((a, b) => a - b),
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
  return [...drawn, ...extra].join(' ')
}
