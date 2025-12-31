"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import Link from "next/link";
import Image from "next/image";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

const CartPage = () => {
  const { cart, adjustedTotalPrice, totalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const [promoCode, setPromoCode] = useState("");

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
          <BreadcrumbCart />
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-black/60 mb-8">Add some items to your cart to continue shopping.</p>
            <Link href="/shop">
              <Button className="bg-black text-white hover:bg-black/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbCart />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <h1 className={cn([integralCF.className, "text-2xl md:text-[32px] font-bold mb-6 uppercase"])}>
              YOUR CART
            </h1>
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={`${item.id}-${item.attributes.join("-")}`}>
                  <ProductCard data={item} />
                  <hr className="h-[1px] border-t-black/10 mt-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[450px]">
            <div className="bg-white rounded-[20px] p-8 sticky top-24 border border-black/10">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-black/60">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-black/60">Discount</span>
                  <span className="font-medium text-[#FF3333]">
                    -${(totalPrice - adjustedTotalPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-black/60">Delivery Fee</span>
                  <span className="font-medium">Free</span>
                </div>
                <hr className="h-[1px] border-t-black/10" />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>${adjustedTotalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Promo Code Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <InputGroup className="flex-1 bg-white">
                    <InputGroup.Text>
                      <Image
                        src="/icons/outlineOffer.svg"
                        height={20}
                        width={20}
                        alt="promo"
                        className="min-w-5 min-h-5"
                      />
                    </InputGroup.Text>
                    <InputGroup.Input
                      type="text"
                      placeholder="Add promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-transparent placeholder:text-black/40 placeholder:text-base"
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    className="bg-black text-white hover:bg-black/90 px-6 rounded-full text-base"
                    onClick={() => {
                      // Promo code logic here
                      setPromoCode("");
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full bg-black text-white hover:bg-black/90 h-12 text-base font-medium rounded-full flex items-center justify-center gap-2">
                  Go to Checkout
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;

