"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation/navigationbar"
import { getRouteDataById } from "@/api/routes"
import { 
  CheckCircle, 
  Calendar, 
  Clock,
  MapPin,
  Car,
  Users,
  Phone,
  Mail,
  CreditCard,
  Download,
  Share,
  QrCode,
  Star,
  ArrowRight,
  AlertCircle,
  FileText
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"

interface RouteDetails {
  id: string
  routeCode: string
  route: {
    from: string
    to: string
    departureTime: string
    duration: string
  }
  operator: {
    partnerId: string
    rating: number
  }
  bus: {
    type: string
    plateNumber: string
    description: string
    totalSeats: number
    availableSeats: number
  }
  pricing: {
    basePrice: number
    fees: number
    total: number
  }
  isActive: boolean
  createdAt: string
}

export default function TicketPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteDetails | null>(null)

  // Fetch route data based on route ID
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true)
      
      try {
        console.log('Fetching route data for ID:', routeId)
        
        // Call the real API to get route data by ID
        const response = await getRouteDataById(routeId as string)
        console.log('Route data received:', response)
        
        // Extract the actual route data from the response
        const routeResponseData = response?.response?.route || response?.route || response
        
        // Check if response has valid data
        if (!routeResponseData || !routeResponseData._id) {
          console.log('No valid route data found')
          setRoute(null)
          return
        }
        
        // Use raw API response directly without transformation
        const routeData: RouteDetails = {
          id: routeResponseData._id,
          routeCode: routeResponseData.routeCode,
          route: {
            from: routeResponseData.from,
            to: routeResponseData.to,
            departureTime: routeResponseData.departureTime,
            duration: routeResponseData.duration
          },
          operator: {
            partnerId: routeResponseData.partnerId,
            rating: routeResponseData.rating
          },
          bus: {
            type: routeResponseData.busType,
            plateNumber: routeResponseData.licensePlate,
            description: routeResponseData.description,
            totalSeats: routeResponseData.totalSeats,
            availableSeats: routeResponseData.availableSeats
          },
          pricing: {
            basePrice: routeResponseData.price,
            fees: Math.round(routeResponseData.price * 0.025), // 2.5% service fee
            total: Math.round(routeResponseData.price * 1.025)
          },
          isActive: routeResponseData.isActive,
          createdAt: routeResponseData.createdAt
        }
        
        console.log('Transformed route data:', routeData)
        setRoute(routeData)
        
      } catch (error) {
        console.error('Error fetching route:', error)
        setRoute(null)
      } finally {
        setLoading(false)
      }
    }

    if (routeId) {
      fetchRoute()
    }
  }, [routeId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    // If it's just time format like "23:00", return as is
    if (timeString && timeString.includes(':') && !timeString.includes('T')) {
      return timeString
    }
    // If it's a full datetime, extract time
    const date = new Date(timeString)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const handleBookTicket = () => {
    router.push(`/ticket/${routeId}/confirmation`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="order" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin chuyến xe...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="order" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy thông tin chuyến xe
            </h3>
            <p className="text-gray-600 mb-4">
              Chuyến xe với mã "{routeId}" không tồn tại hoặc đã bị xóa.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Có thể do:</strong>
              </p>
              <ul className="text-sm text-red-600 mt-2 text-left">
                <li>• Mã chuyến xe không đúng</li>
                <li>• Chuyến xe đã bị hủy</li>
                <li>• Lỗi kết nối mạng</li>
                <li>• Máy chủ đang bảo trì</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Thử lại
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Quay lại trang trước
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="order" />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Xác nhận thông tin chuyến xe</h1>
            <p className="text-blue-100 text-lg">
              Vui lòng kiểm tra thông tin và tiến hành đặt vé
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Mã chuyến: {routeId}
            </p>
          </div>
        </div>
      </section>

      {/* Route Details */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Route Info and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                route.isActive 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {route.isActive ? 'Chuyến xe hoạt động' : 'Chuyến xe không hoạt động'}
              </span>
              <span className="text-gray-600">
                Còn lại: <span className="font-semibold text-green-600">{route.bus.availableSeats} chỗ</span>
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Chọn chuyến khác
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Route Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Route Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin chuyến đi
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{route.route.from}</p>
                        <p className="text-sm text-gray-600">Điểm đi</p> 
                      </div>
                      <div className="flex-1 flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-gray-300 relative">
                          <Car className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white" />
                        </div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-900">{route.route.to}</p>
                        <p className="text-sm text-gray-600">Điểm đến</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Thời gian di chuyển</p>
                        <p className="font-medium">{route.route.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin xe
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Mã tuyến: {route.routeCode}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{route.operator.rating}</span>
                        <span className="text-xs text-gray-500">ID: {route.operator.partnerId}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{route.bus.type}</p>
                      <p className="text-sm text-gray-600">Biển số: {route.bus.plateNumber}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Mô tả xe</p>
                    <div className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                      {route.bus.description || "Không có mô tả"}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Tổng số ghế: <span className="font-medium">{route.bus.totalSeats}</span>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        Còn {route.bus.availableSeats} chỗ trống
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin giá vé
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá vé cơ bản</span>
                    <span className="font-medium">{formatPrice(route.pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí dịch vụ</span>
                    <span className="font-medium">{formatPrice(route.pricing.fees)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">{formatPrice(route.pricing.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

          
      
            </div>

            {/* Booking Action and Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Car className="w-12 h-12 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Sẵn sàng đặt vé?</h4>
                  <p className="text-sm text-gray-600">
                    Điền thông tin và hoàn tất thanh toán
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleBookTicket}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
                  >
                    <Users className="w-5 h-5 mr-2" />
                   Đặt vé
                  </Button>
                  <div className="text-center text-2xl font-bold text-blue-600">
                    {formatPrice(route.pricing.total)}
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Giá vé cho 1 hành khách
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-1">Thông tin chuyến xe</p>
                      <ul className="text-green-700 space-y-1">
                        <li>• Mã tuyến: {route.routeCode}</li>
                        <li>• Loại xe: {route.bus.type}</li>
                        <li>• {route.bus.description}</li>
                        <li>• Còn {route.bus.availableSeats}/{route.bus.totalSeats} chỗ trống</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <Phone className="w-4 h-4 mr-1" />
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* How to Book */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quy trình đặt vé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nhập thông tin</p>
                  <p className="text-sm text-gray-600">Điền thông tin hành khách</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Thanh toán</p>
                  <p className="text-sm text-gray-600">Hoàn tất và nhận vé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
