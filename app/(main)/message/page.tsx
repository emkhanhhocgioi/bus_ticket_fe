"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { getAllSupportMessage } from "@/api/message";
import { sendSupportMessage, createSupportMessage, closeTicket } from "@/utils/websocketHelpers";
import NavigationBar from "@/components/navigation/navigationbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Plus, 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  User,
  Phone,
  Mail
} from "lucide-react";

interface SupportMessage {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
  isFromPartner: boolean;
  partnerName?: string;
  status: 'unread' | 'read' | 'replied';
}

interface SupportTicket {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerEmail?: string;
  partnerPhone?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastActivity: string;
  messages: SupportMessage[];
  unreadCount: number;
}

export default function MessagePage() {
  const { user, token } = useAuth();
  const { sendMessage, messages: wsMessages, isConnected } = useWebSocket();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketContent, setNewTicketContent] = useState("");
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
          const isFromPartner = senderId !== user.id; // If sender is not current user, then it's from partner
          const partnerId = isFromPartner ? senderId : receiverId;
          
          // Extract partner name and subject from first content item
          const contentArray = Array.isArray(apiMessage.content) ? apiMessage.content : [apiMessage.content];
          const firstContent = contentArray[0] || "";
          let partnerName = `Partner ${partnerId}`;
          let subject = "Yêu cầu hỗ trợ";
          
          // Try to extract name and order info from first content
          const ticketMatch = firstContent.match(/Vừa tạo 1 ticket cho (.+?) - (.+)/);
          if (ticketMatch) {
            partnerName = `Nhà xe - ${ticketMatch[1]}`;
            subject = ticketMatch[2];
          } else {
            partnerName = `Nhà xe ${partnerId.substring(0, 8)}`;
            subject = firstContent?.substring(0, 50) + "..." || "Yêu cầu hỗ trợ";
          }
          
          // Create messages for each content item
          const messages: SupportMessage[] = [];
          contentArray.forEach((content: string, index: number) => {
            if (!content || content.trim() === "") return;
            
            // Determine if this is a system message or user message
            let messageFromId = apiMessage.sender;
            let messageToId = apiMessage.receiver;
            let messageIsFromPartner = isFromPartner;
            
            // Check if content contains user ID prefix
            const userMessageMatch = content.match(/^([a-f0-9]{24}):\s*(.+)$/);
            if (userMessageMatch) {
              const userId = userMessageMatch[1];
              const messageContent = userMessageMatch[2];
              messageFromId = userId;
              messageToId = userId === user?.id ? partnerId : (user?.id || "");
              messageIsFromPartner = userId !== user?.id;
              content = messageContent;
            }
            
            const message: SupportMessage = {
              id: `${apiMessage._id}_${index}`,
              fromId: messageFromId,
              toId: messageToId,
              content: content.trim(),
              timestamp: apiMessage.createdAt,
              isFromPartner: messageIsFromPartner,
              partnerName: partnerName,
              status: apiMessage.read ? 'read' : 'unread'
            };
            
            messages.push(message);
          });
          
          // Create ticket for this message
          const ticket: SupportTicket = {
            id: apiMessage._id, // Use the message _id as ticket ID
            partnerId: partnerId,
            partnerName: partnerName,
            partnerEmail: undefined,
            partnerPhone: undefined,
            subject: subject,
            status: 'open',
            priority: 'medium',
            createdAt: apiMessage.createdAt,
            lastActivity: apiMessage.updatedAt || apiMessage.createdAt,
            messages: messages,
            unreadCount: !apiMessage.read && isFromPartner ? messages.filter(m => m.isFromPartner).length : 0
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
      setTickets([]);
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
            : 'Ticket đã được đóng bởi nhà xe';
          
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
          const partnerName = fromId ? `Nhà xe ${fromId.substring(0, 8)}` : 'nhà xe';
          
          new Notification('Tin nhắn hỗ trợ mới', {
            body: `${partnerName}: ${content?.substring(0, 100) || 'Tin nhắn mới'}`,
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

  // Send message
  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      fromId: user?.id || "",
      toId: selectedTicket.partnerId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isFromPartner: false,
      status: 'read'
    };

    // Update local state
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [...ticket.messages, newMsg],
              lastActivity: newMsg.timestamp,
              status: 'in_progress'
            }
          : ticket
      )
    );

    // Update selected ticket
    setSelectedTicket(prev =>
      prev ? {
        ...prev,
        messages: [...prev.messages, newMsg],
        lastActivity: newMsg.timestamp,
        status: 'in_progress'
      } : null
    );

    // Send via WebSocket
    sendSupportMessage(
      selectedTicket.partnerId, // toId (partner ID)
      newMessage.trim(), // content
      user?.id, // fromId (user ID)
      selectedTicket.id // ticketId
    );

    setNewMessage("");
  };

  // Create new support ticket
  const handleCreateNewTicket = () => {
    if (!newTicketSubject.trim() || !newTicketContent.trim()) return;

    const ticketContent = `Vừa tạo 1 ticket cho ${user?.name || 'Khách hàng'} - ${newTicketSubject.trim()}\n${newTicketContent.trim()}`;

    // Send create support ticket via WebSocket
    createSupportMessage(
      "system", // Partner system will handle routing
      ticketContent,
      user?.id
    );

    // Reset form
    setNewTicketSubject("");
    setNewTicketContent("");
    setShowNewTicketForm(false);

    // Reload messages after a short delay
    setTimeout(() => {
      loadSupportMessages();
    }, 1000);
  };

  // Close ticket
  const handleCloseTicket = (ticket: SupportTicket) => {
    if (!user?.id) return;

    const confirmClose = window.confirm(
      `Bạn có chắc chắn muốn đóng cuộc trò chuyện này?\nViệc này không thể hoàn tác.`
    );

    if (confirmClose) {
      console.log('🔒 Closing ticket:', ticket.id);
      
      // Send close ticket message via WebSocket
      closeTicket(ticket.id, user.id, ticket.partnerId);
      
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

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchQuery === "" || 
      ticket.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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
      <NavigationBar currentPage="message" />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageCircle className="w-7 h-7 mr-3 text-blue-600" />
                  Tin nhắn hỗ trợ
                  {totalUnreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {totalUnreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  Liên hệ với nhà xe để được hỗ trợ nhanh chóng
                </p>
              </div>
              <Button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo yêu cầu mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Tickets List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border flex flex-col">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tickets */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Đang tải...</p>
                  </div>
                ) : filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 border-b cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {ticket.partnerName}
                            </h3>
                            {ticket.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {ticket.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status === 'open' ? 'Đang mở' :
                               ticket.status === 'in_progress' ? 'Đang xử lý' :
                               ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(ticket.lastActivity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có tin nhắn nào</p>
                    <p className="text-sm mt-1">Tạo yêu cầu hỗ trợ để bắt đầu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
              {selectedTicket ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900">{selectedTicket.partnerName}</h2>
                          <p className="text-sm text-gray-500">{selectedTicket.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                            {selectedTicket.status === 'open' ? 'Đang mở' :
                             selectedTicket.status === 'in_progress' ? 'Đang xử lý' :
                             selectedTicket.status === 'resolved' ? 'Đã giải quyết' : 'Đã đóng'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(selectedTicket.lastActivity)}
                          </p>
                        </div>
                        {selectedTicket.status !== 'closed' && (
                          <Button
                            onClick={() => handleCloseTicket(selectedTicket)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Đóng cuộc trò chuyện
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
                        className={`flex ${
                          message.isFromPartner ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromPartner
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 text-xs ${
                            message.isFromPartner ? 'text-gray-500' : 'text-blue-200'
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {!message.isFromPartner && (
                              <CheckCircle className="w-3 h-3 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  {selectedTicket.status === 'closed' ? (
                    <div className="p-4 border-t bg-gray-50">
                      <div className="text-center text-gray-500">
                        <p className="text-sm">🔒 Cuộc trò chuyện này đã được đóng</p>
                        <p className="text-xs mt-1">Không thể gửi thêm tin nhắn</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Nhập tin nhắn..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Chọn cuộc trò chuyện</h3>
                    <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Tạo yêu cầu hỗ trợ mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề
                </label>
                <Input
                  placeholder="Nhập tiêu đề yêu cầu..."
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  placeholder="Mô tả chi tiết vấn đề cần hỗ trợ..."
                  value={newTicketContent}
                  onChange={(e) => setNewTicketContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewTicketForm(false);
                  setNewTicketSubject("");
                  setNewTicketContent("");
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateNewTicket}
                disabled={!newTicketSubject.trim() || !newTicketContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Tạo yêu cầu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}