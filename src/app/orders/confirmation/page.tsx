"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { getOrderByNumber } from "@/lib/supabase/orders";

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<{
    payment_method: string | null;
    payment_status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderNumber) {
        setLoading(true);
        const orderData = await getOrderByNumber(orderNumber);
        if (orderData) {
          setOrder({
            payment_method: orderData.payment_method,
            payment_status: orderData.payment_status,
          });
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    if (mounted && orderNumber) {
      fetchOrder();
    }
  }, [mounted, orderNumber]);

  if (!mounted || loading) {
    return null;
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <div className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
          <div className="mb-6">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h1
            className={cn([
              integralCF.className,
              "text-3xl md:text-4xl font-bold mb-4 text-center",
            ])}
          >
            Order Confirmed!
          </h1>
          {orderNumber && (
            <p className="text-lg text-black/60 mb-2 text-center">
              Your order number is: <span className="font-bold text-black">{orderNumber}</span>
            </p>
          )}
          <p className="text-base text-black/60 mb-8 text-center">
            {order?.payment_method === "payfast" && order?.payment_status === "paid"
              ? "Thank you for your payment! Your order has been confirmed and will be processed shortly."
              : order?.payment_method === "payfast" && order?.payment_status === "pending"
              ? "Your order has been received. We're waiting for payment confirmation from PayFast."
              : "Thank you for your order! We've received your order and will process it shortly."}
            {orderNumber && " You will receive a confirmation email shortly."}
          </p>
          <div className="bg-[#F0F0F0] rounded-lg p-6 mb-8 w-full">
            <h2 className="font-bold text-lg mb-4">What's Next?</h2>
            <ul className="space-y-2 text-black/70">
              {order?.payment_method === "payfast" && order?.payment_status === "paid" ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Your payment has been confirmed successfully.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>We'll prepare your order for shipment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>You'll receive an email with tracking information once your order ships.</span>
                  </li>
                </>
              ) : order?.payment_method === "payfast" && order?.payment_status === "pending" ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Your order is being processed. Payment confirmation is pending.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Once payment is confirmed, we'll prepare your order for shipment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>You'll receive an email confirmation once payment is verified.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>We'll prepare your order for shipment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>You'll receive an email with tracking information once your order ships.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>
                      For Cash on Delivery orders, please have the exact amount ready when the delivery
                      arrives.
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/shop" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white"
              >
                Continue Shopping
              </Button>
            </Link>
            {orderNumber && (
              <Link href={`/orders?orderNumber=${orderNumber}`} className="flex-1">
                <Button className="w-full bg-black text-white hover:bg-black/90">
                  View Order
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;



