"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import Link from "next/link";
import Image from "next/image";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { City } from "country-state-city";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createCODOrder } from "@/lib/supabase/orders";
import { useRouter } from "next/navigation";

const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;


const CheckoutPage = () => {
  const { cart, adjustedTotalPrice, totalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "Pakistan",
  });

  // Get Pakistan cities
  const pakistanCities = City.getCitiesOfCountry("PK") || [];

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-black/60 mb-8">Add some items to your cart first.</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate with Zod
    const result = shippingSchema.safeParse(shippingInfo);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ShippingFormData, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ShippingFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
    
    // Handle COD orders
    setIsSubmitting(true);
    
    try {
      const orderResult = await createCODOrder({
        cartItems: cart.items,
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        paymentMethod: "cod",
        subtotal: totalPrice,
        discountAmount: totalPrice - adjustedTotalPrice,
        totalAmount: adjustedTotalPrice,
      });

      if (orderResult.success && orderResult.orderNumber) {
        // Redirect to order confirmation page
        router.push(`/orders/confirmation?orderNumber=${orderResult.orderNumber}`);
      } else {
        setSubmitError(orderResult.error || "Failed to create order. Please try again.");
        setIsSubmitting(false);
      }
      } catch (error: any) {
        setSubmitError(error.message || "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/cart">Cart</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Shipping Form */}
          <div className="flex-1">
            <h1 className={cn([integralCF.className, "text-2xl md:text-[32px] font-bold mb-6"])}>
              Shipping Information
            </h1>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="First Name"
                      value={shippingInfo.firstName}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value });
                        if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                      }}
                      className="bg-transparent"
                    />
                  </InputGroup>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="Last Name"
                      value={shippingInfo.lastName}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value });
                        if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                      }}
                      className="bg-transparent"
                    />
                  </InputGroup>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="email"
                    placeholder="Email Address"
                    value={shippingInfo.email}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className="bg-transparent"
                  />
                </InputGroup>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingInfo.phone}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className="bg-transparent"
                  />
                </InputGroup>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: undefined });
                    }}
                    className="bg-transparent"
                  />
                </InputGroup>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select
                    value={shippingInfo.city ? (() => {
                      const cityIndex = pakistanCities.findIndex(c => c.name === shippingInfo.city);
                      return cityIndex >= 0 
                        ? `${shippingInfo.city}||${pakistanCities[cityIndex]?.stateCode || ''}||${cityIndex}`
                        : shippingInfo.city;
                    })() : undefined}
                    onValueChange={(value) => {
                      // Extract just the city name from the unique value
                      const cityName = value.split('||')[0];
                      setShippingInfo({ ...shippingInfo, city: cityName });
                      if (errors.city) setErrors({ ...errors, city: undefined });
                    }}
                  >
                    <SelectTrigger className="bg-[#F0F0F0] border-none h-11">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {pakistanCities.map((city, index) => {
                        // Create unique value by combining name with state and index
                        const uniqueValue = `${city.name || ''}||${city.stateCode || ''}||${index}`;
                        return (
                          <SelectItem 
                            key={`city-${index}`}
                            value={uniqueValue}
                          >
                            {city.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingInfo.zipCode}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, zipCode: e.target.value });
                        if (errors.zipCode) setErrors({ ...errors, zipCode: undefined });
                      }}
                      className="bg-transparent"
                    />
                  </InputGroup>
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>
                <div>
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="Country"
                      value={shippingInfo.country}
                      readOnly
                      className="bg-transparent"
                    />
                  </InputGroup>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[450px]">
            <div className="bg-white rounded-[20px] p-8 sticky top-24 border border-black/10">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={`${item.id}-${item.attributes.join("-")}`} className="flex gap-3">
                    <div className="bg-[#F0EEED] rounded-lg w-20 h-20 flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.srcUrl}
                        width={80}
                        height={80}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-black/60 mb-1">
                        Size: {item.attributes[0]} | Color: {item.attributes[1]}
                      </p>
                      <p className="text-sm font-medium">
                        ${item.discount.percentage > 0
                          ? Math.round(item.price - (item.price * item.discount.percentage) / 100)
                          : item.discount.amount > 0
                          ? item.price - item.discount.amount
                          : item.price}{" "}
                        x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="h-[1px] border-t-black/10 mb-6" />

              {/* Price Breakdown */}
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

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-black text-white hover:bg-black/90 h-12 text-base font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Processing..."
                  : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;

