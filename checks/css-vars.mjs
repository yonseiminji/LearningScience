// Catches the black-box bug: a var() naming a token that does not exist.
//
// CSS fails silently and badly here. `fill: var(--card)` with no --card makes
// the whole declaration invalid, so fill falls back to its initial value —
// black — and the diagram's concept boxes came out as black rectangles while
// the note boxes beside them, which used a real token, looked fine.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/home/claude/learningscience/src'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (name.endsWith('.css')) out.push(full)
  }
  return out
}

const files = walk(ROOT)
const text = files.map((file) => readFileSync(file, 'utf8')).join('\n')

// Any token given a value anywhere counts as defined, including ones scoped to
// a single selector such as --plan-hour on .plan-grid-wrap.
const defined = new Set([...text.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]))

const problems = []
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, at) => {
      for (const match of line.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,)?/g)) {
        // A fallback makes a missing token harmless.
        if (match[2]) continue
        if (!defined.has(match[1])) {
          problems.push(`${file.replace(ROOT, 'src')}:${at + 1}  ${match[1]}  ${line.trim().slice(0, 60)}`)
        }
      }
    })
}

if (problems.length === 0) {
  console.log(`PASS  ${files.length}개 CSS 파일, 정의 없는 변수 없음 (토큰 ${defined.size}개)`)
} else {
  for (const problem of problems) console.log(`FAIL  ${problem}`)
  process.exitCode = 1
}
