// src/components/PropertiesPanel.jsx
import React from 'react';
import { getSuggestions } from '../utils/suggestions';

const PropertiesPanel = ({
  show,
  selectedShape,
  updateSelectedShapeProperty,
  deleteSelected,
  canvasSize
}) => {
  if (!show || !selectedShape) return null;

  const suggestions = getSuggestions(selectedShape);

  return (
    <div className="bg-white border-b shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Selected {selectedShape.type}:</span>
        
        {/* Color */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Color:</label>
          <input 
            type="color" 
            value={selectedShape.color} 
            onChange={e => updateSelectedShapeProperty('color', e.target.value)}
            className="w-8 h-8 rounded border cursor-pointer"
          />
        </div>
        
        {/* Stroke Width for non-text shapes */}
        {selectedShape.type !== 'text' && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Stroke:</label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={selectedShape.strokeWidth} 
              onChange={e => updateSelectedShapeProperty('strokeWidth', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm min-w-[2rem]">{selectedShape.strokeWidth}px</span>
          </div>
        )}
        
        {/* Font Size for text shapes */}
        {selectedShape.type === 'text' && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Size:</label>
            <input 
              type="range" 
              min="0.005" 
              max="0.1" 
              step="0.005"
              value={selectedShape.fontSize} 
              onChange={e => updateSelectedShapeProperty('fontSize', parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm min-w-[3rem]">{Math.round(selectedShape.fontSize * canvasSize.width)}px</span>
          </div>
        )}
        
        {/* Delete Button */}
        <button 
          onClick={deleteSelected} 
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Delete
        </button>
      </div>

      {/* Smart Suggestions */}
      <div className="mt-2">
        <h4 className="text-sm font-semibold">AI Suggestions:</h4>
        {suggestions.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm font-semibold mb-2">Suggestions</h4>
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSuggestion && onSuggestion(s)}   // 👈 NEW
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default PropertiesPanel;
