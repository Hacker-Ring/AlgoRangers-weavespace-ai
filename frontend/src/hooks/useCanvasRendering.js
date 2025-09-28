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
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw all shapes (local and from other users)
    const allShapes = [
      ...shapes,
      ...(currentShape ? [currentShape] : []),
      ...Object.values(userDrawings).filter(drawing => drawing.currentShape).map(drawing => drawing.currentShape)
    ].filter(Boolean);

    allShapes.forEach(shape => {
      ctx.strokeStyle = shape.color || '#000000';
      ctx.fillStyle = shape.color || '#000000';
      ctx.lineWidth = shape.strokeWidth || 2;
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
          const rectWidth = (shape.endX - shape.startX) * w;
          const rectHeight = (shape.endY - shape.startY) * h;
          ctx.rect(shape.startX * w, shape.startY * h, rectWidth, rectHeight);
          ctx.stroke();
          break;

        case 'circle':
          const radius = Math.sqrt(
            Math.pow((shape.endX - shape.startX) * w, 2) +
            Math.pow((shape.endY - shape.startY) * h, 2)
          );
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
          ctx.font = `${(shape.fontSize || 0.02) * w}px Arial`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(shape.text || '', shape.x * w, shape.y * h);
          break;

        case 'icon':
          // Draw icon/emoji with proper positioning
          ctx.font = `${shape.fontSize || 48}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const iconX = (shape.x || 0) * w + (shape.width || 100) / 2;
          const iconY = (shape.y || 0) * h + (shape.height || 100) / 2;

          if (shape.emoji) {
            ctx.fillText(shape.emoji, iconX, iconY);
          } else if (shape.text) {
            ctx.fillText(shape.text, iconX, iconY);
          }
          break;

        default:
          console.warn('Unknown shape type:', shape.type);
      }

      // Draw selection handles for local selected shape
      if (selectedShapeId === shape.id && tool === 'select') {
        try {
          const bounds = getShapeBounds(shape, { width: w, height: h });

          if (bounds) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = '#3b82f6'; // Blue color
            ctx.lineWidth = 2;
            ctx.strokeRect(
              bounds.left - 2,
              bounds.top - 2,
              bounds.right - bounds.left + 4,
              bounds.bottom - bounds.top + 4
            );
            ctx.setLineDash([]);

            // Draw resize handles
            const handleSize = 8;
            ctx.fillStyle = '#3b82f6';

            const handles = [
              // Corners
              [bounds.left, bounds.top],
              [bounds.right, bounds.top],
              [bounds.left, bounds.bottom],
              [bounds.right, bounds.bottom],
              // Midpoints
              [bounds.left, (bounds.top + bounds.bottom) / 2],
              [bounds.right, (bounds.top + bounds.bottom) / 2],
              [(bounds.left + bounds.right) / 2, bounds.top],
              [(bounds.left + bounds.right) / 2, bounds.bottom]
            ];

            handles.forEach(([x, y]) => {
              ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
            });
          }
        } catch (error) {
          console.warn('Error drawing selection handles:', error);
        }
      }
    });

    // Draw other users' cursors
    Object.entries(userCursors || {}).forEach(([userId, cursor]) => {
      if (!cursor) return;

      const user = connectedUsers.find(u => u.id === userId);
      if (user) {
        const x = (cursor.x || 0) * w;
        const y = (cursor.y || 0) * h;

        // Draw cursor triangle
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
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`User ${userId.slice(-4)}`, x + 15, y - 5);
      }
    });

    // Draw other users' current drawings in progress
// Draw other users' cursors - FIXED VALIDATION
Object.entries(userCursors || {}).forEach(([userId, cursor]) => {
  // Validate cursor data before rendering
  if (!cursor || cursor.x === undefined || cursor.y === undefined) return;
  if (cursor.x < 0 || cursor.x > 1 || cursor.y < 0 || cursor.y > 1) return;

  const user = connectedUsers.find(u => u.id === userId);
  if (user) {
    const x = cursor.x * w;
    const y = cursor.y * h;

    // Only draw if coordinates are within canvas bounds
    if (x >= 0 && x <= w && y >= 0 && y <= h) {
      // Draw cursor as a colored circle
      ctx.fillStyle = user.color || '#666';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw user name background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      const username = user.username || `User ${userId.slice(-4)}`;
      const textWidth = ctx.measureText(username).width;
      ctx.fillRect(x + 8, y - 18, textWidth + 8, 16);

      // Draw user name
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(username, x + 12, y - 10);
    }
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