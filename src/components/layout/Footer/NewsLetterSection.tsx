"use client";

import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Image from "next/image";
import React, { useState } from "react";

const NewsLetterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Successfully subscribed!" });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to subscribe. Please try again." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-black rounded-[20px]">
      <p
        className={cn([
          integralCF.className,
          "font-bold text-[32px] md:text-[40px] text-white mb-9 md:mb-0",
        ])}
      >
        STAY UP TO DATE ABOUT OUR LATEST OFFERS
      </p>
      <div className="flex items-center">
        <div className="flex flex-col max-w-[349px] mx-auto w-full">
          <form onSubmit={handleSubmit}>
            <InputGroup className="flex bg-white mb-[14px]">
              <InputGroup.Text>
                <Image
                  priority
                  src="/icons/envelope.svg"
                  height={20}
                  width={20}
                  alt="email"
                  className="min-w-5 min-h-5"
                />
              </InputGroup.Text>
              <InputGroup.Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-transparent placeholder:text-black/40 placeholder:text-sm sm:placeholder:text-base"
                required
              />
            </InputGroup>
            {message && (
              <p
                className={cn(
                  "text-sm mb-2 text-center",
                  message.type === "success" ? "text-green-400" : "text-red-400"
                )}
              >
                {message.text}
              </p>
            )}
            <Button
              variant="secondary"
              type="submit"
              disabled={loading}
              className="text-sm sm:text-base font-medium bg-white h-12 rounded-full px-4 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Subscribe to Newsletter"
            >
              {loading ? "Subscribing..." : "Subscribe to Newsletter"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsLetterSection;
