// components/WorkspaceView.jsx
import React from 'react';
import { useNavigate } from "react-router-dom"
const WorkspaceView = ({ workspace }) => {
    const navigate = useNavigate()
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">Code: <strong>#{workspace.code}</strong></span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workspace.role === 'owner' 
                  ? 'bg-purple-100 text-purple-800'
                  : workspace.role === 'admin'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {workspace.role}
              </span>
            </div>
            {workspace.description && (
              <p className="text-gray-600 mt-2">{workspace.description}</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors">
              Share Code
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors" onClick={() => navigate('/whiteboard')}>
              Open Whiteboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Members Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                    Y
                  </div>
                  <span className="font-medium">You</span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {workspace.role}
                </span>
              </div>
              <p className="text-sm text-gray-500 text-center py-4">
                Other members will appear here when they join
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-gray-500">No activity yet</p>
              <p className="text-sm text-gray-400 mt-1">Start collaborating to see activity here</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Invite Members</div>
                <div className="text-sm text-gray-500">Share workspace code</div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Settings</div>
                <div className="text-sm text-gray-500">Workspace preferences</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceView;