# 🔌 WebSocket Auto-Connection Guide

## ✅ **System đã được cấu hình để tự động kết nối WebSocket khi đăng nhập!**

### 🔄 **Flow hoạt động:**

1. **User đăng nhập** → `AuthContext` được cập nhật
2. **WebSocketContext** nhận biết sự thay đổi → Tự động kết nối
3. **WebSocket kết nối** → Sẵn sàng nhận/gửi tin nhắn real-time

### 📍 **Các điểm kết nối đã được tích hợp:**

#### 1. **Login Page** (`app/(auth)/login/page.tsx`)
```tsx
// ✅ Đã cập nhật để sử dụng AuthContext
const { login: authLogin } = useAuth();

// Khi login thành công:
authLogin(userData, token); // WebSocket sẽ tự động connect
```

#### 2. **Login Dialog** (`components/Dialog/LoginDialog.tsx`)
```tsx
// ✅ Đã có sẵn tích hợp AuthContext
authLogin(userWithRole, response.token); // WebSocket auto-connect
```

#### 3. **WebSocket Context** (`context/WebSocketContext.tsx`)
```tsx
// ✅ Tự động kết nối khi login state thay đổi
useEffect(() => {
  if (isLoggedIn && user?.id) {
    connect(); // 🚀 Auto-connect
  } else {
    disconnect(); // 🔌 Auto-disconnect
  }
}, [isLoggedIn, user?.id]);
```

### 🎯 **Cách test:**

1. **Mở browser console** (F12)
2. **Đăng nhập** vào ứng dụng
3. **Xem console logs:**
   ```
   🔌 WebSocket Effect triggered: { isLoggedIn: true, userId: "user123" }
   ✅ User logged in - Connecting to WebSocket with userId: user123
   🚀 Initiating WebSocket connection for user: user123
   🎉 WebSocket connected successfully for user: user123
   ```

4. **Kiểm tra visual indicators:**
   - **Connection Status** (top-right corner khi logged in)
   - **WebSocket Status** floating button (bottom-right)

### 🔍 **Debug indicators:**

#### **Connection Status Component** (Xuất hiện khi đã login)
- 🟢 **Green dot**: Connected
- 🔴 **Red dot**: Disconnected
- Hiển thị User ID và connection state

#### **WebSocket Status Button** (Bottom-right corner)
- 🟢 Connected
- 🟡 Connecting
- 🔴 Disconnected
- Badge hiển thị số tin nhắn chưa đọc

### 📨 **Test gửi tin nhắn:**

```tsx
// Trong bất kỳ component nào:
import { useWebSocketHelpers } from '@/context/WebSocketContext';

const { sendBookingNotification } = useWebSocketHelpers();

sendBookingNotification({
  customerName: 'Test User',
  route: 'Hà Nội - TP.HCM',
  bookingId: 'BK123'
});
```

### 🔧 **Environment Variables cần thiết:**

```env
# Server WebSocket URL
WSS_URL=ws://localhost:3002

# Client WebSocket URL
NEXT_PUBLIC_WSS_URL=ws://localhost:3002
```

### ⚡ **Features đã hoạt động:**

- ✅ Auto-connect khi login
- ✅ Auto-disconnect khi logout
- ✅ Real-time message handling
- ✅ Browser notifications
- ✅ Auto-reconnection
- ✅ Visual status indicators
- ✅ Debug panel với test functions

### 🎯 **Kết luận:**

**WebSocket đã được tích hợp hoàn toàn vào app!** 

Chỉ cần:
1. Đăng nhập → WebSocket tự động kết nối
2. Đăng xuất → WebSocket tự động ngắt kết nối
3. Sử dụng hooks để gửi/nhận tin nhắn từ bất kỳ component nào

**Ready to use! 🚀**
