"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import {
  createProduct,
  uploadProductImage,
  getCategories,
  getBrands,
  getColors,
  getSizes,
  upsertVariant,
  generateSlug,
  type VariantData,
  type CreateProductData,
} from "@/lib/supabase/admin-products";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface VariantFormData {
  color_id: string;
  size_id: string;
  stock_quantity: number;
  price_override: string;
  is_active: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form data
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "amount" | null>(null);
  const [discountValue, setDiscountValue] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTopSelling, setIsTopSelling] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);

  // Variants
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  // Options
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [colors, setColors] = useState<Array<{ id: string; name: string; hex_code: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  const fetchOptions = async () => {
    const [cats, brs, cols, szs] = await Promise.all([
      getCategories(),
      getBrands(),
      getColors(),
      getSizes(),
    ]);
    setCategories(cats);
    setBrands(brs);
    setColors(cols);
    setSizes(szs);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Set first image as primary if none selected
    if (primaryImageIndex === null && newImages.length > 0) {
      setPrimaryImageIndex(0);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(null);
    } else if (primaryImageIndex !== null && primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color_id: "",
        size_id: "",
        stock_quantity: 0,
        price_override: "",
        is_active: true,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
      const productData: CreateProductData = {
        title,
        slug: slug || generateSlug(title),
        description: description || undefined,
        short_description: shortDescription || undefined,
        base_price: parseFloat(basePrice),
        discount_type: discountType,
        discount_value: discountValue ? parseFloat(discountValue) : undefined,
        category_id: categoryId || undefined,
        brand_id: brandId || undefined,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_top_selling: isTopSelling,
        is_active: isActive,
      };

      const result = await createProduct(productData);
      if (!result.success || !result.productId) {
        alert(`Error: ${result.error}`);
        setLoading(false);
        return;
      }

      const productId = result.productId;

      // Upload images
      if (images.length > 0) {
        setUploadingImages(true);
        for (let i = 0; i < images.length; i++) {
          const isPrimary = primaryImageIndex === i;
          await uploadProductImage(images[i], productId, isPrimary);
        }
        setUploadingImages(false);
      }

      // Create variants
      console.log('🔄 Admin - Creating variants for product:', productId)
      console.log('🔄 Admin - Variants to create:', variants)
      console.log('🔄 Admin - Variants count:', variants.length)
      
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        console.log(`🔄 Admin - Processing variant ${i + 1}:`, variant)
        
        if (variant.color_id && variant.size_id) {
          console.log(`✅ Admin - Variant ${i + 1} has color and size, saving...`)
          const variantData = {
            product_id: productId,
            color_id: variant.color_id,
            size_id: variant.size_id,
            stock_quantity: variant.stock_quantity,
            price_override: variant.price_override ? parseFloat(variant.price_override) : null,
            is_active: variant.is_active,
          }
          console.log(`💾 Admin - Saving variant ${i + 1} with data:`, variantData)
          
          const result = await upsertVariant(null, variantData)
          console.log(`📦 Admin - Variant ${i + 1} save result:`, result)
          
          if (result.success) {
            console.log(`✅ Admin - Variant ${i + 1} saved successfully! ID:`, result.variantId)
          } else {
            console.error(`❌ Admin - Variant ${i + 1} save failed:`, result.error)
          }
        } else {
          console.log(`⚠️ Admin - Variant ${i + 1} skipped (missing color_id or size_id)`)
        }
      }
      
      console.log('✅ Admin - All variants processed')

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className={cn([integralCF.className, "text-3xl font-bold mb-2"])}>
          Add New Product
        </h1>
        <p className="text-gray-600">Create a new product in your catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter product title"
                />
              </InputGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="product-slug"
                />
              </InputGroup>
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief product description"
                />
              </InputGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 bg-[#F0F0F0] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full product description"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price *
              </label>
              <InputGroup className="bg-[#F0F0F0]">
                <InputGroup.Text>$</InputGroup.Text>
                <InputGroup.Input
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </InputGroup>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                className="w-full px-4 py-3 bg-[#F0F0F0] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                value={discountType || ""}
                onChange={(e) =>
                  setDiscountType(
                    e.target.value === "" ? null : (e.target.value as "percentage" | "amount")
                  )
                }
              >
                <option value="">No Discount</option>
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>

            {discountType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value *
                </label>
                <InputGroup className="bg-[#F0F0F0]">
                  {discountType === "percentage" ? (
                    <InputGroup.Text>%</InputGroup.Text>
                  ) : (
                    <InputGroup.Text>$</InputGroup.Text>
                  )}
                  <InputGroup.Input
                    type="number"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    placeholder="0.00"
                  />
                </InputGroup>
              </div>
            )}
          </div>
        </div>

        {/* Category & Brand */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
            Category & Brand
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-4 py-3 bg-[#F0F0F0] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                className="w-full px-4 py-3 bg-[#F0F0F0] rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
            Product Images
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Images
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryImageIndex(index)}
                      className={cn(
                        "absolute bottom-2 left-2 px-2 py-1 text-xs rounded",
                        primaryImageIndex === index
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      )}
                    >
                      {primaryImageIndex === index ? "Primary" : "Set Primary"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn([integralCF.className, "text-xl font-bold"])}>
              Product Variants
            </h2>
            <Button type="button" onClick={addVariant} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No variants added. Click "Add Variant" to add color/size combinations.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0"
                      value={variant.color_id}
                      onChange={(e) =>
                        updateVariant(index, "color_id", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Color</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0"
                      value={variant.size_id}
                      onChange={(e) =>
                        updateVariant(index, "size_id", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Size</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <InputGroup className="bg-[#F0F0F0]">
                      <InputGroup.Input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock_quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        required
                        className="text-sm"
                      />
                    </InputGroup>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price Override
                    </label>
                    <InputGroup className="bg-[#F0F0F0]">
                      <InputGroup.Text className="text-xs">$</InputGroup.Text>
                      <InputGroup.Input
                        type="number"
                        step="0.01"
                        value={variant.price_override}
                        onChange={(e) =>
                          updateVariant(index, "price_override", e.target.value)
                        }
                        placeholder="Optional"
                        className="text-sm"
                      />
                    </InputGroup>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className={cn([integralCF.className, "text-xl font-bold mb-4"])}>
            Settings
          </h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Active (visible to customers)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Featured Product</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">New Arrival</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isTopSelling}
                onChange={(e) => setIsTopSelling(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Top Selling</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || uploadingImages}
            className="bg-black text-white hover:bg-black/90"
          >
            {loading || uploadingImages
              ? "Creating Product..."
              : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

