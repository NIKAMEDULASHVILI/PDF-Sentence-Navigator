chrome.runtime.onInstalled.addListener(() => {
    console.log("PDF Sentence Navigator installed.");
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
});