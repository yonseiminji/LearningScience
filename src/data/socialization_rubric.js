// 통 인출 대조 항목 — 사회화 강의.
//
// Taken from the transcript, not from the chapter: the lecture decides what
// was taught, so a point the textbook makes but this lecture skipped is not
// on the list and its absence is not a gap.
//
// `cues` are not a keyword matcher. They record the wordings the lecture
// used, so the model has the paraphrase space written down and a human can
// see what each item was meant to cover. `weight` is not a score; it marks
// the statements the lecture built the rest on.

export const RUBRICS = [
  {
    rubricId: 'socialization-lecture-v2',
    title: '사회화, 자아 발달, 사회화 기관, 생애주기별 사회화',
    source: '가상 강의 전사문 · BCcampus Introduction to Sociology 3rd Canadian ed., Ch. 5 기반',
    note: '이 목록은 오늘 강의에서 다룬 내용이에요. 교재에는 있지만 강의에서 다루지 않은 내용은 들어 있지 않아요.',
    // Phrases this transcript uses, for telling it apart from another upload.
    detect: ['거울 자아', '일반화된 타자', '잠재적 교육과정', '예기 사회화', '통과의례'],
    items: [
      {
        id: 'S01',
        conceptId: 'socialization',
        statement: '사회화는 사회의 규범과 기대를 이해하고 신념과 가치를 배우며 필요한 역할을 익히는 과정이다',
        cues: ['규범과 기대', '신념과 가치', '역할을 익히는'],
        weight: 'core',
      },
      {
        id: 'S02',
        conceptId: 'socialization',
        statement: '사회화는 친구들과 어울리는 사교 활동이 아니다',
        cues: ['사교 활동', '친구들과 어울리'],
        weight: 'core',
      },
      {
        id: 'S03',
        conceptId: 'material-culture',
        statement: '식기를 사용하는 방법을 배우는 것은 물질문화를 사용하는 법을 배우는 일이다',
        cues: ['식기', '물질문화를 사용하'],
        weight: 'core',
      },
      {
        id: 'S28',
        conceptId: 'nonmaterial-culture',
        statement: '규범과 같은 비물질문화를 배우는 것도 사회화에 포함된다',
        cues: ['비물질문화', '규범과 같은'],
        weight: 'supporting',
      },
      {
        id: 'S04',
        conceptId: 'socialization',
        statement: '사회화는 개인의 사회생활을 가능하게 하고 사회가 문화를 이어 가게 한다',
        cues: ['개인의 사회생활', '문화를 이어'],
        weight: 'supporting',
      },
      {
        id: 'S05',
        conceptId: 'self',
        statement: '자아는 사회적 상호작용 속에서 형성되는 사회적 구조다',
        cues: ['사회적 상호작용', '사회적 구조', '정체성에 대한 감각'],
        weight: 'core',
      },
      {
        id: 'S06',
        conceptId: 'looking-glass-self',
        statement: '거울 자아에서 중요한 것은 타인이 실제로 생각한 바보다 내가 그 평가를 어떻게 상상하고 해석하느냐다',
        cues: ['쿨리', '거울 자아', '상상하고 해석', '표정'],
        weight: 'core',
      },
      {
        id: 'S07',
        conceptId: 'i-and-me',
        statement: "'me'는 타인의 태도와 사회적 기대를 받아들이는 측면이고 'I'는 그 기대에 자발적으로 반응하는 측면이다",
        cues: ["'I'", "'me'", '자발적으로 반응', '사회적 기대를 받아들이는'],
        weight: 'core',
      },
      {
        id: 'S08',
        conceptId: 'i-and-me',
        statement: '사회화는 사람을 똑같이 만드는 과정이 아니다',
        cues: ['똑같이 만드는'],
        weight: 'supporting',
      },
      {
        id: 'S09',
        conceptId: 'mead-stages',
        statement: '미드는 준비 단계, 놀이 단계, 게임 단계, 일반화된 타자의 네 단계로 설명한다',
        cues: ['준비 단계', '놀이 단계', '게임 단계', '네 단계'],
        weight: 'core',
      },
      {
        id: 'S10',
        conceptId: 'mead-stages',
        statement: '게임 단계에서는 여러 사람의 역할과 규칙을 동시에 이해한다',
        cues: ['게임 단계', '여러 사람의 역할', '야구'],
        weight: 'supporting',
      },
      {
        id: 'S11',
        conceptId: 'generalized-other',
        statement: '일반화된 타자는 실제로 존재하는 한 사람이 아니라 사회적으로 공유된 규범과 기대다',
        cues: ['일반화된 타자', '공유된 규범', '한 사람이 아니라'],
        weight: 'core',
      },
      {
        id: 'S12',
        conceptId: 'gender-socialization',
        statement: '아이들은 주변의 반응을 통해 젠더 기대를 배우고 젠더 도식을 형성할 수 있다',
        cues: ['젠더 수행', '젠더 도식', '옷이나 놀이'],
        weight: 'core',
      },
      {
        id: 'S13',
        conceptId: 'gender-socialization',
        statement: '배운 역할이 평생 바뀌지 않는다거나 모든 아이의 행동이 성별로 정해져 있다는 뜻은 아니다',
        cues: ['평생 바뀌지', '정해져 있다', '달라질 수도'],
        weight: 'core',
      },
      {
        id: 'S14',
        conceptId: 'nature-nurture',
        statement: '본성 대 양육 논쟁은 유전·생물학적 조건과 사회적 경험·환경의 영향을 함께 본다',
        cues: ['본성 대 양육', '유전', '쌍둥이 연구'],
        weight: 'core',
      },
      {
        id: 'S15',
        conceptId: 'individual-agency',
        statement: '같은 기대를 접하더라도 사람마다 다르게 반응할 수 있다는 개인의 행위주체성을 함께 생각한다',
        cues: ['행위주체성', '다르게 반응', '서로 다른 사회적 환경'],
        weight: 'core',
      },
      {
        id: 'S16',
        conceptId: 'agents-of-socialization',
        statement: '가족은 일상생활의 기본적인 행동과 가치를 처음 배우는 장소다',
        cues: ['가족', '처음 배우는'],
        weight: 'supporting',
      },
      {
        id: 'S17',
        conceptId: 'peer-group',
        statement: '또래집단에서는 놀이의 규칙과 소속감을 배우지만 인기나 지위에 따른 배제도 경험한다',
        cues: ['또래집단', '소속감', '배제'],
        weight: 'supporting',
      },
      {
        id: 'S18',
        conceptId: 'hidden-curriculum',
        statement: '잠재적 교육과정은 공식 교육 내용과 별개로 비공식적으로 학습하는 규범과 기대다',
        cues: ['잠재적 교육과정', '비공식', '시간표', '경쟁', '협력'],
        weight: 'core',
      },
      {
        id: 'S19',
        conceptId: 'workplace-socialization',
        statement: '직장에서는 업무 방법뿐 아니라 시간을 지키고 조직의 관행을 따르는 방식도 배운다',
        cues: ['직장', '업무 방법', '시간을 지키', '관행'],
        weight: 'supporting',
      },
      {
        id: 'S20',
        conceptId: 'mass-media',
        statement: '대중매체는 바람직한 삶의 방식에 대한 메시지를 전하지만 비현실적인 기대를 만들 수도 있다',
        cues: ['대중매체', '바람직한', '비현실적인 기대'],
        weight: 'supporting',
      },
      {
        id: 'S21',
        conceptId: 'socialization',
        statement: '교재가 캐나다판이므로 북미 사례를 한국 사회의 일반적 사실로 받아들이지 않아야 한다',
        cues: ['캐나다판', '북미', '한국 사회'],
        weight: 'core',
      },
      {
        id: 'S22',
        conceptId: 'rite-of-passage',
        statement: '통과의례는 졸업식처럼 새로운 사회적 지위로의 전환을 상징하는 의식이다',
        cues: ['통과의례', '졸업식', '전환을 상징'],
        weight: 'core',
      },
      {
        id: 'S23',
        conceptId: 'anticipatory-socialization',
        statement: '예기 사회화는 앞으로 맡게 될 역할을 미리 준비하는 것이다',
        cues: ['예기 사회화', '미리 준비', '인턴십'],
        weight: 'core',
      },
      {
        id: 'S24',
        conceptId: 'resocialization',
        statement: '재사회화는 익숙해진 행동을 바꾸고 새로운 규칙과 역할을 배우는 과정이다',
        cues: ['재사회화', '익숙해진 행동', '새로운 규칙'],
        weight: 'core',
      },
      {
        id: 'S25',
        conceptId: 'total-institution',
        statement: '총체적 시설은 군대나 교도소처럼 외부 사회와 분리되어 생활이 강하게 통제되는 곳이다',
        cues: ['총체적 시설', '군대', '교도소', '분리'],
        weight: 'core',
      },
      {
        id: 'S26',
        conceptId: 'degradation-ceremony',
        statement: '지위박탈 의례는 기존 정체성을 약화시키고 새 정체성을 부여하는 절차다',
        cues: ['지위박탈', '기존 정체성', '새 정체성'],
        weight: 'core',
      },
      {
        id: 'S27',
        conceptId: 'resocialization',
        statement: '캐나다 원주민 기숙학교 사례처럼 재사회화가 강제동화와 억압에 쓰일 수 있으므로 늘 좋은 과정으로 보아서는 안 된다',
        cues: ['기숙학교', '강제동화', '억압', '좋은 과정으로'],
        weight: 'core',
      },
    ],
  },
]

/**
 * Which lecture this transcript is.
 *
 * One rubric for now, but the check is still by content rather than by
 * assuming: an upload that is not this lecture gets no list, and the
 * whole-lecture level says so instead of checking against the wrong one.
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
