"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markNotificationAsRead, deleteNotification, Notification } from '@/api/notification';
import { Button } from '@/components/ui/button';

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(user.id);
      setNotifications(response.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Cập nhật local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      // Xóa khỏi local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để xem thông báo.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Có lỗi xảy ra</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchNotifications}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <Button 
            onClick={fetchNotifications}
            variant="outline"
            size="sm"
          >
            Làm mới
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-semibold mb-2">Không có thông báo nào</h2>
            <p className="text-gray-600">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification._id}
                className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                  notification.isRead 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className={`text-base ${
                      notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        onClick={() => handleMarkAsRead(notification._id)}
                        variant="outline"
                        size="sm"
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleDelete(notification._id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Tổng cộng: {notifications.length} thông báo
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 text-blue-600">
                  ({notifications.filter(n => !n.isRead).length} chưa đọc)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}