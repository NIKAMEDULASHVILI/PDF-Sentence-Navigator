const input = document.getElementById("pdfInput");
const status = document.getElementById("status");

input.addEventListener("change", async (e) => {
  console.log("PDF selected");

  const file = e.target.files[0];
  if (!file) return;

  console.log("File:", file.name);

  status.textContent = "იტვირთება...";

  try {
    const buffer = await file.arrayBuffer();
    console.log("ArrayBuffer OK");

    const base64 = arrayBufferToBase64(buffer);

    await chrome.storage.local.set({
      currentPdf: {
        name: file.name,
        data: base64,
        loadedAt: Date.now()
      }
    });

    console.log("Storage OK");

    status.textContent = "იხსნება...";

    await chrome.tabs.create({
      url: chrome.runtime.getURL("viewer.html")
    });

    console.log("Viewer opened");

    window.close();

  } catch (err) {
    console.error("ERROR:", err);
    status.textContent = "შეცდომა ფაილის ჩატვირთვისას";
    status.style.color = "#e06c75";
  }
});

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}