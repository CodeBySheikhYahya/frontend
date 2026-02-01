import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { getNewArrivals, getTopSelling } from "@/lib/supabase/products";
import { getFeaturedReviews } from "@/lib/supabase/reviews";
import { unstable_noStore } from "next/cache";

// Make this page dynamic to avoid build-time Supabase calls
export const dynamic = 'force-dynamic';

export default async function Home() {
  unstable_noStore(); // Never cache: every request gets fresh data
  // Fetch data from Supabase
  const [newArrivalsData, topSellingData, reviewsData] = await Promise.all([
    getNewArrivals(4),
    getTopSelling(4),
    getFeaturedReviews(3),
  ]);

  return (
    <div>
      <Header />
      <Brands />
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
          <DressStyle />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </div>
  );
}
