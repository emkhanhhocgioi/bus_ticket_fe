import { useEffect, useRef, useCallback } from 'react';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, isWebSocketConnected } from '../api/wss';

interface UseWebSocketOptions {
  onConnect?: (userId: string) => void;
  onMessage?: (data: any) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (userId: string | null, options: UseWebSocketOptions = {}) => {
  const { onConnect, onMessage, autoConnect = true } = options;
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (userId && !isConnectedRef.current) {
      connectWebSocket(userId, (connectedUserId) => {
        isConnectedRef.current = true;
        if (onConnect) {
          onConnect(connectedUserId);
        }
      });
    }
  }, [userId, onConnect]);

  const disconnect = useCallback(() => {
    if (isConnectedRef.current) {
      disconnectWebSocket();
      isConnectedRef.current = false;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (isConnectedRef.current) {
      sendWebSocketMessage(message);
    }
  }, []);

  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: isConnectedRef.current
  };
};
