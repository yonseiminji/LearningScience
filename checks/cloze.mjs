import { readFileSync } from 'node:fs'
import { BLANK, buildCloze, gradeCloze, normalize, termsToBlank } from '/home/claude/learningscience/src/features/retrieval/cloze.js'

let pass = 0, fail = 0
const is = (l,g,w) => { const o = Object.is(g,w); console.log(`${o?'PASS':'FAIL'}  ${l}${o?'':`  → got ${JSON.stringify(g)}`}`); o?pass++:fail++ }
const ok = (l,c) => is(l, Boolean(c), true)

const text = readFileSync('/mnt/user-data/uploads/1932cc96-socialization_lecture.txt','utf8')
const chunks = text.split(/\n\n+/).filter(p => p.startsWith('교수자:')).map((t,i) => ({ chunkId: 'c-'+(i+1), text: t }))
const items = buildCloze(chunks)

console.log('\n[A] 전사문에서 만들어진다')
ok('문항이 만들어짐', items.length >= 5)
ok('상한을 지킴', buildCloze(chunks, { limit: 3 }).length === 3)
ok('빈 입력은 빈 결과', buildCloze([]).length === 0)

console.log('\n[B] 빈칸과 답이 일치한다')
// The bug this pins: an alias matched the sentence but the heading was shown
// as the answer, so 준비 단계 was blanked and 미드의 자아 발달 단계 was asked for.
ok('모든 문항에 빈칸', items.every(i => i.text.includes(BLANK)))
ok('답이 문장에 남아 있지 않음', items.every(i => !i.text.includes(i.answer)))
ok('답이 허용 목록에 포함', items.every(i => i.accepted.includes(i.answer)))
ok('빈칸을 답으로 되돌리면 원문', items.every(i => i.text.replace(BLANK, i.answer).length === i.text.length - BLANK.length + i.answer.length))

console.log('\n[C] 문장이 답을 가리킨다')
ok('지시어로 시작하지 않음', items.every(i => !/^(이|그|여기|저)/.test(i.text)))
ok('교수자: 가 떨어짐', items.every(i => !i.text.startsWith('교수자')))
ok('너무 짧지 않음', items.every(i => i.text.length >= 25))
ok('개념이 겹치지 않음', new Set(items.map(i => i.conceptId)).size === items.length)

console.log('\n[D] 채점')
const one = items[0]
is('정확히 맞음', gradeCloze(one, one.answer), 'right')
is('공백은 무시', gradeCloze(one, ` ${one.answer} `), 'right')
is('가운뎃점 무시', gradeCloze({ ...one, accepted: ['본성·양육'] }, '본성양육'), 'right')
is('빈 답', gradeCloze(one, '   '), 'empty')
is('다른 말', gradeCloze(one, '아무말'), 'other')
const alias = items.find(i => i.accepted.length > 1)
if (alias) is('별칭도 인정', gradeCloze(alias, alias.accepted[1]), 'right')
is('정규화', normalize(' 거울 자아 '), '거울자아')

console.log('\n[E] 후보 용어')
const terms = termsToBlank()
ok('긴 이름이 먼저', terms[0].term.length >= terms[terms.length-1].term.length)
ok('모두 두 글자 이상', terms.every(t => t.term.length >= 2))
ok('영문 별칭은 제외', !terms.some(t => /[A-Za-z]/.test(t.term)))

console.log(`\n요약: ${pass} PASS / ${fail} FAIL`)
process.exitCode = fail ? 1 : 0
