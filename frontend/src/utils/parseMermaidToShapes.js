// src/utils/parseMermaidToShapes.js
export function parseMermaidToShapes(mermaidCode) {
  const shapes = [];
  const edges = [];

  const lines = mermaidCode.split('\n');
  let x = 50, y = 50;
  const spacing = 100;
  const nodePositions = {};

  lines.forEach((line, index) => {
    // Nodes: A[Start] or B{Decision}
    const nodeMatch = line.match(/(\w+)\s*[\[\{](.+)[\]\}]/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const text = nodeMatch[2];
      shapes.push({
        id,
        type: 'rect',
        x,
        y: y + index * spacing,
        width: text.length * 10 + 20,
        height: 50,
        text,
        color: '#3498db',
      });
      nodePositions[id] = { x, y: y + index * spacing, width: text.length * 10 + 20, height: 50 };
    }

    // Edges: A --> B or A -- Yes --> B
    const edgeMatch = line.match(/(\w+)\s*--.*?--?>\s*(\w+)/);
    if (edgeMatch) {
      edges.push({ from: edgeMatch[1], to: edgeMatch[2] });
    }
  });

  return { shapes, edges };
}
