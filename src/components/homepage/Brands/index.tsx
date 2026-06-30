import React from "react";
import { satoshi } from "@/styles/fonts";
import { cn } from "@/lib/utils";

const highlights = [
  "Private Label",
  "Generic Apparel",
  "Unbranded Styles",
  "SRX Collection",
  "Quality Basics",
];

const Brands = () => {
  return (
    <div className="bg-black">
      <div className="max-w-frame mx-auto flex flex-wrap items-center justify-center md:justify-between py-5 md:py-0 sm:px-4 xl:px-0 gap-x-7 gap-y-3">
        {highlights.map((label) => (
          <span
            key={label}
            className={cn(
              satoshi.className,
              "text-white/90 text-sm md:text-base font-medium tracking-wide my-5 md:my-11"
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Brands;
