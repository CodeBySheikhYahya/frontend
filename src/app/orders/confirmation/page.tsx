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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
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
          setOrderId(orderData.id);
          setOrder(orderData);
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
            Thank you for your order! We've received your order and will process it shortly.
            {orderNumber && " You will receive a confirmation email shortly."}
          </p>
          
          {/* Payment Instructions for Non-COD Methods */}
          {order && order.payment_method && order.payment_method !== "cod" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 w-full">
              <h2 className="font-bold text-lg mb-3 text-yellow-900">Payment Instructions</h2>
              <p className="text-black/80 mb-4">
                {order.payment_method === "easypaisa" && "Please send the payment via EasyPaisa using the account details shown during checkout."}
                {order.payment_method === "jazzcash" && "Please send the payment via JazzCash using the account details shown during checkout."}
                {order.payment_method === "bank" && "Please transfer the payment to the bank account shown during checkout."}
              </p>
              {order.notes && order.notes.includes("Transaction ID") && (
                <p className="text-sm text-black/70 mb-4">
                  <span className="font-medium">Transaction ID:</span> {order.notes.replace("Transaction ID: ", "")}
                </p>
              )}
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <p className="font-semibold text-black mb-2">📱 Send Payment Screenshot</p>
                <p className="text-sm text-black/80">
                  After sending the money, please send the payment screenshot on this number:
                </p>
                <p className="text-lg font-bold text-black mt-2">+92-300-1234567</p>
                <p className="text-xs text-black/60 mt-2">
                  Include your order number ({orderNumber}) in the message
                </p>
              </div>
            </div>
          )}

          <div className="bg-[#F0F0F0] rounded-lg p-6 mb-8 w-full">
            <h2 className="font-bold text-lg mb-4">What's Next?</h2>
            <ul className="space-y-2 text-black/70">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>
                  {order && order.payment_method && order.payment_method !== "cod" 
                    ? "We'll verify your payment and then prepare your order for shipment."
                    : "We'll prepare your order for shipment."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>You'll receive an email with tracking information once your order ships.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>
                  {order && order.payment_method === "cod"
                    ? "Please have the exact amount ready when the delivery arrives."
                    : "Your order will be delivered to the address provided."}
                </span>
              </li>
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
            {orderId ? (
              <Link href={`/orders/${orderId}`} className="flex-1">
                <Button className="w-full bg-black text-white hover:bg-black/90">
                  View Order Details
                </Button>
              </Link>
            ) : orderNumber ? (
              <Link href={`/orders?orderNumber=${orderNumber}`} className="flex-1">
                <Button className="w-full bg-black text-white hover:bg-black/90">
                  View Order
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderConfirmationPage;



