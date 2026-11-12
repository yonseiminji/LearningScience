import { useId, useRef, useState } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'
import {
  MAX_FILE_BYTES,
  UPLOAD_ERRORS,
  createLectureNote,
  formatBytes,
  formatUploadedAt,
  notePreview,
  readTxtFile,
  validateTxtFile,
} from '../lectureNotes.js'

// Drag and drop upload for TXT transcripts. The file is read in the browser
// with the File API and kept in React state; nothing is sent anywhere.
export default function TxtUpload({ lectureId, notes, onAdd, onRemove }) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [openId, setOpenId] = useState(null)
  const inputRef = useRef(null)
  const inputId = useId()

  async function accept(file) {
    setError('')
    const problem = validateTxtFile(file)
    if (problem) {
      setError(UPLOAD_ERRORS[problem])
      return
    }
    setBusy(true)
    try {
      const text = await readTxtFile(file)
      if (!text.trim()) {
        setError(UPLOAD_ERRORS.empty)
        return
      }
      const note = createLectureNote({ lectureId, file, text })
      onAdd(note)
      setOpenId(note.fileId)
    } catch {
      setError(UPLOAD_ERRORS.read)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) accept(file)
  }

  return (
    <div className="txt-upload">
      <label
        className={dragging ? 'dropzone is-active' : 'dropzone'}
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="dropzone-input"
          type="file"
          accept=".txt,text/plain"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) accept(file)
          }}
        />
        <Upload aria-hidden="true" size={28} />
        <p className="dropzone-msg">{busy ? '파일을 읽는 중이에요…' : '클릭하거나 파일을 이곳에 끌어다 놓으세요'}</p>
        <p className="dropzone-desc">TXT 파일 · 최대 {formatBytes(MAX_FILE_BYTES)}</p>
      </label>

      <p className="dropzone-note">올린 파일은 이 브라우저 화면에서만 열어 보고, 서버로 보내지 않아요.</p>

      {error ? (
        <p className="upload-error" role="alert">
          {error}
        </p>
      ) : null}

      {notes.length > 0 ? (
        <ul className="note-list">
          {notes.map((note) => {
            const open = openId === note.fileId
            const bodyId = `${note.fileId}-preview`
            return (
              <li key={note.fileId} className="note-item">
                <div className="note-row">
                  <FileText aria-hidden="true" size={18} />
                  <span className="note-main">
                    <span className="note-name">{note.fileName}</span>
                    <span className="note-meta">
                      {formatBytes(note.fileSize)} · {formatUploadedAt(note.uploadedAt)} 등록
                    </span>
                  </span>
                  <button
                    type="button"
                    className="btn note-toggle"
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={() => setOpenId(open ? null : note.fileId)}
                  >
                    {open ? '접기' : '내용 보기'}
                  </button>
                  <button
                    type="button"
                    className="icon-btn note-remove"
                    onClick={() => {
                      if (open) setOpenId(null)
                      onRemove(note.fileId)
                    }}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                    <span className="sr-only">{note.fileName} 삭제</span>
                  </button>
                </div>
                {open ? (
                  <pre id={bodyId} className="note-preview">
                    {notePreview(note.text)}
                  </pre>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="hint">아직 등록한 강의 기록이 없어요.</p>
      )}
    </div>
  )
}
