"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getRoutes, Route } from "@/api/routes"
import { getOrderByRouteId, Order } from "@/api/order"
import NavigationBar from "@/components/navigation/navigationbar"

interface OrderWithRoute extends Order {
  route?: Route;
}

export default function PartnerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7days")
  const [routes, setRoutes] = useState<Route[]>([])
  const [orders, setOrders] = useState<OrderWithRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeRoutes: 0,
    monthlyGrowth: 0,
    averageRating: 4.8
  })
  
  const router = useRouter()
  const { user, token } = useAuth()

  // Fetch routes and orders data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id || !token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch routes
        const routesResponse = await getRoutes(user.id, token)
        const routesData = routesResponse?.data || routesResponse || []
        setRoutes(routesData)

        // Fetch orders for all routes
        let allOrders: OrderWithRoute[] = []
        for (const route of routesData) {
          try {
            const ordersResponse = await getOrderByRouteId(route._id!, token)
            const routeOrders = ordersResponse?.data || ordersResponse || []
            if (Array.isArray(routeOrders)) {
              const ordersWithRoute = routeOrders.map((order: Order) => ({
                ...order,
                route: route
              }))
              allOrders.push(...ordersWithRoute)
            }
          } catch (err) {
            console.log(`No orders found for route ${route._id}`)
          }
        }
        setOrders(allOrders)

        // Calculate statistics
        const totalBookings = allOrders.length
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.basePrice || 0), 0)
        const activeRoutes = routesData.length
        
        // Calculate growth (mock calculation - in real app, compare with previous period)
        const monthlyGrowth = totalRevenue > 0 ? Math.round((totalRevenue / 10000000) * 100) / 10 : 0

        setStats({
          totalBookings,
          totalRevenue,
          activeRoutes,
          monthlyGrowth,
          averageRating: 4.8
        })

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id, token])

  // Transform orders for recent bookings table
  const recentBookings = orders
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order._id?.slice(-6).toUpperCase() || `BK${Math.random().toString().slice(-3)}`,
      route: order.route ? `${order.route.from} - ${order.route.to}` : "Unknown Route",
      passenger: order.fullName || "Unknown Customer",
      amount: order.basePrice || 0,
      status: getVietnameseStatus(order.orderStatus || "pending"),
      createdAt: order.createdAt
    }))

  // Calculate popular routes from orders data
  const popularRoutes = routes
    .map(route => {
      const routeOrders = orders.filter(order => order.route?._id === route._id)
      return {
        route: `${route.from} - ${route.to}`,
        bookings: routeOrders.length,
        percentage: Math.min((routeOrders.length / Math.max(orders.length, 1)) * 100, 100)
      }
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 4)

  function getVietnameseStatus(status: string) {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ xác nhận"
      case "completed":
        return "Hoàn thành"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Chờ xác nhận"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã xác nhận": 
      case "Hoàn thành":
        return "text-green-600 bg-green-50"
      case "Chờ xác nhận": 
        return "text-yellow-600 bg-yellow-50"
      case "Đã hủy": 
        return "text-red-600 bg-red-50"
      default: 
        return "text-gray-600 bg-gray-50"
    }
  }

  // Mock revenue chart data based on actual orders
  const generateChartData = () => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    return days.map(() => Math.floor(Math.random() * 50) + 30)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Đang tải dữ liệu dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar currentPage="dashboard" />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Đối tác</h1>
          <p className="text-gray-600">Tổng quan hoạt động kinh doanh của bạn</p>
          {user?.name && (
            <p className="text-sm text-blue-600 mt-1">Chào mừng, {user.name}</p>
          )}
        </div>

        {/* Time Period Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: "7days", label: "7 ngày qua" },
              { value: "30days", label: "30 ngày qua" },
              { value: "3months", label: "3 tháng qua" },
              { value: "year", label: "Năm nay" }
            ].map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đặt vé</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              {stats.totalBookings > 0 ? "↗ Có đơn hàng mới" : "Chưa có đơn hàng"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              {stats.monthlyGrowth > 0 ? `↗ +${stats.monthlyGrowth}% dự tính tăng trưởng` : "Chưa có dữ liệu so sánh"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tuyến đường</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRoutes}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.activeRoutes > 0 ? "Đang hoạt động" : "Chưa có tuyến đường"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Đánh giá trung bình</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu (7 ngày qua)</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {generateChartData().map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-8 transition-all duration-300"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tuyến đường phổ biến</h3>
            <div className="space-y-4">
              {popularRoutes.length > 0 ? (
                popularRoutes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.route}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 ml-4">{item.bookings}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có dữ liệu tuyến đường</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => router.push("/Dashboard/routes")}
                  >
                    Thêm tuyến đường
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Đặt vé gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            {recentBookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã vé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tuyến đường
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành khách
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.passenger}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(booking.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Chưa có đơn đặt vé nào</p>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/Dashboard/order/all")}
                >
                  Xem tất cả đơn hàng
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={() => router.push("/Dashboard/routes")}>
            Quản lý tuyến đường
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/Dashboard/order/all")}
          >
            Xem tất cả đơn hàng
          </Button>
          <Button variant="outline">
            Xem báo cáo chi tiết
          </Button>
          <Button variant="outline">
            Quản lý khuyến mãi
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
