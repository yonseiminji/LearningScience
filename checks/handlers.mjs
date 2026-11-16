// Call the handlers the way Vercel does, with a mock req/res.
//
// Everything else in this folder reads source files and asserts about their
// text. 740 such assertions were green while 사회화 -- the first concept in
// the chapter and the one in eleven of twelve chunks -- answered 413 for
// every support type, because the client sent eleven chunks and the handler
// capped at eight. No assertion about source text was ever going to catch
// that. This one calls the thing.
//
// GEMINI_API_KEY is cleared on purpose. Any request that misses the cache
// fails, so a pass here means the request really was served from the recorded
// answers, through the real validation, filtering and rate limiting.

import { readFileSync } from 'node:fs'

const R = '/home/claude/learningscience'

async function main() {
process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite'
delete process.env.GEMINI_API_KEY

const { createChunks } = await import(`${R}/src/utils/chunkSearch.js`)
const { conceptsInChunks } = await import(`${R}/src/utils/conceptSearch.js`)
const { buildCloze } = await import(`${R}/src/features/retrieval/cloze.js`)
const { SUPPORT_TYPES } = await import(`${R}/api/_lib/socialization.js`)
const { cacheSize } = await import(`${R}/api/_lib/promptCache.js`)
const explain = (await import(`${R}/api/tutor/explain.js`)).default
const support = (await import(`${R}/api/tutor/support.js`)).default
const quiz = (await import(`${R}/api/tutor/quiz.js`)).default

let pass = 0
let fail = 0
let skipped = 0
const is = (label, got, want) => {
  const ok = Object.is(got, want)
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
  ok ? (pass += 1) : (fail += 1)
}
const ok = (label, condition) => is(label, Boolean(condition), true)

// A fresh caller ip per call: the per-caller rate limit is real and this is
// not the thing under test.
let caller = 0
function call(handler, body) {
  caller += 1
  return new Promise((resolve) => {
    let code = 0
    const res = {
      status(value) { code = value; return res },
      setHeader() { return res },
      end(payload) { resolve({ code, body: JSON.parse(payload) }) },
    }
    handler({ method: 'POST', headers: { 'x-forwarded-for': `10.9.${caller % 250}.${(caller * 7) % 250}` }, body }, res)
  })
}

const wire = (list) => list.map(({ chunkId, text }) => ({ chunkId, text }))
const text = readFileSync(`${R}/docs/lectures/socialization_lecture1.txt`, 'utf8')
// Exactly what createLectureNote mints, so the chunk ids look like production.
const materialId = `note-${Date.now()}-1`
const chunks = createChunks(materialId, text)
const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]))

console.log('\n[A] 가드가 앱이 실제로 보내는 것을 거절하지 않는다')
// The regression. 사회화 is in eleven chunks and the client sends all of them.
const widest = conceptsInChunks(chunks).reduce((a, b) => (b.chunkIds.length > a.chunkIds.length ? b : a))
ok(`가장 넓은 개념이 8개를 넘김 (${widest.conceptId}, ${widest.chunkIds.length}개)`, widest.chunkIds.length > 8)
const widestChunks = widest.chunkIds.map((id) => byId.get(id)).filter(Boolean)
const r = await call(explain, {
  materialId, conceptId: widest.conceptId, supportType: 'simple', lectureChunks: wire(widestChunks),
})
is(`${widest.conceptId} 설명이 413 이 아님`, r.code, 200)
// The whole transcript selected for question generation, same class of bug.
const q = await call(quiz, { materialId, chunks: wire(chunks), questionTypes: ['blank'], questionCount: 3 })
ok(`전사문 ${chunks.length}개 전체로 문제 만들기가 413 이 아님`, q.code !== 413)
// And the bound still exists.
const flood = await call(explain, {
  materialId,
  conceptId: widest.conceptId,
  supportType: 'simple',
  lectureChunks: Array.from({ length: 60 }, (_, at) => ({ chunkId: `${materialId}-chunk-${String(at + 1).padStart(3, '0')}`, text: 'x' })),
})
is('그래도 상한은 남아 있음', flood.code, 413)

console.log('\n[B] 캐시만으로 108건이 끝까지 응답하는가')
if (!(await cacheSize())) {
  console.log('  SKIP  api/_lib/cache/entries.js 가 없어 건너뜀')
  skipped += 1
} else {
  let served = 0
  let total = 0
  let noSource = 0
  let unlabelled = 0
  const codes = new Map()
  for (const found of conceptsInChunks(chunks)) {
    const picked = found.chunkIds.map((id) => byId.get(id)).filter(Boolean)
    const sent = new Set(picked.map((item) => item.chunkId))
    for (const supportType of SUPPORT_TYPES) {
      total += 1
      const got = await call(explain, {
        materialId, conceptId: found.conceptId, supportType, lectureChunks: wire(picked),
      })
      codes.set(got.code, (codes.get(got.code) || 0) + 1)
      if (got.code !== 200) continue
      served += 1
      const sources = got.body.sourceChunkIds || []
      if (!sources.length || !sources.every((id) => sent.has(id))) noSource += 1
      // An invented example must never arrive looking like the lecture's own.
      if ((supportType === 'example' || supportType === 'analogy') && got.body.isGeneratedExample !== true) {
        unlabelled += 1
      }
    }
  }
  for (const item of buildCloze(chunks)) {
    for (const supportType of ['term', 'comparison', 'question']) {
      total += 1
      const got = await call(support, {
        supportType, questionText: item.text, questionId: item.conceptId,
        retrievedChunks: wire([byId.get(item.chunkId)].filter(Boolean)),
      })
      codes.set(got.code, (codes.get(got.code) || 0) + 1)
      if (got.code === 200 && typeof got.body.response === 'string' && got.body.response.length > 20) served += 1
    }
  }
  is('108건 전부 200', served, total)
  is('응답 코드 200 외 없음', [...codes.keys()].filter((code) => code !== 200).length, 0)
  is('출처 없이 도착한 답 없음', noSource, 0)
  is('생성 예시가 표시되지 않은 답 없음', unlabelled, 0)
  is('캐시 엔트리 수', await cacheSize(), 108)
}

console.log('\n[C] 정의는 지식베이스에서 오고, 모델이 쓰지 않는다')
const one = await call(explain, {
  materialId, conceptId: 'socialization', supportType: 'simple', lectureChunks: wire(widestChunks),
})
const KNOWLEDGE = (await import(`${R}/src/data/socialization_knowledge.js`)).default
const concept = KNOWLEDGE.concepts.find((item) => item.conceptId === 'socialization')
is('정의가 지식베이스와 글자까지 같음', one.body.definitionKo, concept.definitionKo)
ok('출처 라벨에 쪽수가 없음', !/\bpp?\.\s*\d/.test(JSON.stringify(one.body)))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL${skipped ? ` / ${skipped} SKIP` : ''}`)
process.exitCode = fail ? 1 : 0
}

main()
