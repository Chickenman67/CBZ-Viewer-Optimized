import { detectImageRatio, buildTwoPageLayout } from './utils.js';

// 1. Define the worker code as a string
const workerString = `
  importScripts('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js');

  self.onmessage = async (e) => {
    const { file } = e.data;
    
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      fflate.unzip(uint8Array, (err, unzipped) => {
        if (err) {
          self.postMessage({ error: err.message });
          return;
        }

        const imageNames = Object.keys(unzipped)
          .filter(name => /\\.(jpg|jpeg|png|gif|webp)$/i.test(name))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        const imageData = imageNames.map(name => {
          const fileData = unzipped[name];
          const ext = name.split('.').pop().toLowerCase();
          const type = \`image/\${ext === 'jpg' ? 'jpeg' : ext}\`;
          return new Blob([fileData], { type });
        });

        self.postMessage({ imageData });
      });
    } catch (error) {
      self.postMessage({ error: error.message });
    }
  };
`;

// 2. Create a Blob URL from the string (Bypasses CORS for local files)
const workerBlob = new Blob([workerString], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

export const loadCBZFiles = (files, state, updateLoading) => {
  return new Promise((resolve, reject) => {
    if (!files.length) return;

    updateLoading("Initializing Worker...", 1);

    // 3. Initialize the Worker using the Blob URL
    const worker = new Worker(workerUrl);

    state.imageUrls.forEach(url => URL.revokeObjectURL(url)); 
    state.imageUrls = [];
    state.imageBlobs = [];
    state.spreadMap = [];

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
      
      for (const blob of state.imageBlobs) {
        const url = URL.createObjectURL(blob);
        state.imageUrls.push(url);
        
        const isSpread = await detectImageRatio(blob);
        state.spreadMap.push(isSpread);
      }

      state.twoPageLayout = buildTwoPageLayout(state.spreadMap);
      state.currentPage = 0;

      worker.terminate(); 
      resolve();
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
};