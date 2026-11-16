import { countMatches, splitMatches } from '/home/claude/learningscience/src/components/review/LectureChunks.jsx'
let pass = 0, fail = 0
const is = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w); console.log(`${ok?'PASS':'FAIL'}  ${l}${ok?'':`  → ${JSON.stringify(g)}`}`); ok ? pass++ : fail++ }

console.log('\n[A] 하이라이트 쪼개기')
is('빈 검색어는 통째로', splitMatches('사회화 과정', ''), [{ text: '사회화 과정', hit: false }])
is('한 번 찾음', splitMatches('사회화 과정', '사회화'), [{ text: '사회화', hit: true }, { text: ' 과정', hit: false }])
is('가운데에서 찾음', splitMatches('이것은 사회화다', '사회화'), [{ text: '이것은 ', hit: false }, { text: '사회화', hit: true }, { text: '다', hit: false }])
is('여러 번', splitMatches('가나가', '가').filter(p => p.hit).length, 2)
is('못 찾으면 통째로', splitMatches('abc', 'zz'), [{ text: 'abc', hit: false }])
is('대소문자 무시', splitMatches('Socialization', 'social')[0], { text: 'Social', hit: true })
is('조각을 이으면 원문', splitMatches('이것은 사회화다', '사회화').map(p => p.text).join(''), '이것은 사회화다')
is('꺾쇠는 텍스트로 남음', splitMatches('a <b> c', '<b>')[1], { text: '<b>', hit: true })

console.log('\n[B] 몇 군데인지 센다')
const chunks = [{ text: '사회화는 과정이다' }, { text: '사회화와 사회화' }, { text: '관계없음' }]
is('전체 3번, 문단 2개', countMatches(chunks, '사회화'), { hits: 3, chunks: 2 })
is('없으면 0', countMatches(chunks, '없는말'), { hits: 0, chunks: 0 })
is('빈 검색어는 0', countMatches(chunks, '  '), { hits: 0, chunks: 0 })

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
