(() => {
  "use strict";
  const STORAGE_KEY = "deltaMinerProgress";
  const initialProgress = () => ({ currentLevel: 1, totalScore: 0, highestLevel: 1, previousTargetScore: 0 });

  window.loadProgress = function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      window.GAME_PROGRESS = saved && Number.isInteger(saved.currentLevel) ? { ...initialProgress(), ...saved } : initialProgress();
    } catch (error) {
      console.warn("无法读取游戏存档，将使用新存档。", error);
      window.GAME_PROGRESS = initialProgress();
    }
    return window.GAME_PROGRESS;
  };

  window.saveProgress = function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.GAME_PROGRESS));
  };

  window.resetProgress = function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    window.GAME_PROGRESS = initialProgress();
    return window.GAME_PROGRESS;
  };
})();