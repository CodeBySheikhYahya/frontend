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

  const { sizeSelection } = useAppSelector((state: RootState) => state.products);

  // Get unique colors from product variants with stock info
  const availableColors = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return [];
    }
    
    const colorMap = new Map<string, { name: string; hex_code: string; hasStock: boolean; stockQuantity: number }>();
    
    product.variants.forEach((variant) => {
      if (variant.color && variant.is_active !== false) {
        const colorId = variant.color.id;
        const stockQty = variant.stock_quantity || 0;
        const hasStock = stockQty > 0;
        
        // If size is selected, only check variants with that size
        const matchesSize = !sizeSelection || variant.size?.name === sizeSelection;
        
        if (!colorMap.has(colorId)) {
          colorMap.set(colorId, {
            name: variant.color.name,
            hex_code: variant.color.hex_code,
            hasStock: matchesSize ? hasStock : true, // If size not selected, show as available
            stockQuantity: matchesSize ? stockQty : 999, // If size not selected, show high number
          });
        } else {
          // If size selected, sum stock for this color+size combination
          // If size not selected, keep highest stock
          const existing = colorMap.get(colorId)!;
          if (matchesSize) {
            colorMap.set(colorId, { 
              ...existing, 
              hasStock: hasStock || existing.hasStock,
              stockQuantity: stockQty, // Stock for selected size
            });
          } else {
            // Size not selected - keep existing stock (shows max available)
            colorMap.set(colorId, { 
              ...existing, 
              stockQuantity: Math.max(existing.stockQuantity, stockQty),
            });
          }
        }
      }
    });
    
    return Array.from(colorMap.values());
  }, [product.variants, sizeSelection]);

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
          const isSelected = colorSelection.name === color.name;
          const isOutOfStock = !color.hasStock;
          
          return (
            <div key={index} className="relative">
              <button
                type="button"
                className={cn([
                  "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center relative",
                  isSelected && "ring-2 ring-black ring-offset-2",
                  isOutOfStock && "opacity-50 cursor-not-allowed",
                ])}
                style={{ backgroundColor: color.hex_code }}
                onClick={() => !isOutOfStock && dispatch(setColorSelection(colorObj))}
                disabled={isOutOfStock}
              >
                {isSelected && !isOutOfStock && (
                  <IoMdCheckmark className="text-base text-white" />
                )}
              </button>
              {isOutOfStock ? (
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-red-600 font-medium whitespace-nowrap">
                  Out of Stock
                </span>
              ) : sizeSelection && color.stockQuantity > 0 && (
                <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-black/60 font-medium whitespace-nowrap">
                  {color.stockQuantity} left
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelection;
