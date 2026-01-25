"use client";

import { setSizeSelection } from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

const SizeSelection = ({ product }: { product: Product }) => {
  const { sizeSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  const { colorSelection } = useAppSelector((state: RootState) => state.products);

  // Get unique sizes from product variants with stock info
  const availableSizes = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return [];
    }
    
    const sizeMap = new Map<string, { name: string; hasStock: boolean; stockQuantity: number }>();
    
    product.variants.forEach((variant) => {
      if (variant.size && variant.is_active !== false) {
        const sizeId = variant.size.id;
        const stockQty = variant.stock_quantity || 0;
        const hasStock = stockQty > 0;
        
        // If color is selected, only check variants with that color
        const matchesColor = !colorSelection.name || variant.color?.name === colorSelection.name;
        
        if (!sizeMap.has(sizeId)) {
          sizeMap.set(sizeId, {
            name: variant.size.name,
            hasStock: matchesColor ? hasStock : true, // If color not selected, show as available
            stockQuantity: matchesColor ? stockQty : 999, // If color not selected, show high number
          });
        } else {
          // If color selected, sum stock for this size+color combination
          // If color not selected, keep highest stock
          const existing = sizeMap.get(sizeId)!;
          if (matchesColor) {
            sizeMap.set(sizeId, { 
              ...existing, 
              hasStock: hasStock || existing.hasStock,
              stockQuantity: stockQty, // Stock for selected color
            });
          } else {
            // Color not selected - keep existing stock (shows max available)
            sizeMap.set(sizeId, { 
              ...existing, 
              stockQuantity: Math.max(existing.stockQuantity, stockQty),
            });
          }
        }
      }
    });
    
    return Array.from(sizeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [product.variants, colorSelection.name]);

  if (availableSizes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Choose Size
      </span>
      <div className="flex items-center flex-wrap lg:space-x-3">
        {availableSizes.map((size, index) => {
          const isSelected = sizeSelection === size.name;
          const isOutOfStock = !size.hasStock;
          
          return (
            <div key={index} className="relative m-1 lg:m-0">
              <button
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base rounded-full max-h-[46px]",
                  isSelected && !isOutOfStock && "bg-black font-medium text-white",
                  isOutOfStock && "opacity-50 cursor-not-allowed bg-gray-200",
                ])}
                onClick={() => !isOutOfStock && dispatch(setSizeSelection(size.name))}
                disabled={isOutOfStock}
              >
                {size.name}
              </button>
              {isOutOfStock ? (
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-red-600 font-medium whitespace-nowrap">
                  Out of Stock
                </span>
              ) : colorSelection.name && size.stockQuantity > 0 && (
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-black/60 font-medium whitespace-nowrap">
                  {size.stockQuantity} left
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelection;
