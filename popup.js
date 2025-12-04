document.addEventListener('DOMContentLoaded', () => {
  const sizeInput = document.getElementById('size');
  const sizeDisplay = document.getElementById('size-display');
  const sizeDesc = document.getElementById('size-desc');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Apply i18n translations
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const msg = chrome.i18n.getMessage(element.getAttribute('data-i18n'));
    if (msg) {
      element.textContent = msg;
    }
  });

  // Handle special cases with placeholders
  const rulerDescKey = document.querySelector('[data-i18n="rulerDesc"]');
  if (rulerDescKey) {
      // We'll update the full text in updateDisplay, but set initial template here if needed
      // Actually, updateDisplay handles the dynamic part, so we just need the template structure
  }

  // Load saved settings
  chrome.storage.sync.get({ sizeThreshold: 160 }, (items) => {
    // Ensure value is within our range (legacy settings might be outside)
    let val = parseInt(items.sizeThreshold, 10);
    if (val < 20) val = 20;
    if (val > 200) val = 200;
    // Snap to nearest step (20)
    val = Math.round(val / 20) * 20;
    if (val === 0) val = 20; // Minimum effective threshold
    
    sizeInput.value = val;
    updateDisplay(val);
  });

  // Update display while dragging
  sizeInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10);
    // Prevent selecting 0
    if (val === 0) {
        val = 20;
        e.target.value = 20;
    }
    updateDisplay(val);
  });

  function updateDisplay(val) {
    sizeDisplay.textContent = `${val}px`;
    
    // Update ruler description with i18n support
    const rulerMsg = chrome.i18n.getMessage("rulerDesc", [val]);
    // The message contains plain text with the number inserted.
    // However, our HTML structure had a <span> around the number for styling/selection if needed.
    // chrome.i18n.getMessage returns a string. To keep the HTML structure (if we wanted to bold the number),
    // we'd need to use placeholders differently or set innerHTML.
    // Given the current messages.json uses $SIZE$, getMessage will substitute it directly.
    // Let's check if we need to maintain the span id="size-desc". 
    // The previous HTML was: ...即为 <span id="size-desc">160</span>px...
    // To support i18n fully with dynamic placement, we should let getMessage handle the whole string.
    // If we want to style the number differently, we can put HTML tags in messages.json (not recommended for security)
    // or just output the plain text string.
    // For simplicity and correctness in i18n, let's replace the entire text content of the parent div.
    
    const rulerDescContainer = document.querySelector('.ruler-desc');
    if (rulerDescContainer) {
        rulerDescContainer.textContent = rulerMsg;
    }
    
    // Update progress bar using linear-gradient on the input track
    // Calculate percentage: (val / 200) * 100%
    const percentage = (val / 200) * 100;
    sizeInput.style.background = `linear-gradient(to right, #1a73e8 0%, #1a73e8 ${percentage}%, #e8eaed ${percentage}%, #e8eaed 100%)`;
  }

  // Save settings
  saveButton.addEventListener('click', () => {
    const size = parseInt(sizeInput.value, 10);
    
    chrome.storage.sync.set({ sizeThreshold: size }, () => {
      // Reload the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
            // Close the popup after reload
            window.close();
        }
      });
    });
  });

  function showStatus(message, isSuccess) {
    statusDiv.textContent = message;
    statusDiv.style.color = isSuccess ? '#188038' : '#d93025';
    statusDiv.style.opacity = 1;
    
    if (isSuccess) {
      setTimeout(() => {
        statusDiv.style.opacity = 0;
      }, 2000);
    }
  }
});
