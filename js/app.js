import { loadCBZFiles } from './fileLoader.js';
import { Renderer } from './renderer.js';
import { initNavigation } from './navigation.js';
import { initZoom } from './zoom.js';
import { initFullscreen } from './fullscreen.js';

// Application State (Replaces global variables)
const state = {
  imageBlobs: [],
  imageUrls: [],
  spreadMap: [],
  twoPageLayout: [],
  mode: "page",
  currentPage: 0,
  twoPageIndex: 0,
  readingDirection: "LTR"
};

// DOM Elements
const fileInput = document.getElementById("fileInput");
const loading = document.getElementById("loading");
const dirBtn = document.getElementById("btnDirection");
const modeBtns = document.querySelectorAll(".btn-mode");

/**
 * Updates loading UI
 */
const setLoader = (text, opacity) => {
  loading.textContent = text;
  loading.style.opacity = opacity;
};

/**
 * Initializes the application
 */
const initApp = () => {
  // 1. File Upload Handling
  fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    await loadCBZFiles(files, state, setLoader);
    
    // Initial Render
    Renderer.setMode(state);
    setLoader("", 0);
  });

  // 2. Mode Switching
  modeBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Update UI
      modeBtns.forEach(b => b.setAttribute("aria-pressed", "false"));
      e.target.setAttribute("aria-pressed", "true");

      // Update State & Render
      state.mode = e.target.dataset.mode;
      Renderer.setMode(state);
    });
  });

  // 3. Reading Direction Toggle
  dirBtn.addEventListener("click", () => {
    state.readingDirection = state.readingDirection === "LTR" ? "RTL" : "LTR";
    dirBtn.textContent = state.readingDirection;

    // Only re-render if in two-page mode
    if (state.mode === "two") {
      Renderer.showTwoPageSpread(state);
    }
  });

  // 4. Initialize Sub-modules
  initNavigation(state, Renderer);
  initZoom(state);
  initFullscreen();
};

// Bootstrap App
document.addEventListener("DOMContentLoaded", initApp);