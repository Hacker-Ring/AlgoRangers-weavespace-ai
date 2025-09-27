// src/hooks/useCanvasRendering.js
import { useEffect } from 'react';
import { getShapeBounds } from '../utils/geometryUtils';

export const useCanvasRendering = ({
  canvasRef,
  canvasSize,
  shapes,
  currentShape,
  selectedShapeId,
  tool,
  userDrawings,
  userCursors,
  connectedUsers
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw all shapes (local and from other users)
    [...shapes, currentShape, ...Object.values(userDrawings)].filter(Boolean).forEach(shape => {
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      switch (shape.type) {
        case 'pencil':
          if (shape.points && shape.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x * w, shape.points[0].y * h);
            shape.points.forEach(p => ctx.lineTo(p.x * w, p.y * h));
            ctx.stroke();
          }
          break;
        case 'rectangle':
          ctx.beginPath();
          ctx.rect(shape.startX * w, shape.startY * h, (shape.endX - shape.startX) * w, (shape.endY - shape.startY) * h);
          ctx.stroke();
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow((shape.endX - shape.startX) * w, 2) + Math.pow((shape.endY - shape.startY) * h, 2));
          ctx.beginPath();
          ctx.arc(shape.startX * w, shape.startY * h, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(shape.startX * w, shape.startY * h);
          ctx.lineTo(shape.endX * w, shape.endY * h);
          ctx.stroke();
          break;
        case 'text':
          ctx.font = `${shape.fontSize * w}px Arial`;
          ctx.fillText(shape.text, shape.x * w, shape.y * h);
          break;
      }

      // Draw selection handles for local selected shape
      if (selectedShapeId === shape.id && tool === 'select') {
        const bounds = getShapeBounds(shape, { width: w, height: h });
        
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
        ctx.setLineDash([]);

        const handleSize = 6;
        ctx.fillStyle = 'blue';
        const handles = [
          [bounds.left, bounds.top], [bounds.right, bounds.top],
          [bounds.left, bounds.bottom], [bounds.right, bounds.bottom],
          [bounds.left, (bounds.top + bounds.bottom) / 2],
          [bounds.right, (bounds.top + bounds.bottom) / 2],
          [(bounds.left + bounds.right) / 2, bounds.top],
          [(bounds.left + bounds.right) / 2, bounds.bottom]
        ];
        
        handles.forEach(([x, y]) => {
          ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        });
      }
    });

    // Draw other users' cursors
    Object.entries(userCursors).forEach(([userId, cursor]) => {
      const user = connectedUsers.find(u => u.id === userId);
      if (user && cursor) {
        const x = cursor.x * w;
        const y = cursor.y * h;
        
        // Draw cursor
        ctx.fillStyle = user.color || '#666';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12, y + 4);
        ctx.lineTo(x + 5, y + 10);
        ctx.closePath();
        ctx.fill();
        
        // Draw user name
        ctx.fillStyle = user.color || '#666';
        ctx.font = '12px Arial';
        ctx.fillText(`User ${userId.slice(-4)}`, x + 15, y - 5);
      }
    });

  }, [
    canvasRef,
    canvasSize,
    shapes,
    currentShape,
    selectedShapeId,
    tool,
    userDrawings,
    userCursors,
    connectedUsers
  ]);
};