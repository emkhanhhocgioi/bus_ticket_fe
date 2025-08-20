"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation/navigationbar"

import { 
  getOrderByUserId, 
  searchOrdersByPhoneOrId,
  createVNpayment,
  handleVnpayReturn
} from "@/api/order"
import { useAuth } from "@/context/AuthContext"
import ReviewDialog from "@/components/Dialog/ReviewDialog"
import { createSupportMessage } from "@/utils/websocketHelpers"

import { 
  Search, 
  Filter,
  Calendar, 
  MapPin,
  Clock,
  Phone,
  Star,
  Car,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Loader2,
  X,
  Banknote,
  CreditCard,
  FileText,
  Share,
  User,
  Bus
} from "lucide-react"

interface BookingData {
  id: string;
  routeId: string | { _id: string }; 
  route: string;
  from: string;
  to: string;
  departureTime: string;
  duration: string;
  busType: string;
  price: string;
  status: string;
  passengerName: string;
  phone: string;
  email: string;
  bookingDate: string;
  paymentMethod: string;
  company: string;
  businessId?: string;
}

export default function OrderPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for guest order lookup
  const [guestQuery, setGuestQuery] = useState("")
  const [isGuestLookup, setIsGuestLookup] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  
  const { user, token, isLoggedIn } = useAuth()

  // Payment states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    message: string
    orderId?: string
  } | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<BookingData | null>(null)
  
  // Support ticket modal states (chỉ giữ lại tạo ticket)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [selectedBookingForSupport, setSelectedBookingForSupport] = useState<BookingData | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [ticketCreated, setTicketCreated] = useState(false)
  const [ticketStatus, setTicketStatus] = useState<'open' | 'closed'>('open')
  const [isClosingTicket, setIsClosingTicket] = useState(false)

  // Helper function to get routeId as string
  const getRouteIdString = (routeId: string | { _id: string }): string => {
    return typeof routeId === 'string' ? routeId : routeId._id;
  }

  // Payment helper functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }


  const handleOrderDetails = (booking: BookingData) => {

    console.log('Viewing order details for:', booking.id)

  }

  // Function to handle refresh after review submitted
  const handleReviewSubmitted = () => {
    console.log('Review submitted, refreshing order list...');
    if (isLoggedIn && user?.id && token) {
      fetchOrders();
    }
  }

  // Function to handle contacting bus company
  const handleContactBusCompany = async (booking: BookingData) => {
    if (!user?.id || !booking.businessId || booking.businessId === "unknown") {
      console.warn("Cannot contact bus company - missing user ID or business ID", {
        userId: user?.id,
        businessId: booking.businessId,
        bookingId: booking.id
      });
      alert("Không thể liên hệ nhà xe. Thông tin không đầy đủ.");
      return;
    }

    try {
      // Tạo ticket trước khi mở modal
      setIsCreatingTicket(true);
      const ticketContent = `Vừa tạo 1 ticket cho ${booking.passengerName} - Đơn hàng: ${booking.id}`;
      
      await createSupportMessage(booking.businessId, ticketContent, user.id);
      
      console.log("Support ticket created:", {
        fromId: user.id,
        toId: booking.businessId,
        content: ticketContent
      });
      
      // Đánh dấu ticket đã được tạo và mở modal
      setTicketCreated(true);
      setTicketStatus('open');
      setSelectedBookingForSupport(booking);
      setShowSupportModal(true);
      
    } catch (error) {
      console.error("Error creating support ticket:", error);
      alert("Có lỗi xảy ra khi tạo ticket hỗ trợ. Vui lòng thử lại.");
    } finally {
      setIsCreatingTicket(false);
    }
  }

  // Function to close ticket
  const handleCloseTicket = async () => {
    if (!selectedBookingForSupport || !user?.id) {
      return;
    }

    try {
      setIsClosingTicket(true);
      
      // Ghi nhận việc đóng ticket
      const closeMessage = `${selectedBookingForSupport.passengerName}: [TICKET CLOSED BY USER]`;
      try {
        await createSupportMessage(selectedBookingForSupport.businessId!, closeMessage, user.id);
      } catch (e) {
        console.warn("Could not record ticket close:", e);
      }
      
      console.log("Ticket closed by user:", {
        fromId: user.id,
        toId: selectedBookingForSupport.businessId,
        content: closeMessage
      });
      
      // Cập nhật trạng thái ticket
      setTicketStatus('closed');
      
    } catch (error) {
      console.error("Error closing ticket:", error);
      alert("Có lỗi xảy ra khi đóng ticket. Vui lòng thử lại.");
    } finally {
      setIsClosingTicket(false);
    }
  }

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!isLoggedIn || !user?.id || !token) {
      console.log("Cannot fetch orders - missing auth data:", { isLoggedIn, userId: user?.id, hasToken: !!token })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Fetching orders for user:", user.id)
      const response = await getOrderByUserId(user.id, token)
      console.log("Orders response:", response)
      console.log("Raw order data:", response?.data || response)
      
      // Transform API response to match the expected format
      const transformedOrders = (response?.data || response || []).map((order: any) => ({
        id: order._id || order.id || `ORDER_${Date.now()}_${Math.random()}`,
        routeId: order.routeId?._id || order.routeId || order.routeInfo?._id || order.route || "unknown", // Thêm routeId
        route: `${order.routeId?.from || order.routeInfo?.from || 'N/A'} - ${order.routeId?.to || order.routeInfo?.to || 'N/A'}`,
        from: order.routeId?.from || order.routeInfo?.from || 'N/A',
        to: order.routeId?.to || order.routeInfo?.to || 'N/A',
        departureTime: order.routeId?.departureTime || order.routeInfo?.departureTime || "00:00",
        duration: order.routeId?.duration || order.routeInfo?.duration || "N/A",
        busType: order.routeId?.busType || order.routeInfo?.busType || "N/A",
        price: order.basePrice ? `${order.basePrice.toLocaleString('vi-VN')}đ` : 
               order.total ? `${order.total.toLocaleString('vi-VN')}đ` : "0đ",
        status: order.orderStatus || order.status || "pending",
        passengerName: order.fullName || order.customerName || "N/A",
        phone: order.phone || "N/A",
        email: order.email || "N/A",
        bookingDate: order.createdAt ? 
          new Date(order.createdAt).toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN'),
        paymentMethod: order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                      order.paymentMethod === 'card' ? 'Thẻ' :
                      order.paymentMethod === 'transfer' ? 'Chuyển khoản' :
                      order.paymentMethod || "N/A",
        company: order.company || order.routeId?.company || "N/A",
        businessId: order.bussinessId || order.businessId || order.routeId?.partnerId || "unknown"
      }))
      
      console.log("Transformed orders:", transformedOrders)
      setBookings(transformedOrders)
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Guest order lookup function
  const handleGuestLookup = async () => {
    if (!guestQuery.trim()) {
      setError("Vui lòng nhập số điện thoại hoặc mã đơn hàng")
      return
    }

    try {
      setGuestLoading(true)
      setError(null)
      setIsGuestLookup(true)
      
      const response = await searchOrdersByPhoneOrId(guestQuery.trim())
      console.log("Guest lookup response:", response)
      
      // Transform API response to match the expected format for new order structure
      const ordersArray = response?.data || response || []
      const transformedOrders = ordersArray.map((order: any) => ({
        id: order._id || `ORDER_${Date.now()}_${Math.random()}`,
        routeId: order.routeId?._id || order.routeId || order.routeInfo?._id || order.route || "unknown", // Thêm routeId
        route: `${order.routeId?.from || order.routeInfo?.from || 'N/A'} - ${order.routeId?.to || order.routeInfo?.to || 'N/A'}`,
        from: order.routeId?.from || order.routeInfo?.from || 'N/A',
        to: order.routeId?.to || order.routeInfo?.to || 'N/A',
        departureTime: order.routeId?.departureTime || order.routeInfo?.departureTime || "00:00",
        duration: order.routeId?.duration || order.routeInfo?.duration || "N/A",
        busType: order.routeId?.busType || order.routeInfo?.busType || "N/A",
        price: order.total ? `${order.total.toLocaleString('vi-VN')}đ` : 
               order.basePrice ? `${order.basePrice.toLocaleString('vi-VN')}đ` : "0đ",
        status: order.orderStatus || "pending",
        passengerName: order.fullName || "N/A",
        phone: order.phone || "N/A",
        email: order.email || "N/A",
        bookingDate: order.createdAt ? 
          new Date(order.createdAt).toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN'),
        paymentMethod: order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                      order.paymentMethod === 'card' ? 'Thẻ' :
                      order.paymentMethod === 'transfer' ? 'Chuyển khoản' :
                      order.paymentMethod || "N/A",
        company: order.company || "N/A",
        businessId: order.bussinessId || order.businessId || order.routeId?.partnerId || "unknown"
      }))
      
      setBookings(transformedOrders)
      
      if (transformedOrders.length === 0) {
        setError("Không tìm thấy đơn hàng nào với thông tin đã nhập")
      }
    } catch (err: any) {
      console.error("Error in guest lookup:", err)
      setError("Không tìm thấy đơn hàng nào với thông tin đã nhập")
      setBookings([])
    } finally {
      setGuestLoading(false)
    }
  }

  const resetToLogin = () => {
    setIsGuestLookup(false)
    setGuestQuery("")
    setBookings([])
    setError(null)
  }

  // Payment handlers
  const handlePayment = async (booking: BookingData) => {
    setSelectedOrderForPayment(booking)
    setIsSubmitting(true)
    
    try {
      const priceNumber = parseInt(booking.price.replace(/[đ.,]/g, ''))
      const orderInfo = `Thanh toán vé xe ${booking.from} - ${booking.to} - ${booking.passengerName}`
      
      // Use standard VNPay payment
      const vnpayResponse = await createVNpayment(
        booking.id,
        priceNumber,
        orderInfo,
        '', // No specific bank code
        'vn',
        token || ''
      )
      
      if (vnpayResponse?.data.paymentUrl) {
        window.location.href = vnpayResponse.data.paymentUrl
      } else {
        throw new Error('Không thể tạo liên kết thanh toán')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Có lỗi xảy ra khi tạo thanh toán')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentWithBank = async (booking: BookingData, bankCode: string) => {
    setSelectedOrderForPayment(booking)
    setIsSubmitting(true)
    
    try {
      const priceNumber = parseInt(booking.price.replace(/[đ.,]/g, ''))
      const orderInfo = `Thanh toán vé xe ${booking.from} - ${booking.to} - ${booking.passengerName}`
      
      const vnpayResponse = await createVNpayment(
        booking.id,
        priceNumber,
        orderInfo,
        bankCode,
        'vn',
        token || ''
      )
      
      if (vnpayResponse?.data.paymentUrl) {
        window.location.href = vnpayResponse.data.paymentUrl
      } else {
        throw new Error('Không thể tạo liên kết thanh toán')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Có lỗi xảy ra khi tạo thanh toán')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && user?.id && token) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [user?.id, token, isLoggedIn])

  // Removed websocket support message handler since messaging UI removed

  // Handle VNPay return
  useEffect(() => {
    const handleVNPayReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const vnpResponseCode = urlParams.get('vnp_ResponseCode')
      
      if (vnpResponseCode !== null) {
        setIsCheckingPayment(true)
        
        try {
          const params: Record<string, string> = {}
          urlParams.forEach((value, key) => {
            params[key] = value
          })
          
          const result = await handleVnpayReturn(params)
          
          if (result.success) {
            setPaymentResult({
              success: true,
              message: result.message || 'Thanh toán thành công!',
              orderId: result.orderId
            })
            setShowSuccessModal(true)
            fetchOrders() // Refresh orders after successful payment
          } else {
            setPaymentResult({
              success: false,
              message: result.message || 'Thanh toán thất bại!'
            })
          }
        } catch (error: any) {
          console.error('Error handling VNPay return:', error)
          setPaymentResult({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
          })
        } finally {
          setIsCheckingPayment(false)
          
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        }
      }
    }

    handleVNPayReturn()
  }, [])

  // Sample booking data (removed from here)
  // const bookings = [...]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200"
      case "pending": 
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "finished":
        return "text-purple-600 bg-purple-50 border-purple-200"
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200"
      case "prepaid":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "finished":
        return <Star className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      case "prepaid":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "completed":
        return "Hoàn thành"
      case "finished":
        return "Đã kết thúc"
      case "cancelled":
        return "Đã hủy"
      case "prepaid":
        return "Đã thanh toán"
      default:
        return "Không xác định"
    }
  }

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.phone.includes(searchTerm)
      const matchesFilter = filterStatus === "all" || booking.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        case "oldest":
          return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
        case "departure":
          return a.departureTime.localeCompare(b.departureTime)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavigationBar currentPage="order" />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-blue-100">Quản lý và theo dõi các chuyến đi của bạn</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar - Only show when logged in or in guest lookup mode */}
        {(isLoggedIn || isGuestLookup) && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm theo mã đơn, tuyến đường, tên hành khách, nhà xe hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 h-11"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="finished">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="prepaid">Đã thanh toán</option>
                </select>
              </div>
              
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="departure">Theo giờ khởi hành</option>
                </select>
              </div>

              <div>
                <Button 
                  onClick={isLoggedIn ? fetchOrders : handleGuestLookup}
                  variant="outline" 
                  className="w-full h-11"
                  disabled={loading || guestLoading}
                >
                  {(loading || guestLoading) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Làm mới
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show when logged in or have results */}
        {(isLoggedIn || (isGuestLookup && bookings.length > 0)) && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đã xác nhận</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đã kết thúc</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {bookings.filter(b => b.status === 'finished').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking List */}
        <div className="space-y-6">
          {!isLoggedIn && !isGuestLookup ? (
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tra cứu đơn hàng</h3>
                <p className="text-gray-600">Nhập số điện thoại để xem thông tin đơn hàng của bạn</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <Input
                    placeholder="Nhập số điện thoại..."
                    value={guestQuery}
                    onChange={(e) => setGuestQuery(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGuestLookup()
                      }
                    }}
                  />
                  <Button 
                    onClick={handleGuestLookup}
                    disabled={guestLoading || !guestQuery.trim()}
                    className="min-w-[100px]"
                  >
                    {guestLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Tra cứu
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Hoặc{" "}
                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      đăng nhập
                    </a>{" "}
                    để xem tất cả đơn hàng
                  </p>
                </div>
              </div>
            </div>
          ) : !isLoggedIn && isGuestLookup ? (
            <>
              {/* Guest lookup header */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Kết quả tra cứu cho: "{guestQuery}"</h3>
                      <p className="text-sm text-gray-600">
                        {bookings.length} đơn hàng được tìm thấy
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={resetToLogin} size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Tra cứu khác
                  </Button>
                </div>
              </div>
              
              {/* Results */}
              {error ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={resetToLogin} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Thử lại
                  </Button>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                  <p className="text-gray-600">Không có đơn hàng nào với thông tin đã nhập</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{booking.route}</h3>
                            <p className="text-sm text-gray-600">Mã đơn: {booking.id}</p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span>{getStatusText(booking.status)}</span>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Ngày đặt</p>
                              <p className="font-medium">{booking.bookingDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                              <p className="font-medium">{booking.departureTime}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Car className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Nhà xe</p>
                              <p className="font-medium">{booking.company}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Loại xe</p>
                              <p className="font-medium">{booking.busType}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Thời gian di chuyển</p>
                              <p className="font-medium">{booking.duration}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Hành khách</p>
                              <p className="font-medium">{booking.passengerName}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">Tổng tiền</p>
                            <p className="text-2xl font-bold text-blue-600">{booking.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Thanh toán</p>
                            <p className="text-sm font-medium">{booking.paymentMethod}</p>
                          </div>
                        
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOrderDetails(booking)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Tải hóa đơn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleContactBusCompany(booking)}
                            disabled={!booking.businessId || booking.businessId === "unknown" || isCreatingTicket}
                          >
                            {isCreatingTicket ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Đang tạo ticket...
                              </>
                            ) : (
                              <>
                                <Phone className="w-4 h-4 mr-1" />
                                Liên hệ nhà xe
                              </>
                            )}
                          </Button>
                          
                          {booking.status === 'finished' && (
                            <ReviewDialog 
                              routeId={getRouteIdString(booking.routeId)}
                              onReviewSubmitted={handleReviewSubmitted}
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Đánh giá
                              </Button>
                            </ReviewDialog>
                          )}
                          {booking.status === 'confirmed' && (booking.paymentMethod === 'Tiền mặt' || booking.paymentMethod === 'cash') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handlePayment(booking)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting && selectedOrderForPayment?.id === booking.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CreditCard className="w-4 h-4 mr-1" />
                              )}
                              Thanh toán
                            </Button>
                          )}
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : loading ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tải...</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all" 
                  ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác" 
                  : "Bạn chưa có đơn hàng nào"}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{booking.route}</h3>
                        <p className="text-sm text-gray-600">Mã đơn: {booking.id}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span>{getStatusText(booking.status)}</span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Ngày đặt</p>
                          <p className="font-medium">{booking.bookingDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Thời gian khởi hành</p>
                          <p className="font-medium">{booking.departureTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Nhà xe</p>
                          <p className="font-medium">{booking.company}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Loại xe</p>
                          <p className="font-medium">{booking.busType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Thời gian di chuyển</p>
                          <p className="font-medium">{booking.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Hành khách</p>
                          <p className="font-medium">{booking.passengerName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">Tổng tiền</p>
                        <p className="text-2xl font-bold text-blue-600">{booking.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Thanh toán</p>
                        <p className="text-sm font-medium">{booking.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOrderDetails(booking)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Tải hóa đơn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleContactBusCompany(booking)}
                        disabled={!booking.businessId || booking.businessId === "unknown" || isCreatingTicket}
                      >
                        {isCreatingTicket ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Đang tạo ticket...
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-1" />
                            Liên hệ nhà xe
                          </>
                        )}
                      </Button>
                      {booking.status === 'finished' && (
                        <ReviewDialog 
                          routeId={getRouteIdString(booking.routeId)}
                          onReviewSubmitted={handleReviewSubmitted}
                        >
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Đánh giá
                          </Button>
                        </ReviewDialog>
                      )}
                      {booking.status === 'confirmed' && (booking.paymentMethod === 'Tiền mặt' || booking.paymentMethod === 'cash') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handlePayment(booking)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && selectedOrderForPayment?.id === booking.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-1" />
                          )}
                          Thanh toán
                        </Button>
                      )}
                      {booking.status === 'confirmed' && booking.paymentMethod !== 'Tiền mặt' && booking.paymentMethod !== 'cash' && (
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          Hủy đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {(isLoggedIn || isGuestLookup) && filteredBookings.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tải thêm đơn hàng
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="text-2xl font-bold text-blue-400 mb-6">Vexere</div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Công ty TNHH Thương Mại Dịch Vụ Vexere
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"></div>
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"></div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Hỗ trợ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn thanh toán</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Quy chế Vexere.com</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Về chúng tôi</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Giới thiệu Vexere.com</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tin tức</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Tải ứng dụng Vexere</h4>
              <div className="space-y-4">
                <div className="w-40 h-12 bg-black rounded-lg flex items-center justify-center text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                  📱 App Store
                </div>
                <div className="w-40 h-12 bg-black rounded-lg flex items-center justify-center text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                  🤖 Google Play
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>Bản quyền © 2025 thuộc về Vexere.com</p>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Thanh toán thành công!</h2>
                <p className="text-green-100">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Success Message */}
              {paymentResult?.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      {paymentResult.message}
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Thanh toán VNPay đã được xử lý thành công.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin quan trọng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Vé của bạn đã được thanh toán</li>
                  <li>• Trạng thái đơn hàng sẽ được cập nhật</li>
                  <li>• Đến bến xe trước 15 phút</li>
                  <li>• Mang theo giấy tờ tùy thân</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setShowSuccessModal(false)
                    setPaymentResult(null)
                    setSelectedOrderForPayment(null)
                    fetchOrders() // Refresh orders
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Làm mới danh sách
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setShowSuccessModal(false)
                    setPaymentResult(null)
                    setSelectedOrderForPayment(null)
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false)
                setPaymentResult(null)
                setSelectedOrderForPayment(null)
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Payment checking screen */}
      {isCheckingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Đang xử lý kết quả thanh toán...
            </h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}

      {/* Creating Ticket Modal */}
      {isCreatingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang tạo ticket hỗ trợ</h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}

      {/* Support Message Modal */}
      {showSupportModal && selectedBookingForSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`${ticketStatus === 'open' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {ticketStatus === 'open' ? 'Liên hệ nhà xe' : 'Ticket đã đóng'}
                  </h2>
                  <p className="text-blue-100 text-sm">{selectedBookingForSupport.company}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    ticketStatus === 'open' 
                      ? 'bg-green-500 bg-opacity-20 text-green-100' 
                      : 'bg-red-500 bg-opacity-20 text-red-100'
                  }`}>
                    {ticketStatus === 'open' ? '🟢 Đang mở' : '🔴 Đã đóng'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSupportModal(false);
                    setSelectedBookingForSupport(null);
                    setTicketCreated(false);
                    setTicketStatus('open');
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Ticket Status */}
              {ticketCreated && (
                <div className={`${ticketStatus === 'open' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
                  <div className="flex items-center">
                    {ticketStatus === 'open' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600 mr-2" />
                    )}
                    <div>
                      <h4 className={`font-medium ${ticketStatus === 'open' ? 'text-green-800' : 'text-gray-800'}`}>
                        {ticketStatus === 'open' ? 'Ticket đang hoạt động' : 'Ticket đã được đóng'}
                      </h4>
                      <p className={`text-sm ${ticketStatus === 'open' ? 'text-green-600' : 'text-gray-600'}`}>
                        {ticketStatus === 'open' 
                          ? 'Bạn có thể tiếp tục gửi tin nhắn với nhà xe' 
                          : 'Cuộc trò chuyện đã kết thúc. Không thể gửi thêm tin nhắn.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin chuyến xe</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã đơn:</span>
                    <span className="font-medium">{selectedBookingForSupport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuyến đường:</span>
                    <span className="font-medium">{selectedBookingForSupport.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hành khách:</span>
                    <span className="font-medium">{selectedBookingForSupport.passengerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày đi:</span>
                    <span className="font-medium">{selectedBookingForSupport.bookingDate}</span>
                  </div>
                </div>
              </div>

              {/* Simple ticket info (messaging removed) */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Trạng thái ticket</h4>
                  <p className="text-sm text-gray-600">
                    {ticketStatus === 'open' 
                      ? 'Ticket đã được tạo. Nhà xe sẽ liên hệ với bạn qua hệ thống hỗ trợ.' 
                      : 'Ticket đã đóng.'}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowSupportModal(false);
                      setSelectedBookingForSupport(null);
                      setTicketCreated(false);
                      setTicketStatus('open');
                    }}
                    disabled={isCreatingTicket || isClosingTicket}
                  >
                    Đóng cửa sổ
                  </Button>

                  {ticketStatus === 'open' ? (
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleCloseTicket}
                      disabled={isClosingTicket}
                    >
                      {isClosingTicket ? 'Đang đóng...' : 'Đóng ticket'}
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      Ticket đã đóng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}