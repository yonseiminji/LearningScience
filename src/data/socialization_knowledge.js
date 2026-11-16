// Chapter 5 사회화 — 검증된 개념 지식베이스.
//
// A .js module rather than .json on purpose: Vercel functions run real Node,
// where a bare JSON import throws without an import attribute, and the file
// has to be traced into the function bundle. _fewshots.js is here for the
// same reason. Vite imports this just as happily from the browser side.

export default {
  "materialId": "demo-socialization",
  "scope": {
    "book": "Introduction to Sociology 3e",
    "publisher": "OpenStax",
    "chapter": 5,
    "pages": "117–139",
    "license": "CC BY-NC-SA 4.0",
    "note": "Chapter 5 사회화를 다룹니다. 업로드한 강의 전사문에 나오는 개념만 화면에 보여요.",
    "derivedFrom": "socialization_concept_summary_ko.md + 강의 전사문 3편"
  },
  "concepts": [
    {
      "conceptId": "socialization",
      "termKo": "사회화",
      "termEn": "socialization",
      "aliases": [
        "사회화 과정"
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
        "section": "5.2",
        "pages": "119, 136"
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "self",
      "termKo": "자아",
      "termEn": "self",
      "aliases": [
        "자아 발달",
        "self-development"
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
        "generalized-other",
        "mead-stages"
      ],
      "source": {
        "section": "5.1",
        "pages": "119–122, 136"
      },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "looking-glass-self",
      "termKo": "거울 자아",
      "termEn": "looking-glass self",
      "aliases": [
        "쿨리의 거울 자아",
        "Cooley"
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
        "significant-others",
        "generalized-other"
      ],
      "source": {
        "section": "5.1",
        "pages": "120–121"
      },
      "visualId": null
    },
    {
      "conceptId": "significant-others",
      "termKo": "중요한 타자",
      "termEn": "significant others",
      "aliases": [],
      "definitionKo": "자아 형성에 특별히 큰 영향을 미치는 구체적인 사람들.",
      "keyPoints": [
        "미드의 설명에서 타자의 영향력을 구별할 때 등장함"
      ],
      "misconceptions": [],
      "related": [
        "generalized-other",
        "self"
      ],
      "source": {
        "section": "5.1",
        "pages": "120–121"
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
        "significant-others",
        "self"
      ],
      "source": {
        "section": "5.1",
        "pages": "121, 136"
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
        "Mead"
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
        "pages": "121"
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
        "nurture"
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
        "pages": "122–125, 136"
      },
      "visualId": null
    },
    {
      "conceptId": "agents-of-socialization",
      "termKo": "사회화 기관",
      "termEn": "agents of socialization",
      "aliases": [
        "사회화 경로"
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
        "section": "5.3",
        "pages": "125–131"
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "peer-group",
      "termKo": "또래집단",
      "termEn": "peer group",
      "aliases": [],
      "definitionKo": "연령과 사회적 지위가 비슷하고 관심사를 공유하는 사람들의 집단.",
      "keyPoints": [
        "비슷한 연령·지위의 구성원과 상호작용하며 기대와 규범을 익힘"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization"
      ],
      "source": {
        "section": "5.3",
        "pages": "136"
      },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "hidden-curriculum",
      "termKo": "잠재적 교육과정",
      "termEn": "hidden curriculum",
      "aliases": [
        "학교의 비공식적 가르침"
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
        "pages": "128–129, 136"
      },
      "visualId": "hidden-curriculum-v1"
    },
    {
      "conceptId": "anticipatory-socialization",
      "termKo": "예기 사회화",
      "termEn": "anticipatory socialization",
      "aliases": [],
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
        "pages": "136"
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
        "section": "5.4",
        "pages": "133–136"
      },
      "visualId": "socialization-comparison-v1"
    },
    {
      "conceptId": "total-institution",
      "termKo": "총체적 시설",
      "termEn": "total institution",
      "aliases": [],
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
        "section": "5.4",
        "pages": "131–136"
      },
      "visualId": null
    },
    {
      "conceptId": "degradation-ceremony",
      "termKo": "정체성 박탈 의례",
      "termEn": "degradation ceremony",
      "aliases": [],
      "definitionKo": "총체적 시설에 새로 들어온 구성원의 기존 정체성 일부를 제거하고 새로운 정체성을 부여하는 과정.",
      "keyPoints": [],
      "misconceptions": [],
      "related": [
        "total-institution",
        "resocialization"
      ],
      "source": {
        "section": "5.4",
        "pages": "136"
      },
      "visualId": null
    },
    {
      "conceptId": "moral-development",
      "termKo": "도덕 발달",
      "termEn": "moral development",
      "aliases": [],
      "definitionKo": "무엇이 옳고 그른지 판단하는 방식이 발달하는 과정. 사회화의 한 측면이다.",
      "keyPoints": [
        "규칙을 외우는 일이 아님",
        "행동을 정할 때 나의 욕구뿐 아니라 타인에게 미치는 영향과 사회가 옳다고 보는 기준을 함께 고려함",
        "사회가 원활하게 기능하는 데 중요하다고 교재는 설명함"
      ],
      "misconceptions": [
        "규칙을 많이 아는 것과 같지 않음"
      ],
      "related": [
        "kohlberg-levels",
        "socialization"
      ],
      "source": {
        "section": "5.1",
        "pages": "121–122"
      },
      "visualId": null
    },
    {
      "conceptId": "kohlberg-levels",
      "termKo": "콜버그의 도덕 발달 수준",
      "termEn": "Kohlberg's levels of moral development",
      "aliases": [
        "콜버그",
        "전인습 수준",
        "인습 수준",
        "후인습 수준",
        "preconventional",
        "conventional",
        "postconventional"
      ],
      "definitionKo": "옳고 그름을 판단하는 기준이 달라지는 세 수준: 전인습, 인습, 후인습.",
      "keyPoints": [
        "전인습 수준: 당장 자신이 경험하는 결과를 중심으로 판단함",
        "인습 수준: 타인의 감정을 의식하고 고려하기 시작함",
        "후인습 수준: 도덕을 추상적인 원칙으로 생각하고, 법적으로 허용되는 행동과 도덕적으로 옳은 행동이 반드시 일치하지는 않음을 인식함"
      ],
      "misconceptions": [
        "쉬운 문제·중간 문제·어려운 문제 같은 난도 구분이 아님",
        "이름만 외우는 것이 아니라 판단 기준이 어떻게 달라지는지를 설명할 수 있어야 함"
      ],
      "related": [
        "moral-development",
        "gilligan-critique"
      ],
      "source": {
        "section": "5.1",
        "pages": "121–122"
      },
      "visualId": null
    },
    {
      "conceptId": "gilligan-critique",
      "termKo": "길리건의 비판",
      "termEn": "Gilligan's critique",
      "aliases": [
        "길리건",
        "캐럴 길리건",
        "정의의 관점",
        "돌봄과 책임의 관점",
        "Gilligan"
      ],
      "definitionKo": "콜버그의 연구 대상이 남성만이었다는 점을 지적하고, 성별에 따라 도덕 판단 양상이 다르게 나타나는지 연구한 비판.",
      "keyPoints": [
        "연구에서 남성은 규칙과 법을 강조하는 정의의 관점, 여성은 타인의 사정과 관계를 고려하는 돌봄과 책임의 관점을 보였다고 보고함",
        "길리건이 제기한 연구 설계상의 문제와, 그 연구가 보고한 성별 차이는 분리해서 생각해야 함"
      ],
      "misconceptions": [
        "'남성은 정의, 여성은 돌봄으로 판단한다'는 확정된 사실이 아님",
        "표본 크기가 작았고 보고된 차이가 후속 연구에서 재현되지 않았음"
      ],
      "related": [
        "kohlberg-levels",
        "gender-socialization"
      ],
      "source": {
        "section": "5.1",
        "pages": "122"
      },
      "visualId": null
    },
    {
      "conceptId": "gender-socialization",
      "termKo": "성별 사회화",
      "termEn": "gender socialization",
      "aliases": [
        "성별 기대",
        "에갈리아"
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
        "gilligan-critique",
        "socialization"
      ],
      "source": {
        "section": "5.1",
        "pages": "122–123"
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
        "section": "5.3",
        "pages": "126"
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
        "section": "5.3",
        "pages": "126"
      },
      "visualId": null
    },
    {
      "conceptId": "workplace-socialization",
      "termKo": "직장 사회화",
      "termEn": "workplace socialization",
      "aliases": [
        "온보딩",
        "조직 사회화",
        "직장문화"
      ],
      "definitionKo": "새 직장에서 업무 도구를 쓰는 방법과 조직의 행동 기대를 함께 배우는 과정.",
      "keyPoints": [
        "물질문화와 비물질문화가 모두 관여함",
        "적응의 책임이 신입 직원에게만 있지 않음",
        "조직은 온보딩과 사회화 프로그램으로 만족도·생산성·머무르는 정도를 높이려는 노력을 해야 함"
      ],
      "misconceptions": [
        "'새로 온 사람이 알아서 적응해야지'라고만 보면 조직 사회화의 한쪽 면을 놓침"
      ],
      "related": [
        "material-culture",
        "nonmaterial-culture",
        "agents-of-socialization"
      ],
      "source": {
        "section": "5.3",
        "pages": "126–127"
      },
      "visualId": null
    },
    {
      "conceptId": "religion-as-agent",
      "termKo": "종교를 통한 사회화",
      "termEn": "religion as an agent of socialization",
      "aliases": [
        "종교 공동체"
      ],
      "definitionKo": "종교 공동체에서 의례와 상징물을 사용하는 방식, 구성원으로 기대되는 역할을 배우는 과정.",
      "keyPoints": [
        "교회, 사원, 모스크, 유대교 회당 같은 공동체가 사례",
        "출생이나 결혼과 관련된 의례가 종교적 행사와 연결되기도 함",
        "사회적 가치와 일부 성별 규범을 전달하거나 강화할 수 있음"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization",
        "gender-socialization"
      ],
      "source": {
        "section": "5.3",
        "pages": "127–128"
      },
      "visualId": null
    },
    {
      "conceptId": "government-as-agent",
      "termKo": "정부를 통한 사회화",
      "termEn": "government as an agent of socialization",
      "aliases": [
        "법적 지위",
        "정부는 법과 제도",
        "정부가 사회화"
      ],
      "definitionKo": "법과 제도를 통해 사람이 새로운 지위를 갖는 시점과 그 지위에서 따라야 할 규칙을 정하는 사회화 경로.",
      "keyPoints": [
        "성인·납세자·노인 같은 새로운 범주에 들어갈 때 관련 절차와 역할을 배움",
        "교재의 성인 연령이나 복지제도는 미국의 사례"
      ],
      "misconceptions": [
        "교재에 나온 미국의 법적 나이나 등록 제도를 한국에 그대로 적용하면 안 됨",
        "사회학적 개념과 특정 국가의 제도적 조건은 구별해야 함"
      ],
      "related": [
        "agents-of-socialization"
      ],
      "source": {
        "section": "5.3",
        "pages": "128"
      },
      "visualId": null
    },
    {
      "conceptId": "mass-media",
      "termKo": "대중매체",
      "termEn": "mass media",
      "aliases": [],
      "definitionKo": "신문, 텔레비전, 라디오, 인터넷처럼 많은 사람에게 정보를 전달하는 경로.",
      "keyPoints": [
        "새로운 기술이나 물건에 관한 정보를 전달함",
        "무엇이 중요하거나 바람직하다고 여겨지는지에 관한 메시지도 전달함",
        "물질문화뿐 아니라 가치·신념·규범 같은 비물질문화도 전달할 수 있음"
      ],
      "misconceptions": [],
      "related": [
        "agents-of-socialization",
        "princess-culture",
        "nonmaterial-culture"
      ],
      "source": {
        "section": "5.3",
        "pages": "129–130"
      },
      "visualId": null
    },
    {
      "conceptId": "princess-culture",
      "termKo": "공주 문화",
      "termEn": "princess culture",
      "aliases": [],
      "definitionKo": "어린 여자아이를 대상으로 하는 영화나 상품이 외모와 성별 역할 기대를 전달할 수 있다는 논의.",
      "keyPoints": [
        "일부 연구자와 부모는 고정관념을 강화할 수 있다고 우려함",
        "같은 작품을 접해도 다른 놀이와 어른과의 대화를 통해 다양하게 해석할 수 있다는 관점도 있음"
      ],
      "misconceptions": [
        "'매체가 역할 기대를 전달할 수 있다'는 논점과 '특정 영화를 본 모든 아이가 같은 행동을 하게 된다'는 과장된 주장은 구별해야 함"
      ],
      "related": [
        "mass-media",
        "gender-socialization"
      ],
      "source": {
        "section": "5.3",
        "pages": "130"
      },
      "visualId": null
    }
  ]
}
