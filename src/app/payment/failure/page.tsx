"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";

const PaymentFailurePage = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <div className="flex flex-col items-center justify-center py-20 max-w-2xl mx-auto">
          <div className="mb-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
          </div>
          <h1
            className={cn([
              integralCF.className,
              "text-3xl md:text-4xl font-bold mb-4 text-center",
            ])}
          >
            Payment Failed
          </h1>
          {orderNumber && (
            <p className="text-lg text-black/60 mb-2 text-center">
              Order number: <span className="font-bold text-black">{orderNumber}</span>
            </p>
          )}
          <p className="text-base text-black/60 mb-8 text-center">
            Unfortunately, your payment could not be processed. Your order has been saved but not confirmed.
            Please try again or contact us if you continue to experience issues.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 w-full">
            <h2 className="font-bold text-lg mb-4 text-red-800">What happened?</h2>
            <ul className="space-y-2 text-red-700">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Your payment was declined or cancelled.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>No charges were made to your account.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>Your order is saved and you can try again.</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#F0F0F0] rounded-lg p-6 mb-8 w-full">
            <h2 className="font-bold text-lg mb-4">What can you do?</h2>
            <ul className="space-y-2 text-black/70">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Check your payment method and try again.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Contact your bank if the issue persists.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Contact our support team for assistance.</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/checkout" className="flex-1">
              <Button className="w-full bg-black text-white hover:bg-black/90">
                Try Payment Again
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-black text-black hover:bg-black hover:text-white"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentFailurePage;

