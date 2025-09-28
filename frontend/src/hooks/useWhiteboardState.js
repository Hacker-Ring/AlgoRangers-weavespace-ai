import { useState, useCallback } from 'react';

export const useWhiteboardState = () => {
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [showProperties, setShowProperties] = useState(false);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(shapes)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [shapes, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newShapes = JSON.parse(JSON.stringify(history[newIndex]));
      setHistoryIndex(newIndex);
      setShapes(newShapes);
      setSelectedShapeId(null);
      setSelectedShape(null);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const newShapes = JSON.parse(JSON.stringify(history[newIndex]));
      setHistoryIndex(newIndex);
      setShapes(newShapes);
      setSelectedShapeId(null);
      setSelectedShape(null);
    }
  }, [historyIndex, history]);

  const clearCanvas = useCallback(() => {
    setShapes([]);
    setCurrentShape(null);
    setSelectedShapeId(null);
    setSelectedShape(null);
    saveToHistory();
  }, [saveToHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedShapeId) {
      setShapes(prev => prev.filter(shape => shape.id !== selectedShapeId));
      setSelectedShapeId(null);
      setSelectedShape(null);
      setShowProperties(false);
      saveToHistory();
    }
  }, [selectedShapeId, saveToHistory]);

  // Add icon to canvas function - remove canvasSize dependency
// Update the addIconToCanvas function to use proper coordinate system:
  const addIconToCanvas = useCallback((iconData) => {
    const newIconShape = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      x: iconData.x || 0.3, // Use relative coordinates (0-1 range)
      y: iconData.y || 0.3,
      width: iconData.width || 100,
      height: iconData.height || 100,
      emoji: iconData.emoji,
      text: iconData.type === 'text' ? iconData.emoji : undefined,
      fontSize: iconData.fontSize || 48,
      color: color,
      name: iconData.name,
      category: iconData.category
    };

    setShapes(prev => [...prev, newIconShape]);
    saveToHistory();
    return newIconShape;
  }, [color, saveToHistory]);

  return {
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    shapes,
    setShapes,
    currentShape,
    setCurrentShape,
    selectedShapeId,
    setSelectedShapeId,
    selectedShape,
    setSelectedShape,
    history,
    historyIndex,
    isDrawing,
    setIsDrawing,
    isTyping,
    setIsTyping,
    textInput,
    setTextInput,
    textPosition,
    setTextPosition,
    dragOffset,
    setDragOffset,
    resizeHandle,
    setResizeHandle,
    showProperties,
    setShowProperties,
    saveToHistory,
    undo,
    redo,
    clearCanvas,
    deleteSelected,
    addIconToCanvas
  };
};