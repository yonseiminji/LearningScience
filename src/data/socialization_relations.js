// Chapter 5 사회화 — 유형화된 개념 관계 사전 (v2).
//
// 29 relations over 8 types, each anchored to a printed page. Supplied as the
// single source of truth for diagram generation; the Korean relation labels
// are audited interpretations, not the textbook’s own taxonomy.
//
// .js rather than .json for the reason the other data files are: Vercel
// functions run real Node, where a bare JSON import throws.

export default {
  "schemaVersion": "2.0.0",
  "metadata": {
    "source": "OpenStax Introduction to Sociology 3e, Chapter 5 (pp. 117–139)",
    "basedOn": "socialization_ch05_en_final_review.js",
    "englishOriginal": "verbatim short anchors; Korean relationship glosses are interpretive labels",
    "license": "CC BY-NC-SA 4.0",
    "note": "sourcePages are printed textbook pages; provenance: direct = anchored in source. Visual arrows are instructional encodings and must not be misread as causal models.",
    "purpose": "typed concept-relation lexicon for deterministic Mermaid layout generation",
    "classification": "schema designed for visualization; not an established taxonomy in the textbook",
    "provenancePolicy": "evidenceEn is a short source anchor, relationType and Korean labels are audited interpretations; not an LLM-generated causal conclusion",
    "caveats": [
      "CAUSES and CONTRASTS_WITH have no entries in the source-selected 29 relations; types supported but not fabricated",
      "sourcePages are printed textbook pages",
      "five socialization agents in the example diagrams do not exhaust all agents in the textbook"
    ]
  },
  "relationTypes": [
    {
      "id": "IS_A",
      "meaningKo": "상위-하위 개념",
      "diagramHint": "계층도",
      "rule": "A is a kind of B; 하위→상위"
    },
    {
      "id": "PART_OF",
      "meaningKo": "부분-전체 관계",
      "diagramHint": "구성도·트리",
      "rule": "A is a component/aspect of B; 부분→전체"
    },
    {
      "id": "PRECEDES",
      "meaningKo": "시간·발달 순서",
      "diagramHint": "순차형 체인",
      "rule": "A occurs before B; 순서만 뜻하며 인과 아님"
    },
    {
      "id": "CAUSES",
      "meaningKo": "원인-결과",
      "diagramHint": "원인-결과 방향 그래프",
      "rule": "A causally produces B; 명시적 인과 진술 필요"
    },
    {
      "id": "FACILITATES",
      "meaningKo": "지원·기여·매개",
      "diagramHint": "기여형 흐름도",
      "rule": "A helps/enables/contributes to B; 인과강도 단정 금지"
    },
    {
      "id": "EXAMPLE_OF",
      "meaningKo": "구체적 사례-개념",
      "diagramHint": "방사형·사례 모음",
      "rule": "A illustrates B; 사례→개념"
    },
    {
      "id": "CONTRASTS_WITH",
      "meaningKo": "비교·차이",
      "diagramHint": "병렬 비교",
      "rule": "A differs from B on a specified criterion; 대칭 관계"
    },
    {
      "id": "DEFINED_AS",
      "meaningKo": "정의·특징 기술",
      "diagramHint": "개념 설명도",
      "rule": "A is defined/characterized as B; 용어→설명"
    }
  ],
  "relations": [
    {
      "id": "REL-01",
      "category": "사회화의 정의",
      "subjectKo": "사회화",
      "relationKo": "규범·기대의 이해를 포함",
      "objectKo": "사회 규범·기대",
      "expressionEn": "come to understand",
      "evidenceEn": "come to understand societal norms and expectations",
      "sourcePages": [
        119
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "정의의 일부로 기술된 규범·기대 이해; 인과 관계 아님",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-02",
      "category": "사회화의 정의",
      "subjectKo": "사회화",
      "relationKo": "신념을 수용하고 가치를 인식",
      "objectKo": "사회적 신념·가치",
      "expressionEn": "accept / be aware of",
      "evidenceEn": "to accept society’s beliefs",
      "sourcePages": [
        119
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "정의의 다른 구성 요소; 관계어의 and 연결을 인과로 보지 않음",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-03",
      "category": "사회화 기관",
      "subjectKo": "가족·또래집단",
      "relationKo": "기대를 전달하고 규범을 강화",
      "objectKo": "사회화",
      "expressionEn": "communicate / reinforce",
      "evidenceEn": "communicate expectations and reinforce norms",
      "sourcePages": [
        125
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "가족·또래의 상호작용이 사회화를 매개; 인과 효과 크기 미판단",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-04",
      "category": "사회화 기관",
      "subjectKo": "가족",
      "relationKo": "초기의 사회화를 담당",
      "objectKo": "사회화 기관",
      "expressionEn": "first agent of socialization",
      "evidenceEn": "Family is the first agent of socialization",
      "sourcePages": [
        126
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "IS_A",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "가족은 사회화 기관의 한 사례(하위 항목)이며 사회화 자체의 하위 유형이 아님",
      "diagramHint": "계층도",
      "isCausalClaim": false
    },
    {
      "id": "REL-05",
      "category": "사회화 기관",
      "subjectKo": "또래집단",
      "relationKo": "독자적인 기회를 제공",
      "objectKo": "사회화",
      "expressionEn": "provide opportunities",
      "evidenceEn": "peer groups provide their own opportunities for",
      "sourcePages": [
        127
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "기회 제공은 원인 확정이 아닌 사회화 지원으로 분류",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-06",
      "category": "사회화 기관",
      "subjectKo": "학교",
      "relationKo": "협동·일과표 등 행동을 익히도록 사회화",
      "objectKo": "사회화",
      "expressionEn": "socializing children into",
      "evidenceEn": "socializing children into behaviors like practicing teamwork",
      "sourcePages": [
        127
      ],
      "diagramIds": [
        "agents",
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "학교는 사회화를 촉진하는 제도",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-07",
      "category": "사회화 기관",
      "subjectKo": "직장",
      "relationKo": "제도 내 행동 방식을 가르침",
      "objectKo": "사회화",
      "expressionEn": "teach how to behave",
      "evidenceEn": "teach people how to behave in and navigate these systems",
      "sourcePages": [
        127
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "직장에서 규범·행동 학습 지원",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-08",
      "category": "사회화 기관",
      "subjectKo": "미디어",
      "relationKo": "규범·기대의 메시지로 기여",
      "objectKo": "사회화",
      "expressionEn": "contribute to",
      "evidenceEn": "contribute to socialization by inundating us with messages",
      "sourcePages": [
        127
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "미디어의 기여는 엄격한 인과 증거가 아님",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-09",
      "category": "사회화 기관",
      "subjectKo": "종교",
      "relationKo": "사회화를 위한 경로",
      "objectKo": "사회화",
      "expressionEn": "an important avenue",
      "evidenceEn": "Religion is an important avenue of socialization",
      "sourcePages": [
        129
      ],
      "diagramIds": [],
      "provenance": "direct",
      "notes": "5개 기관 그림에는 지면 제약 때문에 생략",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "종교는 사회화가 이루어지는 경로",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-10",
      "category": "사회화 기관",
      "subjectKo": "정부",
      "relationKo": "새로운 사회적 범주의 역할에 맞는 규범을 규정",
      "objectKo": "사회화",
      "expressionEn": "require socialization",
      "evidenceEn": "require socialization into a new category",
      "sourcePages": [
        130
      ],
      "diagramIds": [],
      "provenance": "direct",
      "notes": "5개 기관 그림에는 지면 제약 때문에 생략",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "정부 제도는 전환 시 역할 적응 요구",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-11",
      "category": "사회화의 관계",
      "subjectKo": "사회화 기관과의 상호작용",
      "relationKo": "학습이 일어남",
      "objectKo": "가치·신념·규범",
      "expressionEn": "takes place through interaction",
      "evidenceEn": "This learning takes place through interaction with various agents of socialization",
      "sourcePages": [
        125
      ],
      "diagramIds": [
        "agents"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "사회화 기관 상호작용을 통한 학습",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-12",
      "category": "미드 발달",
      "subjectKo": "준비 단계",
      "relationKo": "모방 중심",
      "objectKo": "타인의 행동",
      "expressionEn": "only capable of imitation",
      "evidenceEn": "During the preparatory stage, children are only capable of imitation",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "준비 단계의 핵심 특징을 제시하는 설명",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-13",
      "category": "미드 발달",
      "subjectKo": "준비 단계",
      "relationKo": "이어서 진행",
      "objectKo": "놀이 단계",
      "expressionEn": "followed by",
      "evidenceEn": "This is followed by the play stage",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "PRECEDES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "교과서의 followed by에 근거한 발달상 순서",
      "diagramHint": "순차형 체인",
      "isCausalClaim": false
    },
    {
      "id": "REL-30",
      "category": "미드 발달",
      "subjectKo": "놀이 단계",
      "relationKo": "이어서 진행",
      "objectKo": "게임 단계",
      "expressionEn": "followed by",
      "evidenceEn": "This is followed by the play stage",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "체인의 빠진 연결을 메우기 위해 추가. 근거는 REL-13·REL-16과 같은 121쪽 단계 서술.",
      "relationType": "PRECEDES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "놀이 단계에서 게임 단계로 이어지는 발달상 순서; 인과 아님",
      "diagramHint": "순차형 체인",
      "isCausalClaim": false
    },
    {
      "id": "REL-14",
      "category": "미드 발달",
      "subjectKo": "놀이 단계",
      "relationKo": "역할을 취해 봄",
      "objectKo": "한 사람의 역할",
      "expressionEn": "take on the role",
      "evidenceEn": "take on the role that one other person might have",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "놀이 단계의 핵심 특징을 설명",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-15",
      "category": "미드 발달",
      "subjectKo": "게임 단계",
      "relationKo": "동시에 고려",
      "objectKo": "여러 역할과 역할 관계",
      "expressionEn": "consider several roles",
      "evidenceEn": "consider several roles at the same time",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "게임 단계의 핵심 특징을 설명",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-16",
      "category": "미드 발달",
      "subjectKo": "게임 단계",
      "relationKo": "발달·이해",
      "objectKo": "일반화된 타자 이해",
      "expressionEn": "Finally ... learn the idea",
      "evidenceEn": "Finally, children develop, understand, and learn the idea of the generalized other",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "마지막 개념은 독립된 정식 단계가 아니라 교과서가 Finally로 기술한 도달점",
      "relationType": "PRECEDES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "독립된 네 번째 단계가 아닌 이후의 발달적 도달점; 시간적 연결만 표현",
      "diagramHint": "순차형 체인",
      "isCausalClaim": false
    },
    {
      "id": "REL-17",
      "category": "미드 발달",
      "subjectKo": "일반화된 타자",
      "relationKo": "공유된 행동 기대",
      "objectKo": "사회 일반의 공통된 행동 기대",
      "expressionEn": "common behavioral expectations",
      "evidenceEn": "the common behavioral expectations of general society",
      "sourcePages": [
        121
      ],
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "일반화된 타자의 개념 정의",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-18",
      "category": "예기·재사회화",
      "subjectKo": "예기 사회화",
      "relationKo": "미래 역할을 준비",
      "objectKo": "미래 생활의 사회적 역할",
      "expressionEn": "preparation for future life roles",
      "evidenceEn": "anticipatory socialization, the preparation for future life roles",
      "sourcePages": [
        133
      ],
      "diagramIds": [
        "anticipatory_vs_resocialization"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "예기 사회화의 정의: 미래 역할을 위한 준비",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-19",
      "category": "예기·재사회화",
      "subjectKo": "결혼 전 동거·출산 준비·은퇴 계획",
      "relationKo": "예시로 나타남",
      "objectKo": "예기 사회화",
      "expressionEn": "Examples would include",
      "evidenceEn": "Examples would include a couple who cohabitate",
      "sourcePages": [
        133
      ],
      "diagramIds": [
        "anticipatory_vs_resocialization"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "EXAMPLE_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "도식에서 사례 → 개념 방향으로 정규화",
      "diagramHint": "방사형·사례 모음",
      "isCausalClaim": false
    },
    {
      "id": "REL-20",
      "category": "예기·재사회화",
      "subjectKo": "재사회화",
      "relationKo": "기존 행동을 제거",
      "objectKo": "이전 역할에서 유용했던 행동",
      "expressionEn": "old behaviors ... removed",
      "evidenceEn": "old behaviors that were helpful in a previous role are removed",
      "sourcePages": [
        133
      ],
      "diagramIds": [
        "anticipatory_vs_resocialization"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "재사회화의 정의 일부: 기존 행동의 제거",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-21",
      "category": "예기·재사회화",
      "subjectKo": "기존 행동·습관을 버리는 과정",
      "relationKo": "기존 습관을 버려야 함",
      "objectKo": "재사회화",
      "expressionEn": "unlearn behaviors",
      "evidenceEn": "unlearn behaviors that have become customary to them",
      "sourcePages": [
        134
      ],
      "diagramIds": [
        "anticipatory_vs_resocialization"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "PART_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "과정의 한 측면; 독립된 선행 인과라고 표현하지 않음",
      "diagramHint": "구성도·트리",
      "isCausalClaim": false
    },
    {
      "id": "REL-22",
      "category": "예기·재사회화",
      "subjectKo": "새 규칙·행동을 배우는 과정",
      "relationKo": "새 규칙을 익힘",
      "objectKo": "재사회화",
      "expressionEn": "learn new rules",
      "evidenceEn": "where they learn new rules and bond",
      "sourcePages": [
        134
      ],
      "diagramIds": [
        "anticipatory_vs_resocialization"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "PART_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "과정의 한 측면; 독립된 후행 인과라고 표현하지 않음",
      "diagramHint": "구성도·트리",
      "isCausalClaim": false
    },
    {
      "id": "REL-23",
      "category": "잠재적 교육과정",
      "subjectKo": "학교·교실 의례",
      "relationKo": "사회적 기대를 강화",
      "objectKo": "학교의 사회화",
      "expressionEn": "reinforce what society expects",
      "evidenceEn": "regularly reinforce what society expects from children",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "학교 의례가 사회적 기대의 학습·강화를 지원",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-24",
      "category": "잠재적 교육과정",
      "subjectKo": "잠재적 교육과정",
      "relationKo": "학교에서 비공식적으로 가르침",
      "objectKo": "사회 규범",
      "expressionEn": "informal teaching",
      "evidenceEn": "the informal teaching done by schools",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "잠재적 교육과정에 대한 정의",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    },
    {
      "id": "REL-25",
      "category": "잠재적 교육과정",
      "subjectKo": "성적·경쟁을 통해 승자·패자를 배우는 경험",
      "relationKo": "승자와 패자의 경험을 학습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "learn there are winners and losers",
      "evidenceEn": "they learn there are winners and losers in society",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "EXAMPLE_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "예시 관계: 모든 성적 평가가 곧 잠재적 교육과정이라는 뜻은 아님",
      "diagramHint": "방사형·사례 모음",
      "isCausalClaim": false
    },
    {
      "id": "REL-26",
      "category": "잠재적 교육과정",
      "subjectKo": "협동 과제에서 팀워크를 연습하는 경험",
      "relationKo": "협력 상황에서 연습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "practice teamwork",
      "evidenceEn": "they practice teamwork with other people in cooperative situations",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "EXAMPLE_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "예시의 맥락을 보존해 단순한 협동 과제 자체와 구별",
      "diagramHint": "방사형·사례 모음",
      "isCausalClaim": false
    },
    {
      "id": "REL-27",
      "category": "잠재적 교육과정",
      "subjectKo": "학교생활에서 규칙·차례·행정 절차를 배우는 경험",
      "relationKo": "학습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "learn how to deal with",
      "evidenceEn": "Children learn how to deal with bureaucracy, rules, expectations, waiting",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "EXAMPLE_OF",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "예시 관계; 학교생활 전체와 잠재적 교육과정을 동일시하지 않음",
      "diagramHint": "방사형·사례 모음",
      "isCausalClaim": false
    },
    {
      "id": "REL-28",
      "category": "잠재적 교육과정",
      "subjectKo": "잠재적 교육과정",
      "relationKo": "미래 사회생활을 준비시킴",
      "objectKo": "성인 세계",
      "expressionEn": "prepares children for",
      "evidenceEn": "The hidden curriculum prepares children for the adult world",
      "sourcePages": [
        128
      ],
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "잠재적 교육과정이 성인 세계 적응을 준비시키는 기능",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false
    },
    {
      "id": "REL-29",
      "category": "사회화의 지속",
      "subjectKo": "사회화",
      "relationKo": "생애 내내 반복됨",
      "objectKo": "전환 시점의 새로운 역할",
      "expressionEn": "lifelong process",
      "evidenceEn": "socialization is a lifelong",
      "sourcePages": [
        131
      ],
      "diagramIds": [],
      "provenance": "direct",
      "notes": "현재 4종 도식에서 직접 사용하지 않는 확장 후보",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "사회화는 생애 전반 지속되는 과정이라는 특징 설명",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false
    }
  ]
}
