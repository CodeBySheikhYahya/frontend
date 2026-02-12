"use client";

import React from "react";
import { Product } from "@/types/product.types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { addToCart, CartItem } from "@/lib/features/carts/cartsSlice";
import { cn } from "@/lib/utils";

const AddToCartBtn = ({ data, product }: { data: Product & { quantity: number }; product: Product }) => {
  const dispatch = useAppDispatch();
  const { colorSelection, sizeSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  // Check if product has size variants
  const hasSizes = React.useMemo(() => {
    const variants = product.variants || data.variants || [];
    return variants.some((v) => v.size && v.is_active !== false);
  }, [product.variants, data.variants]);

  // Check if product has color variants
  const hasColors = React.useMemo(() => {
    const variants = product.variants || data.variants || [];
    return variants.some((v) => v.color && v.is_active !== false);
  }, [product.variants, data.variants]);

  // Find selected variant and check stock (size and color are optional - match when not applicable)
  const selectedVariant = React.useMemo(() => {
    const variants = product.variants || data.variants || [];
    if (!variants.length) return null;
    
    return variants.find(
      (variant) => {
        const matchesColor = !hasColors || variant.color?.name === colorSelection.name;
        const matchesSize = !hasSizes || variant.size?.name === sizeSelection;
        return matchesColor && matchesSize && variant.is_active !== false;
      }
    );
  }, [product.variants, data.variants, colorSelection.name, sizeSelection, hasColors, hasSizes]);

  const stockQuantity = selectedVariant ? (selectedVariant.stock_quantity || 0) : 0;
  const isOutOfStock = stockQuantity === 0;
  const hasSelection = (!hasColors || colorSelection.name) && (!hasSizes || sizeSelection);

  const handleAddToCart = () => {
    if (isOutOfStock || !hasSelection) return;
    
    // Convert UUID string to number hash for cart compatibility
    const getId = () => {
      if (typeof data.id === 'number') return data.id;
      // Simple hash for UUID strings
      return data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    };

    const cartItem: CartItem = {
      id: getId(),
      productId: typeof data.id === 'string' ? data.id : undefined, // Store UUID if available
      name: data.title,
      srcUrl: data.srcUrl,
      price: data.price,
      attributes: [
        hasSizes ? sizeSelection : '',
        hasColors ? colorSelection.name : '',
      ],
      discount: data.discount,
      quantity: data.quantity,
    };

    dispatch(addToCart(cartItem));
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock || !hasSelection}
      className={cn(
        "w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white transition-all",
        isOutOfStock || !hasSelection
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-black hover:bg-black/80"
      )}
    >
      {isOutOfStock 
        ? "Out of Stock" 
        : !hasSelection 
        ? "Select Options" 
        : stockQuantity > 0 
        ? `Add to Cart (${stockQuantity} left)`
        : "Add to Cart"}
    </button>
  );
};

export default AddToCartBtn;
