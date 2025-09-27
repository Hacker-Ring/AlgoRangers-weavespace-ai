// src/components/Whiteboard.jsx
import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import Canvas from './Canvas';
import StatusBar from './StatusBar';
import TextInput from './TextInput';
import { useWhiteboardState } from '../hooks/useWhiteboardState';
import { useSocket } from '../hooks/useSocket';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const Whiteboard = () => {
  const containerRef = useRef(null);
  const canvasSize = useCanvasSize(containerRef);
  
  const {
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
    undo,
    redo,
    clearCanvas,
    deleteSelected,
    saveToHistory
  } = useWhiteboardState();

  const {
    isConnected,
    connectedUsers,
    userCursors,
    userDrawings,
    sendCursorMovement,
    sendShapeUpdate,
    sendDrawingState
  } = useSocket(shapes, setShapes, history, historyIndex, canvasSize);

  useKeyboardShortcuts({
    undo,
    redo,
    deleteSelected,
    isTyping,
    selectedShapeId,
    textInput,
    addText: () => {
      if (textInput.trim()) {
        const textShape = {
          id: Date.now() + Math.random(),
          type: 'text',
          x: textPosition.x / canvasSize.width,
          y: textPosition.y / canvasSize.height,
          text: textInput,
          color,
          fontSize: strokeWidth * 0.005
        };
        setShapes(prev => [...prev, textShape]);
        sendShapeUpdate('add', { shape: textShape });
        saveToHistory();
        
        setTool('select');
        setSelectedShapeId(textShape.id);
        setShowProperties(true);
      }
      setIsTyping(false);
      setTextInput('');
    },
    cancelText: () => {
      setIsTyping(false);
      setTextInput('');
    }
  });

  const updateSelectedShapeProperty = (property, value) => {
    if (!selectedShapeId) return;
    setShapes(prev => prev.map(shape => {
      if (shape.id === selectedShapeId) {
        const updatedShape = { ...shape, [property]: value };
        sendShapeUpdate('update', { shape: updatedShape });
        return updatedShape;
      }
      return shape;
    }));
  };

  const getSelectedShape = () => shapes.find(shape => shape.id === selectedShapeId);

  // NEW: Handle suggestions from PropertiesPanel
  const handleSuggestion = (action) => {
    const selectedShape = getSelectedShape();
    if (!selectedShape) return;

    if (action === 'Add MFA Step') {
      const newShape = {
        id: Date.now() + Math.random(),
        type: 'icon',
        icon: 'lock',
        x: (selectedShape.x || 0.5) + 0.05,
        y: (selectedShape.y || 0.5),
        color: '#000000',
        strokeWidth: 2
      };
      setShapes(prev => [...prev, newShape]);
      sendShapeUpdate('add', { shape: newShape });
      saveToHistory();
    }

    if (action === 'Add Replication') {
      const newShape = {
        id: Date.now() + Math.random(),
        type: 'database',
        x: (selectedShape.x || 0.5) + 0.1,
        y: (selectedShape.y || 0.5),
        color: '#1976d2',
        strokeWidth: 3
      };
      setShapes(prev => [...prev, newShape]);
      sendShapeUpdate('add', { shape: newShape });
      saveToHistory();
    }

    if (action === 'Check Security Policy') {
      alert('Reminder: Verify security requirements for this component.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100" ref={containerRef}>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
        showProperties={showProperties}
        setShowProperties={setShowProperties}
        selectedShape={getSelectedShape()}
        historyIndex={historyIndex}
        historyLength={history.length}
        isConnected={isConnected}
        connectedUsers={connectedUsers}
      />

      <PropertiesPanel
        show={showProperties && getSelectedShape()}
        selectedShape={getSelectedShape()}
        updateSelectedShapeProperty={updateSelectedShapeProperty}
        deleteSelected={deleteSelected}
        canvasSize={canvasSize}
        onSuggestion={handleSuggestion}   // 👈 NEW
      />

      <div className="flex-1 relative">
        <Canvas
          canvasSize={canvasSize}
          tool={tool}
          setTool={setTool}
          color={color}
          strokeWidth={strokeWidth}
          shapes={shapes}
          setShapes={setShapes}
          currentShape={currentShape}
          setCurrentShape={setCurrentShape}
          selectedShapeId={selectedShapeId}
          setSelectedShapeId={setSelectedShapeId}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          dragOffset={dragOffset}
          setDragOffset={setDragOffset}
          resizeHandle={resizeHandle}
          setResizeHandle={setResizeHandle}
          setTextPosition={setTextPosition}
          setIsTyping={setIsTyping}
          setTextInput={setTextInput}
          setShowProperties={setShowProperties}
          saveToHistory={saveToHistory}
          sendCursorMovement={sendCursorMovement}
          sendShapeUpdate={sendShapeUpdate}
          sendDrawingState={sendDrawingState}
          userDrawings={userDrawings}
          userCursors={userCursors}
          connectedUsers={connectedUsers}
        />

        <TextInput
          isVisible={isTyping}
          value={textInput}
          onChange={setTextInput}
          position={textPosition}
          color={color}
          strokeWidth={strokeWidth}
          onConfirm={() => {
            if (textInput.trim()) {
              const textShape = {
                id: Date.now() + Math.random(),
                type: 'text',
                x: textPosition.x / canvasSize.width,
                y: textPosition.y / canvasSize.height,
                text: textInput,
                color,
                fontSize: strokeWidth * 0.005
              };
              setShapes(prev => [...prev, textShape]);
              sendShapeUpdate('add', { shape: textShape });
              saveToHistory();
              
              setTool('select');
              setSelectedShapeId(textShape.id);
              setShowProperties(true);
            }
            setIsTyping(false);
            setTextInput('');
          }}
          onCancel={() => {
            setIsTyping(false);
            setTextInput('');
          }}
        />
      </div>

      <StatusBar
        isConnected={isConnected}
        connectedUsers={connectedUsers}
      />
    </div>
  );
};

export default Whiteboard;
