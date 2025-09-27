// src/components/Canvas.jsx
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

  return (
    <canvas 
      ref={canvasRef} 
      width={canvasSize.width} 
      height={canvasSize.height}
      className="absolute inset-0 bg-white cursor-crosshair"
      onMouseDown={startDrawing} 
      onMouseMove={draw} 
      onMouseUp={stopDrawing} 
      onMouseLeave={stopDrawing} 
    />
  );
};

export default Canvas;