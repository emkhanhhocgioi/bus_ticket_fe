"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import NavigationBar from "@/components/navigation/navigationbar"
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
  RefreshCw
} from "lucide-react"

export default function OrderPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Sample booking data
  const bookings = [
    {
      id: "VX2025001",
      route: "Sài Gòn - Đà Lạt",
      departure: "2025-01-25",
      departureTime: "08:00",
      arrival: "2025-01-25",
      arrivalTime: "13:30",
      busCompany: "Phương Trang",
      busType: "Giường nằm VIP",
      seat: "A12",
      price: "199.000đ",
      status: "confirmed",
      passengerName: "Nguyễn Văn An",
      phone: "0901234567",
      bookingDate: "2025-01-20",
      paymentMethod: "VNPay"
    },
    {
      id: "VX2025002", 
      route: "Hà Nội - Hải Phòng",
      departure: "2025-01-28",
      departureTime: "14:00",
      arrival: "2025-01-28", 
      arrivalTime: "16:30",
      busCompany: "Hoàng Long",
      busType: "Ghế ngồi",
      seat: "B08",
      price: "120.000đ",
      status: "pending",
      passengerName: "Trần Thị Bình",
      phone: "0907654321",
      bookingDate: "2025-01-22",
      paymentMethod: "Tiền mặt"
    },
    {
      id: "VX2025003",
      route: "Sài Gòn - Nha Trang", 
      departure: "2025-01-15",
      departureTime: "22:00",
      arrival: "2025-01-16",
      arrivalTime: "07:00",
      busCompany: "Thành Bưởi",
      busType: "Giường nằm",
      seat: "C15",
      price: "200.000đ",
      status: "completed",
      passengerName: "Lê Minh Cường",
      phone: "0912345678",
      bookingDate: "2025-01-10",
      paymentMethod: "MoMo"
    },
    {
      id: "VX2025004",
      route: "Đà Nẵng - Hội An",
      departure: "2025-01-30",
      departureTime: "09:00", 
      arrival: "2025-01-30",
      arrivalTime: "10:00",
      busCompany: "Sinh Tourist",
      busType: "Limousine",
      seat: "L02",
      price: "80.000đ",
      status: "cancelled",
      passengerName: "Phạm Thị Dung",
      phone: "0923456789",
      bookingDate: "2025-01-18",
      paymentMethod: "ZaloPay"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200"
      case "pending": 
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200"
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
      case "cancelled":
        return <XCircle className="w-4 h-4" />
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
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  const filteredBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase())
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
          return new Date(a.departure).getTime() - new Date(b.departure).getTime()
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
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  placeholder="Tìm kiếm theo mã đơn, tuyến đường hoặc tên hành khách..."
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
                <option value="cancelled">Đã hủy</option>
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
                <option value="departure">Theo ngày đi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Booking List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
              <p className="text-gray-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
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
                          <p className="text-sm text-gray-600">Ngày đi</p>
                          <p className="font-medium">{new Date(booking.departure).toLocaleDateString('vi-VN')} - {booking.departureTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                          <p className="font-medium">{booking.departureTime} - {booking.arrivalTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Nhà xe</p>
                          <p className="font-medium">{booking.busCompany}</p>
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
                        <Star className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Ghế</p>
                          <p className="font-medium">{booking.seat}</p>
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
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Vé
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          Hủy vé
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
        {filteredBookings.length > 0 && (
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
    </div>
  )
}