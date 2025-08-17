# Support Message Auto-Reload Feature

## Mô tả
Tính năng này tự động reload lại tất cả tin nhắn hỗ trợ khi có incoming support_message từ WebSocket, đảm bảo dữ liệu luôn được cập nhật real-time. Đã được cập nhật để hỗ trợ format message mới từ server backend.

## Server Message Format
Backend server gửi WebSocket message với format mới:
```javascript
{
  type: 'support_message',
  from: fromId,
  message: content,
  ticketId: ticketId,
  updatedContent: updatedTicket ? updatedTicket.content : null
}
```

Và confirmation message:
```javascript
{
  type: 'message_sent',
  ticketId: ticketId,
  message: 'Message sent successfully',
  updatedContent: updatedTicket ? updatedTicket.content : null
}
```

## Cách hoạt động

### 1. Khi có tin nhắn hỗ trợ mới
- WebSocket nhận được message với `type: 'support_message'`
- System trích xuất data từ format mới: `ticketId`, `message`, `from`, `updatedContent`
- Tự động gọi `loadSupportMessages()` để reload toàn bộ data từ API
- Debounce được áp dụng để tránh reload quá nhiều (tối đa 1 lần trong 2 giây)

### 2. Khi gửi tin nhắn thành công
- WebSocket nhận được message với `type: 'message_sent'`  
- System reload data sau 500ms delay để đảm bảo server đã xử lý xong

### 3. Files được cập nhật
- `app/(main)/message/page.tsx` - Trang tin nhắn cho người dùng
- `app/(partner)/Dashboard/support/page.tsx` - Trang hỗ trợ cho đối tác

### 4. Các thay đổi chính

#### Thêm debounce state
```tsx
const [lastReloadTime, setLastReloadTime] = useState(0);
```

#### Cập nhật logic xử lý support_message cho format mới
```tsx
// Handle regular support_message
if (wsMessage.type === 'support_message') {
  console.log('💬 New support message received:', wsMessage);
  
  // Extract message data from new server format
  const ticketId = wsMessage.ticketId;
  const content = wsMessage.message; // Server sends as 'message' not 'content'
  const fromId = wsMessage.from;
  const updatedContent = wsMessage.updatedContent;
  
  console.log(`Support message - ticketId: ${ticketId}, from: ${fromId}, message: ${content}`);
  
  // Debounce reload to avoid too many API calls (max 1 reload per 2 seconds)
  const now = Date.now();
  if (now - lastReloadTime > 2000) {
    setLastReloadTime(now);
    loadSupportMessages();
  } else {
    console.log('⏱️ Reload debounced - too soon since last reload');
  }

  // Show browser notification...
}

// Handle message_sent confirmation
if (wsMessage.type === 'message_sent') {
  console.log('✅ Message sent confirmation:', wsMessage);
  
  const ticketId = wsMessage.ticketId;
  const updatedContent = wsMessage.updatedContent;
  
  // Optionally reload messages to get the latest state
  if (ticketId && updatedContent) {
    console.log('📩 Message sent successfully, reloading messages...');
    setTimeout(() => {
      loadSupportMessages();
    }, 500); // Small delay to ensure server has processed
  }
}
```

## Lợi ích

### 1. Real-time Updates
- Tin nhắn mới được hiển thị ngay lập tức
- Không cần refresh trang để thấy tin nhắn mới
- Dữ liệu luôn đồng bộ với server
- Hỗ trợ format message mới từ server

### 2. Performance Optimization
- Debounce ngăn chặn việc gọi API quá nhiều
- Chỉ reload khi thực sự cần thiết
- Giảm tải cho server và client
- Delay reload sau khi gửi tin nhắn để đảm bảo server xử lý xong

### 3. User Experience
- Giao diện luôn cập nhật
- Không bỏ lỡ tin nhắn quan trọng
- Trải nghiệm mượt mà hơn
- Confirmation khi tin nhắn được gửi thành công

## Message Flow

### Server → Client (Incoming Message)
```
Backend: support_message sent
  ↓
WebSocket: {
  type: 'support_message',
  from: '12345',
  message: 'Hello, need help',
  ticketId: 'ticket123',
  updatedContent: [...]
}
  ↓
Frontend: Extract data & reload API
  ↓
UI: Updated with new messages
```

### Client → Server → Confirmation
```
Frontend: Send message via WebSocket
  ↓
Backend: Process & save to database
  ↓
WebSocket: {
  type: 'message_sent',
  ticketId: 'ticket123',
  message: 'Message sent successfully',
  updatedContent: [...]
}
  ↓
Frontend: Reload after 500ms delay
  ↓
UI: Shows sent message
```

## Testing

### Sử dụng test script
```javascript
// Load test script trong browser console
// File: test-support-reload.js

// Test tin nhắn đơn lẻ với format mới
const testMessage = {
  type: 'support_message',
  from: 'user123',
  message: 'Test message with new format',
  ticketId: 'ticket_test_123',
  updatedContent: ['Content array from server']
};

// Test confirmation message
const testConfirmation = {
  type: 'message_sent',
  ticketId: 'ticket_test_123',
  message: 'Message sent successfully',
  updatedContent: ['Updated content array']
};
```

### Kiểm tra logs
Khi có tin nhắn mới với format mới:
```
💬 New support message received: {type: 'support_message', from: '12345', ...}
Support message - ticketId: ticket123, from: 12345, message: Hello, need help
🔄 Loading support messages for user: [userId]
✅ Support messages loaded successfully: [count] tickets created
```

Khi gửi tin nhắn thành công:
```
✅ Message sent confirmation: {type: 'message_sent', ticketId: 'ticket123', ...}
📩 Message sent successfully, reloading messages...
🔄 Loading support messages for user: [userId]
```

### Kiểm tra debounce
Nếu có nhiều tin nhắn trong thời gian ngắn:
```
💬 New support message received, reloading all messages...
⏱️ Reload debounced - too soon since last reload
```

## Troubleshooting

### 1. Tin nhắn không reload
- Kiểm tra WebSocket connection
- Xem console có error không
- Đảm bảo server gửi đúng format message mới
- Kiểm tra `getAllSupportMessage` function hoạt động

### 2. Reload quá nhiều lần
- Kiểm tra debounce logic
- Xem có loop vô tận không
- Điều chỉnh thời gian debounce nếu cần

### 3. Không nhận được confirmation
- Kiểm tra server có gửi `message_sent` không
- Xem timeout 500ms có phù hợp không
- Kiểm tra `updatedContent` từ server

### 4. Format message cũ vẫn hoạt động
- System vẫn support backward compatibility
- Message cũ sẽ được xử lý bình thường
- Không cần thay đổi gì cho client cũ

## Cấu hình

### Thay đổi thời gian debounce
```tsx
// Thay đổi từ 2000ms sang giá trị khác
if (now - lastReloadTime > 5000) { // 5 giây
  // ...
}
```

### Thay đổi delay reload sau khi gửi
```tsx
// Thay đổi từ 500ms sang giá trị khác
setTimeout(() => {
  loadSupportMessages();
}, 1000); // 1 giây
```

### Bật/tắt auto-reload
```tsx
const [autoReloadEnabled, setAutoReloadEnabled] = useState(true);

// Trong handler
if (autoReloadEnabled && now - lastReloadTime > 2000) {
  setLastReloadTime(now);
  loadSupportMessages();
}
```

## API Dependencies

Tính năng này phụ thuộc vào:
- `getAllSupportMessage()` từ `@/api/message`
- WebSocket connection từ `useWebSocket()`
- Auth context từ `useAuth()`
- Server backend hỗ trợ format message mới

## Server Backend Requirements

Server cần gửi message với format:
- `type: 'support_message'` cho tin nhắn mới
- `type: 'message_sent'` cho confirmation
- `from`: ID người gửi
- `message`: Nội dung tin nhắn
- `ticketId`: ID của ticket
- `updatedContent`: Array content đã cập nhật

## Browser Support

Hoạt động trên tất cả browsers hiện đại hỗ trợ:
- WebSocket API
- React Hooks
- Modern JavaScript (ES6+)
- Notification API (tùy chọn)
