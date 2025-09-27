import React from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';

const VoiceChat = ({ socket, roomId, isVisible }) => {
  const {
    isVoiceConnected,
    isMuted,
    participants,
    error,
    initializeVoiceChat,
    cleanupVoiceChat,
    toggleMute,
  } = useVoiceChat(socket, roomId);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-5 w-64 bg-white rounded-xl p-4 shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Voice Chat</h3>
        <span className={`text-sm ${isVoiceConnected ? 'text-green-600' : 'text-red-600'}`}>
          ● {isVoiceConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="mb-4">
        {!isVoiceConnected ? (
          <button
            onClick={initializeVoiceChat}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={!socket || !socket.connected}
          >
            {socket && socket.connected ? 'Join Voice' : 'Connecting...'}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={toggleMute}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={cleanupVoiceChat}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Leave
            </button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Participants ({participants.size + (isVoiceConnected ? 1 : 0)})
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {isVoiceConnected && (
            <div className="text-xs text-gray-700 font-mono flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              You (Me) {isMuted && '(Muted)'}
            </div>
          )}
          {Array.from(participants).map(userId => (
            <div key={userId} className="text-xs text-gray-700 font-mono flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              User-{userId.slice(0, 6)}
            </div>
          ))}
          {participants.size === 0 && !isVoiceConnected && (
            <p className="text-xs text-gray-500 italic">No participants yet</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Room: {roomId}
        </p>
      </div>
    </div>
  );
};

export default VoiceChat;