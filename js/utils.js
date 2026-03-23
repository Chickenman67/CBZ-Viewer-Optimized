/**
 * Detects if an image blob is a double-page spread.
 * @param {Blob} blob - The image blob
 * @returns {Promise<boolean>} - True if ratio > 1.3
 */
export const detectImageRatio = (blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      URL.revokeObjectURL(url); // Clean up memory immediately
      resolve(ratio > 1.3);
    };
    
    img.onerror = () => reject(new Error("Failed to load image for ratio detection"));
    img.src = url;
  });
};

/**
 * Builds the array mapping for 2-page mode based on spreads.
 * @param {boolean[]} spreadMap - Array indicating if an index is a spread
 * @returns {Array<Array<number>>} - Mapped page indices
 */
export const buildTwoPageLayout = (spreadMap) => {
  const layout = [];
  let i = 0;
  
  while (i < spreadMap.length) {
    if (spreadMap[i]) {
      layout.push([i]);
      i += 1;
    } else {
      if (i + 1 < spreadMap.length && !spreadMap[i + 1]) {
        layout.push([i, i + 1]);
        i += 2;
      } else {
        layout.push([i]);
        i += 1;
      }
    }
  }
  return layout;
};

/**
 * Clears DOM node completely, minimizing innerHTML overhead.
 * @param {HTMLElement} node 
 */
export const emptyNode = (node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};