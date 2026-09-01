(() => {
  "use strict";

  function renderItemScores(container) {
    const fragment = document.createDocumentFragment();
    GAME_CONFIG.items.forEach((item) => {
      const row = document.createElement("li");
      row.innerHTML = `<span>${item.name}</span><strong>${item.value} 金币</strong>`;
      fragment.appendChild(row);
    });
    container.replaceChildren(fragment);
  }

  window.addEventListener("DOMContentLoaded", async () => {
    loadProgress();
    const ui = {
      level: document.querySelector("#level-value"), score: document.querySelector("#score-value"), target: document.querySelector("#target-value"), time: document.querySelector("#time-value"),
      start: document.querySelector("#start-button"), pause: document.querySelector("#pause-button"), reset: document.querySelector("#reset-button"), overlay: document.querySelector("#overlay")
    };
    renderItemScores(document.querySelector("#item-score-list"));
    await DeltaMiner.assets.preload();
    const app = new DeltaMiner.Game(document.querySelector("#game-canvas"), ui);
    app.syncUI(); app.render();
    ui.start.addEventListener("click", () => app.startLevel());
    ui.pause.addEventListener("click", () => app.togglePause());
    ui.reset.addEventListener("click", () => { if (window.confirm("确定要清除全部游戏进度并从第一关开始吗？")) app.newGame(); });
    ui.overlay.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (action === "continue") DeltaMiner.levelManager.getCurrentConfig() ? app.startLevel() : app.showComplete();
      if (action === "new-game" || action === "reset-all") app.newGame();
    });
    const fire = (event) => { event.preventDefault(); app.fire(); };
    document.querySelector("#game-canvas").addEventListener("pointerdown", fire);
    window.addEventListener("keydown", (event) => { if (event.code === "Space" && !event.repeat) fire(event); });
    document.addEventListener("visibilitychange", () => { if (document.hidden && app.running && !app.finished) app.togglePause(); });
  });
})();