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

  // Get unique sizes from product variants
  const availableSizes = useMemo(() => {
    console.log('📏 SizeSelection - Product variants:', product.variants)
    console.log('📏 SizeSelection - Variants length:', product.variants?.length || 0)
    
    if (!product.variants || product.variants.length === 0) {
      console.log('⚠️ SizeSelection - No variants found!')
      return [];
    }
    
    const sizeMap = new Map<string, string>();
    
    product.variants.forEach((variant, index) => {
      console.log(`📏 Variant ${index}:`, variant)
      console.log(`📏 Variant ${index} - size:`, variant.size)
      console.log(`📏 Variant ${index} - is_active:`, variant.is_active)
      
      // Show size if variant is active and has size data
      // Don't filter by stock - show all active variants
      if (variant.size && variant.is_active !== false) {
        console.log(`✅ Variant ${index} - Adding size:`, variant.size.name)
        if (!sizeMap.has(variant.size.id)) {
          sizeMap.set(variant.size.id, variant.size.name);
        }
      } else {
        console.log(`❌ Variant ${index} - Skipped (no size or inactive)`)
      }
    });
    
    const sizes = Array.from(sizeMap.values()).sort()
    console.log('📏 Final available sizes:', sizes)
    return sizes;
  }, [product.variants]);

  if (availableSizes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Choose Size
      </span>
      <div className="flex items-center flex-wrap lg:space-x-3">
        {availableSizes.map((size, index) => (
          <button
            key={index}
            type="button"
            className={cn([
              "bg-[#F0F0F0] flex items-center justify-center px-5 lg:px-6 py-2.5 lg:py-3 text-sm lg:text-base rounded-full m-1 lg:m-0 max-h-[46px]",
              sizeSelection === size && "bg-black font-medium text-white",
            ])}
            onClick={() => dispatch(setSizeSelection(size))}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelection;
