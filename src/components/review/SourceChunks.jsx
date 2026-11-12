export default function SourceChunks({ ids = [], chunks = [] }) {
  const matches = ids.map(id => chunks.find(chunk => chunk.chunkId === id)).filter(Boolean);
  if (!matches.length) return <p className="review-muted">연결된 원문이 없어요.</p>;
  return <div className="review-sources" aria-label="관련 강의 원문">
    {matches.map(chunk => <blockquote key={chunk.chunkId}><small>{chunk.chunkId}</small><p>{chunk.text}</p></blockquote>)}
  </div>;
}
