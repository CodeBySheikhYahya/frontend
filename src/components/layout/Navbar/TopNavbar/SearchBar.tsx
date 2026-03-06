"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await response.json();
        setResults(data.products || []);
        setShowResults(true);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    setSearchQuery("");
    // Navigate to product page - using same format as ProductCard
    const productSlug = product.title.split(" ").join("-");
    const productId = String(product.id);
    router.push(`/shop/product/${productId}/${productSlug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      handleProductClick(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        <InputGroup className="bg-[#F0F0F0]">
          <InputGroup.Text>
            <Image
              priority
              src="/icons/search.svg"
              height={20}
              width={20}
              alt="search"
              className="min-w-5 min-h-5"
            />
          </InputGroup.Text>
          <InputGroup.Input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for products..."
            className="bg-transparent placeholder:text-black/40"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
        </InputGroup>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="p-2">
                {results.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedIndex === index && "bg-gray-50"
                    )}
                  >
                    <div className="w-12 h-12 bg-[#F0EEED] rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={product.srcUrl}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-black truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-black/60">
                        ${product.discount.percentage > 0
                          ? Math.round(product.price - (product.price * product.discount.percentage) / 100)
                          : product.discount.amount > 0
                          ? Math.round(product.price - product.discount.amount)
                          : product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {searchQuery.trim() && (
                <div className="border-t border-gray-200 p-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    className="block text-center text-sm text-black hover:text-black/60 font-medium py-2"
                    onClick={() => setShowResults(false)}
                  >
                    View all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </>
          ) : searchQuery.trim().length >= 2 && !isLoading ? (
            <div className="p-4 text-center text-sm text-gray-600">
              No products found matching "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
