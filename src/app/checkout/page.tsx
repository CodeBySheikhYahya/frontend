"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import Link from "next/link";
import Image from "next/image";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { z } from "zod";
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
  apartment: z.string().optional(),
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
    apartment: "",
    city: "",
    zipCode: "",
    country: "Pakistan",
  });

  const [pakistanCities, setPakistanCities] = useState<Array<{ name: string }>>([]);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    import("country-state-city").then(({ City }) => {
      setPakistanCities(
        (City.getCitiesOfCountry("PK") || []).map((c) => ({ name: c.name || "" }))
      );
    });
  }, []);

  const filteredCities = useMemo(
    () =>
      pakistanCities
        .filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
        .slice(0, 50),
    [pakistanCities, citySearch]
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [transactionId, setTransactionId] = useState<string>("");

  // Fake account details
  const accountDetails = {
    easypaisa: {
      name: "EasyPaisa",
      accountNumber: "0312-3456789",
      accountName: "Your Store Name",
      instructions: "Send money via EasyPaisa app or agent"
    },
    jazzcash: {
      name: "JazzCash",
      accountNumber: "0300-1234567",
      accountName: "Your Store Name",
      instructions: "Send money via JazzCash app or agent"
    },
    bank: {
      name: "Direct Bank Transfer",
      accountNumber: "PK12-3456-7890-1234-5678",
      accountName: "Your Store Name",
      bankName: "Bank Name",
      instructions: "Transfer amount to the account below"
    }
  };

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
    
    // Validate transaction ID for non-COD methods
    if (paymentMethod !== "cod" && !transactionId.trim()) {
      setSubmitError("Please enter transaction ID/reference number");
      return;
    }
    
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
          apartment: shippingInfo.apartment || undefined,
          city: shippingInfo.city,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        paymentMethod: paymentMethod,
        transactionId: paymentMethod !== "cod" ? transactionId : undefined,
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
              <div>
                <InputGroup className="bg-[#F0F0F0]">
                  <InputGroup.Input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={shippingInfo.apartment ?? ""}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, apartment: e.target.value })
                    }
                    className="bg-transparent"
                  />
                </InputGroup>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <InputGroup className="bg-[#F0F0F0]">
                    <InputGroup.Input
                      type="text"
                      placeholder="Search city..."
                      value={cityDropdownOpen ? citySearch : shippingInfo.city}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setCityDropdownOpen(true);
                        if (!e.target.value) setShippingInfo({ ...shippingInfo, city: "" });
                        if (errors.city) setErrors({ ...errors, city: undefined });
                      }}
                      onFocus={() => {
                        setCitySearch(shippingInfo.city || "");
                        setCityDropdownOpen(true);
                      }}
                      onBlur={() => setTimeout(() => setCityDropdownOpen(false), 200)}
                      className="bg-transparent"
                    />
                  </InputGroup>
                  {cityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-black/10 rounded-md shadow-lg max-h-[220px] overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city, index) => (
                          <button
                            key={`city-${index}`}
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setShippingInfo({ ...shippingInfo, city: city.name || "" });
                              setCitySearch(city.name || "");
                              setCityDropdownOpen(false);
                              if (errors.city) setErrors({ ...errors, city: undefined });
                            }}
                          >
                            {city.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-black/60">No city found. Type to search.</div>
                      )}
                    </div>
                  )}
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

              {/* Payment Method Selection */}
              <div className="mt-6">
                <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <div>
                      <span className="font-medium">Cash on Delivery (COD)</span>
                      <p className="text-sm text-black/60">Pay when you receive the order</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa"
                      checked={paymentMethod === "easypaisa"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <div>
                      <span className="font-medium">EasyPaisa</span>
                      <p className="text-sm text-black/60">Send money via EasyPaisa</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jazzcash"
                      checked={paymentMethod === "jazzcash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <div>
                      <span className="font-medium">JazzCash</span>
                      <p className="text-sm text-black/60">Send money via JazzCash</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 border border-black/10 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <div>
                      <span className="font-medium">Direct Bank Transfer</span>
                      <p className="text-sm text-black/60">Transfer directly to bank account</p>
                    </div>
                  </label>
                </div>

                {/* Account Details for Non-COD Methods */}
                {(paymentMethod === "easypaisa" || paymentMethod === "jazzcash" || paymentMethod === "bank") && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/10">
                    <h3 className="font-semibold mb-3">Account Details</h3>
                    {paymentMethod === "easypaisa" && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Account Number:</span> {accountDetails.easypaisa.accountNumber}</p>
                        <p><span className="font-medium">Account Name:</span> {accountDetails.easypaisa.accountName}</p>
                        <p className="text-black/60 mt-2">{accountDetails.easypaisa.instructions}</p>
                      </div>
                    )}
                    {paymentMethod === "jazzcash" && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Account Number:</span> {accountDetails.jazzcash.accountNumber}</p>
                        <p><span className="font-medium">Account Name:</span> {accountDetails.jazzcash.accountName}</p>
                        <p className="text-black/60 mt-2">{accountDetails.jazzcash.instructions}</p>
                      </div>
                    )}
                    {paymentMethod === "bank" && (
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Bank Name:</span> {accountDetails.bank.bankName}</p>
                        <p><span className="font-medium">Account Number:</span> {accountDetails.bank.accountNumber}</p>
                        <p><span className="font-medium">Account Name:</span> {accountDetails.bank.accountName}</p>
                        <p className="text-black/60 mt-2">{accountDetails.bank.instructions}</p>
                      </div>
                    )}
                    
                    {/* Transaction ID Input */}
                    <div className="mt-4">
                      <InputGroup className="bg-white">
                        <InputGroup.Input
                          type="text"
                          placeholder="Enter Transaction ID / Reference Number"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="bg-transparent"
                        />
                      </InputGroup>
                      <p className="text-xs text-black/60 mt-1">
                        Enter the transaction ID or reference number after sending the money
                      </p>
                    </div>
                  </div>
                )}
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

