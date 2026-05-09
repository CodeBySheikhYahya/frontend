"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/lib/format-currency";
import { getOrderDetailsById } from "@/lib/supabase/orders";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<{
    id: string;
    order_number: string;
    status: string;
    payment_method: string | null;
    payment_status: string;
    subtotal: number;
    discount_amount: number;
    shipping_amount: number;
    tax_amount: number;
    total_amount: number;
    shipping_address: any;
    billing_address: any;
    created_at: string;
    items: Array<{
      id: string;
      product_title: string;
      product_image_url: string | null;
      color_name: string | null;
      size_name: string | null;
      quantity: number;
      unit_price: number;
      discount_amount: number;
      total_price: number;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const orderData = await getOrderDetailsById(orderId);
        
        if (orderData) {
          setOrder(orderData);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (mounted && orderId) {
      fetchOrder();
    }
  }, [mounted, orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  if (!mounted || loading) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="flex items-center justify-center py-20">
            <p className="text-black/60">Loading order details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="max-w-2xl mx-auto py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error || "Order not found"}</p>
              <Link href="/orders">
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          {/* Order Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className={cn([integralCF.className, "text-3xl md:text-4xl font-bold mb-2"])}>
                  Order Details
                </h1>
                <p className="text-black/60">Order #{order.order_number}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium capitalize", getStatusColor(order.status))}>
                  {order.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-black/60">Placed on {formatDate(order.created_at)}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>Order Items</h2>
              <div className="bg-white border border-black/10 rounded-lg p-6 space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-black/10 last:border-0 last:pb-0">
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-black/60 mb-2">No items found in this order.</p>
                    <p className="text-sm text-black/40">
                      This order may not have any items associated with it.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>Order Summary</h2>
              <div className="bg-white border border-black/10 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span>{formatUSD(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Discount</span>
                    <span className="text-green-600">{formatUSD(-order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span>{formatUSD(order.shipping_amount)}</span>
                </div>
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Tax</span>
                    <span>{formatUSD(order.tax_amount)}</span>
                  </div>
                )}
                <hr className="border-t-black/10 my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatUSD(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="mb-8">
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>Shipping Address</h2>
              <div className="bg-white border border-black/10 rounded-lg p-6">
                <p className="font-semibold">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}
                </p>
                <p className="text-black/70 mt-1">{order.shipping_address.address}</p>
                {order.shipping_address.apartment && (
                  <p className="text-black/70">{order.shipping_address.apartment}</p>
                )}
                <p className="text-black/70">
                  {order.shipping_address.city}, {order.shipping_address.zipCode}
                </p>
                <p className="text-black/70">{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="text-black/70 mt-2">Phone: {order.shipping_address.phone}</p>
                )}
                {order.shipping_address.email && (
                  <p className="text-black/70">Email: {order.shipping_address.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="mb-8">
            <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>Payment Information</h2>
            <div className="bg-white border border-black/10 rounded-lg p-6">
              <div className="flex justify-between mb-2">
                <span className="text-black/60">Payment Method</span>
                <span className="font-semibold capitalize">
                  {order.payment_method || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Payment Status</span>
                <span className={cn("font-semibold capitalize", 
                  order.payment_status === "paid" ? "text-green-600" : 
                  order.payment_status === "pending" ? "text-yellow-600" : "text-red-600"
                )}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <Link href="/orders">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailsPage;

