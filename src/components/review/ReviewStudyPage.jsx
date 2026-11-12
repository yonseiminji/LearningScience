import { useEffect, useMemo, useRef, useState } from 'react';
import { tutorService } from '../../services/tutorService.js';
import MaterialSelector from './MaterialSelector.jsx';
import ReviewModeGrid from './ReviewModeGrid.jsx';
import LectureSummary from './LectureSummary.jsx';
import ConceptExplorer from './ConceptExplorer.jsx';
import QuizPanel from './QuizPanel.jsx';
import WeakPointReview from './WeakPointReview.jsx';
import './reviewStudy.css';

export default function ReviewStudyPage({ courseId, materials = [], showHeading = true }) {
  const [materialId, setMaterialId] = useState('');
  const [activeMode, setActiveMode] = useState(null);
  const [results, setResults] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const availableMaterials = useMemo(() => materials.filter(m => m.courseId === courseId), [materials, courseId]);
  const selectedMaterial = availableMaterials.find(m => m.materialId === materialId);

  useEffect(() => { requestId.current += 1; setMaterialId(''); setActiveMode(null); setError(null); setLoading(false); }, [courseId]);
  useEffect(() => {
    if (materialId && !availableMaterials.some(m => m.materialId === materialId)) {
      requestId.current += 1; setMaterialId(''); setActiveMode(null); setLoading(false);
    }
  }, [availableMaterials, materialId]);

  // A TXT that was removed takes its analysis and its wrong answers with it:
  // keeping them would answer questions about a lecture the learner no longer
  // has. Keyed by materialId, which is unique per upload, so re-uploading the
  // same file starts clean.
  useEffect(() => {
    const live = new Set(materials.map(m => m.materialId));
    setResults(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([key]) => live.has(key.split(':')[0])));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
    setQuizAttempts(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([key]) => live.has(key)));
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [materials]);

  async function selectMode(mode, { force = false } = {}) {
    if (!selectedMaterial) return;
    const id = ++requestId.current;
    const currentMaterialId = selectedMaterial.materialId;
    const cacheKey = `${currentMaterialId}:${mode}`;
    setActiveMode(mode); setError(null);
    if (!force && results[cacheKey] && mode !== 'review') { setLoading(false); return; }
    setLoading(true);
    try {
      const result = await tutorService.generate({
        material: selectedMaterial, mode, attempts: quizAttempts[currentMaterialId] || [],
      });
      if (id !== requestId.current) return;
      if (result.materialId !== currentMaterialId || result.mode !== mode || result.schemaVersion !== 1) {
        throw new Error('응답 데이터가 선택한 자료와 일치하지 않아요.');
      }
      setResults(prev => ({ ...prev, [cacheKey]: result }));
    } catch (e) {
      if (id === requestId.current) setError(e.message || '학습 결과를 불러오지 못했어요.');
    } finally { if (id === requestId.current) setLoading(false); }
  }

  const currentResult = results[`${materialId}:${activeMode}`];
  const visibleResult = currentResult?.materialId === materialId && currentResult?.mode === activeMode ? currentResult : null;
  const changeMaterial = (id) => {
    requestId.current += 1; setMaterialId(id); setActiveMode(null); setLoading(false); setError(null);
  };
  return <section className="review-study">
    {showHeading && <h2>복습 및 개인 공부</h2>}
    <MaterialSelector materials={availableMaterials} value={materialId} onChange={changeMaterial}/>
    {selectedMaterial && <>
      <h3>무엇을 공부할까요?</h3>
      <ReviewModeGrid activeMode={activeMode} onSelect={selectMode}/>
      {loading && <p role="status">학습 내용을 준비하고 있어요...</p>}
      {error && <p role="alert" className="review-error">{error}</p>}
      {!loading && !error && visibleResult && <>
        {activeMode === 'summary' && <LectureSummary key={materialId} material={selectedMaterial} result={visibleResult.data}/>}
        {activeMode === 'concepts' && <ConceptExplorer key={materialId} result={visibleResult.data} chunks={selectedMaterial.chunks}/>}
        {activeMode === 'quiz' && <QuizPanel materialId={materialId} questions={visibleResult.data.questions} onComplete={attempts => {
          setQuizAttempts(prev => ({ ...prev, [materialId]: attempts }));
          setResults(prev => { const next = { ...prev }; delete next[`${materialId}:review`]; return next; });
        }}/>}
        {activeMode === 'review' && <WeakPointReview result={visibleResult.data} chunks={selectedMaterial.chunks} onRetry={() => selectMode('quiz')}/>}
      </>}
    </>}
  </section>;
}
