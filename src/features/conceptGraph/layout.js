// Where every box and line goes. Pure arithmetic: no React, no SVG, no DOM.
//
// These graphs are small — twelve nodes at the widest — so this does not need
// crossing minimisation or an iterative solver. Nodes are put in layers by how
// deep they sit, ordered within a layer the way the lexicon lists them, and
// spread evenly. Keeping the authored order makes the picture the same every
// time, which matters more here than a few fewer crossings: a learner who
// opens the same concept twice should see the same diagram.

import { isDirected, isNoteNode } from './relationStyle.js'

export const CHAR = 13 // approximate advance of one Hangul glyph at 13px
export const PAD_X = 12
export const PAD_Y = 9
export const LINE_H = 18
export const GAP_X = 18
export const GAP_Y = 54
export const MAX_LINE = 11 // characters before wrapping

/**
 * Break a label across lines without splitting a word.
 *
 * Labels here run to twenty-six characters — 학교생활에서 규칙·차례·행정 절차를
 * 배우는 경험 — and a box that wide pushes everything else off a phone screen.
 * Breaks go at spaces; a single long word is left alone rather than cut, since
 * a word split mid-syllable is harder to read than a wide box.
 */
export function wrap(label, max = MAX_LINE) {
  const words = String(label).split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']
  const lines = []
  let line = ''
  for (const word of words) {
    if (!line) line = word
    else if (line.length + 1 + word.length <= max) line += ` ${word}`
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * How deep each node sits.
 *
 * A node with nothing pointing at it starts at the top. Everything else sits
 * one below its deepest parent. Symmetric relations are left out: two things
 * being compared belong side by side, not one under the other.
 */
export function layerOf(nodeIds, edges) {
  const directed = edges.filter((edge) => isDirected(edge.type))
  const parents = new Map(nodeIds.map((id) => [id, []]))
  for (const edge of directed) parents.get(edge.to)?.push(edge.from)

  const depth = new Map(nodeIds.map((id) => [id, 0]))
  // Relaxation rather than a topological sort, so a cycle in the data costs a
  // wrong-looking diagram instead of an infinite loop.
  for (let pass = 0; pass < nodeIds.length; pass += 1) {
    let moved = false
    for (const id of nodeIds) {
      const mine = parents.get(id) || []
      if (mine.length === 0) continue
      const want = Math.max(...mine.map((from) => depth.get(from) ?? 0)) + 1
      if (want > (depth.get(id) ?? 0)) {
        depth.set(id, want)
        moved = true
      }
    }
    if (!moved) break
  }
  return depth
}

/** A chain reads better lying down; anything that branches does not. */
export function pickOrientation(nodeIds, edges) {
  const depth = layerOf(nodeIds, edges)
  const perLayer = new Map()
  for (const id of nodeIds) {
    const at = depth.get(id)
    perLayer.set(at, (perLayer.get(at) || 0) + 1)
  }
  return [...perLayer.values()].every((count) => count === 1) ? 'LR' : 'TB'
}

/**
 * @param {{id:string,label:string}[]} nodes
 * @param {{from:string,to:string,type:string}[]} edges
 */
export function layoutGraph(nodes, edges, { orientation } = {}) {
  const ids = nodes.map((node) => node.id)
  const depth = layerOf(ids, edges)
  const dir = orientation || pickOrientation(ids, edges)

  const boxes = new Map()
  for (const node of nodes) {
    const lines = wrap(node.label)
    const width = Math.max(...lines.map((line) => line.length)) * CHAR + PAD_X * 2
    boxes.set(node.id, {
      id: node.id,
      label: node.label,
      lines,
      note: isNoteNode(node.id, edges),
      w: Math.round(width),
      h: lines.length * LINE_H + PAD_Y * 2,
    })
  }

  // Group by layer, keeping the order the caller gave.
  const layers = []
  for (const node of nodes) {
    const at = depth.get(node.id)
    ;(layers[at] ||= []).push(boxes.get(node.id))
  }
  for (let at = 0; at < layers.length; at += 1) layers[at] ||= []

  let width = 0
  let height = 0
  if (dir === 'TB') {
    const rowWidths = layers.map((row) => row.reduce((sum, box) => sum + box.w, 0) + GAP_X * Math.max(0, row.length - 1))
    width = Math.max(...rowWidths, 1)
    let y = 0
    layers.forEach((row, at) => {
      const rowHeight = Math.max(...row.map((box) => box.h), 0)
      let x = (width - rowWidths[at]) / 2
      for (const box of row) {
        box.x = Math.round(x)
        box.y = Math.round(y + (rowHeight - box.h) / 2)
        x += box.w + GAP_X
      }
      y += rowHeight + GAP_Y
    })
    height = Math.max(0, y - GAP_Y)
  } else {
    const colHeights = layers.map((row) => row.reduce((sum, box) => sum + box.h, 0) + GAP_X * Math.max(0, row.length - 1))
    height = Math.max(...colHeights, 1)
    let x = 0
    layers.forEach((row, at) => {
      const colWidth = Math.max(...row.map((box) => box.w), 0)
      let y = (height - colHeights[at]) / 2
      for (const box of row) {
        box.x = Math.round(x + (colWidth - box.w) / 2)
        box.y = Math.round(y)
        y += box.h + GAP_X
      }
      x += colWidth + GAP_Y
    })
    width = Math.max(0, x - GAP_Y)
  }

  const placed = [...boxes.values()]
  const lines = edges.map((edge) => {
    const from = boxes.get(edge.from)
    const to = boxes.get(edge.to)
    if (!from || !to) return null
    const sameLayer = depth.get(edge.from) === depth.get(edge.to)
    // Side by side when they share a layer, otherwise edge to edge along the
    // direction the diagram runs.
    const a = sameLayer
      ? { x: from.x + from.w, y: from.y + from.h / 2 }
      : dir === 'TB'
        ? { x: from.x + from.w / 2, y: from.y + from.h }
        : { x: from.x + from.w, y: from.y + from.h / 2 }
    const b = sameLayer
      ? { x: to.x, y: to.y + to.h / 2 }
      : dir === 'TB'
        ? { x: to.x + to.w / 2, y: to.y }
        : { x: to.x, y: to.y + to.h / 2 }
    return { ...edge, a, b, sameLayer, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
  })

  return { orientation: dir, width: Math.round(width), height: Math.round(height), nodes: placed, edges: lines.filter(Boolean) }
}
