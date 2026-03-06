"use client";

import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import ProductCard from "@/components/common/ProductCard";
import SearchBar from "@/components/layout/Navbar/TopNavbar/SearchBar";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product.types";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=50`)
        .then(res => res.json())
        .then(data => {
          setProducts(data.products || []);
          setIsLoading(false);
        })
        .catch(err => {
          setProducts([]);
          setIsLoading(false);
        });
    } else {
      setProducts([]);
    }
  }, [query]);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        
        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <SearchBar />
        </div>
        
        <div className="py-6">
          {query ? (
            <>
              <h1 className={cn([integralCF.className, "text-2xl md:text-3xl font-bold mb-2"])}>
                Search Results
              </h1>
              <p className="text-black/60 mb-6">
                Found {products.length} {products.length === 1 ? 'product' : 'products'} for "{query}"
              </p>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Searching...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} data={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No products found matching "{query}"</p>
                  <Link 
                    href="/shop" 
                    className="text-black hover:underline font-medium"
                  >
                    Browse all products
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h1 className={cn([integralCF.className, "text-2xl md:text-3xl font-bold mb-2"])}>
                Search Products
              </h1>
              <p className="text-black/60 mb-6">
                Enter a search term to find products by name or category
              </p>
              <Link 
                href="/shop" 
                className="text-black hover:underline font-medium"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SearchPage;
