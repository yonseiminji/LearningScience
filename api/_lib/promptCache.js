// Answers already generated for exactly this input.
//
// Thirty people open the same lecture and ask the same concept the same
// question, and today that is thirty identical calls. The cache is what the
// model said the first time, recorded against the whole of what it was sent.
//
// Not the mock. A mock is content written in advance that stands in for an
// answer nobody asked for; this is the model's own answer to this exact
// question, served again. The distinction only holds if the key covers the
// entire input, so it is a hash of the system instruction and the prompt
// together — no field list to keep in step, and no way to serve the answer to
// a nearly-identical question. Change a word of either and every key changes,
// which turns a stale cache into a cold one rather than a lying one.
//
// The model name is part of the key for the same reason. An answer recorded
// from one Flash model and served while another is deployed is still a real
// answer, but not the deployed model's answer, and nothing on the screen
// would say so. Keyed this way, a model swap empties the cache instead of
// quietly changing who is speaking.
//
// One thing is deliberately NOT in the key: which upload the chunks came
// from. Chunk ids are `<fileId>-chunk-007`, and fileId is minted per upload,
// so the same transcript asked the same question produced a different key
// every time and the cache was never read once. The chunk text is hashed, in
// order; the upload's name is a label on it, not part of the question. Ids
// are flattened to their position before hashing, and a hit's ids are mapped
// back to the live ones by that same position.

import { createHash } from 'node:crypto'

// `note-1763-4-chunk-007` and `cache-chunk-007` both become `chunk-007`.
// Numbering is derived from the text, so identical text always numbers
// identically -- and different text changes the hashed chunk bodies, so a key
// cannot match across two different transcripts.
const CHUNK_ID = /\b[A-Za-z0-9_-]*chunk-(\d{3})\b/g

export function flattenChunkIds(text) {
  return String(text ?? '').replace(CHUNK_ID, 'chunk-$1')
}

// Map a cached answer's chunk ids onto the ids this request actually sent.
// Positional and mechanical: `*-chunk-007` becomes whichever live id ends in
// 007. An id with no live counterpart is left as it is, so the handler's own
// filter drops it -- the cache must not be able to widen what counts as a
// source.
export function rehydrateChunkIds(value, chunkIds = []) {
  if (!chunkIds.length) return value
  const byPosition = new Map(
    chunkIds.map((id) => [String(id).match(/chunk-(\d{3})\b/)?.[1], id]).filter(([at]) => at),
  )
  const walk = (node) => {
    if (typeof node === 'string') {
      return node.replace(CHUNK_ID, (whole, at) => byPosition.get(at) ?? whole)
    }
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      return Object.fromEntries(Object.entries(node).map(([key, item]) => [key, walk(item)]))
    }
    return node
  }
  return walk(value)
}

let entries = null

async function load() {
  if (entries) return entries
  try {
    const mod = await import('./cache/entries.js')
    entries = mod.default || {}
  } catch {
    // No cache built yet, which is a normal state: every call goes live.
    entries = {}
  }
  return entries
}

export function cacheKey(systemInstruction, prompt, model) {
  const parts = [model ?? '', flattenChunkIds(systemInstruction), flattenChunkIds(prompt)]
  return createHash('sha256').update(parts.join('\u0000'), 'utf8').digest('hex').slice(0, 24)
}

export async function lookup(key) {
  const all = await load()
  return Object.hasOwn(all, key) ? all[key] : null
}

export async function cacheSize() {
  return Object.keys(await load()).length
}
