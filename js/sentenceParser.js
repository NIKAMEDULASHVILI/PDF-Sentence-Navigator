
const SENTENCE_END = /[.!?…]+(\s+|$)/g;

/**
 * @param {Array<{text,x,y,width,height,hasEOL}>} items 
 * @param {number} pageNumber
 * @returns {Array<{pageNumber, text, rects: Array<{x,y,width,height}>}>}
 */
export function parseSentences(items, pageNumber) {
  if (!items.length) return [];

  
  let fullText = "";
  const charMap = []; 

  items.forEach((item, idx) => {
    const chunk = item.text + (item.hasEOL ? " " : "");
    for (let i = 0; i < chunk.length; i++) charMap.push(idx);
    fullText += chunk;
  });

  const sentences = [];
  let cursor = 0;
  let match;
  SENTENCE_END.lastIndex = 0;

  const pushSentence = (start, end) => {
    const text = fullText.slice(start, end).trim();
    if (!text) return;
    const itemIdxs = new Set(charMap.slice(start, end));
    const rects = [...itemIdxs].map((i) => {
      const it = items[i];
      return { x: it.x, y: it.y, width: it.width, height: it.height };
    });
    sentences.push({ pageNumber, text, rects });
  };

  while ((match = SENTENCE_END.exec(fullText)) !== null) {
    const end = match.index + match[0].length;
    pushSentence(cursor, end);
    cursor = end;
  }
  if (cursor < fullText.length) pushSentence(cursor, fullText.length);

  return sentences;
}