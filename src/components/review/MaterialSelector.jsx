export default function MaterialSelector({ materials, value, onChange }) {
  return (
    <div className="review-field">
      <label htmlFor="review-material">공부할 강의를 선택하세요.</label>
      {materials.length ? (
        <select id="review-material" value={value} onChange={event => onChange(event.target.value)}>
          <option value="">강의 기록을 선택하세요</option>
          {materials.map(item => <option key={item.materialId} value={item.materialId}>{item.fileName}</option>)}
        </select>
      ) : <p role="status">아직 등록된 강의 기록이 없어요. 강의 이해 지원에서 TXT를 올려주세요.</p>}
    </div>
  );
}
