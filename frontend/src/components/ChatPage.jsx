import React, { useState, useEffect, useRef } from 'react';

const ChatPage = ({ socket, roomId, connectedUsers, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) {
      console.error('❌ No socket provided to ChatPage');
      return;
    }

    console.log('💬 Setting up chat socket listeners for room:', roomId);

    // Socket connection events
    const handleConnect = () => {
      console.log('✅ Chat: Socket connected');
      setIsConnected(true);

      // Join chat room when connected
      if (roomId) {
        console.log('🚪 Joining chat room:', roomId);
        socket.emit('joinChat', { roomId });
      }
    };

    const handleDisconnect = () => {
      console.log('❌ Chat: Socket disconnected');
      setIsConnected(false);
    };

    // Chat message events
    const handleChatMessage = (data) => {
      console.log('💬 Chat: New message received', data);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        user: data.user,
        message: data.message,
        timestamp: data.timestamp,
        type: data.userId === socket.id ? 'sent' : 'received'
      }]);
    };

    const handleUserJoined = (data) => {
      console.log('👋 Chat: User joined', data);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        user: 'System',
        message: `${data.username} joined the chat`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
    };

    const handleUserLeft = (data) => {
      console.log('👋 Chat: User left', data);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        user: 'System',
        message: `${data.username} left the chat`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('chatMessage', handleChatMessage);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);

    // If already connected, join the room immediately
    if (socket.connected) {
      handleConnect();
    }

    // Clean up
    return () => {
      console.log('🧹 Cleaning up chat listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('chatMessage', handleChatMessage);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);

      if (roomId && socket.connected) {
        socket.emit('leaveChat', { roomId });
      }
    };
  }, [socket, roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) {
      console.error('❌ Cannot send message:', { hasSocket: !!socket, isConnected, hasMessage: !!newMessage.trim() });
      return;
    }

    const messageData = {
      roomId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', messageData);

    // Add message to local state immediately
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      user: 'You',
      message: newMessage.trim(),
      timestamp: messageData.timestamp,
      type: 'sent'
    }]);

    // Send message via socket
    socket.emit('chatMessage', messageData);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to Whiteboard"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Chat Room</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'} • {connectedUsers.length} users online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">
            <span className="text-6xl">💬</span>
            <p className="mt-4 text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
            {!isConnected && (
              <p className="text-red-500 text-sm mt-2">Waiting for connection...</p>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'} ${
                msg.type === 'system' ? 'justify-center' : ''
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.type === 'sent'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : msg.type === 'system'
                    ? 'bg-yellow-100 text-yellow-800 text-center mx-auto'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.type !== 'system' && (
                  <div className={`text-xs font-medium ${msg.type === 'sent' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.user}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.type === 'sent' ? 'text-blue-200' : 'text-gray-400'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;