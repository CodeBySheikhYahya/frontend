import dynamic from "next/dynamic";
import ProductListSec from "@/components/common/ProductListSec";
import { getNewArrivals, getTopSelling } from "@/lib/supabase/products";
import { getFeaturedReviews } from "@/lib/supabase/reviews";

const Header = dynamic(() => import("@/components/homepage/Header"), { ssr: false });
const TrendingCategories = dynamic(() => import("@/components/homepage/TrendingCategories"));
const DressStyle = dynamic(() => import("@/components/homepage/DressStyle"));
const Reviews = dynamic(() => import("@/components/homepage/Reviews"));

export const revalidate = 60;

export default async function Home() {
  const [newArrivalsData, topSellingData, reviewsData] = await Promise.all([
    getNewArrivals(4),
    getTopSelling(4),
    getFeaturedReviews(3),
  ]);

  return (
    <div>
      <div className="flex justify-center items-center py-[24px] md:py-[14px] px-[16px]">
        <button className="inline-flex items-center justify-center bg-black hover:bg-black/80 transition-all text-white px-[72px] py-[16px] md:py-[12px] rounded-[50px] text-[16px] font-medium">
          Shop Now
        </button>
      </div>
      <Header />

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
          <DressStyle />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </div>
  );
}
