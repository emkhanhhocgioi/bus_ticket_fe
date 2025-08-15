"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useWebSocket, useWebSocketHelpers } from '@/context/WebSocketContext';
import NavigationBar from "@/components/navigation/navigationbar"
import { getRouteDataById } from "@/api/routes"
import { 
  createOrder, 
  Order 
} from "@/api/order"
import { 
  CheckCircle, 
  Clock,
  MapPin,
  Car,
  RefreshCw,
  Phone,
  Copy,
  Download,
  Share,
  AlertCircle,
  FileText,
  Lock,
  Shield,
  User
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

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

interface UserInfo {
  fullName: string
  phone: string
  email: string
  idCard: string
  dateOfBirth: string
  gender: string
}

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()

  const { isConnected, messages } = useWebSocket();
  const { sendBookingNotification } = useWebSocketHelpers();
  const { user, token } = useAuth()
  const routeId = params.id
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResponse, setOrderResponse] = useState<any>(null)
  const [submitError, setSubmitError] = useState<string>('')
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: '',
    phone: '',
    email: '',
    idCard: '',
    dateOfBirth: '',
    gender: 'male'
  })

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true)
      
      try {
        const response = await getRouteDataById(routeId as string)
        const routeResponseData = response?.response?.route || response?.route || response
        
        if (!routeResponseData || !routeResponseData._id) {
          setRoute(null)
          return
        }
        
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
            fees: Math.round(routeResponseData.price * 0.025),
            total: Math.round(routeResponseData.price * 1.025)
          },
          isActive: routeResponseData.isActive,
          createdAt: routeResponseData.createdAt
        }
        
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

  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { fullName, phone, email } = userInfo
    return fullName && phone && email
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (!route) {
      setSubmitError('Không tìm thấy thông tin chuyến xe')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepare order data - always use cash payment method
      const orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'> = {
        routeId: route.id,
        bussinessId: route.operator.partnerId,
        userId: user?.id,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
        email: userInfo.email,
        paymentMethod: 'cash', // Always use cash payment
        basePrice: route.pricing.total,
        orderStatus: 'pending'
      }

      
      const response = await createOrder(orderData, token || undefined)

      const notificationdata = {
        userId: user?.id,
        fromId: route.operator.partnerId,
        content: "Bạn vừa nhận được một thông báo đặt vé mới",
      }
      console.log("Sending booking notification:", notificationdata)
      sendBookingNotification(notificationdata)

      console.log(response.data)
      setOrderResponse(response)
      
     
      router.push('/order')
      
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
            <Button onClick={() => router.back()} className="mt-4">
              Quay lại
            </Button>
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
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Xác nhận đặt vé</h1>
            <p className="text-blue-100 text-lg">
              Điền thông tin và hoàn tất thanh toán
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Route Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin chuyến đi
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{route.route.from}</p>
                    <p className="text-sm text-gray-600">Điểm đi</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center space-x-2 mx-4">
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
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Mã tuyến</p>
                    <p className="font-medium">{route.routeCode}</p>
                  </div>
                  <div>
               
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại xe</p>
                    <p className="font-medium">{route.bus.type}</p>
                  </div>
                </div>
              </div>

              {/* User Information Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Thông tin hành khách
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={userInfo.fullName}
                      onChange={(e) => handleUserInfoChange('fullName', e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                      placeholder="0xxx xxx xxx"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleUserInfoChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={userInfo.dateOfBirth}
                      onChange={(e) => handleUserInfoChange('dateOfBirth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Giới tính</Label>
                    <select
                      id="gender"
                      value={userInfo.gender}
                      onChange={(e) => handleUserInfoChange('gender', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                {/* Price Summary */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá vé</span>
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

                {/* Security Info */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800 mb-1">Thanh toán bảo mật</p>
                      <p className="text-green-700">
                        Thông tin của bạn được mã hóa và bảo vệ an toàn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span>{submitError}</span>
                    </div>
                  </div>
                )}

                {/* Form Validation Warning */}
                {!validateForm() && (
                  <div className="text-sm text-gray-600 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span>Vui lòng điền đầy đủ thông tin bắt buộc (*) để tiếp tục</span>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateForm()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-lg py-3 mb-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Tạo order
                    </>
                  )}
                </Button>

                {/* Contact Support */}
                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <Phone className="w-4 h-4 mr-1" />
                    Cần hỗ trợ?
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
