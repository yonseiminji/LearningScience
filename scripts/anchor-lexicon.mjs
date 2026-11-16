// Re-anchor the relation lexicon to the BCcampus chapter.
//
//   node scripts/anchor-lexicon.mjs <relation_lexicon.json>
//
// Run once, by hand, when a new lexicon bundle arrives. Writes
// src/data/socialization_relations.js.
//
// The bundle cites printed pages (pp. 269–326). Our own corpus says in
// `paginationNote` that the uploaded TXT carries no page boundaries and that
// the numbers at the section tails were never verified as print pages — which
// is why every concept in socialization_knowledge.js is cited by section and
// line, not by page. So the pages do not get copied in: each relation is
// re-anchored by finding its `evidenceEn` verbatim in the English corpus and
// recording the line it was found on. The bundle's page claim is kept beside
// it as `claimedPrintPages`, unused by any code, so the audit trail back to
// the bundle survives without the app ever asserting a page number.
//
// A relation whose evidence cannot be found is not written. Nothing here
// invents an anchor.

import { readFileSync, writeFileSync } from 'node:fs'
import { socializationEN as EN } from '../docs/bccampus-ch05/bccampus_socialization_ch05_en.js'

const OUT = new URL('../src/data/socialization_relations.js', import.meta.url)
const source = process.argv[2]
if (!source) {
  console.error('사용법: node scripts/anchor-lexicon.mjs <relation_lexicon.json>')
  process.exit(1)
}

const bundle = JSON.parse(readFileSync(source, 'utf8'))

// Curly quotes, dashes and ellipses differ between the bundle's anchors and
// the corpus extraction, so both sides are flattened before matching. This is
// a text comparison, not a fuzzy one: the needle must still occur whole.
const norm = (text) =>
  (text || '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const blocks = EN.blocks.map((block) => ({
  line: block.sourceLine,
  section: block.section,
  text: norm(block.originalEn),
}))

function anchor(evidenceEn) {
  const needle = norm(evidenceEn)
  if (!needle) return null
  const found = blocks.find((block) => block.text.includes(needle))
  return found ? { line: found.line, section: found.section } : null
}

// The chain's missing link. The chapter names four stages in order and
// devotes a paragraph to each, but only preparatory→play gets a 'followed by'
// sentence; play→game is carried by the ordering itself. The edge was first
// added here with REL-13's sentence as its anchor, which cited the wrong
// clause — it is anchored to the game-stage paragraph instead, and marked
// structural rather than direct so the difference is on the record.
const REPO_ADDED = [
  {
    id: 'REL-30',
    category: '미드 발달',
    subjectKo: '놀이 단계',
    relationKo: '이어서 진행',
    objectKo: '게임 단계',
    expressionEn: 'During the game stage',
    evidenceEn: 'During the game stage',
    diagramIds: ['mead'],
    provenance: 'structural',
    notes:
      '검증본에도 없는 연결. 교재가 네 단계를 순서대로 제시하고 각 단계에 문단을 하나씩 두지만, ' +
      '"followed by"는 준비→놀이에만 붙어 있어 놀이→게임은 서술 순서로만 뒷받침된다.',
    relationType: 'PRECEDES',
    direction: 'subject_to_object',
    evidenceStatus: 'source_ordered_interpreted',
    semanticNote:
      '놀이 단계에서 게임 단계로 이어지는 발달상 순서; 인과 아님. 순서의 근거는 ' +
      '§5.1의 네 단계 열거(준비·놀이·게임·일반화된 타자)이며 한 문장의 명시적 선후 진술이 아니다.',
    diagramHint: '순차형 체인',
    isCausalClaim: false,
    isActive: true,
    validationStatus: 'ordered_in_current_edition',
    validationNote: '이 저장소에서 추가한 관계. 교재의 단계 열거 순서에 따름.',
    claimedPrintPages: [],
  },
]

const kept = []
const dropped = []

for (const relation of [...bundle.relations, ...REPO_ADDED]) {
  const active = relation.isActive !== false
  const at = anchor(relation.evidenceEn)

  if (active && !at) {
    dropped.push(relation)
    continue
  }

  const { sourcePages, legacySourcePages, legacyEvidenceEn, ...rest } = relation
  kept.push({
    ...rest,
    sourceSection: at ? at.section : relation.sourceSection ?? null,
    sourceLines: at ? [at.line] : [],
    claimedPrintPages: relation.claimedPrintPages ?? sourcePages ?? [],
  })
}

const meta = bundle.metadata || {}
const data = {
  schemaVersion: `${bundle.schemaVersion}-lines`,
  metadata: {
    source: 'William Little (2023), Introduction to Sociology – 3rd Canadian Edition, Chapter 5: Socialization',
    sourceUrl: meta.sourceUrl,
    license: 'CC BY 4.0 (교재 본문; 개별 표기된 제3자 자료는 다를 수 있음)',
    licenseUrl: meta.licenseUrl,
    basedOn: 'bccampus_socialization_relation_lexicon_validated (v2.1) + docs/bccampus-ch05',
    anchoring:
      'sourceLines 는 docs/bccampus-ch05 영문 코퍼스에서 evidenceEn 을 그대로 찾은 줄. ' +
      '번들이 주장한 인쇄 쪽수는 claimedPrintPages 로만 남기고 코드에서 쓰지 않는다 — ' +
      '업로드된 TXT 에는 페이지 경계가 없어 검증할 수 없기 때문.',
    provenancePolicy: meta.provenancePolicy,
    classification: '시각화를 위한 개발 스키마. 교재 저자의 분류 체계가 아니다.',
    activeCount: kept.filter((r) => r.isActive !== false).length,
    inactiveCount: kept.filter((r) => r.isActive === false).length,
    caveats: [
      ...(meta.caveats || []),
      'REL-30 은 이 저장소가 추가한 관계이며 provenance 가 structural 이다.',
      '화살표는 학습용 표기이며 인과 모형으로 읽어서는 안 된다.',
    ],
  },
  relationTypes: bundle.relationTypes,
  relations: kept,
}

const header = `// Chapter 5 사회화 — 유형화된 개념 관계 사전.
//
// BCcampus 3rd Canadian Edition 검증본(v2.1)을 이 저장소의 영문 코퍼스에 다시
// 앵커한 것. 각 관계의 evidenceEn 은 docs/bccampus-ch05 에 그대로 존재하며,
// sourceLines 가 찾은 줄이다. 번들이 적어 온 인쇄 쪽수는 claimedPrintPages 에만
// 남아 있고 코드가 읽지 않는다 — 업로드된 TXT 에 페이지 경계가 없어 확인할 수
// 없는 숫자라서, 화면에도 프롬프트에도 들어가지 않는다.
//
// isActive: false 인 관계는 새 판에서 근거를 찾지 못한 것이고, 틀렸다는 판정은
// 아니다. 도식에서는 제외된다.
//
// 다시 만들려면: node scripts/anchor-lexicon.mjs <relation_lexicon.json>
//
// .js rather than .json for the reason the other data files are: Vercel
// functions run real Node, where a bare JSON import throws.

`

writeFileSync(OUT, `${header}export default ${JSON.stringify(data, null, 2)}\n`)

console.log(`\n  관계 ${kept.length}개 기록 · 활성 ${data.metadata.activeCount} · 비활성 ${data.metadata.inactiveCount}`)
if (dropped.length) {
  console.log(`\n  근거를 코퍼스에서 못 찾아 넣지 않음 ${dropped.length}개:`)
  for (const relation of dropped) console.log(`    ${relation.id}  "${relation.evidenceEn}"`)
}
console.log(`  → ${OUT.pathname}`)
