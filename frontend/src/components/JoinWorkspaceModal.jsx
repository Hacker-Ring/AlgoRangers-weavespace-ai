// components/JoinWorkspaceModal.jsx
import React, { useState } from 'react';

const JoinWorkspaceModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) return;

    setLoading(true);
    try {
      await onJoin(code);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Join Workspace</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4-Digit Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                required
                maxLength={4}
                pattern="\d{4}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0000"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 4-digit code shared by the workspace creator
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinWorkspaceModal;