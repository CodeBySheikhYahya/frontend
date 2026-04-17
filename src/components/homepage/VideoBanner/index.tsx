"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop&q=80";
const FALLBACK_VIDEO = "/videos/journey.mp4";

export interface BtsVideoData {
  videoUrl: string;
  posterUrl: string | null;
  title: string;
  subtitle: string;
}

interface VideoBannerProps {
  videos?: BtsVideoData[];
}

const VideoBanner = ({ videos }: VideoBannerProps) => {
  const activeVideo =
    videos && videos.length > 0
      ? videos[0]
      : {
          videoUrl: FALLBACK_VIDEO,
          posterUrl: FALLBACK_POSTER,
          title: "Our Journey",
          subtitle:
            "From thread to fabric, every piece tells a story of craftsmanship and heritage.",
        };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const allVideos = videos && videos.length > 0 ? videos : [activeVideo];
  const current = allVideos[currentIdx] || allVideos[0];

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

  const handleVideoEnded = useCallback(() => {
    if (allVideos.length > 1) {
      const nextIdx = (currentIdx + 1) % allVideos.length;
      setCurrentIdx(nextIdx);
      if (videoRef.current) {
        videoRef.current.src = allVideos[nextIdx].videoUrl;
        videoRef.current.play();
      }
    }
  }, [currentIdx, allVideos]);

  const posterSrc = current.posterUrl || FALLBACK_POSTER;

  return (
    <section className="relative w-full h-[480px] md:h-[560px] overflow-hidden">
      {posterSrc.startsWith("http") ? (
        <Image
          src={posterSrc}
          alt={current.title || "Behind the scenes"}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <Image
          src={posterSrc}
          alt={current.title || "Behind the scenes"}
          fill
          className="object-cover"
          sizes="100vw"
        />
      )}

      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex flex-col justify-center items-center gap-5 md:gap-6 px-6 md:px-20 py-12 md:py-[60px]">
        <p className="text-[10px] md:text-[12px] font-medium tracking-[3px] md:tracking-[4px] text-white/[0.67] text-center uppercase">
          Behind The Scenes
        </p>

        <h2 className="font-playfairDisplay text-[40px] md:text-[64px] italic font-normal text-white text-center leading-tight">
          {current.title}
        </h2>

        <p className="text-[14px] md:text-[16px] font-normal text-white/[0.73] text-center max-w-[300px] md:max-w-[540px]">
          {current.subtitle}
        </p>

        <button
          onClick={handlePlay}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.93] flex items-center justify-center border-2 md:border-[3px] border-white/[0.27] hover:scale-110 transition-transform duration-300 cursor-pointer"
          aria-label="Play video"
        >
          <svg
            viewBox="0 0 22 26"
            fill="none"
            className="w-[18px] h-[22px] md:w-[22px] md:h-[26px] ml-1"
          >
            <path d="M0 0L22 13L0 26Z" fill="#1A1A1A" />
          </svg>
        </button>

        <div className="flex items-center gap-4 md:gap-6">
          <span className="text-[11px] md:text-[13px] font-medium tracking-[2px] text-white/[0.53]">
            Watch the Film
          </span>
          <div className="w-px h-3 md:h-3.5 bg-white/20" />
          <span className="text-[11px] md:text-[13px] font-medium tracking-[2px] text-white/[0.53]">
            {allVideos.length > 1
              ? `${currentIdx + 1} / ${allVideos.length}`
              : "BTS"}
          </span>
        </div>

        {allVideos.length > 1 && (
          <div className="flex items-center gap-2">
            {allVideos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  currentIdx === i
                    ? "w-6 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {isPlaying && (
        <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            autoPlay
            src={current.videoUrl}
            onEnded={handleVideoEnded}
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
