import dynamic from "next/dynamic";
import Link from "next/link";
import ProductListSec from "@/components/common/ProductListSec";
import {
  getNewArrivals,
  getOnSaleProducts,
  getTopSelling,
} from "@/lib/supabase/products";
import {
  padOnSaleWithUsaDemoProducts,
  padWithUsaDemoProducts,
  padWithUsaDemoProductsExcluding,
} from "@/lib/homepage-pad-demo-products";
import { isCatalogProductId, usaDemoProductPath } from "@/lib/usa-demo-catalog";
import type { Product } from "@/types/product.types";
import { getFeaturedReviews } from "@/lib/supabase/reviews";
import { getActiveBtsVideos } from "@/lib/supabase/admin-bts";
import type { BannerSlide } from "@/components/homepage/Header";
import type { BtsVideoData } from "@/components/homepage/VideoBanner";
import { US_BRAND_HERO_SLIDES } from "@/data/us-brand-hero-slides";

const Header = dynamic(() => import("@/components/homepage/Header"), { ssr: false });
const TrendingCategories = dynamic(() => import("@/components/homepage/TrendingCategories"));
const VideoBanner = dynamic(() => import("@/components/homepage/VideoBanner"), { ssr: false });
const Reviews = dynamic(() => import("@/components/homepage/Reviews"));

export const revalidate = 60;

function resolveHomeProductHref(product: Product) {
  if (isCatalogProductId(product.id)) {
    return usaDemoProductPath(product);
  }
  return undefined;
}

export default async function Home() {
  const [newArrivalsRaw, onSaleRaw, topSellingRaw, reviewsData, btsData] =
    await Promise.all([
      getNewArrivals(4),
      getOnSaleProducts(4),
      getTopSelling(4),
      getFeaturedReviews(3),
      getActiveBtsVideos(),
    ]);

  const newArrivalsData = padWithUsaDemoProducts(newArrivalsRaw, 4);
  const newArrivalIds = new Set(newArrivalsData.map((p) => String(p.id)));
  const onSaleWithoutOverlap = onSaleRaw.filter((p) => !newArrivalIds.has(String(p.id)));
  const onSaleData = padOnSaleWithUsaDemoProducts(
    onSaleWithoutOverlap,
    4,
    newArrivalsData
  );

  const excludeFromTopSelling = [...newArrivalsData, ...onSaleData];
  const topSellingIds = new Set(excludeFromTopSelling.map((p) => String(p.id)));
  const topSellingWithoutOverlap = topSellingRaw.filter(
    (p) => !topSellingIds.has(String(p.id))
  );
  const topSellingData = padWithUsaDemoProductsExcluding(
    topSellingWithoutOverlap,
    4,
    excludeFromTopSelling
  );

  const bannerSlides: BannerSlide[] = [...US_BRAND_HERO_SLIDES];

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
      <Header banners={bannerSlides} />

      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop?filter=new-arrivals"
          resolveProductHref={resolveHomeProductHref}
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <ProductListSec
          title="ON SALE"
          data={onSaleData}
          viewAllLink="/shop?filter=on-sale"
          resolveProductHref={resolveHomeProductHref}
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop?filter=top-selling"
            resolveProductHref={resolveHomeProductHref}
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
