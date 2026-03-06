import dynamic from "next/dynamic";
import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import Header from "@/components/homepage/Header";
import { getNewArrivals, getTopSelling } from "@/lib/supabase/products";
import { getFeaturedReviews } from "@/lib/supabase/reviews";

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
