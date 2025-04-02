import character1 from "/scripts/PlayerCharacters/Character1.js";
import character2 from "/scripts/PlayerCharacters/Character2.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.playerName = data.player.name;
    this.roomCode = data.roomCode;
    this.socket = data.socket;
    this.isHost = data.isHost;
    this.character = data.character; // The selected character from CharacterSelectScene
  }

  preload() {
    this.load.image("open_tileset", "assets/map/open_tileset.png");
    this.load.tilemapTiledJSON("trialMap", "assets/map/city.json");
    this.load.spritesheet("TestPlayer", "assets/Characters/TestPlayer.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("PlayerM", "assets/Characters/PlayerM.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    // Create map layers (unchanged from your original code)
    const map = this.make.tilemap({ key: "trialMap" });
    const tileset = map.addTilesetImage("open_tileset", "open_tileset");
    const groundLayer = map.createLayer("ground", tileset, 0, 0);
    const treea01Layer = map.createLayer("trees 01", tileset, 0, 0);
    const streetsLayer = map.createLayer("streets", tileset, 0, 0);
    const sidewalksLayer = map.createLayer("sidewalks", tileset, 0, 0);
    const buildingLayer = map.createLayer("building", tileset, 0, 0);
    const walkthrough = map.createLayer("walk through", tileset, 0, 0);
    const boxLayer = map.createLayer("boxes", tileset, 0, 0);
    const fencesLayer = map.createLayer("fences", tileset, 0, 0);
    this.walkthrough = walkthrough;

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    fencesLayer.setCollisionByExclusion([-1]);
    buildingLayer.setCollisionByExclusion([-1]);
    boxLayer.setCollisionByExclusion([-1]);
    treea01Layer.setCollisionByExclusion([-1]);

    // Create local player based on selected character
    this.createLocalPlayer();
    this.socket.emit("playerPosition", {
      roomCode: this.roomCode,
      playerId: this.socket.id,
      playerName: this.player.name,
      x: this.player.x,
      y: this.player.y,
      animation: this.player.anims.currentAnim?.key || "idle",
      spriteModel: this.character,
    });
    // Set initial position
    this.previousX = this.player.x;
    this.previousY = this.player.y;

    this.physics.add.collider(this.player, fencesLayer);
    this.physics.add.collider(this.player, buildingLayer);
    this.physics.add.collider(this.player, boxLayer);
    this.physics.add.collider(this.player, treea01Layer);

    // Controls
    this.cursors = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
  }

  createLocalPlayer() {
    const startX = 400;
    const startY = 250;
    let texture;
    switch (this.character) {
      case "character1":
        texture = "PlayerM";
        break;
      case "character2":
        texture = "TestPlayer";
        break;
      default:
        texture = "TestPlayer";
        break;
    }

    if (this.character === "character1") {
      this.player = new character1(this, startX, startY, texture, this.socket);
    } else {
      this.player = new character2(this, startX, startY, texture, this.socket);
    }
    this.player.isLocalPlayer = true;
    this.player.name = this.playerName
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setZoom(3);
  }

  update() {
    if (this.player) {
      this.player.update(this.cursors);

      const playerTile = this.walkthrough.worldToTileXY(
        this.player.x,
        this.player.y
      );
      const tile = this.walkthrough.getTileAt(playerTile.x, playerTile.y);

      if (tile) {
        this.walkthrough.setAlpha(0.5);
      } else {
        this.walkthrough.setAlpha(1);
      }
      if (
        this.player.x !== this.previousX ||
        this.player.y !== this.previousY
      ) {
        this.socket.emit("playerPosition", {
          roomCode: this.roomCode,
          playerId: this.socket.id,
          playerName: this.playerName,
          x: this.player.x,
          y: this.player.y,
          animation: this.player.anims.currentAnim?.key || "idle",
          spriteModel: this.character,
        });

        // Update the previous position
        this.previousX = this.player.x;
        this.previousY = this.player.y;
      }
    }
  }
}
