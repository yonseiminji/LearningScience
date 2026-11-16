import { readFileSync } from 'node:fs'
import { cacheKey, lookup, cacheSize } from '/home/claude/learningscience/api/_lib/promptCache.js'
import { explainRequest } from '/home/claude/learningscience/api/tutor/explain.js'
import { supportRequest } from '/home/claude/learningscience/api/tutor/support.js'
import { SUPPORT_TYPES } from '/home/claude/learningscience/api/_lib/socialization.js'
import { createChunks } from '/home/claude/learningscience/src/utils/chunkSearch.js'
import { conceptsInChunks } from '/home/claude/learningscience/src/utils/conceptSearch.js'
import { buildCloze } from '/home/claude/learningscience/src/features/retrieval/cloze.js'

let pass = 0, fail = 0
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

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
}
main()
