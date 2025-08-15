"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  sendWebSocketMessage, 
  isWebSocketConnected,
  getWebSocketConnectionState 
} from '../api/wss';

interface WebSocketMessage {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  read?: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  messages: WebSocketMessage[];
  unreadCount: number;
  sendMessage: (message: any) => void;
  markMessageAsRead: (messageId: string) => void;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  // Tính số tin nhắn chưa đọc
  const unreadCount = messages.filter(msg => !msg.read).length;

  // Function để kết nối WebSocket
  const connect = () => {
    if (user?.id && isLoggedIn) {
      console.log('🚀 Initiating WebSocket connection for user:', user.id);
      connectWebSocket(
        user.id, 
        (userId) => {
          console.log('🎉 WebSocket connected successfully for user:', userId);
          setIsConnected(true);
          setConnectionState('CONNECTED');
        },
        handleIncomingMessage
      );
    } else {
      console.warn('⚠️ Cannot connect WebSocket: missing user ID or not logged in');
    }
  };

  // Function để ngắt kết nối WebSocket
  const disconnect = () => {
    disconnectWebSocket();
    setIsConnected(false);
    setConnectionState('DISCONNECTED');
  };

  // Function để gửi tin nhắn
  const sendMessage = (message: any) => {
    if (isConnected) {
      const messageToSend = {
        ...message,
        userId: user?.id,
        timestamp: new Date().toISOString()
      };
      sendWebSocketMessage(messageToSend);
    } else {
      console.warn('WebSocket is not connected. Simulating message for testing...');
      // Nếu không kết nối WebSocket, simulate message để test
      handleIncomingMessage({
        ...message,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function để đánh dấu tin nhắn đã đọc
  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  // Function để xóa tất cả tin nhắn
  const clearMessages = () => {
    setMessages([]);
  };

  // Xử lý tin nhắn nhận được
  const handleIncomingMessage = (data: any) => {
    const newMessage: WebSocketMessage = {
      id: data.id || `msg_${Date.now()}_${Math.random()}`,
      type: data.type || 'unknown',
      data: data,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, newMessage]);

    // Xử lý các loại tin nhắn khác nhau
    switch (data.type) {
      case 'booking_notification':
        console.log('🎫 Thông báo đặt vé mới:', data.data);
        // Trigger browser notification nếu được phép
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Đặt vé mới!', {
            body: `Có đơn đặt vé mới từ ${data.data?.customerName || 'khách hàng'}`,
            icon: '/favicon.ico'
          });
        }
        break;
      
      case 'order_update':
        console.log('📦 Cập nhật đơn hàng:', data);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Cập nhật đơn hàng', {
            body: `Đơn hàng #${data?.orderId || 'N/A'} đã được cập nhật`,
            icon: '/favicon.ico'
          });
        }
        break;
      
      case 'system_message':
        console.log('🔔 Tin nhắn hệ thống:', data.message);
        break;
      
      case 'chat_message':
        console.log('💬 Tin nhắn chat:', data.message);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Tin nhắn mới', {
            body: data.message || 'Bạn có tin nhắn mới',
            icon: '/favicon.ico'
          });
        }
        break;
      
      default:
        console.log('📨 Tin nhắn mới:', data);
    }
  };

  // Effect để quản lý kết nối WebSocket
  useEffect(() => {
    console.log('🔌 WebSocket Effect triggered:', { isLoggedIn, userId: user?.id });
    
    if (isLoggedIn && user?.id) {
      console.log('✅ User logged in - Connecting to WebSocket with userId:', user.id);
      // Kết nối khi user đăng nhập
      connect();
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      console.log('❌ User logged out or no userId - Disconnecting WebSocket');
      // Ngắt kết nối khi user đăng xuất
      disconnect();
      setMessages([]); // Clear messages khi đăng xuất
    }

    return () => {
      disconnect();
    };
  }, [isLoggedIn, user?.id]);

  // Effect để cập nhật trạng thái kết nối
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = getWebSocketConnectionState();
      const connected = isWebSocketConnected();
      setConnectionState(currentState);
      setIsConnected(connected);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    messages,
    unreadCount,
    sendMessage,
    markMessageAsRead,
    clearMessages,
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Hook để sử dụng các helper functions
export function useWebSocketHelpers() {
  const { sendMessage } = useWebSocket();

  const sendBookingNotification = (bookingData: any) => {
    sendMessage({
      type: 'notification',
      data: bookingData
    });
  };

  const sendOrderUpdate = (orderId: string, status: string, details?: any) => {
    sendMessage({
      type: 'order_update',
      orderId,
      status,
      details
    });
  };

  const sendChatMessage = (message: string, recipientId?: string) => {
    sendMessage({
      type: 'chat_message',
      message,
      recipientId
    });
  };

  return {
    sendBookingNotification,
    sendOrderUpdate,
    sendChatMessage
  };
}
