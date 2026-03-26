/**
 * Handles fullscreen toggling API and emergent UI controls while fullscreen.
 */
export const initFullscreen = () => {
  const btnFullscreen = document.getElementById("btnFullscreen");
  const controls = document.getElementById("controls");

  const setFullscreenControlVisibility = (show) => {
    if (show) {
      document.body.classList.add("show-controls");
    } else {
      document.body.classList.remove("show-controls");
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn(`Error attempting to enable fullscreen: ${err.message}`);
    });
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(err => {
        console.warn(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  btnFullscreen.addEventListener("click", toggleFullscreen);

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      document.body.classList.add("fullscreen");
      setFullscreenControlVisibility(false);
    } else {
      document.body.classList.remove("fullscreen");
      setFullscreenControlVisibility(true);
    }
  });

  document.addEventListener("click", (e) => {
    if (!document.fullscreenElement) return;

    if (e.target.closest("#controls") === null) {
      // Click anywhere in fullscreen toggles controls on/off
      setFullscreenControlVisibility(!document.body.classList.contains("show-controls"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFullscreen();
    }

    if (e.key === "Escape" && document.fullscreenElement) {
      e.preventDefault();
      exitFullscreen();
    }
  });
};