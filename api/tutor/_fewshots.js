// Few-shot examples for the quiz-generation prompt.
//
// A JS module rather than a JSON file on purpose: a static ESM import is
// traced into the Vercel function bundle, so these travel with quiz.js. A
// JSON read would need an include rule and could ship a function that works
// locally and throws in production. The `_` prefix keeps it out of routing.
//
// The examples are style and quality guidance. They are NOT source material:
// their sample-* chunk ids and sentences must never be cited as evidence for
// a learner's own lecture, and the rejected ones are shown only as patterns
// to avoid. Nothing here is a field in the response — `note` and `reason` are
// prompt prose, and the model's output schema is unchanged.

// Good items. `questions` is written exactly as the response schema in
// quiz.js requires, so the example doubles as a shape reference.
const GOOD = [
  {
    chunks: [
      {
        chunkId: 'sample-001',
        text: '작업기억은 정보를 일시적으로 유지하고 처리하는 인지 체계이다. 작업기억이 한 번에 처리할 수 있는 정보량에는 제한이 있다.',
      },
    ],
    request: { questionTypes: ['ox'], questionCount: 1 },
    questions: [
      {
        type: 'ox',
        questionText: '작업기억이 한 번에 처리할 수 있는 정보량에는 제한이 없다.',
        answer: 'X',
        acceptableAnswers: [],
        explanation: '강의 원문은 작업기억이 한 번에 처리할 수 있는 정보량에 제한이 있다고 설명해요.',
        sourceChunkIds: ['sample-001'],
        evidenceText: '작업기억이 한 번에 처리할 수 있는 정보량에는 제한이 있다.',
      },
    ],
    note: '원문과 명확히 모순되는 단일 주장만 바꾸었으므로 X를 판정할 수 있습니다.',
  },
  {
    chunks: [
      {
        chunkId: 'sample-002',
        text: '신호주기 원리는 학습자가 중요한 정보를 알아차리도록 핵심 요소를 강조하는 방법이다.',
      },
    ],
    request: { questionTypes: ['ox'], questionCount: 1 },
    questions: [
      {
        type: 'ox',
        questionText: '신호주기 원리는 학습자가 중요한 정보를 알아차리도록 핵심 요소를 강조하는 방법이다.',
        answer: 'O',
        acceptableAnswers: [],
        explanation: '강의 원문에서 신호주기 원리는 중요한 정보를 알아차리도록 핵심 요소를 강조하는 방법으로 설명돼요.',
        sourceChunkIds: ['sample-002'],
        evidenceText: '신호주기 원리는 학습자가 중요한 정보를 알아차리도록 핵심 요소를 강조하는 방법이다.',
      },
    ],
    note: '정답 O가 인용한 원문에 직접 뒷받침됩니다.',
  },
  {
    chunks: [
      {
        chunkId: 'sample-003',
        text: '사전훈련 원리는 학습자가 본 학습에 앞서 주요 개념의 이름과 특징을 익히도록 하는 것이다.',
      },
    ],
    request: { questionTypes: ['blank'], questionCount: 1 },
    questions: [
      {
        type: 'blank',
        questionText: '본 학습 전에 주요 개념의 이름과 특징을 익히도록 하는 것은 ____ 원리이다.',
        answer: '사전훈련',
        acceptableAnswers: [],
        explanation: '사전훈련은 주요 개념의 이름과 특징을 본 학습 전에 익히도록 하는 원리예요.',
        sourceChunkIds: ['sample-003'],
        evidenceText: '사전훈련 원리는 학습자가 본 학습에 앞서 주요 개념의 이름과 특징을 익히도록 하는 것이다.',
      },
    ],
    note: '교육적으로 중요한 용어 하나를 빈칸으로 가렸고, 정답이 근거 원문에 그대로 있습니다.',
  },
]

// Patterns to avoid. Shown as rejected candidates with the reason, kept in
// their own section so they are never read as answers to copy. Each of these
// passes all seven of the server's format checks, which is exactly why they
// have to be ruled out here.
const BAD = [
  {
    chunkText: '작업기억은 한 번에 처리할 수 있는 정보의 양에 제한이 있다.',
    candidate: {
      type: 'ox',
      questionText: '작업기억은 정확히 7개의 정보를 저장할 수 있다.',
      answer: 'X',
      evidenceText: '작업기억은 한 번에 처리할 수 있는 정보의 양에 제한이 있다.',
    },
    reason: '원문은 정확한 수량을 말하지 않습니다. 언급되지 않은 수량을 단지 없다는 이유로 X로 판정하면 안 됩니다.',
  },
  {
    chunkText: '작업기억은 한 번에 처리할 수 있는 정보의 양에 제한이 있다.',
    candidate: {
      type: 'ox',
      questionText: '작업기억은 한 번에 처리할 수 있는 정보량에 제한이 없다.',
      answer: 'O',
      evidenceText: '작업기억은 한 번에 처리할 수 있는 정보의 양에 제한이 있다.',
    },
    reason: '근거 인용은 원문에 있지만 문제와 정답의 의미가 반대입니다. 올바른 정답은 X입니다.',
  },
  {
    chunkText: '학습자는 설명과 그림을 함께 사용해 내용을 이해할 수 있다.',
    candidate: {
      type: 'blank',
      questionText: '학습자는 ____을 사용해 내용을 이해할 수 있다.',
      answer: '설명',
      evidenceText: '학습자는 설명과 그림을 함께 사용해 내용을 이해할 수 있다.',
    },
    reason: '설명과 그림 중 어느 것이 빈칸의 정답인지 문장만으로 가릴 수 없습니다.',
  },
]

function renderGood(example, at) {
  const request = `questionTypes=${JSON.stringify(example.request.questionTypes)} questionCount=${example.request.questionCount}`
  const passage = example.chunks.map((chunk) => `[${chunk.chunkId}]\n${chunk.text}`).join('\n\n')
  return `### Example ${at} — acceptable
Request: ${request}
Chunks:
${passage}
Output:
${JSON.stringify({ questions: example.questions }, null, 2)}
Why: ${example.note}`
}

function renderBad(example, at) {
  return `### Counter-example ${at} — do not produce
Chunk: ${example.chunkText}
Rejected candidate: ${JSON.stringify(example.candidate)}
Reason: ${example.reason}`
}

export const FEW_SHOTS = `## Worked examples

These illustrate style and quality only. The sample-* ids and sentences are
not evidence for the current request: never cite them, and never reuse an
example's answer unless that exact chunk appears in the request itself.

${GOOD.map((example, at) => renderGood(example, at + 1)).join('\n\n')}

## Patterns to avoid

Each of the following satisfies every mechanical format check and is still
wrong. Rule them out yourself; the server cannot.

${BAD.map((example, at) => renderBad(example, at + 1)).join('\n\n')}`
