// src/components/TextInput.jsx
import React from 'react';

const TextInput = ({
  isVisible,
  value,
  onChange,
  position,
  color,
  strokeWidth,
  onConfirm,
  onCancel
}) => {
  if (!isVisible) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      className="absolute border-2 border-blue-500 px-2 py-1 bg-white rounded"
      style={{ 
        left: position.x, 
        top: position.y - 20, 
        fontSize: `${strokeWidth * 8}px`, 
        color 
      }} 
      autoFocus 
      placeholder="Type text..." 
    />
  );
};

export default TextInput;