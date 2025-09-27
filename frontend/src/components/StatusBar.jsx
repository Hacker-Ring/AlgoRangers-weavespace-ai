// src/components/StatusBar.jsx
import React from 'react';

const StatusBar = ({ isConnected, connectedUsers }) => {
  return (
    <div className="bg-gray-50 p-3 text-sm text-gray-600">
      <div className="flex flex-wrap gap-4">
        <span><strong>Real-time Collaboration:</strong> {isConnected ? 'Connected' : 'Disconnected'}</span>
        <span><strong>Active Users:</strong> {connectedUsers.length}</span>
        <span><strong>Enhanced Workflow:</strong> Draw any shape and it automatically becomes selected for immediate editing</span>
        <span><strong>Shortcuts:</strong> Ctrl+Z (Undo), Delete (Remove selected)</span>
      </div>
    </div>
  );
};

export default StatusBar;