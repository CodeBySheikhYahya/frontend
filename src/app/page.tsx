import dynamic from "next/dynamic";
import Link from "next/link";
import ProductListSec from "@/components/common/ProductListSec";
import { getNewArrivals, getTopSelling } from "@/lib/supabase/products";
import { getFeaturedReviews } from "@/lib/supabase/reviews";
import { getActiveBanners } from "@/lib/supabase/admin-banners";
import { getActiveBtsVideos } from "@/lib/supabase/admin-bts";
import type { BannerSlide } from "@/components/homepage/Header";
import type { BtsVideoData } from "@/components/homepage/VideoBanner";

const Header = dynamic(() => import("@/components/homepage/Header"), { ssr: false });
const TrendingCategories = dynamic(() => import("@/components/homepage/TrendingCategories"));
const VideoBanner = dynamic(() => import("@/components/homepage/VideoBanner"), { ssr: false });
const Reviews = dynamic(() => import("@/components/homepage/Reviews"));

export const revalidate = 60;

export default async function Home() {
  const [newArrivalsData, topSellingData, reviewsData, bannersData, btsData] = await Promise.all([
    getNewArrivals(4),
    getTopSelling(4),
    getFeaturedReviews(3),
    getActiveBanners(),
    getActiveBtsVideos(),
  ]);

  const bannerSlides: BannerSlide[] = bannersData.map((b) => ({
    type: b.type,
    src: b.media_url,
    alt: b.alt_text || "",
  }));

  const btsVideos: BtsVideoData[] = btsData.map((v) => ({
    videoUrl: v.video_url,
    posterUrl: v.poster_url,
    title: v.title || "Our Journey",
    subtitle: v.subtitle || "From thread to fabric, every piece tells a story of craftsmanship and heritage.",
  }));

  return (
    <div>
      <div className="flex justify-center items-center py-[24px] md:py-[14px] px-[16px]">
        <Link href="/shop" className="group relative inline-flex items-center justify-center bg-transparent border border-black/80 text-black px-[72px] py-[14px] md:py-[11px] rounded-[5px] text-[15px] tracking-[0.12em] uppercase font-medium overflow-hidden transition-colors duration-500 ease-out hover:text-white hover:border-black">
          <span className="absolute inset-0 bg-black origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]" />
          <span className="relative z-10">Shop Now</span>
        </Link>
      </div>
      <Header banners={bannerSlides.length > 0 ? bannerSlides : undefined} />

      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop?filter=new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop?filter=top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <TrendingCategories />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <VideoBanner videos={btsVideos.length > 0 ? btsVideos : undefined} />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </div>
  );
}
