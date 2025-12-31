import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { getAllProducts } from "@/lib/supabase/products";

// Make this page dynamic to avoid build-time Supabase calls
export const dynamic = 'force-dynamic';

const ShopPage: React.FC = async () => {
  // Fetch products from Supabase
  const products = await getAllProducts(9, 0);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex flex-col w-full space-y-5">
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-2xl md:text-[32px]">Casual</h1>
              {/* You can remove MobileFilters component entirely */}
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
            {products.map((product) => (
              <ProductCard key={product.id} data={product} />
            ))}
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
    </main>
  );
};

export default ShopPage;
