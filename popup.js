document.addEventListener('DOMContentLoaded', () => {
  const sizeInput = document.getElementById('size');
  const sizeDisplay = document.getElementById('size-display');
  const sizeDesc = document.getElementById('size-desc');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

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
    sizeDesc.textContent = val;
    
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
