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
    "note": "Chapter 5 사회화만 다룹니다. 다른 단원은 지원하지 않습니다.",
    "derivedFrom": "socialization_concept_summary_ko.md"
  },
  "concepts": [
    {
      "conceptId": "socialization",
      "termKo": "사회화",
      "termEn": "socialization",
      "aliases": ["사회화 과정"],
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
      "related": ["agents-of-socialization", "nature-nurture", "self"],
      "source": { "section": "5.2", "pages": "119, 136" },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "self",
      "termKo": "자아",
      "termEn": "self",
      "aliases": ["자아 발달", "self-development"],
      "definitionKo": "사회적 상호작용을 통해 발달한 개인의 구별되는 정체성 감각.",
      "keyPoints": [
        "유전적·생물학적 특성만으로 결정되지 않음",
        "다른 사람과의 상호작용을 통해 발달함"
      ],
      "misconceptions": [
        "자아 발달 이론은 하나의 동일한 이론이 아니라 여러 학자의 관점으로 제시됨"
      ],
      "related": ["looking-glass-self", "generalized-other", "mead-stages"],
      "source": { "section": "5.1", "pages": "119–122, 136" },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "looking-glass-self",
      "termKo": "거울 자아",
      "termEn": "looking-glass self",
      "aliases": ["쿨리의 거울 자아", "Cooley"],
      "definitionKo": "개인이 다른 사람이 자신을 어떻게 바라보고 반응한다고 생각하는지를 통해 자신을 이해한다는 쿨리(Cooley)의 개념.",
      "keyPoints": ["타인의 반응을 통해 자신을 바라보는 과정"],
      "misconceptions": [
        "일반화된 타자와 다름. 거울 자아는 타인의 반응에, 일반화된 타자는 사회 전체의 공유된 기대에 초점이 있음"
      ],
      "related": ["self", "significant-others", "generalized-other"],
      "source": { "section": "5.1", "pages": "120–121" },
      "visualId": null
    },
    {
      "conceptId": "significant-others",
      "termKo": "중요한 타자",
      "termEn": "significant others",
      "aliases": [],
      "definitionKo": "자아 형성에 특별히 큰 영향을 미치는 구체적인 사람들.",
      "keyPoints": ["미드의 설명에서 타자의 영향력을 구별할 때 등장함"],
      "misconceptions": [],
      "related": ["generalized-other", "self"],
      "source": { "section": "5.1", "pages": "120–121" },
      "visualId": null
    },
    {
      "conceptId": "generalized-other",
      "termKo": "일반화된 타자",
      "termEn": "generalized other",
      "aliases": ["일반화된 타인"],
      "definitionKo": "특정 개인이 아니라 사회 전반에 공유된 행동 기대를 이해하고 고려하는 관점.",
      "keyPoints": ["특정 상황을 넘어 공동체의 일반적 기대를 고려함"],
      "misconceptions": [
        "거울 자아와 다름. 일반화된 타자는 사회 전체의 공유된 기대를 고려하는 관점임"
      ],
      "related": ["mead-stages", "significant-others", "self"],
      "source": { "section": "5.1", "pages": "121, 136" },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "mead-stages",
      "termKo": "미드의 자아 발달 단계",
      "termEn": "Mead's stages of self-development",
      "aliases": ["준비 단계", "놀이 단계", "게임 단계", "Mead"],
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
      "related": ["self", "generalized-other"],
      "source": { "section": "5.1", "pages": "121" },
      "visualId": "mead-self-development-v1"
    },
    {
      "conceptId": "nature-nurture",
      "termKo": "본성과 양육",
      "termEn": "nature and nurture",
      "aliases": ["본성", "양육", "nature", "nurture"],
      "definitionKo": "본성은 자아 발달에 작용하는 유전적 구성과 생물학적 영향이고, 양육은 자아 발달에 작용하는 사회적 환경의 영향이다.",
      "keyPoints": [
        "여기서 양육(nurture)은 부모의 양육 행위보다 넓은 뜻",
        "유전과 사회 환경의 상대적 영향을 검토하기 위해 쌍둥이 연구와 사회적 고립 사례를 논의함"
      ],
      "misconceptions": [
        "반드시 하나만 작동하는 경쟁 요인이 아님",
        "쌍둥이 연구나 고립 사례 하나로 모든 인과관계를 확정할 수 없음"
      ],
      "related": ["socialization", "self"],
      "source": { "section": "5.2", "pages": "122–125, 136" },
      "visualId": null
    },
    {
      "conceptId": "agents-of-socialization",
      "termKo": "사회화 기관",
      "termEn": "agents of socialization",
      "aliases": ["사회화 경로"],
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
      "related": ["socialization", "peer-group", "hidden-curriculum"],
      "source": { "section": "5.3", "pages": "125–131" },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "peer-group",
      "termKo": "또래집단",
      "termEn": "peer group",
      "aliases": [],
      "definitionKo": "연령과 사회적 지위가 비슷하고 관심사를 공유하는 사람들의 집단.",
      "keyPoints": ["비슷한 연령·지위의 구성원과 상호작용하며 기대와 규범을 익힘"],
      "misconceptions": [],
      "related": ["agents-of-socialization"],
      "source": { "section": "5.3", "pages": "136" },
      "visualId": "agents-of-socialization-v1"
    },
    {
      "conceptId": "hidden-curriculum",
      "termKo": "잠재적 교육과정",
      "termEn": "hidden curriculum",
      "aliases": ["학교의 비공식적 가르침"],
      "definitionKo": "학교에서 공식 교과 내용과 별개로 일어나는 비공식적 가르침. 사회 규범을 익히도록 한다.",
      "keyPoints": ["줄 서기", "차례 기다리기", "공동 과제 수행", "규칙 준수", "경쟁과 협력의 경험"],
      "misconceptions": ["교사가 몰래 계획한 수업과 같지 않음"],
      "related": ["agents-of-socialization", "socialization"],
      "source": { "section": "5.3", "pages": "128–129, 136" },
      "visualId": "hidden-curriculum-v1"
    },
    {
      "conceptId": "anticipatory-socialization",
      "termKo": "예기 사회화",
      "termEn": "anticipatory socialization",
      "aliases": [],
      "definitionKo": "미래에 맡게 될 사회적 역할을 준비하며 필요한 행동과 기대를 미리 배우는 과정.",
      "keyPoints": ["핵심은 아직 맡지 않은 역할에 대한 선행 학습"],
      "misconceptions": ["재사회화와 필연적인 선후 관계가 아님"],
      "related": ["resocialization", "socialization"],
      "source": { "section": "5.4", "pages": "136" },
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
      "related": ["anticipatory-socialization", "total-institution"],
      "source": { "section": "5.4", "pages": "133–136" },
      "visualId": "socialization-comparison-v1"
    },
    {
      "conceptId": "total-institution",
      "termKo": "총체적 시설",
      "termEn": "total institution",
      "aliases": [],
      "definitionKo": "구성원의 일상생활을 폭넓게 통제하는 제도적 환경.",
      "keyPoints": ["재사회화의 강도 높은 맥락으로 논의됨"],
      "misconceptions": [],
      "related": ["resocialization", "degradation-ceremony"],
      "source": { "section": "5.4", "pages": "131–136" },
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
      "related": ["total-institution", "resocialization"],
      "source": { "section": "5.4", "pages": "136" },
      "visualId": null
    }
  ]
}
