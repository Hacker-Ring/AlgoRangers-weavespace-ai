// src/utils/geometryUtils.js

export function pointToLineDistance(point, start, end) {
  const A = point.x - start.x;
  const B = point.y - start.y;
  const C = end.x - start.x;
  const D = end.y - start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = start.x;
    yy = start.y;
  } else if (param > 1) {
    xx = end.x;
    yy = end.y;
  } else {
    xx = start.x + param * C;
    yy = start.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getShapeBounds(shape, canvasSize) {
  if (shape.type === 'text') {
    const w = shape.text.length * (shape.fontSize * canvasSize.width / 2);
    const h = shape.fontSize * canvasSize.width;
    return {
      left: shape.x * canvasSize.width,
      top: shape.y * canvasSize.height - h,
      right: shape.x * canvasSize.width + w,
      bottom: shape.y * canvasSize.height
    };
  } else if (shape.type === 'rectangle') {
    return {
      left: Math.min(shape.startX, shape.endX) * canvasSize.width,
      top: Math.min(shape.startY, shape.endY) * canvasSize.height,
      right: Math.max(shape.startX, shape.endX) * canvasSize.width,
      bottom: Math.max(shape.startY, shape.endY) * canvasSize.height
    };
  } else if (shape.type === 'circle') {
    const r = Math.sqrt(Math.pow((shape.endX - shape.startX) * canvasSize.width, 2) + Math.pow((shape.endY - shape.startY) * canvasSize.height, 2));
    return {
      left: shape.startX * canvasSize.width - r,
      top: shape.startY * canvasSize.height - r,
      right: shape.startX * canvasSize.width + r,
      bottom: shape.startY * canvasSize.height + r
    };
  } else if (shape.type === 'line') {
    return {
      left: Math.min(shape.startX, shape.endX) * canvasSize.width,
      top: Math.min(shape.startY, shape.endY) * canvasSize.height,
      right: Math.max(shape.startX, shape.endX) * canvasSize.width,
      bottom: Math.max(shape.startY, shape.endY) * canvasSize.height
    };
  } else if (shape.type === 'pencil') {
    const xs = shape.points.map(p => p.x * canvasSize.width);
    const ys = shape.points.map(p => p.y * canvasSize.height);
    return {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys)
    };
  }
  return { left: 0, top: 0, right: 0, bottom: 0 };
}

export function getResizeHandle(pos, shape, canvasSize) {
  const bounds = getShapeBounds(shape, canvasSize);
  const handleSize = 8;
  
  if (Math.abs(pos.x - bounds.left) < handleSize && Math.abs(pos.y - bounds.top) < handleSize) return 'nw';
  if (Math.abs(pos.x - bounds.right) < handleSize && Math.abs(pos.y - bounds.top) < handleSize) return 'ne';
  if (Math.abs(pos.x - bounds.left) < handleSize && Math.abs(pos.y - bounds.bottom) < handleSize) return 'sw';
  if (Math.abs(pos.x - bounds.right) < handleSize && Math.abs(pos.y - bounds.bottom) < handleSize) return 'se';
  if (Math.abs(pos.x - bounds.left) < handleSize && pos.y > bounds.top + handleSize && pos.y < bounds.bottom - handleSize) return 'w';
  if (Math.abs(pos.x - bounds.right) < handleSize && pos.y > bounds.top + handleSize && pos.y < bounds.bottom - handleSize) return 'e';
  if (Math.abs(pos.y - bounds.top) < handleSize && pos.x > bounds.left + handleSize && pos.x < bounds.right - handleSize) return 'n';
  if (Math.abs(pos.y - bounds.bottom) < handleSize && pos.x > bounds.left + handleSize && pos.x < bounds.right - handleSize) return 's';
  
  return null;
}