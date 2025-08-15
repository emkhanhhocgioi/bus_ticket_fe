"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavigationBar from "@/components/navigation/navigationbar"
import vietnamProvinces from "@/constant/province"
import { 
  Search, 
  Calendar, 
  Clock,
  MapPin,
  Filter,
  Star,
  Wifi,
  Car,
  Users,
  CheckCircle,
  ArrowLeftRight,
  MessageCircle
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { searchRoutes } from "@/api/routes"
import { getRouteReviews } from "@/api/review"
import ViewReviewsDialog from "@/components/Dialog/ViewReviewsDialog"

interface BusRoute {
  id: string
  operator: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  originalPrice?: number
  discount?: string
  busType: string
  amenities: string[]
  rating: number
  reviewCount: number
  seatsAvailable: number
  totalSeats: number
  reviewsLoaded?: boolean
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Search form states
  const [fromLocation, setFromLocation] = useState(searchParams.get('from') || "")
  const [toLocation, setToLocation] = useState(searchParams.get('to') || "")
  const [departureTime, setDepartureTime] = useState(searchParams.get('time') || "")
  
  // Filter states
  const [sortBy, setSortBy] = useState("price")
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedOperators, setSelectedOperators] = useState<string[]>([])

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Bus routes from API
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([
    {
      id: "1",
      operator: "Phương Trang",
      departureTime: "06:00",
      arrivalTime: "12:30",
      duration: "6h 30m",
      price: 180000,
      originalPrice: 220000,
      discount: "18% OFF",
      busType: "Giường nằm 34 chỗ",
      amenities: ["Wifi", "Điều hòa", "Nước uống"],
      rating: 4.5,
      reviewCount: 1234,
      seatsAvailable: 12,
      totalSeats: 34
    },
    {
      id: "2", 
      operator: "Hoàng Long",
      departureTime: "08:15",
      arrivalTime: "14:45",
      duration: "6h 30m",
      price: 165000,
      busType: "Ghế ngồi 45 chỗ",
      amenities: ["Wifi", "Điều hòa"],
      rating: 4.2,
      reviewCount: 892,
      seatsAvailable: 8,
      totalSeats: 45
    },
    {
      id: "3",
      operator: "Mai Linh",
      departureTime: "10:30",
      arrivalTime: "17:00",
      duration: "6h 30m", 
      price: 195000,
      busType: "Giường nằm VIP 22 chỗ",
      amenities: ["Wifi", "Điều hòa", "Nước uống", "Chăn gối"],
      rating: 4.7,
      reviewCount: 567,
      seatsAvailable: 5,
      totalSeats: 22
    },
    {
      id: "4",
      operator: "Thành Bưởi",
      departureTime: "14:00",
      arrivalTime: "20:30",
      duration: "6h 30m",
      price: 175000,
      originalPrice: 200000,
      discount: "12% OFF",
      busType: "Giường nằm 40 chỗ",
      amenities: ["Wifi", "Điều hòa", "Nước uống"],
      rating: 4.3,
      reviewCount: 1089,
      seatsAvailable: 15,
      totalSeats: 40
    },
    {
      id: "5",
      operator: "Kumho Samco",
      departureTime: "16:45",
      arrivalTime: "23:15",
      duration: "6h 30m",
      price: 210000,
      busType: "Ghế ngồi VIP 28 chỗ",
      amenities: ["Wifi", "Điều hòa", "Nước uống", "Massage"],
      rating: 4.6,
      reviewCount: 743,
      seatsAvailable: 7,
      totalSeats: 28
    }
  ])

  // Auto search when component mounts with URL params
  useEffect(() => {
    const urlFrom = searchParams.get('from')
    const urlTo = searchParams.get('to')
    const urlTime = searchParams.get('time')
    
    if (urlFrom && urlTo) {
      setFromLocation(urlFrom)
      setToLocation(urlTo)
      if (urlTime) setDepartureTime(urlTime)
      
      // Auto search with URL params
      const performSearch = async () => {
        setLoading(true)
        setError(null)
        
        try {
          const searchParamsData = {
            from: urlFrom,
            to: urlTo,
            departureTime: urlTime || undefined
          }

          const results = await searchRoutes(searchParamsData)
          
          const transformedResults: BusRoute[] = results.map((route: any) => ({
            id: route._id,
            operator: route.partnerId,
            departureTime: route.departureTime,
            arrivalTime: route.arrivalTime || "N/A",
            duration: route.duration,
            price: route.price,
            busType: route.description || "Xe khách",
            amenities: ["Wifi", "Điều hòa"],
            rating: 0, // Will be updated by fetchReviewStatistics
            reviewCount: 0, // Will be updated by fetchReviewStatistics
            seatsAvailable: route.availableSeats,
            totalSeats: route.totalSeats,
            reviewsLoaded: false
          }))

          setBusRoutes(transformedResults)
          
          // Fetch review statistics for each route
          fetchReviewStatistics(transformedResults)
        } catch (err) {
          setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.')
          console.error('Search error:', err)
        } finally {
          setLoading(false)
        }
      }
      
      performSearch()
    }
  }, [searchParams])

  const swapLocations = () => {
    const temp = fromLocation
    setFromLocation(toLocation)
    setToLocation(temp)
  }

  // Function to fetch review statistics for routes
  const fetchReviewStatistics = async (routes: BusRoute[]) => {
    const updatedRoutes = await Promise.all(
      routes.map(async (route) => {
        try {
          const reviewResponse = await getRouteReviews(route.id)
          if (reviewResponse?.success && reviewResponse.data?.statistics) {
            return {
              ...route,
              rating: reviewResponse.data.statistics.averageRating || 0,
              reviewCount: reviewResponse.data.statistics.totalReviews || 0,
              reviewsLoaded: true
            }
          }
        } catch (error) {
          console.error(`Error fetching reviews for route ${route.id}:`, error)
          // Don't throw error, just continue with default values
        }
        return {
          ...route,
          rating: 0,
          reviewCount: 0,
          reviewsLoaded: true
        }
      })
    )
    setBusRoutes(updatedRoutes)
  }

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      setError("Vui lòng chọn điểm đi và điểm đến")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchParams = {
        from: fromLocation,
        to: toLocation,
        departureTime: departureTime || undefined
      }

      const results = await searchRoutes(searchParams)
      
      // Transform API response to match BusRoute interface
      const transformedResults: BusRoute[] = results.map((route: any) => ({
        id: route._id,
        operator: route.routeCode, // You may need to map this to actual partner name
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime || "N/A", // Calculate or get from API
        duration: route.duration,
        price: route.price,
        busType: route.description || "Xe khách",
        amenities: ["Wifi", "Điều hòa"], // Default amenities, get from API if available
        rating: 0, // Will be updated by fetchReviewStatistics
        reviewCount: 0, // Will be updated by fetchReviewStatistics
        seatsAvailable: route.availableSeats,
        totalSeats: route.totalSeats,
        reviewsLoaded: false
      }))

      setBusRoutes(transformedResults)

      // Update URL with search parameters
      const params = new URLSearchParams()
      if (fromLocation) params.set('from', fromLocation)
      if (toLocation) params.set('to', toLocation)
      if (departureTime) params.set('time', departureTime)
      
      router.push(`/search?${params.toString()}`)
      
      // Fetch review statistics for each route
      fetchReviewStatistics(transformedResults)
      
    } catch (err) {
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const getOperators = () => {
    return [...new Set(busRoutes.map(route => route.operator))]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="home" />
      
      {/* Search Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          {/* Search Form */}
          <div className="bg-white rounded-xl p-6 text-black shadow-lg">
            <div className="grid gap-4 items-end grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
              {/* From Location */}
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

              {/* Swap Button */}
              <div className="flex justify-center items-end pb-3">
                <button
                  onClick={swapLocations}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* To Location */}
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

              {/* Departure Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thời gian khởi hành</label>
                <div className="relative">
                  <Input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="pr-10 h-12 w-full border border-gray-300 rounded-md bg-white"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 opacity-0">Tìm kiếm</label>
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
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
                <div className="flex items-center space-x-2 mb-6">
                  <Filter className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Bộ lọc</h3>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sắp xếp theo</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Giá thấp nhất</SelectItem>
                      <SelectItem value="time">Thời gian sớm nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                      <SelectItem value="duration">Thời gian ngắn nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Khoảng giá</label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Operators */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Nhà xe</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getOperators().map((operator) => (
                      <label key={operator} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedOperators.includes(operator)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperators([...selectedOperators, operator])
                            } else {
                              setSelectedOperators(selectedOperators.filter(op => op !== operator))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{operator}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {fromLocation && toLocation ? `${fromLocation} → ${toLocation}` : 'Kết quả tìm kiếm'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Đang tìm kiếm...' : `${busRoutes.length} chuyến xe được tìm thấy`}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tìm kiếm chuyến xe...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button 
                    onClick={handleSearch}
                    variant="outline"
                    className="mt-2"
                  >
                    Thử lại
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && busRoutes.length === 0 && (fromLocation && toLocation) && (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy chuyến xe
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Không có chuyến xe nào phù hợp với tiêu chí tìm kiếm của bạn.
                  </p>
                  <Button onClick={handleSearch} variant="outline">
                    Tìm kiếm lại
                  </Button>
                </div>
              )}

              {/* Bus Route Cards */}
              {!loading && !error && busRoutes.length > 0 && (
                <div className="space-y-4">
                {busRoutes.map((route) => (
                  <div key={route.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Operator & Rating */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900">{route.operator}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {!route.reviewsLoaded ? "..." : 
                             route.reviewCount > 0 ? route.rating.toFixed(1) : "Chưa có"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {!route.reviewsLoaded ? "đang tải..." :
                             route.reviewCount > 0 ? `(${route.reviewCount} đánh giá)` : "(đánh giá)"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{route.busType}</p>
                      </div>

                      {/* Time & Duration */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">{route.departureTime}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold">{route.arrivalTime}</span>
                        </div>
                        <p className="text-sm text-gray-600">{route.duration}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Còn {route.seatsAvailable}/{route.totalSeats} chỗ
                          </span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Tiện ích</p>
                        <div className="flex flex-wrap gap-1">
                          {route.amenities.map((amenity) => (
                            <span key={amenity} className="inline-flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                              {amenity === "Wifi" && <Wifi className="w-3 h-3" />}
                              {amenity === "Điều hòa" && <Car className="w-3 h-3" />}
                              <span>{amenity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Book */}
                      <div className="flex flex-col justify-between">
                        <div className="space-y-1">
                          {route.discount && (
                            <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                              {route.discount}
                            </span>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(route.price)}
                            </span>
                            {route.originalPrice && (
                              <span className="text-gray-500 line-through text-sm">
                                {formatPrice(route.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <ViewReviewsDialog 
                            routeId={route.id} 
                            routeName={`${route.operator} - ${route.departureTime}`}
                          >
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Xem đánh giá
                            </Button>
                          </ViewReviewsDialog>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                            onClick={() => {
                              console.log('Clicking button for route ID:', route.id)
                              router.push(`/ticket/${route.id}`)
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Chọn chuyến
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Load More */}
              {!loading && !error && busRoutes.length > 0 && (
                <div className="text-center mt-8">
                  <Button variant="outline" className="px-8">
                    Xem thêm chuyến xe
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentPage="home" />
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl p-6 text-black shadow-lg">
            <div className="animate-pulse">
              <div className="grid gap-4 items-end grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}
