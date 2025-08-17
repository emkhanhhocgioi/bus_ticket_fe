const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";

// Interface cho notification
export interface Notification {
  _id: string;
  userId: string;
  fromId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  __v?: number;
}

// Interface cho response
export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page?: number;
  limit?: number;
}

// Lấy danh sách thông báo của user
export const getNotifications = async (userId: string): Promise<NotificationResponse> => {
  try {
    const response = await fetch(`${API_URL}/notifications/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched notifications:', data);
    
    // Handle case where API returns array directly
    if (Array.isArray(data)) {
      return {
        notifications: data,
        total: data.length
      };
    }
    
    // Handle case where API returns object with notifications property
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get notifications');
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await fetch(`${API_URL}/notifications/read/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to mark notification as read');
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete notification');
  }
};

// Hook để sử dụng notification API (tùy chọn)
export const useNotificationAPI = () => {
  return {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
  };
};
