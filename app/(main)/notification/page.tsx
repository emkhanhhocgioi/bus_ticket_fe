"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import NavigationBar from '@/components/navigation/navigationbar';
import { getNotifications, markNotificationAsRead, deleteNotification, Notification } from '@/api/notification';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check, RefreshCw, Filter, Clock, Mail, MailOpen } from 'lucide-react';

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 500); // Small delay for better UX
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Cập nhật local state với animation
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
      // Xóa khỏi local state với animation
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      try {
        await markNotificationAsRead(notification._id);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInHours < 48) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: diffInHours > 8760 ? 'numeric' : undefined
      });
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationBar currentPage="notification" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vui lòng đăng nhập</h1>
            <p className="text-gray-600">Bạn cần đăng nhập để xem thông báo.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationBar currentPage="notification" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải thông báo</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationBar currentPage="notification" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Có lỗi xảy ra</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={fetchNotifications}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar currentPage="notification" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông báo</h1>
                  <p className="text-gray-600">
                    {notifications.length > 0 && (
                      <>
                        {notifications.length} thông báo
                        {unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {unreadCount} chưa đọc
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    onClick={markAllAsRead}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
                
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 mt-6 p-1 bg-gray-100 rounded-lg w-fit">
              {[
                { key: 'all', label: 'Tất cả', count: notifications.length },
                { key: 'unread', label: 'Chưa đọc', count: unreadCount },
                { key: 'read', label: 'Đã đọc', count: notifications.length - unreadCount }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    filter === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {filter === 'unread' ? (
                  <MailOpen className="w-10 h-10 text-gray-400" />
                ) : filter === 'read' ? (
                  <Mail className="w-10 h-10 text-gray-400" />
                ) : (
                  <Bell className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' 
                  ? 'Không có thông báo chưa đọc' 
                  : filter === 'read'
                  ? 'Không có thông báo đã đọc'
                  : 'Không có thông báo nào'
                }
              </h2>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'Tất cả thông báo đã được đọc.' 
                  : filter === 'read'
                  ? 'Bạn chưa đọc thông báo nào.'
                  : 'Bạn chưa có thông báo nào.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={notification._id}
                  className={`group bg-white border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    notification.isRead 
                      ? 'border-gray-200' 
                      : 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="flex-shrink-0 mt-1">
                        {notification.isRead ? (
                          <MailOpen className="w-5 h-5 text-gray-400" />
                        ) : (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Mới
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-base leading-relaxed ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900 font-medium'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.isRead && (
                          <Button
                            onClick={() => handleMarkAsRead(notification._id)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleDelete(notification._id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}