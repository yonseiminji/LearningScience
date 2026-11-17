// Minimal Upstash REST stand-in: INCR / DECR / EXPIRE / SET over GET paths.
//
// The shared limiter is skipped entirely when no store is configured, so
// without this a local run shows thirty learners all served and proves
// nothing about the deployment, where the store is configured and the
// limiter is the thing that decides who waits.
import { createServer } from 'node:http'
const store = new Map()
export function startFakeUpstash() {
  const server = createServer((req, res) => {
    const parts = decodeURIComponent(req.url).slice(1).split('/')
    const [cmd, key, value] = parts
    let result = null
    if (cmd === 'INCR') result = store.set(key, (store.get(key) || 0) + 1).get(key)
    else if (cmd === 'DECR') result = store.set(key, (store.get(key) || 0) - 1).get(key)
    else if (cmd === 'SET') result = (store.set(key, Number(value)), 'OK')
    else if (cmd === 'EXPIRE') result = 1
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ result }))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => {
    resolve({ url: `http://127.0.0.1:${server.address().port}`, store, close: () => server.close() })
  }))
}
