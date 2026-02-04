import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { getProductById, getRelatedProducts, getAllProducts } from "@/lib/supabase/products";
import { notFound } from "next/navigation";
import { unstable_noStore } from "next/cache";

// Make this page dynamic to avoid build-time Supabase calls
export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  unstable_noStore(); // Never cache: every request gets fresh data from Supabase
  // Get product ID from slug (first part)
  const productId = params.slug[0];
  
  // Fetch product from Supabase
  const productData = await getProductById(productId);

  if (!productData) {
    notFound();
  }

  // Fetch related products (for now, just get some products as related)
  // In the future, you can improve this to get products from same category
  const relatedProducts = await getAllProducts(4, 0);

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs productId={productData.id as string} description={productData.description} />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={relatedProducts.filter(p => p.id !== productData.id).slice(0, 4)} />
      </div>
    </main>
  );
}
