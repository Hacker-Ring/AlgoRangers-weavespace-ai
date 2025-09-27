// components/WorkspaceSidebar.jsx
import React from 'react';

const WorkspaceSidebar = ({ 
  workspaces, 
  selectedWorkspace, 
  onSelectWorkspace, 
  onCreateWorkspace, 
  onJoinWorkspace 
}) => {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Workspaces</h2>
          <div className="flex space-x-2">
            <button 
              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
              onClick={onCreateWorkspace}
              title="Create Workspace"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button 
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
              onClick={onJoinWorkspace}
              title="Join Workspace"
            >
              <span>🔗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace List */}
      <div className="flex-1 overflow-y-auto">
        {workspaces.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-3">No workspaces yet</p>
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium"
              onClick={onCreateWorkspace}
            >
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="p-2">
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedWorkspace?.id === workspace.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectWorkspace(workspace)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{workspace.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">#{workspace.code}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      workspace.role === 'owner' 
                        ? 'bg-purple-100 text-purple-800'
                        : workspace.role === 'admin'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workspace.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold mr-3">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 truncate">{username}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSidebar;