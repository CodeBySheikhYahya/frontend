"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAllAdminOrders,
  updateOrderStatus,
  updatePaymentStatus,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase/admin-orders";
import { Eye, Package, Filter } from "lucide-react";

const ORDER_STATUSES: Array<{ value: OrderStatus | "all"; label: string; color: string }> = [
  { value: "all", label: "All Orders", color: "bg-gray-500" },
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "processing", label: "Processing", color: "bg-blue-500" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500" },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
  { value: "refunded", label: "Refunded", color: "bg-gray-600" },
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminOrders(statusFilter);
      setOrders(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    console.log("=== ORDER STATUS CHANGE DEBUG ===");
    console.log("Order ID:", orderId);
    console.log("New Status:", newStatus);
    console.log("Current Status Filter:", statusFilter);
    
    if (!confirm(`Change order status to "${newStatus}"?`)) {
      console.log("User cancelled the confirmation");
      return;
    }

    console.log("User confirmed, updating status...");
    setUpdatingStatus(orderId);
    try {
      console.log("Calling updateOrderStatus...");
      const result = await updateOrderStatus(orderId, newStatus);
      console.log("Update result:", result);
      
      if (result.success) {
        console.log("✅ Status updated successfully, refreshing orders...");
        // Refresh orders
        await fetchOrders();
        console.log("Orders refreshed");
      } else {
        console.error("❌ Update failed:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Exception caught:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
      console.log("=== END STATUS CHANGE DEBUG ===");
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    console.log("=== PAYMENT STATUS CHANGE DEBUG ===");
    console.log("Order ID:", orderId);
    console.log("New Payment Status:", newPaymentStatus);
    
    if (!confirm(`Change payment status to "${newPaymentStatus}"?`)) {
      console.log("User cancelled the confirmation");
      return;
    }

    console.log("User confirmed, updating payment status...");
    setUpdatingPaymentStatus(orderId);
    try {
      console.log("Calling updatePaymentStatus...");
      const result = await updatePaymentStatus(orderId, newPaymentStatus);
      console.log("Update result:", result);
      
      if (result.success) {
        console.log("✅ Payment status updated successfully, refreshing orders...");
        // Refresh orders
        await fetchOrders();
        console.log("Orders refreshed");
      } else {
        console.error("❌ Update failed:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Exception caught:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdatingPaymentStatus(null);
      console.log("=== END PAYMENT STATUS CHANGE DEBUG ===");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-500";
  };

  const getPaymentStatusColor = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "refunded":
        return "bg-gray-600";
      default:
        return "bg-yellow-500";
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "—";
    const parts = [
      address.address,
      address.apartment,
      address.city,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ") || "—";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
          Orders
        </h1>
        <p className="text-gray-600">
          Manage and track customer orders ({orders.length} orders)
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                statusFilter === status.value
                  ? `${status.color} text-white`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-gray-600">
            {statusFilter === "all"
              ? "No orders have been placed yet"
              : `No orders with status "${statusFilter}"`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const shippingAddress = order.shipping_address || {};
                  const customerName = shippingAddress.firstName
                    ? `${shippingAddress.firstName} ${shippingAddress.lastName || ""}`.trim()
                    : "Guest";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{customerName}</div>
                        <div className="text-xs text-gray-500">
                          {shippingAddress.email || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          disabled={updatingStatus === order.id}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer",
                            getStatusColor(order.status),
                            "text-white",
                            updatingStatus === order.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {ORDER_STATUSES.filter((s) => s.value !== "all").map((status) => (
                            <option
                              key={status.value}
                              value={status.value}
                              className="bg-white text-gray-900"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            handlePaymentStatusChange(order.id, e.target.value as PaymentStatus)
                          }
                          disabled={updatingPaymentStatus === order.id}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer",
                            getPaymentStatusColor(order.payment_status),
                            "text-white",
                            updatingPaymentStatus === order.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-white text-gray-900"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

