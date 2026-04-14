/**
 * Handles all navigation logic (buttons and keyboard).
 * @param {Object} state - Application state
 * @param {Object} Renderer - The renderer instance
 */
export const initNavigation = (state, Renderer, keyBindings) => {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const nextPage = () => {
    if (state.mode === "page") {
      state.currentPage = Math.min(state.imageUrls.length - 1, state.currentPage + 1);
      Renderer.showPage(state);
    } else if (state.mode === "two") {
      state.twoPageIndex = Math.min(state.twoPageLayout.length - 1, state.twoPageIndex + 1);
      Renderer.showTwoPageSpread(state);
    }
  };

  const prevPage = () => {
    if (state.mode === "page") {
      state.currentPage = Math.max(0, state.currentPage - 1);
      Renderer.showPage(state);
    } else if (state.mode === "two") {
      state.twoPageIndex = Math.max(0, state.twoPageIndex - 1);
      Renderer.showTwoPageSpread(state);
    }
  };

  // Event Listeners
  btnNext.addEventListener("click", nextPage);
  btnPrev.addEventListener("click", prevPage);

  const normalizeKey = (key) => (key.length === 1 ? key.toLowerCase() : key);

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

    const pressed = normalizeKey(e.key);
    const prevKeys = keyBindings.prev.map(normalizeKey);
    const nextKeys = keyBindings.next.map(normalizeKey);

    if (prevKeys.includes(pressed)) {
      e.preventDefault();
      prevPage();
    }
    if (nextKeys.includes(pressed)) {
      e.preventDefault();
      nextPage();
    }
  });
};