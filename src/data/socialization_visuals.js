// Chapter 5 사회화 — 검증된 고정 도식.
//
// A .js module rather than .json on purpose: Vercel functions run real Node,
// where a bare JSON import throws without an import attribute, and the file
// has to be traced into the function bundle. _fewshots.js is here for the
// same reason. Vite imports this just as happily from the browser side.

export default {
  "limits": { "maxNodes": 10, "maxEdges": 12 },
  "relations": {
    "contributes_to": { "arrow": "-->", "label": "" },
    "learns": { "arrow": "-->", "label": "학습" },
    "precedes_stage": { "arrow": "-->", "label": "다음 단계" },
    "contrasts_with": { "arrow": "---", "label": "비교" }
  },
  "forbiddenEdges": [
    {
      "from": "anticipatory-socialization",
      "to": "resocialization",
      "relation": "precedes_stage",
      "why": "예기 사회화와 재사회화는 필연적 선후 관계가 아닙니다. 비교로만 표현합니다."
    },
    {
      "from": "resocialization",
      "to": "anticipatory-socialization",
      "relation": "precedes_stage",
      "why": "예기 사회화와 재사회화는 필연적 선후 관계가 아닙니다. 비교로만 표현합니다."
    }
  ],
  "visuals": [
    {
      "visualId": "agents-of-socialization-v1",
      "title": "사회화 기관",
      "conceptIds": ["agents-of-socialization", "socialization", "peer-group"],
      "diagramType": "flowchart",
      "nodes": ["가족", "또래집단", "학교", "직장", "대중매체", "사회화", "규범·가치·기대 학습"],
      "edges": [
        { "from": "가족", "to": "사회화", "relation": "contributes_to" },
        { "from": "학교", "to": "사회화", "relation": "contributes_to" },
        { "from": "또래집단", "to": "사회화", "relation": "contributes_to" },
        { "from": "직장", "to": "사회화", "relation": "contributes_to" },
        { "from": "대중매체", "to": "사회화", "relation": "contributes_to" },
        { "from": "사회화", "to": "규범·가치·기대 학습", "relation": "learns" }
      ],
      "mermaidCode": "flowchart TD\n  A[\"가족\"] --> S[\"사회화\"]\n  B[\"또래집단\"] --> S\n  C[\"학교\"] --> S\n  D[\"직장\"] --> S\n  E[\"대중매체\"] --> S\n  S --> F[\"규범·가치·기대 학습\"]",
      "altText": "가족, 또래집단, 학교, 직장, 대중매체가 각각 사회화로 이어지고, 사회화는 규범·가치·기대 학습으로 이어집니다.",
      "caveat": "교재 5.3절이 다루는 다섯 기관이에요. 한 기관이 언제나 하나의 방식으로만 사회화하지는 않습니다.",
      "reviewed": false
    },
    {
      "visualId": "mead-self-development-v1",
      "title": "미드의 자아 발달 단계",
      "conceptIds": ["mead-stages", "self", "generalized-other"],
      "diagramType": "flowchart",
      "nodes": ["준비 단계", "놀이 단계", "게임 단계", "일반화된 타자 이해"],
      "edges": [
        { "from": "준비 단계", "to": "놀이 단계", "relation": "precedes_stage" },
        { "from": "놀이 단계", "to": "게임 단계", "relation": "precedes_stage" },
        { "from": "게임 단계", "to": "일반화된 타자 이해", "relation": "precedes_stage" }
      ],
      "mermaidCode": "flowchart LR\n  P[\"준비 단계\"] -->|다음 단계| Q[\"놀이 단계\"]\n  Q -->|다음 단계| R[\"게임 단계\"]\n  R -->|다음 단계| G[\"일반화된 타자 이해\"]",
      "altText": "준비 단계에서 놀이 단계, 게임 단계를 거쳐 일반화된 타자를 이해하는 순서입니다.",
      "caveat": "단계의 순서를 보여주는 도식입니다. 앞 단계가 뒤 단계를 일으킨다는 인과관계로 읽지 않습니다.",
      "reviewed": false
    },
    {
      "visualId": "socialization-comparison-v1",
      "title": "예기 사회화와 재사회화 비교",
      "conceptIds": ["anticipatory-socialization", "resocialization"],
      "diagramType": "flowchart",
      "nodes": ["예기 사회화", "재사회화", "아직 맡지 않은 역할의 선행 학습", "이미 습득한 행동의 재구성"],
      "edges": [
        { "from": "예기 사회화", "to": "재사회화", "relation": "contrasts_with" },
        { "from": "예기 사회화", "to": "아직 맡지 않은 역할의 선행 학습", "relation": "learns" },
        { "from": "재사회화", "to": "이미 습득한 행동의 재구성", "relation": "learns" }
      ],
      "mermaidCode": "flowchart TD\n  A[\"예기 사회화\"] --- B[\"재사회화\"]\n  A --> C[\"아직 맡지 않은 역할의 선행 학습\"]\n  B --> D[\"이미 습득한 행동의 재구성\"]",
      "altText": "예기 사회화와 재사회화를 나란히 놓고 비교합니다. 예기 사회화의 핵심은 아직 맡지 않은 역할의 선행 학습이고, 재사회화의 핵심은 이미 습득한 행동의 재구성입니다.",
      "caveat": "두 개념은 비교 대상이며, 하나가 다른 하나로 이어지는 순서가 아닙니다.",
      "reviewed": false
    },
    {
      "visualId": "hidden-curriculum-v1",
      "title": "잠재적 교육과정",
      "conceptIds": ["hidden-curriculum"],
      "diagramType": "flowchart",
      "nodes": ["줄 서기", "차례 기다리기", "공동 과제 수행", "규칙 준수", "비공식적 규범 학습"],
      "edges": [
        { "from": "줄 서기", "to": "비공식적 규범 학습", "relation": "learns" },
        { "from": "차례 기다리기", "to": "비공식적 규범 학습", "relation": "learns" },
        { "from": "공동 과제 수행", "to": "비공식적 규범 학습", "relation": "learns" },
        { "from": "규칙 준수", "to": "비공식적 규범 학습", "relation": "learns" }
      ],
      "mermaidCode": "flowchart LR\n  A[\"줄 서기\"] --> H[\"비공식적 규범 학습\"]\n  B[\"차례 기다리기\"] --> H\n  C[\"공동 과제 수행\"] --> H\n  D[\"규칙 준수\"] --> H",
      "altText": "줄 서기, 차례 기다리기, 공동 과제 수행, 규칙 준수 같은 학교 활동이 비공식적 규범 학습으로 이어집니다.",
      "caveat": "교사가 몰래 계획한 수업이 아니라, 학교생활에서 비공식적으로 학습되는 규범과 기대를 뜻합니다.",
      "reviewed": false
    }
  ]
}
