/**
 * Hero carousel: `src` = mobile (unchanged / portrait-friendly).
 * `srcDesktop` = wide landscape crops for md+ viewports.
 */
export const US_BRAND_HERO_SLIDES = [
  {
    type: "image" as const,
    src: "/images/hero-srx-mobile.png",
    srcDesktop:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=3200&h=1000&q=85",
    alt: "SRX retail — boutique interior with modern graphic energy",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85",
    srcDesktop:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=3200&h=1000&q=85",
    alt: "Editorial fashion portrait — clean American style lighting",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=2000&q=85",
    srcDesktop:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=3200&h=1000&q=85",
    alt: "Minimal studio apparel — neutral SRX brand mood",
  },
  {
    type: "image" as const,
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=85",
    srcDesktop:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=3200&h=1000&q=85",
    alt: "City shopping avenue — US downtown retail energy",
  },
] as const;
