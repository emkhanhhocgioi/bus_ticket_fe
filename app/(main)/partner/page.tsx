"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavigationBar from "@/components/navigation/navigationbar"
import { createPartner } from "@/api/auth"
import { 
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  Shield,
  TrendingUp,
  Clock,
  Star,
  Car,
  CreditCard,
  Award,
  Handshake
} from "lucide-react"

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    company: "",
    address: "",
    password: "",
    confirmPassword: "",
    city: "",
    businessLicense: "",
    vehicleCount: "",
    operatingYears: "",
    routes: "",
    website: "",
    description: ""
  })

  const [activeStep, setActiveStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const provinces = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn",
  "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng",
  "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn",
  "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An",
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];
  const [selectedProvince, setSelectedProvince] = useState("")
  const benefits = [
    {
      icon: TrendingUp,
      title: "Tăng doanh thu",
      description: "Tiếp cận hàng triệu khách hàng tiềm năng trên toàn quốc"
    },
    {
      icon: Users,
      title: "Quản lý dễ dàng",
      description: "Hệ thống quản lý đơn giản, hiệu quả và thân thiện"
    },
    {
      icon: Shield,
      title: "Bảo vệ quyền lợi",
      description: "Cam kết thanh toán đúng hạn và hỗ trợ 24/7"
    },
    {
      icon: Award,
      title: "Uy tín thương hiệu",
      description: "Tham gia vào hệ sinh thái vận tải uy tín hàng đầu"
    }
  ]

  const partnerTestimonials = [
    {
      name: "Anh Nguyễn Văn Minh",
      position: "Giám đốc Nhà xe Minh Phát",
      content: "Sau 2 năm hợp tác với Vexere, doanh thu của công ty chúng tôi đã tăng 300%. Khách hàng dễ dàng tìm thấy và đặt vé, còn chúng tôi chỉ cần tập trung vào chất lượng dịch vụ.",
      avatar: "/api/placeholder/60/60",
      rating: 5
    },
    {
      name: "Chị Trần Thị Lan",
      position: "Chủ tịch Nhà xe Hoàng Long",
      content: "Hệ thống quản lý của Vexere rất tiện lợi, giúp chúng tôi theo dõi được tình hình kinh doanh một cách chi tiết. Đội ngũ hỗ trợ luôn nhiệt tình và chuyên nghiệp.",
      avatar: "/api/placeholder/60/60",
      rating: 5
    }
  ]

  const steps = [
    { id: 1, title: "Thông tin cơ bản", description: "Thông tin công ty và liên hệ" },
    { id: 2, title: "Thông tin kinh doanh", description: "Chi tiết về hoạt động vận tải" },
    { id: 3, title: "Xác nhận", description: "Xem lại và gửi đăng ký" }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const validateForm = () => {
    // Check required fields for step 1
    if (activeStep === 1) {
      if (!formData.company.trim()) {
        setError("Vui lòng nhập tên công ty")
        return false
      }
      if (!formData.email.trim()) {
        setError("Vui lòng nhập email")
        return false
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Vui lòng nhập email hợp lệ")
        return false
      }
      if (!formData.phone.trim()) {
        setError("Vui lòng nhập số điện thoại")
        return false
      }
      // Phone validation (basic Vietnamese phone number)
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError("Vui lòng nhập số điện thoại hợp lệ")
        return false
      }
      if (!formData.address.trim()) {
        setError("Vui lòng nhập địa chỉ")
        return false
      }
      if (!formData.password.trim()) {
        setError("Vui lòng nhập mật khẩu")
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp")
        return false
      }
      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự")
        return false
      }
    }
    
    // Check required fields for step 2
    if (activeStep === 2) {
      if (!formData.businessLicense.trim()) {
        setError("Vui lòng nhập số giấy phép kinh doanh")
        return false
      }
      if (!formData.vehicleCount.trim()) {
        setError("Vui lòng nhập số lượng xe")
        return false
      }
      // Check if vehicle count is a valid number
      if (isNaN(parseInt(formData.vehicleCount)) || parseInt(formData.vehicleCount) <= 0) {
        setError("Số lượng xe phải là số nguyên dương")
        return false
      }
      if (!formData.operatingYears.trim()) {
        setError("Vui lòng nhập số năm hoạt động")
        return false
      }
      // Check if operating years is a valid number
      if (isNaN(parseInt(formData.operatingYears)) || parseInt(formData.operatingYears) <= 0) {
        setError("Số năm hoạt động phải là số nguyên dương")
        return false
      }
      if (!formData.routes.trim()) {
        setError("Vui lòng nhập các tuyến đường chính")
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      // Combine address and city
      const fullAddress = formData.city 
        ? `${formData.address}, ${formData.city}` 
        : formData.address;

      await createPartner(
        formData.company,
        formData.email,
        formData.phone,
        fullAddress,
        formData.password,
        parseInt(formData.vehicleCount) || 0,
        formData.description,
        parseInt(formData.operatingYears) || 0,
        formData.businessLicense,
        formData.website,
        formData.routes
      )
      
      setIsSuccess(true)
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          email: "",
          phone: "",
          company: "",
          address: "",
          password: "",
          confirmPassword: "",
          city: "",
          businessLicense: "",
          vehicleCount: "",
          operatingYears: "",
          routes: "",
          website: "",
          description: ""
        })
        setActiveStep(1)
        setIsSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep(activeStep + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavigationBar currentPage="partner" />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trở thành đối tác của Vexere
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Kết nối với hàng triệu khách hàng và phát triển doanh nghiệp vận tải của bạn
            </p>
            <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg inline-block">
              <span className="font-semibold">
                🎉 Miễn phí đăng ký - Hoa hồng cạnh tranh - Hỗ trợ 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Tại sao chọn Vexere làm đối tác?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <div key={index} className="text-center group hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Đăng ký trở thành đối tác
            </h2>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center space-x-3 ${index !== steps.length - 1 ? 'mr-4' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        activeStep >= step.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {activeStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.id}
                      </div>
                      <div className="hidden md:block">
                        <div className={`font-medium ${activeStep >= step.id ? 'text-blue-600' : 'text-gray-600'}`}>
                          {step.title}
                        </div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                      </div>
                    </div>
                    {index !== steps.length - 1 && (
                      <div className={`w-12 h-1 ${activeStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-600 font-medium">Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Tên công ty *</label>
                      <div className="relative">
                        <Input
                          placeholder="Nhập tên công ty"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email *</label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="email@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                      <div className="relative">
                        <Input
                          placeholder="0123456789"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Địa chỉ công ty *</label>
                    <div className="relative">
                      <Input
                        placeholder="Nhập địa chỉ đầy đủ"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="pl-10 h-12"
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Mật khẩu *</label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Nhập mật khẩu"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu *</label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Nhập lại mật khẩu"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province, index) => (
                          <SelectItem key={index} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">Thông tin kinh doanh</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Số giấy phép kinh doanh *</label>
                      <div className="relative">
                        <Input
                          placeholder="Nhập số giấy phép"
                          value={formData.businessLicense}
                          onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Số lượng xe *</label>
                      <div className="relative">
                        <Input
                          placeholder="Số xe hiện có"
                          value={formData.vehicleCount}
                          onChange={(e) => handleInputChange('vehicleCount', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Số năm hoạt động *</label>
                      <div className="relative">
                        <Input
                          placeholder="Năm kinh nghiệm"
                          value={formData.operatingYears}
                          onChange={(e) => handleInputChange('operatingYears', e.target.value)}
                          className="pl-10 h-12"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website (nếu có)</label>
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Các tuyến đường chính *</label>
                    <textarea
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ví dụ: Sài Gòn - Đà Lạt, Sài Gòn - Nha Trang..."
                      value={formData.routes}
                      onChange={(e) => handleInputChange('routes', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mô tả thêm về công ty</label>
                    <textarea
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Mô tả về dịch vụ, chất lượng xe, đội ngũ nhân viên..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-6 text-gray-900">Xác nhận thông tin</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Tên công ty:</span>
                        <p className="text-gray-900">{formData.company}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Điện thoại:</span>
                        <p className="text-gray-900">{formData.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Địa chỉ:</span>
                        <p className="text-gray-900">
                          {formData.city 
                            ? `${formData.address}, ${formData.city}` 
                            : formData.address
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Cam kết chất lượng</h4>
                        <p className="text-blue-800 text-sm">
                          Bằng việc đăng ký, bạn cam kết tuân thủ các tiêu chuẩn chất lượng dịch vụ của Vexere 
                          và cung cấp dịch vụ vận chuyển an toàn, đúng giờ cho khách hàng.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1 || isLoading}
                  className="px-6"
                >
                  Quay lại
                </Button>
                
                {activeStep < 3 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading || isSuccess}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Handshake className="w-5 h-5 mr-2" />
                        Gửi đăng ký
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Đối tác nói gì về Vexere
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partnerTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.split(' ').slice(-1)[0].charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-1">{testimonial.name}</h4>
                    <p className="text-sm text-green-600 mb-4 font-medium">{testimonial.position}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{testimonial.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Sẵn sàng bắt đầu hành trình cùng chúng tôi?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Hãy liên hệ với đội ngũ hỗ trợ của chúng tôi để được tư vấn chi tiết về quy trình hợp tác
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3">
              <Phone className="w-5 h-5 mr-2" />
              Gọi hotline: 1900 888 684
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3">
              <Mail className="w-5 h-5 mr-2" />
              Email: partner@vexere.com
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
              <h4 className="font-semibold mb-6 text-lg">Đối tác</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn đăng ký</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách hoa hồng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Quy định hợp tác</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hỗ trợ đối tác</a></li>
              </ul>
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
              <h4 className="font-semibold mb-6 text-lg">Liên hệ</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1900 888 684</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>partner@vexere.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>TP. Hồ Chí Minh</span>
                </li>
              </ul>
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
