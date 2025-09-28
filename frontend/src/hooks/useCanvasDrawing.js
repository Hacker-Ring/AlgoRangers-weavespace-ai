import { useState, useCallback } from 'react';
import { getShapeBounds, getResizeHandle, pointToLineDistance } from '../utils/geometryUtils';

export const useCanvasDrawing = ({
  canvasRef,
  canvasSize,
  tool,
  setTool,
  color,
  strokeWidth,
  shapes,
  setShapes,
  currentShape,
  setCurrentShape,
  selectedShapeId,
  setSelectedShapeId,
  isDrawing,
  setIsDrawing,
  dragOffset,
  setDragOffset,
  resizeHandle,
  setResizeHandle,
  setTextPosition,
  setIsTyping,
  setTextInput,
  setShowProperties,
  saveToHistory,
  sendCursorMovement,
  sendShapeUpdate,
  sendDrawingState
}) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const getCanvasCoordinates = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const findClickedShape = useCallback((pos) => {
    const px = pos.x / canvasSize.width;
    const py = pos.y / canvasSize.height;

    return shapes.find(shape => {
      if (shape.type === 'text') {
        const w = shape.text.length * (shape.fontSize / 2);
        const h = shape.fontSize;
        return px >= shape.x && px <= shape.x + w / canvasSize.width &&
               py >= shape.y - h / canvasSize.height && py <= shape.y;
      } else if (shape.type === 'rectangle') {
        return px >= Math.min(shape.startX, shape.endX) && px <= Math.max(shape.startX, shape.endX) &&
               py >= Math.min(shape.startY, shape.endY) && py <= Math.max(shape.startY, shape.endY);
      } else if (shape.type === 'circle') {
        const r = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2));
        const dist = Math.sqrt(Math.pow(px - shape.startX, 2) + Math.pow(py - shape.startY, 2));
        return dist <= r;
      } else if (shape.type === 'line') {
        const dist = pointToLineDistance(
          { x: px, y: py },
          { x: shape.startX, y: shape.startY },
          { x: shape.endX, y: shape.endY }
        );
        return dist <= 0.01;
      } else if (shape.type === 'pencil') {
        for (let i = 0; i < shape.points.length - 1; i++) {
          const dist = pointToLineDistance({ x: px, y: py }, shape.points[i], shape.points[i + 1]);
          if (dist <= 0.01) return true;
        }
        return false;
      } else if (shape.type === 'icon') {
        // Add icon hit detection
        return px >= shape.x && px <= shape.x + shape.width / canvasSize.width &&
               py >= shape.y && py <= shape.y + shape.height / canvasSize.height;
      }
      return false;
    });
  }, [shapes, canvasSize]);

  const startDrawing = useCallback((e) => {
    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setIsDrawing(true);

    // Send cursor position immediately when starting to draw
    const relativePos = {
      x: pos.x / canvasSize.width,
      y: pos.y / canvasSize.height
    };
    sendCursorMovement(relativePos);

    if (tool === 'text') {
      setTextPosition(pos);
      setIsTyping(true);
      setTextInput('');
      return;
    }

    if (tool === 'select') {
      const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

      if (selectedShape) {
        const handle = getResizeHandle(pos, selectedShape, canvasSize);
        if (handle) {
          setResizeHandle(handle);
          return;
        }
      }

      const clickedShape = findClickedShape(pos);

      if (clickedShape) {
        setSelectedShapeId(clickedShape.id);
        setDragOffset({ x: pos.x, y: pos.y });
      } else {
        setSelectedShapeId(null);
      }
      return;
    }

    const newShape = {
      id: Date.now() + Math.random(),
      type: tool,
      startX: pos.x / canvasSize.width,
      startY: pos.y / canvasSize.height,
      endX: pos.x / canvasSize.width,
      endY: pos.y / canvasSize.height,
      color,
      strokeWidth,
      points: tool === 'pencil' ? [{ x: pos.x / canvasSize.width, y: pos.y / canvasSize.height }] : []
    };
    setCurrentShape(newShape);
    sendDrawingState(true, newShape);
  }, [
    getCanvasCoordinates, tool, shapes, selectedShapeId, canvasSize, color, strokeWidth,
    setIsDrawing, setTextPosition, setIsTyping, setTextInput, setResizeHandle,
    setSelectedShapeId, setDragOffset, setCurrentShape, sendDrawingState, findClickedShape, sendCursorMovement
  ]);

  const draw = useCallback((e) => {
    const pos = getCanvasCoordinates(e);

    // Send cursor position with relative coordinates (0-1 range)
    const relativePos = {
      x: pos.x / canvasSize.width,
      y: pos.y / canvasSize.height
    };
    sendCursorMovement(relativePos);

    // Handle resize
    if (resizeHandle && selectedShapeId) {
      const shape = shapes.find(s => s.id === selectedShapeId);
      if (!shape) return;

      const bounds = getShapeBounds(shape, canvasSize);
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      setShapes(prev => prev.map(s => {
        if (s.id !== selectedShapeId) return s;

        if (s.type === 'rectangle' || s.type === 'line') {
          let newShape = { ...s };

          if (resizeHandle.includes('n')) newShape.startY = (bounds.top + dy) / canvasSize.height;
          if (resizeHandle.includes('s')) newShape.endY = (bounds.bottom + dy) / canvasSize.height;
          if (resizeHandle.includes('w')) newShape.startX = (bounds.left + dx) / canvasSize.width;
          if (resizeHandle.includes('e')) newShape.endX = (bounds.right + dx) / canvasSize.width;

          sendShapeUpdate('update', { shape: newShape });
          return newShape;
        } else if (s.type === 'circle') {
          const centerX = s.startX * canvasSize.width;
          const centerY = s.startY * canvasSize.height;
          const newRadius = Math.max(10, Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)));
          const newShape = {
            ...s,
            endX: (centerX + newRadius) / canvasSize.width,
            endY: (centerY + newRadius) / canvasSize.height
          };
          sendShapeUpdate('update', { shape: newShape });
          return newShape;
        } else if (s.type === 'text') {
          const scaleX = Math.abs(dx) / (bounds.right - bounds.left) + 1;
          const newShape = {
            ...s,
            fontSize: Math.max(0.01, s.fontSize * Math.max(0.5, scaleX))
          };
          sendShapeUpdate('update', { shape: newShape });
          return newShape;
        } else if (s.type === 'icon') {
          // Handle icon resizing
          const scaleX = Math.abs(dx) / (bounds.right - bounds.left) + 1;
          const scaleY = Math.abs(dy) / (bounds.bottom - bounds.top) + 1;
          const newShape = {
            ...s,
            width: Math.max(20, s.width * Math.max(0.5, scaleX)),
            height: Math.max(20, s.height * Math.max(0.5, scaleY)),
            fontSize: Math.max(12, s.fontSize * Math.max(0.5, scaleX))
          };
          sendShapeUpdate('update', { shape: newShape });
          return newShape;
        }

        return s;
      }));
      return;
    }

    // Handle drag
    if (tool === 'select' && selectedShapeId && dragOffset && !resizeHandle) {
      setShapes(prev => prev.map(shape => {
        if (shape.id !== selectedShapeId) return shape;
        const dx = (pos.x - dragOffset.x) / canvasSize.width;
        const dy = (pos.y - dragOffset.y) / canvasSize.height;

        let newShape;
        if (shape.type === 'text') {
          newShape = { ...shape, x: shape.x + dx, y: shape.y + dy };
        } else if (shape.type === 'icon') {
          newShape = { ...shape, x: shape.x + dx, y: shape.y + dy };
        } else {
          newShape = {
            ...shape,
            startX: shape.startX + dx,
            startY: shape.startY + dy,
            endX: shape.endX + dx,
            endY: shape.endY + dy,
            points: shape.points?.map(p => ({ x: p.x + dx, y: p.y + dy }))
          };
        }

        sendShapeUpdate('update', { shape: newShape });
        return newShape;
      }));
      setDragOffset(pos);
      return;
    }

    if (!isDrawing) return;

    if (tool === 'pencil') {
      const updatedShape = {
        ...currentShape,
        points: [...currentShape.points, { x: pos.x / canvasSize.width, y: pos.y / canvasSize.height }]
      };
      setCurrentShape(updatedShape);
      sendDrawingState(true, updatedShape);
    } else {
      const updatedShape = {
        ...currentShape,
        endX: pos.x / canvasSize.width,
        endY: pos.y / canvasSize.height
      };
      setCurrentShape(updatedShape);
      sendDrawingState(true, updatedShape);
    }
  }, [
    getCanvasCoordinates, sendCursorMovement, resizeHandle, selectedShapeId, shapes,
    canvasSize, startPos, tool, dragOffset, isDrawing, currentShape,
    setShapes, sendShapeUpdate, setDragOffset, setCurrentShape, sendDrawingState
  ]);

  const stopDrawing = useCallback(() => {
    if (tool === 'select') {
      setDragOffset(null);
      setResizeHandle(null);
      if (selectedShapeId && (dragOffset || resizeHandle)) {
        saveToHistory();
      }
      return;
    }

    if (!isDrawing) return;

    setIsDrawing(false);
    sendDrawingState(false, null);

    if (currentShape) {
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      setCurrentShape(null);

      sendShapeUpdate('add', { shape: currentShape });
      saveToHistory();

      setTool('select');
      setSelectedShapeId(currentShape.id);
      setShowProperties(true);
    }
  }, [
    tool, isDrawing, currentShape, shapes, selectedShapeId, dragOffset, resizeHandle,
    setIsDrawing, sendDrawingState, setShapes, setCurrentShape, sendShapeUpdate,
    saveToHistory, setTool, setSelectedShapeId, setShowProperties, setDragOffset, setResizeHandle
  ]);

  return {
    startDrawing,
    draw,
    stopDrawing
  };
};