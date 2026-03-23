import { detectImageRatio, buildTwoPageLayout } from './utils.js';

export const loadCBZFiles = (files, state, updateLoading) => {
  return new Promise((resolve, reject) => {
    if (!files.length) return;

    updateLoading("Initializing Worker...", 1);

    // Initialize the Worker
    const worker = new Worker('./js/worker.js');

    // Clean up previous URLs to prevent memory leaks
    state.imageUrls.forEach(url => URL.createObjectURL(url)); 
    state.imageUrls = [];
    state.imageBlobs = [];
    state.spreadMap = [];

    // Send the first file to the worker
    // (For simplicity, we handle one CBZ at a time here)
    worker.postMessage({ file: files[0] });

    worker.onmessage = async (e) => {
      const { imageData, error } = e.data;

      if (error) {
        updateLoading("Extraction Error", 1);
        worker.terminate();
        return reject(error);
      }

      updateLoading("Processing Layout...", 1);

      state.imageBlobs = imageData;
      
      // Generate Object URLs and Detect Ratios
      for (const blob of state.imageBlobs) {
        const url = URL.createObjectURL(blob);
        state.imageUrls.push(url);
        
        // This still happens on main thread because it needs the 'Image' object
        const isSpread = await detectImageRatio(blob);
        state.spreadMap.push(isSpread);
      }

      state.twoPageLayout = buildTwoPageLayout(state.spreadMap);
      state.currentPage = 0;

      worker.terminate(); // Clean up worker
      resolve();
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
};