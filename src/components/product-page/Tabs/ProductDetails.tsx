"use client";

import React, { useEffect, useState } from "react";
import { getProductSpecifications, type ProductSpecification } from "@/lib/supabase/products";

interface ProductDetailsProps {
  productId: string;
}

const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecs = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProductSpecifications(productId);
        setSpecs(data);
      } catch (error) {
        console.error("Error fetching product specifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, [productId]);

  if (loading) {
    return (
      <div className="py-4">
        <p className="text-sm text-neutral-500">Loading specifications...</p>
      </div>
    );
  }

  if (specs.length === 0) {
    return (
      <div className="py-4">
        <p className="text-sm text-neutral-500">No specifications available for this product.</p>
      </div>
    );
  }

  return (
    <>
      {specs.map((spec) => (
        <div className="grid grid-cols-3" key={spec.id}>
          <div>
            <p className="text-sm py-3 w-full leading-7 lg:py-4 pr-2 text-neutral-500">
              {spec.spec_key}
            </p>
          </div>
          <div className="col-span-2 py-3 lg:py-4 border-b">
            <p className="text-sm w-full leading-7 text-neutral-800 font-medium">
              {spec.spec_value}
            </p>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductDetails;
