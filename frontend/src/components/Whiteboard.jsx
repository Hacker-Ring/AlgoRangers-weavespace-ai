import React, { useState, useRef } from 'react';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import Canvas from './Canvas';
import StatusBar from './StatusBar';
import TextInput from './TextInput';
import VoiceChat from './VoiceChat';
import ChatPage from './ChatPage';
import SubjectIconsPanel from './SubjectIconsPanel'; // Add this import
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
    undo, redo, clearCanvas, deleteSelected, saveToHistory, addIconToCanvas
  } = useWhiteboardState();

  const {
    socket,
    isConnected, connectedUsers, userCursors, userDrawings,
    sendCursorMovement, sendShapeUpdate, sendDrawingState
  } = useSocket(setShapes, setHistory, setHistoryIndex);

  // State for floating panels
  const [isVoiceChatVisible, setIsVoiceChatVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isIconsPanelVisible, setIsIconsPanelVisible] = useState(false);

  const roomId = 'main-workspace';

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
    setShapes(prev =>
      prev.map(shape => {
        if (shape.id === selectedShapeId) {
          const updatedShape = { ...shape, [property]: value };
          sendShapeUpdate('update', { shape: updatedShape });
          return updatedShape;
        }
        return shape;
      })
    );
  };

  const getSelectedShape = () => shapes.find(shape => shape.id === selectedShapeId);

  const handleSuggestion = action => {
    console.log('Suggestion action:', action);
  };

  const handleIconSelect = iconData => {
    const newIconShape = addIconToCanvas(iconData);
    sendShapeUpdate('add', { shape: newIconShape });
  };

  // If chat is visible, show chat page
  if (isChatVisible) {
    return (
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
      {/* Toolbar */}
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
        onToggleIconsPanel={() => setIsIconsPanelVisible(prev => !prev)}
        isIconsPanelVisible={isIconsPanelVisible}
      />

      {/* Subject Icons Panel */}
      <SubjectIconsPanel
        isVisible={isIconsPanelVisible}
        onClose={() => setIsIconsPanelVisible(false)}
        workspaceId={roomId}
        onIconSelect={handleIconSelect}
        canvasSize={canvasSize}
      />

      {/* Voice Chat Component */}
      <VoiceChat socket={socket} roomId={roomId} isVisible={isVoiceChatVisible} />

      {/* Floating Action Buttons (bottom-right) */}
      <div className="fixed bottom-5 right-5 flex flex-col items-center space-y-4 z-40">
        {/* Voice Chat Button */}
        <button
          onClick={() => setIsVoiceChatVisible(prev => !prev)}
          className={`p-3 rounded-full shadow-md transition-all ${
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

        {/* Chat Button */}
        <button
          onClick={() => setIsChatVisible(true)}
          className="p-3 rounded-full shadow-md bg-white text-gray-700 hover:bg-gray-200 transition-all"
          title="Open Chat"
        >
          <span className="text-lg" role="img" aria-label="chat icon">
            💬
          </span>
        </button>

        {/* Subject Icons Button */}
        <button
          onClick={() => setIsIconsPanelVisible(prev => !prev)}
          className={`p-3 rounded-full shadow-md transition-all ${
            isIconsPanelVisible
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          title="Toggle Subject Icons"
        >
          <span className="text-lg" role="img" aria-label="icons panel">
            🎯
          </span>
        </button>

        {/* AI Flowchart Generator Button */}
        <button
          onClick={() => (window.location.href = '/whiteboard.html')}
          className="p-3 rounded-full shadow-md bg-green-500 text-white hover:bg-green-600 transition-all"
          title="AI Flowchart Generator"
        >
          <span className="text-lg" role="img" aria-label="flowchart">
            📊
          </span>
        </button>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        show={showProperties && getSelectedShape()}
        selectedShape={getSelectedShape()}
        updateSelectedShapeProperty={updateSelectedShapeProperty}
        deleteSelected={deleteSelected}
        canvasSize={canvasSize}
        onSuggestion={handleSuggestion}
      />

      {/* Canvas */}
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

        {/* Text Input Overlay */}
        <TextInput
          isVisible={isTyping}
          value={textInput}
          onChange={setTextInput}
          position={textPosition}
          color={color}
          strokeWidth={strokeWidth}
          onComplete={text => {
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

      {/* Status Bar */}
      <StatusBar isConnected={isConnected} connectedUsers={connectedUsers} />
    </div>
  );
};

export default Whiteboard;
