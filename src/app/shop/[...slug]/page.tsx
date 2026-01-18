import BreadcrumbCategory from "@/components/shop-page/BreadcrumbCategory";
import ShopFilters from "@/components/shop-page/ShopFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/common/ProductCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { getFilteredProducts } from "@/lib/supabase/products";
import { getCategoryBySlugPath, getChildCategoryIds } from "@/lib/supabase/categories";
import { notFound } from "next/navigation";

// Make this page dynamic to avoid build-time Supabase calls
export const dynamic = 'force-dynamic';

interface CategoryShopPageProps {
  params: {
    slug: string[];
  };
  searchParams: {
    [key: string]: string | undefined;
  };
}

const CategoryShopPage: React.FC<CategoryShopPageProps> = async ({ params, searchParams }) => {
  const slugPath = params.slug || [];
  const limit = 9;
  const offset = 0;

  // Get category by slug path
  const category = await getCategoryBySlugPath(slugPath);

  if (!category) {
    notFound();
  }

  // Determine category ID(s) to filter by
  let categoryIds: string[] = [category.id];

  // If this is a parent category, get all child category IDs
  const childIds = await getChildCategoryIds(category.id);
  if (childIds.length > 0) {
    categoryIds = childIds;
  }

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

  // Fetch products for this category (or its children)
  const products = await getFilteredProducts({
    categoryId: category.id, // This will handle parent/child logic internally
    attributeFilters: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
    limit,
    offset,
  });

  const pageTitle = category.name;

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbCategory 
          categoryName={category.name}
          parentName={category.parent?.name || null}
          parentSlug={category.parent?.slug || null}
        />
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ShopFilters initialCategoryId={category.id} />
          </div>
          
          {/* Products Grid */}
          <div className="flex-1 flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px] capitalize">{pageTitle}</h1>
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing 1-{products.length} of {products.length} Products
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
                  <ProductCard key={product.id} data={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">No products found in this category.</p>
                </div>
              )}
            </div>
            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious href="#" className="border border-black/10" />
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm">
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden lg:block">
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm">
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                </PaginationItem>
                <PaginationItem className="hidden lg:block">
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm">
                    8
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden sm:block">
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm">
                    9
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="text-black/50 font-medium text-sm">
                    10
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
              <PaginationNext href="#" className="border border-black/10" />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CategoryShopPage;
