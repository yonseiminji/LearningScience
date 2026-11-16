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
  IS_A: { dash: null, width: 1.4, head: 'hollow', label: '한 종류' },
  PART_OF: { dash: null, width: 1.4, head: 'hollow', label: '부분' },
  EXAMPLE_OF: { dash: '5 4', width: 1.3, head: 'hollow', label: '예' },
  PRECEDES: { dash: null, width: 1.6, head: 'solid', label: '다음' },
  // Reserved. The source review found no causal statement in Chapter 5, so
  // nothing uses this yet; it is defined so that a later relation which does
  // carry one is drawn as the exception it would be, not as another arrow.
  CAUSES: { dash: null, width: 2.4, head: 'solid', label: '원인' },
  FACILITATES: { dash: null, width: 1.3, head: 'solid', label: '' },
  DEFINED_AS: { dash: '2 3', width: 1.2, head: 'none', label: '' },
  CONTRASTS_WITH: { dash: '6 4', width: 1.4, head: 'none', label: '비교' },
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
