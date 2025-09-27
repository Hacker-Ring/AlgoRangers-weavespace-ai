// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  undo,
  redo,
  deleteSelected,
  isTyping,
  selectedShapeId,
  textInput,
  addText,
  cancelText
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo/Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { 
        e.preventDefault(); 
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { 
        e.preventDefault(); 
        redo(); 
      }

      // Text input shortcuts
      if (isTyping && e.key === 'Enter') {
        addText();
      }
      
      if (isTyping && e.key === 'Escape') {
        cancelText();
      }

      // Delete selected shape
      if (e.key === 'Delete' && selectedShapeId && !isTyping) {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected, isTyping, selectedShapeId, textInput, addText, cancelText]);
};