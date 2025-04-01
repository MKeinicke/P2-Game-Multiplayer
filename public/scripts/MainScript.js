import CharacterSelectScene from "/scripts/scenes/CharacterSelectScene.js";
import MenuScene from "/scripts/scenes/MenuScene.js";
import GameScene from "/scripts/scenes/GameScene.js";

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#FFFF",

  scale: {
    parent: "gameContainer",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 750,
  },

  scene: [MenuScene, CharacterSelectScene, GameScene],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
