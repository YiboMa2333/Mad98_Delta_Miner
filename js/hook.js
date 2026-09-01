(() => {
  "use strict";
  const game = window.DeltaMiner = window.DeltaMiner || {};
  const HookState = Object.freeze({ SWINGING: "SWINGING", EXTENDING: "EXTENDING", RETRACTING: "RETRACTING", CARRYING: "CARRYING" });

  class Hook {
    constructor() {
      this.anchor = { x: GAME_CONFIG.canvas.width / 2, y: GAME_CONFIG.canvas.playerY + 55 };
      this.reset();
    }

    reset() {
      this.state = HookState.SWINGING;
      this.angle = GAME_CONFIG.hook.swingMinAngle;
      this.direction = 1;
      this.length = GAME_CONFIG.hook.minLength;
      this.currentCapturedItem = null;
    }

    launch() {
      if (this.state !== HookState.SWINGING) return false;
      this.state = HookState.EXTENDING;
      return true;
    }

    endpoint() {
      const radians = this.angle * Math.PI / 180;
      return { x: this.anchor.x + Math.sin(radians) * this.length, y: this.anchor.y + Math.cos(radians) * this.length };
    }

    update(deltaTime, items) {
      const config = GAME_CONFIG.hook;
      if (this.state === HookState.SWINGING) {
        this.angle += this.direction * config.swingSpeed * deltaTime;
        if (this.angle >= config.swingMaxAngle || this.angle <= config.swingMinAngle) {
          this.angle = Math.max(config.swingMinAngle, Math.min(config.swingMaxAngle, this.angle));
          this.direction *= -1;
        }
        return null;
      }

      if (this.state === HookState.EXTENDING) {
        this.length += config.extendSpeed * deltaTime;
        const point = this.endpoint();
        const hit = items.find((item) => !item.isCaptured && Math.hypot(point.x - item.x, point.y - item.y) < item.hitRadius);
        if (hit) {
          hit.isCaptured = true;
          this.currentCapturedItem = hit;
          this.state = HookState.CARRYING;
        } else if (this.length >= config.maxLength) {
          this.length = config.maxLength;
          this.state = HookState.RETRACTING;
        }
      } else {
        const speed = this.state === HookState.CARRYING
          ? Math.max(config.retractSpeed / this.currentCapturedItem.weight, config.minRetractSpeed)
          : config.retractSpeed;
        this.length -= speed * deltaTime;
        if (this.currentCapturedItem) Object.assign(this.currentCapturedItem, this.endpoint());
        if (this.length <= config.minLength) {
          this.length = config.minLength;
          const collected = this.currentCapturedItem;
          this.currentCapturedItem = null;
          this.state = HookState.SWINGING;
          return collected ? { type: "COLLECTED", item: collected } : null;
        }
      }
      return null;
    }
  }

  game.Hook = Hook;
  game.HookState = HookState;
})();