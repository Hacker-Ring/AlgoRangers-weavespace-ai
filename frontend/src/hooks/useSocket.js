// src/hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

export const useSocket = (shapes, setShapes, history, historyIndex, canvasSize) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userCursors, setUserCursors] = useState({});
  const [userDrawings, setUserDrawings] = useState({});

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Receive initial whiteboard state
    socket.on('whiteboard-state', (state) => {
      setShapes(state.shapes);
    });

    // Handle shape updates from other users
    socket.on('shape-update', (data) => {
      if (data.type === 'add') {
        setShapes(prev => [...prev, data.shape]);
      } else if (data.type === 'update') {
        setShapes(prev => prev.map(s => s.id === data.shape.id ? data.shape : s));
      } else if (data.type === 'delete') {
        setShapes(prev => prev.filter(s => s.id !== data.shapeId));
      } else if (data.type === 'clear') {
        setShapes([]);
      } else if (data.type === 'replace-all') {
        setShapes(data.shapes);
      }
    });

    // Handle user drawing states
    socket.on('user-drawing', (data) => {
      setUserDrawings(prev => ({
        ...prev,
        [data.userId]: data.currentShape
      }));
    });

    // Handle user cursors
    socket.on('user-cursor', (data) => {
      setUserCursors(prev => ({
        ...prev,
        [data.userId]: data.cursor
      }));
    });

    // Handle user connections
    socket.on('users-update', (users) => {
      setConnectedUsers(users);
    });

    socket.on('user-joined', (user) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    socket.on('user-left', (userId) => {
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

    return () => {
      socket.disconnect();
    };
  }, [setShapes]);

  const sendCursorMovement = useCallback((pos) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('cursor-move', {
        x: pos.x / canvasSize.width,
        y: pos.y / canvasSize.height
      });
    }
  }, [isConnected, canvasSize]);

  const sendShapeUpdate = useCallback((type, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('shape-update', { type, ...data });
    }
  }, [isConnected]);

  const sendDrawingState = useCallback((isDrawing, currentShape) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('drawing-state', { isDrawing, currentShape });
    }
  }, [isConnected]);

  return {
    isConnected,
    connectedUsers,
    userCursors,
    userDrawings,
    sendCursorMovement,
    sendShapeUpdate,
    sendDrawingState
  };
};