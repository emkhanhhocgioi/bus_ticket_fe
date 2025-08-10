"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import NavigationBar from "@/components/navigation/navigationbar"
import { getRouteDataById } from "@/api/routes"
import { 
  createOrder, 
  createVNpayment, 
  createVnpayqrcode,
  handleVnpayReturn,
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
  CreditCard,
  Download,
  Share,
  QrCode,
  AlertCircle,
  FileText,
  Lock,
  Shield,
  User,
  CreditCard as CreditCardIcon,
  Banknote,
  X,
  Check
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import QRCode from 'qrcode'

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
  type: 'cash' | 'vnpay'
  name: string
  icon: any
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    type: 'vnpay',
    name: 'VNPay',
    icon: CreditCardIcon,
    description: 'Thanh toán qua VNPay - An toàn, nhanh chóng'
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
  const { user, token } = useAuth()
  const routeId = params.id
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<RouteDetails | null>(null)
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
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod['type']>('vnpay')
  
  const [selectedBank, setSelectedBank] = useState('')
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    message: string
    orderId?: string
  } | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<{
    orderId?: string
    amount?: number
    orderInfo?: string
    clientIP?: string
    expiryTime?: string
    qrString?: string
    paymentUrl?: string
    expiryMinutes?: number
    createdAt?: string
  } | null>(null)
  const [ticketQRCode, setTicketQRCode] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrCountdown, setQrCountdown] = useState<number>(0)
  const [qrCodeImage, setQrCodeImage] = useState<string>('')

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

  // Handle VNPay return
  useEffect(() => {
    const handleVNPayReturn = async () => {
      // Check if this is a VNPay return by looking for VNPay parameters in URL
      const urlParams = new URLSearchParams(window.location.search)
      const vnpResponseCode = urlParams.get('vnp_ResponseCode')
      const vnpTransactionStatus = urlParams.get('vnp_TransactionStatus')
      const vnpOrderInfo = urlParams.get('vnp_OrderInfo')
      
      if (vnpResponseCode !== null) {
        setIsCheckingPayment(true)
        setShowQRModal(false) // Close QR modal if open
        
        try {
          // Convert URLSearchParams to plain object
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
          } else {
            setPaymentResult({
              success: false,
              message: result.message || 'Thanh toán thất bại!'
            })
            setSubmitError(result.message || 'Thanh toán thất bại!')
          }
        } catch (error: any) {
          console.error('Error handling VNPay return:', error)
          setPaymentResult({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
          })
          setSubmitError('Có lỗi xảy ra khi xử lý kết quả thanh toán')
        } finally {
          setIsCheckingPayment(false)
          
          // Clean URL by removing VNPay parameters
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        }
      }
    }

    handleVNPayReturn()
  }, [])

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

  // Function to generate QR code image from QR string
  const generateQRCodeImage = async (qrString: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      console.error('Error generating QR code image:', error)
      return null
    }
  }

  // Function to generate ticket QR code
  const generateTicketQRCode = async (orderId?: string) => {
    setIsGeneratingQR(true)
    try {
      const ticketData = {
        orderId: orderId || paymentResult?.orderId || orderResponse?.order?._id || `BT${Date.now()}`,
        route: `${route?.route.from} → ${route?.route.to}`,
        passenger: userInfo.fullName,
        phone: userInfo.phone,
        amount: route?.pricing.total,
        timestamp: new Date().toISOString(),
        routeCode: route?.routeCode
      }
      
      const qrDataString = JSON.stringify(ticketData)
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      
      setTicketQRCode(qrCodeDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Countdown timer for QR expiry
  useEffect(() => {
    if (qrCountdown > 0) {
      const timer = setTimeout(() => setQrCountdown(qrCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [qrCountdown])

  // Set countdown when QR code data is available
  useEffect(() => {
    if (qrCodeData?.expiryTime) {
      const expiryTime = new Date(qrCodeData.expiryTime).getTime()
      const now = new Date().getTime()
      const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000))
      setQrCountdown(timeLeft)
    }
  }, [qrCodeData?.expiryTime])

  // Generate QR code image when QR string is available
  useEffect(() => {
    const generateImage = async () => {
      if (qrCodeData?.qrString && !qrCodeImage) {
        const imageUrl = await generateQRCodeImage(qrCodeData.qrString)
        if (imageUrl) {
          setQrCodeImage(imageUrl)
        }
      }
    }
    generateImage()
  }, [qrCodeData?.qrString, qrCodeImage])

  // Auto-generate ticket QR code when success modal is shown
  useEffect(() => {
    if (showSuccessModal && !ticketQRCode && (paymentResult?.orderId || orderResponse?.order?._id)) {
      generateTicketQRCode(paymentResult?.orderId || orderResponse?.order?._id)
    }
  }, [showSuccessModal, paymentResult?.orderId, orderResponse?.order?._id])

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
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
        bussinessId: route.operator.partnerId,
        userId: user?.id,
        fullName: userInfo.fullName,
        phone: userInfo.phone,
        email: userInfo.email,
        paymentMethod: selectedPayment,
        basePrice: route.pricing.total,
        orderStatus: 'pending'
      }

      // Create order first
      const response = await createOrder(orderData, token || undefined)
      
      console.log(response.data)

      const orderId = response.data.orderId

      // Handle payment based on selected method
      switch (selectedPayment) {
        case 'vnpay': {
          const orderInfo = `Thanh toán vé xe ${route.route.from} - ${route.route.to} - ${userInfo.fullName}`
          const bankCode = selectedBank || 'VNPAYQR'
          
          try {
            // If no bank is selected or QR is specifically chosen, use QR code
            if (!selectedBank || selectedBank === '') {
              const qrResponse = await createVnpayqrcode(
                orderId,
                route.pricing.total,
                orderInfo,
                'VNPAYQR',
                'vn',
                15, // 15 minutes expiry
                token || ''
              )
              
              if (qrResponse?.success && qrResponse?.data) {
                const qrData = qrResponse.data
                console.log('QR Response Data:', qrData) // Debug log
                
                // Generate QR code image from qrString
                let qrImageUrl = ''
                if (qrData.qrString) {
                  qrImageUrl = await generateQRCodeImage(qrData.qrString) || ''
                  console.log('Generated QR Image URL:', qrImageUrl ? 'Success' : 'Failed') // Debug log
                }
                
                setQrCodeData({
                  orderId: qrData.orderId,
                  amount: qrData.amount,
                  orderInfo: qrData.orderInfo,
                  clientIP: qrData.clientIP,
                  expiryTime: qrData.expiryTime,
                  qrString: qrData.qrString,
                  paymentUrl: qrData.paymentUrl,
                  expiryMinutes: qrData.expiryMinutes,
                  createdAt: qrData.createdAt
                })
                setQrCodeImage(qrImageUrl)
                setShowQRModal(true)
                return
              }
            } else {
              // Use regular VNPay with bank selection
              const vnpayResponse = await createVNpayment(
                orderId,
                route.pricing.total,
                orderInfo,
                bankCode,
                'vn',
                token || ''
              )
              
              if (vnpayResponse?.data.paymentUrl) {
                window.location.href = vnpayResponse.data.paymentUrl
                return
              }
            }
          } catch (vnpayError: any) {
            console.error('VNPay payment error:', vnpayError)
            throw new Error('Có lỗi xảy ra khi tạo thanh toán VNPay. Vui lòng thử lại.')
          }
          break
        }
       

        case 'cash':
        default: {
          // For cash payment, just show success modal
          setOrderResponse(response)
          setShowSuccessModal(true)
          break
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const QRModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Thanh toán VNPay QR</h2>
            <p className="text-blue-100">Quét mã QR để thanh toán</p>
            {qrCountdown > 0 && (
              <div className="mt-2 flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm font-mono">{formatCountdown(qrCountdown)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* QR Code Display */}
          <div className="text-center mb-6">
            {qrCodeImage ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={qrCodeImage} 
                  alt="VNPay QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            ) : qrCodeData?.qrString ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <div className="w-48 h-48 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Đang tạo mã QR...</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            )}
            <p className="text-sm text-gray-600 mt-3">
              Mở ứng dụng ngân hàng và quét mã QR để thanh toán
            </p>
            
            {/* QR String Info for debugging */}
            {qrCodeData?.qrString && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeData.qrString || '')
                    // You could add a toast notification here
                  }}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Sao chép mã QR
                </Button>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-lg text-blue-600">
                  {qrCodeData?.amount ? formatPrice(qrCodeData.amount / 100) : (route ? formatPrice(route.pricing.total) : '0đ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm">
                  {qrCodeData?.orderId ? qrCodeData.orderId.slice(-8).toUpperCase() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nội dung:</span>
                <span className="font-medium text-right text-xs">
                  {qrCodeData?.orderInfo || `Thanh toán vé xe ${route?.route.from} - ${route?.route.to}`}
                </span>
              </div>
              {qrCodeData?.expiryTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hết hạn:</span>
                  <span className={`font-medium ${qrCountdown <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
                    {qrCountdown > 0 ? formatCountdown(qrCountdown) : 'Đã hết hạn'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn thanh toán</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Mở ứng dụng ngân hàng trên điện thoại</li>
              <li>Chọn tính năng quét mã QR</li>
              <li>Quét mã QR trên màn hình</li>
              <li>Xác nhận thanh toán trên ứng dụng ngân hàng</li>
              <li>Chờ xử lý và nhận kết quả</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {qrCountdown <= 0 && qrCodeData?.qrString && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  // Regenerate QR code
                  const orderInfo = `Thanh toán vé xe ${route?.route.from} - ${route?.route.to} - ${userInfo.fullName}`
                  const orderId = qrCodeData?.orderId
                  if (orderId && route && token) {
                    try {
                      const qrResponse = await createVnpayqrcode(
                        orderId,
                        route.pricing.total,
                        orderInfo,
                        'VNPAYQR',
                        'vn',
                        15,
                        token
                      )
                      
                      if (qrResponse?.success && qrResponse?.data) {
                        const qrData = qrResponse.data
                        
                        // Generate QR code image from qrString
                        let qrImageUrl = ''
                        if (qrData.qrString) {
                          qrImageUrl = await generateQRCodeImage(qrData.qrString) || ''
                        }
                        
                        setQrCodeData({
                          orderId: qrData.orderId,
                          amount: qrData.amount,
                          orderInfo: qrData.orderInfo,
                          clientIP: qrData.clientIP,
                          expiryTime: qrData.expiryTime,
                          qrString: qrData.qrString,
                          paymentUrl: qrData.paymentUrl,
                          expiryMinutes: qrData.expiryMinutes,
                          createdAt: qrData.createdAt
                        })
                        setQrCodeImage(qrImageUrl)
                      }
                    } catch (error) {
                      console.error('Error refreshing QR code:', error)
                    }
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới mã QR
              </Button>
            )}
            
            {/* Alternative payment URL button */}
            {qrCodeData?.paymentUrl && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  window.open(qrCodeData.paymentUrl, '_blank')
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Thanh toán qua website
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowQRModal(false)
                setQrCodeData(null)
                setQrCodeImage('')
              }}
            >
              Hủy thanh toán
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Sau khi thanh toán thành công, trang sẽ tự động cập nhật
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setShowQRModal(false)
            setQrCodeData(null)
            setQrCodeImage('')
          }}
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )

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
                  {paymentResult?.orderId?.slice(-8).toUpperCase() || 
                   orderResponse?.order?._id?.slice(-8).toUpperCase() || 
                   `BT${Date.now().toString().slice(-6)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuyến:</span>
                <span className="font-medium">{route?.route.from} → {route?.route.to}</span>
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
            <div className="relative">
              {ticketQRCode ? (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img 
                    src={ticketQRCode} 
                    alt="Mã QR vé xe" 
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {!ticketQRCode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => generateTicketQRCode(paymentResult?.orderId || orderResponse?.order?._id)}
                  disabled={isGeneratingQR}
                >
                  {isGeneratingQR ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Tạo mã QR
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {ticketQRCode ? 'Mã QR vé xe của bạn' : 'Nhấn để tạo mã QR vé xe'}
            </p>
            {ticketQRCode && (
              <div className="mt-2 space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const ticketInfo = `Mã vé: ${paymentResult?.orderId?.slice(-8).toUpperCase() || 
                                        orderResponse?.order?._id?.slice(-8).toUpperCase() || 
                                        `BT${Date.now().toString().slice(-6)}`}\n` +
                                     `Tuyến: ${route?.route.from} → ${route?.route.to}\n` +
                                     `Hành khách: ${userInfo.fullName}\n` +
                                     `SĐT: ${userInfo.phone}`
                    navigator.clipboard.writeText(ticketInfo)
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Sao chép
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateTicketQRCode(paymentResult?.orderId || orderResponse?.order?._id)}
                  disabled={isGeneratingQR}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Làm mới
                </Button>
              </div>
            )}
          </div>

          {/* Success Message */}
          {(orderResponse?.success || paymentResult?.success) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  {paymentResult?.message || orderResponse?.message || 'Đặt vé thành công!'}
                </p>
              </div>
              {paymentResult?.success && (
                <p className="text-green-700 text-sm mt-2">
                  Thanh toán VNPay đã được xử lý thành công.
                </p>
              )}
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

  // Show payment checking screen
  if (isCheckingPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="order" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show payment result if there's an error
  if (paymentResult && !paymentResult.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="order" />
        <div className="flex justify-center items-center py-20">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Thanh toán thất bại
            </h3>
            <p className="text-gray-600 mb-4">{paymentResult.message}</p>
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  setPaymentResult(null)
                  setSubmitError('')
                }}
                className="w-full"
              >
                Thử lại
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/home')}
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
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

                {/* VNPay Bank Selection */}
                {selectedPayment === 'vnpay' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Chọn phương thức thanh toán VNPay</h4>
                    <p className="text-sm text-gray-600">Chọn ngân hàng để chuyển hướng, hoặc chọn QR Code để thanh toán bằng mã QR</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBank('')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === '' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium flex items-center">
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
                        </div>
                        <div className="text-sm text-gray-600">Quét mã QR để thanh toán</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('VNBANK')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === 'VNBANK' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">VietinBank</div>
                        <div className="text-sm text-gray-600">Chuyển hướng đến VietinBank</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('VIETCOMBANK')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === 'VIETCOMBANK' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">Vietcombank</div>
                        <div className="text-sm text-gray-600">Chuyển hướng đến Vietcombank</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('BIDV')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === 'BIDV' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">BIDV</div>
                        <div className="text-sm text-gray-600">Chuyển hướng đến BIDV</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('AGRIBANK')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === 'AGRIBANK' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">Agribank</div>
                        <div className="text-sm text-gray-600">Chuyển hướng đến Agribank</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedBank('TECHCOMBANK')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedBank === 'TECHCOMBANK' 
                            ? 'border-blue-500 bg-blue-100' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium">Techcombank</div>
                        <div className="text-sm text-gray-600">Chuyển hướng đến Techcombank</div>
                      </button>
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
                      {selectedPayment === 'vnpay' 
                        ? selectedBank === '' 
                          ? 'Tạo mã QR thanh toán' 
                          : 'Thanh toán VNPay' 
                        : 'Thanh toán và đặt vé'
                      }
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

      {/* QR Modal */}
      {showQRModal && <QRModal />}

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </div>
  )
}
