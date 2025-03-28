import TextInput from "../Buttons/InputTextBox.js"; // Adjust path as needed
import CharacterSelectScene from "./CharacterSelectScene.js";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.textInput = null;
    this.socket = null; // Initialize as null
    this.showJoinRoomInput = this.showJoinRoomInput.bind(this);
    this.showCreateRoomInput = this.showCreateRoomInput.bind(this);
    this.handleRoomResponse = this.handleRoomResponse.bind(this);
  }

  //load assets
  preload() {
    this.load.image(
      "BackGroundImageStart",
      "assets/images/backgroundStart.jpeg"
    );

    this.load.image("logo", "assets/images/logo.png");
  }

  //init variables, define animations & sounds, and display assets
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
    this.socket = io("http://localhost:5001");

    this.socket.emit('client-identified', 'menu-scene'); // Add this line
    this.textInput = new TextInput(this.socket); // Create instance

    this.setupSocketListeners();

    let JoinRoomButton = this.add
      .text(centerX, centerY + 50, "Join Room", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    JoinRoomButton.on("pointerover", () => {
      JoinRoomButton.setScale(1.1);
    });
    JoinRoomButton.on("pointerout", () => {
      JoinRoomButton.setScale(1);
    });
    JoinRoomButton.on("pointerdown", () => {
      console.log("Join Room button clicked!");
      this.showJoinRoomInput();
    });

    let CreateRoomButton = this.add
      .text(centerX, centerY + 200, "Create Room", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();
    CreateRoomButton.on("pointerover", () => {
      CreateRoomButton.setScale(1.1);
    });
    CreateRoomButton.on("pointerout", () => {
      CreateRoomButton.setScale(1);
    });
    CreateRoomButton.on("pointerdown", () => {
      console.log("Join Room button clicked!");
      this.showCreateRoomInput();
    });
  }

  setupSocketListeners() {
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

    // Override the default join method
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const roomCode = inputElement.value.trim();
        // Emit join room event through socket
        this.socket.emit("join-room", { roomCode });
        inputElement.remove();
      }
    });
  }

  showCreateRoomInput() {
    const inputElement = this.textInput.showCreateRoomInput();

    // Override the default create method
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const roomCode = inputElement.value.trim();
        // Emit create room event through socket
        this.socket.emit("create-room", { roomCode });
        inputElement.remove();
      }
    });
  }

  handleRoomResponse(response, isHost) {
    if (response.success) {
      // Transition to Character Select Scene
      this.scene.start("CharacterSelectScene", {
        roomCode: response.roomCode,
        socket: this.socket,
        isHost: isHost,
      });
    } else {
      // Show error message (you might want to create a more user-friendly error display)
      alert(response.message);
    }
  }

  update() {
    this.background.tilePositionX += 2;
  }
}
