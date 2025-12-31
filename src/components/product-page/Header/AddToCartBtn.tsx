"use client";

import React from "react";
import { Product } from "@/types/product.types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { addToCart, CartItem } from "@/lib/features/carts/cartsSlice";

const AddToCartBtn = ({ data }: { data: Product & { quantity: number } }) => {
  const dispatch = useAppDispatch();
  const { colorSelection, sizeSelection } = useAppSelector(
    (state: RootState) => state.products
  );

  const handleAddToCart = () => {
    // Convert UUID string to number hash for cart compatibility
    const getId = () => {
      if (typeof data.id === 'number') return data.id;
      // Simple hash for UUID strings
      return data.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    };

    const cartItem: CartItem = {
      id: getId(),
      name: data.title,
      srcUrl: data.srcUrl,
      price: data.price,
      attributes: [sizeSelection, colorSelection.name],
      discount: data.discount,
      quantity: data.quantity,
    };

    dispatch(addToCart(cartItem));
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="bg-black w-full ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all"
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
