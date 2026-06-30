import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import ShopFilters from "@/components/shop-page/ShopFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/common/ProductCard";
import { getAllProducts, getNewArrivals, getTopSelling, getOnSaleProducts, getFilteredProducts } from "@/lib/supabase/products";
import {
  padOnSaleWithUsaDemoProducts,
  padWithUsaDemoProducts,
  padWithUsaDemoProductsExcluding,
} from "@/lib/homepage-pad-demo-products";
import { getAllUsaDemoProducts, isCatalogProductId, usaDemoProductPath } from "@/lib/usa-demo-catalog";
import type { Product } from "@/types/product.types";
import { unstable_noStore } from "next/cache";

// Make this page dynamic to avoid build-time Supabase calls
export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: { 
    filter?: string;
    category?: string;
    [key: string]: string | undefined;
  };
}

const SHOP_PAGE_SIZE = 9;

function resolveShopProductHref(product: Product) {
  if (isCatalogProductId(product.id)) {
    return usaDemoProductPath(product);
  }
  return undefined;
}

const ShopPage: React.FC<ShopPageProps> = async ({ searchParams }) => {
  unstable_noStore(); // Never cache: every request gets fresh data
  const filter = searchParams?.filter || 'all';
  const categoryId = searchParams?.category;
  const limit = SHOP_PAGE_SIZE;
  const offset = 0;

  // Parse attribute filters from URL params
  const attributeFilters: Record<string, string[]> = {};
  Object.keys(searchParams).forEach((key) => {
    if (key.startsWith('attr_')) {
      const attrId = key.replace('attr_', '');
      const valueIds = searchParams[key]?.split(',').filter(Boolean) || [];
      if (valueIds.length > 0) {
        attributeFilters[attrId] = valueIds;
      }
    }
  });

  // Fetch products based on filter
  let products;
  let pageTitle = 'All Products';

  // If category or attribute filters are applied, use filtered products
  if (categoryId || Object.keys(attributeFilters).length > 0) {
    products = await getFilteredProducts({
      categoryId: categoryId,
      attributeFilters: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
      limit,
      offset,
    });
    pageTitle = 'Filtered Products';
  } else {
  switch (filter) {
    case 'new-arrivals':
      products = await getNewArrivals(limit, offset);
      pageTitle = 'New Arrivals';
      break;
    case 'top-selling':
      products = await getTopSelling(limit, offset);
      pageTitle = 'Top Selling';
      break;
    case 'on-sale':
      products = await getOnSaleProducts(limit, offset);
      pageTitle = 'On Sale';
      break;
    default:
      products = await getAllProducts(limit, offset);
      pageTitle = 'All Products';
    }
  }

  // When Supabase has no rows, show the private-label catalog as the homepage does.
  if (!categoryId && Object.keys(attributeFilters).length === 0 && products.length === 0) {
    if (filter === "new-arrivals" || filter === "all") {
      products = padWithUsaDemoProducts([], limit);
    } else if (filter === "on-sale") {
      products = padOnSaleWithUsaDemoProducts([], limit, []);
    } else if (filter === "top-selling") {
      products = padWithUsaDemoProductsExcluding(
        [],
        limit,
        getAllUsaDemoProducts().slice(0, limit)
      );
    }
  }

  const breadcrumbSegment =
    categoryId || Object.keys(attributeFilters).length > 0
      ? pageTitle
      : filter !== "all"
        ? pageTitle
        : undefined;

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop segment={breadcrumbSegment} />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ShopFilters />
          </div>
          
          {/* Products Grid */}
          <div className="flex-1 flex flex-col w-full space-y-5">
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-2xl md:text-[32px] capitalize">{pageTitle}</h1>
              {/* You can remove MobileFilters component entirely */}
            </div>
            <div className="flex flex-col sm:items-center sm:flex-row">
              <span className="text-sm md:text-base text-black/60 mr-3">
                {products.length === 0
                  ? "No products to show"
                  : `Showing 1–${products.length} of ${products.length} products`}
              </span>
              <div className="flex items-center">
                Sort by:{" "}
                <Select defaultValue="most-popular">
                  <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-popular">Most Popular</SelectItem>
                    <SelectItem value="low-price">Low Price</SelectItem>
                    <SelectItem value="high-price">High Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  data={product}
                  href={resolveShopProductHref(product)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No products found in this category.</p>
              </div>
            )}
          </div>
          {products.length > limit ? (
            <>
              <hr className="border-t-black/10" />
              <p className="text-center text-sm text-black/50">
                Pagination will appear here when the catalog has more than {limit} items in this
                view.
              </p>
            </>
          ) : null}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
