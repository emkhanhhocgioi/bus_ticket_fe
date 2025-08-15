"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/context/WebSocketContext';

const ConnectionStatus: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { isConnected, connectionState, unreadCount } = useWebSocket();

  if (!isLoggedIn) {
    return null; // Don't show anything if not logged in
  }

  return (
    <div className="fixed top-20 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">WebSocket Status</span>
          <span className={`inline-block w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div>User: <span className="font-mono">{user?.id}</span></div>
          <div>State: <span className={`font-medium ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>{connectionState}</span></div>
          {unreadCount > 0 && (
            <div>Unread: <span className="font-medium text-blue-600">{unreadCount}</span></div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {isConnected 
            ? '✅ Ready to receive real-time updates' 
            : '⏳ Attempting to connect...'
          }
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
