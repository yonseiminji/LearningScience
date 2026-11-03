export default function TaskInput({ value, onChange, onAnalyze, onRestore, message }) {
  return (
    <form
      className="task-form"
      onSubmit={(event) => {
        event.preventDefault()
        onAnalyze()
      }}
    >
      <label htmlFor="instruction">과제 지시문</label>
      <textarea
        id="instruction"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        spellCheck="true"
        aria-describedby={message ? 'instruction-error' : 'instruction-hint'}
      />
      {message ? (
        <p className="notice" id="instruction-error" role="alert">
          {message}
        </p>
      ) : (
        <p className="hint" id="instruction-hint">
          이 데모는 미리 넣어 둔 샘플 과제만 분석합니다.
        </p>
      )}
      <div className="form-actions">
        <button type="submit" className="btn primary">
          과제 분석하기
        </button>
        {message ? (
          <button type="button" className="btn ghost" onClick={onRestore}>
            샘플 과제로 되돌리기
          </button>
        ) : null}
      </div>
    </form>
  )
}
