(() => {
  "use strict";
  const game = window.DeltaMiner = window.DeltaMiner || {};

  class Game {
    constructor(canvas, ui) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.ui = ui;
      this.hook = new game.Hook();
      this.running = false;
      this.paused = false;
      this.finished = false;
      this.level = null;
      this.timeLeft = 0;
      this.lastTimestamp = 0;
      this.fps = 0;
      this.frame = this.frame.bind(this);
    }

    startLevel() {
      this.hideOverlay();
      this.timeLeft = 0;
      this.level = game.levelManager.createLevel();
      this.hook.reset();
      this.finished = false;
      this.paused = false;
      if (!this.level) { this.showComplete(); return; }
      this.timeLeft = this.level.config.duration;
      this.running = true;
      this.lastTimestamp = performance.now();
      this.syncUI();
      this.ui.pause.disabled = false;
      this.ui.start.disabled = true;
      requestAnimationFrame(this.frame);
    }

    restartLevel() { this.hideOverlay(); this.startLevel(); }
    fire() { if (this.running && !this.paused && !this.finished) this.hook.launch(); }
    togglePause() {
      if (!this.running || this.finished) return;
      this.paused = !this.paused;
      this.ui.pause.textContent = this.paused ? "继续" : "暂停";
      this.syncUI();
    }

    frame(timestamp) {
      if (!this.running) return;
      const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;
      if (!this.paused && !this.finished) this.update(deltaTime);
      this.render();
      if (this.running) requestAnimationFrame(this.frame);
    }

    update(deltaTime) {
      this.fps = deltaTime ? Math.round(1 / deltaTime) : 0;
      this.timeLeft = Math.max(0, this.timeLeft - deltaTime);
      const event = this.hook.update(deltaTime, this.level.items);
      if (event && event.type === "COLLECTED" && !this.finished) {
        this.level.score += event.item.value;
        GAME_PROGRESS.totalScore += event.item.value;
        this.level.items = this.level.items.filter((item) => item !== event.item);
      }
      if (this.timeLeft === 0) this.finishLevel();
      this.syncUI();
    }

    finishLevel() {
      if (this.finished) return;
      this.finished = true;
      this.running = false;
      this.ui.pause.disabled = true;
      const cumulativeScore = GAME_PROGRESS.totalScore;
      const targetScore = this.level.targetScore;
      const passed = game.levelManager.isLevelPassed(this.level);
      if (passed) {
        game.levelManager.advance();
        this.showResult(true, cumulativeScore, targetScore);
      } else {
        resetProgress();
        this.showResult(false, cumulativeScore, targetScore);
      }
    }

    syncUI() {
      const config = this.level ? this.level.config : game.levelManager.getCurrentConfig();
      this.ui.level.textContent = config ? config.level : "完成";
      this.ui.score.textContent = GAME_PROGRESS.totalScore;
      this.ui.target.textContent = this.level ? this.level.targetScore : "--";
      this.ui.time.textContent = this.level ? Math.ceil(this.timeLeft) : "--";
    }

    showResult(passed, cumulativeScore, targetScore) {
      const hasNextLevel = Boolean(game.levelManager.getCurrentConfig());
      const title = passed ? "挑战成功！" : "挑战失败";
      const action = passed && hasNextLevel ? "下一关" : passed ? "查看通关" : "重新挑战";
      this.ui.overlay.innerHTML = `<div class="dialog"><h1>${title}</h1><p>本关获得：${this.level.score} 金币</p><p>本关目标：${targetScore} 金币</p><p>累计金币：${cumulativeScore}</p><div class="dialog-actions"><button type="button" data-action="continue">${action}</button></div></div>`;
      this.ui.overlay.hidden = false;
    }

    showComplete() {
      this.running = false;
      this.ui.pause.disabled = true;
      this.ui.start.disabled = false;
      this.ui.overlay.innerHTML = '<div class="dialog"><h1>恭喜通关！</h1><p>累计金币：' + GAME_PROGRESS.totalScore + '</p><div class="dialog-actions"><button type="button" data-action="new-game">从第一关重新开始</button><button type="button" class="quiet-button" data-action="reset-all">重置全部游戏进度</button></div></div>';
      this.ui.overlay.hidden = false;
      this.syncUI();
    }

    hideOverlay() { this.ui.overlay.hidden = true; this.ui.overlay.innerHTML = ""; }
    newGame() { resetProgress(); this.hideOverlay(); this.startLevel(); }

    render() {
      const ctx = this.context;
      const { width, height } = GAME_CONFIG.canvas;
      ctx.clearRect(0, 0, width, height);
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#c7f0ff"); sky.addColorStop(.3, "#f4f5c8"); sky.addColorStop(.301, "#dfb77f"); sky.addColorStop(1, "#ae7659");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      this.drawGround(ctx);
      if (this.level) this.level.items.forEach((item) => this.drawItem(ctx, item));
      this.drawHook(ctx);
      this.drawPlayer(ctx);
      if (GAME_CONFIG.debug) this.drawDebug(ctx);
    }

    drawGround(ctx) {
      ctx.strokeStyle = "rgba(111,70,47,.25)"; ctx.lineWidth = 2;
      for (let y = 285; y < 720; y += 58) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(250, y - 28, 500, y + 28, 1280, y - 10); ctx.stroke(); }
    }

    drawPlayer(ctx) {
      const config = GAME_CONFIG.player, image = game.assets.get("player"), x = 640 - config.width / 2 + config.xOffset, y = GAME_CONFIG.canvas.playerY + config.yOffset;
      if (image) ctx.drawImage(image, x, y, config.width, config.height);
      else { ctx.fillStyle = "#7b8586"; ctx.fillRect(x + 45, y + 35, 70, 75); ctx.beginPath(); ctx.arc(x + 80, y + 25, 25, 0, Math.PI * 2); ctx.fill(); }
    }

    drawItem(ctx, item) {
      const image = game.assets.get(item.id);
      if (image) ctx.drawImage(image, item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
      else { const colors = ["#f5b642", "#72a7a5", "#e5724e", "#d9c15f", "#c05a7b"]; ctx.fillStyle = colors[GAME_CONFIG.items.findIndex((entry) => entry.id === item.id) % colors.length]; ctx.beginPath(); ctx.arc(item.x, item.y, item.hitRadius, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#fff9e9"; ctx.font = "bold 16px Georgia"; ctx.textAlign = "center"; ctx.fillText(item.value, item.x, item.y + 5); }
    }

    drawHook(ctx) {
      const end = this.hook.endpoint();
      ctx.strokeStyle = "#253d40"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(this.hook.anchor.x, this.hook.anchor.y); ctx.lineTo(end.x, end.y); ctx.stroke();
      ctx.fillStyle = "#d75a43"; ctx.beginPath(); ctx.arc(end.x, end.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f5eedc"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(end.x, end.y + 8, 12, 0, Math.PI * .8); ctx.stroke();
    }

    drawDebug(ctx) { ctx.fillStyle = "#13272d"; ctx.font = "16px monospace"; ctx.textAlign = "left"; ctx.fillText(`FPS: ${this.fps}  状态: ${this.hook.state}  角度: ${this.hook.angle.toFixed(1)}  长度: ${this.hook.length.toFixed(1)}`, 16, 30); ctx.fillText(`捕获: ${this.hook.currentCapturedItem?.id || "无"}  关卡: ${GAME_PROGRESS.currentLevel}`, 16, 52); }
  }
  game.Game = Game;
})();