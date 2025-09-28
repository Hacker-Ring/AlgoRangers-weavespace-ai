import React from 'react';
import { Pencil, Square, Circle, Type, Minus, Trash2, Undo, Redo, MousePointer2, Settings, Users, Wifi } from 'lucide-react';

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  clearCanvas,
  showProperties,
  setShowProperties,
  selectedShape,
  historyIndex,
  historyLength,
  isConnected,
  connectedUsers,
  onToggleIconsPanel, // Add this
  isIconsPanelVisible // Add this
}) => {
  const tools = [
    { id: 'select', icon: MousePointer2, name: 'Select' },
    { id: 'pencil', icon: Pencil, name: 'Pencil' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'line', icon: Minus, name: 'Line' },
    { id: 'text', icon: Type, name: 'Text' }
  ];

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

  return (
    <div className="bg-white shadow-md p-4 flex flex-wrap items-center gap-4">
      {/* Tools */}
      <div className="flex gap-2">
        {tools.map(({ id, icon: Icon, name }) => (
          <button
            key={id}
            onClick={() => setTool(id)}
            className={`p-2 rounded-lg transition-colors ${tool === id ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            title={name}
          >
            <Icon size={20} />
          </button>
        ))}

        {/* Icons Panel Toggle Button */}
        <button
          onClick={onToggleIconsPanel}
          className={`p-2 rounded-lg transition-colors ${
            isIconsPanelVisible
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          title="Subject Icons"
        >
          <span className="text-lg">🎯</span>
        </button>
      </div>

      {/* Colors */}
      <div className="flex gap-2">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-gray-300'}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Size:</label>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={e => setStrokeWidth(parseInt(e.target.value))}
          className="w-20"
        />
        <span className="text-sm text-gray-600 min-w-[2rem]">{strokeWidth}px</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 ml-auto">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
          <Wifi size={16} className={isConnected ? 'text-green-500' : 'text-red-500'} />
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Users Count */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
          <Users size={16} />
          <span className="text-sm">{connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''}</span>
        </div>

        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={20} />
        </button>

        <button
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={20} />
        </button>

        <button
          onClick={() => setShowProperties(!showProperties)}
          disabled={!selectedShape}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Properties"
        >
          <Settings size={20} />
        </button>

        <button
          onClick={clearCanvas}
          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          title="Clear"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;