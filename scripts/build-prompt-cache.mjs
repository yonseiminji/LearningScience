// Generate the answers a demo will ask for, the night before.
//
//   GEMINI_API_KEY=… node scripts/build-prompt-cache.mjs
//
// Thirty people open one lecture and ask the same concepts the same four
// questions. Today that is one model call each, all inside seven minutes,
// against a key that returned 503 for half of forty-eight. Asking once now
// and committing the answers takes the whole of 개념 이해하기 off the wire.
//
// The run is the thing it is trying to avoid — a hundred-odd calls against
// the same key — so it goes one at a time with a pause between, writes after
// every success, and can be started again to pick up what did not land.
// Nothing is invented here: every entry is the model's own answer, recorded
// against the exact bytes it was asked.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT = resolve(ROOT, 'api/_lib/cache/entries.js')

const { generateJson, MODEL } = await import(resolve(ROOT, 'api/_lib/gemini.js'))
const { cacheKey } = await import(resolve(ROOT, 'api/_lib/promptCache.js'))
const { explainRequest } = await import(resolve(ROOT, 'api/tutor/explain.js'))
const { supportRequest } = await import(resolve(ROOT, 'api/tutor/support.js'))
const { SUPPORT_TYPES } = await import(resolve(ROOT, 'api/_lib/socialization.js'))
const KNOWLEDGE = (await import(resolve(ROOT, 'src/data/socialization_knowledge.js'))).default
const { createChunks } = await import(resolve(ROOT, 'src/utils/chunkSearch.js'))
const { conceptsInChunks } = await import(resolve(ROOT, 'src/utils/conceptSearch.js'))
const { buildCloze } = await import(resolve(ROOT, 'src/features/retrieval/cloze.js'))

const LECTURE = resolve(ROOT, 'docs/lectures/socialization_lecture1.txt')
const PAUSE_MS = Number(process.env.CACHE_PAUSE_MS || 2500)
const SUPPORT_KINDS = ['term', 'comparison', 'question']

const DRY_RUN = process.argv.includes('--dry-run')

// The model is part of the key, so recording against the wrong one produces a
// cache that is not wrong — just never read. Vercel sets GEMINI_MODEL; this
// asks for it out loud rather than falling back to the code's default, which
// is how a quietly useless cache gets committed.
if (!process.env.GEMINI_MODEL) {
  console.error(
    `GEMINI_MODEL 을 Vercel 과 똑같이 맞춰 주세요. 지금 기본값은 ${MODEL} 입니다.\n` +
      `  GEMINI_MODEL=<Vercel 에 설정한 이름> GEMINI_API_KEY=… node scripts/build-prompt-cache.mjs`,
  )
  process.exit(1)
}

if (!DRY_RUN && !process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY 가 없어요. 이 스크립트는 실제 API 를 부릅니다.')
  console.error('무엇을 물어볼지만 보려면: node scripts/build-prompt-cache.mjs --dry-run')
  process.exit(1)
}

console.log(`\n  모델 ${MODEL}${DRY_RUN ? '  (dry-run — 부르지 않습니다)' : ''}`)

// ── what to ask ───────────────────────────────────────────────────────────

const chunks = createChunks('cache', readFileSync(LECTURE, 'utf8'))
const found = conceptsInChunks(chunks)
const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]))
const jobs = []

for (const hit of found) {
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

// ── run, slowly, and keep what lands ──────────────────────────────────────

const entries = existsSync(OUT)
  ? (await import(`${OUT}?v=${Date.now()}`)).default
  : {}
const before = Object.keys(entries).length

// ── dry run: what would be asked, and does it hold together ───────────────

if (DRY_RUN) {
  const seen = new Map()
  const kinds = new Map()
  let empty = 0
  for (const job of jobs) {
    const kind = job.label.split(' ')[0]
    kinds.set(kind, (kinds.get(kind) || 0) + 1)
    if (!job.call?.systemInstruction?.trim() || !job.call?.prompt?.trim()) {
      empty += 1
      console.log(`  빈 프롬프트  ${job.label}`)
    }
    const key = cacheKey(job.call.systemInstruction, job.call.prompt, MODEL)
    if (seen.has(key)) console.log(`  키 충돌  ${job.label}  =  ${seen.get(key)}`)
    else seen.set(key, job.label)
  }
  const chars = jobs.reduce(
    (sum, job) => sum + (job.call.systemInstruction?.length || 0) + (job.call.prompt?.length || 0),
    0,
  )
  const have = [...seen.keys()].filter((key) => Object.hasOwn(entries, key)).length
  for (const [kind, count] of kinds) console.log(`  ${kind.padEnd(8)} ${count}건`)
  console.log(
    `\n  부를 것 ${jobs.length}건 · 서로 다른 질문 ${seen.size}개 · 이미 있음 ${have}개 · 빈 프롬프트 ${empty}개`,
  )
  console.log(
    `  입력 ${Math.round(chars / 1000)}k자 · ${PAUSE_MS}ms 간격이면 약 ${Math.ceil(
      ((jobs.length - have) * (PAUSE_MS + 1500)) / 60000,
    )}분`,
  )
  process.exit(empty || seen.size !== jobs.length ? 1 : 0)
}

function save() {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(
    OUT,
    `// Generated by scripts/build-prompt-cache.mjs — do not edit by hand.\n` +
      `// Each value is the model's own answer to the exact prompt its key hashes.\n` +
      `// Regenerate after changing any prompt: the keys will all have moved.\n\n` +
      `export default ${JSON.stringify(entries, null, 2)}\n`,
  )
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
let made = 0
let skipped = 0
const failed = []

for (const [index, job] of jobs.entries()) {
  const key = cacheKey(job.call.systemInstruction, job.call.prompt, MODEL)
  if (Object.hasOwn(entries, key)) {
    skipped += 1
    continue
  }
  const at = `${String(index + 1).padStart(3)}/${jobs.length}`
  try {
    // noCache, or it would read back what it is trying to write.
    entries[key] = await generateJson({ ...job.call, noCache: true })
    made += 1
    save()
    console.log(`  ${at}  ok    ${job.label}`)
  } catch (error) {
    failed.push(job.label)
    console.log(`  ${at}  fail  ${job.label}  ${String(error?.message || error).slice(0, 70)}`)
  }
  await sleep(PAUSE_MS)
}

save()
console.log(`\n  새로 만듦 ${made} · 이미 있음 ${skipped} · 실패 ${failed.length}`)
console.log(`  캐시 ${before} → ${Object.keys(entries).length}개`)
if (failed.length) {
  console.log('\n  실패한 것:')
  for (const label of failed) console.log(`    ${label}`)
  console.log('\n  다시 실행하면 실패한 것만 이어서 만듭니다.')
}
