import React, { useState, useRef } from 'react';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import Canvas from './Canvas';
import StatusBar from './StatusBar';
import TextInput from './TextInput';
import VoiceChat from './VoiceChat';
import ChatPage from './ChatPage';
import { useWhiteboardState } from '../hooks/useWhiteboardState';
import { useSocket } from '../hooks/useSocket';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const Whiteboard = () => {
  const containerRef = useRef(null);
  const canvasSize = useCanvasSize(containerRef);

  const {
    tool, setTool, color, setColor, strokeWidth, setStrokeWidth, shapes, setShapes,
    currentShape, setCurrentShape, selectedShapeId, setSelectedShapeId, history,
    historyIndex, setHistory, setHistoryIndex, isDrawing, setIsDrawing, isTyping,
    setIsTyping, textInput, setTextInput, textPosition, setTextPosition, dragOffset,
    setDragOffset, resizeHandle, setResizeHandle, showProperties, setShowProperties,
    undo, redo, clearCanvas, deleteSelected, saveToHistory
  } = useWhiteboardState();

  const {
    socket,
    isConnected, connectedUsers, userCursors, userDrawings,
    sendCursorMovement, sendShapeUpdate, sendDrawingState
  } = useSocket(setShapes, setHistory, setHistoryIndex);

  // State to control the visibility of the voice chat panel
  const [isVoiceChatVisible, setIsVoiceChatVisible] = useState(false);
  // State to control the visibility of the chat page
  const [isChatVisible, setIsChatVisible] = useState(false);
  const roomId = 'main-workspace'; // Use actual workspace ID from your app's state or URL

  useKeyboardShortcuts({
    undo,
    redo,
    deleteSelected,
    isTyping,
    selectedShapeId,
    textInput
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

  const handleSuggestion = (action) => {
    // Your existing suggestion logic...
    console.log('Suggestion action:', action);
  };

  // If chat is visible, render the ChatPage component
  if (isChatVisible) {
    return (
      // In Whiteboard.jsx, update the ChatPage component usage:
<ChatPage
  socket={socket}
  roomId={roomId}
  connectedUsers={connectedUsers}
  onBack={() => setIsChatVisible(false)}
/>
    );
  }

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

      {/* Voice Chat Toggle Button */}
      <button
        onClick={() => setIsVoiceChatVisible(prev => !prev)}
        className={`absolute top-24 left-5 z-40 p-3 rounded-full shadow-md transition-all ${
          isVoiceChatVisible 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
        title="Toggle Voice Chat"
      >
        <span className="text-lg" role="img" aria-label="voice chat icon">
          {isVoiceChatVisible ? '🔊' : '🎤'}
        </span>
      </button>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatVisible(true)}
        className="absolute top-40 left-5 z-40 p-3 rounded-full shadow-md bg-white text-gray-700 hover:bg-gray-200 transition-all"
        title="Open Chat"
      >
        <span className="text-lg" role="img" aria-label="chat icon">
          💬
        </span>
      </button>

      {/* Voice Chat Component */}
      <VoiceChat
        socket={socket}
        roomId={roomId}
        isVisible={isVoiceChatVisible}
      />

      <PropertiesPanel
        show={showProperties && getSelectedShape()}
        selectedShape={getSelectedShape()}
        updateSelectedShapeProperty={updateSelectedShapeProperty}
        deleteSelected={deleteSelected}
        canvasSize={canvasSize}
        onSuggestion={handleSuggestion}
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
          onComplete={(text) => {
            if (text.trim()) {
              const newTextShape = {
                id: Date.now().toString(),
                type: 'text',
                x: textPosition.x,
                y: textPosition.y,
                text: text,
                color: color,
                fontSize: strokeWidth * 4,
                fontFamily: 'Arial'
              };
              setShapes(prev => [...prev, newTextShape]);
              sendShapeUpdate('add', { shape: newTextShape });
              saveToHistory();
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

      <StatusBar isConnected={isConnected} connectedUsers={connectedUsers} />
    </div>
  );
};

export default Whiteboard;