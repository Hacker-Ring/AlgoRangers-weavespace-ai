// src/hooks/useCanvasSize.js
import { useState, useEffect } from 'react';

export const useCanvasSize = (containerRef) => {
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setCanvasSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight - 140,
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  return canvasSize;
};