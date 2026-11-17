// What thirty people at once actually get.
//
// The shared budget and the concurrency slot are skipped when no store is
// configured, which is every local run, so this stands one up. Without it the
// limiter is invisible here and visible only in the deployment, which is the
// worst place to find out what it does.

import { readFileSync } from 'node:fs'
import { startFakeUpstash } from './_fakeUpstash.mjs'

const R = '/home/claude/learningscience'

async function main() {
  const fake = await startFakeUpstash()
  process.env.UPSTASH_REDIS_REST_URL = fake.url
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test'
  process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite'
  process.env.GEMINI_RPM_BUDGET = '20'
  process.env.GEMINI_CONCURRENCY = '5'
  delete process.env.GEMINI_API_KEY

  const { createChunks } = await import(`${R}/src/utils/chunkSearch.js`)
  const { conceptsInChunks } = await import(`${R}/src/utils/conceptSearch.js`)
  const { sharedStoreReady } = await import(`${R}/api/_lib/sharedLimit.js`)
  const { cacheSize } = await import(`${R}/api/_lib/promptCache.js`)
  const explain = (await import(`${R}/api/tutor/explain.js`)).default

  let pass = 0
  let fail = 0
  let skipped = 0
  const is = (label, got, want) => {
    const good = Object.is(got, want)
    console.log(`  ${good ? 'PASS' : 'FAIL'}  ${label}${good ? '' : `  → got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`}`)
    good ? (pass += 1) : (fail += 1)
  }
  const ok = (label, condition) => is(label, Boolean(condition), true)

  const text = readFileSync(`${R}/docs/lectures/socialization_lecture1.txt`, 'utf8')
  const materialId = `note-${Date.now()}-1`
  const chunks = createChunks(materialId, text)
  const byId = new Map(chunks.map((chunk) => [chunk.chunkId, chunk]))
  const found = conceptsInChunks(chunks).find((item) => item.conceptId === 'socialization')
  const wire = found.chunkIds.map((id) => byId.get(id)).filter(Boolean)
    .map(({ chunkId, text: body }) => ({ chunkId, text: body }))

  const call = (ip, supportType, userQuestion = '') => new Promise((resolve) => {
    let code = 0
    const res = {
      status(value) { code = value; return res },
      setHeader() { return res },
      end(payload) { resolve({ code, body: JSON.parse(payload) }) },
    }
    explain({
      method: 'POST', headers: { 'x-forwarded-for': ip },
      body: { materialId, conceptId: 'socialization', supportType, userQuestion, lectureChunks: wire },
    }, res)
  })

  console.log('\n[A] 공용 저장소가 실제로 붙어 있는 상태')
  ok('가짜 Upstash 연결됨', await sharedStoreReady())

  console.log('\n[B] 30명이 캐시에 있는 질문을 한꺼번에')
  if (!(await cacheSize())) {
    console.log('  SKIP  캐시가 비어 있어 건너뜀')
    skipped += 1
  } else {
    const kinds = ['simple', 'example', 'analogy', 'comparison']
    const served = await Promise.all(
      Array.from({ length: 30 }, (_, at) => call(`198.51.100.${at + 1}`, kinds[at % 4])),
    )
    // The budget exists to protect the Gemini quota. These spend none of it,
    // so none of them may be turned away: before this was fixed, ten were.
    is('30명 전원 응답', served.filter((item) => item.code === 200).length, 30)
    is('대기 메시지를 받은 사람 없음', served.filter((item) => item.code === 429).length, 0)
    await new Promise((resolve) => { setTimeout(resolve, 300) })
    is('분당 예산을 한 번도 쓰지 않음', [...fake.store.keys()].filter((key) => key.startsWith('rpm:')).length, 0)
    is('슬롯도 쓰지 않음', fake.store.get('slots:gemini') ?? 0, 0)
  }

  console.log('\n[C] 캐시에 없는 질문이면 그대로 제한된다')
  // Same thirty, each asking something nobody recorded. Here the quota is
  // real, so the limiter has to bite -- and say how long to wait.
  process.env.GEMINI_API_KEY = 'not-a-real-key'
  const live = await Promise.all(
    Array.from({ length: 30 }, (_, at) => call(`203.0.113.${at + 1}`, 'simple', `물어볼 것 ${at}`)),
  )
  const turned = live.filter((item) => item.code === 429)
  is('예산만큼만 통과', live.length - turned.length, 20)
  is('나머지는 기다리라고 안내', turned.length, 10)
  ok('언제 다시 할지 알려 줌', turned.every((item) => Number(item.body.retryAfterMs) > 0))
  ok('부정적인 표현을 쓰지 않음', turned.every((item) => !/실패|지연|오류/.test(item.body.error)))
  await new Promise((resolve) => { setTimeout(resolve, 500) })
  is('슬롯이 모두 반납됨', fake.store.get('slots:gemini') ?? 0, 0)

  fake.close()
  console.log(`\n요약: ${pass} PASS / ${fail} FAIL${skipped ? ` / ${skipped} SKIP` : ''}`)
  process.exit(fail ? 1 : 0)
}

main()
