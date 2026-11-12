// Lecture note files (TXT transcripts from an external STT service).
//
// This module holds the file handling only. It stays free of React so the
// upload UI and the processing rules can change independently, and so a later
// AI Tutor step (chunking, embedding, vector search) can be added here without
// touching the components.

import { createChunks } from './utils/chunkSearch.js'

export const MAX_FILE_BYTES = 3 * 1024 * 1024 // 3MB
export const ACCEPTED_EXTENSION = '.txt'
export const CLOVANOTE_URL = 'https://clovanote.naver.com/'

export const UPLOAD_ERRORS = {
  extension: 'TXT 파일만 올릴 수 있어요. 클로바노트에서 텍스트로 내보낸 뒤 다시 시도해 주세요.',
  size: `파일이 너무 커요. ${formatBytes(MAX_FILE_BYTES)}까지 올릴 수 있어요.`,
  empty: '파일 안에 글자가 없어요. 변환된 내용이 저장되었는지 확인해 주세요.',
  read: '파일을 읽지 못했어요. 잠시 후 다시 시도해 주세요.',
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

export function hasTxtExtension(name) {
  return typeof name === 'string' && name.toLowerCase().endsWith(ACCEPTED_EXTENSION)
}

// Returns null when the file is acceptable, otherwise the reason key.
export function validateTxtFile(file) {
  if (!file) return 'read'
  if (!hasTxtExtension(file.name)) return 'extension'
  if (file.size > MAX_FILE_BYTES) return 'size'
  return null
}

export function readTxtFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('read'))
    reader.readAsText(file, 'utf-8')
  })
}

let noteSeq = 0

// The shape a later RAG step would index. Nothing leaves the browser today:
// there is no upload request, no embedding, and no vector store.
export function createLectureNote({ lectureId, file, text }) {
  noteSeq += 1
  return {
    lectureId,
    fileId: `note-${Date.now()}-${noteSeq}`,
    fileName: file.name,
    fileSize: file.size,
    text,
    uploadedAt: new Date().toISOString(),
  }
}

// 복습 및 개인 공부 reads the same uploads 강의 이해 지원 collects — there is
// one uploader, and this is the adapter to the shape that section expects.
// Chunking happens here so nothing has to re-read the file.
export function toMaterial(note) {
  return {
    materialId: note.fileId,
    courseId: note.lectureId,
    fileName: note.fileName,
    uploadedAt: note.uploadedAt,
    status: 'ready',
    content: note.text,
    chunks: createChunks(note.fileId, note.text),
  }
}

export function materialsFor(notes = []) {
  return notes.map(toMaterial)
}

export function notePreview(text, limit = 600) {
  const trimmed = (text || '').trim()
  if (trimmed.length <= limit) return trimmed
  return `${trimmed.slice(0, limit)}…`
}

export function formatUploadedAt(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hour}:${minute}`
}

// Whether the ClovaNote walkthrough has been dismissed before. Storage can be
// unavailable (private mode, blocked cookies), so a failure reads as "not seen"
// and the guide simply shows again.
const CLOVA_GUIDE_KEY = 'chagok.clovaGuideSeen'

export function readClovaGuideSeen() {
  try {
    return window.localStorage.getItem(CLOVA_GUIDE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeClovaGuideSeen() {
  try {
    window.localStorage.setItem(CLOVA_GUIDE_KEY, 'true')
  } catch {
    // storage unavailable: the guide stays openable from the button
  }
}
