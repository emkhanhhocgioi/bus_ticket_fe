"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import NavigationBar from "@/components/navigation/navigationbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAllSupportMessage } from "@/api/message";
import { sendSupportMessage, closeTicket } from "@/utils/websocketHelpers";

interface SupportMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
  isFromPartner: boolean;
  customerName?: string;
  status: 'unread' | 'read' | 'replied';
}

interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastActivity: string;
  messages: SupportMessage[];
  unreadCount: number;
}

export default function SupportPage() {
  const { user, token } = useAuth();
  const { sendMessage, messages: wsMessages, isConnected } = useWebSocket();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastReloadTime, setLastReloadTime] = useState(0); // Add debounce for reload
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load support messages from API
  const loadSupportMessages = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('🔄 Loading support messages for user:', user.id);
      const response = await getAllSupportMessage(user.id);
      
      if (response && Array.isArray(response)) {
        // Each API message becomes a separate ticket
        const apiTickets: SupportTicket[] = [];
        
        response.forEach((apiMessage: any) => {
          const senderId = apiMessage.sender;
          const receiverId = apiMessage.receiver;
          const isFromPartner = receiverId !== user.id; // If receiver is not current user, then it's from partner
          const customerId = isFromPartner ? receiverId : senderId;
          
          // Extract customer name and subject from first content item
          const contentArray = Array.isArray(apiMessage.content) ? apiMessage.content : [apiMessage.content];
          const firstContent = contentArray[0] || "";
          let customerName = `Customer ${customerId}`;
          let subject = "Support Request";
          
          // Try to extract name and order info from first content (e.g., "Vừa tạo 1 ticket cho Lê Vinh Khánh")
          const ticketMatch = firstContent.match(/Vừa tạo 1 ticket cho (.+?) -/);
          if (ticketMatch) {
            customerName = ticketMatch[1].trim();
            // Extract order info if available
            const orderMatch = firstContent.match(/- (.+)/);
            if (orderMatch) {
              subject = orderMatch[1].trim();
            }
          } else {
            subject = firstContent?.substring(0, 50) + "..." || "Support Request";
          }
          
          // Create messages for each content item
          const messages: SupportMessage[] = [];
          contentArray.forEach((content: string, index: number) => {
            if (!content || content.trim() === "") return;
            
            // Determine if this is a system message or user message
            let messageFromId = apiMessage.sender;
            let messageToId = apiMessage.receiver;
            let messageIsFromPartner = isFromPartner;
            
            // Check if content contains user ID prefix (e.g., "687fa3869ae89b39c1f6f5d3: hello")
            const userMessageMatch = content.match(/^([a-f0-9]{24}):\s*(.+)$/);
            if (userMessageMatch) {
              const userId = userMessageMatch[1];
              const messageContent = userMessageMatch[2];
              messageFromId = userId;
              messageToId = userId === customerId ? (user?.id || "") : customerId;
              messageIsFromPartner = userId !== customerId;
              content = messageContent;
            }
            
            const message: SupportMessage = {
              id: `${apiMessage._id}_${index}`,
              fromId: messageFromId,
              toId: messageToId,
              content: content.trim(),
              timestamp: apiMessage.createdAt,
              isFromPartner: messageIsFromPartner,
              customerName: customerName,
              status: apiMessage.read ? 'read' : 'unread'
            };
            
            messages.push(message);
          });
          
          // Create ticket for this message
          const ticket: SupportTicket = {
            id: apiMessage._id, // Use the message _id as ticket ID
            customerId: customerId,
            customerName: customerName,
            customerEmail: undefined,
            customerPhone: undefined,
            subject: subject,
            status: 'open',
            priority: 'medium',
            createdAt: apiMessage.createdAt,
            lastActivity: apiMessage.updatedAt || apiMessage.createdAt,
            messages: messages,
            unreadCount: !apiMessage.read && !isFromPartner ? messages.filter(m => !m.isFromPartner).length : 0
          };
          
          apiTickets.push(ticket);
        });
        
        // Sort tickets by last activity (newest first)
        const sortedTickets = apiTickets.sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
        
        setTickets(sortedTickets);
        console.log('✅ Support messages loaded successfully:', sortedTickets.length, 'tickets created');
      } else {
        console.log('📭 No support messages found');
        setTickets([]);
      }
    } catch (error) {
      console.error('❌ Error loading support messages:', error);
      // Keep mock data on error for development
      const mockTickets: SupportTicket[] = [
        {
          id: "ticket_001",
          customerId: "user_123",
          customerName: "Nguyễn Văn A",
          customerEmail: "nguyenvana@email.com",
          customerPhone: "0901234567",
          subject: "Vấn đề thanh toán vé xe",
          status: "open",
          priority: "high",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          messages: [
            {
              id: "msg_001",
              fromId: "user_123",
              toId: user?.id || "",
              content: "Tôi đã thanh toán vé xe nhưng chưa nhận được xác nhận. Mã đơn hàng là #BK123456. Có thể kiểm tra giúp tôi không?",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isFromPartner: false,
              customerName: "Nguyễn Văn A",
              status: "unread"
            }
          ],
          unreadCount: 1
        }
      ];
      setTickets(mockTickets);
    } finally {
      setLoading(false);
    }
  };

  // Load support messages on component mount
  useEffect(() => {
    if (user?.id) {
      loadSupportMessages();
    }
  }, [user?.id]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleSupportMessage = (wsMessage: any) => {
      // Handle create_support_ticket messages - reload all support messages
      if (wsMessage.type === 'create_support_ticket') {
        console.log('🎫 New support ticket created, reloading messages...');
        loadSupportMessages();
        return;
      }

      // Handle ticket_closed messages
      if (wsMessage.type === 'ticket_closed' || wsMessage.type === 'ticket_closed_by_other') {
        console.log('🔒 Ticket closed:', wsMessage);
        const { ticketId } = wsMessage;
        
        // Update ticket status to closed
        setTickets(prevTickets =>
          prevTickets.map(ticket =>
            ticket.id === ticketId
              ? { ...ticket, status: 'closed' as const }
              : ticket
          )
        );

        // Update selected ticket if it's the closed one
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev =>
            prev ? { ...prev, status: 'closed' as const } : null
          );
        }

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const message = wsMessage.type === 'ticket_closed' 
            ? 'Ticket đã được đóng thành công'
            : 'Ticket đã được đóng bởi người khác';
          
          new Notification('Ticket Closed', {
            body: message,
            icon: '/favicon.ico'
          });
        }
        return;
      }

      // Handle ticket close error
      if (wsMessage.type === 'ticket_close_error') {
        console.error('❌ Error closing ticket:', wsMessage);
        
        // Show error notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Lỗi đóng ticket', {
            body: wsMessage.error || 'Không thể đóng ticket',
            icon: '/favicon.ico'
          });
        }
        return;
      }

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

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const customerName = fromId ? `Khách hàng ${fromId.substring(0, 8)}` : 'khách hàng';
          
          new Notification('Tin nhắn hỗ trợ mới', {
            body: `${customerName}: ${content?.substring(0, 100) || 'Tin nhắn mới'}`,
            icon: '/favicon.ico'
          });
        }
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
    };

    // Listen to all WebSocket messages and filter support messages
    wsMessages.forEach(handleSupportMessage);
  }, [wsMessages, user?.id]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  // Send reply message
  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      fromId: user?.id || "",
      toId: selectedTicket.customerId,
      content: replyMessage.trim(),
      timestamp: new Date().toISOString(),
      isFromPartner: true,
      status: 'read'
    };

    // Update local state
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [...ticket.messages, newMessage],
              lastActivity: newMessage.timestamp,
              status: 'in_progress'
            }
          : ticket
      )
    );

    // Update selected ticket
    setSelectedTicket(prev =>
      prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastActivity: newMessage.timestamp,
        status: 'in_progress'
      } : null
    );

    // Send via WebSocket using sendSupportMessage helper
    sendSupportMessage(
      selectedTicket.customerId, // toId (customer ID)
      replyMessage.trim(), // content
      user?.id, // fromId (partner ID)
      selectedTicket.id // ticketId
    );

    setReplyMessage("");
  };

  // Mark messages as read when ticket is selected
  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    
    // Mark all messages as read
    setTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticket.id
          ? {
              ...t,
              messages: t.messages.map(msg => ({ ...msg, status: 'read' as const })),
              unreadCount: 0
            }
          : t
      )
    );
  };

  // Update ticket status
  const handleUpdateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Close ticket
  const handleCloseTicket = (ticket: SupportTicket) => {
    if (!user?.id) return;

    const confirmClose = window.confirm(
      `Bạn có chắc chắn muốn đóng ticket "${ticket.subject}"?\nViệc này không thể hoàn tác.`
    );

    if (confirmClose) {
      console.log('🔒 Closing ticket:', ticket.id);
      
      // Send close ticket message via WebSocket
      closeTicket(ticket.id, user.id, ticket.customerId);
      
      // Update local state immediately for better UX
      setTickets(prevTickets =>
        prevTickets.map(t =>
          t.id === ticket.id
            ? { ...t, status: 'closed' as const }
            : t
        )
      );

      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(prev =>
          prev ? { ...prev, status: 'closed' as const } : null
        );
      }
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    const matchesSearch = searchQuery === "" || 
      ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Get status badge color
  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const totalUnreadCount = tickets.reduce((sum, ticket) => sum + ticket.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="dashboard" />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hỗ trợ khách hàng</h1>
                <p className="text-gray-600 mt-1">
                  Quản lý và trả lời tin nhắn hỗ trợ từ khách hàng
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>{isConnected ? 'Kết nối' : 'Ngắt kết nối'}</span>
                </div>
                {totalUnreadCount > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {totalUnreadCount} tin nhắn chưa đọc
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Tickets List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border flex flex-col">
              {/* Filters */}
              <div className="p-4 border-b space-y-3">
                <Input
                  placeholder="Tìm kiếm ticket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm flex-1"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="open">Mở</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm flex-1"
                  >
                    <option value="all">Tất cả độ ưu tiên</option>
                    <option value="urgent">Khẩn cấp</option>
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải tin nhắn hỗ trợ...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L5 15a8.001 8.001 0 000-2l-.5 1.5a8.001 8.001 0 000-3l.5 1.5 1 1c1.097 0 2.034-.37 2.707-.997A7.995 7.995 0 0114 4c4.418 0 8 3.582 8 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Không có ticket nào</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          selectedTicket?.id === ticket.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            className="font-medium text-gray-900 text-sm cursor-pointer flex-1"
                            onClick={() => handleSelectTicket(ticket)}
                          >
                            {ticket.customerName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                            {ticket.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                                {ticket.unreadCount}
                              </span>
                            )}
                            {ticket.status !== 'closed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseTicket(ticket);
                                }}
                                className="text-red-500 hover:text-red-700 p-1 text-xs"
                                title="Đóng ticket"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        <p 
                          className="text-sm text-gray-600 mb-2 line-clamp-2 cursor-pointer"
                          onClick={() => handleSelectTicket(ticket)}
                        >
                          {ticket.subject}
                        </p>
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => handleSelectTicket(ticket)}
                        >
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'open' ? 'Mở' :
                             ticket.status === 'in_progress' ? 'Đang xử lý' :
                             ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(ticket.lastActivity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
              {selectedTicket ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedTicket.customerName}</h2>
                        <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                          className="px-3 py-1 border rounded text-sm"
                          disabled={selectedTicket.status === 'closed'}
                        >
                          <option value="open">Mở</option>
                          <option value="in_progress">Đang xử lý</option>
                          <option value="resolved">Đã giải quyết</option>
                          <option value="closed">Đã đóng</option>
                        </select>
                        {selectedTicket.status !== 'closed' && (
                          <Button
                            onClick={() => handleCloseTicket(selectedTicket)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Đóng ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromPartner ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromPartner
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromPartner ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  {selectedTicket.status === 'closed' ? (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="text-center text-gray-500">
                        <p className="text-sm">🔒 Ticket này đã được đóng</p>
                        <p className="text-xs mt-1">Không thể gửi thêm tin nhắn</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Nhập tin nhắn trả lời..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="flex-1 resize-none"
                          rows={3}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim()}
                          className="self-end"
                        >
                          Gửi
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Nhấn Enter để gửi, Shift+Enter để xuống dòng
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4L5 15a8.001 8.001 0 000-2l-.5 1.5a8.001 8.001 0 000-3l.5 1.5 1 1c1.097 0 2.034-.37 2.707-.997A7.995 7.995 0 0114 4c4.418 0 8 3.582 8 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một ticket để bắt đầu</h3>
                    <p className="text-gray-500">Chọn một ticket từ danh sách bên trái để xem và trả lời tin nhắn</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}