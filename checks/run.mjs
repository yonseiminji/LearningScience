// Run every check in this folder.
//
//   node checks/run.mjs
//
// The suite had no single entry point, so it was run by hand, file by file —
// and two files had quietly rotted: one asserted a chunk cap that was
// deliberately lowered, the other crashed on a fixture that was never
// committed. Neither showed up until the whole folder was run at once.
//
// Each check is bundled to CJS first. Some of them import api/_lib, which
// reaches @google/genai, and that package's dynamic require does not survive
// ESM bundling.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const WORK = mkdtempSync(join(tmpdir(), 'checks-'))
const only = process.argv[2]

const files = readdirSync(HERE)
  .filter((name) => /\.(mjs|jsx)$/.test(name) && name !== 'run.mjs')
  .filter((name) => !only || name.includes(only))
  .sort()

let bad = 0
let asserts = 0

for (const name of files) {
  const out = join(WORK, `${name}.cjs`)
  try {
    execFileSync(
      'npx',
      ['esbuild', join(HERE, name), '--bundle', '--platform=node', '--format=cjs',
        `--outfile=${out}`, '--log-level=error', '--loader:.jsx=jsx', '--jsx=automatic'],
      { cwd: ROOT, stdio: 'pipe' },
    )
  } catch (error) {
    console.log(`  BUILD  ${name}`)
    console.log(String(error.stderr || '').split('\n').slice(0, 4).map((l) => `         ${l}`).join('\n'))
    bad += 1
    continue
  }

  try {
    const log = execFileSync('node', [out], { cwd: ROOT, stdio: 'pipe' }).toString()
    const count = Number(log.match(/(\d+) PASS/g)?.at(-1)?.match(/\d+/)?.[0] || 0)
    // Only the per-check lines, not a file's own summary echo of the count.
    const skipped = (log.match(/^ +SKIP\b/gm) || []).length
    asserts += count
    console.log(`  ok     ${name.padEnd(26)} ${count ? `${count} PASS` : '·'}${skipped ? ` / ${skipped} SKIP` : ''}`)
  } catch (error) {
    const log = `${error.stdout || ''}${error.stderr || ''}`
    console.log(`  FAIL   ${name}`)
    for (const line of log.split('\n').filter((l) => /FAIL|Error/.test(l)).slice(0, 5)) {
      console.log(`         ${line.trim()}`)
    }
    bad += 1
  }
}

console.log(`\n  파일 ${files.length}개 · 실패 ${bad}개 · 단정 ${asserts}개`)
process.exitCode = bad ? 1 : 0
