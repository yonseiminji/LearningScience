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

import { createHash } from 'node:crypto'

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

export function cacheKey(systemInstruction, prompt) {
  return createHash('sha256')
    .update(`${systemInstruction ?? ''}\u0000${prompt ?? ''}`, 'utf8')
    .digest('hex')
    .slice(0, 24)
}

export async function lookup(key) {
  const all = await load()
  return Object.hasOwn(all, key) ? all[key] : null
}

export async function cacheSize() {
  return Object.keys(await load()).length
}
