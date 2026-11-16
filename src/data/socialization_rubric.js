// 통 인출 대조 항목 — 사회학 입문 5장 시연 강의.
//
// What a learner could reasonably be expected to pull back out after this
// lecture, as separate recallable statements. Taken from the transcript, not
// from the textbook: the lecture decides what was taught, so a point the
// chapter makes but this lecture skipped is not on the list and its absence
// is not a gap.
//
// `cues` are not a keyword matcher. They record the wordings the lecture
// itself used, so the model has the paraphrase space written down rather than
// guessed at, and so a human can see what each item was meant to cover. The
// model still decides whether a point was made; nothing here is matched
// against the learner's text mechanically, because the same words can carry a
// different meaning and the opposite is just as true.
//
// `weight` is not a score. It marks the handful of statements the lecture
// built everything else on, so the nudge can point at one of those first.

export default {
  rubricId: 'socialization-lecture-v1',
  title: '사회화, 자아 발달, 사회화 기관, 생애주기별 사회화',
  source: '시연용 가상 강의 전사문 · OpenStax Introduction to Sociology 3e, Ch. 5 기반',
  // Learner-facing, so it says what the list is rather than what was done to
  // their writing. 채점 is the wrong word for a page with no score on it.
  note: '이 목록은 오늘 강의에서 다룬 내용이에요. 교재에는 있지만 강의에서 다루지 않은 내용은 들어 있지 않아요.',
  items: [
    {
      id: 'R01',
      conceptId: 'socialization',
      statement: '사회화는 사회의 규범과 기대를 이해하고 신념과 가치를 배우는 과정이다',
      cues: ['규범', '기대', '신념', '가치', '배우는 과정'],
      weight: 'core',
    },
    {
      id: 'R02',
      conceptId: 'socialization',
      statement: '사회화는 친구와 어울리는 일(사교)과 다르다',
      cues: ['친구와 어울리', '사교', '사람을 많이 만나는 것과 다르'],
      weight: 'core',
    },
    {
      id: 'R03',
      conceptId: 'socialization',
      statement: '사회화는 개인이 사회 구성원으로 사는 법을 배우는 과정이면서, 사회가 문화와 규범을 다음 세대로 전달하는 과정이다',
      cues: ['개인', '사회 구성원', '다음 세대', '문화를 전달', '두 방향'],
      weight: 'core',
    },
    {
      id: 'R04',
      conceptId: 'self',
      statement: '자아는 타고나는 것이 아니라 타인과의 상호작용 속에서 발달한다',
      cues: ['태어날 때부터', '상호작용', '발달'],
      weight: 'core',
    },
    {
      id: 'R05',
      conceptId: 'self',
      statement: '자아는 다른 사람과 구별되는 나 자신의 정체성에 대한 감각이다',
      cues: ['정체성', '구별되는', '나 자신'],
      weight: 'supporting',
    },
    {
      id: 'R06',
      conceptId: 'looking-glass-self',
      statement: '쿨리의 거울 자아는 다른 사람의 반응을 통해 자신을 바라보는 것이다',
      cues: ['쿨리', '거울 자아', '타인의 반응', '비춰'],
      weight: 'core',
    },
    {
      id: 'R07',
      conceptId: 'looking-glass-self',
      statement: '타인의 반응 자체뿐 아니라 그 반응을 내가 어떻게 해석하느냐가 자아에 영향을 준다',
      cues: ['해석', '받아들이', '어떻게 생각하느냐'],
      weight: 'supporting',
    },
    {
      id: 'R08',
      conceptId: 'mead-stages',
      statement: '미드의 준비 단계에서는 주변 사람의 행동을 따라 한다',
      cues: ['준비 단계', '모방', '따라 하'],
      weight: 'supporting',
    },
    {
      id: 'R09',
      conceptId: 'mead-stages',
      statement: '놀이 단계에서는 부모나 선생님처럼 특정한 한 사람의 역할을 맡아 본다',
      cues: ['놀이 단계', '한 사람', '역할을 맡'],
      weight: 'supporting',
    },
    {
      id: 'R10',
      conceptId: 'mead-stages',
      statement: '게임 단계에서는 여러 사람의 역할을 동시에 고려한다',
      cues: ['게임 단계', '여러 역할', '동시에', '축구'],
      weight: 'supporting',
    },
    {
      id: 'R11',
      conceptId: 'generalized-other',
      statement: '일반화된 타자는 특정한 한 사람이 아니라 사회 전체에 공유된 행동 기대를 뜻한다',
      cues: ['일반화된 타자', '사회 전체', '공유된 기대', '신호', '차례'],
      weight: 'core',
    },
    {
      id: 'R12',
      conceptId: 'generalized-other',
      statement: '거울 자아는 타인의 반응에, 일반화된 타자는 공동체의 공유된 규범에 초점이 있다',
      cues: ['차이', '초점', '거울 자아와', '구분'],
      weight: 'core',
    },
    {
      id: 'R13',
      conceptId: 'socialization',
      statement: '사회화는 개인에게 함께 살아가는 데 필요한 행동을 가르치고, 사회에서는 문화가 이어지게 한다',
      cues: ['왜 중요', '개인의 입장', '사회의 입장', '문화가 이어'],
      weight: 'supporting',
    },
    {
      id: 'R14',
      conceptId: 'nature-nurture',
      statement: '본성(유전적·생물학적 영향)과 양육(사회적 경험)을 함께 생각해야 하며, 행동이 환경으로만 결정되지는 않는다',
      cues: ['본성', '양육', '유전', '환경', '둘 다'],
      weight: 'supporting',
    },
    {
      id: 'R15',
      conceptId: 'agents-of-socialization',
      statement: '사회화 기관에는 가족, 또래집단, 학교, 직장, 종교, 미디어가 있다',
      cues: ['사회화 기관', '가족', '또래', '학교', '직장', '종교', '미디어'],
      weight: 'core',
    },
    {
      id: 'R16',
      conceptId: 'hidden-curriculum',
      statement: '잠재적 교육과정은 정식 교과 지식과 별개로 학교생활에서 비공식적으로 배우는 규범과 기대다',
      cues: ['잠재적 교육과정', '비공식', '줄 서기', '차례', '조별 과제', '규칙'],
      weight: 'core',
    },
    {
      id: 'R17',
      conceptId: 'hidden-curriculum',
      statement: '잠재적 교육과정은 교사가 일부러 비밀 수업을 하는 것이 아니다',
      cues: ['비밀 수업', '일부러', '몰래'],
      weight: 'supporting',
    },
    {
      id: 'R18',
      conceptId: 'anticipatory-socialization',
      statement: '예기 사회화는 앞으로 맡게 될 역할을 미리 준비하는 과정이다',
      cues: ['예기 사회화', '미리 준비', '앞으로 맡'],
      weight: 'core',
    },
    {
      id: 'R19',
      conceptId: 'resocialization',
      statement: '재사회화는 익숙해진 행동 방식 일부를 바꾸고 새로운 규칙과 역할을 다시 배우는 과정이다',
      cues: ['재사회화', '바꾸', '다시 배우', '군 생활'],
      weight: 'core',
    },
    {
      id: 'R20',
      conceptId: 'resocialization',
      statement: '모든 환경 변화가 반드시 강한 재사회화로 이어지지는 않는다',
      cues: ['모든 변화가', '반드시', '아니'],
      weight: 'supporting',
    },
    {
      id: 'R21',
      conceptId: 'socialization',
      statement: '사회화는 어릴 때 끝나지 않고 입학·취업·이직·은퇴에서도 계속된다',
      cues: ['평생', '어릴 때만', '취업', '은퇴', '계속'],
      weight: 'core',
    },
  ],
}
