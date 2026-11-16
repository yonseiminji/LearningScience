// Chapter 5 사회화 — 유형화된 개념 관계 사전.
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

export default {
  "schemaVersion": "2.1.0-lines",
  "metadata": {
    "source": "William Little (2023), Introduction to Sociology – 3rd Canadian Edition, Chapter 5: Socialization",
    "sourceUrl": "https://opentextbc.ca/introductiontosociology3rdedition/",
    "license": "CC BY 4.0 (교재 본문; 개별 표기된 제3자 자료는 다를 수 있음)",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "basedOn": "bccampus_socialization_relation_lexicon_validated (v2.1) + docs/bccampus-ch05",
    "anchoring": "sourceLines 는 docs/bccampus-ch05 영문 코퍼스에서 evidenceEn 을 그대로 찾은 줄. 번들이 주장한 인쇄 쪽수는 claimedPrintPages 로만 남기고 코드에서 쓰지 않는다 — 업로드된 TXT 에는 페이지 경계가 없어 검증할 수 없기 때문.",
    "provenancePolicy": "evidenceEn is an exact English source anchor; relationType and Korean wording are interpretive diagrams, not source-provided classifications.",
    "classification": "시각화를 위한 개발 스키마. 교재 저자의 분류 체계가 아니다.",
    "activeCount": 28,
    "inactiveCount": 2,
    "caveats": [
      "REL-09 and REL-10 remain archived, inactive, and lack new-edition evidence; neither is claimed false in general.",
      "Mead: 3rd Canadian Edition explicitly says four stages including generalized other. Previous diagram note denying a fourth stage is invalid for this edition.",
      "Third-party media attribution/license differs from textbook body; diagrams contain only re-authored concept labels.",
      "No causal conclusion is derived merely from ordering or arrow notation.",
      "Mermaid diagrams checked statically; no browser visual rendering performed.",
      "REL-30 은 이 저장소가 추가한 관계이며 provenance 가 structural 이다.",
      "화살표는 학습용 표기이며 인과 모형으로 읽어서는 안 된다."
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
      "evidenceEn": "come to understand and internalize societal norms and expectations",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.0",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        40
      ],
      "claimedPrintPages": [
        272
      ]
    },
    {
      "id": "REL-02",
      "category": "사회화의 정의",
      "subjectKo": "사회화",
      "relationKo": "신념을 수용하고 가치를 인식",
      "objectKo": "사회적 신념·가치",
      "expressionEn": "accept / be aware of",
      "evidenceEn": "accept society’s beliefs, and be aware of societal values",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.0",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        40
      ],
      "claimedPrintPages": [
        272
      ]
    },
    {
      "id": "REL-03",
      "category": "사회화 기관",
      "subjectKo": "가족·또래집단",
      "relationKo": "기대를 전달하고 규범을 강화",
      "objectKo": "사회화",
      "expressionEn": "communicate / reinforce",
      "evidenceEn": "They communicate expectations and reinforce norms",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        269
      ],
      "claimedPrintPages": [
        295
      ]
    },
    {
      "id": "REL-04",
      "category": "사회화 기관",
      "subjectKo": "가족",
      "relationKo": "초기의 사회화를 담당",
      "objectKo": "사회화 기관",
      "expressionEn": "first agent of socialization",
      "evidenceEn": "Family is the first agent of socialization",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        272
      ],
      "claimedPrintPages": [
        295
      ]
    },
    {
      "id": "REL-05",
      "category": "사회화 기관",
      "subjectKo": "또래집단",
      "relationKo": "독자적인 기회를 제공",
      "objectKo": "사회화",
      "expressionEn": "provide opportunities",
      "evidenceEn": "Peer groups provide their own opportunities for socialization",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        305
      ],
      "claimedPrintPages": [
        298
      ]
    },
    {
      "id": "REL-06",
      "category": "사회화 기관",
      "subjectKo": "학교",
      "relationKo": "협동·일과표 등 행동을 익히도록 사회화",
      "objectKo": "사회화",
      "expressionEn": "socializing children into",
      "evidenceEn": "socializing children into behaviours like teamwork, following a schedule, and using textbooks",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        315
      ],
      "claimedPrintPages": [
        298
      ]
    },
    {
      "id": "REL-07",
      "category": "사회화 기관",
      "subjectKo": "직장",
      "relationKo": "제도 내 행동 방식을 가르침",
      "objectKo": "사회화",
      "expressionEn": "teach how to behave",
      "evidenceEn": "Formal institutions — like schools and workplaces — teach people how to behave in and navigate these systems",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        312
      ],
      "claimedPrintPages": [
        298
      ]
    },
    {
      "id": "REL-08",
      "category": "사회화 기관",
      "subjectKo": "미디어",
      "relationKo": "규범·기대의 메시지로 기여",
      "objectKo": "사회화",
      "expressionEn": "contribute to",
      "evidenceEn": "the media, contribute to socialization by inundating people with messages about norms and expectations",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        312
      ],
      "claimedPrintPages": [
        298
      ]
    },
    {
      "id": "REL-09",
      "category": "사회화 기관",
      "subjectKo": "종교",
      "relationKo": "사회화를 위한 경로",
      "objectKo": "사회화",
      "expressionEn": "an important avenue",
      "evidenceEn": null,
      "diagramIds": [],
      "provenance": "legacy_only",
      "notes": "5개 기관 그림에는 지면 제약 때문에 생략",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "not_source_anchored",
      "semanticNote": "종교는 사회화가 이루어지는 경로",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "isActive": false,
      "validationStatus": "unsupported_in_current_edition",
      "sourceSection": null,
      "additionalEvidenceEn": [],
      "validationNote": "새 교재의 §5.3은 가족·또래집단·학교·직장·대중매체를 설명하나, 종교를 독립된 사회화 기관으로 정의하지 않음. 구판 근거는 새 판의 직접 인용으로 사용할 수 없음.",
      "sourceLines": [],
      "claimedPrintPages": []
    },
    {
      "id": "REL-10",
      "category": "사회화 기관",
      "subjectKo": "정부",
      "relationKo": "새로운 사회적 범주의 역할에 맞는 규범을 규정",
      "objectKo": "사회화",
      "expressionEn": "require socialization",
      "evidenceEn": null,
      "diagramIds": [],
      "provenance": "legacy_only",
      "notes": "5개 기관 그림에는 지면 제약 때문에 생략",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "not_source_anchored",
      "semanticNote": "정부 제도는 전환 시 역할 적응 요구",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "isActive": false,
      "validationStatus": "unsupported_in_current_edition",
      "sourceSection": null,
      "additionalEvidenceEn": [],
      "validationNote": "새 교재의 §5.3에 정부 정책 사례는 있으나, 정부 자체를 독립적인 사회화 기관으로 정의하거나 기존 관계의 진술을 뒷받침하지 않음.",
      "sourceLines": [],
      "claimedPrintPages": []
    },
    {
      "id": "REL-11",
      "category": "사회화의 관계",
      "subjectKo": "사회화 기관과의 상호작용",
      "relationKo": "학습이 일어남",
      "objectKo": "가치·신념·규범",
      "expressionEn": "takes place through interaction",
      "evidenceEn": "This learning takes place through interaction with various agents of socialization",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        266
      ],
      "claimedPrintPages": [
        295
      ]
    },
    {
      "id": "REL-12",
      "category": "미드 발달",
      "subjectKo": "준비 단계",
      "relationKo": "모방 중심",
      "objectKo": "타인의 행동",
      "expressionEn": "only capable of imitation",
      "evidenceEn": "During the preparatory stage, children are only capable of imitation",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        109
      ],
      "claimedPrintPages": [
        280
      ]
    },
    {
      "id": "REL-13",
      "category": "미드 발달",
      "subjectKo": "준비 단계",
      "relationKo": "이어서 진행",
      "objectKo": "놀이 단계",
      "expressionEn": "followed by",
      "evidenceEn": "This is followed by the play stage",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        111
      ],
      "claimedPrintPages": [
        280
      ]
    },
    {
      "id": "REL-14",
      "category": "미드 발달",
      "subjectKo": "놀이 단계",
      "relationKo": "역할을 취해 봄",
      "objectKo": "한 사람의 역할",
      "expressionEn": "take on the role",
      "evidenceEn": "take on roles that another person might have",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        111
      ],
      "claimedPrintPages": [
        280
      ]
    },
    {
      "id": "REL-15",
      "category": "미드 발달",
      "subjectKo": "게임 단계",
      "relationKo": "동시에 고려",
      "objectKo": "여러 역할과 역할 관계",
      "expressionEn": "consider several roles",
      "evidenceEn": "consider several specific roles at the same time and how those roles interact with each other",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        116
      ],
      "claimedPrintPages": [
        280
      ]
    },
    {
      "id": "REL-16",
      "category": "미드 발달",
      "subjectKo": "게임 단계",
      "relationKo": "발달·이해",
      "objectKo": "일반화된 타자 이해",
      "expressionEn": "Finally ... learn the idea",
      "evidenceEn": "Finally, children develop, understand, and learn the idea of the generalized other",
      "diagramIds": [
        "mead"
      ],
      "provenance": "direct",
      "notes": "마지막 개념은 독립된 정식 단계가 아니라 교과서가 Finally로 기술한 도달점",
      "relationType": "PRECEDES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "이 교재는 일반화된 타자를 포함해 아동 사회화 발달의 네 단계를 제시함; PRECEDES는 발달 순서이지 필연적 인과가 아님.",
      "diagramHint": "순차형 체인",
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [
        "Explain Mead’s four stages of child socialization"
      ],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "중요한 판본 차이: BCcampus 3판은 일반화된 타자를 네 번째 발달 단계로 명시(§5.1 학습목표 p.270 및 핵심 용어 p.316). 기존 Mermaid 주석을 수정함.",
      "sourceLines": [
        122
      ],
      "claimedPrintPages": [
        281
      ]
    },
    {
      "id": "REL-17",
      "category": "미드 발달",
      "subjectKo": "일반화된 타자",
      "relationKo": "공유된 행동 기대",
      "objectKo": "사회 일반의 공통된 행동 기대",
      "expressionEn": "common behavioral expectations",
      "evidenceEn": "the common behavioural expectations of general society",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.1",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        122
      ],
      "claimedPrintPages": [
        281
      ]
    },
    {
      "id": "REL-18",
      "category": "예기·재사회화",
      "subjectKo": "예기 사회화",
      "relationKo": "미래 역할을 준비",
      "objectKo": "미래 생활의 사회적 역할",
      "expressionEn": "preparation for future life roles",
      "evidenceEn": "anticipatory socialization, the preparation for future life roles",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        401
      ],
      "claimedPrintPages": [
        308
      ]
    },
    {
      "id": "REL-19",
      "category": "예기·재사회화",
      "subjectKo": "결혼 전 동거·출산 준비·은퇴 계획",
      "relationKo": "예시로 나타남",
      "objectKo": "예기 사회화",
      "expressionEn": "Examples would include",
      "evidenceEn": "Examples would include a couple who cohabitate before marriage",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [
        "soon-to-be parents who read infant care books",
        "begin planning for their retirement"
      ],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "한 관계 안의 예시 3종(결혼 전 동거·출산 준비·은퇴 계획)을 동일 페이지에서 교차 확인함.",
      "sourceLines": [
        401
      ],
      "claimedPrintPages": [
        308
      ]
    },
    {
      "id": "REL-20",
      "category": "예기·재사회화",
      "subjectKo": "재사회화",
      "relationKo": "기존 행동을 제거",
      "objectKo": "이전 역할에서 유용했던 행동",
      "expressionEn": "old behaviors ... removed",
      "evidenceEn": "old behaviours that were helpful in a previous role are removed",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        429
      ],
      "claimedPrintPages": [
        310
      ]
    },
    {
      "id": "REL-21",
      "category": "예기·재사회화",
      "subjectKo": "기존 행동·습관을 버리는 과정",
      "relationKo": "기존 습관을 버려야 함",
      "objectKo": "재사회화",
      "expressionEn": "unlearn behaviors",
      "evidenceEn": "unlearn behaviours that have become customary to them",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        429
      ],
      "claimedPrintPages": [
        310
      ]
    },
    {
      "id": "REL-22",
      "category": "예기·재사회화",
      "subjectKo": "새 규칙·행동을 배우는 과정",
      "relationKo": "새 규칙을 익힘",
      "objectKo": "재사회화",
      "expressionEn": "learn new rules",
      "evidenceEn": "where they learn new rules and bond with one another",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "근거는 군대에서의 신규 규칙 학습 사례(p.312); 이전 행동을 버리고 새 규범을 학습한다는 재사회화 전체 설명(p.310)과 함께 해석해야 함.",
      "sourceLines": [
        447
      ],
      "claimedPrintPages": [
        312
      ]
    },
    {
      "id": "REL-23",
      "category": "잠재적 교육과정",
      "subjectKo": "학교·교실 의례",
      "relationKo": "사회적 기대를 강화",
      "objectKo": "학교의 사회화",
      "expressionEn": "reinforce what society expects",
      "evidenceEn": "regularly reinforce what society expects from children",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-24",
      "category": "잠재적 교육과정",
      "subjectKo": "잠재적 교육과정",
      "relationKo": "학교에서 비공식적으로 가르침",
      "objectKo": "사회 규범",
      "expressionEn": "informal teaching",
      "evidenceEn": "the hidden curriculum, the informal teaching done by schools",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-25",
      "category": "잠재적 교육과정",
      "subjectKo": "성적·경쟁을 통해 승자·패자를 배우는 경험",
      "relationKo": "승자와 패자의 경험을 학습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "learn there are winners and losers",
      "evidenceEn": "they learn that there are winners and losers in society",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "북미 학교의 경쟁·성적 평가 예시라는 맥락을 보존; 한국 모든 학교에 보편적인 사실로 일반화하지 않음.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-26",
      "category": "잠재적 교육과정",
      "subjectKo": "협동 과제에서 팀워크를 연습하는 경험",
      "relationKo": "협력 상황에서 연습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "practice teamwork",
      "evidenceEn": "they practice teamwork with other people in cooperative situations",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-27",
      "category": "잠재적 교육과정",
      "subjectKo": "학교생활에서 규칙·차례·행정 절차를 배우는 경험",
      "relationKo": "학습",
      "objectKo": "잠재적 교육과정",
      "expressionEn": "learn how to deal with",
      "evidenceEn": "Children learn how to deal with bureaucracy, rules, expectations, to wait their turn",
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
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-28",
      "category": "잠재적 교육과정",
      "subjectKo": "잠재적 교육과정",
      "relationKo": "미래 사회생활을 준비시킴",
      "objectKo": "성인 세계",
      "expressionEn": "prepares children for",
      "evidenceEn": "Bowles and Gintis argue that the hidden curriculum prepares children for a life of conformity in the adult world",
      "diagramIds": [
        "hidden"
      ],
      "provenance": "direct",
      "notes": "",
      "relationType": "FACILITATES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "Bowles & Gintis의 잠재적 교육과정 해석으로 소개됨; 보편적 인과로 단정하지 않음.",
      "diagramHint": "기여형 흐름도",
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.3",
      "additionalEvidenceEn": [],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "교재가 Bowles & Gintis(1976)의 입장으로 소개하는 해석. 교재가 사회화의 모든 맥락에서 보편적으로 입증한 인과법칙이라는 뜻이 아님.",
      "sourceLines": [
        319
      ],
      "claimedPrintPages": [
        299
      ]
    },
    {
      "id": "REL-29",
      "category": "사회화의 지속",
      "subjectKo": "사회화",
      "relationKo": "생애 내내 반복됨",
      "objectKo": "전환 시점의 새로운 역할",
      "expressionEn": "lifelong process",
      "evidenceEn": "socialization is a lifelong process",
      "diagramIds": [],
      "provenance": "direct",
      "notes": "현재 4종 도식에서 직접 사용하지 않는 확장 후보",
      "relationType": "DEFINED_AS",
      "direction": "subject_to_object",
      "evidenceStatus": "source_anchored_interpreted",
      "semanticNote": "사회화는 생애 전반 지속되는 과정이라는 특징 설명",
      "diagramHint": "개념 설명도",
      "isCausalClaim": false,
      "sourceEdition": "Little (2023), Introduction to Sociology, 3rd Canadian Edition, Chapter 5",
      "sourceSection": "5.4",
      "additionalEvidenceEn": [
        "requires both learning and revising one’s self-definition"
      ],
      "isActive": true,
      "validationStatus": "supported_in_current_edition",
      "validationNote": "새 교재 5장 본문에서 원문 근거를 확인함. 화살표의 관계 유형은 시각화용 해석임.",
      "sourceLines": [
        387
      ],
      "claimedPrintPages": [
        307
      ]
    },
    {
      "id": "REL-30",
      "category": "미드 발달",
      "subjectKo": "놀이 단계",
      "relationKo": "이어서 진행",
      "objectKo": "게임 단계",
      "expressionEn": "During the game stage",
      "evidenceEn": "During the game stage",
      "diagramIds": [
        "mead"
      ],
      "provenance": "structural",
      "notes": "검증본에도 없는 연결. 교재가 네 단계를 순서대로 제시하고 각 단계에 문단을 하나씩 두지만, \"followed by\"는 준비→놀이에만 붙어 있어 놀이→게임은 서술 순서로만 뒷받침된다.",
      "relationType": "PRECEDES",
      "direction": "subject_to_object",
      "evidenceStatus": "source_ordered_interpreted",
      "semanticNote": "놀이 단계에서 게임 단계로 이어지는 발달상 순서; 인과 아님. 순서의 근거는 §5.1의 네 단계 열거(준비·놀이·게임·일반화된 타자)이며 한 문장의 명시적 선후 진술이 아니다.",
      "diagramHint": "순차형 체인",
      "isCausalClaim": false,
      "isActive": true,
      "validationStatus": "ordered_in_current_edition",
      "validationNote": "이 저장소에서 추가한 관계. 교재의 단계 열거 순서에 따름.",
      "claimedPrintPages": [],
      "sourceSection": "5.1",
      "sourceLines": [
        116
      ]
    }
  ]
}
