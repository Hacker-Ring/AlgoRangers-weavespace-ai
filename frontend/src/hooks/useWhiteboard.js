import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { nanoid } from 'nanoid';

// Connect to your backend server running on port 3010
const socket = io('http://localhost:3010', {
  auth: {
    // A simple username for demonstration. You can integrate this with your app's auth.
    username: `User_${nanoid(4)}`
  }
});

export const useWhiteboard = () => {
  const canvasRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState('pencil'); // pencil, rectangle, line, eraser
  const [color, setColor] = useState('#000000');
  const isDrawing = useRef(false);
  const currentShape = useRef(null);

  // --- Drawing Logic ---
  const getMousePos = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const pos = getMousePos(e);
    const id = nanoid();

    let newShape = { id, tool, color, points: [pos] };
    if (tool === 'rectangle' || tool === 'line') {
      newShape.start = pos;
      newShape.end = pos;
    }

    currentShape.current = newShape;
    // Add shape locally immediately for a smooth experience
    setShapes(prev => [...prev, newShape]);
  };

  const draw = (e) => {
    if (!isDrawing.current || !currentShape.current) return;
    const pos = getMousePos(e);

    // Update the shape locally as the user draws
    setShapes(prevShapes => prevShapes.map(shape => {
      if (shape.id === currentShape.current.id) {
        if (tool === 'pencil' || tool === 'eraser') {
          return { ...shape, points: [...shape.points, pos] };
        }
        if (tool === 'rectangle' || tool === 'line') {
          return { ...shape, end: pos };
        }
      }
      return shape;
    }));
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !currentShape.current) return;
    isDrawing.current = false;

    // Find the final version of the shape from the local state
    const finalShape = shapes.find(s => s.id === currentShape.current.id);

    // Send the completed shape to the server
    if (finalShape) {
      socket.emit('shape-update', { type: 'add', shape: finalShape });
    }
    currentShape.current = null;
  };

  // --- Canvas Rendering ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawAllShapes();
    };

    const redrawAllShapes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach(shape => {
        ctx.strokeStyle = shape.tool === 'eraser' ? '#f0f0f0' : shape.color; // Eraser uses background color
        ctx.lineWidth = shape.tool === 'eraser' ? 25 : 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if ((shape.tool === 'pencil' || shape.tool === 'eraser') && shape.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        } else if (shape.tool === 'rectangle' && shape.start) {
          ctx.strokeRect(shape.start.x, shape.start.y, shape.end.x - shape.start.x, shape.end.y - shape.start.y);
        } else if (shape.tool === 'line' && shape.start) {
          ctx.beginPath();
          ctx.moveTo(shape.start.x, shape.start.y);
          ctx.lineTo(shape.end.x, shape.end.y);
          ctx.stroke();
        }
      });
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial draw

    // Rerender shapes when they update
    redrawAllShapes();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [shapes]);

  // --- Socket.io Event Handling ---
  useEffect(() => {
    socket.on('whiteboard-state', (state) => setShapes(state.shapes || []));

    socket.on('shape-update', (data) => {
      if (data.type === 'add') {
        // To prevent duplicates, only add if the shape doesn't already exist
        setShapes(prev => prev.find(s => s.id === data.shape.id) ? prev : [...prev, data.shape]);
      } else if (data.type === 'clear') {
        setShapes([]);
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off('whiteboard-state');
      socket.off('shape-update');
    };
  }, []);

  const clearBoard = () => {
    setShapes([]);
    socket.emit('shape-update', { type: 'clear' });
  };

  return { canvasRef, tool, setTool, color, setColor, startDrawing, draw, stopDrawing, clearBoard };
};

