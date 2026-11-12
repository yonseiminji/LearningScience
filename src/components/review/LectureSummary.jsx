import { useState } from 'react';
import SourceChunks from './SourceChunks.jsx';
export default function LectureSummary({ material, result }) {
  const [showOriginal, setShowOriginal] = useState(false);
  return <section className="review-result" aria-label="강의 내용 확인하기">
    <h3>강의 내용 확인하기</h3>
    <p className="review-muted">{result.overview}</p>
    <h4>핵심 내용</h4>
    {result.keyPoints.map(point => <article className="review-item" key={point.id}>
      <strong>{point.title}</strong><p>{point.explanation}</p>
      <SourceChunks ids={point.sourceChunkIds} chunks={material.chunks}/>
    </article>)}
    <button className="review-secondary" type="button" onClick={() => setShowOriginal(p => !p)}>
      {showOriginal ? '원문 접기' : '강의 원문 전체 보기'}
    </button>
    {showOriginal && <div className="review-original">{material.content}</div>}
  </section>;
}
