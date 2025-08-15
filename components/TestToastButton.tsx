"use client";

import React from 'react';
import { useWebSocket } from '@/context/WebSocketContext';

export function TestToastButton() {
  const { sendMessage, isConnected } = useWebSocket();

  const testMessages = [
    {
      type: 'booking_notification',
      data: { customerName: 'Nguyễn Văn A' },
      message: 'Có đơn đặt vé mới'
    },
    {
      type: 'order_update',
      orderId: 'ORD123',
      status: 'confirmed',
      message: 'Đơn hàng đã được xác nhận'
    },
    {
      type: 'system_message',
      message: 'Hệ thống sẽ bảo trì từ 2:00 AM đến 4:00 AM'
    },
    {
      type: 'chat_message',
      message: 'Xin chào! Bạn có cần hỗ trợ không?'
    },
    {
      type: 'error',
      message: 'Lỗi kết nối đến server thanh toán'
    }
  ];

  const sendTestMessage = (messageIndex: number) => {
    if (!isConnected) {
      console.warn('WebSocket chưa kết nối');
      return;
    }

    const testMessage = testMessages[messageIndex];
    sendMessage({
      ...testMessage,
      id: `test_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString()
    });
  };

  const sendRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * testMessages.length);
    sendTestMessage(randomIndex);
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800">WebSocket chưa kết nối. Vui lòng đăng nhập để test toast.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-2">
      <h3 className="font-bold text-lg">Test Toast Messages</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => sendTestMessage(0)}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Booking Notification
        </button>
        <button
          onClick={() => sendTestMessage(1)}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Order Update
        </button>
        <button
          onClick={() => sendTestMessage(2)}
          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          System Message
        </button>
        <button
          onClick={() => sendTestMessage(3)}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Chat Message
        </button>
        <button
          onClick={() => sendTestMessage(4)}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Message
        </button>
        <button
          onClick={sendRandomMessage}
          className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Random Message
        </button>
      </div>
    </div>
  );
}
