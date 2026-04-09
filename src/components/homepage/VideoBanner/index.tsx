"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const POSTER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80";

const VIDEO_SRC = "/videos/journey.mp4";

const VideoBanner = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  return (
    <section className="relative w-full h-[480px] md:h-[560px] overflow-hidden">
      {/* Background poster image */}
      <Image
        src={POSTER_IMAGE}
        alt="Behind the scenes at our atelier"
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content — pixel-perfect from Pencil */}
      <div className="absolute inset-0 flex flex-col justify-center items-center gap-5 md:gap-6 px-6 md:px-20 py-12 md:py-[60px]">
        {/* Eyebrow: mobile 10px/tracking-[3px], desktop 12px/tracking-[4px] */}
        <p className="text-[10px] md:text-[12px] font-medium tracking-[3px] md:tracking-[4px] text-white/[0.67] text-center uppercase">
          Behind The Scenes
        </p>

        {/* Title: mobile 40px, desktop 64px, Playfair Display italic */}
        <h2 className="font-playfairDisplay text-[40px] md:text-[64px] italic font-normal text-white text-center leading-tight">
          Our Journey
        </h2>

        {/* Subtitle: mobile 14px/max-w-[300px], desktop 16px/max-w-[540px] */}
        <p className="text-[14px] md:text-[16px] font-normal text-white/[0.73] text-center max-w-[300px] md:max-w-[540px]">
          From thread to fabric, every piece tells a story of craftsmanship and
          heritage.
        </p>

        {/* Play button: mobile 64px/border-2, desktop 80px/border-[3px] */}
        <button
          onClick={handlePlay}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.93] flex items-center justify-center border-2 md:border-[3px] border-white/[0.27] hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Play video"
        >
          {/* Play triangle: mobile 18x22, desktop 22x26 */}
          <svg
            viewBox="0 0 22 26"
            fill="none"
            className="w-[18px] h-[22px] md:w-[22px] md:h-[26px] ml-1"
          >
            <path d="M0 0L22 13L0 26Z" fill="#1A1A1A" />
          </svg>
        </button>

        {/* Bottom row: mobile gap-4/11px, desktop gap-6/13px */}
        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-[11px] md:text-[13px] font-medium tracking-[2px] text-white/[0.53]">
            Watch the Film
          </span>
          {/* Divider: mobile h-3, desktop h-3.5 */}
          <div className="w-px h-3 md:h-3.5 bg-white/20" />
          <span className="text-[11px] md:text-[13px] font-medium tracking-[2px] text-white/[0.53]">
            2:34 MIN
          </span>
        </div>
      </div>

      {/* Fullscreen video overlay */}
      {isPlaying && (
        <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            autoPlay
            src={VIDEO_SRC}
          />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors z-20 text-lg cursor-pointer"
            aria-label="Close video"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
};

export default VideoBanner;
