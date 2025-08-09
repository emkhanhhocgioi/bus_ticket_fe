"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Home, FileText, Clock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NavigationBar from '@/components/navigation/navigationbar'
import { useEffect, useState, Suspense } from 'react'

function PaymentReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    // Lấy thông tin từ URL parameters
    const vnpAmount = searchParams.get('vnp_Amount')
    const vnpBankCode = searchParams.get('vnp_BankCode')
    const vnpBankTranNo = searchParams.get('vnp_BankTranNo')
    const vnpCardType = searchParams.get('vnp_CardType')
    const vnpOrderInfo = searchParams.get('vnp_OrderInfo')
    const vnpPayDate = searchParams.get('vnp_PayDate')
    const vnpResponseCode = searchParams.get('vnp_ResponseCode')
    const vnpTmnCode = searchParams.get('vnp_TmnCode')
    const vnpTransactionNo = searchParams.get('vnp_TransactionNo')
    const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus')
    const vnpTxnRef = searchParams.get('vnp_TxnRef')
    const vnpSecureHash = searchParams.get('vnp_SecureHash')

    if (vnpAmount) {
      setPaymentInfo({
        amount: parseInt(vnpAmount) / 100, // VNPay trả về số tiền x100
        bankCode: vnpBankCode,
        bankTranNo: vnpBankTranNo,
        cardType: vnpCardType,
        orderInfo: decodeURIComponent(vnpOrderInfo || ''),
        payDate: vnpPayDate,
        responseCode: vnpResponseCode,
        tmnCode: vnpTmnCode,
        transactionNo: vnpTransactionNo,
        transactionStatus: vnpTransactionStatus,
        txnRef: vnpTxnRef,
        secureHash: vnpSecureHash
      })
    }
  }, [searchParams])

  // Format payment date
  const formatPayDate = (payDate: string) => {
    if (!payDate) return ''
    // Format: 20250809223600 -> 09/08/2025 22:36:00
    const year = payDate.substring(0, 4)
    const month = payDate.substring(4, 6)
    const day = payDate.substring(6, 8)
    const hour = payDate.substring(8, 10)
    const minute = payDate.substring(10, 12)
    const second = payDate.substring(12, 14)
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Check if payment is successful
  const isPaymentSuccess = paymentInfo?.responseCode === '00' && paymentInfo?.transactionStatus === '00'

  // Get bank name from code
  const getBankName = (bankCode: string) => {
    const bankNames: { [key: string]: string } = {
      'NCB': 'Ngân hàng NCB',
      'VCB': 'Ngân hàng Vietcombank',
      'TCB': 'Ngân hàng Techcombank',
      'BIDV': 'Ngân hàng BIDV',
      'VTB': 'Ngân hàng Vietinbank',
      'MB': 'Ngân hàng MB Bank',
      'ACB': 'Ngân hàng ACB',
      'SHB': 'Ngân hàng SHB',
      'VPB': 'Ngân hàng VPBank',
      'TPB': 'Ngân hàng TPBank'
    }
    return bankNames[bankCode] || bankCode
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="order" />
      
      {/* Header */}
      <section className={`${isPaymentSuccess ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white py-12`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Kết quả thanh toán</h1>
            <p className="text-lg opacity-90">
              {isPaymentSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {paymentInfo ? (
            <>
              {/* Payment Result Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                {/* Status Header */}
                <div className={`${isPaymentSuccess ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} border-b p-6`}>
                  <div className="text-center">
                    {isPaymentSuccess ? (
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                    )}
                    <h2 className={`text-2xl font-bold ${isPaymentSuccess ? 'text-green-800' : 'text-red-800'} mt-4 mb-2`}>
                      {isPaymentSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                    </h2>
                    <p className={`${isPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                      {isPaymentSuccess 
                        ? 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi'
                        : 'Giao dịch không thể hoàn thành. Vui lòng thử lại.'
                      }
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin giao dịch
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-medium text-gray-900">{paymentInfo.txnRef}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-medium text-gray-900 text-lg text-green-600">
                          {formatCurrency(paymentInfo.amount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`font-medium ${isPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                          {isPaymentSuccess ? 'Đã thanh toán' : 'Thất bại'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatPayDate(paymentInfo.payDate)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Mã giao dịch:</span>
                        <span className="font-medium text-gray-900">{paymentInfo.transactionNo}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-medium text-gray-900">
                          {getBankName(paymentInfo.bankCode)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Loại thẻ:</span>
                        <span className="font-medium text-gray-900 flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {paymentInfo.cardType}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Mã GD ngân hàng:</span>
                        <span className="font-medium text-gray-900">{paymentInfo.bankTranNo}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Mã phản hồi:</span>
                        <span className="font-medium text-gray-900">{paymentInfo.responseCode}</span>
                      </div>
                      
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Terminal Code:</span>
                        <span className="font-medium text-gray-900">{paymentInfo.tmnCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Thông tin đơn hàng:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {paymentInfo.orderInfo}
                    </p>
                  </div>

                  {/* Security Hash */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Mã bảo mật:</h4>
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg break-all font-mono">
                      {paymentInfo.secureHash}
                    </p>
                  </div>
                </div>
              </div>

              {/* Success/Error Message */}
              <div className={`${isPaymentSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6 mb-8`}>
                <div className="text-center">
                  <h3 className={`text-lg font-semibold ${isPaymentSuccess ? 'text-green-800' : 'text-red-800'} mb-2`}>
                    {isPaymentSuccess 
                      ? 'Thanh toán đã được xử lý thành công!'
                      : 'Thanh toán không thành công!'
                    }
                  </h3>
                  <p className={`${isPaymentSuccess ? 'text-green-700' : 'text-red-700'} mb-4`}>
                    {isPaymentSuccess 
                      ? 'Vé của bạn đã được xác nhận và thông tin đã được gửi qua email.'
                      : 'Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ với chúng tôi để được hỗ trợ.'
                    }
                  </p>
                  <p className={`text-sm ${isPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {isPaymentSuccess 
                      ? 'Bạn có thể in vé hoặc hiển thị mã QR trên điện thoại khi lên xe.'
                      : 'Mã lỗi: ' + paymentInfo.responseCode
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isPaymentSuccess ? (
                  <Button 
                    onClick={() => router.push('/order')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xem vé của tôi
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push('/search')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Thử lại đặt vé
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/home')}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </div>

              {/* Additional Information */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Thông tin quan trọng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {isPaymentSuccess ? (
                    <>
                      <li>• Vui lòng mang theo giấy tờ tùy thân khi lên xe</li>
                      <li>• Có mặt tại bến xe trước giờ khởi hành 15 phút</li>
                      <li>• Liên hệ hotline 1900 1234 nếu cần hỗ trợ</li>
                    </>
                  ) : (
                    <>
                      <li>• Kiểm tra lại thông tin thẻ và số dư tài khoản</li>
                      <li>• Thử lại với phương thức thanh toán khác</li>
                      <li>• Liên hệ hotline 1900 1234 để được hỗ trợ</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Đang tải thông tin thanh toán...</h2>
              <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// Loading component for Suspense fallback
function PaymentReturnLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="order" />
      
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Kết quả thanh toán</h1>
            <p className="text-lg opacity-90">Đang xử lý thông tin...</p>
          </div>
        </div>
      </section>

      {/* Loading Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Đang tải thông tin thanh toán...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<PaymentReturnLoading />}>
      <PaymentReturnContent />
    </Suspense>
  )
}