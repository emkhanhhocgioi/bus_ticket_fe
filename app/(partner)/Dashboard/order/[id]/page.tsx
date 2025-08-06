"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrderByRouteId, Order, acceptOrder,rejectOrder } from "@/api/order";
import { getRoutes, Route } from "@/api/routes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookingConfirmDialog from "@/components/Dialog/BookingConfirmDialog";
import { Toast } from "@/components/ui/toast";

interface OrderWithRoute extends Order {
  route?: Route;
}

export default function OrderListPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<OrderWithRoute[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRoute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    isVisible: boolean;
  }>({
    type: "success",
    title: "",
    message: "",
    isVisible: false,
  });

  // Fetch routes on component mount
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user?.id || !token) return;

      try {
        const routesData = await getRoutes(user.id, token);
        setRoutes(routesData || []);
      } catch (err) {
        setError("Failed to load routes");
      }
    };

    fetchRoutes();
  }, [user?.id, token]);

  // Fetch orders when routes are loaded or when selected route changes
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token || routes.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        let allOrders: OrderWithRoute[] = [];

        if (selectedRoute === "all") {
          // Fetch orders for all routes
          for (const route of routes) {
            try {
              const response = await getOrderByRouteId(route._id!, token);
              // Check if response has data property and it's an array
              const routeOrders = response?.data || response;
              if (routeOrders && Array.isArray(routeOrders)) {
                const ordersWithRoute = routeOrders.map((order: Order) => ({
                  ...order,
                  route: route
                }));
                allOrders.push(...ordersWithRoute);
              }
            } catch (err) {
              // Continue with other routes even if one fails
            }
          }
        } else {
          // Fetch orders for selected route
          try {
            const response = await getOrderByRouteId(selectedRoute, token);
            const selectedRouteData = routes.find(r => r._id === selectedRoute);
            // Check if response has data property and it's an array
            const routeOrders = response?.data || response;
            if (routeOrders && Array.isArray(routeOrders)) {
              allOrders = routeOrders.map((order: Order) => ({
                ...order,
                route: selectedRouteData
              }));
            }
          } catch (err) {
            setError("Failed to load orders for the selected route. Please try again.");
          }
        }

        // Sort orders by creation date (newest first)
        allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(allOrders || []);
      } catch (err) {
        setError("Failed to load orders. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [routes, selectedRoute, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending": 
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const refreshOrders = () => {
    setError(null);
    setOrders([]);
    // Force re-fetch by creating a new fetch call
    const fetchOrders = async () => {
      if (!token || routes.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        let allOrders: OrderWithRoute[] = [];

        if (selectedRoute === "all") {
          // Fetch orders for all routes
          for (const route of routes) {
            try {
              const response = await getOrderByRouteId(route._id!, token);
              const routeOrders = response?.data || response;
              if (routeOrders && Array.isArray(routeOrders)) {
                const ordersWithRoute = routeOrders.map((order: Order) => ({
                  ...order,
                  route: route
                }));
                allOrders.push(...ordersWithRoute);
              }
            } catch (err) {
              // Continue with other routes even if one fails
            }
          }
        } else {
          try {
            const response = await getOrderByRouteId(selectedRoute, token);
            const selectedRouteData = routes.find(r => r._id === selectedRoute);
            const routeOrders = response?.data || response;
            if (routeOrders && Array.isArray(routeOrders) && routeOrders.length > 0) {
              allOrders = routeOrders.map((order: Order) => ({
                ...order,
                route: selectedRouteData
              }));
            }
          } catch (err) {
            setError("Failed to load orders for the selected route. Please try again.");
          }
        }

        allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(allOrders || []);
      } catch (err) {
        setError("Failed to load orders. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  };

  const handleBookingAction = async (orderId: string, action: 'accept' | 'reject') => {
    if (!token) return;
    
    setActionLoading(true);
    try {
      if (action === 'accept') {
        await acceptOrder(orderId, token);
        setToast({
          type: "success",
          title: "Booking Confirmed",
          message: "The booking has been successfully confirmed.",
          isVisible: true,
        });
      } else {
        await rejectOrder(orderId, token);
        setToast({
          type: "success",
          title: "Booking Rejected",
          message: "The booking has been successfully rejected.",
          isVisible: true,
        });
      }
      
      // Refresh orders after successful action
      refreshOrders();
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
      setToast({
        type: "error",
        title: `Failed to ${action === 'accept' ? 'confirm' : 'reject'} booking`,
        message: "Please try again.",
        isVisible: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openBookingDialog = (order: OrderWithRoute) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Please log in to view orders.</p>
      </div>
    );
  }
  
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <Button onClick={refreshOrders} variant="outline" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Orders"}
        </Button>
      </div>

      {/* Route Filter */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Route:</label>
        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select a route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            {routes.map((route) => (
              <SelectItem key={route._id} value={route._id!}>
                {route.routeCode} - {route.from} → {route.to}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(orders.reduce((sum, order) => sum + order.basePrice, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Active Routes</h3>
          <p className="text-2xl font-bold text-blue-600">{routes.length}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              onClick={refreshOrders} 
              variant="outline" 
              className="ml-4 text-sm px-3 py-1"
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry"}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Hiện tại không có đơn nào</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedRoute === "all" 
                  ? "Chưa có đơn đặt vé nào cho tất cả tuyến đường của bạn."
                  : "Chưa có đơn đặt vé nào cho tuyến đường được chọn."
                }
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm text-gray-600">[]</code>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order._id?.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.route?.routeCode}</span>
                        <span className="text-sm text-gray-500">
                          {order.route?.from} → {order.route?.to}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.route?.departureTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{order.phone}</span>
                        <span className="text-xs text-gray-500">{order.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.basePrice)}
                    </TableCell>
                    <TableCell>
                      {order.createdAt && formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus || "pending")}`}>
                       {getStatusText(order.orderStatus || "pending")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openBookingDialog(order)}
                          disabled={actionLoading}
                        >
                          View Details
                        </Button>
                        {order.orderStatus?.toLowerCase() === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleBookingAction(order._id!, 'accept')}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBookingAction(order._id!, 'reject')}
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      <BookingConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        order={selectedOrder}
        onConfirm={handleBookingAction}
        loading={actionLoading}
      />

      {/* Toast Notification */}
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}