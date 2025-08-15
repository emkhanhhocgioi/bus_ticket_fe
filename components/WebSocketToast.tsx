"use client";

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Toast } from '@/components/ui/toast';

interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  isVisible: boolean;
}

export function WebSocketToast() {
  const { messages } = useWebSocket();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hàm để xác định loại toast dựa trên type của message
  const getToastType = (messageType: string): "success" | "error" | "warning" | "info" => {
    switch (messageType) {
      case 'booking_notification':
        return 'success';
      case 'order_update':
        return 'info';
      case 'system_message':
        return 'warning';
      case 'error':
        return 'error';
      case 'chat_message':
        return 'info';
      default:
        return 'info';
    }
  };

  // Hàm để tạo title từ message type
  const getToastTitle = (messageType: string, data: any): string => {
    switch (messageType) {
      case 'booking_notification':
        return 'Đặt vé mới!';
      case 'order_update':
        return 'Cập nhật đơn hàng';
      case 'system_message':
        return 'Thông báo hệ thống';
      case 'error':
        return 'Lỗi';
      case 'chat_message':
        return 'Tin nhắn mới';
      default:
        return 'Thông báo';
    }
  };

  // Hàm để tạo message content từ data
  const getToastMessage = (messageType: string, data: any): string => {
    switch (messageType) {
      case 'booking_notification':
        return `Có đơn đặt vé mới từ ${data?.data?.customerName || 'khách hàng'}`;
      case 'order_update':
        return `Đơn hàng #${data?.orderId || 'N/A'} đã được cập nhật: ${data?.status || 'Unknown'}`;
      case 'system_message':
        return data?.message || 'Có thông báo mới từ hệ thống';
      case 'error':
        return data?.message || 'Đã xảy ra lỗi';
      case 'chat_message':
        return data?.message || 'Bạn có tin nhắn mới';
      default:
        return data?.message || 'Bạn có thông báo mới';
    }
  };

  // Effect để theo dõi messages mới và tạo toast
  useEffect(() => {
    // Lấy message mới nhất chưa được hiển thị dưới dạng toast
    const newMessages = messages.filter(msg => !msg.read);
    
    if (newMessages.length > 0) {
      // Chỉ tạo toast cho message mới nhất
      const latestMessage = newMessages[newMessages.length - 1];
      
      // Kiểm tra xem toast này đã được tạo chưa
      const existingToast = toasts.find(toast => toast.id === latestMessage.id);
      
      if (!existingToast) {
        const newToast: ToastMessage = {
          id: latestMessage.id,
          type: getToastType(latestMessage.type),
          title: getToastTitle(latestMessage.type, latestMessage.data),
          message: getToastMessage(latestMessage.type, latestMessage.data),
          isVisible: true
        };

        setToasts(prev => {
          // Giới hạn số lượng toast hiển thị cùng lúc (tối đa 3)
          const newToasts = [...prev, newToast];
          return newToasts.slice(-3);
        });
      }
    }
  }, [messages]); // Chỉ theo dõi messages thay đổi

  // Hàm để đóng toast
  const closeToast = (toastId: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === toastId ? { ...toast, isVisible: false } : toast
      )
    );

    // Xóa toast sau khi animation hoàn thành
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 300);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className={`${toast.isVisible ? 'toast-enter' : 'toast-exit'}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={() => closeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
