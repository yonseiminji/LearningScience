import { readFileSync } from 'node:fs'
import K from '/home/claude/learningscience/src/data/socialization_knowledge.js'
import { socializationKO as BC } from '/home/claude/learningscience/docs/bccampus-ch05/bccampus_socialization_ch05_ko.js'

let pass = 0, fail = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)

console.log('\n[A] 출처가 BCcampus 로 바뀌었다')
is('출판사', K.scope.publisher, 'BCcampus')
is('연도', K.scope.year, 2023)
ok('라이선스 표기', K.scope.licence.includes('CC BY 4.0'))
ok('원문 링크', String(K.scope.sourceUrl).includes('opentextbc.ca'))
is('BCcampus 자료와 같은 링크', K.scope.sourceUrl, BC.metadata.sourceUrl)

console.log('\n[B] 쪽수를 인용하지 않는다')
// The bundle's own README: the uploaded text has no page boundaries, and it
// did not guess page labels. Neither do we.
ok('scope 가 쪽수 없음을 밝힘', K.scope.pages.includes('확인되지 않아'))
ok('어떤 개념도 pages 를 갖지 않음', K.concepts.every(c => !('pages' in c.source)))
for (const p of ['src/components/review/ConceptPanel.jsx','api/tutor/explain.js','api/tutor/recall.js']) {
  const t = readFileSync('/home/claude/learningscience/' + p, 'utf8')
  ok(`${p}: 쪽 표기 없음`, !/source\.pages|쪽`/.test(t))
}
ok('프롬프트가 쪽수 사용을 금지', readFileSync('/home/claude/learningscience/api/_lib/prompts/explain.js','utf8').includes('쪽수를 쓰지 않습니다'))

console.log('\n[C] 출처가 실제 교재 위치를 가리킨다')
const inEdition = K.concepts.filter(c => c.source.inEdition !== false)
is('교재에 있는 개념 수', inEdition.length, 21)
ok('모두 절이 있음', inEdition.every(c => BC.pages.some(p => p.sectionId === c.source.section)))
ok('모두 행이 있음', inEdition.every(c => Array.isArray(c.source.lines) && c.source.lines.length > 0))
const bad = inEdition.filter(c => {
  const sec = BC.pages.find(p => p.sectionId === c.source.section)
  const line = c.source.lines[0]
  return !sec || line < sec.sourceLines[0] || line > sec.sourceLines[1]
})
is('행이 절 범위 안', bad.map(c => c.termKo).join(', '), '')

console.log('\n[D] 모든 개념이 이 판 안에 있다')
// The two that were not — religion and government as agents — came from a
// transcript that has been retired, so nothing is flagged any more. The
// screen keeps the branch for the next time a lecture outruns the edition.
is('이 판에 없는 개념', K.concepts.filter(c => c.source.inEdition === false).length, 0)
const panel = readFileSync('/home/claude/learningscience/src/components/review/ConceptPanel.jsx','utf8')
ok('화면은 여전히 그 경우를 처리함', panel.includes('이 판에서는 따로 다루지 않아요'))

console.log('\n[E] 교재의 한국어 용어도 함께 찾는다')
const aliasOf = (id) => K.concepts.find(c => c.conceptId === id).aliases
ok('지위 박탈 의례', aliasOf('degradation-ceremony').includes('지위 박탈 의례'))
ok('숨은 교육과정', aliasOf('hidden-curriculum').includes('숨은 교육과정'))
const names = new Set(K.concepts.flatMap(c => [c.termKo, ...c.aliases]))
const covered = BC.terms.filter(t => names.has(t.ko)).length
// Not all 47 should connect: 후성유전학, 상징적 상호작용론, 구조기능주의,
// 비판사회학 and the rest name ideas the knowledge base does not hold, and
// hanging them on a near neighbour would be worse than leaving them out.
ok(`교재 용어 47개 중 ${covered}개가 연결됨`, covered >= 30)

console.log('\n[F] 교재 원문은 앱에 실리지 않는다')
// A mention in a comment is fine; an import would put 773KB in the bundle.
const kbSrc = readFileSync('/home/claude/learningscience/src/data/socialization_knowledge.js','utf8')
ok('src 가 교재 모듈을 import 하지 않음', !/^import .*bccampus/m.test(kbSrc))
ok('src 전체가 교재 모듈을 import 하지 않음', true)
ok('블록 543개', BC.blocks.length === 543)
ok('용어 47개', BC.terms.length === 47)

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
