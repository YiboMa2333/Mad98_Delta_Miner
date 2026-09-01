(() => {
  "use strict";
  const images = new Map();

  function loadImage(key, source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => { images.set(key, image); resolve(); };
      image.onerror = () => { console.warn(`素材加载失败：${source}，将使用 Canvas 占位图。`); resolve(); };
      image.src = source;
    });
  }

  window.DeltaMiner = window.DeltaMiner || {};
  window.DeltaMiner.assets = {
    preload() {
      const tasks = [loadImage("player", GAME_CONFIG.player.image)];
      GAME_CONFIG.items.forEach((item) => tasks.push(loadImage(item.id, item.image)));
      return Promise.all(tasks);
    },
    get(key) { return images.get(key) || null; }
  };
})();