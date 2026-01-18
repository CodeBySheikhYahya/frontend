import React from "react";
import ProductDetails from "./ProductDetails";

interface ProductDetailsContentProps {
  productId: string;
}

const ProductDetailsContent = ({ productId }: ProductDetailsContentProps) => {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Product specifications
      </h3>
      <ProductDetails productId={productId} />
    </section>
  );
};

export default ProductDetailsContent;
