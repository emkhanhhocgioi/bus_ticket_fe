"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavigationBar from "@/components/navigation/navigationbar"
import vietnamProvinces from "@/constant/province"
import { getPopularRoutes } from "@/api/routes"
import { 
  Search, 
  ArrowLeftRight, 
  Calendar, 
  CheckCircle, 
  Headphones, 
  Gift,
  CreditCard,
  Star,
  MapPin,
  Clock,
  Shield,

  Car,
  Plane,
  Train
} from "lucide-react"

import { useRouter } from "next/navigation"



interface PopularRoute {
  _id?: string;
  from: string;
  to: string;
  price: string;
  originalPrice?: string;
  partnerId?: string;
  images?: string[];
  partnerInfo?: {
    _id: string;
    company: string;
    phone: string;
    email: string;
  };
}

interface FeaturedPartner {
  _id: string;
  company: string;
  phone: string;
  email: string;
  image?: string;
  routeCount: number;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("bus")
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([])
  const [featuredPartners, setFeaturedPartners] = useState<FeaturedPartner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        setLoading(true)
        const response = await getPopularRoutes()
        
        // Handle different possible response formats
        let routesData = []
        if (Array.isArray(response)) {
          routesData = response
        } else if (response && response.data && Array.isArray(response.data)) {
          routesData = response.data
        } else if (response && response.routes && Array.isArray(response.routes)) {
          routesData = response.routes
        }

        // Transform the data to match our interface
        const transformedRoutes = routesData.map((route: any) => ({
          _id: route._id,
          from: route.from || route.origin || route.departure || '',
          to: route.to || route.destination || route.arrival || '',
          price: route.price ? `${Number(route.price).toLocaleString('vi-VN')}đ` : route.formattedPrice || '0đ',
          originalPrice: route.originalPrice ? `${Number(route.originalPrice).toLocaleString('vi-VN')}đ` : undefined,
          partnerId: route.partnerId,
          images: route.images || [],
          partnerInfo: route.partnerInfo
        }))

        setPopularRoutes(transformedRoutes.length > 0 ? transformedRoutes : [
          { from: "Sài Gòn", to: "Đà Lạt", price: "199.000đ", originalPrice: "400.000đ" },
          { from: "Sài Gòn", to: "Nha Trang", price: "200.000đ" },
          { from: "Sài Gòn", to: "Phan Thiết", price: "160.000đ", originalPrice: "180.000đ" },
          { from: "Nha Trang", to: "Sài Gòn", price: "200.000đ" },
        ])

        // Extract featured partners from routes with partnerInfo
        const partners = new Map<string, FeaturedPartner>()
        
        routesData.forEach((route: any) => {
          if (route.partnerInfo && route.partnerInfo._id) {
            const partnerId = route.partnerInfo._id
            if (partners.has(partnerId)) {
              const existing = partners.get(partnerId)!
              partners.set(partnerId, {
                ...existing,
                routeCount: existing.routeCount + 1
              })
            } else {
              partners.set(partnerId, {
                _id: route.partnerInfo._id,
                company: route.partnerInfo.company,
                phone: route.partnerInfo.phone,
                email: route.partnerInfo.email,
                image: route.images && route.images.length > 0 ? route.images[0] : undefined,
                routeCount: 1
              })
            }
          }
        })

        setFeaturedPartners(Array.from(partners.values()))
      } catch (error) {
        console.error("Failed to fetch popular routes:", error)
        // Fallback data if API fails
        setPopularRoutes([
          { from: "Sài Gòn", to: "Đà Lạt", price: "199.000đ", originalPrice: "400.000đ" },
          { from: "Sài Gòn", to: "Nha Trang", price: "200.000đ" },
          { from: "Sài Gòn", to: "Phan Thiết", price: "160.000đ", originalPrice: "180.000đ" },
          { from: "Nha Trang", to: "Sài Gòn", price: "200.000đ" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPopularRoutes()
  }, [])

  const promotions = [
    {
      title: "Lương về chốt deal - Giảm đến 50%",
      subtitle: "vào ngày 25 hàng tháng",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Flash Sale đến 50%",
      subtitle: "12h - 14h Thứ 3",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Giảm đến 25%",
      subtitle: "khi đặt vé xe Sài Gòn - Đà Lạt/Lâm Đồng",
      image: "/api/placeholder/300/200"
    },
    {
      title: "Giảm 15%",
      subtitle: "khi đặt vé các nhà xe mới mở bán",
      image: "/api/placeholder/300/200"
    }
  ]

  const testimonials = [
    {
      name: "Anh Nguyễn Tuấn Quỳnh",
      position: "CEO Saigon Books",
      content: "Lần trước tôi có việc gấp phải đi công tác, lên mạng tìm đặt vé xe thì tình cờ tìm thấy Vexere. Sau khi tham khảo, tôi quyết định đặt vé và thanh toán. Công nhận rất tiện và nhanh chóng.",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Shark Phi",
      position: "Giám đốc BSSC",
      content: "Các đối tác của Vexere đều là những hãng xe lớn, có uy tín nên tôi hoàn toàn yên tâm khi lựa chọn đặt vé cho bản thân và gia đình. Nhờ hiển thị rõ nhà xe và vị trí chỗ trống trên xe.",
      avatar: "/api/placeholder/60/60"
    }
  ]
    const router = useRouter();
  const swapLocations = () => {
    const temp = fromLocation
    setFromLocation(toLocation)
    setToLocation(temp)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (fromLocation) params.set('from', fromLocation)
    if (toLocation) params.set('to', toLocation)
    if (departureDate) params.set('time', departureDate)
    
    router.push(`/search?${params.toString()}`)
  }

  const handleCompanyClick = (partnerId: string) => {
    router.push(`/company_detail/${partnerId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <NavigationBar currentPage="home" />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          {/* Guarantee Banner */}
          <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg mb-8 text-center">
            <span className="font-semibold">
              Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ vận chuyển (*)
            </span>
          </div>

          {/* Service Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
            {[
              { id: "bus", label: "Xe khách", icon: Car },
             
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors min-w-fit ${
                  activeTab === id 
                    ? "bg-white text-blue-600 shadow-md" 
                    : "bg-blue-700 hover:bg-blue-600 text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
               
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl p-6 text-black shadow-lg">
            <div className="grid gap-4 items-end grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Location Selection Container */}
              <div className="md:col-span-2 lg:col-span-2 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nơi xuất phát</label>
                    <div className="relative">
                      <Select value={fromLocation} onValueChange={setFromLocation}>
                        <SelectTrigger className="pr-10 h-12 w-full border border-gray-300 rounded-md bg-white">
                          <SelectValue placeholder="Chọn điểm đi" />
                        </SelectTrigger>
                        <SelectContent>
                          {vietnamProvinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Điểm đến</label>
                    <div className="relative">
                      <Select value={toLocation} onValueChange={setToLocation}>
                        <SelectTrigger className="pr-10 h-12 w-full border border-gray-300 rounded-md bg-white">
                          <SelectValue placeholder="Chọn điểm đến" />
                        </SelectTrigger>
                        <SelectContent>
                          {vietnamProvinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                </div>
              </div>
              

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thời gian khởi hành</label>
                <div className="relative flex items-center space-x-2">
                  <Input
                  type="time"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="pr-10 h-12 w-full border border-gray-300 rounded-md bg-white"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                  {departureDate && (parseInt(departureDate.split(":")[0]) >= 12 ? "PM" : "AM")}
                  </span>
                  <Clock className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between min-h-[20px]">
                  <label className="text-sm font-medium text-gray-700">
                    Tìm kiếm
                  </label>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 w-full"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              { icon: CheckCircle, text: "Chắc chắn có chỗ" },
              { icon: Headphones, text: "Hỗ trợ 24/7" },
              { icon: Gift, text: "Nhiều ưu đãi" },
              { icon: CreditCard, text: "Thanh toán đa dạng" }
            ].map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center space-x-3 text-yellow-300 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Tuyến đường phổ biến</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRoutes.map((route, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer bg-white">
                  <div className="text-lg font-semibold mb-3 text-gray-900">
                    {route.from} - {route.to}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {route.price.includes('đ') ? `Từ ${route.price}` : `Từ ${Number(route.price).toLocaleString('vi-VN')}đ`}
                    </span>
                    {route.originalPrice && (
                      <span className="text-gray-500 line-through text-sm">
                        {route.originalPrice.includes('đ') ? route.originalPrice : `${Number(route.originalPrice).toLocaleString('vi-VN')}đ`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Partners (Nhà xe nổi bật) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Nhà xe nổi bật</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredPartners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPartners.map((partner) => (
                <div 
                  key={partner._id} 
                  onClick={() => handleCompanyClick(partner._id)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {partner.image ? (
                      <img 
                        src={partner.image} 
                        alt={partner.company}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/300/200'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                        {partner.company.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">
                    {partner.company}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📞 {partner.phone}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {partner.routeCount} tuyến đường
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nhà xe nổi bật
              </h3>
              <p className="text-gray-600">
                Khám phá các nhà xe uy tín trên khắp cả nước. Click vào tuyến đường phổ biến để xem thêm thông tin chi tiết.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Khách hàng nói gì về Vexere</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.split(' ').slice(-1)[0].charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-1">{testimonial.name}</h4>
                    <p className="text-sm text-blue-600 mb-4 font-medium">{testimonial.position}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{testimonial.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Info */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Nền tảng kết nối người dùng và nhà xe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Car, 
                title: "2000+ nhà xe chất lượng cao", 
                description: "5000+ tuyến đường trên toàn quốc, chủ động và đa dạng lựa chọn." 
              },
              { 
                icon: Clock, 
                title: "Đặt vé dễ dàng", 
                description: "Đặt vé chỉ với 60s. Chọn xe yêu thích cực nhanh và thuận tiện." 
              },
              { 
                icon: Shield, 
                title: "Chắc chắn có chỗ", 
                description: "Hoàn ngay 150% nếu nhà xe không cung cấp dịch vụ vận chuyển, mang đến hành trình trọn vẹn." 
              },
              { 
                icon: Gift, 
                title: "Nhiều ưu đãi", 
                description: "Hàng ngàn ưu đãi cực chất độc quyền tại Vexere." 
              }
            ].map(({ icon: Icon, title, description }, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-colors">
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
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