  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const cors = require('cors');
  const authRoutes = require('./routes/auth');
  const workspaceRoutes = require('./routes/workspaces');
  require('dotenv').config();

  const app = express();
  const server = http.createServer(app);

  // Configure CORS for both Express and Socket.io
  const io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware
  app.use(cors({
    origin: "*", // Allow all origins for development
    credentials: true
  }));
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/workspaces', workspaceRoutes);

  // Store whiteboard state
  let whiteboardState = {
    shapes: [],
    history: [[]],
    historyIndex: 0
  };

  // Store connected users and voice rooms
  const connectedUsers = new Map();
  const voiceRooms = new Map();

  // Utility function to generate random colors for users
  function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Helper function to get/set user info
  function getUserInfo(socket) {
    return {
      id: socket.id,
      username: socket.handshake.auth.username || 'Anonymous',
      cursor: { x: 0, y: 0 },
      color: getRandomColor(),
      isDrawing: false
    };
  }

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Store user info with username
    connectedUsers.set(socket.id, getUserInfo(socket));

    // Also store username on socket for chat
    socket.user = {
      username: socket.handshake.auth.username || 'Anonymous',
      id: socket.id
    };

    // Send current whiteboard state to newly connected user
    socket.emit('whiteboard-state', whiteboardState);

    // Send current users list
    socket.emit('users-update', Array.from(connectedUsers.values()));

    // Broadcast user joined to others
    socket.broadcast.emit('user-joined', connectedUsers.get(socket.id));

    // Handle shape drawing
    socket.on('shape-update', (data) => {
      // Update server state
      if (data.type === 'add') {
        whiteboardState.shapes.push(data.shape);
      } else if (data.type === 'update') {
        const index = whiteboardState.shapes.findIndex(s => s.id === data.shape.id);
        if (index !== -1) whiteboardState.shapes[index] = data.shape;
      } else if (data.type === 'delete') {
        whiteboardState.shapes = whiteboardState.shapes.filter(s => s.id !== data.shapeId);
      } else if (data.type === 'clear') {
        whiteboardState.shapes = [];
      } else if (data.type === 'replace-all') {
        whiteboardState.shapes = data.shapes;
      }

      // Broadcast to other clients
      socket.broadcast.emit('shape-update', data);
    });

    // Handle drawing state
    socket.on('drawing-state', (data) => {
      if (connectedUsers.has(socket.id)) {
        connectedUsers.get(socket.id).isDrawing = data.isDrawing;
        connectedUsers.get(socket.id).currentShape = data.currentShape;
      }
      socket.broadcast.emit('user-drawing', { userId: socket.id, ...data });
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (connectedUsers.has(socket.id)) {
        connectedUsers.get(socket.id).cursor = data;
      }
      socket.broadcast.emit('user-cursor', { userId: socket.id, cursor: data });
    });

    // Handle tool selection
    socket.on('tool-change', (data) => {
      if (connectedUsers.has(socket.id)) {
        connectedUsers.get(socket.id).tool = data.tool;
      }
      socket.broadcast.emit('user-tool-change', { userId: socket.id, tool: data.tool });
    });

    // Handle history operations
    socket.on('history-update', (data) => {
      whiteboardState.history = data.history;
      whiteboardState.historyIndex = data.historyIndex;
      socket.broadcast.emit('history-update', data);
    });

    // ---- START: Voice Chat Events ----
    socket.on('join-voice-room', (roomId) => {
      console.log(`User ${socket.id} joining voice room: ${roomId}`);

      socket.join(roomId);

      if (!voiceRooms.has(roomId)) {
        voiceRooms.set(roomId, new Set());
      }

      const roomUsers = voiceRooms.get(roomId);

      // Send existing users to the new user
      const existingUsers = Array.from(roomUsers).filter(id => id !== socket.id);
      socket.emit('existing-voice-users', existingUsers);

      // Add new user to room
      roomUsers.add(socket.id);

      // Notify other users about the new user
      socket.to(roomId).emit('user-joined-voice', socket.id);

      console.log(`User ${socket.id} joined voice room ${roomId}. Room now has ${roomUsers.size} users.`);
    });

    socket.on('leave-voice-room', (roomId) => {
      console.log(`User ${socket.id} leaving voice room: ${roomId}`);

      socket.leave(roomId);

      if (voiceRooms.has(roomId)) {
        const roomUsers = voiceRooms.get(roomId);
        roomUsers.delete(socket.id);

        // Remove room if empty
        if (roomUsers.size === 0) {
          voiceRooms.delete(roomId);
        }
      }

      socket.to(roomId).emit('user-left-voice', socket.id);
      console.log(`User ${socket.id} left voice room ${roomId}`);
    });

    socket.on('voice-offer', (data) => {
      console.log(`Voice offer from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('voice-offer', {
        offer: data.offer,
        caller: socket.id
      });
    });

    socket.on('voice-answer', (data) => {
      console.log(`Voice answer from ${socket.id} to ${data.target}`);
      socket.to(data.target).emit('voice-answer', {
        answer: data.answer,
        answerer: socket.id
      });
    });

    socket.on('voice-ice-candidate', (data) => {
      socket.to(data.target).emit('voice-ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });
    // ---- END: Voice Chat Events ----

    // ---- START: Chat Events ----
    socket.on('joinChat', (data) => {
      console.log(`User ${socket.id} joining chat room: ${data.roomId}`);
      socket.join(data.roomId);
      socket.to(data.roomId).emit('userJoined', {
        username: socket.user?.username || 'Anonymous',
        userId: socket.id
      });
    });

    socket.on('leaveChat', (data) => {
      console.log(`User ${socket.id} leaving chat room: ${data.roomId}`);
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('userLeft', {
        username: socket.user?.username || 'Anonymous',
        userId: socket.id
      });
    });

    socket.on('chatMessage', (data) => {
      console.log(`Chat message from ${socket.id} in room ${data.roomId}: ${data.message.substring(0, 50)}...`);

      // Broadcast to all users in the room (including sender for consistency)
      io.to(data.roomId).emit('chatMessage', {
        user: socket.user?.username || 'Anonymous',
        message: data.message,
        timestamp: data.timestamp,
        userId: socket.id
      });
    });

    socket.on('typingStart', (data) => {
      socket.to(data.roomId).emit('userTyping', {
        userId: socket.id,
        username: socket.user?.username || 'Anonymous',
        isTyping: true
      });
    });

    socket.on('typingStop', (data) => {
      socket.to(data.roomId).emit('userTyping', {
        userId: socket.id,
        username: socket.user?.username || 'Anonymous',
        isTyping: false
      });
    });
    // ---- END: Chat Events ----

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove user from all voice rooms
      voiceRooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          socket.to(roomId).emit('user-left-voice', socket.id);

          // Remove room if empty
          if (users.size === 0) {
            voiceRooms.delete(roomId);
          }
        }
      });

      // Broadcast user left for chat rooms
      socket.broadcast.emit('userLeft', {
        username: socket.user?.username || 'Anonymous',
        userId: socket.id
      });

      connectedUsers.delete(socket.id);
      socket.broadcast.emit('user-left', socket.id);
      socket.broadcast.emit('users-update', Array.from(connectedUsers.values()));
    });
  });

  // Basic health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      connectedUsers: connectedUsers.size,
      voiceRooms: Array.from(voiceRooms.entries()).map(([room, users]) => ({
        room,
        users: Array.from(users)
      }))
    });
  });

  // Chat rooms status endpoint
  app.get('/api/chat/rooms', (req, res) => {
    const chatRooms = {};

    // Get all rooms and their users
    io.sockets.adapter.rooms.forEach((sockets, roomId) => {
      if (roomId.startsWith('chat-') || roomId === 'main-workspace') {
        const users = Array.from(sockets).map(socketId => {
          const socket = io.sockets.sockets.get(socketId);
          return {
            id: socketId,
            username: socket?.user?.username || 'Anonymous'
          };
        });
        chatRooms[roomId] = users;
      }
    });

    res.json({
      chatRooms,
      totalConnectedUsers: connectedUsers.size
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Whiteboard API Server is running.',
      features: ['Whiteboard', 'Voice Chat', 'Text Chat', 'Real-time Collaboration'],
      endpoints: {
        health: '/health',
        chatRooms: '/api/chat/rooms',
        auth: '/api/auth',
        workspaces: '/api/workspaces'
      }
    });
  });

  const PORT = process.env.PORT || 3010;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 Features: Whiteboard, Voice Chat, Text Chat`);
    console.log(`🌐 CORS enabled for all origins`);
  });

  module.exports = { app, server, io };