// The list of questions the prompt cache is built from.
//
// Shared by build-prompt-cache.mjs and rekey-prompt-cache.mjs so the two
// cannot drift. They did once: the builder's job list lived inside the
// builder, and nothing else could reproduce it, which made a cache that had
// already cost 108 real calls impossible to repair without spending them
// again.
//
// Every call here goes through the handlers' own request builders, never a
// copy of their prompts. A copy would be a second prompt to keep in step, and
// the key covers the prompt, so drift would mean a cache nobody reads.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')

export const LECTURE = resolve(ROOT, 'docs/lectures/socialization_lecture1.txt')
export const SUPPORT_KINDS = ['term', 'comparison', 'question']

// The prefix the recorded chunk ids carry. It is arbitrary and no longer
// load-bearing: cacheKey flattens `<anything>-chunk-007` to its position
// before hashing, so a recording made under this prefix is read by a real
// upload under its own. It is kept stable anyway, so re-keying an older file
// can still reproduce the exact bytes that were hashed at the time.
export const RECORDING_PREFIX = 'cache'

export async function buildJobs() {
  const { SUPPORT_TYPES } = await import(resolve(ROOT, 'api/_lib/socialization.js'))
  const { explainRequest } = await import(resolve(ROOT, 'api/tutor/explain.js'))
  const { supportRequest } = await import(resolve(ROOT, 'api/tutor/support.js'))
  const { createChunks } = await import(resolve(ROOT, 'src/utils/chunkSearch.js'))
  const { conceptsInChunks } = await import(resolve(ROOT, 'src/utils/conceptSearch.js'))
  const { buildCloze } = await import(resolve(ROOT, 'src/features/retrieval/cloze.js'))

  const chunks = createChunks(RECORDING_PREFIX, readFileSync(LECTURE, 'utf8'))
  const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]))
  const jobs = []

  for (const hit of conceptsInChunks(chunks)) {
    const picked = hit.chunkIds.map((id) => byId.get(id)).filter(Boolean)
    for (const supportType of SUPPORT_TYPES) {
      const built = explainRequest({ conceptId: hit.conceptId, supportType, chunks: picked })
      if (built) jobs.push({ label: `explain ${hit.conceptId}/${supportType}`, call: built.call })
    }
  }

  // Support carries the learner's own answer in its prompt, so only the case
  // where they left the blank empty is reproducible — which is also the case
  // they are most likely to be in, since not knowing the word is why they are
  // asking. Anything they typed misses the cache and goes live.
  for (const item of buildCloze(chunks)) {
    const picked = [byId.get(item.chunkId)].filter(Boolean)
    for (const supportType of SUPPORT_KINDS) {
      jobs.push({
        label: `support ${item.conceptId}/${supportType}`,
        call: supportRequest({ supportType, questionText: item.text, chunks: picked }),
      })
    }
  }

  return jobs
}
