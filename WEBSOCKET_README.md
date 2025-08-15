# WebSocket Integration Documentation

## 🚀 Overview

The WebSocket system is now fully integrated throughout the entire app. It automatically connects when a user logs in and disconnects when they log out.

## 📁 Files Structure

```
api/
  └── wss.tsx                    # WebSocket manager with connection logic
context/
  └── WebSocketContext.tsx       # React context for WebSocket state
  └── AuthContext.tsx           # Authentication context (existing)
components/
  └── WebSocketStatus.tsx       # Status indicator and debug panel
  └── WebSocketExample.tsx      # Example usage component
utils/
  └── websocketHelpers.tsx      # Helper functions
hooks/
  └── useWebSocket.tsx          # React hook (optional alternative)
app/
  └── layout.tsx               # Root layout with providers
```

## 🔧 How It Works

1. **Automatic Connection**: When user logs in, WebSocket automatically connects to `WSS_URL` from env
2. **User ID Integration**: Uses `user.id` from AuthContext as the WebSocket identifier
3. **Message Handling**: All incoming messages are captured and stored in context
4. **Notifications**: Browser notifications for important messages (booking updates, etc.)
5. **Reconnection**: Automatic reconnection with exponential backoff

## 💻 Usage Examples

### 1. Using the Context Hook (Recommended)

```tsx
import { useWebSocket, useWebSocketHelpers } from '@/context/WebSocketContext';

const MyComponent = () => {
  const { isConnected, messages, unreadCount } = useWebSocket();
  const { sendBookingNotification } = useWebSocketHelpers();

  const handleNewBooking = () => {
    sendBookingNotification({
      customerName: 'John Doe',
      route: 'Hà Nội - TP.HCM',
      seats: ['A1', 'A2'],
      totalAmount: 500000
    });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Unread messages: {unreadCount}</p>
      <button onClick={handleNewBooking}>Send Booking</button>
    </div>
  );
};
```

### 2. Available Helper Functions

```tsx
const { 
  sendBookingNotification,    // Send booking notifications
  sendOrderUpdate,           // Send order status updates  
  sendChatMessage           // Send chat messages
} = useWebSocketHelpers();

// Examples:
sendBookingNotification(bookingData);
sendOrderUpdate('ORDER123', 'confirmed', { driver: 'John' });
sendChatMessage('Hello!', 'recipientId');
```

### 3. Custom Messages

```tsx
const { sendMessage } = useWebSocket();

sendMessage({
  type: 'custom_event',
  action: 'page_view',
  data: { page: '/dashboard' }
});
```

## 🎯 Message Types

The system handles these message types:

- `booking_notification` - New booking alerts
- `order_update` - Order status changes
- `chat_message` - Chat/messaging
- `system_message` - System announcements
- `custom_event` - Custom application events

## 🔔 WebSocket Status Component

A floating status indicator appears in the bottom-right corner when logged in:

- **🟢 Green**: Connected
- **🟡 Yellow**: Connecting
- **🔴 Red**: Disconnected
- **Badge**: Shows unread message count

Click the indicator to:
- View connection details
- See recent messages
- Send test messages
- Debug connection issues

## ⚙️ Environment Variables

```env
# Server-side WebSocket URL
WSS_URL=ws://localhost:3002

# Client-side WebSocket URL (for Next.js)
NEXT_PUBLIC_WSS_URL=ws://localhost:3002
```

## 🔄 Auto-Connection Flow

1. User logs in → `AuthContext` updates
2. `WebSocketProvider` detects login → Connects to WebSocket
3. Connection established → `onConnect(userId)` called
4. Messages received → Added to `messages` array
5. User logs out → WebSocket disconnects automatically

## 🐛 Debugging

1. **Check the floating status indicator** - Shows real-time connection state
2. **Browser console** - All WebSocket events are logged
3. **Test messages** - Use the status panel to send test messages
4. **Network tab** - Check WebSocket connection in browser dev tools

## 📱 Browser Notifications

The system requests notification permission and shows browser notifications for:
- New booking notifications
- Important order updates
- System messages

## 🔒 Security Notes

- User ID is automatically included in all outgoing messages
- WebSocket URL includes user ID as query parameter
- Messages are JSON formatted with timestamp
- Auto-reconnection with exponential backoff prevents spam

## 🎨 Integration with Existing Components

The WebSocket context is available throughout the app. Any component can:

```tsx
// Check connection status
const { isConnected } = useWebSocket();

// Listen for specific message types
useEffect(() => {
  const bookingMessages = messages.filter(m => m.type === 'booking_notification');
  // Handle booking messages...
}, [messages]);

// Send application-specific messages
const { sendBookingNotification } = useWebSocketHelpers();
```

The WebSocket system is now ready to use throughout your car booking application! 🚗💨
