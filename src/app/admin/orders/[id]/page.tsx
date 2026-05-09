"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderNotes,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase/admin-orders";
import { ArrowLeft, Save } from "lucide-react";
import { formatUSD } from "@/lib/format-currency";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<any>(null);

  // Form state
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrderById(orderId);
      if (!data) {
        alert("Order not found");
        router.push("/admin/orders");
        return;
      }

      setOrder(data);
      setStatus(data.status as OrderStatus);
      setPaymentStatus(data.payment_status as PaymentStatus);
      setNotes(data.notes || "");
    } catch (error) {
      alert("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [statusResult, paymentResult, notesResult] = await Promise.all([
        updateOrderStatus(orderId, status),
        updatePaymentStatus(orderId, paymentStatus),
        updateOrderNotes(orderId, notes),
      ]);

      if (!statusResult.success) {
        alert(`Error updating status: ${statusResult.error}`);
        setSaving(false);
        return;
      }

      if (!paymentResult.success) {
        alert(`Error updating payment status: ${paymentResult.error}`);
        setSaving(false);
        return;
      }

      if (!notesResult.success) {
        alert(`Error updating notes: ${notesResult.error}`);
        setSaving(false);
        return;
      }

      // Refresh order data
      await fetchOrder();
      alert("Order updated successfully");
    } catch (error) {
      alert("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  const shippingAddress = order.shipping_address || {};
  const billingAddress = order.billing_address || shippingAddress;

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/orders">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
              Order Details
            </h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-black/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          {order.items && order.items.length > 0 ? (
            <div>
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
                Order Items
              </h2>
              <div className="bg-white border border-black/10 rounded-lg p-6 space-y-4">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-black/10 last:border-0 last:pb-0"
                  >
                    {item.product_image_url && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-white">
                        <Image
                          src={item.product_image_url}
                          alt={item.product_title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.product_title}</h3>
                      <div className="flex gap-4 text-sm text-black/60 mb-2">
                        {item.color_name && <span>Color: {item.color_name}</span>}
                        {item.size_name && <span>Size: {item.size_name}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/60">
                          {formatUSD(item.unit_price)} each
                        </span>
                        <span className="font-bold">
                          {formatUSD(item.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
                Order Items
              </h2>
              <div className="bg-white border border-black/10 rounded-lg p-6 text-center text-black/60">
                <p>No items found for this order.</p>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Shipping Address
            </h2>
            <div className="bg-white border border-black/10 rounded-lg p-6">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="text-black/60">{shippingAddress.email}</p>
                <p className="text-black/60">{shippingAddress.phone}</p>
                <p className="text-black/60">{shippingAddress.address}</p>
                {shippingAddress.apartment && (
                  <p className="text-black/60">{shippingAddress.apartment}</p>
                )}
                <p className="text-black/60">
                  {shippingAddress.city}, {shippingAddress.zipCode}
                </p>
                <p className="text-black/60">{shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Order Summary
            </h2>
            <div className="bg-white border border-black/10 rounded-lg p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-black/60">Subtotal</span>
                <span>{formatUSD(Number(order.subtotal))}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Discount</span>
                  <span className="text-green-600">
                    {formatUSD(-Number(order.discount_amount))}
                  </span>
                </div>
              )}
              {order.shipping_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span>{formatUSD(Number(order.shipping_amount))}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Tax</span>
                  <span>{formatUSD(Number(order.tax_amount))}</span>
                </div>
              )}
              <div className="border-t border-black/10 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatUSD(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Order Status
            </h2>
            <div className="bg-white border border-black/10 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 bg-[#F0F0F0] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-4 py-2 bg-[#F0F0F0] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <p className="text-sm text-black/60">
                  {order.payment_method || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Order Notes
            </h2>
            <div className="bg-white border border-black/10 rounded-lg p-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-[#F0F0F0] rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Add internal notes about this order..."
              />
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
              Order Information
            </h2>
            <div className="bg-white border border-black/10 rounded-lg p-6 space-y-3 text-sm">
              <div>
                <span className="text-black/60">Order Number:</span>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <span className="text-black/60">Order Date:</span>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              {order.updated_at !== order.created_at && (
                <div>
                  <span className="text-black/60">Last Updated:</span>
                  <p className="font-semibold">
                    {new Date(order.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

