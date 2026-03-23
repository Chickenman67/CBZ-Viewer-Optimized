/**
 * Initializes and handles zoom logic.
 * @param {Object} state - Application state
 */
export const initZoom = (state) => {
  const zoomSlider = document.getElementById("zoomSlider");
  
  // Debounce/Throttle isn't strictly necessary for a simple DOM style update, 
  // but using requestAnimationFrame ensures smoother layout adjustments.
  let isUpdating = false;

  zoomSlider.addEventListener("input", () => {
    if (isUpdating) return;
    
    isUpdating = true;
    requestAnimationFrame(() => {
      const zoomValue = zoomSlider.value + "vh";

      if (state.mode === "page" || state.mode === "two") {
        const images = document.querySelectorAll("#viewer img");
        images.forEach(img => {
          img.style.maxHeight = zoomValue;
        });
      }
      isUpdating = false;
    });
  });
};