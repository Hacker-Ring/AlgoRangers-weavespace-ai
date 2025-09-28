import React, { useRef, useEffect } from 'react';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasRendering } from '../hooks/useCanvasRendering';

const Canvas = ({
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
  sendDrawingState,
  userDrawings,
  userCursors,
  connectedUsers
}) => {
  const canvasRef = useRef(null);

  const {
    startDrawing,
    draw,
    stopDrawing
  } = useCanvasDrawing({
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
  });

  // Render canvas
  useCanvasRendering({
    canvasRef,
    canvasSize,
    shapes,
    currentShape,
    selectedShapeId,
    tool,
    userDrawings,
    userCursors,
    connectedUsers
  });

  // Handle mouse enter to send cursor position
  const handleMouseEnter = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasSize.width;
    const y = (e.clientY - rect.top) / canvasSize.height;
    sendCursorMovement({ x, y });
  };

  // Handle mouse leave to hide cursor
  const handleMouseLeave = (e) => {
    stopDrawing();
    // Send cursor off-screen when leaving canvas
    sendCursorMovement({ x: -1, y: -1 });
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      className="absolute inset-0 bg-white cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    />
  );
};

export default Canvas;