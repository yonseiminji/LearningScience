// 통 인출 대조 항목 — 강의별.
//
// One list per lecture, taken from that transcript and not from the chapter:
// the lecture decides what was taught, so a point the textbook makes but this
// lecture skipped is not on its list and its absence is not a gap. Which list
// applies is worked out from the transcript itself (pickRubric), because the
// learner uploads a file and never tells us which lecture it is.
//
// `cues` are not a keyword matcher. They record the wordings the lecture used,
// so the model has the paraphrase space written down and a human can see what
// each item was meant to cover. `weight` is not a score; it marks the
// statements the lecture built the rest on.

export const RUBRICS = [
  {
    rubricId: 'socialization-lecture-v1',
    title: '사회화, 자아 발달, 사회화 기관, 생애주기별 사회화',
    source: '시연용 가상 강의 전사문 · OpenStax Introduction to Sociology 3e, Ch. 5 기반',
    note: '이 목록은 오늘 강의에서 다룬 내용이에요. 교재에는 있지만 강의에서 다루지 않은 내용은 들어 있지 않아요.',
    // Phrases this lecture uses and the others do not.
    detect: ['거울 자아', '미드', '일반화된 타자', '잠재적 교육과정', '예기 사회화'],
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
  ]
  },
  {
    rubricId: 'moral-development-v1',
    title: '도덕 발달과 성별 사회화',
    source: '시연용 가상 강의 전사문 · OpenStax Introduction to Sociology 3e, Ch. 5 기반',
    note: '이 목록은 오늘 강의에서 다룬 내용이에요. 교재에는 있지만 강의에서 다루지 않은 내용은 들어 있지 않아요.',
    detect: ['도덕 발달', '콜버그', '전인습', '후인습', '길리건'],
    items: [
      {
        id: 'M01',
        conceptId: 'moral-development',
        statement: '도덕 발달은 무엇이 옳고 그른지 판단하는 방식이 발달하는 과정이다',
        cues: ['도덕 발달', '옳고 그', '판단'],
        weight: 'core',
      },
      {
        id: 'M02',
        conceptId: 'moral-development',
        statement: '도덕 발달은 규칙을 외우는 일이 아니라, 타인에게 미치는 영향과 사회가 옳다고 보는 기준을 함께 고려하는 일이다',
        cues: ['규칙을 외우는', '타인에게 미치는 영향', '나의 욕구'],
        weight: 'core',
      },
      {
        id: 'M03',
        conceptId: 'kohlberg-levels',
        statement: '콜버그는 전인습, 인습, 후인습이라는 세 수준을 제시했다',
        cues: ['콜버그', '전인습', '인습', '후인습', '세 수준'],
        weight: 'core',
      },
      {
        id: 'M04',
        conceptId: 'kohlberg-levels',
        statement: '세 수준은 문제의 난도 구분이 아니라 도덕 판단의 기준이 어떻게 달라지는지에 대한 구분이다',
        cues: ['난도', '쉬운 문제', '판단의 기준', '달라지는지'],
        weight: 'core',
      },
      {
        id: 'M05',
        conceptId: 'kohlberg-levels',
        statement: '전인습 수준에서는 당장 자신이 경험하는 결과를 중심으로 판단한다',
        cues: ['전인습', '자신이 경험하는 결과', '어린 아동'],
        weight: 'supporting',
      },
      {
        id: 'M06',
        conceptId: 'kohlberg-levels',
        statement: '인습 수준에서는 타인의 감정을 의식하고 고려하기 시작한다',
        cues: ['인습 수준', '타인의 감정', '청소년기'],
        weight: 'supporting',
      },
      {
        id: 'M07',
        conceptId: 'kohlberg-levels',
        statement: '후인습 수준에서는 법적으로 허용되는 행동과 도덕적으로 옳은 행동이 반드시 일치하지 않음을 인식한다',
        cues: ['후인습', '법적으로 허용', '도덕적으로 옳', '이집트'],
        weight: 'core',
      },
      {
        id: 'M08',
        conceptId: 'gilligan-critique',
        statement: '길리건은 콜버그의 연구 대상이 남성만이었다는 점을 지적했다',
        cues: ['길리건', '남성만', '연구 대상'],
        weight: 'core',
      },
      {
        id: 'M09',
        conceptId: 'gilligan-critique',
        statement: '길리건의 초기 연구는 남성에게서 정의의 관점, 여성에게서 돌봄과 책임의 관점을 보고했다',
        cues: ['정의의 관점', '돌봄과 책임', '규칙과 법'],
        weight: 'supporting',
      },
      {
        id: 'M10',
        conceptId: 'gilligan-critique',
        statement: '그 성별 차이는 표본이 작았고 후속 연구에서 재현되지 않아 일반 법칙으로 받아들일 수 없다',
        cues: ['표본 크기', '재현되지', '후속 연구'],
        weight: 'core',
      },
      {
        id: 'M11',
        conceptId: 'gender-socialization',
        statement: '성별 사회화는 사회가 남성과 여성에게 다른 행동과 역할을 기대하고 아이들이 그 기대를 배우는 과정이다',
        cues: ['성별 사회화', '다른 행동과 역할', '기대를 학습'],
        weight: 'core',
      },
      {
        id: 'M12',
        conceptId: 'gender-socialization',
        statement: '외모를 칭찬하는 일상적 상호작용도 성별 기대를 전달할 수 있다',
        cues: ['외모', '칭찬', '여자아이', '일상적 상호작용'],
        weight: 'supporting',
      },
      {
        id: 'M13',
        conceptId: 'gender-socialization',
        statement: '스웨덴의 에갈리아 유치원은 성별 기대를 강화하지 않으려는 교육 환경을 시도한 사례다',
        cues: ['에갈리아', '스웨덴', '유치원'],
        weight: 'supporting',
      },
    ],
  },
  {
    rubricId: 'institutional-agents-v1',
    title: '직장·종교·정부·대중매체를 통한 사회화',
    source: '시연용 가상 강의 전사문 · OpenStax Introduction to Sociology 3e, Ch. 5 기반',
    note: '이 목록은 오늘 강의에서 다룬 내용이에요. 교재에는 있지만 강의에서 다루지 않은 내용은 들어 있지 않아요.',
    detect: ['물질문화', '비물질문화', '대중매체', '온보딩', '공주 문화'],
    items: [
      {
        id: 'I01',
        conceptId: 'agents-of-socialization',
        statement: '사회화 기관은 사람들이 사회의 규범과 기대를 배우는 데 영향을 주는 집단과 제도다',
        cues: ['사회화 기관', '규범과 기대', '집단과 제도'],
        weight: 'core',
      },
      {
        id: 'I02',
        conceptId: 'agents-of-socialization',
        statement: '직접 상호작용하는 집단, 학교·직장·정부 같은 공식 제도, 대중매체 같은 전달 경로로 나누어 볼 수 있다',
        cues: ['직접 상호작용', '공식적인 제도', '반복적으로 메시지'],
        weight: 'supporting',
      },
      {
        id: 'I03',
        conceptId: 'material-culture',
        statement: '물질문화는 복사기나 책상, 업무 도구처럼 형태가 있는 대상을 포함한다',
        cues: ['물질문화', '복사기', '책상', '형태가 있는'],
        weight: 'core',
      },
      {
        id: 'I04',
        conceptId: 'nonmaterial-culture',
        statement: '비물질문화는 기대, 가치, 믿음, 행동 규칙처럼 물리적 사물로 설명할 수 없는 요소다',
        cues: ['비물질문화', '기대', '가치', '믿음', '행동 규칙'],
        weight: 'core',
      },
      {
        id: 'I05',
        conceptId: 'workplace-socialization',
        statement: '직장 사회화에는 업무 도구를 쓰는 법과 조직의 행동 기대가 함께 관여한다',
        cues: ['직장 사회화', '업무 도구', '상사에게', '공용 냉장고', '발언하는 순서'],
        weight: 'core',
      },
      {
        id: 'I06',
        conceptId: 'workplace-socialization',
        statement: '적응의 책임은 신입 직원에게만 있지 않고, 조직도 온보딩과 사회화 프로그램을 마련해야 한다',
        cues: ['신입 직원에게만', '온보딩', '만족도', '생산성'],
        weight: 'core',
      },
      {
        id: 'I07',
        conceptId: 'religion-as-agent',
        statement: '종교 공동체에서는 상징물을 쓰는 방식과 의례, 구성원으로 기대되는 역할을 배운다',
        cues: ['종교', '의례', '상징물', '교회', '모스크'],
        weight: 'core',
      },
      {
        id: 'I08',
        conceptId: 'religion-as-agent',
        statement: '종교 제도는 사회적 가치와 일부 성별 규범을 전달하거나 강화할 수 있다',
        cues: ['사회적 가치', '성별 규범', '강화'],
        weight: 'supporting',
      },
      {
        id: 'I09',
        conceptId: 'government-as-agent',
        statement: '정부는 법과 제도로 새로운 지위를 갖는 시점과 그 지위에서 따를 규칙을 정한다',
        cues: ['정부', '법과 제도', '새로운 지위', '성인', '납세자'],
        weight: 'core',
      },
      {
        id: 'I10',
        conceptId: 'government-as-agent',
        statement: '교재의 미국 법적 나이나 등록 제도를 한국에 그대로 적용하면 안 되며, 개념과 특정 국가의 제도는 구별해야 한다',
        cues: ['미국', '한국에도 그대로', '구별'],
        weight: 'core',
      },
      {
        id: 'I11',
        conceptId: 'mass-media',
        statement: '대중매체는 물질문화에 관한 정보뿐 아니라 가치·신념·규범 같은 비물질문화도 전달한다',
        cues: ['대중매체', '신문', '텔레비전', '인터넷', '비물질문화도'],
        weight: 'core',
      },
      {
        id: 'I12',
        conceptId: 'princess-culture',
        statement: "'매체가 역할 기대를 전달할 수 있다'는 논점과 '특정 영화를 본 모든 아이가 같은 행동을 한다'는 과장된 주장은 구별해야 한다",
        cues: ['공주 문화', '고정관념', '과장된 주장', '다양한 방식으로 해석'],
        weight: 'core',
      },
      {
        id: 'I13',
        conceptId: 'agents-of-socialization',
        statement: '네 기관은 서로 배타적이지 않아 한 사람이 동시에 여러 기관에서 사회화될 수 있다',
        cues: ['배타적이지 않', '동시에'],
        weight: 'supporting',
      },
    ],
  },
]

/**
 * Which lecture this transcript is.
 *
 * The learner uploads a file and never says which one it is, so the list is
 * chosen by what the text contains: each rubric names a handful of phrases
 * that appear in its lecture and not in the others, and the best match wins.
 * No match at all means a lecture nothing here covers, and the caller is
 * expected to say so rather than check against the wrong list.
 */
export function pickRubric(chunks = []) {
  const whole = chunks.map((chunk) => String(chunk?.text || '')).join('\n')
  let best = null
  for (const rubric of RUBRICS) {
    const score = rubric.detect.filter((phrase) => whole.includes(phrase)).length
    if (score >= 2 && (!best || score > best.score)) best = { rubric, score }
  }
  return best?.rubric || null
}

export function rubricById(rubricId) {
  return RUBRICS.find((item) => item.rubricId === rubricId) || null
}

export default RUBRICS[0]
