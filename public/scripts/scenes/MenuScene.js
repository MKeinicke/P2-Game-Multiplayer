import TextInput from "../Buttons/InputTextBox.js";
import CharacterSelectScene from "./CharacterSelectScene.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.textInput = null;
    this.socket = null;
    this.showJoinRoomInput = this.showJoinRoomInput.bind(this);
    this.showCreateRoomInput = this.showCreateRoomInput.bind(this);
    this.handleRoomResponse = this.handleRoomResponse.bind(this);
  }

  preload() {
    this.load.image(
      "BackGroundImageStart",
      "assets/images/backgroundStart.jpeg"
    );
    this.load.image("logo", "assets/images/logo.png");
  }

  create() {
    let centerX = this.cameras.main.centerX;
    let centerY = this.cameras.main.centerY;

    this.background = this.add.tileSprite(
      centerX,
      centerY,
      1200,
      750,
      "BackGroundImageStart"
    );

    const logo = this.add.image(centerX, centerY - 250, "logo");

    const buttonStyle = {
      font: "32px Arial",
      fill: "#ffffff",
      padding: { x: 20, y: 10 },
      borderRadius: 5,
      backgroundColor: "#222",
    };

    // Initialize socket only if it doesn't exist
    if (!this.socket) {
      this.socket = io("http://localhost:5001");
      this.socket.emit("client-identified", "menu-scene");
      this.setupSocketListeners();
    }

    this.textInput = new TextInput();

    let JoinRoomButton = this.add
      .text(centerX, centerY + 50, "Join Room", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    JoinRoomButton.on("pointerover", () => JoinRoomButton.setScale(1.1));
    JoinRoomButton.on("pointerout", () => JoinRoomButton.setScale(1));
    JoinRoomButton.on("pointerdown", () => this.showJoinRoomInput());

    let CreateRoomButton = this.add
      .text(centerX, centerY + 200, "Create Room", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();
    CreateRoomButton.on("pointerover", () => CreateRoomButton.setScale(1.1));
    CreateRoomButton.on("pointerout", () => CreateRoomButton.setScale(1));
    CreateRoomButton.on("pointerdown", () => this.showCreateRoomInput());
  }

  setupSocketListeners() {
    // Remove any existing listeners first
    this.socket.off("room-create-response");
    this.socket.off("room-join-response");

    // Handle room creation response
    this.socket.on("room-create-response", (response) => {
      this.handleRoomResponse(response, true);
    });

    // Handle room join response
    this.socket.on("room-join-response", (response) => {
      this.handleRoomResponse(response, false);
    });
  }

  showJoinRoomInput() {
    const inputElement = this.textInput.showJoinRoomInput();
    let isJoining = false;
    
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !isJoining) {
        const inputs = document.querySelectorAll('input[type="text"]');
        inputElement.remove();
        const roomCode = inputElement.value.trim();
        this.socket.emit("join-room", { roomCode });
        isJoining = true;
        inputs.forEach((input) => input.remove());
      }
    });
  }

  showCreateRoomInput() {
    const inputElement = this.textInput.showCreateRoomInput();
    let isCreating = false;

    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !isCreating) {
        const inputs = document.querySelectorAll('input[type="text"]');
        inputElement.remove();
        isCreating = true;
        const roomCode = inputElement.value.trim();
        this.socket.emit("create-room", { roomCode }, (response) => {
          isCreating = false;
          if (!response.success) {
            console.error("Creation failed:", response.message);
          }
          inputs.forEach((input) => input.remove());
        });
      }
    });
  }

  handleRoomResponse(response, isHost) {
    if (response.success) {
      this.scene.start("CharacterSelectScene", {
        roomCode: response.roomCode,
        socket: this.socket,
        isHost: isHost,
      });
    } else {
      alert(response.message);
    }
  }

  destroy() {
    // Clean up socket listeners
    if (this.socket) {
      this.socket.off("room-create-response");
      this.socket.off("room-join-response");
    }
    super.destroy();
  }

  update() {
    this.background.tilePositionX += 2;
  }
}
