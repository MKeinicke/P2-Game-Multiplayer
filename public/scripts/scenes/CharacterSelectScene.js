export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super("CharacterSelectScene");
  }

  init(data) {
    this.roomCode = data.roomCode;
    this.socket = data.socket;
    this.isHost = data.isHost;
    this.playerId = this.socket.id;
    this.selectedCharacter = null;
    this.players = data.players || []; // Initialize with players if provided
    console.log("CharacterSelectScene initialized with players:", this.players);
  }

  preload() {
    this.load.image(
      "character1",
      "assets/Characters/SelectImages/Character1.png"
    );
    this.load.image(
      "character2",
      "assets/Characters/SelectImages/Character2.png"
    );
    this.load.image(
      "BackGroundImageStart",
      "assets/images/backgroundStart.jpeg"
    );
  }

  create() {
    let centerX = this.cameras.main.centerX;
    let centerY = this.cameras.main.centerY;
    this.setupSocketListeners();
    this.socket.emit("request-player-list", { roomCode: this.roomCode });

    // Background
    this.background = this.add.tileSprite(
      centerX,
      centerY,
      1200,
      750,
      "BackGroundImageStart"
    );

    // Room Code Display
    this.roomCodeText = this.add
      .text(centerX, 50, `Room: ${this.roomCode}`, {
        font: "32px Arial",
        fill: "#ffffff",
        backgroundColor: "#222",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    // Character Selection Buttons
    this.character1 = this.add
      .image(centerX, centerY + 100, "character1")
      .setInteractive()
      .setScale(0.5);

    this.character2 = this.add
      .image(centerX, centerY - 100, "character2")
      .setInteractive()
      .setScale(0.5);
    this.character1.on("pointerover", () => this.character1.setScale(0.6));
    this.character2.on("pointerover", () => this.character2.setScale(0.6));

    this.character1.on("pointerout", () => this.character1.setScale(0.5));
    this.character2.on("pointerout", () => this.character2.setScale(0.5));

    this.character1.on("pointerdown", () => {
      console.log(`Character 1. selected`);
      this.selectCharacter("character1");
    });
    
    this.character2.on("pointerdown", () => {
      console.log(`Character 2. selected`);
      this.selectCharacter("character2");
    });


    // Ready Button
    this.readyButton = this.add
      .text(centerX, centerY + 250, "Ready", {
        font: "32px Arial",
        fill: "#ffffff",
        backgroundColor: "#222",
        padding: { x: 20, y: 10 },
        borderRadius: 5,
      })
      .setOrigin(0.5)
      .setInteractive();

    this.readyButton.on("pointerover", () => this.readyButton.setScale(1.1));
    this.readyButton.on("pointerout", () => this.readyButton.setScale(1));
    this.readyButton.on("pointerdown", () => this.toggleReady());

    // Player List Container
    this.playerListContainer = this.add
      .rectangle(50, 100, 300, 400, 0x222222, 0.7)
      .setOrigin(0, 0);

    this.playerListTitle = this.add.text(60, 110, "Players:", {
      font: "24px Arial",
      fill: "#ffffff",
    });

    this.playerListText = this.add
      .text(60, 150, "", {
        font: "20px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0, 0);
  }

  selectCharacter(characterId) {
    if (this.readyButton.getData("ready")) return;

    this.selectedCharacter = characterId;
    this.socket.emit("select-character", {
      roomCode: this.roomCode,
      characterId: characterId,
    });
  }

  toggleReady() {
    const isReady = !this.readyButton.getData("ready");
    this.readyButton.setData("ready", isReady);
    this.readyButton.setText(isReady ? "Ready!" : "Ready");
    this.readyButton.setBackgroundColor(isReady ? "#4CAF50" : "#222");

    this.socket.emit("player-ready", {
      roomCode: this.roomCode,
      isReady: isReady,
    });
  }

  setupSocketListeners() {
    this.socket.on("room-create-response", (data) => {
      this.players = data.players;
      this.updatePlayerList();
    });

    // Listen for new players joining
    this.socket.on("player-joined", (data) => {
      this.players.push(data.player);
      this.updatePlayerList();
    });

    // Listen for player list updates from server
    this.socket.on("player-list-update", (players) => {
      console.log("Player list update:", players);
      this.players = players;
      this.updatePlayerList();
    });

    // Listen for players leaving
    this.socket.on("player-left", (playerId) => {
      this.players = this.players.filter((p) => p.id !== playerId);
      this.updatePlayerList();
    });

    // Listen for character selections
    this.socket.on("character-selected", (data) => {
      const player = this.players.find((p) => p.id === data.playerId);
      if (player) {
        player.character = data.characterId;
        if (data.playerId === this.playerId) {
          this.selectedCharacter = data.characterId;
          this.resetCharacterSelection();
        }
        this.updatePlayerList();
      }
    });

    // Listen for ready status changes
    this.socket.on("player-ready-status", (data) => {
      const player = this.players.find((p) => p.id === data.playerId);
      if (player) {
        player.ready = data.isReady;
        this.updatePlayerList();
      }
    });

    this.socket.on("room-join-response", (data) => {
      this.players = data.players; // Update local list
      this.updatePlayerList(); // Refresh UI
    });

    // Listen for game start when all players are ready
    this.socket.on("all-players-ready", () => {
      // Find the current player in the players array
      const currentPlayer = this.players.find(p => p.id === this.playerId);
      
      this.scene.start("GameScene", {
        player: {
          name: currentPlayer.name // Use the name that was already set when the player joined
        },
        roomCode: this.roomCode,
        socket: this.socket,
        isHost: this.isHost,
        character: this.selectedCharacter,
      });
    });
  }

  updatePlayerList() {
    const playerTexts = this.players.map((player, index) => {
      let status = "";
      if (player.ready) status = " (Ready)";
      else if (player.character) status = ` (${player.character})`;

      // Shorten the player ID for display
      const shortId = player.name;

      return `${index + 1}. ${shortId}${status}`;
    });

    this.playerListText.setText(playerTexts.join("\n"));
  }

  update() {
    this.background.tilePositionX += 0.5;
  }

  destroy() {
    if (this.socket) {
      this.socket.off("player-list-update");
      this.socket.off("player-joined");
      this.socket.off("player-left");
      this.socket.off("character-selected");
      this.socket.off("player-ready-status");
      this.socket.off("all-players-ready");
    }
    super.destroy();
  }
}
