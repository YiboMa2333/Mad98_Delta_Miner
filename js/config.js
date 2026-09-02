(() => {
  "use strict";

  window.GAME_CONFIG = {
    version: 1,
    debug: false,
    // USER CONFIG: itemTop 越大，藏品生成位置越靠下
    canvas: { width: 1280, height: 720, playerY: 105, itemTop: 300, itemBottom: 665 },

    // =====================================================
    // USER CONFIG: 在这里修改主播图片路径与显示尺寸
    // =====================================================
    player: { image: "assets/player/Mad98.png", width: 160, height: 120, xOffset: 0, yOffset: 0 },

    // =====================================================
    // USER CONFIG: 在这里修改钩爪摆动角度、速度和初始摆动长度
    // =====================================================
    hook: { swingMinAngle: -70, swingMaxAngle: 70, swingSpeed: 45, extendSpeed: 550, retractSpeed: 650, minLength: 100, maxLength: 900, minRetractSpeed: 100 },

    // =====================================================
    // USER CONFIG: 在这里修改藏品图片路径、名称、价值、重量和尺寸
    // =====================================================
    items: [
      { id: "collection_01", name: "万金泪冠", image: "assets/items/万金泪冠.png", value: 500, weight: 5, width: 180, height: 180, hitRadius: 80 },
      { id: "collection_02", name: "天圆地方", image: "assets/items/天圆地方.png", value: 400, weight: 1.5, width: 110, height: 110, hitRadius: 40 },
      { id: "collection_03", name: "牛角饰品", image: "assets/items/牛角饰品.png", value: 20, weight: 2, width: 90, height: 90, hitRadius: 40 },
      { id: "collection_04", name: "电动车电池", image: "assets/items/电动车电池.png", value: 60, weight: 3, width: 100, height: 100, hitRadius: 45 },
      { id: "collection_05", name: "纵横", image: "assets/items/纵横.png", value: 500, weight: 5, width: 180, height: 180, hitRadius: 80 },
      { id: "collection_06", name: "苹果", image: "assets/items/苹果.png", value: 10, weight: 1, width: 85, height: 85, hitRadius: 30 }
    ],

    // =====================================================
    // USER CONFIG: 在这里修改每关时间、藏品数量和生成概率；首关目标为本局总价值的 70%，后续关卡叠加上一关目标
    // =====================================================
    levels: [
      { level: 1, duration: 60, itemCount: 10, spawnWeights: { collection_01: 35, collection_02: 30, collection_03: 20, collection_04: 10, collection_05: 5, collection_06: 5 } },
      { level: 2, duration: 60, itemCount: 12, spawnWeights: { collection_01: 30, collection_02: 30, collection_03: 22, collection_04: 12, collection_05: 6, collection_06: 6 } },
      { level: 3, duration: 55, itemCount: 14, spawnWeights: { collection_01: 25, collection_02: 30, collection_03: 25, collection_04: 13, collection_05: 7, collection_06: 7 } },
      { level: 4, duration: 50, itemCount: 16, spawnWeights: { collection_01: 20, collection_02: 28, collection_03: 28, collection_04: 16, collection_05: 8, collection_06: 8 } },
      { level: 5, duration: 45, itemCount: 18, spawnWeights: { collection_01: 15, collection_02: 25, collection_03: 30, collection_04: 20, collection_05: 10, collection_06: 10 } }
    ]
  };
})();