import React from 'react';
import { getSuggestions } from '../utils/suggestions';

const PropertiesPanel = ({
  show,
  selectedShape,
  updateSelectedShapeProperty,
  deleteSelected,
  canvasSize,
  onSuggestion
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

        {/* Stroke Width for non-text and non-icon shapes */}
        {selectedShape.type !== 'text' && selectedShape.type !== 'icon' && (
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

        {/* Font Size for text and icon shapes */}
        {(selectedShape.type === 'text' || selectedShape.type === 'icon') && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Size:</label>
            <input
              type="range"
              min="12"
              max="72"
              value={selectedShape.fontSize || 48}
              onChange={e => updateSelectedShapeProperty('fontSize', parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm min-w-[3rem]">{selectedShape.fontSize || 48}px</span>
          </div>
        )}

        {/* Icon-specific properties */}
        {selectedShape.type === 'icon' && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm">Width:</label>
              <input
                type="number"
                min="20"
                max="500"
                value={selectedShape.width || 100}
                onChange={e => updateSelectedShapeProperty('width', parseInt(e.target.value))}
                className="w-16 p-1 border rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Height:</label>
              <input
                type="number"
                min="20"
                max="500"
                value={selectedShape.height || 100}
                onChange={e => updateSelectedShapeProperty('height', parseInt(e.target.value))}
                className="w-16 p-1 border rounded"
              />
            </div>
          </>
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
      {suggestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Suggestions</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestion && onSuggestion(s)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;