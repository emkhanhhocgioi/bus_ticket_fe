type OnConnectCallback = (userId: string) => void;
type OnMessageCallback = (data: any) => void;

interface WebSocketConnection {
  ws: WebSocket | null;
  connect: (userId: string, onConnect?: OnConnectCallback, onMessage?: OnMessageCallback) => void;
  disconnect: () => void;
  send: (message: any) => void;
  isConnected: () => boolean;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private onConnectCallback: OnConnectCallback | null = null;
  private onMessageCallback: OnMessageCallback | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, onConnect?: OnConnectCallback, onMessage?: OnMessageCallback): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket đã được kết nối');
      if (onConnect) onConnect(userId);
      return;
    }

    this.userId = userId;
    this.onConnectCallback = onConnect || null;
    this.onMessageCallback = onMessage || null;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WSS_URL || process.env.WSS_URL || 'ws://localhost:3002';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket kết nối thành công', { userId });
        this.reconnectAttempts = 0;
        
        // Gửi thông tin userId khi kết nối
        this.send({
          type: 'init',
          id: userId,
          timestamp: new Date().toISOString()
        });

        if (this.onConnectCallback) {
          this.onConnectCallback(userId);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Nhận tin nhắn từ WebSocket:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Lỗi parse tin nhắn WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket đã đóng kết nối', { 
          code: event.code, 
          reason: event.reason,
          userId: this.userId 
        });
        this.ws = null;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
      };

    } catch (error) {
      console.error('Lỗi tạo WebSocket connection:', error);
    }
  }

  private handleMessage(data: any): void {
    // Gọi callback nếu có
    if (this.onMessageCallback) {
      this.onMessageCallback(data);
    }

    // Xử lý các loại tin nhắn khác nhau
    switch (data.type) {
      case 'notification':
        console.log('Nhận thông báo:', data.message);
        break;
      case 'booking_update':
        console.log('Cập nhật booking:', data);
        break;
      case 'system_message':
        console.log('Tin nhắn hệ thống:', data.message);
        break;
      default:
        console.log('Tin nhắn không xác định:', data);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`Thử kết nối lại lần ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId, this.onConnectCallback || undefined, this.onMessageCallback || undefined);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Đã vượt quá số lần thử kết nối lại');
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log('Đã gửi tin nhắn:', message);
      } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
      }
    } else {
      console.warn('WebSocket chưa kết nối, không thể gửi tin nhắn');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Đóng kết nối bởi client');
      this.ws = null;
    }
    this.userId = null;
    this.onConnectCallback = null;
    this.onMessageCallback = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Tạo instance singleton
const webSocketManager = new WebSocketManager();

// Export các function để sử dụng
export const connectWebSocket = (userId: string, onConnect?: OnConnectCallback, onMessage?: OnMessageCallback) => {
  webSocketManager.connect(userId, onConnect, onMessage);
};

export const disconnectWebSocket = () => {
  webSocketManager.disconnect();
};

export const sendWebSocketMessage = (message: any) => {
  webSocketManager.send(message);
};

export const isWebSocketConnected = () => {
  return webSocketManager.isConnected();
};

export const getWebSocketConnectionState = () => {
  return webSocketManager.getConnectionState();
};

export default webSocketManager;
