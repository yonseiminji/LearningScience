import { useEffect, useState } from 'react';
function normalized(s) { return String(s ?? '').normalize('NFKC').trim().replace(/\s+/g, '').toLowerCase(); }
export default function QuizPanel({ materialId, questions, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(null);
  useEffect(() => { setAnswers({}); setGraded(null); }, [materialId, questions]);
  const update = (id, value) => { setAnswers(p => ({ ...p, [id]: value })); setGraded(null); };
  const submit = () => {
    const attempts = questions.map(q => ({
      questionId: q.questionId, userAnswer: answers[q.questionId],
      isCorrect: q.acceptedAnswers.some(correct => normalized(correct) === normalized(answers[q.questionId])),
    }));
    setGraded(attempts); onComplete(attempts);
  };
  return <section className="review-result" aria-label="이해 여부 점검하기">
    <h3>이해 여부 점검하기</h3>
    <p className="review-muted">시연용 문제입니다. 실제 AI 퀴즈 생성 및 채점은 연결되지 않았어요.</p>
    {!questions.length && <p>이 자료에 맞는 시연 문제가 아직 없어요.</p>}
    {questions.map((q, i) => <div className="review-item" key={q.questionId}>
      <p><strong>{i + 1}. {q.question}</strong></p>
      {q.type === 'ox' ? <div className="review-choices">{q.options.map(option => <label key={option}>
        <input type="radio" name={`answer-${q.questionId}`} value={option}
          checked={answers[q.questionId] === option} onChange={() => update(q.questionId, option)}/> {option}
      </label>)}</div> : <input type="text" aria-label={`${i + 1}번 빈칸 답변`} placeholder="답을 입력하세요"
        value={answers[q.questionId] || ''} onChange={e => update(q.questionId, e.target.value)}/>}
      {graded && <div className="review-feedback">
        <strong>{graded.find(a => a.questionId === q.questionId)?.isCorrect ? '정답이에요.' : `다시 살펴봐요. 정답: ${q.correctAnswer}`}</strong>
        <p>{q.explanation}</p>
      </div>}
    </div>)}
    {!!questions.length && <button className="review-primary" type="button"
      disabled={!questions.every(q => String(answers[q.questionId] || '').trim())} onClick={submit}>정답 확인하기</button>}
  </section>;
}
