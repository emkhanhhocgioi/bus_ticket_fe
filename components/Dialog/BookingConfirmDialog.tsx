"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/api/order";
import { Route } from "@/api/routes";

interface OrderWithRoute extends Order {
  route?: Route;
}

interface BookingConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderWithRoute | null;
  onConfirm: (orderId: string, userId: string, bussinessId: string, action: 'accept' | 'reject') => Promise<void>;
  loading?: boolean;
}

export default function BookingConfirmDialog({
  isOpen,
  onClose,
  order,
  onConfirm,
  loading = false
}: BookingConfirmDialogProps) {
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = async (action: 'accept' | 'reject') => {
    if (!order?._id) return;
    
    setActionLoading(action);
    try {
      await onConfirm(order._id, order.userId!, order.bussinessId!, action);
      onClose();
    } catch (error) {
      console.error(`Failed to ${action} order:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  if (!order) return null;

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

  const isPending = order.orderStatus?.toLowerCase() === 'pending';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Booking Details
          </DialogTitle>
          <DialogDescription>
            Review the booking information and choose your action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Order ID:</span>
              <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                {order._id?.slice(-8).toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus || "pending")}`}>
                {order.orderStatus || "Pending"}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">Route:</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{order.route?.routeCode}</div>
                  <div className="text-xs text-gray-500">
                    {order.route?.from} → {order.route?.to}
                  </div>
                  <div className="text-xs text-gray-400">
                    {order.route?.departureTime}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-600">Customer:</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{order.fullName}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                  <div className="text-xs text-gray-400">{order.email}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Payment:</span>
                <span className="text-sm capitalize">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Amount:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(order.basePrice)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Created:</span>
              <span className="text-xs text-gray-500">
                {order.createdAt && formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={actionLoading !== null || loading}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          
          {isPending && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                disabled={actionLoading !== null || loading}
                className="w-full sm:w-auto"
              >
                {actionLoading === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Booking'
                )}
              </Button>
              
              <Button
                onClick={() => handleAction('accept')}
                disabled={actionLoading !== null || loading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'accept' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
