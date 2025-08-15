"use client"

import NavigationBar from "@/components/navigation/navigationbar"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Bell, CheckCircle, Clock, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "unread">("all")

  // Mock data cho demo - không lấy từ WebSocket
  const mockNotifications = [
    {
      id: "1",
      title: "Đặt vé thành công",
      message: "Bạn đã đặt vé thành công cho tuyến Hà Nội - TP.HCM",
      type: "success" as const,
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
    },
    {
      id: "2", 
      title: "Nhắc nhở chuyến đi",
      message: "Chuyến xe của bạn sẽ khởi hành trong 2 giờ nữa",
      type: "warning" as const,
      isRead: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    },
    {
      id: "3",
      title: "Khuyến mãi đặc biệt", 
      message: "Giảm 20% cho tất cả các chuyến xe dịp cuối tuần",
      type: "info" as const,
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
    },
  ]

  const unreadCount = mockNotifications.filter(notif => !notif.isRead).length

  const filteredNotifications = filter === "all" 
    ? mockNotifications 
    : mockNotifications.filter(notif => !notif.isRead)

  // Dummy functions for demo
  const markAsRead = (id: string) => {
    console.log("Mark as read:", id)
  }

  const markAllAsRead = () => {
    console.log("Mark all as read")
  }

  const deleteNotification = (id: string) => {
    console.log("Delete notification:", id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500"
      case "warning":
        return "border-l-yellow-500"
      case "error":
        return "border-l-red-500"
      default:
        return "border-l-blue-500"
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="notification" />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">Vui lòng đăng nhập để xem thông báo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="notification" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-l-lg transition-colors ${
                  filter === "all" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-r-lg transition-colors ${
                  filter === "unread" 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "Không có thông báo" : "Không có thông báo chưa đọc"}
              </h3>
              <p className="text-gray-500">
                {filter === "all" 
                  ? "Bạn chưa có thông báo nào" 
                  : "Tất cả thông báo đã được đọc"
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getTypeColor(notification.type)} 
                  ${!notification.isRead ? "bg-blue-50" : ""} 
                  hover:shadow-md transition-shadow`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {formatDate(notification.timestamp)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
