// Import fflate inside the worker
importScripts('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js');

self.onmessage = async (e) => {
  const { file } = e.data;
  
  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // fflate.unzip is asynchronous and extremely fast
    fflate.unzip(uint8Array, (err, unzipped) => {
      if (err) {
        self.postMessage({ error: err.message });
        return;
      }

      // Filter for images and sort them
      const imageNames = Object.keys(unzipped)
        .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      // Convert raw Uint8Arrays to Blobs
      const imageData = imageNames.map(name => {
        const fileData = unzipped[name];
        // We determine the MIME type based on extension
        const ext = name.split('.').pop().toLowerCase();
        const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        return new Blob([fileData], { type });
      });

      // Send Blobs back to main thread
      // Note: In a production app, we'd use "Transferables" for even more speed,
      // but Blobs are already very efficient.
      self.postMessage({ imageData });
    });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};