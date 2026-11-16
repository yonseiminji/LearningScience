// Catches the SideWing bug: a file uses a name another module exports but
// never imports it. esbuild happily bundles this — it only explodes in the
// browser, and only when that component renders.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '/home/claude/learningscience/src'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(js|jsx)$/.test(name)) out.push(full)
  }
  return out
}

const files = walk(ROOT)

// Every name exported anywhere in src.
const exported = new Map()
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    exported.set(match[1], file)
  }
  for (const match of text.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const piece of match[1].split(',')) {
      const name = piece.trim().split(/\s+as\s+/).pop()?.trim()
      if (name) exported.set(name, file)
    }
  }
}

const problems = []

for (const file of files) {
  const text = readFileSync(file, 'utf8')

  // Names this file brings in or defines itself.
  const known = new Set()
  for (const match of text.matchAll(/^import\s+([\s\S]*?)\s+from\s+/gm)) {
    for (const name of match[1].matchAll(/[A-Za-z_$][\w$]*/g)) known.add(name[0])
  }
  for (const match of text.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    known.add(match[1])
  }
  // Locals: destructuring, loop vars, inner functions, arrow consts.
  for (const match of text.matchAll(/(?:const|let|var|function)\s*\{?\s*([A-Za-z_$][\w$,:\s=]*)\}?/g)) {
    for (const name of match[1].matchAll(/[A-Za-z_$][\w$]*/g)) known.add(name[0])
  }
  // Parameters: `function f(a, { b })` and `(a, b) =>` and `a =>`.
  for (const match of text.matchAll(/function\s*[A-Za-z_$][\w$]*\s*\(([^)]*)\)/g)) {
    for (const name of match[1].matchAll(/[A-Za-z_$][\w$]*/g)) known.add(name[0])
  }
  for (const match of text.matchAll(/\(([^()]*)\)\s*=>/g)) {
    for (const name of match[1].matchAll(/[A-Za-z_$][\w$]*/g)) known.add(name[0])
  }
  for (const match of text.matchAll(/(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*=>/gm)) known.add(match[1])
  // Re-exports name the source: `export { formatSeoulSlot as formatSlotLabel }`.
  for (const match of text.matchAll(/([A-Za-z_$][\w$]*)\s+as\s+[A-Za-z_$][\w$]*/g)) known.add(match[1])

  // Strip strings and comments so we only look at code.
  const code = text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')

  for (const [name, source] of exported) {
    if (source === file || known.has(name)) continue
    // A bare identifier: not `.name`, not `name:`, not part of a hyphenated
    // JSX attribute like `data-cell`, and not an attribute position such as
    // `fill={...}` or `fill="..."`, where the name belongs to SVG or HTML
    // rather than to any module.
    const used = new RegExp(`(?<![-.\\w$])${name}(?![-\\w$:]|\\s*=\\s*[{"'])`).test(code)
    if (used) problems.push({ file: file.replace(ROOT, 'src'), name, source: source.replace(ROOT, 'src') })
  }
}

if (problems.length === 0) {
  console.log(`PASS  ${files.length}개 파일, import 누락 없음`)
} else {
  for (const problem of problems) {
    console.log(`FAIL  ${problem.file} 가 ${problem.name} 을 쓰는데 import 없음 (${problem.source} 에서 export)`)
  }
  process.exitCode = 1
}
