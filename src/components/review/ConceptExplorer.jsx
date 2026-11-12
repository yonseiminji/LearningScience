import { useState } from 'react';
import { Check } from 'lucide-react';
import SourceChunks from './SourceChunks.jsx';
export default function ConceptExplorer({ result, chunks }) {
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(null); // null | 'ok' | 'failed'
  const selected = result.concepts.find(c => c.conceptId === selectedId);

  async function copyPrompt(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('ok');
    } catch {
      setCopied('failed');
    }
  }
  return <section className="review-result" aria-label="핵심 내용 파악하기">
    <h3>핵심 내용 파악하기</h3>
    {result.isDemoExplanation && <p className="review-muted">시연용 용어 설명입니다. 실제 AI 분석 결과가 아니에요.</p>}
    {!result.concepts.length ? <p>미리 준비된 시연 용어가 없는 자료예요. 실제 Tutor 연결 후 분석할 수 있어요.</p> :
    <div className="review-chip-list">{result.concepts.map(c => <button key={c.conceptId}
      className="review-secondary" type="button" onClick={() => { setSelectedId(c.conceptId); setCopied(null); }}>{c.term}</button>)}</div>}
    {selected && <div className="review-item" role="region" aria-label={`${selected.term} 쉬운 설명`}>
      <div className="review-between"><h4>{selected.term}</h4><button className="review-secondary" onClick={() => { setSelectedId(null); setCopied(null); }}>닫기</button></div>
      <p><strong>쉬운 설명</strong> {selected.easyExplanation}</p>
      <p><strong>예시</strong> {selected.example}</p>
      <p><strong>비유</strong> {selected.analogy}</p>
      <details><summary>관련 강의 원문</summary><SourceChunks ids={selected.sourceChunkIds} chunks={chunks}/></details>
      <button className="review-primary" type="button" onClick={() => copyPrompt(selected.visualPrompt)}>
        Astra용 도식 프롬프트 복사
      </button>
      {copied === 'ok' && <p className="review-copied" role="status"><Check aria-hidden="true" size={14}/>프롬프트를 복사했어요.</p>}
      {copied === 'failed' && <p className="review-note" role="status">복사가 막혀 있어요. 아래 문장을 직접 선택해 복사해 주세요.</p>}
      {copied === 'failed' && <p className="review-item">{selected.visualPrompt}</p>}
    </div>}
  </section>;
}
