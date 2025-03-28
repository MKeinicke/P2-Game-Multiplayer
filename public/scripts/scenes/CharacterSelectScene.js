export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
      super("CharacterSelectScene");
      
      // Bind methods to ensure correct context
      this.initializeSocketListeners = this.initializeSocketListeners.bind(this);
      this.createCharacterSelectionUI = this.createCharacterSelectionUI.bind(this);
      this.updatePlayerList = this.updatePlayerList.bind(this);
    }
  
    init(data) {
      // Receive room code and socket from previous scene
      this.roomCode = data.roomCode;
      this.socket = data.socket;
      this.isHost = data.isHost;
    }
  
    preload() {
      // Preload character selection assets
      this.load.spritesheet("character1", "assets/Characters/TestPlayer.png", {
        frameWidth: 64,
        frameHeight: 64,
      });
      this.load.spritesheet("character2", "assets/Characters/PlayerM.png", {
        frameWidth: 64,
        frameHeight: 64,
      });
      // Add more character images as needed
    }
  
    create() {
      let centerX = this.cameras.main.centerX;
      let centerY = this.cameras.main.centerY;
  
      // Background
      this.background = this.add.tileSprite(
        centerX,
        centerY,
        1200,
        750,
        "BackGroundImageStart"
      );
      // Room Code Display
      this.add.text(centerX, 50, `Room: ${this.roomCode}`, {
        font: '24px Arial',
        fill: '#ffffff'
      }).setOrigin(0.5);
  
      // Create character selection UI
      this.createCharacterSelectionUI();
  
      // Initialize socket listeners
      this.initializeSocketListeners();
    }
  
    createCharacterSelectionUI() {
      const centerX = this.cameras.main.centerX;
      const centerY = this.cameras.main.centerY;
  
      // Character Selection
      const characters = [
        { id: 'character1', x: centerX - 200, y: centerY },
        { id: 'character2', x: centerX, y: centerY },
      ];
  
      this.characterSprites = characters.map(char => {
        const sprite = this.add.image(char.x, char.y, char.id)
          .setInteractive()
          .setScale(0.5);
        
        sprite.on('pointerdown', () => {
          // Emit character selection to server
          this.socket.emit('select-character', {
            roomCode: this.roomCode,
            characterId: char.id
          });
        });
  
        return sprite;
      });
  
      // Ready Button
      this.readyButton = this.add.text(centerX, centerY + 250, 'Ready', {
        font: '32px Arial',
        fill: '#ffffff',
        backgroundColor: '#222',
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive();
  
      this.readyButton.on('pointerdown', () => {
        // Toggle ready status
        const isReady = !this.readyButton.getData('ready');
        
        this.readyButton.setData('ready', isReady);
        this.readyButton.setText(isReady ? 'Ready!' : 'Ready');
        this.readyButton.setBackgroundColor(isReady ? '#4CAF50' : '#222');
  
        // Emit ready status to server
        this.socket.emit('player-ready', {
          roomCode: this.roomCode,
          isReady: isReady
        });
      });
  
      // Player List
      this.playerListText = this.add.text(50, 100, 'Players:', {
        font: '40px Arial',
        fill: '#ffffff'
      });
    }
  
    initializeSocketListeners() {
      // Listen for character selections from other players
      this.socket.on('character-selected', (data) => {
        console.log('Character selected by another player:', data);
        // You could highlight the selected character or show it's taken
      });
  
      // Listen for player ready status
      this.socket.on('player-ready-status', (data) => {
        console.log('Player ready status:', data);
        // You could update UI to show player's ready status
      });
  
      // Listen for all players being ready
      this.socket.on('all-players-ready', () => {
        console.log('All players are ready! Starting game...');
        // Transition to game scene
        // this.scene.start('GameScene');
      });
    }
  
    updatePlayerList(players) {
      // Update the player list display
      const playerNames = players.map((player, index) => 
        `Player ${index + 1}: ${player.character ? player.character : 'Selecting...'}`
      ).join('\n');
      this.BackGroundImageStart.tilePositionX += 2;

      this.playerListText.setText('Players:\n' + playerNames);
    }
  }