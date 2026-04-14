import { detectImageRatio, buildTwoPageLayout } from './utils.js';

/**
 * Creates a worker from a local file path even on file:// protocol
 */
async function createWorker(path) {
  const response = await fetch(path);
  const code = await response.text();
  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

export const loadCBZFiles = async (files, state, updateLoading) => {
  if (!files.length) return;

  updateLoading("Initializing Worker...", 1);

  // ✅ FIX: Correct Memory Cleanup
  if (state.imageUrls && state.imageUrls.length > 0) {
    state.imageUrls.forEach(url => URL.revokeObjectURL(url));
  }

  // Reset State
  state.imageBlobs = [];
  state.imageUrls = [];
  state.spreadMap = [];

  try {
    // Initialize Worker via the bypass helper
    const worker = await createWorker('./js/worker.js');
    
    return new Promise((resolve, reject) => {
      worker.postMessage({ file: files[0] });

      worker.onmessage = async (e) => {
        const { imageData, error } = e.data;

        if (error) {
          updateLoading("Error: " + error, 1);
          worker.terminate();
          return reject(error);
        }

        updateLoading("Processing Images...", 1);
        state.imageBlobs = imageData;

        // Convert Blobs to persistent URLs and check ratios
        for (const blob of state.imageBlobs) {
          const url = URL.createObjectURL(blob);
          state.imageUrls.push(url);
          
          // Ratio detection
          const isSpread = await detectImageRatio(blob);
          state.spreadMap.push(isSpread);
        }

        state.twoPageLayout = buildTwoPageLayout(state.spreadMap, state.twoPageShift);
        state.currentPage = 0;

        worker.terminate();
        resolve();
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };
    });
  } catch (err) {
    updateLoading("Failed to start worker", 1);
    console.error(err);
  }
};