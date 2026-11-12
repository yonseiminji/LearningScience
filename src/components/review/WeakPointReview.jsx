import SourceChunks from './SourceChunks.jsx';
export default function WeakPointReview({ result, chunks, onRetry }) {
  return <section className="review-result" aria-label="부족한 부분 다시 학습하기">
    <h3>부족한 부분 다시 학습하기</h3>
    {!result.reviewItems.length ? <p>아직 복습할 오답 기록이 없어요. 먼저 이해 여부 점검하기에서 문제를 풀어 보세요.</p> :
      result.reviewItems.map(item => <article key={item.questionId} className="review-item">
        <strong>{item.term}</strong><p>{item.feedback}</p>
        <SourceChunks ids={item.sourceChunkIds} chunks={chunks}/>
      </article>)}
    {result.reviewItems.length > 0 && <button className="review-primary" type="button" onClick={onRetry}>다시 풀어보기</button>}
  </section>;
}
