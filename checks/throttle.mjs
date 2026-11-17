import { readFileSync } from 'node:fs'
import { sharedStoreReady } from '/home/claude/learningscience/api/_lib/sharedLimit.js'
import { ApiError } from '/home/claude/learningscience/api/_lib/gemini.js'
import { TutorApiError } from '/home/claude/learningscience/src/services/tutorApi.js'

let pass = 0, fail = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)
const gem = readFileSync('/home/claude/learningscience/api/_lib/gemini.js','utf8')
const lim = readFileSync('/home/claude/learningscience/api/_lib/limit.js','utf8')
const api = readFileSync('/home/claude/learningscience/src/services/tutorApi.js','utf8')

console.log('\n[A] 재시도는 503 에만, 429 에는 절대')
ok('과부하 판정 함수가 있음', gem.includes('function isOverloaded'))
ok('429·RESOURCE_EXHAUSTED·quota 는 먼저 거름', /429\|RESOURCE_EXHAUSTED\|quota/.test(gem))
ok('503·UNAVAILABLE·overloaded 만 재시도', /503\|UNAVAILABLE\|overloaded/.test(gem))
ok('지연이 1s, 3s', gem.includes('RETRY_DELAYS_MS = [1000, 3000]'))
ok('jitter 가 붙음', gem.includes('Math.random() * 1000'))
ok('두 번까지만', gem.includes('attempt === RETRY_DELAYS_MS.length'))
ok('과부하는 503 으로 돌려줌', gem.includes("new ApiError(503"))

console.log('\n[B] 공유 리미터')
ok('외부 저장소 모듈이 있음', typeof sharedStoreReady === 'function')
is('환경변수 없으면 꺼짐', sharedStoreReady(), false)
// The budget and the slot moved out of limit.js and next to the model call:
// they guard the Gemini quota, and a request answered from the prompt cache
// spends none of it. Measured before the move -- thirty learners, every
// question already recorded, no call to Google, ten of them told to wait
// twenty seconds by the limiter protecting a quota nobody was using.
ok('전역 RPM 예산', gem.includes('GEMINI_RPM_BUDGET'))
ok('동시 실행 상한', gem.includes('GEMINI_CONCURRENCY'))
ok('예산을 모델 호출 직전에 잡음', gem.includes('await reserveModelCall('))
ok('호출이 끝나면 반납', gem.includes('await releaseModelCall(reservation)'))
ok('요청 도착 시점에는 공용 예산을 쓰지 않음',
  !lim.includes('GEMINI_RPM_BUDGET') && !lim.includes('takeSlot'))
// The ordering that makes it true: the cache is consulted, and returns,
// before anything is reserved.
ok('캐시 조회가 예약보다 먼저',
  gem.indexOf('await lookup(cacheKey(') < gem.indexOf('await reserveModelCall('))
ok('checkRate 가 비동기', lim.includes('export async function checkRate'))
ok('슬롯 반납 함수', lim.includes('export async function finishRate'))
ok('호출자별 제한도 남아 있음', lim.includes('function checkCallerRate'))

console.log('\n[C] 모든 핸들러가 슬롯을 잡고 반납한다')
for (const p of ['tutor/quiz','tutor/answer','tutor/support','tutor/explain','tutor/recall','planner/chunk']) {
  const t = readFileSync(`/home/claude/learningscience/api/${p}.js`,'utf8')
  ok(`${p}: await checkRate`, /const slot = await checkRate\(re/.test(t))
  ok(`${p}: finally 에서 반납`, t.includes('await finishRate(slot)'))
}

console.log('\n[D] 대기는 오류가 아니다')
ok('ApiError 가 meta 를 나름', gem.includes('constructor(status, message, detail, meta = null)'))
ok('응답 본문에 meta 가 실림', gem.includes('...meta'))
const waiting = new TutorApiError('앞에 3명이 기다리고 있어요.', 429, { retryAfterMs: 2500, ahead: 3 })
is('retryAfterMs 가 전달됨', waiting.retryAfterMs, 2500)
is('ahead 가 전달됨', waiting.ahead, 3)
ok('클라이언트가 기다렸다 다시 보냄', api.includes('await new Promise((resolve) => setTimeout(resolve, wait))'))
ok('대기 상한이 있음', api.includes('MAX_WAIT_MS'))

console.log('\n[E] 혼잡이 가짜 답으로 바뀌지 않는다')
// 503 used to mean 'no function here'; now it also means 'model busy'.
is('503 은 mock 폴백 대상이 아님', new TutorApiError('busy', 503).isUnavailable, false)
is('404 는 폴백 대상', new TutorApiError('gone', 404).isUnavailable, true)
is('0(연결 실패)도 폴백 대상', new TutorApiError('offline', 0).isUnavailable, true)
is('429 도 폴백 대상 아님', new TutorApiError('queue', 429).isUnavailable, false)

console.log('\n[F] 입력 상한')
const sup = readFileSync('/home/claude/learningscience/api/tutor/support.js','utf8')
ok('support 청크 3개 2400자', sup.includes('maxCount: 3, maxChars: 2400'))
ok('기본 상한도 축소', lim.includes('maxCount = 8, maxChars = 6000'))
const rec = readFileSync('/home/claude/learningscience/api/tutor/recall.js','utf8')
ok('recall 은 전사문을 보내지 않음', !/lectureChunks|retrievedChunks/.test(rec))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
