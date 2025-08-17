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

// Gửi tin nhắn hỗ trợ
export const sendSupportMessage = (toId: string, content: string, fromId?: string, ticketId?: string) => {
  sendWebSocketMessage({
    type: 'support_message',
    data: {
      fromId: fromId,
      toId: toId,
      content: content,
      ticketId: ticketId
    },
    timestamp: new Date().toISOString()
  });
};

// Đóng ticket hỗ trợ
export const closeTicket = (ticketId: string, fromId: string, toId?: string) => {
  sendWebSocketMessage({
    type: 'close_ticket',
    data: {
      ticketId: ticketId,
      fromId: fromId,
      toId: toId
    },
    timestamp: new Date().toISOString()
  });
};

export const getSupportMessage = (userId: string) => {
  sendWebSocketMessage({
    type: 'get_support_message',
    data: {
      userId: userId
    },
    timestamp: new Date().toISOString()
  });
};

export const createSupportMessage = (toId: string, content: string, fromId?: string) => {
  sendWebSocketMessage({
    type: 'create_support_ticket',
    data: {
      fromId: fromId,
      toId: toId,
      content: content
    },
    timestamp: new Date().toISOString()
  });
};

// Gửi phản hồi tin nhắn hỗ trợ
export const sendSupportReply = (customerId: string, content: string, partnerId: string) => {
  sendWebSocketMessage({
    type: 'support_message',
    data: {
      fromId: partnerId,
      toId: customerId,
      content: content,
      isReply: true
    },
    timestamp: new Date().toISOString()
  });
};

// Ngắt kết nối
export const disconnectFromWebSocket = () => {
  disconnectWebSocket();
};

