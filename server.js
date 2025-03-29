const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5001", // Adjust to your frontend's URL
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

  // Handle room creation request - simplified
  socket.on("create-room", (data) => {
    const { roomCode } = data;
    
    // Create the room with initial state
    activeRooms[roomCode] = {
      players: [
        {
          id: socket.id,
          character: null,
          ready: false,
        },
      ],
      maxPlayers: MAX_PLAYERS_PER_ROOM,
      host: socket.id,
    };

    // Join the room
    socket.join(roomCode);

    // Send successful response with room details
    socket.emit("room-create-response", {
      success: true,
      roomCode: roomCode,
      host: socket.id,
    });
    console.log(`[ROOM CONNECTED] User ${socket.id} connected to room ${roomCode} (as creator)`);
    console.log(`[ROOM CREATED] Room: ${roomCode}, Creator: ${socket.id}`);
  });

  // Handle room joining request - simplified
  socket.on("join-room", (data) => {
    const { roomCode } = data;

    // Add new player to the room
    const newPlayer = {
      id: socket.id,
      character: null,
      ready: false,
    };
    
    // Initialize the room if it doesn't exist
    if (!activeRooms[roomCode]) {
      activeRooms[roomCode] = {
        players: [],
        maxPlayers: MAX_PLAYERS_PER_ROOM,
        host: socket.id,
      };
    }
    
    activeRooms[roomCode].players.push(newPlayer);

    // Join the room
    socket.join(roomCode);

    // Send response with all player information
    socket.emit("room-join-response", {
      success: true,
      roomCode: roomCode,
      host: activeRooms[roomCode].host,
      players: activeRooms[roomCode].players,
    });

    // Notify other players in the room about the new player
    socket.to(roomCode).emit("player-joined", {
      player: newPlayer,
    });
    
    console.log(`[ROOM CONNECTED] User ${socket.id} connected to room ${roomCode}`);
    console.log(`[ROOM JOIN] Player ${socket.id} joined room: ${roomCode}`);
    console.log(activeRooms[roomCode]);
  });

  // Handle character selection
  socket.on("select-character", (data) => {
    const { roomCode, characterId } = data;

    // Find the room
    const room = activeRooms[roomCode];
    if (!room) return;

    // Find the player
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    // Update player's character
    player.character = characterId;

    // Broadcast character selection to other players in the room
    socket.to(roomCode).emit("character-selected", {
      playerId: socket.id,
      characterId: characterId,
    });
  });

  // Handle player ready status
  socket.on("player-ready", (data) => {
    const { roomCode, isReady } = data;

    // Find the room
    const room = activeRooms[roomCode];
    if (!room) return;

    // Find the player
    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    // Update player's ready status
    player.ready = isReady;

    // Broadcast ready status to other players in the room
    socket.to(roomCode).emit("player-ready-status", {
      playerId: socket.id,
      isReady: isReady,
    });

    // Check if all players are ready
    const allPlayersReady = room.players.every((p) => p.ready);
    if (allPlayersReady && room.players.length > 1) {
      // Broadcast that all players are ready, game can start
      io.to(roomCode).emit("all-players-ready");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Remove player from all rooms
    for (const roomCode in activeRooms) {
      const roomIndex = activeRooms[roomCode].players.findIndex(
        (p) => p.id === socket.id
      );

      if (roomIndex !== -1) {
        // Remove the player
        activeRooms[roomCode].players.splice(roomIndex, 1);

        // If the host disconnects, assign a new host
        if (
          socket.id === activeRooms[roomCode].host &&
          activeRooms[roomCode].players.length > 0
        ) {
          activeRooms[roomCode].host = activeRooms[roomCode].players[0].id;

          // Notify remaining players about new host
          io.to(roomCode).emit("new-host", {
            newHostId: activeRooms[roomCode].host,
          });
        }

        // If room is empty, remove it
        if (activeRooms[roomCode].players.length === 0) {
          delete activeRooms[roomCode];
        }
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});