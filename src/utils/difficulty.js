/**
 * 차곡차곡 - 예상 난이도 계산
 *
 * 입력: Task Chunking의 step 객체
 *
 * difficultyRank:
 *   1~5 = 예상 난이도
 *   0   = 미평가
 *
 * status:
 *   rated   = 평가 완료
 *   partial = 일부 기준만 평가
 *   unrated = 미평가
 *
 * 난이도 산출에 단계 번호(stepIndex)는 사용하지 않는다.
 */

// 1. 인지적 요구 수준 규칙
const COGNITIVE_RULES = [
  {
    score: 5,
    patterns: [
      /비판적?\s*(평가|검토)/,
      /대안\s*설계/,
      /모델\s*설계/,
      /최적화/,
      /타당성\s*평가/,
    ],
  },
  {
    score: 4,
    patterns: [
      /분석/,
      /비교/,
      /영향\s*요인/,
      /개선\s*(전략|방안)/,
      // 전략을 근거와 함께 내놓는 일은 분석 수준으로 본다. CONTENT_ACTION 이
      // 이미 '전략 제안'을 내용 활동으로 분류하고 있어 그와 맞춘다.
      /전략.*(제안|수립)|제안하기/,
      /연결/,
      /시사점/,
      /해석/,
      /도출/,
    ],
  },
  {
    score: 3,
    patterns: [
      /적용/,
      /구현/,
      /실습/,
      /계산/,
      /시각화/,
      /그래프\s*(작성|그리기|표현)/,
      /코드\s*작성/,
      /전처리/,
    ],
  },
  {
    score: 2,
    patterns: [
      /선정/,
      /선택/,
      /수집/,
      /조사/,
      /요약/,
      /정리/,
      /설명/,
      /작성/,
      /편집/,
      // 이 앱의 단계 제목과 설명에서 실제로 쓰는 표현. 없으면 '정하기',
      // '모으기', '만들기' 같은 단계가 전부 미평가로 떨어진다.
      /정하기|좁혀|좁히/,
      /모으기|모아|기록/,
      /만들기|묘사|설정/,
      /확보/,
      /점검/,
    ],
  },
  {
    score: 1,
    patterns: [
      /확인/,
      /변환/,
      /제출/,
      /업로드/,
      /파일명/,
      /형식\s*맞추기/,
    ],
  },
]

// 제출·형식 작업은 인지적 요구가 낮은 활동으로 분류
const ADMIN_ACTION =
  /(제출|업로드|PDF|파일명|파일 형식|분량|문서 형식|보고서 형식|파일 변환)/

// 실제 내용 생성·분석 활동인지 확인
const CONTENT_ACTION =
  /(사례\s*분석|기법\s*분석|요인\s*분석|비교\s*분석|전략\s*제안|그래프\s*작성|코드\s*작성|이론\s*적용)/

/**
 * 인지적 요구 수준 (1~5)
 * 판단 불가 시 null
 */
export function cognitiveScore(step) {
  if (!step || typeof step !== 'object') {
    return null
  }

  const title =
    typeof step.title === 'string'
      ? step.title.trim()
      : ''

  const description =
    typeof step.description === 'string'
      ? step.description.trim()
      : ''

  if (!title && !description) {
    return null
  }

  // 제목과 설명을 함께 본다. 이 앱의 제목은 '인지부하 이론 자료 찾기'처럼
  // 짧은 명사구라 동사가 설명에 들어 있는 경우가 많고, 제목만 보면 실제
  // 단계의 3분의 2가 미평가로 떨어진다.
  const text = [title, description].filter(Boolean).join(' ')

  // 제출·형식 작업 우선 처리. 이 판정만은 제목으로 한다. 제출 형식을 한 줄
  // 언급한 분석 단계까지 1점으로 끌어내리지 않기 위해서다 — 제출이 일인
  // 단계는 제목이 그렇게 말한다.
  const adminText = title || description
  if (ADMIN_ACTION.test(adminText) && !CONTENT_ACTION.test(adminText)) {
    return 1
  }

  // 가장 높은 인지적 요구 수준부터 검사
  for (const rule of COGNITIVE_RULES) {
    if (rule.patterns.some(pattern => pattern.test(text))) {
      return rule.score
    }
  }

  // 규칙에 해당하지 않으면 임의 점수를 부여하지 않음
  return null
}

/**
 * 작업 복잡성 (1~5)
 * 판단 불가 시 null
 *
 * 요구사항과 완료 조건은 중복될 수 있으므로
 * 개수를 더하지 않고 큰 값을 사용한다.
 */
export function proceduralScore(step) {
  if (!step || typeof step !== 'object') {
    return null
  }

  const requirements = Array.isArray(step.requirementIds)
    ? new Set(
        step.requirementIds.filter(
          id => typeof id === 'string' && id.trim()
        )
      ).size
    : 0

  const criteria = Array.isArray(step.completionCriteria)
    ? step.completionCriteria.filter(
        item =>
          item &&
          typeof item.text === 'string' &&
          item.text.trim()
      ).length
    : 0

  if (requirements === 0 && criteria === 0) {
    return null
  }

  return Math.min(
    5,
    Math.max(1, requirements, criteria)
  )
}

/**
 * 최종 예상 난이도 계산
 *
 * 인지적 요구 70%
 * 작업 복잡성 30%
 */
export function calculateDifficulty(step) {
  const cognitive = cognitiveScore(step)
  const procedural = proceduralScore(step)

  // 인지적 요구 판단 불가: 미평가
  if (cognitive === null) {
    return {
      difficultyRank: 0,
      difficultyScore: 0,
      difficultyLabel: '미평가',
      cognitiveScore: 0,
      proceduralScore: procedural ?? 0,
      status: 'unrated',
    }
  }

  // 작업 복잡성 데이터가 없는 경우
  if (procedural === null) {
    return {
      difficultyRank: cognitive,
      difficultyScore: cognitive,
      difficultyLabel: '부분 평가',
      cognitiveScore: cognitive,
      proceduralScore: 0,
      status: 'partial',
    }
  }

  const score =
    cognitive * 0.7 +
    procedural * 0.3

  const rank = Math.max(
    1,
    Math.min(5, Math.round(score))
  )

  const labels = {
    1: '매우 쉬움',
    2: '쉬움',
    3: '보통',
    4: '어려움',
    5: '매우 어려움',
  }

  return {
    difficultyRank: rank,
    difficultyScore: Number(score.toFixed(2)),
    difficultyLabel: labels[rank],
    cognitiveScore: cognitive,
    proceduralScore: procedural,
    status: 'rated',
  }
}

/**
 * 난이도 숫자만 필요한 기존 코드용
 */
export function difficultyRank(step) {
  return calculateDifficulty(step).difficultyRank
}

/**
 * 난이도 높은 순 정렬
 *
 * - 미평가 항목은 맨 아래
 * - 난이도가 같으면 마감일 빠른 순
 * - 마감일이 없으면 기존 순서 유지
 *
 * getStep: 각 row에서 실제 step을 꺼내는 함수
 */
export function sortByDifficulty(
  rows,
  getStep = row => row.step ?? row
) {
  if (!Array.isArray(rows)) {
    return []
  }

  function dueTime(row) {
    const value = row?.dueAt ?? row?.dueDate

    if (!value) return Infinity

    const parsed = Date.parse(value)

    return Number.isFinite(parsed)
      ? parsed
      : Infinity
  }

  return [...rows].sort((a, b) => {
    const aStep = getStep(a)
    const bStep = getStep(b)

    const aResult = calculateDifficulty(aStep)
    const bResult = calculateDifficulty(bStep)

    const aUnrated = aResult.status === 'unrated'
    const bUnrated = bResult.status === 'unrated'

    // 둘 다 미평가면 마감일 비교
    if (aUnrated && bUnrated) {
      return dueTime(a) - dueTime(b)
    }

    // 미평가는 항상 뒤로
    if (aUnrated) return 1
    if (bUnrated) return -1

    // 반올림 전 점수로 정렬
    if (
      aResult.difficultyScore !==
      bResult.difficultyScore
    ) {
      return (
        bResult.difficultyScore -
        aResult.difficultyScore
      )
    }

    // 난이도 동점이면 마감일 빠른 순
    return dueTime(a) - dueTime(b)
  })
}
