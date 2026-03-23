import { detectImageRatio, buildTwoPageLayout } from './utils.js';

/**
 * Handles extraction of CBZ files using JSZip.
 * @param {File[]} files - Selected files
 * @param {Object} state - Application state
 * @param {Function} updateLoading - UI callback
 */
export const loadCBZFiles = async (files, state, updateLoading) => {
  if (!files.length) return;

  updateLoading("Extracting...", 1);

  // Clean up existing memory URLs before loading new ones
  if (state.imageUrls.length > 0) {
    state.imageUrls.forEach(url => URL.revokeObjectURL(url));
  }

  state.imageBlobs = [];
  state.imageUrls = [];
  state.spreadMap = [];
  
  try {
    for (const file of files) {
      const zip = new JSZip();
      const zipData = await file.arrayBuffer();
      const contents = await zip.loadAsync(zipData);

      // Filter and sort images naturally
      const imageFiles = Object.keys(contents.files)
        .filter(name => name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      // Process images (Sequential to preserve exact memory order without locking thread)
      for (const name of imageFiles) {
        const blob = await contents.files[name].async("blob");
        const url = URL.createObjectURL(blob); // Generate URL once per session
        
        state.imageBlobs.push(blob);
        state.imageUrls.push(url);

        const isSpread = await detectImageRatio(blob);
        state.spreadMap.push(isSpread);
      }
    }

    state.twoPageLayout = buildTwoPageLayout(state.spreadMap);
    state.currentPage = 0;

  } catch (error) {
    console.error("Error reading CBZ:", error);
    updateLoading("Error loading file", 1);
    setTimeout(() => updateLoading("", 0), 2000);
    throw error;
  }
};