import { loadCBZFiles } from './fileLoader.js';
import { buildTwoPageLayout } from './utils.js';
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
  twoPageShift: false,
  readingDirection: "LTR"
};

// Keyboard bindings (default)
const keyBindings = {
  prev: ["ArrowLeft", "a"],
  next: ["ArrowRight", "d"]
};

// DOM Elements
const fileInput = document.getElementById("fileInput");
const loading = document.getElementById("loading");
const dirBtn = document.getElementById("btnDirection");
const shiftBtn = document.getElementById("btnShiftPages");
const modeBtns = document.querySelectorAll(".btn-mode");
const btnResetZoom = document.getElementById("btnResetZoom");



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

    try {
      await loadCBZFiles(files, state, setLoader);
      Renderer.setMode(state);
      setLoader("", 0);
    } catch (err) {
      console.error(err);
    } finally {
      // ✅ Essential: Reset the input so the SAME file can be reloaded 
      // or the next file can trigger the 'change' event.
      event.target.value = ''; 
    }
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

    if (state.mode === "two") {
      Renderer.showTwoPageSpread(state);
    }
  });

  // 4. Two-page shift alignment
  shiftBtn?.addEventListener("click", () => {
    state.twoPageShift = !state.twoPageShift;
    shiftBtn.setAttribute("aria-pressed", state.twoPageShift ? "true" : "false");
    shiftBtn.textContent = state.twoPageShift ? "Shift On" : "Shift Off";

    state.twoPageLayout = buildTwoPageLayout(state.spreadMap, state.twoPageShift);
    if (state.mode === "two") {
      Renderer.setMode(state);
    }
  });

  // Reset zoom button (default fit)
  btnResetZoom.addEventListener("click", () => {
    const zoomSlider = document.getElementById("zoomSlider");
    if (!zoomSlider) return;

    zoomSlider.value = 100;
    zoomSlider.dispatchEvent(new Event("input", { bubbles: true }));
  });
  // 4. Initialize Sub-modules
  initNavigation(state, Renderer, keyBindings);
  initZoom(state);
  initFullscreen();
};

// Bootstrap App
document.addEventListener("DOMContentLoaded", initApp);