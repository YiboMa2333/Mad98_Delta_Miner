(() => {
  "use strict";
  const game = window.DeltaMiner = window.DeltaMiner || {};

  function chooseItem(levelConfig) {
    const entries = GAME_CONFIG.items.map((item) => ({ item, weight: Math.max(0, Number(levelConfig.spawnWeights[item.id]) || 0) }));
    const totalWeight = entries.reduce((total, entry) => total + entry.weight, 0);
    if (!totalWeight) return GAME_CONFIG.items[Math.floor(Math.random() * GAME_CONFIG.items.length)];
    let cursor = Math.random() * totalWeight;
    for (const entry of entries) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry.item;
    }
    return entries[entries.length - 1].item;
  }

  // 依据配置权重生成藏品，尝试多次避免中心点严重重叠。
  function generateLevelItems(levelConfig) {
    const items = [];
    const { width, itemTop, itemBottom } = GAME_CONFIG.canvas;
    for (let index = 0; index < levelConfig.itemCount; index += 1) {
      const template = chooseItem(levelConfig);
      let x = width / 2;
      let y = itemTop;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        x = template.hitRadius + 25 + Math.random() * (width - (template.hitRadius + 25) * 2);
        y = itemTop + template.hitRadius + Math.random() * (itemBottom - itemTop - template.hitRadius * 2);
        const clear = items.every((other) => Math.hypot(x - other.x, y - other.y) > template.hitRadius + other.hitRadius + 28);
        if (clear) break;
      }
      items.push({ ...template, x, y, isCaptured: false });
    }
    return items;
  }

  // 每局目标为本次刷新藏品总积分的 60%。
  function getLevelTarget(items) {
    return Math.ceil(items.reduce((total, item) => total + item.value, 0) * 0.6);
  }

  game.levelManager = {
    getCurrentConfig() { return GAME_CONFIG.levels.find((level) => level.level === GAME_PROGRESS.currentLevel) || null; },
    generateLevelItems,
    createLevel() {
      const config = this.getCurrentConfig();
      if (!config) return null;
      const items = generateLevelItems(config);
      return { config, items, score: 0, targetScore: getLevelTarget(items) };
    },
    isLevelPassed(level) {
      return Boolean(level && level.score >= level.targetScore);
    },
    advance() {
      GAME_PROGRESS.currentLevel += 1;
      GAME_PROGRESS.highestLevel = Math.max(GAME_PROGRESS.highestLevel, GAME_PROGRESS.currentLevel);
      saveProgress();
    }
  };
})();