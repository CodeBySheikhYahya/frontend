"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/lib/format-currency";
import { getOrderByNumber } from "@/lib/supabase/orders";
import Image from "next/image";

const OrdersPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<{
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if orderNumber comes from URL (from confirmation page)
    const urlOrderNumber = searchParams.get("orderNumber");
    if (urlOrderNumber) {
      setOrderNumber(urlOrderNumber);
      handleSearch(urlOrderNumber);
    }
  }, [searchParams]);

  const handleSearch = async (searchValue?: string) => {
    const searchOrderNumber = searchValue || orderNumber.trim();
    
    if (!searchOrderNumber) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const orderData = await getOrderByNumber(searchOrderNumber);
      
      if (orderData) {
        const orderState = {
          id: orderData.id,
          order_number: orderData.order_number,
          status: orderData.status,
          total_amount: orderData.total_amount,
        };
        setOrder(orderState);
      } else {
        setError("Order not found. Please check your order number.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        
        <div className="max-w-2xl mx-auto py-10">
          <h1
            className={cn([
              integralCF.className,
              "text-3xl md:text-4xl font-bold mb-6 text-center",
            ])}
          >
            Track Your Order
          </h1>
          
          <p className="text-center text-black/60 mb-8">
            Enter your order number to view order details and status
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Text>
                    <Image
                      priority
                      src="/icons/search.svg"
                      height={20}
                      width={20}
                      alt="search"
                      className="min-w-5 min-h-5"
                    />
                  </InputGroup.Text>
                  <InputGroup.Input
                    type="text"
                    placeholder="Enter Order Number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="bg-transparent placeholder:text-black/40"
                  />
                </InputGroup>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-black text-white hover:bg-black/90 px-8"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Order Found */}
          {order && (
            <div className="bg-[#F0F0F0] rounded-lg p-6">
              <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
                Order Found
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-black/60">Order Number:</span>
                  <span className="font-bold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60">Status:</span>
                  <span className="font-bold capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60">Total Amount:</span>
                  <span className="font-bold">{formatUSD(order.total_amount)}</span>
                </div>
              </div>

              <Link href={`/orders/${order.id}`}>
                <Button className="w-full bg-black text-white hover:bg-black/90">
                  View Order Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default OrdersPage;

