// Import fflate from CDN
importScripts('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js');

self.onmessage = async (e) => {
  const { file } = e.data;
  
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Decompress
    fflate.unzip(uint8Array, (err, unzipped) => {
      if (err) {
        self.postMessage({ error: err.message });
        return;
      }

      // Filter and Sort images naturally (e.g., 2.jpg before 10.jpg)
      const imageNames = Object.keys(unzipped)
        .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Map to Blobs
      const imageData = imageNames.map(name => {
        const fileData = unzipped[name];
        const ext = name.split('.').pop().toLowerCase();
        const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        return new Blob([fileData], { type });
      });

      self.postMessage({ imageData });
    });
  } catch (error) {
    self.postMessage({ error: "Worker Thread Error: " + error.message });
  }
};