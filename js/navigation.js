/**
 * Handles all navigation logic (buttons and keyboard).
 * @param {Object} state - Application state
 * @param {Object} Renderer - The renderer instance
 */
export const initNavigation = (state, Renderer) => {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const nextPage = () => {
    if (state.mode === "page") {
      state.currentPage++;
      Renderer.showPage(state);
    } else if (state.mode === "two") {
      state.twoPageIndex++;
      Renderer.showTwoPageSpread(state);
    }
  };

  const prevPage = () => {
    if (state.mode === "page") {
      state.currentPage--;
      Renderer.showPage(state);
    } else if (state.mode === "two") {
      state.twoPageIndex--;
      Renderer.showTwoPageSpread(state);
    }
  };

  // Event Listeners
  btnNext.addEventListener("click", nextPage);
  btnPrev.addEventListener("click", prevPage);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") nextPage();
    if (e.key === "ArrowLeft") prevPage();
  });
};