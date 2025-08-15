"use client";

import React, { useState } from 'react';
import { useWebSocket, useWebSocketHelpers } from '@/context/WebSocketContext';
import { useAuth } from '@/context/AuthContext';

const WebSocketStatus: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { 
    isConnected, 
    connectionState, 
    messages, 
    unreadCount,
    markMessageAsRead,
    clearMessages
  } = useWebSocket();
  
  const { sendBookingNotification, sendOrderUpdate, sendChatMessage } = useWebSocketHelpers();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const getStatusColor = () => {
    switch (connectionState) {
      case 'CONNECTED': return 'text-green-500';
      case 'CONNECTING': return 'text-yellow-500';
      case 'DISCONNECTED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'CONNECTED': return '🟢';
      case 'CONNECTING': return '🟡';
      case 'DISCONNECTED': return '🔴';
      default: return '⚪';
    }
  };

  const handleSendTestBooking = () => {
    sendBookingNotification({
      customerName: 'Nguyễn Văn A',
      route: 'Hà Nội - TP.HCM',
      seats: ['A1', 'A2'],
      totalAmount: 500000,
      bookingId: `BK${Date.now()}`
    });
  };

  const handleSendTestOrder = () => {
    sendOrderUpdate(`ORDER${Date.now()}`, 'confirmed', {
      estimatedTime: '2 hours',
      driver: 'Trần Văn B'
    });
  };

  const handleSendChatTest = () => {
    if (testMessage.trim()) {
      sendChatMessage(testMessage);
      setTestMessage('');
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Status Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white shadow-lg rounded-full p-3 border border-gray-200 hover:shadow-xl transition-shadow relative"
        title={`WebSocket: ${connectionState}`}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white shadow-xl rounded-lg border border-gray-200 w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">WebSocket Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm ${getStatusColor()}`}>
                {connectionState}
              </span>
              {user?.id && (
                <span className="text-xs text-gray-500">
                  User: {user.id}
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-48 overflow-y-auto p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Messages ({messages.length})
              </h4>
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No messages yet</p>
            ) : (
              <div className="space-y-2">
                {messages.slice(-5).map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`text-xs p-2 rounded border ${
                      msg.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => markMessageAsRead(msg.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-600">{msg.type}</span>
                      <span className="text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-700">
                      {JSON.stringify(msg.data, null, 2).substring(0, 100)}
                      {JSON.stringify(msg.data).length > 100 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Controls */}
          {isConnected && (
            <div className="bg-gray-50 p-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Test Messages</h4>
              <div className="space-y-2">
                <button
                  onClick={handleSendTestBooking}
                  className="w-full text-xs bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                >
                  Send Test Booking
                </button>
                <button
                  onClick={handleSendTestOrder}
                  className="w-full text-xs bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600"
                >
                  Send Test Order Update
                </button>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatTest()}
                  />
                  <button
                    onClick={handleSendChatTest}
                    className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
