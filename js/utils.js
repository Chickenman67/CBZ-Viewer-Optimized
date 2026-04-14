export const detectImageRatio = (blob) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = async () => {
      try {
        // Optimization: Decode off-thread before checking dimensions
        await img.decode(); 
        const ratio = img.naturalWidth / img.naturalHeight;
        URL.revokeObjectURL(url);
        resolve(ratio > 1.3);
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve(false); // Fallback for corrupt images
      }
    };
    img.src = url;
  });
};

// ... keep buildTwoPageLayout and emptyNode from previous version

/**
 * Builds the array mapping for 2-page mode based on spreads.
 * @param {boolean[]} spreadMap - Array indicating if an index is a spread
 * @returns {Array<Array<number>>} - Mapped page indices
 */
export const buildTwoPageLayout = (spreadMap, shiftFirstPage = false) => {
  const layout = [];
  let i = 0;

  if (shiftFirstPage && spreadMap.length > 1 && !spreadMap[0]) {
    layout.push([0]);
    i = 1;
  }

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