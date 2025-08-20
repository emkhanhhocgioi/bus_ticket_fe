"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation/navigationbar"
import { getRoutes } from "@/api/routes"
import { getRouteReviews } from "@/api/review"
import { 
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Car,
  Users,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Partner {
  _id: string;
  routeCode: string;
  partnerId: string;
  from: string;
  to: string;
  departureTime: string;
  duration: string;
  price: number;
  busType: string;
  licensePlate: string;
  rating?: number;
  images?: string[];
  partnerInfo?: {
    _id: string;
    company: string;
    phone: string;
    email: string;
  };
}

interface Review {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const partnerId = params.partnerId as string
  
  const [companyInfo, setCompanyInfo] = useState<Partner | null>(null)
  const [routes, setRoutes] = useState<Partner[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("routes")

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true)
        const response = await getRoutes(partnerId)
        
        let routesData = []
        if (Array.isArray(response)) {
          routesData = response
        } else if (response && response.data && Array.isArray(response.data)) {
          routesData = response.data
        }

        // Set company info from first route
        if (routesData.length > 0) {
          setCompanyInfo(routesData[0])
        }
        
        // Set all routes for this partner
        setRoutes(routesData)
      } catch (error) {
        console.error("Failed to fetch company data:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        // Since we need routeId for reviews, we'll fetch after getting routes
        if (routes.length > 0) {
          const allReviews = []
          for (const route of routes.slice(0, 3)) { // Get reviews for first 3 routes
            try {
              const routeReviews = await getRouteReviews(route._id)
              if (Array.isArray(routeReviews)) {
                allReviews.push(...routeReviews)
              }
            } catch (error) {
              console.error(`Failed to fetch reviews for route ${route._id}:`, error)
            }
          }
          setReviews(allReviews)
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (partnerId) {
      fetchCompanyData()
    }
  }, [partnerId])

  useEffect(() => {
    if (routes.length > 0) {
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true)
          const allReviews = []
          for (const route of routes.slice(0, 3)) {
            try {
              const routeReviews = await getRouteReviews(route._id)
              if (Array.isArray(routeReviews)) {
                allReviews.push(...routeReviews)
              }
            } catch (error) {
              console.error(`Failed to fetch reviews for route ${route._id}:`, error)
            }
          }
          setReviews(allReviews)
        } catch (error) {
          console.error("Failed to fetch reviews:", error)
        } finally {
          setReviewsLoading(false)
        }
      }
      fetchReviews()
    }
  }, [routes])

  const calculateAverageRating = (): number => {
    if (reviews.length === 0) return 0
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return parseFloat((totalRating / reviews.length).toFixed(1))
  }

  if (loading || !companyInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar currentPage="home" />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="h-48 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="home" />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          {/* Company Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              {companyInfo.images && companyInfo.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={companyInfo.images[0]} 
                  alt={companyInfo.partnerInfo?.company || 'Company'} 
                  className="w-full h-64 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Car className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {companyInfo.partnerInfo?.company || 'Nhà xe'}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               
               
                <div className="flex items-center space-x-3">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span>{routes.length} tuyến đường</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Thông tin nổi bật</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Đa dạng các loại xe: {[...new Set(routes.map(r => r.busType))].join(', ')}</li>
                  <li>• Phục vụ {routes.length} tuyến đường khác nhau</li>
                  
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("routes")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "routes" 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Tuyến đường ({routes.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "reviews" 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "routes" && (
              <div className="space-y-4">
                {routes.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chưa có tuyến đường nào
                    </h3>
                    <p className="text-gray-600">
                      Nhà xe này chưa có tuyến đường nào được đăng ký.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {routes.map((route, index) => (
                      <div key={route._id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-lg">{route.from} → {route.to}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Khởi hành: {route.departureTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{route.busType}</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Thời gian: {route.duration} • Biển số: {route.licensePlate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {route.price.toLocaleString('vi-VN')}đ
                            </div>
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => router.push(`/ticket/${route._id}`)}
                            >
                              Đặt vé
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chưa có đánh giá nào
                    </h3>
                    <p className="text-gray-600">
                      Nhà xe này chưa có đánh giá từ khách hàng.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">Tổng quan đánh giá</h3>
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl font-bold text-blue-600">
                          {calculateAverageRating().toFixed(1)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${
                                  i < Math.round(calculateAverageRating()) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <div className="text-gray-600">
                            Dựa trên {reviews.length} đánh giá
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <div key={review._id || index} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user?.name?.[0] || review.user?.email?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold">
                                  {review.user?.name || review.user?.email || 'Khách hàng'}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${
                                        i < review.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                              {review.images && review.images.length > 0 && (
                                <div className="flex space-x-2 mt-3">
                                  {review.images.map((image, imgIndex) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      key={imgIndex}
                                      src={image} 
                                      alt={`Review ${imgIndex + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
