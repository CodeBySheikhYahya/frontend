"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const bannerSlides = [
  { src: "/images/banner-slide-1.png", alt: "Emerald green embroidered collection" },
  { src: "/images/banner-slide-2.png", alt: "Burgundy red anarkali collection" },
  { src: "/images/banner-slide-3.png", alt: "Navy blue sharara collection" },
  { src: "/images/banner-slide-4.png", alt: "Pastel pink lawn collection" },
];

const BannerSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = useCallback((index: number) => setCurrent(index), []);

  return (
    <div className="relative h-[420px] md:h-[520px] lg:h-[550px]">
      {bannerSlides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            current === i ? "opacity-100 z-[1]" : "opacity-0 z-0"
          )}
        >
          <Image
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              current === i
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
