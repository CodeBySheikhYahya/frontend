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
    <div className="space-y-3">
      {specs.map((spec) => (
        <p key={spec.id} className="text-sm leading-7 break-words">
          <span className="text-neutral-800 font-medium">{spec.spec_key}</span>
          <span className="text-neutral-800 font-medium"> — {spec.spec_value}</span>
        </p>
      ))}
    </div>
  );
};

export default ProductDetails;
