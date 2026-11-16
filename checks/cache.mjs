import { readFileSync } from 'node:fs'
import {
  cacheKey,
  cacheSize,
  flattenChunkIds,
  lookup,
  rehydrateChunkIds,
} from '/home/claude/learningscience/api/_lib/promptCache.js'
import { explainRequest } from '/home/claude/learningscience/api/tutor/explain.js'
import { supportRequest } from '/home/claude/learningscience/api/tutor/support.js'
import { SUPPORT_TYPES } from '/home/claude/learningscience/api/_lib/socialization.js'
import { createChunks } from '/home/claude/learningscience/src/utils/chunkSearch.js'
import { conceptsInChunks } from '/home/claude/learningscience/src/utils/conceptSearch.js'
import { buildCloze } from '/home/claude/learningscience/src/features/retrieval/cloze.js'

let pass = 0, fail = 0, skipped = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)

const chunks = createChunks('c', readFileSync('/home/claude/learningscience/docs/lectures/socialization_lecture1.txt','utf8'))
const byId = new Map(chunks.map(c => [c.chunkId, c]))
const found = conceptsInChunks(chunks)

async function main() {
console.log('\n[A] 키는 보낸 것 전체를 담는다')
const a = cacheKey('sys', 'prompt')
is('같은 입력 → 같은 키', cacheKey('sys', 'prompt'), a)
ok('시스템 지시문이 바뀌면 키가 바뀜', cacheKey('sys!', 'prompt') !== a)
ok('프롬프트가 바뀌면 키가 바뀜', cacheKey('sys', 'prompt!') !== a)
// The two halves must not be able to swap: 'ab'+'c' and 'a'+'bc' are
// different questions and must not share an answer.
ok('경계가 섞이지 않음', cacheKey('ab', 'c') !== cacheKey('a', 'bc'))
is('키 길이', a.length, 24)
// A recorded answer belongs to the model that gave it. Serving one Flash
// model's answer while another is deployed is a provenance hole nothing on
// the screen would show, so the model name is part of the key.
ok('모델이 바뀌면 키가 바뀜', cacheKey('sys', 'prompt', 'm1') !== cacheKey('sys', 'prompt', 'm2'))
is('같은 모델 → 같은 키', cacheKey('sys', 'prompt', 'm1'), cacheKey('sys', 'prompt', 'm1'))
ok('모델 경계도 섞이지 않음', cacheKey('b', 'c', 'a') !== cacheKey('', 'c', 'ab'))

console.log('\n[B] 캐시가 없어도 동작한다')
is('빈 캐시에서 조회', await lookup('없는키'), null)
ok('크기를 셀 수 있음', typeof (await cacheSize()) === 'number')

console.log('\n[C] 핸들러와 빌드가 같은 질문을 만든다')
// If these drifted the cache would never hit, so the builder uses the
// handler's own assembly rather than rebuilding the prompt.
const hit = found[0]
const picked = hit.chunkIds.map(id => byId.get(id)).filter(Boolean)
const one = explainRequest({ conceptId: hit.conceptId, supportType: 'simple', chunks: picked })
ok('explainRequest 가 call 을 돌려줌', one?.call?.systemInstruction && one?.call?.prompt)
is('두 번 불러도 같은 키', cacheKey(one.call.systemInstruction, one.call.prompt),
   cacheKey(explainRequest({ conceptId: hit.conceptId, supportType: 'simple', chunks: picked }).call.systemInstruction,
            explainRequest({ conceptId: hit.conceptId, supportType: 'simple', chunks: picked }).call.prompt))
ok('없는 개념이면 null', explainRequest({ conceptId: 'nope', supportType: 'simple', chunks: picked }) === null)
const sup = supportRequest({ supportType: 'term', questionText: '문제', chunks: picked })
ok('supportRequest 가 call 을 돌려줌', sup.systemInstruction && sup.prompt)
ok('답을 안 쓰면 (답하지 않음)', sup.prompt.includes('(답하지 않음)'))
ok('답을 쓰면 그 답이 들어감', supportRequest({ supportType: 'term', questionText: '문제', chunks: picked, userAnswer: '사회화' }).prompt.includes('사회화'))

console.log('\n[D] 지원 유형마다 다른 질문이다')
const keys = new Set(SUPPORT_TYPES.map(t => {
  const b = explainRequest({ conceptId: hit.conceptId, supportType: t, chunks: picked })
  return cacheKey(b.call.systemInstruction, b.call.prompt)
}))
is('유형 4개가 서로 다른 키', keys.size, SUPPORT_TYPES.length)

console.log('\n[E] 계획이 결정적이다')
function plan() {
  const out = []
  for (const h of conceptsInChunks(chunks)) {
    const p = h.chunkIds.map(id => byId.get(id)).filter(Boolean)
    for (const t of SUPPORT_TYPES) {
      const b = explainRequest({ conceptId: h.conceptId, supportType: t, chunks: p })
      if (b) out.push(cacheKey(b.call.systemInstruction, b.call.prompt))
    }
  }
  for (const item of buildCloze(chunks)) {
    const p = [byId.get(item.chunkId)].filter(Boolean)
    for (const t of ['term','comparison','question']) {
      const c = supportRequest({ supportType: t, questionText: item.text, chunks: p })
      out.push(cacheKey(c.systemInstruction, c.prompt))
    }
  }
  return out
}
const first = plan()
is('explain 84 + support 24', first.length, 108)
is('키 중복 없음', new Set(first).size, first.length)
is('두 번 세워도 같은 계획', plan().join(), first.join())

console.log('\n[F] 캐시를 읽는 곳이 한 군데다')
const gem = readFileSync('/home/claude/learningscience/api/_lib/gemini.js','utf8')
ok('generateJson 안에서 조회', gem.includes('await lookup(cacheKey(systemInstruction, prompt, model))'))
ok('빌드는 noCache 로 우회', gem.includes('noCache = false'))
const script = readFileSync('/home/claude/learningscience/scripts/build-prompt-cache.mjs','utf8')
ok('빌드가 noCache: true 를 씀', script.includes('noCache: true'))
ok('성공할 때마다 저장', script.includes('save()'))
ok('이미 있는 키는 건너뜀', script.includes('Object.hasOwn(entries, key)'))
ok('호출 사이에 쉼', script.includes('await sleep(PAUSE_MS)'))
ok('키가 없으면 실행 거부', script.includes('GEMINI_API_KEY 가 없어요'))
// Recording against the code default while Vercel runs something else builds
// a cache that is never read, and says nothing. Make it ask.
ok('모델을 밝히지 않으면 실행 거부', script.includes("if (!process.env.GEMINI_MODEL)"))
ok('키에 모델을 넣고 기록', script.includes('cacheKey(job.call.systemInstruction, job.call.prompt, MODEL)'))
ok('--dry-run 으로 호출 없이 점검', script.includes("process.argv.includes('--dry-run')"))


console.log('\n[E] 업로드 id 는 질문의 일부가 아니다')
// The bug this exists for: chunk ids are `<fileId>-chunk-007` and fileId is
// minted per upload, so 108 recorded answers were keyed to a prefix no real
// request would ever carry. The cache was complete and unreachable.
is('업로드 접두사를 자리번호로 평탄화',
  flattenChunkIds('(note-1763-7-chunk-003) 본문 cache-chunk-003'), '(chunk-003) 본문 chunk-003')
is('세 자리가 아니면 건드리지 않음', flattenChunkIds('chunk-7 과 x-chunk-12'), 'chunk-7 과 x-chunk-12')
is('업로드 id 가 달라도 같은 키',
  cacheKey('s', '(note-1-1-chunk-001) 본문', 'm'), cacheKey('s', '(note-9-9-chunk-001) 본문', 'm'))
ok('본문이 다르면 다른 키',
  cacheKey('s', '(note-1-1-chunk-001) 본문', 'm') !== cacheKey('s', '(note-1-1-chunk-001) 다른 본문', 'm'))
ok('자리번호가 다르면 다른 키',
  cacheKey('s', '(note-1-1-chunk-001) 본문', 'm') !== cacheKey('s', '(note-1-1-chunk-002) 본문', 'm'))

console.log('\n[F] 적중한 답의 출처는 이 요청의 청크를 가리킨다')
// A hit recorded under one prefix carries that prefix in sourceChunkIds, and
// the handler filters source ids against what it sent — so without remapping
// every cached answer would arrive with no sources at all.
is('자리번호로 되돌림',
  rehydrateChunkIds({ ids: ['cache-chunk-002'] }, ['note-7-1-chunk-002']).ids[0],
  'note-7-1-chunk-002')
is('중첩된 곳도 되돌림',
  rehydrateChunkIds({ a: [{ b: 'cache-chunk-001' }] }, ['note-7-1-chunk-001']).a[0].b,
  'note-7-1-chunk-001')
// The cache must not be able to widen what counts as a source: an id with no
// counterpart in this request is left alone so the handler's filter drops it.
is('짝이 없는 id 는 그대로 둬서 핸들러가 버리게',
  rehydrateChunkIds({ ids: ['cache-chunk-009'] }, ['note-7-1-chunk-001']).ids[0], 'cache-chunk-009')
is('청크를 안 보낸 요청은 손대지 않음',
  rehydrateChunkIds({ ids: ['cache-chunk-002'] }, []).ids[0], 'cache-chunk-002')

console.log('\n[G] 실제 캐시가 실제 요청에 적중하는가')
const built = await cacheSize()
if (!built) {
  console.log('  SKIP  api/_lib/cache/entries.js 가 없어 건너뜀 (전부 실시간)')
  skipped += 1
} else {
  const text = readFileSync('/home/claude/learningscience/docs/lectures/socialization_lecture1.txt', 'utf8')
  const MODEL = 'gemini-3.5-flash-lite'
  const chunks = createChunks('note-1763300000000-7', text)
  const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]))
  let hits = 0
  let total = 0
  let sourcesLost = 0
  for (const found of conceptsInChunks(chunks)) {
    const picked = found.chunkIds.map((id) => byId.get(id)).filter(Boolean)
    for (const supportType of SUPPORT_TYPES) {
      const { call, kept } = explainRequest({ conceptId: found.conceptId, supportType, chunks: picked })
      total += 1
      const raw = await lookup(cacheKey(call.systemInstruction, call.prompt, MODEL))
      if (!raw) continue
      hits += 1
      const sent = new Set(kept.map((item) => item.chunkId))
      const hit = rehydrateChunkIds(raw, call.chunkIds)
      // Exactly the filter api/tutor/explain.js applies to a live answer.
      if ((hit.sourceChunkIds || []).filter((id) => sent.has(id)).length === 0) sourcesLost += 1
    }
  }
  is('업로드 모양의 요청이 전부 적중', hits, total)
  is('출처를 잃은 답 없음', sourcesLost, 0)
  // Same question, byte-identical prompt, different upload: the point of [E].
  const other = createChunks('note-9999-42', text)
  const otherById = new Map(other.map((chunk) => [chunk.chunkId, chunk]))
  const sameFound = conceptsInChunks(other).find((item) => item.conceptId === 'socialization')
  const samePicked = sameFound.chunkIds.map((id) => otherById.get(id)).filter(Boolean)
  const same = explainRequest({ conceptId: 'socialization', supportType: 'simple', chunks: samePicked })
  ok('또 다른 업로드도 적중', Boolean(await lookup(cacheKey(same.call.systemInstruction, same.call.prompt, MODEL))))
  // And the property that matters more: a changed transcript must not hit.
  const edited = createChunks('note-1-1', text.replace('사회화는 단순히', '사회화는 결코 단순히'))
  const editedById = new Map(edited.map((chunk) => [chunk.chunkId, chunk]))
  const editedFound = conceptsInChunks(edited).find((item) => item.conceptId === 'socialization')
  const editedPicked = editedFound.chunkIds.map((id) => editedById.get(id)).filter(Boolean)
  const changed = explainRequest({ conceptId: 'socialization', supportType: 'simple', chunks: editedPicked })
  ok('한 글자만 고친 전사문은 적중하지 않음',
    !(await lookup(cacheKey(changed.call.systemInstruction, changed.call.prompt, MODEL))))
}

console.log('\n[H] 핸들러가 보낸 청크를 밝힌다')
// generateJson cannot remap what it is not told about.
ok('explain 이 chunkIds 를 넘김',
  readFileSync('/home/claude/learningscience/api/tutor/explain.js', 'utf8')
    .includes('chunkIds: kept.map((item) => item.chunkId)'))
ok('support 가 chunkIds 를 넘김',
  readFileSync('/home/claude/learningscience/api/tutor/support.js', 'utf8')
    .includes('chunkIds: chunks.map((chunk) => chunk.chunkId)'))
ok('적중한 값을 되돌려서 반환',
  readFileSync('/home/claude/learningscience/api/_lib/gemini.js', 'utf8')
    .includes('return rehydrateChunkIds(hit, chunkIds)'))
ok('작업 목록은 공유 모듈에서 온다', script.includes('await buildJobs()'))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL${skipped ? ` / ${skipped} SKIP` : ''}`)
process.exitCode = fail ? 1 : 0
}
main()
