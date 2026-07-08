const SENTENCE_END = /[.!?…]+["')\]]*(\s+|$)/;
const MAX_SENTENCE_CHARS = 280;

/**
 * @param {Array<{text,x,y,width,height,hasEOL}>} items
 * @param {number} pageNumber
 * @returns {Array<{pageNumber,text,rects:Array<{x,y,width,height}>}>}
 */
export function parseSentences(items, pageNumber) {
  if (!items.length) return [];

  const sentences = [];

  let currentText = "";
  let currentItems = [];

  const pushSentence = () => {
    const text = currentText.trim();

    if (!text) return;

    // მხოლოდ იმ ხაზების აღება, რომლებიც ამ წინადადებას ეკუთვნის
    const rects = currentItems.map((item) => ({
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height
    }));

    sentences.push({
      pageNumber,
      text,
      rects
    });

    currentText = "";
    currentItems = [];
  };


  for (const item of items) {

    currentText += item.text + (item.hasEOL ? " " : "");
    currentItems.push(item);


    const matchesEnd = SENTENCE_END.test(currentText);


    if (matchesEnd || currentText.length >= MAX_SENTENCE_CHARS) {
      pushSentence();
    }
  }


  // დარჩენილი ტექსტი
  if (currentText.trim()) {
    pushSentence();
  }


  return sentences;
}