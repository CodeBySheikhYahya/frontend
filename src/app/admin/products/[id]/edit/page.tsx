"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import {
  getAdminProductById,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
  getCategories,
  getBrands,
  getColors,
  getSizes,
  createColor,
  createSize,
  upsertVariant,
  createVariantWithAttributes,
  deleteVariant,
  getProductSpecifications,
  createProductSpecification,
  updateProductSpecification,
  deleteProductSpecification,
  generateSlug,
  type AdminProduct,
  type VariantData,
  type DynamicVariantData,
  type ProductSpecification,
} from "@/lib/supabase/admin-products";
import {
  getCategoryAttributes,
  type CategoryAttribute,
} from "@/lib/supabase/admin-category-attributes";
import {
  getAttributeValues,
  type AttributeValue,
} from "@/lib/supabase/admin-attributes";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface VariantFormData {
  id?: string;
  // Legacy fields (for backward compatibility)
  color_id?: string;
  size_id?: string;
  newColorName?: string;
  newColorHex?: string;
  newSizeName?: string;
  // Dynamic attributes
  attributes: Record<string, string>; // attribute_id -> attribute_value_id
  // Common fields
  stock_quantity: number;
  price_override: string;
  is_active: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; image_url: string; is_primary: boolean }>
  >([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);

  // Variants
  const [variants, setVariants] = useState<VariantFormData[]>([]);

  // Specifications
  const [specifications, setSpecifications] = useState<
    Array<{ id?: string; key: string; value: string; order: number }>
  >([]);

  // Options
  const [categories, setCategories] = useState<Array<{ id: string; name: string; parent_id: string | null; parent_name?: string | null }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [colors, setColors] = useState<Array<{ id: string; name: string; hex_code: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ id: string; name: string }>>([]);
  
  // Dynamic attributes
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, AttributeValue[]>>({});

  useEffect(() => {
    fetchProduct();
    fetchOptions();
  }, [productId]);

  // Fetch category attributes when category changes
  useEffect(() => {
    console.log("Category ID changed:", categoryId);
    if (categoryId) {
      fetchCategoryAttributes();
    } else {
      console.log("No category selected, clearing attributes");
      setCategoryAttributes([]);
      setAttributeValues({});
    }
  }, [categoryId]);

  const fetchCategoryAttributes = async () => {
    if (!categoryId) return;
    
    try {
      console.log("Fetching category attributes for category:", categoryId);
      const attrs = await getCategoryAttributes(categoryId);
      console.log("Fetched category attributes:", attrs);
      setCategoryAttributes(attrs);
      
      // Fetch values for each attribute
      const valuesMap: Record<string, AttributeValue[]> = {};
      for (const attr of attrs) {
        const values = await getAttributeValues(attr.attribute_id);
        valuesMap[attr.attribute_id] = values;
        console.log(`Attribute ${attr.attribute?.display_name} values:`, values);
      }
      setAttributeValues(valuesMap);
      console.log("All attribute values:", valuesMap);
    } catch (error) {
      console.error("Error fetching category attributes:", error);
    }
  };

  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const product = await getAdminProductById(productId);
      if (!product) {
        alert("Product not found");
        router.push("/admin/products");
        return;
      }

      setTitle(product.title);
      setSlug(product.slug);
      setDescription(product.description || "");
      setShortDescription(product.short_description || "");
      setBasePrice(product.base_price.toString());
      setDiscountType(product.discount_type);
      setDiscountValue(product.discount_value?.toString() || "");
      setCategoryId(product.category_id || "");
      setBrandId(product.brand_id || "");
      setIsFeatured(product.is_featured);
      setIsNewArrival(product.is_new_arrival);
      setIsTopSelling(product.is_top_selling);
      setIsActive(product.is_active);

      if (product.images) {
        setExistingImages(product.images);
        const primary = product.images.find((img) => img.is_primary);
        if (primary) {
          setPrimaryImageId(primary.id);
        }
      }

      if (product.variants) {
        console.log("Loading variants from database:", product.variants);
        // Fetch variant attributes for each variant
        const variantsWithAttributes = await Promise.all(
          product.variants.map(async (v) => {
            // Fetch variant attributes from product_variant_attributes table
            const { data: variantAttrs } = await supabase
              .from('product_variant_attributes')
              .select('attribute_id, attribute_value_id')
              .eq('variant_id', v.id);
            
            console.log(`Variant ${v.id} attributes from DB:`, variantAttrs);
            
            // Build attributes object: attribute_id -> attribute_value_id
            const attributes: Record<string, string> = {};
            if (variantAttrs) {
              variantAttrs.forEach((va) => {
                attributes[va.attribute_id] = va.attribute_value_id;
              });
            }
            
            console.log(`Variant ${v.id} attributes object:`, attributes);
            
            return {
              id: v.id,
              // Legacy fields (for backward compatibility)
              color_id: v.color_id,
              size_id: v.size_id,
              // Dynamic attributes from product_variant_attributes
              attributes: attributes,
              stock_quantity: v.stock_quantity,
              price_override: v.price_override?.toString() || "",
              is_active: v.is_active,
            };
          })
        );
        
        console.log("All variants with attributes:", variantsWithAttributes);
        setVariants(variantsWithAttributes);
      } else {
        console.log("No variants found for product");
      }
    } catch (error) {
      alert("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

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
    const updatedNewImages = [...newImages, ...files];
    setNewImages(updatedNewImages);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    const result = await deleteProductImage(imageId);
    if (result.success) {
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
      if (primaryImageId === imageId) {
        setPrimaryImageId(null);
      }
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    console.log("Adding new variant in edit page");
    console.log("Current category attributes:", categoryAttributes);
    // Initialize attributes object for dynamic attributes
    const initialAttributes: Record<string, string> = {};
    if (categoryAttributes.length > 0) {
      categoryAttributes.forEach((ca) => {
        initialAttributes[ca.attribute_id] = "";
      });
    }
    console.log("Initial attributes for new variant:", initialAttributes);
    
    setVariants([
      ...variants,
      {
        attributes: initialAttributes,
        stock_quantity: 0,
        price_override: "",
        is_active: true,
        // Legacy fields (for backward compatibility)
        color_id: categoryAttributes.length === 0 ? "" : undefined,
        size_id: categoryAttributes.length === 0 ? "" : undefined,
      },
    ]);
    console.log("Variant added, total variants:", variants.length + 1);
  };

  const handleCreateColor = async (index: number) => {
    const variant = variants[index];
    if (!variant.newColorName || !variant.newColorHex) {
      alert("Please enter color name and hex code");
      return;
    }

    const result = await createColor(variant.newColorName, variant.newColorHex);
    if (result.success && result.colorId) {
      // Refresh colors list
      const updatedColors = await getColors();
      setColors(updatedColors);
      // Set the new color as selected
      updateVariant(index, "color_id", result.colorId);
      updateVariant(index, "newColorName", "");
      updateVariant(index, "newColorHex", "");
    } else {
      alert(`Failed to create color: ${result.error}`);
    }
  };

  const handleCreateSize = async (index: number) => {
    const variant = variants[index];
    if (!variant.newSizeName) {
      alert("Please enter size name");
      return;
    }

    const result = await createSize(variant.newSizeName);
    if (result.success && result.sizeId) {
      // Refresh sizes list
      const updatedSizes = await getSizes();
      setSizes(updatedSizes);
      // Set the new size as selected
      updateVariant(index, "size_id", result.sizeId);
      updateVariant(index, "newSizeName", "");
    } else {
      alert(`Failed to create size: ${result.error}`);
    }
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    console.log(`Updating variant ${index}, field: ${field}`, value);
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    console.log("Updated variant:", updated[index]);
    setVariants(updated);
  };

  const removeVariant = async (index: number) => {
    const variant = variants[index];
    if (variant.id) {
      // Delete from database
      const result = await deleteVariant(variant.id);
      if (!result.success) {
        alert(`Error: ${result.error}`);
        return;
      }
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update product
      const productData = {
        title,
        slug: slug || generateSlug(title),
        description: description || null,
        short_description: shortDescription || null,
        base_price: parseFloat(basePrice),
        discount_type: discountType,
        discount_value: discountValue ? parseFloat(discountValue) : null,
        category_id: categoryId || null,
        brand_id: brandId || null,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_top_selling: isTopSelling,
        is_active: isActive,
      };

      const result = await updateProduct(productId, productData);
      if (!result.success) {
        alert(`Error: ${result.error}`);
        setSaving(false);
        return;
      }

      // Upload new images
      if (newImages.length > 0) {
        setUploadingImages(true);
        for (let i = 0; i < newImages.length; i++) {
          const isPrimary = primaryImageId === null && i === 0;
          await uploadProductImage(newImages[i], productId, isPrimary);
        }
        setUploadingImages(false);
      }

      // Update primary image if changed
      if (primaryImageId) {
        // This would require updating all images to set is_primary
        // For now, we'll handle it in the upload function
      }

      // Save variants
      console.log("=== VARIANT SAVE DEBUG (EDIT PAGE) ===");
      console.log("Total variants to save:", variants.length);
      console.log("Category attributes:", categoryAttributes);
      console.log("Category ID:", categoryId);
      
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        console.log(`\n--- Variant ${i + 1} ---`);
        console.log("Variant data:", variant);
        console.log("Variant attributes:", variant.attributes);
        
        // Use dynamic attributes if category has attributes assigned
        if (categoryAttributes.length > 0) {
          console.log("Using dynamic attributes system");
          // Check if all required attributes are filled
          const requiredAttrs = categoryAttributes.filter(ca => ca.is_required);
          console.log("Required attributes:", requiredAttrs);
          
          const allRequiredFilled = requiredAttrs.every(ca => 
            variant.attributes[ca.attribute_id] && variant.attributes[ca.attribute_id] !== ""
          );
          
          console.log("All required attributes filled?", allRequiredFilled);
          
          if (allRequiredFilled) {
            // Check if this is a new variant (no id) or existing variant
            if (variant.id) {
              console.log("Updating existing variant:", variant.id);
              // For existing variants, we need to update them
              // First delete old attribute associations, then create new ones
              // This is a simplified approach - you might want to optimize this
              const dynamicVariantData: DynamicVariantData = {
                product_id: productId,
                stock_quantity: variant.stock_quantity,
                price_override: variant.price_override ? parseFloat(variant.price_override) : null,
                is_active: variant.is_active,
                attributes: Object.entries(variant.attributes)
                  .filter(([_, valueId]) => valueId && valueId !== "")
                  .map(([attrId, valueId]) => ({
                    attribute_id: attrId,
                    attribute_value_id: valueId,
                  })),
              };
              
              // Update variant basic info
              await upsertVariant(variant.id, {
                product_id: productId,
                color_id: null,
                size_id: null,
                stock_quantity: variant.stock_quantity,
                price_override: variant.price_override ? parseFloat(variant.price_override) : null,
                is_active: variant.is_active,
              });
              
              // TODO: Update attribute associations (delete old, insert new)
              console.log("⚠️ Need to update attribute associations for existing variant");
            } else {
              console.log("Creating new variant with dynamic attributes");
              const dynamicVariantData: DynamicVariantData = {
                product_id: productId,
                stock_quantity: variant.stock_quantity,
                price_override: variant.price_override ? parseFloat(variant.price_override) : null,
                is_active: variant.is_active,
                attributes: Object.entries(variant.attributes)
                  .filter(([_, valueId]) => valueId && valueId !== "")
                  .map(([attrId, valueId]) => ({
                    attribute_id: attrId,
                    attribute_value_id: valueId,
                  })),
              };
              
              console.log("Creating variant with data:", dynamicVariantData);
              const variantResult = await createVariantWithAttributes(dynamicVariantData);
              console.log("Variant creation result:", variantResult);
            }
          } else {
            console.log("❌ Skipping variant - required attributes not filled");
            const missingAttrs = requiredAttrs.filter(ca => 
              !variant.attributes[ca.attribute_id] || variant.attributes[ca.attribute_id] === ""
            );
            console.log("Missing attributes:", missingAttrs);
          }
        } else {
          console.log("Using legacy color_id/size_id system");
          // Fallback to legacy color_id/size_id system
          if (variant.color_id && variant.size_id) {
            const variantData = {
              product_id: productId,
              color_id: variant.color_id,
              size_id: variant.size_id,
              stock_quantity: variant.stock_quantity,
              price_override: variant.price_override ? parseFloat(variant.price_override) : null,
              is_active: variant.is_active,
            }
            
            console.log("Saving legacy variant:", variantData);
            await upsertVariant(variant.id || null, variantData)
          } else {
            console.log("❌ Skipping variant - missing color_id or size_id");
          }
        }
      }
      
      console.log("=== END VARIANT SAVE DEBUG ===\n");

      router.push("/admin/products");
    } catch (error) {
      alert("Failed to update product");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

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
          Edit Product
        </h1>
        <p className="text-gray-600">Update product information</p>
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
                    {cat.parent_name ? `${cat.parent_name} > ${cat.name}` : cat.name}
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
                Upload New Images
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
                Add Images
              </label>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.image_url}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryImageId(image.id)}
                        className={cn(
                          "absolute bottom-2 left-2 px-2 py-1 text-xs rounded",
                          primaryImageId === image.id
                            ? "bg-black text-white"
                            : "bg-white text-black"
                        )}
                      >
                        {primaryImageId === image.id ? "Primary" : "Set Primary"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
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
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
              {categoryAttributes.length > 0
                ? "No variants added. Click 'Add Variant' to add attribute combinations."
                : "No variants added. Click 'Add Variant' to add color/size combinations."}
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 border border-gray-200 rounded-lg grid gap-4",
                    categoryAttributes.length > 0
                      ? `grid-cols-1 md:grid-cols-${Math.min(categoryAttributes.length + 3, 6)}`
                      : "grid-cols-1 md:grid-cols-5"
                  )}
                >
                  {/* Dynamic Attribute Fields */}
                  {categoryAttributes.length > 0 ? (
                    categoryAttributes.map((catAttr) => {
                      const attr = catAttr.attribute;
                      if (!attr) return null;
                      
                      const values = attributeValues[catAttr.attribute_id] || [];
                      
                      return (
                        <div key={catAttr.attribute_id}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {attr.display_name}
                            {catAttr.is_required && " *"}
                          </label>
                          {attr.attribute_type === "select" && values.length > 0 ? (
                            <select
                              className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0"
                              value={variant.attributes?.[catAttr.attribute_id] || ""}
                              onChange={(e) => {
                                console.log(`Variant ${index} - ${attr.display_name} changed:`, e.target.value);
                                const updated = { ...(variant.attributes || {}) };
                                updated[catAttr.attribute_id] = e.target.value;
                                updateVariant(index, "attributes", updated);
                              }}
                              required={catAttr.is_required}
                            >
                              <option value="">Select {attr.display_name}</option>
                              {values
                                .filter((v) => v.is_active)
                                .map((value) => (
                                  <option key={value.id} value={value.id}>
                                    {value.display_value || value.value}
                                  </option>
                                ))}
                            </select>
                          ) : attr.attribute_type === "color" && values.length > 0 ? (
                            <div>
                              <select
                                className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0 mb-2"
                                value={variant.attributes?.[catAttr.attribute_id] || ""}
                                onChange={(e) => {
                                  console.log(`Variant ${index} - ${attr.display_name} changed:`, e.target.value);
                                  const updated = { ...(variant.attributes || {}) };
                                  updated[catAttr.attribute_id] = e.target.value;
                                  updateVariant(index, "attributes", updated);
                                }}
                                required={catAttr.is_required}
                              >
                                <option value="">Select {attr.display_name}</option>
                                {values
                                  .filter((v) => v.is_active)
                                  .map((value) => (
                                    <option key={value.id} value={value.id}>
                                      {value.display_value || value.value}
                                    </option>
                                  ))}
                              </select>
                              {variant.attributes?.[catAttr.attribute_id] && (
                                <div className="flex items-center gap-2 mt-1">
                                  {values
                                    .find((v) => v.id === variant.attributes?.[catAttr.attribute_id])
                                    ?.hex_code && (
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{
                                        backgroundColor:
                                          values.find(
                                            (v) => v.id === variant.attributes?.[catAttr.attribute_id]
                                          )?.hex_code || "#000",
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <InputGroup className="bg-[#F0F0F0]">
                              <InputGroup.Input
                                type={attr.attribute_type === "number" ? "number" : "text"}
                                placeholder={`Enter ${attr.display_name}`}
                                value={variant.attributes?.[catAttr.attribute_id] || ""}
                                onChange={(e) => {
                                  console.log(`Variant ${index} - ${attr.display_name} changed:`, e.target.value);
                                  const updated = { ...(variant.attributes || {}) };
                                  updated[catAttr.attribute_id] = e.target.value;
                                  updateVariant(index, "attributes", updated);
                                }}
                                required={catAttr.is_required}
                                className="text-sm"
                              />
                            </InputGroup>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Legacy Color Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0 mb-2"
                          value={variant.color_id === "new" ? "new" : variant.color_id || ""}
                      onChange={(e) => {
                        if (e.target.value === "new") {
                          updateVariant(index, "color_id", "new");
                        } else {
                          updateVariant(index, "color_id", e.target.value);
                        }
                      }}
                      required={!variant.color_id || variant.color_id !== "new"}
                    >
                      <option value="">Select Color</option>
                      <option value="new">+ Add New Color</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    {variant.color_id === "new" && (
                      <div className="space-y-2">
                        <InputGroup className="bg-[#F0F0F0]">
                          <InputGroup.Input
                            type="text"
                            placeholder="Color Name"
                            value={variant.newColorName || ""}
                            onChange={(e) =>
                              updateVariant(index, "newColorName", e.target.value)
                            }
                            className="text-sm"
                          />
                        </InputGroup>
                        <div className="flex gap-2">
                          <InputGroup className="bg-[#F0F0F0] flex-1">
                            <InputGroup.Input
                              type="text"
                              placeholder="#FFFFFF"
                              value={variant.newColorHex || ""}
                              onChange={(e) =>
                                updateVariant(index, "newColorHex", e.target.value)
                              }
                              className="text-sm"
                            />
                          </InputGroup>
                          {variant.newColorHex && (
                            <div
                              className="w-10 h-10 rounded border border-gray-300"
                              style={{ backgroundColor: variant.newColorHex }}
                            />
                          )}
                          <Button
                            type="button"
                            onClick={() => handleCreateColor(index)}
                            size="sm"
                            className="bg-black text-white"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                      {/* Legacy Size Field */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-[#F0F0F0] rounded-lg border-0 mb-2"
                          value={variant.size_id === "new" ? "new" : variant.size_id || ""}
                      onChange={(e) => {
                        if (e.target.value === "new") {
                          updateVariant(index, "size_id", "new");
                        } else {
                          updateVariant(index, "size_id", e.target.value);
                        }
                      }}
                      required={!variant.size_id || variant.size_id !== "new"}
                    >
                      <option value="">Select Size</option>
                      <option value="new">+ Add New Size</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                    {variant.size_id === "new" && (
                      <div className="flex gap-2">
                        <InputGroup className="bg-[#F0F0F0] flex-1">
                          <InputGroup.Input
                            type="text"
                            placeholder="Size Name (e.g., XL, 2XL)"
                            value={variant.newSizeName || ""}
                            onChange={(e) =>
                              updateVariant(index, "newSizeName", e.target.value)
                            }
                            className="text-sm"
                          />
                        </InputGroup>
                        <Button
                          type="button"
                          onClick={() => handleCreateSize(index)}
                          size="sm"
                          className="bg-black text-white"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                    </>
                  )}

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

        {/* Product Specifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn([integralCF.className, "text-xl font-bold"])}>
              Product Specifications
            </h2>
            <Button
              type="button"
              onClick={() =>
                setSpecifications([
                  ...specifications,
                  { key: "", value: "", order: specifications.length },
                ])
              }
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Specification
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Add product details like Material, Care instructions, etc.
          </p>
          {specifications.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No specifications added. Click "Add Specification" to add details.
            </p>
          ) : (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div
                  key={spec.id || index}
                  className="flex gap-3 items-start p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <InputGroup className="bg-[#F0F0F0] mb-2">
                      <InputGroup.Input
                        type="text"
                        placeholder="Spec Key (e.g., Material, Care)"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...specifications];
                          updated[index].key = e.target.value;
                          setSpecifications(updated);
                        }}
                        className="text-sm"
                      />
                    </InputGroup>
                    <InputGroup className="bg-[#F0F0F0]">
                      <InputGroup.Input
                        type="text"
                        placeholder="Spec Value (e.g., 100% Cotton)"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...specifications];
                          updated[index].value = e.target.value;
                          setSpecifications(updated);
                        }}
                        className="text-sm"
                      />
                    </InputGroup>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSpecifications(
                        specifications.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-600 hover:text-red-700 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
            disabled={saving || uploadingImages}
            className="bg-black text-white hover:bg-black/90"
          >
            {saving || uploadingImages ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

