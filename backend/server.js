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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add user to connected users
  connectedUsers.set(socket.id, {
    id: socket.id,
    cursor: { x: 0, y: 0 },
    color: getRandomColor(),
    isDrawing: false
  });

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

    connectedUsers.delete(socket.id);
    socket.broadcast.emit('user-left', socket.id);
    socket.broadcast.emit('users-update', Array.from(connectedUsers.values()));
  });
});

// Utility function to generate random colors for users
function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];
  return colors[Math.floor(Math.random() * colors.length)];
}

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Whiteboard API Server is running.'
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };