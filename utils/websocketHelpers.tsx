import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage } from '../api/wss';

// Cách sử dụng đơn giản nhất
export const simpleWebSocketConnect = (userId: string, onConnect?: (userId: string) => void) => {
  connectWebSocket(userId, onConnect);
};

// Gửi thông báo đặt vé
export const sendBookingNotification = (bookingData: any) => {
  sendWebSocketMessage({
    type: 'create_notification',
    data: bookingData,
    timestamp: new Date().toISOString()
  });
};

// Gửi cập nhật trạng thái đơn hàng
export const sendOrderUpdate = (orderId: string, status: string, details?: any) => {
  sendWebSocketMessage({
    type: 'order_update',
    orderId,
    status,
    details,
    timestamp: new Date().toISOString()
  });
};

// Gửi tin nhắn chat
export const sendChatMessage = (message: string, recipientId?: string) => {
  sendWebSocketMessage({
    type: 'chat_message',
    message,
    recipientId,
    timestamp: new Date().toISOString()
  });
};

// Ngắt kết nối
export const disconnectFromWebSocket = () => {
  disconnectWebSocket();
};

