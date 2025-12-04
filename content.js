let sizeThreshold = 160;

// Load the initial threshold from storage
chrome.storage.sync.get({ sizeThreshold: 160 }, (items) => {
  sizeThreshold = parseInt(items.sizeThreshold, 10) || 160;
});

function applyHdrFilter(img) {
  // Check if the image's rendered dimensions are less than the threshold
  if (img.clientWidth > 0 && img.clientHeight > 0 && img.clientWidth < sizeThreshold && img.clientHeight < sizeThreshold) {
    img.style.filter = 'contrast(100%) saturate(100%)';
  }
}

function processImages() {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      // If image is already loaded, process it immediately.
      applyHdrFilter(img);
    } else {
      // Otherwise, wait for it to load.
      img.addEventListener('load', () => applyHdrFilter(img), { once: true });
    }
  });
}

// Run on initial page load
processImages();

// Use MutationObserver to detect images added to the DOM later.
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      // We only care about element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check if the added node is an image
        if (node.tagName === 'IMG') {
            const img = node;
            if (img.complete) {
                applyHdrFilter(img);
            } else {
                img.addEventListener('load', () => applyHdrFilter(img), { once: true });
            }
        }
        // Check if the added node contains images
        else {
            node.querySelectorAll('img').forEach(img => {
                if (img.complete) {
                    applyHdrFilter(img);
                } else {
                    img.addEventListener('load', () => applyHdrFilter(img), { once: true });
                }
            });
        }
      }
    }
  }
});

// Start observing the document's root element for added nodes
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});