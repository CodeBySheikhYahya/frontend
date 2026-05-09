"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { clearCart } from "@/lib/features/carts/cartsSlice";
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
import { useRouter } from "next/navigation";
import { formatUSD } from "@/lib/format-currency";
import { CONTACT_EMAIL } from "@/lib/contact-constants";
import { CheckCircle2, ImagePlus, X } from "lucide-react";

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


type PlacedLineItem = {
  key: string;
  displayId: string;
  name: string;
  quantity: number;
};

function generateClientOrderRef() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(100 + Math.random() * 900);
  return `SRX-${t}-${r}`;
}

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
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
    country: "United States",
  });

  const [usCities, setUsCities] = useState<Array<{ name: string }>>([]);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  useEffect(() => {
    import("country-state-city").then(({ City }) => {
      setUsCities(
        (City.getCitiesOfCountry("US") || []).map((c) => ({ name: c.name || "" }))
      );
    });
  }, []);

  const filteredCities = useMemo(
    () =>
      usCities
        .filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
        .slice(0, 50),
    [usCities, citySearch]
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const paymentMethod = "bank" as const;
  const [transactionId, setTransactionId] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [showThanksModal, setShowThanksModal] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedLineItems, setPlacedLineItems] = useState<PlacedLineItem[]>([]);

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  function clearReceipt() {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    setReceiptFile(null);
  }

  function handleReceiptSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Screenshot must be 5 MB or smaller.");
      return;
    }
    setSubmitError(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  }

  const capitalOneBank = {
    bankName: "Capital One",
    routingNumber: "065000090",
    accountNumber: "5734186888",
    accountName: "Merchant Provider SRX",
    businessAddress: "12849 Climbing Ivy Dr",
    instructions:
      "Send a domestic ACH or wire transfer in U.S. dollars. Put your order number in the memo / reference field so we can match your payment.",
  };

  if ((!cart || cart.items.length === 0) && !showThanksModal) {
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
    
    if (!transactionId.trim() && !receiptFile) {
      setSubmitError(
        "Enter your confirmation / trace / reference number from Capital One, or upload a payment receipt screenshot (or both)."
      );
      return;
    }

    const noteParts: string[] = [];
    if (transactionId.trim()) {
      noteParts.push(`Confirmation / trace / reference: ${transactionId.trim()}`);
    }
    if (receiptFile) {
      noteParts.push(`Receipt screenshot (filename): ${receiptFile.name}`);
    }
    const combinedNotes = noteParts.join(" | ");

    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 400));

      const orderRef = generateClientOrderRef();
      const lines: PlacedLineItem[] = cart.items.map((item, idx) => ({
        key: `${String(item.id)}-${idx}-${item.attributes.join("-")}`,
        displayId:
          item.productId != null && String(item.productId).trim() !== ""
            ? String(item.productId)
            : String(item.id),
        name: item.name,
        quantity: item.quantity,
      }));

      setPlacedOrderNumber(orderRef);
      setPlacedLineItems(lines);
      setShowThanksModal(true);
      clearReceipt();
      setTransactionId("");
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  function finishCheckoutAndNavigate(href: string) {
    dispatch(clearCart());
    setShowThanksModal(false);
    setPlacedOrderNumber(null);
    setPlacedLineItems([]);
    router.push(href);
  }

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

              {/* Payment: Capital One bank transfer only */}
              <div className="mt-6">
                <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
                  Payment method
                </h2>
                <div className="p-4 border border-black/10 rounded-lg bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/icons/capital-one-mark.svg"
                      alt="Capital One"
                      width={160}
                      height={28}
                      className="h-7 w-auto shrink-0"
                    />
                    <span className="text-sm font-medium text-black/80">
                      Bank transfer (ACH / wire)
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-black/10 text-sm space-y-2">
                    <p>
                      <span className="font-medium">Bank:</span> {capitalOneBank.bankName}
                    </p>
                    <p>
                      <span className="font-medium">Business address:</span>{" "}
                      {capitalOneBank.businessAddress}
                    </p>
                    <p>
                      <span className="font-medium">Routing number (ABA):</span>{" "}
                      {capitalOneBank.routingNumber}
                    </p>
                    <p>
                      <span className="font-medium">Account number:</span>{" "}
                      {capitalOneBank.accountNumber}
                    </p>
                    <p>
                      <span className="font-medium">Account name:</span>{" "}
                      {capitalOneBank.accountName}
                    </p>
                    <p className="text-black/60 pt-2 border-t border-black/10">
                      {capitalOneBank.instructions}
                    </p>

                    <div className="mt-5 space-y-4 border-t border-black/10 pt-5">
                      <div>
                        <label
                          htmlFor="bank-confirmation"
                          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/55"
                        >
                          Confirmation / trace / reference
                        </label>
                        <InputGroup className="bg-white">
                          <InputGroup.Input
                            id="bank-confirmation"
                            type="text"
                            autoComplete="off"
                            placeholder="e.g. confirmation number, trace #, or transaction ID from Capital One"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="bg-transparent"
                          />
                        </InputGroup>
                        <p className="mt-2 text-xs leading-relaxed text-black/55">
                          On Capital One, completed transfers usually show a{" "}
                          <span className="font-medium text-black/70">confirmation</span> or{" "}
                          <span className="font-medium text-black/70">reference</span> on the
                          receipt; ACH transfers may list a{" "}
                          <span className="font-medium text-black/70">trace number</span>. Wires
                          may show a{" "}
                          <span className="font-medium text-black/70">Federal reference</span> or
                          similar. Copy the value that uniquely identifies your payment.
                        </p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/55">
                          Payment receipt (screenshot)
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                          <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-white px-4 py-6 text-center transition hover:border-black/30 hover:bg-black/[0.02] sm:min-h-[120px]">
                            <ImagePlus className="mb-2 h-8 w-8 text-black/40" aria-hidden />
                            <span className="text-sm font-medium text-black">
                              Tap to upload screenshot
                            </span>
                            <span className="mt-1 text-xs text-black/45">
                              PNG, JPG, or WebP · max 5 MB · stays in your browser until you place
                              the order
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="sr-only"
                              onChange={handleReceiptSelect}
                            />
                          </label>
                          {receiptPreview ? (
                            <div className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] sm:max-w-[220px] sm:shrink-0">
                              <button
                                type="button"
                                onClick={clearReceipt}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-md transition hover:bg-black"
                                aria-label="Remove screenshot"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview */}
                              <img
                                src={receiptPreview}
                                alt="Payment receipt preview"
                                className="mx-auto max-h-[200px] w-full object-contain sm:max-h-[220px]"
                              />
                            </div>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs text-black/55">
                          Optional but recommended.                           Also email the same screenshot to{" "}
                          <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            className="font-medium text-black underline underline-offset-2"
                          >
                            {CONTACT_EMAIL}
                          </a>{" "}
                          with your order number after you place the order.
                        </p>
                      </div>
                    </div>
                  </div>
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
                        {formatUSD(
                          item.discount.percentage > 0
                            ? Math.round(
                                item.price -
                                  (item.price * item.discount.percentage) / 100
                              )
                            : item.discount.amount > 0
                              ? item.price - item.discount.amount
                              : item.price
                        )}{" "}
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
                  <span className="font-medium">{formatUSD(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-black/60">Discount</span>
                  <span className="font-medium text-[#FF3333]">
                    {formatUSD(-(totalPrice - adjustedTotalPrice))}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-black/60">Delivery Fee</span>
                  <span className="font-medium">Free</span>
                </div>
                <hr className="h-[1px] border-t-black/10" />
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>{formatUSD(adjustedTotalPrice)}</span>
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
                disabled={isSubmitting || showThanksModal}
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

      {showThanksModal && placedOrderNumber ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thanks-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
            </div>
            <h2
              id="thanks-title"
              className={cn(integralCF.className, "text-center text-2xl font-bold text-black")}
            >
              Thank you — your request is recorded
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-black/65">
              Checkout runs in your browser only (no database). Save your{" "}
              <span className="font-semibold text-black">order reference</span> and the product
              IDs below, then email your payment receipt to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order ${placedOrderNumber}`)}`}
                className="font-semibold text-black underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <div className="mt-6 rounded-xl bg-[#F4F2F0] px-4 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                Order reference
              </p>
              <p className="mt-1 break-all font-mono text-lg font-bold text-black sm:text-xl">
                {placedOrderNumber}
              </p>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">
                Items in this checkout
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-black/10 bg-white p-3 text-left text-sm">
                {placedLineItems.map((line) => (
                  <li
                    key={line.key}
                    className="border-b border-black/[0.06] py-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-black">{line.name}</span>
                    <span className="mt-0.5 block font-mono text-xs text-black/55">
                      Product ID: {line.displayId}
                      {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="h-12 flex-1 rounded-full bg-black text-white hover:bg-black/90"
                onClick={() => finishCheckoutAndNavigate("/shop")}
              >
                Continue shopping
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-full border-black/20"
                onClick={() => finishCheckoutAndNavigate("/usa-shop")}
              >
                Browse USA Shop
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default CheckoutPage;

