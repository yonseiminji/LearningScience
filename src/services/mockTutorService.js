import { retrieveChunks } from '../utils/chunkSearch.js';

// Demo-only provider: no API calls and no claim of AI-generated analysis.
const DEMO_TERMS = [
  {
    term: '외재적 인지부하',
    easyExplanation: '학습 내용이 아니라 복잡한 자료 제시 방식 때문에 추가로 생기는 부담이에요.',
    example: '한 슬라이드에 글과 그림이 너무 많아 어디부터 봐야 할지 모르겠는 상황이에요.',
    analogy: '안내판이 너무 복잡해 길을 찾기 더 어려워지는 것과 비슷해요.',
    visualPrompt: '외재적 인지부하를 설명하는 간단한 교육용 비교 도식을 제작해 주세요. 복잡한 자료와 정돈된 자료를 나란히 보여주고 차이를 짧은 한국어로 설명해 주세요.',
  },
  {
    term: '작업기억',
    easyExplanation: '지금 보고 듣는 정보를 잠깐 기억하면서 생각하는 데 쓰는 기억이에요.',
    example: '암산하는 동안 숫자를 머릿속에 잠시 붙잡아 두는 상황이에요.',
    analogy: '크기가 제한된 책상 위에서 자료를 펼쳐놓고 처리하는 것과 비슷해요.',
    visualPrompt: '작업기억의 제한된 용량을 보여주는 간단한 교육용 도식을 만들어 주세요. 제한된 크기의 책상 위에 정보가 놓이는 모습으로 표현해 주세요.',
  },
  {
    term: '내재적 인지부하',
    easyExplanation: '배울 내용 자체가 복잡해서 생기는 학습 부담이에요.',
    example: '처음 배우는 여러 수학 개념을 동시에 연결해야 하는 상황이에요.',
    analogy: '어려운 퍼즐을 맞출 때 조각들 사이 관계를 계속 생각해야 하는 것과 비슷해요.',
    visualPrompt: '내재적 인지부하를 개념들 사이 연결이 많은 퍼즐로 설명하는 교육용 그림 안내를 만들어 주세요.',
  },
];

const wrap = (materialId, mode, data) => ({ schemaVersion: 1, materialId, mode, status: 'ready', data, provider: 'mock' });

export const mockTutorService = {
  async generate({ material, mode, attempts = [] }) {
    if (!material?.materialId || !Array.isArray(material.chunks)) throw new Error('강의 자료를 찾을 수 없어요.');
    const { materialId, chunks } = material;
    if (!chunks.length) throw new Error('강의 자료에 읽을 수 있는 텍스트가 없어요.');

    if (mode === 'summary') {
      return wrap(materialId, mode, {
        overview: '시연용 미리보기입니다. 아래는 업로드한 강의 원문에서 발췌한 문단이며, 실제 AI 요약이 아닙니다.',
        keyPoints: chunks.slice(0, 6).map((chunk, i) => ({
          id: `point-${i + 1}`,
          title: `강의 문단 ${i + 1}`,
          explanation: chunk.text.length > 180 ? `${chunk.text.slice(0, 180)}…` : chunk.text,
          sourceChunkIds: [chunk.chunkId],
        })),
      });
    }

    if (mode === 'concepts') {
      const concepts = DEMO_TERMS.flatMap((item, i) => {
        const matches = retrieveChunks(chunks, item.term, 2);
        return matches.length ? [{
          conceptId: `concept-${i + 1}`,
          ...item,
          sourceChunkIds: matches.map(c => c.chunkId),
        }] : [];
      });
      return wrap(materialId, mode, { concepts, isDemoExplanation: true });
    }

    if (mode === 'quiz') {
      const questions = [];
      const extrinsic = retrieveChunks(chunks, '외재적 인지부하', 1)[0];
      const working = retrieveChunks(chunks, '작업기억', 1)[0];
      if (extrinsic) questions.push({
        questionId: 'q-extrinsic', type: 'ox', question: '외재적 인지부하는 자료를 제시하는 방식과 관련될 수 있다.',
        options: ['O', 'X'], correctAnswer: 'O', acceptedAnswers: ['O'],
        explanation: '자료를 불필요하게 복잡하게 제시하면 외재적 인지부하가 증가할 수 있어요.',
        relatedConceptIds: ['concept-1'], sourceChunkIds: [extrinsic.chunkId],
      });
      if (working) questions.push({
        questionId: 'q-working', type: 'blank', question: '학습 정보를 일시적으로 유지하고 처리하는 기억은 ____이에요.',
        options: [], correctAnswer: '작업기억', acceptedAnswers: ['작업기억', '작업 기억'],
        explanation: '작업기억은 정보를 잠시 유지하고 처리하는 인지 체계예요.',
        relatedConceptIds: ['concept-2'], sourceChunkIds: [working.chunkId],
      });
      return wrap(materialId, mode, { questions, isDemoQuiz: true });
    }

    if (mode === 'review') {
      const quiz = await mockTutorService.generate({ material, mode: 'quiz' });
      const questions = quiz.data.questions;
      const reviewItems = attempts.filter(a => a.isCorrect === false).flatMap(attempt => {
        const q = questions.find(item => item.questionId === attempt.questionId);
        return q ? [{ questionId: q.questionId, term: q.question, feedback: q.explanation,
          sourceChunkIds: q.sourceChunkIds, suggestedAction: 'review_source' }] : [];
      });
      return wrap(materialId, mode, { reviewItems });
    }
    throw new Error('지원하지 않는 학습 기능이에요.');
  },
};
