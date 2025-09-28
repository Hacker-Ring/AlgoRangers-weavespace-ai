import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:3010";

export const useSocket = (setShapes, setHistory, setHistoryIndex) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userCursors, setUserCursors] = useState({});
  const [userDrawings, setUserDrawings] = useState({});

  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection Events
    socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
    });

    // User Events
    socket.on('users-update', (users) => {
      console.log('👥 Users update:', users);
      setConnectedUsers(users);
    });

    socket.on('user-joined', (user) => {
      console.log('👋 User joined:', user);
      setConnectedUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    });

    socket.on('user-left', (userId) => {
      console.log('👋 User left:', userId);
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
      setUserCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
      setUserDrawings(prev => {
        const newDrawings = { ...prev };
        delete newDrawings[userId];
        return newDrawings;
      });
    });

    // Whiteboard State Events
    socket.on('whiteboard-state', (state) => {
      console.log('📋 Received whiteboard state');
      setShapes(state.shapes || []);
      setHistory(state.history || [[]]);
      setHistoryIndex(state.historyIndex || 0);
    });

    socket.on('shape-update', (data) => {
      console.log('🔄 Shape update:', data.type);
      if (data.type === 'add') setShapes(prev => [...prev, data.shape]);
      else if (data.type === 'update') setShapes(prev => prev.map(s => s.id === data.shape.id ? data.shape : s));
      else if (data.type === 'delete') setShapes(prev => prev.filter(s => s.id !== data.shapeId));
      else if (data.type === 'clear') setShapes([]);
      else if (data.type === 'replace-all') setShapes(data.shapes);
    });

    // Real-time Drawing/Cursor Events - FIXED
    socket.on('user-cursor', ({ userId, cursor }) => {
  console.log('🎯 Received cursor from server:', userId, cursor);

  // Validate cursor data and ensure it uses relative coordinates
  if (cursor && typeof cursor.x === 'number' && typeof cursor.y === 'number') {
    setUserCursors(prev => ({
      ...prev,
      [userId]: {
        x: Math.max(0, Math.min(1, cursor.x)), // Clamp to 0-1 range
        y: Math.max(0, Math.min(1, cursor.y))  // Clamp to 0-1 range
      }
    }));
  }
});

    socket.on('user-drawing', ({ userId, isDrawing, currentShape }) => {
      console.log('🎨 User drawing update:', userId, isDrawing);
      setUserDrawings(prev => ({
        ...prev,
        [userId]: { isDrawing, currentShape }
      }));
    });

    // History Events
    socket.on('history-update', (data) => {
      console.log('📜 History update');
      setHistory(data.history || []);
      setHistoryIndex(data.historyIndex || 0);
    });

    // Cleanup on component unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [setShapes, setHistory, setHistoryIndex]);

  // Functions to emit events to the server - FIXED CURSOR FORMAT
  const sendCursorMovement = (cursorData) => {
    // Ensure cursor data has the correct format (relative coordinates 0-1)
    const normalizedCursor = {
      x: cursorData.x || 0,
      y: cursorData.y || 0
    };

    console.log('🖱️ Sending cursor movement:', normalizedCursor);
    socketRef.current?.emit('cursor-move', normalizedCursor);
  };

  const sendShapeUpdate = (type, payload) => {
    console.log('🔄 Sending shape update:', type, payload);
    socketRef.current?.emit('shape-update', { type, ...payload });
  };

  const sendDrawingState = (drawingState) => {
    console.log('🎨 Sending drawing state:', drawingState);
    socketRef.current?.emit('drawing-state', drawingState);
  };

  const sendHistoryUpdate = (historyData) => {
    console.log('📜 Sending history update:', historyData);
    socketRef.current?.emit('history-update', historyData);
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectedUsers,
    userCursors,
    userDrawings,
    sendCursorMovement,
    sendShapeUpdate,
    sendDrawingState,
    sendHistoryUpdate,
  };
};