"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrderByRouteId, Order } from "@/api/order";
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

  // Fetch routes on component mount
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user?.id || !token) return;

      try {
        const routesData = await getRoutes(user.id, token);
        setRoutes(routesData || []);
      } catch (err) {
        console.error("Failed to fetch routes:", err);
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
              const routeOrders = await getOrderByRouteId(route._id!, token);
              const ordersWithRoute = routeOrders.map((order: Order) => ({
                ...order,
                route: route
              }));
              allOrders.push(...ordersWithRoute);
            } catch (err) {
              console.error(`Failed to fetch orders for route ${route._id}:`, err);
            }
          }
        } else {
          // Fetch orders for selected route
          const routeOrders = await getOrderByRouteId(selectedRoute, token);
          const selectedRouteData = routes.find(r => r._id === selectedRoute);
          allOrders = routeOrders.map((order: Order) => ({
            ...order,
            route: selectedRouteData
          }));
        }

        // Sort orders by creation date (newest first)
        allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(allOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load orders");
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

  const refreshOrders = () => {
    setSelectedRoute(selectedRoute); // Trigger useEffect
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
        <Button onClick={refreshOrders} variant="outline">
          Refresh Orders
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
          {error}
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
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedRoute === "all" 
                  ? "No orders have been placed for any of your routes yet."
                  : "No orders have been placed for the selected route yet."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
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
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Seat {order.seatNumber}
                      </span>
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
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}