// A worked example of what 과제 단계 나누기 returns.
//
// Shown only when the learner asks for it, by its own button, and labelled as
// an example wherever it appears. It is NOT a fallback: a model or network
// error never quietly swaps this in, because an answer the model did not give
// must never arrive looking like one it did. The error says what failed and
// mentions that an example exists; opening it is the learner's choice, and
// the instruction on screen is replaced with the example's own so that what
// they are reading and what they are looking at match.
//
// Steps carry source: 'example' into the assignment registry, so an
// assignment built from this is marked as such for as long as it exists.
//
// Shaped exactly like api/planner/chunk.js returns, and run through the same
// verifyChunkResult as a live answer -- checks/task-chunking-tests.mjs fails
// if it would be rejected. Written here rather than recorded from the model
// because it has to stay readable and stay correct when the prompt changes.

// The assignment this example splits. Also the field's placeholder, so the
// example answers the question the empty form was already asking.
export const EXAMPLE_INSTRUCTION = `본 과제는 교육의 기본 개념을 이해하고, 현대 사회에서 교육의 목적과 교사의 역할을 비판적으로 탐색하는 것을 목표로 한다. 강의에서 학습한 교육의 목적 중 두 가지를 선정하여 핵심 내용을 요약하고, 각 목적이 실제 학교 교육에서 어떻게 구현되는지 구체적인 사례를 제시하시오. 해당 사례에서 교사가 수행해야 할 역할을 분석하고, 바람직한 교육의 방향에 대한 자신의 견해를 근거와 함께 서술하시오. 참고자료를 활용한 경우 출처를 표기한다. 제출 마감일은 2026년 11월 29일(일) 23시 59분이다.`

export const EXAMPLE_LEVEL = 'medium'

export const EXAMPLE_RESULT = {
  assignment: {
    assignmentTitle: '교육의 목적과 교사의 역할 탐색',
    dueAt: '2026-11-29T23:59',
    requirements: [
      { requirementId: 'req-001', keyword: '목적 두 가지 선정', text: '강의에서 배운 교육의 목적 중 두 가지를 고른다.', kind: 'content' },
      { requirementId: 'req-002', keyword: '핵심 내용 요약', text: '고른 두 목적의 핵심 내용을 각각 요약한다.', kind: 'content' },
      { requirementId: 'req-003', keyword: '구현 사례 제시', text: '각 목적이 실제 학교 교육에서 어떻게 구현되는지 구체적인 사례를 든다.', kind: 'content' },
      { requirementId: 'req-004', keyword: '교사 역할 분석', text: '그 사례에서 교사가 해야 할 역할을 분석한다.', kind: 'content' },
      { requirementId: 'req-005', keyword: '자신의 견해', text: '바람직한 교육의 방향에 대한 자신의 견해를 근거와 함께 쓴다.', kind: 'content' },
      { requirementId: 'req-006', keyword: '출처 표기', text: '참고자료를 쓴 경우 출처를 표기한다.', kind: 'submission' },
      { requirementId: 'req-007', keyword: '마감 제출', text: '2026년 11월 29일(일) 23시 59분까지 제출한다.', kind: 'submission' },
    ],
  },
  steps: [
    {
      stepId: 'step-1',
      title: '강의에서 교육의 목적 찾아 적기',
      description: '강의 노트나 교재를 펴고, 교육의 목적으로 나온 것들을 보이는 대로 적어 둡니다. 고르는 건 다음 단계에서 하니 지금은 모아두기만 하면 됩니다.',
      tip: '다 적을 필요는 없어요. 눈에 들어오는 것부터 세 개쯤이면 충분합니다.',
      completionCriteria: [
        { text: '강의에 나온 교육의 목적을 세 개 이상 적었나요?', inputLabel: '적어 둔 목적', placeholder: '전인적 성장, 사회화, 직업 준비' },
      ],
      requirementIds: ['req-001'],
    },
    {
      stepId: 'step-2',
      title: '두 가지 고르고 핵심 내용 요약하기',
      description: '적어 둔 것 중 쓸 만한 두 개를 고릅니다. 고른 각각에 대해 강의가 뭐라고 설명했는지 두세 문장으로 줄여 적습니다.',
      tip: '사례를 많이 떠올릴 수 있는 쪽을 고르면 뒤 단계가 쉬워져요.',
      completionCriteria: [
        { text: '목적 두 가지를 골랐나요?', inputLabel: '고른 두 가지', placeholder: '전인적 성장, 직업 준비' },
        { text: '각각의 핵심 내용을 요약했나요?', inputLabel: '요약 분량', placeholder: '목적당 세 문장' },
      ],
      requirementIds: ['req-001', 'req-002'],
    },
    {
      stepId: 'step-3',
      title: '각 목적의 학교 사례 찾기',
      description: '고른 두 목적이 실제 학교에서 어떤 모습으로 나타나는지 사례를 하나씩 찾습니다. 다녔던 학교에서 겪은 일도 사례가 됩니다.',
      tip: '뉴스나 교육 기사에서 찾았다면 어디서 봤는지 링크를 같이 적어 두세요. 마지막에 출처로 씁니다.',
      completionCriteria: [
        { text: '목적마다 사례를 하나씩 찾았나요?', inputLabel: '찾은 사례', placeholder: '자유학기제 진로 체험' },
        { text: '사례의 출처를 적어 두었나요?', inputLabel: '출처 메모', placeholder: '교육부 보도자료' },
      ],
      requirementIds: ['req-003', 'req-006'],
    },
    {
      stepId: 'step-4',
      title: '사례 속 교사의 역할 분석하기',
      description: '찾은 사례마다 교사가 무엇을 하고 있는지 적습니다. 무엇을 준비하고, 수업에서 어떻게 하고, 학생을 어떻게 돕는지로 나눠 보면 쓰기 쉽습니다.',
      tip: '‘가르친다’처럼 뭉뚱그리지 말고, 그 사례에서 실제로 하는 일을 적어 보세요.',
      completionCriteria: [
        { text: '사례마다 교사의 역할을 분석해 적었나요?', inputLabel: '분석한 역할 수', placeholder: '사례당 두 가지' },
      ],
      requirementIds: ['req-004'],
    },
    {
      stepId: 'step-5',
      title: '자신의 견해를 근거와 함께 쓰기',
      description: '앞에서 정리한 내용을 바탕으로, 바람직한 교육의 방향에 대해 자기 생각을 씁니다. 생각마다 왜 그렇게 보는지 근거를 한 줄씩 붙입니다.',
      tip: '앞 단계에서 적은 요약과 사례를 근거로 그대로 쓸 수 있어요.',
      completionCriteria: [
        { text: '자신의 견해를 썼나요?', inputLabel: '견해의 핵심 주장', placeholder: '진로 교육의 확대' },
        { text: '주장마다 근거를 붙였나요?', inputLabel: '근거 수', placeholder: '주장당 한 개' },
      ],
      requirementIds: ['req-005'],
    },
    {
      stepId: 'step-6',
      title: '출처 정리하고 제출하기',
      description: '참고한 자료의 출처를 모아 정리하고, 전체를 한 번 읽어 본 뒤 제출합니다.',
      tip: '마감은 11월 29일 23시 59분이에요. 하루 앞서 올려 두면 마음이 편합니다.',
      completionCriteria: [
        { text: '참고자료 출처를 정리했나요?', inputLabel: '정리한 출처 수', placeholder: '세 건' },
        { text: '마감 전에 제출했나요?', inputLabel: '제출한 날짜', placeholder: '11월 28일' },
      ],
      requirementIds: ['req-006', 'req-007'],
    },
  ],
}
