import { getStoredPdf, loadPdfDocument, renderPage, getPageCount } from "./pdfLoader.js";
import { parseSentences } from "./sentenceParser.js";
import { SentenceNavigator } from "./navigation.js";

const pageContainer = document.getElementById("pageContainer");
const fileNameEl = document.getElementById("fileName");
const counterEl = document.getElementById("sentenceCounter");

async function main() {
  const stored = await getStoredPdf();
  if (!stored) {
    fileNameEl.textContent = "PDF არ არის არჩეული";
    return;
  }

  fileNameEl.textContent = stored.name;
  const pdfDoc = await loadPdfDocument(stored.data);
  const pageCount = await getPageCount(pdfDoc);

  const allSentences = []; // {pageNumber, text, rects, el}

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const { canvas, items } = await renderPage(pdfDoc, pageNumber);

    const wrapper = document.createElement("div");
    wrapper.className = "page-wrapper";
    wrapper.style.width = canvas.width + "px";
    wrapper.style.height = canvas.height + "px";
    wrapper.appendChild(canvas);

    const textLayer = document.createElement("div");
    textLayer.className = "text-layer";
    wrapper.appendChild(textLayer);
    pageContainer.appendChild(wrapper);

    const sentences = parseSentences(items, pageNumber);

    for (const sentence of sentences) {
      const rectEls = sentence.rects.map((r) => {
        const div = document.createElement("div");
        div.className = "sentence-rect";
        div.style.left = r.x + "px";
        div.style.top = r.y + "px";
        div.style.width = r.width + "px";
        div.style.height = r.height + "px";
        textLayer.appendChild(div);
        return div;
      });
      allSentences.push({ ...sentence, els: rectEls, wrapper });
    }
  }

  counterEl.textContent = `0 / ${allSentences.length}`;

  const navigator = new SentenceNavigator(allSentences);
  navigator.onChange = (sentence, index) => {
    document.querySelectorAll(".sentence-rect.active").forEach((el) => el.classList.remove("active"));

    if (!sentence) {
      counterEl.textContent = `0 / ${allSentences.length}`;
      return;
    }

    sentence.els.forEach((el) => el.classList.add("active"));
    sentence.wrapper.scrollIntoView({ block: "center", behavior: "smooth" });
    counterEl.textContent = `${index + 1} / ${allSentences.length}`;
  };
  navigator.attach();
  navigator.setSentences(allSentences);
}

main().catch((err) => {
  console.error(err);
  fileNameEl.textContent = "შეცდომა PDF-ის ჩატვირთვისას";
});