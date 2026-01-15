"use client";

import {
  Color,
  setColorSelection,
} from "@/lib/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Product } from "@/types/product.types";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";
import { IoMdCheckmark } from "react-icons/io";

const ColorSelection = ({ product }: { product: Product }) => {
  const { colorSelection } = useAppSelector(
    (state: RootState) => state.products
  );
  const dispatch = useAppDispatch();

  // Get unique colors from product variants
  const availableColors = useMemo(() => {
    console.log('🎨 ColorSelection - Product variants:', product.variants)
    console.log('🎨 ColorSelection - Variants length:', product.variants?.length || 0)
    
    if (!product.variants || product.variants.length === 0) {
      console.log('⚠️ ColorSelection - No variants found!')
      return [];
    }
    
    const colorMap = new Map<string, { name: string; hex_code: string }>();
    
    product.variants.forEach((variant, index) => {
      console.log(`🎨 Variant ${index}:`, variant)
      console.log(`🎨 Variant ${index} - color:`, variant.color)
      console.log(`🎨 Variant ${index} - is_active:`, variant.is_active)
      
      // Show color if variant is active and has color data
      // Don't filter by stock - show all active variants
      if (variant.color && variant.is_active !== false) {
        console.log(`✅ Variant ${index} - Adding color:`, variant.color.name)
        if (!colorMap.has(variant.color.id)) {
          colorMap.set(variant.color.id, {
            name: variant.color.name,
            hex_code: variant.color.hex_code,
          });
        }
      } else {
        console.log(`❌ Variant ${index} - Skipped (no color or inactive)`)
      }
    });
    
    const colors = Array.from(colorMap.values())
    console.log('🎨 Final available colors:', colors)
    return colors;
  }, [product.variants]);

  if (availableColors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Colors
      </span>
      <div className="flex items-center flex-wrap space-x-3 sm:space-x-4">
        {availableColors.map((color, index) => {
          const colorObj: Color = {
            name: color.name,
            code: `bg-[${color.hex_code}]`,
          };
          
          return (
            <button
              key={index}
              type="button"
              className={cn([
                "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center",
                colorSelection.name === color.name && "ring-2 ring-black ring-offset-2",
              ])}
              style={{ backgroundColor: color.hex_code }}
              onClick={() => dispatch(setColorSelection(colorObj))}
            >
              {colorSelection.name === color.name && (
                <IoMdCheckmark className="text-base text-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelection;
