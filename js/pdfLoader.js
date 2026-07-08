
import * as pdfjsLib from "../lib/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("lib/pdf.worker.min.mjs");

export async function getStoredPdf() {
  const { currentPdf } = await chrome.storage.local.get("currentPdf");
  if (!currentPdf) return null;
  return currentPdf; 
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function loadPdfDocument(base64Data) {
  const bytes = base64ToUint8Array(base64Data);
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  return loadingTask.promise; 
}

export async function renderPage(pdfDoc, pageNumber, scale = 1.4) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;

  const textContent = await page.getTextContent();
  const items = textContent.items.map((item) => {
    const [a, b, c, d, e, f] = item.transform;
    const height = Math.hypot(b, d) * scale;
    const x = e * scale;
    
    const y = viewport.height - f * scale - height;
    const width = item.width * scale;
    return { text: item.str, x, y, width, height, hasEOL: item.hasEOL };
  });

  return { canvas, items, viewport };
}

export async function getPageCount(pdfDoc) {
  return pdfDoc.numPages;
}