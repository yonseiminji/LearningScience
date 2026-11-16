// Chapter 5 사회화 — 검증된 개념 지식베이스.
//
// A .js module rather than .json on purpose: Vercel functions run real Node,
// where a bare JSON import throws without an import attribute, and the file
// has to be traced into the function bundle. _fewshots.js is here for the
// same reason. Vite imports this just as happily from the browser side.

export default {
  "materialId": "demo-socialization",
  "scope": {
    "book": "Introduction to Sociology – 3rd Canadian Edition",
    "author": "William Little",
    "publisher": "BCcampus",
    "year": 2023,
    "chapter": 5,
    "sourceUrl": "https://opentextbc.ca/introductiontosociology3rdedition/",
    "licence": "CC BY 4.0 (일부 제3자 자료는 별도 권리)",
    "pages": "인쇄 쪽수는 확인되지 않아 인용하지 않습니다. 절과 행 번호로 표시해요.",
    "note": "Chapter 5 사회화를 다룹니다. 업로드한 강의 전사문에 나오는 개념만 화면에 보여요.",
    "derivedFrom": "bccampus_socialization_ch05_ko.js (543 blocks, 47 terms)"
  },
  "concepts": [
    {
      "conceptId": "socialization",
      "termKo": "사회화",
      "termEn": "socialization",
      "aliases": [
        "사회화 과정",
        "생애과정",
        "동조"
      ],
      "definitionKo": "사람이 사회의 규범과 기대를 이해하고, 신념을 받아들이며, 가치를 인식하게 되는 과정.",
      "keyPoints": [
        "개인이 사회 구성원으로 살아가는 방식을 배우는 과정",
        "사회의 문화와 규범이 지속되도록 하는 과정",
        "아동기에만 일어나지 않고 새로운 집단·직업·생애 단계로 이동할 때도 계속됨"
      ],
      "misconceptions": [
        "사교·교류(socializing)와 같은 말이 아님",
        "개인의 모든 행동이 사회에 의해 완전히 결정된다는 뜻이 아님"
      ],
      "related": [
        "agents-of-socialization",
        "nature-nurture",
        "self"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          1
        ],
        "inEdition": true
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "self",
      "termKo": "자아",
      "termEn": "self",
      "aliases": [
        "자아 발달",
        "self-development",
        "사회적 구조로서의 자아"
      ],
      "definitionKo": "사회적 상호작용을 통해 발달한 개인의 구별되는 정체성 감각.",
      "keyPoints": [
        "유전적·생물학적 특성만으로 결정되지 않음",
        "다른 사람과의 상호작용을 통해 발달함"
      ],
      "misconceptions": [
        "자아 발달 이론은 하나의 동일한 이론이 아니라 여러 학자의 관점으로 제시됨"
      ],
      "related": [
        "looking-glass-self",
        "i-and-me",
        "mead-stages"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          7
        ],
        "inEdition": true
      },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "looking-glass-self",
      "termKo": "거울 자아",
      "termEn": "looking-glass self",
      "aliases": [
        "쿨리의 거울 자아",
        "Cooley",
        "거울 속 자아"
      ],
      "definitionKo": "개인이 다른 사람이 자신을 어떻게 바라보고 반응한다고 생각하는지를 통해 자신을 이해한다는 쿨리(Cooley)의 개념.",
      "keyPoints": [
        "타인의 반응을 통해 자신을 바라보는 과정"
      ],
      "misconceptions": [
        "일반화된 타자와 다름. 거울 자아는 타인의 반응에, 일반화된 타자는 사회 전체의 공유된 기대에 초점이 있음"
      ],
      "related": [
        "self",
        "generalized-other"
      ],
      "source": {
        "section": "5.1",
        "lines": [
          60
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "generalized-other",
      "termKo": "일반화된 타자",
      "termEn": "generalized other",
      "aliases": [
        "일반화된 타인"
      ],
      "definitionKo": "특정 개인이 아니라 사회 전반에 공유된 행동 기대를 이해하고 고려하는 관점.",
      "keyPoints": [
        "특정 상황을 넘어 공동체의 일반적 기대를 고려함"
      ],
      "misconceptions": [
        "거울 자아와 다름. 일반화된 타자는 사회 전체의 공유된 기대를 고려하는 관점임"
      ],
      "related": [
        "mead-stages",
        "self"
      ],
      "source": {
        "section": "5.1",
        "lines": [
          122
        ],
        "inEdition": true
      },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "mead-stages",
      "termKo": "미드의 자아 발달 단계",
      "termEn": "Mead's stages of self-development",
      "aliases": [
        "준비 단계",
        "놀이 단계",
        "게임 단계",
        "Mead",
        "역할 취하기"
      ],
      "definitionKo": "준비 단계, 놀이 단계, 게임 단계를 거쳐 일반화된 타자를 이해하게 되는 자아 발달의 단계적 설명.",
      "keyPoints": [
        "준비 단계: 타인의 행동을 모방하지만 타인의 관점을 충분히 상상하지 못함",
        "놀이 단계: 부모 등 한 사람의 역할을 맡아 그 관점을 연습함",
        "게임 단계: 여러 사람의 역할과 상호관계를 동시에 고려함",
        "일반화된 타자: 특정 상황을 넘어 공동체의 일반적 기대를 고려함"
      ],
      "misconceptions": [
        "단계적 설명이며, 각 단계가 다음 단계를 일으킨다는 인과관계로 단정할 수 없음"
      ],
      "related": [
        "self",
        "generalized-other"
      ],
      "source": {
        "section": "5.1",
        "lines": [
          109
        ],
        "inEdition": true
      },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "nature-nurture",
      "termKo": "본성과 양육",
      "termEn": "nature and nurture",
      "aliases": [
        "본성",
        "양육",
        "nature",
        "nurture",
        "본성 대 양육"
      ],
      "definitionKo": "본성은 자아 발달에 작용하는 유전적 구성과 생물학적 영향이고, 양육은 자아 발달에 작용하는 사회적 환경의 영향이다.",
      "keyPoints": [
        "여기서 양육(nurture)은 부모의 양육 행위보다 넓은 뜻",
        "유전과 사회 환경의 상대적 영향을 검토하기 위해 쌍둥이 연구와 사회적 고립 사례를 논의함"
      ],
      "misconceptions": [
        "반드시 하나만 작동하는 경쟁 요인이 아님",
        "쌍둥이 연구나 고립 사례 하나로 모든 인과관계를 확정할 수 없음"
      ],
      "related": [
        "socialization",
        "self"
      ],
      "source": {
        "section": "5.2",
        "lines": [
          194
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "agents-of-socialization",
      "termKo": "사회화 기관",
      "termEn": "agents of socialization",
      "aliases": [
        "사회화 경로",
        "사회화 주체",
        "공식 제도"
      ],
      "definitionKo": "개인이 규범·가치·행동 기대를 배우는 데 영향을 미치는 사람, 집단, 제도.",
      "keyPoints": [
        "가족: 초기 사회화와 행동·가치의 학습",
        "또래집단: 비슷한 연령·지위의 구성원과 상호작용하며 기대와 규범을 익힘",
        "학교: 공식 교육뿐 아니라 규칙 준수, 협력, 경쟁, 차례 기다리기 등을 학습",
        "직장: 조직문화와 직업적 행동 방식에 적응",
        "종교·정부·미디어: 제도와 매체를 통해 가치와 규범이 전달·강화됨"
      ],
      "misconceptions": [
        "한 기관이 언제나 하나의 방식으로만 사회화하지는 않음. 사회와 문화에 따라 달라질 수 있음"
      ],
      "related": [
        "socialization",
        "peer-group",
        "hidden-curriculum"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          16
        ],
        "inEdition": true
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "peer-group",
      "termKo": "또래집단",
      "termEn": "peer group",
      "aliases": [
        "동년배 집단"
      ],
      "definitionKo": "연령과 사회적 지위가 비슷하고 관심사를 공유하는 사람들의 집단.",
      "keyPoints": [
        "비슷한 연령·지위의 구성원과 상호작용하며 기대와 규범을 익힘"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          18
        ],
        "inEdition": true
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "hidden-curriculum",
      "termKo": "잠재적 교육과정",
      "termEn": "hidden curriculum",
      "aliases": [
        "학교의 비공식적 가르침",
        "숨은 교육과정"
      ],
      "definitionKo": "학교에서 공식 교과 내용과 별개로 일어나는 비공식적 가르침. 사회 규범을 익히도록 한다.",
      "keyPoints": [
        "줄 서기",
        "차례 기다리기",
        "공동 과제 수행",
        "규칙 준수",
        "경쟁과 협력의 경험"
      ],
      "misconceptions": [
        "교사가 몰래 계획한 수업과 같지 않음"
      ],
      "related": [
        "agents-of-socialization",
        "socialization"
      ],
      "source": {
        "section": "5.3",
        "lines": [
          319
        ],
        "inEdition": true
      },
      "visualId": "hidden-curriculum-v1"
    },
    {
      "conceptId": "anticipatory-socialization",
      "termKo": "예기 사회화",
      "termEn": "anticipatory socialization",
      "aliases": [
        "예상 사회화"
      ],
      "definitionKo": "미래에 맡게 될 사회적 역할을 준비하며 필요한 행동과 기대를 미리 배우는 과정.",
      "keyPoints": [
        "핵심은 아직 맡지 않은 역할에 대한 선행 학습"
      ],
      "misconceptions": [
        "재사회화와 필연적인 선후 관계가 아님"
      ],
      "related": [
        "resocialization",
        "socialization"
      ],
      "source": {
        "section": "5.4",
        "lines": [
          401
        ],
        "inEdition": true
      },
      "visualId": "socialization-comparison-v1"
    },
    {
      "conceptId": "resocialization",
      "termKo": "재사회화",
      "termEn": "resocialization",
      "aliases": [],
      "definitionKo": "기존의 행동 방식을 버리거나 바꾸고 그 자리에 새로운 행동 방식을 학습하는 과정.",
      "keyPoints": [
        "핵심은 이미 습득한 행동의 재구성",
        "군 조직에서 민간 생활로 복귀하거나 새로운 조직문화에 적응하는 과정으로 설명됨"
      ],
      "misconceptions": [
        "모든 생애 전환이 동일한 강도의 재사회화를 요구하지는 않음",
        "예기 사회화 다음에 반드시 오는 단계가 아님"
      ],
      "related": [
        "anticipatory-socialization",
        "total-institution"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          23
        ],
        "inEdition": true
      },
      "visualId": "socialization-comparison-v1"
    },
    {
      "conceptId": "total-institution",
      "termKo": "총체적 시설",
      "termEn": "total institution",
      "aliases": [
        "전체 시설",
        "총체적 기관"
      ],
      "definitionKo": "구성원의 일상생활을 폭넓게 통제하는 제도적 환경.",
      "keyPoints": [
        "재사회화의 강도 높은 맥락으로 논의됨"
      ],
      "misconceptions": [],
      "related": [
        "resocialization",
        "degradation-ceremony"
      ],
      "source": {
        "section": "5.2",
        "lines": [
          235
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "degradation-ceremony",
      "termKo": "정체성 박탈 의례",
      "termEn": "degradation ceremony",
      "aliases": [
        "지위 박탈 의례",
        "지위 강등 의례",
        "인격 박탈 의례"
      ],
      "definitionKo": "총체적 시설에 새로 들어온 구성원의 기존 정체성 일부를 제거하고 새로운 정체성을 부여하는 과정.",
      "keyPoints": [],
      "misconceptions": [],
      "related": [
        "total-institution",
        "resocialization"
      ],
      "source": {
        "section": "5.4",
        "lines": [
          435
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "gender-socialization",
      "termKo": "성별 사회화",
      "termEn": "gender socialization",
      "aliases": [
        "성별 기대",
        "에갈리아",
        "젠더 수행",
        "젠더 도식"
      ],
      "definitionKo": "사회가 남성과 여성에게 서로 다른 행동과 역할을 기대하고, 아이들이 성장하면서 그 기대를 학습하는 과정.",
      "keyPoints": [
        "여자아이에게 외모를 칭찬하고 남자아이에게 다른 특성을 강조하는 일상적 상호작용도 성별 기대를 전달할 수 있음",
        "스웨덴의 에갈리아 유치원은 성별에 따른 기대를 강화하지 않으려는 교육 환경을 시도한 사례",
        "일상적인 언어와 환경이 역할 기대를 전달할 수 있다는 점이 핵심"
      ],
      "misconceptions": [
        "모든 가정이나 모든 아이에게 똑같이 적용된다는 뜻이 아님",
        "특정 교육 방식을 정답이라고 선언하는 사례가 아님"
      ],
      "related": [
        "socialization"
      ],
      "source": {
        "section": "5.1",
        "lines": [
          165
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "material-culture",
      "termKo": "물질문화",
      "termEn": "material culture",
      "aliases": [],
      "definitionKo": "복사기나 책상, 업무 도구처럼 형태가 있는 대상을 포함하는 문화 요소.",
      "keyPoints": [
        "눈에 보이는 물건을 사용하는 방법이 여기에 해당함"
      ],
      "misconceptions": [
        "물건을 다룰 줄 아는 것만으로 조직에 적응한 것은 아님"
      ],
      "related": [
        "nonmaterial-culture",
        "workplace-socialization"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          44
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "nonmaterial-culture",
      "termKo": "비물질문화",
      "termEn": "nonmaterial culture",
      "aliases": [],
      "definitionKo": "구성원 사이의 기대, 가치, 믿음, 행동 규칙처럼 물리적인 사물로만 설명할 수 없는 문화 요소.",
      "keyPoints": [
        "상사에게 의견을 말하는 정도, 회의에서 발언하는 순서 같은 조직 규범이 여기에 해당함"
      ],
      "misconceptions": [],
      "related": [
        "material-culture",
        "workplace-socialization"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          44
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "workplace-socialization",
      "termKo": "직장에서의 사회화",
      "termEn": "workplace socialization",
      "aliases": [
        "직장",
        "조직의 관행",
        "공식 제도"
      ],
      "definitionKo": "직장에서 업무 방법뿐 아니라 시간을 지키고 조직의 관행을 따르는 방식을 배우는 과정.",
      "keyPoints": [
        "업무 방법을 배움",
        "시간을 지키는 것도 배움",
        "조직의 관행을 따르는 방식을 배움"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization",
        "mass-media"
      ],
      "source": {
        "section": "5.3",
        "lines": [
          342
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "mass-media",
      "termKo": "대중매체",
      "termEn": "mass media",
      "aliases": [
        "매스미디어"
      ],
      "definitionKo": "신문, 텔레비전, 라디오, 인터넷처럼 많은 사람에게 정보를 전달하는 경로.",
      "keyPoints": [
        "새로운 기술이나 물건에 관한 정보를 전달함",
        "무엇이 중요하거나 바람직하다고 여겨지는지에 관한 메시지도 전달함",
        "물질문화뿐 아니라 가치·신념·규범 같은 비물질문화도 전달할 수 있음"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization",
        "nonmaterial-culture"
      ],
      "source": {
        "section": "5.0",
        "lines": [
          19
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "i-and-me",
      "termKo": "I와 me",
      "termEn": "'I' and 'me'",
      "aliases": [
        "'I'와 'me'",
        "자아의 두 측면",
        "주체적 자아",
        "객체적 자아",
        "성찰적 자아"
      ],
      "definitionKo": "미드가 나눈 자아의 두 측면. 'me'는 타인의 태도와 사회적 기대를 받아들이는 측면이고, 'I'는 그 기대에 자발적으로 반응하는 측면이다.",
      "keyPoints": [
        "'me': 다른 사람들이 나에게 갖는 태도와 사회적 기대를 받아들이는 측면",
        "'I': 그 기대에 자발적으로 반응하는 측면",
        "수업 규칙을 지키려는 태도는 me, 규칙 안에서 자기 질문을 제기하는 반응은 I"
      ],
      "misconceptions": [
        "사회화가 사람을 똑같이 만드는 과정이라는 뜻이 아님"
      ],
      "related": [
        "self",
        "mead-stages"
      ],
      "source": {
        "section": "5.1",
        "lines": [
          102
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "rite-of-passage",
      "termKo": "통과의례",
      "termEn": "rite of passage",
      "aliases": [
        "졸업식"
      ],
      "definitionKo": "이전 지위에서 새로운 지위로 이동하는 생애주기 전환을 표시하는 의례.",
      "keyPoints": [
        "졸업식처럼 새로운 사회적 지위로의 전환을 상징하는 의식"
      ],
      "misconceptions": [],
      "related": [
        "anticipatory-socialization",
        "socialization"
      ],
      "source": {
        "section": "5.4",
        "lines": [
          395
        ],
        "inEdition": true
      },
      "visualId": null
    },
    {
      "conceptId": "individual-agency",
      "termKo": "개인의 행위주체성",
      "termEn": "individual agency",
      "aliases": [
        "행위주체성"
      ],
      "definitionKo": "같은 사회적 기대를 접하더라도 사람마다 다르게 반응할 수 있는 개인의 몫.",
      "keyPoints": [
        "사람들은 서로 다른 사회적 환경을 경험함",
        "같은 기대를 접해도 서로 다르게 반응할 수 있음"
      ],
      "misconceptions": [
        "사회화가 규범을 배우는 과정이라고 해서 모두가 같게 행동하는 것은 아님"
      ],
      "related": [
        "socialization",
        "nature-nurture"
      ],
      "source": {
        "section": "5.2",
        "lines": [
          233
        ],
        "inEdition": true
      },
      "visualId": null
    }
  ]
}
