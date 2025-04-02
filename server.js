const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5001", // Must match your client's URL
    methods: ["GET", "POST"],
  },
});

const port = 5001;
const MAX_PLAYERS_PER_ROOM = 7;
const ROOM_ID_LENGTH = 6;

// Track active rooms
const activeRooms = {};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);
  console.log(`Total connections: ${io.engine.clientsCount}`);

  // Handle room creation
  socket.on("create-room", (data) => {
    const { roomCode } = data;
    // Create the room with initial state
    activeRooms[roomCode] = {
      players: [
        {
          id: socket.id,
          name: `Player 1`,
          character: null,
          ready: false,
        },
      ],
      maxPlayers: MAX_PLAYERS_PER_ROOM,
      host: socket.id,
    };
    console.log(activeRooms[roomCode].players);
    socket.join(roomCode);

    // Send response to creator
    socket.emit("room-create-response", {
      success: true,
      roomCode: roomCode,
      host: socket.id,
      players: activeRooms[roomCode].players,
    });

    // Sync all clients
    io.to(roomCode).emit("player-list-update", activeRooms[roomCode].players);

    console.log(`[ROOM CREATED] Room: ${roomCode}, Creator: ${socket.id}`);
  });

  // Handle room joining
  socket.on("join-room", (data) => {
    const { roomCode } = data;
    const room = activeRooms[roomCode];

    // Validate room exists
    if (!room) {
      socket.emit("room-join-response", {
        success: false,
        error: "Room not found",
      });
      return;
    }

    // Validate room isn't full
    if (room.players.length >= room.maxPlayers) {
      socket.emit("room-join-response", {
        success: false,
        error: "Room is full",
      });
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: `Player ${room.players.length + 1}`,
      character: null,
      ready: false,
    };

    room.players.push(newPlayer);
    socket.join(roomCode);

    // Send response to joining player
    socket.emit("room-join-response", {
      success: true,
      roomCode: roomCode,
      host: room.host,
      players: room.players,
    });

    // Notify others about new player
    socket.to(roomCode).emit("player-joined", {
      player: newPlayer,
    });

    // Sync all clients
    io.to(roomCode).emit("player-list-update", room.players);

    console.log(`[PLAYER JOINED] ${socket.id} joined ${roomCode}`);
    console.log(activeRooms[roomCode].players);
  });

  // Handle character selection
  socket.on("select-character", (data) => {
    const { roomCode, characterId } = data;
    const room = activeRooms[roomCode];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    player.character = characterId;

    socket.to(roomCode).emit("character-selected", {
      playerId: socket.id,
      characterId: characterId,
    });
  });

  socket.on("request-player-list", (data) => {
    const { roomCode } = data;
    if (activeRooms[roomCode]) {
      socket.emit("player-list-update", activeRooms[roomCode].players);
    }
  });

  // Handle player ready status
  socket.on("player-ready", (data) => {
    const { roomCode, isReady } = data;
    const room = activeRooms[roomCode];
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    player.ready = isReady;

    socket.to(roomCode).emit("player-ready-status", {
      playerId: socket.id,
      isReady: isReady,
    });
    console.log(activeRooms[roomCode].players);

    // Check if all players are ready
    if (room.players.length > 1 && room.players.every((p) => p.ready)) {
      io.to(roomCode).emit("all-players-ready");
    }
  });

  socket.on("playerPosition", (data) => {
    const roomCode = data.roomCode;
    
    // Use data from the emitted event instead of undefined player object
    console.table({
      playerId: socket.id,
      playerName: data.playerName,
      x: data.x,
      y: data.y,
      animation: data.animation,
      spriteModel: data.spriteModel,
    });
    
    console.log(`[PLAYER POSITION] Room: ${roomCode}, (${socket.id})`);
  
    socket.to(roomCode).emit("playerPositionUpdate", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const roomCode in activeRooms) {
      const room = activeRooms[roomCode];
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // Reassign host if needed
        if (socket.id === room.host && room.players.length > 0) {
          room.host = room.players[0].id;
          io.to(roomCode).emit("new-host", { newHostId: room.host });
        }

        // Clean up empty rooms
        if (room.players.length === 0) {
          delete activeRooms[roomCode];
        } else {
          // Notify remaining players
          io.to(roomCode).emit("player-left", socket.id);
          io.to(roomCode).emit("player-list-update", room.players);
        }
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
