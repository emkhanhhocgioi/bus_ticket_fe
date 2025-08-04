"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import NavigationBar from "@/components/navigation/navigationbar"
import { getRouteDataById } from "@/api/routes"
import { createOrder, Order } from "@/api/order"
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
  FileText,
  Lock,
  Shield,
  User,
  CreditCard as CreditCardIcon,
  Banknote,
  Smartphone,
  X,
  Check
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

interface UserInfo {
  fullName: string
  phone: string
  email: string
  idCard: string
  dateOfBirth: string
  gender: string
}

interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'e_wallet' | 'cash'
  name: string
  icon: any
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    type: 'credit_card',
    name: 'Thẻ tín dụng/Ghi nợ',
    icon: CreditCardIcon,
    description: 'Visa, Mastercard, JCB'
  },
  {
    type: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: Banknote,
    description: 'Vietcombank, VietinBank, BIDV'
  },
  {
    type: 'e_wallet',
    name: 'Ví điện tử',
    icon: Smartphone,
    description: 'MoMo, ZaloPay, ViettelPay'
  },
  {
    type: 'cash',
    name: 'Thanh toán khi lên xe',
    icon: Banknote,
    description: 'Trả tiền mặt cho tài xế'
  }
]

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteDetails | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<string>('A01') // Mock selected seat
  const [showSuccessModal, setShowSuccessModal] = useState(false)
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
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod['type']>('credit_card')
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  })

  // Fetch route data
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

  const handleCardInfoChange = (field: string, value: string) => {
    setCardInfo(prev => ({ ...prev, [field]: value }))
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
      // Prepare order data
      const orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'> = {
        routeId: route.id,
        seatNumber: selectedSeat,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
        email: userInfo.email,
        paymentMethod: selectedPayment,
        basePrice: route.pricing.total
      }

      // Create order
      const response = await createOrder(orderData)
      setOrderResponse(response)
      setShowSuccessModal(true)
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Đặt vé thành công!</h2>
            <p className="text-green-100">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin vé xe
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã vé:</span>
                <span className="font-mono font-semibold text-blue-600">
                  {orderResponse?.order?._id?.slice(-8).toUpperCase() || `BT${Date.now().toString().slice(-6)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuyến:</span>
                <span className="font-medium">{route?.route.from} → {route?.route.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số ghế:</span>
                <span className="font-medium">{selectedSeat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hành khách:</span>
                <span className="font-medium">{userInfo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SĐT:</span>
                <span className="font-medium">{userInfo.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-medium">
                  {paymentMethods.find(p => p.type === selectedPayment)?.name}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-lg text-green-600">{route ? formatPrice(route.pricing.total) : '0đ'}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">Mã QR vé xe của bạn</p>
          </div>

          {/* Success Message */}
          {orderResponse?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  {orderResponse.message || 'Đặt vé thành công!'}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng vé</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Đến bến xe trước 15 phút</li>
              <li>• Xuất trình mã QR hoặc mã vé</li>
              <li>• Mang theo giấy tờ tùy thân</li>
              <li>• Liên hệ hotline nếu cần hỗ trợ</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Download ticket logic here
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Tải vé điện tử
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // Share ticket logic here
              }}
            >
              <Share className="w-4 h-4 mr-2" />
              Chia sẻ thông tin vé
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false)
                router.push('/home')
              }}
            >
              Về trang chủ
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowSuccessModal(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )

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

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Phương thức thanh toán
                </h3>
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <div
                        key={method.type}
                        onClick={() => setSelectedPayment(method.type)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPayment === method.type
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedPayment === method.type && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Credit Card Form */}
                {selectedPayment === 'credit_card' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Thông tin thẻ</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Số thẻ</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          value={cardInfo.cardNumber}
                          onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">MM/YY</Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            value={cardInfo.expiryDate}
                            onChange={(e) => handleCardInfoChange('expiryDate', e.target.value)}
                            placeholder="12/25"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="text"
                            value={cardInfo.cvv}
                            onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                            placeholder="123"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardHolderName">Tên chủ thẻ</Label>
                        <Input
                          id="cardHolderName"
                          type="text"
                          value={cardInfo.cardHolderName}
                          onChange={(e) => handleCardInfoChange('cardHolderName', e.target.value)}
                          placeholder="NGUYEN VAN A"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                      Thanh toán và đặt vé
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

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </div>
  )
}
