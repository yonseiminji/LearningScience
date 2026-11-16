// How each relation type is allowed to look.
//
// Mermaid draws every relation as the same arrow, which is why the lexicon's
// careful distinction between PRECEDES and CAUSES survives the data and dies
// at the picture. An arrowhead reads as "this produces that" whatever the
// label says, so only the types that genuinely mean a direction get one, and
// only CAUSES gets the emphatic one.
//
// Four families over eight types:
//   flow        something moves or follows      arrowhead
//   taxonomy    child points at its parent      hollow arrowhead, child→parent
//   descriptive a term and what it means        no arrowhead, the target is a note
//   symmetric   two things compared             no arrowhead, same row

export const FAMILY = {
  IS_A: 'taxonomy',
  PART_OF: 'taxonomy',
  EXAMPLE_OF: 'taxonomy',
  PRECEDES: 'flow',
  CAUSES: 'flow',
  FACILITATES: 'flow',
  DEFINED_AS: 'descriptive',
  CONTRASTS_WITH: 'symmetric',
}

export const STYLE = {
  // The label is a fallback. Each relation in the lexicon carries its own
  // Korean verb, and they differ inside a type: two of the three PRECEDES
  // links are 이어서 진행, while 게임 단계 → 일반화된 타자 이해 is 발달·이해 —
  // an attainment the stages arrive at, not a fourth stage after them. One
  // word per type flattened that away.
  PRECEDES: { dash: null, width: 1.6, head: 'solid', label: '순서', tone: 'ink' },
  // Reserved. The source review found no causal statement in Chapter 5, so
  // nothing uses this yet; it is defined so that a later relation which does
  // carry one is drawn as the exception it would be, not as another arrow.
  CAUSES: { dash: null, width: 2.4, head: 'solid', label: '원인', tone: 'ink' },
  FACILITATES: { dash: null, width: 1.3, head: 'solid', label: '기여', tone: 'ink' },
  DEFINED_AS: { dash: '2 3', width: 1.2, head: 'none', label: '다루는 것', tone: 'ink' },
  // Also reserved: the lexicon has no CONTRASTS_WITH row either. Drawn in red
  // so a contrast cannot be mistaken for one more step in the flow.
  CONTRASTS_WITH: { dash: '6 4', width: 1.5, head: 'none', label: '대조 (Contrasts with)', tone: 'warn' },
}

/**
 * Which relations become lines, and which become a list under the picture.
 *
 * A diagram of 잠재적 교육과정 that draws its three examples as boxes spends
 * most of its width on them, and they are the least structural thing in it:
 * an example illustrates a concept, it does not connect two concepts. The
 * same goes for a kind and a part. These read better as a line of text, which
 * also keeps the drawn graph down to what actually has a shape.
 */
export const LISTED = ['IS_A', 'EXAMPLE_OF']

export const LIST_PREFIX = {
  EXAMPLE_OF: 'Ex.',
  IS_A: 'Ex.',
}

export const LIST_TAIL = {
  EXAMPLE_OF: '의 사례',
  IS_A: '의 한 종류',
}

export function isListed(type) {
  return LISTED.includes(type)
}

/**
 * PART_OF is neither a line nor a list item: it is the inside of a box.
 *
 * 재사회화 is not next to 기존 행동을 버리는 과정 and it is not caused by it —
 * that process is part of what the word means. Drawn as rows under the
 * concept's own heading, the way an entity carries its fields, the whole and
 * its parts stay one thing on the page.
 */
export function isPart(type) {
  return type === 'PART_OF'
}

/**
 * What to write on one edge.
 *
 * The lexicon's own wording when it is short enough to sit on a line, and the
 * type's word when it is not. 협동·일과표 등 행동을 익히도록 사회화 is accurate
 * and unreadable at this size, so it goes in the tooltip instead.
 */
export const MAX_EDGE_LABEL = 8

export function edgeLabel(edge) {
  const own = String(edge.relationKo || '').trim()
  if (own && own.length <= MAX_EDGE_LABEL) return own
  return STYLE[edge.type]?.label || ''
}

/** A DEFINED_AS target is a gloss, not a concept, and is drawn as one. */
export function isNoteNode(nodeId, edges) {
  const incoming = edges.filter((edge) => edge.to === nodeId)
  return incoming.length > 0 && incoming.every((edge) => edge.type === 'DEFINED_AS')
}

/** Only directed types place one node below another. */
export function isDirected(type) {
  return FAMILY[type] !== 'symmetric'
}
