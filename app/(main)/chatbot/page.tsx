"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, CheckCircle, Star, MapPin, Clock, DollarSign, Users } from "lucide-react"
import NavigationBar from "@/components/navigation/navigationbar"
import { chatBot } from "@/api/chat_bot"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  routes?: RouteData[] // Thêm dữ liệu tuyến xe nếu có
}

interface RouteData {
  _id: string
  routeCode: string
  partnerId: {
    _id: string
    company: string
  }
  from: string
  to: string
  departureTime: string
  duration: string
  price: number
  totalSeats: number
  availableSeats: number
  busType: string
  licensePlate: string
  rating: number
  tags: string[]
  description: string
  isActive: boolean
  createdAt: string
  bookedSeats: any[]
  images: string[]
}

export default function ChatbotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý ảo của Vexere. Tôi có thể giúp bạn:\n\n🔍 Tìm kiếm vé xe theo tuyến đường\n📞 Tra cứu thông tin chuyến đi\n❓ Trả lời các câu hỏi về dịch vụ\n\nVí dụ: "Tìm xe từ Hà Nội đi Hồ Chí Minh" hoặc "Xe từ Đà Nẵng đi Quảng Bình"\n\nBạn cần hỗ trợ gì?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suggested messages for quick access
  const suggestedMessages = [
    "Tìm xe từ Hà Nội đi Hồ Chí Minh",
    "Xe từ Đà Nẵng đi Quảng Bình", 
    "Giá vé xe từ Hà Nội đi Huế",
    "Thời gian xe từ TP.HCM đi Đà Lạt"
  ]

  // Auto scroll to bottom when new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestedMessage = (message: string) => {
    setInputMessage(message)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    try {
      // Call chatbot API
      const response = await chatBot(currentMessage)
      
      let botResponseText = ""
      let routesData: RouteData[] | undefined = undefined
      
      // Check if response contains route data (array format like search page)
      if (Array.isArray(response) && response.length > 0) {
        // Save routes data for card display
        routesData = response
        botResponseText = `🚌 Tôi đã tìm thấy ${response.length} chuyến xe phù hợp:`
      } else {
        // Handle text response
        botResponseText = response.response || response.message || response.data || 
          (typeof response === 'string' ? response : "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.")
      }
      
      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        routes: routesData
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message to chatbot:", error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, có lỗi xảy ra khi kết nối với server. Vui lòng thử lại sau.",
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Simple text formatter for basic markdown-like syntax
  const formatMessageText = (text: string) => {
    // Replace **bold** with <strong>
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Replace line breaks
    const withLineBreaks = boldFormatted.replace(/\n/g, '<br />')
    
    return { __html: withLineBreaks }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="chatbot" />
      
      <div className="container mx-auto max-w-4xl h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Trợ lý ảo Vexere</h1>
              <p className="text-sm text-gray-500">Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'max-w-xs md:max-w-md lg:max-w-lg' : 'max-w-full'}`}>
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border shadow-sm'
                  }`}>
                    {message.sender === 'bot' ? (
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={formatMessageText(message.text)}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' 
                        ? 'text-blue-100' 
                        : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Display route cards if available */}
              {message.routes && message.routes.length > 0 && (
                <div className="mt-4 space-y-3 max-w-full">
                  {message.routes.map((route) => (
                    <div key={route._id} className="bg-white rounded-lg border shadow-sm p-4 ml-11">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{route.partnerId.company}</h3>
                          <p className="text-sm text-gray-600">{route.busType}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{formatPrice(route.price)}</div>
                          {route.rating > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{route.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{route.from} → {route.to}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{route.departureTime} • {route.duration}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Còn {route.availableSeats}/{route.totalSeats} chỗ</span>
                        </div>
                      </div>

                      {route.description && (
                        <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                          onClick={() => {
                            console.log('Clicking button for route ID:', route._id)
                            router.push(`/ticket/${route._id}`)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Chọn chuyến
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Messages - Show only when no user messages yet */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 mb-3">💡 Gợi ý câu hỏi:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedMessage(suggestion)}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t px-6 py-4">
          {/* Suggested Messages */}
          {messages.length <= 1 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Gợi ý tin nhắn:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedMessages.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedMessage(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nhấn Enter để gửi tin nhắn
          </p>
        </div>
      </div>
    </div>
  )
}