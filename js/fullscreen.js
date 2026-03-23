/**
 * Handles fullscreen toggling API.
 */
export const initFullscreen = () => {
  const btnFullscreen = document.getElementById("btnFullscreen");

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      document.body.classList.add("fullscreen");
    } else {
      document.exitFullscreen();
      document.body.classList.remove("fullscreen");
    }
  };

  btnFullscreen.addEventListener("click", toggleFullscreen);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") toggleFullscreen();
  });
};