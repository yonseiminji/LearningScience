/** Lightweight, deterministic paragraph retrieval. No embedding API or database. */
export function createChunks(materialId, content, maxChars = 650) {
  const paragraphs = String(content || '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  const parts = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) parts.push(paragraph);
    else {
      // Prefer breaking at sentence endings while keeping predictable IDs.
      const sentences = paragraph.split(/(?<=[.!?。])\s+/);
      let buffer = '';
      for (const sentence of sentences) {
        if (buffer && (buffer.length + sentence.length + 1 > maxChars)) {
          parts.push(buffer.trim()); buffer = '';
        }
        if (sentence.length > maxChars) {
          if (buffer) { parts.push(buffer.trim()); buffer = ''; }
          for (let p = 0; p < sentence.length; p += maxChars) parts.push(sentence.slice(p, p + maxChars));
        } else buffer += `${buffer ? ' ' : ''}${sentence}`;
      }
      if (buffer.trim()) parts.push(buffer.trim());
    }
  }
  return parts.map((text, index) => ({
    chunkId: `${materialId}-chunk-${String(index + 1).padStart(3, '0')}`,
    materialId,
    index,
    text,
  }));
}

export function retrieveChunks(chunks, query, topK = 3) {
  const keywords = String(query).toLowerCase().match(/[가-힣a-z0-9]{2,}/g) || [];
  const unique = [...new Set(keywords)];
  if (!unique.length) return [];
  return chunks.map(chunk => ({
    ...chunk,
    score: unique.reduce((score, token) => score + (chunk.text.toLowerCase().includes(token) ? 1 : 0), 0),
  })).filter(c => c.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, topK);
}
