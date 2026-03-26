import { emptyNode } from './utils.js';

export const Renderer = {
  viewer: document.getElementById("viewer"),
  pageCounter: document.getElementById("pageCounter"),
  zoomSlider: document.getElementById("zoomSlider"),

  /**
   * Main router for rendering modes.
   */
  setMode(state) {
    emptyNode(this.viewer);
    this.viewer.scrollTop = 0;

    if (state.mode === "page") this.renderPageMode(state);
    else if (state.mode === "two") this.renderTwoPageMode(state);
    else this.renderScrollMode(state);
  },

  /* ================= PAGE MODE ================= */
  renderPageMode(state) {
    const img = document.createElement("img");
    img.id = "singlePage";
    img.style.maxHeight = this.zoomSlider.value + "vh";
    this.viewer.appendChild(img);
    this.showPage(state);
  },

  showPage(state) {
    if (state.currentPage < 0 || state.currentPage >= state.imageUrls.length) return;
    
    const img = document.getElementById("singlePage");
    if (!img) return;

    img.classList.remove("loaded");
    img.src = state.imageUrls[state.currentPage];
    img.onload = () => img.classList.add("loaded");
    
    this.updateCounter(state.currentPage + 1, state.imageUrls.length);
  },

  /* ================= 2 PAGE MODE ================= */
  renderTwoPageMode(state) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const img1 = document.createElement("img");
    const img2 = document.createElement("img");

    img1.id = "img1";
    img2.id = "img2";
    img1.style.maxHeight = this.zoomSlider.value + "vh";
    img2.style.maxHeight = this.zoomSlider.value + "vh";

    container.appendChild(img1);
    container.appendChild(img2);
    this.viewer.appendChild(container);

    // Sync state index
    state.twoPageIndex = state.twoPageLayout.findIndex(pair => pair.includes(state.currentPage));
    if (state.twoPageIndex === -1) state.twoPageIndex = 0;

    this.showTwoPageSpread(state);
  },

  showTwoPageSpread(state) {
    if (state.twoPageIndex < 0 || state.twoPageIndex >= state.twoPageLayout.length) return;

    const pair = state.twoPageLayout[state.twoPageIndex];
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");

    if (!img1 || !img2) return;

    img1.classList.remove("loaded");
    img2.classList.remove("loaded");

    const first = pair[0];
    const second = pair[1];

    const loadImg = (imgEl, srcIndex) => {
      imgEl.style.display = "block";
      imgEl.src = state.imageUrls[srcIndex];
      imgEl.onload = () => imgEl.classList.add("loaded");
    };

    if (state.readingDirection === "LTR") {
      loadImg(img1, first);
      if (second !== undefined) loadImg(img2, second);
      else img2.style.display = "none";
    } else {
      if (second !== undefined) {
        loadImg(img1, second);
        loadImg(img2, first);
      } else {
        loadImg(img1, first);
        img2.style.display = "none";
      }
    }

    state.currentPage = pair[0];
    const counterText = pair.length === 2 
      ? `${pair[0] + 1}-${pair[1] + 1}` 
      : `${pair[0] + 1}`;
    
    this.updateCounter(counterText, state.imageUrls.length);
  },

  /* ================= SCROLL MODE ================= */
  renderScrollMode(state) {
    // Document Fragment used to batch DOM insertions
    const fragment = document.createDocumentFragment();
    
    const zoomValue = this.zoomSlider ? this.zoomSlider.value + "vh" : "100vh";

    state.imageUrls.forEach((url) => {
      const img = document.createElement("img");
      img.style.maxWidth = "100%";
      img.style.maxHeight = zoomValue;
      img.style.marginBottom = "10px";
      img.src = url;
      img.loading = "lazy"; // Native lazy loading for massive performance gain
      img.onload = () => img.classList.add("loaded");
      fragment.appendChild(img);
    });

    this.viewer.appendChild(fragment);
    this.viewer.scrollTop = 0;
    state.currentPage = 0;
    this.pageCounter.textContent = `Scroll Mode`;
  },

  /* ================= HELPERS ================= */
  updateCounter(currentText, total) {
    this.pageCounter.textContent = `Page ${currentText} / ${total}`;
  }
};