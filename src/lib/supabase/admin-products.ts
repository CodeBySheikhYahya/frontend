import { supabase } from '../supabase'

// Product data structure for admin
export interface AdminProduct {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  base_price: number
  discount_type: 'percentage' | 'amount' | null
  discount_value: number | null
  category_id: string | null
  brand_id: string | null
  is_featured: boolean
  is_new_arrival: boolean
  is_top_selling: boolean
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  category?: { id: string; name: string } | null
  brand?: { id: string; name: string } | null
  images?: Array<{
    id: string
    image_url: string
    is_primary: boolean
    display_order: number
  }>
  variants?: Array<{
    id: string
    color_id: string
    size_id: string
    stock_quantity: number
    price_override: number | null
    is_active: boolean
    color?: { id: string; name: string; hex_code: string }
    size?: { id: string; name: string }
  }>
}

// Get all products for admin (including inactive)
export async function getAllAdminProducts(): Promise<AdminProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        brand:brands(id, name),
        images:product_images(id, image_url, is_primary, display_order),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    return (data || []) as AdminProduct[]
  } catch (error) {
    return []
  }
}

// Calculate total stock for a product (sum of all variants)
export function calculateProductStock(product: AdminProduct): number {
  if (!product.variants || product.variants.length === 0) {
    return 0
  }
  
  return product.variants
    .filter(v => v.is_active !== false)
    .reduce((total, variant) => total + (variant.stock_quantity || 0), 0)
}

// Check if product has low stock (less than 5)
export function hasLowStock(product: AdminProduct): boolean {
  const totalStock = calculateProductStock(product)
  return totalStock > 0 && totalStock < 5
}

// Check if product is out of stock
export function isOutOfStock(product: AdminProduct): boolean {
  return calculateProductStock(product) === 0
}

// Get single product with all details for admin
export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        brand:brands(id, name),
        images:product_images(id, image_url, is_primary, display_order, alt_text),
        variants:product_variants(
          id,
          color_id,
          size_id,
          stock_quantity,
          price_override,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data as AdminProduct
  } catch (error) {
    return null
  }
}

// Create product
export interface CreateProductData {
  title: string
  slug: string
  description?: string
  short_description?: string
  base_price: number
  discount_type?: 'percentage' | 'amount' | null
  discount_value?: number | null
  category_id?: string | null
  brand_id?: string | null
  is_featured?: boolean
  is_new_arrival?: boolean
  is_top_selling?: boolean
  is_active?: boolean
  meta_title?: string | null
  meta_description?: string | null
}

export async function createProduct(
  data: CreateProductData
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, productId: product.id }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product' }
  }
}

// Update product
export interface UpdateProductData extends Partial<CreateProductData> {}

export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product' }
  }
}

// Delete product
export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete product (cascade will delete images, variants, etc.)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' }
  }
}

// Upload image to Supabase Storage
export async function uploadProductImage(
  file: File,
  productId: string,
  isPrimary: boolean = false
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}.${fileExt}`
    // Don't include bucket name in path - bucket is already specified in .from()
    const filePath = fileName

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    const imageUrl = urlData.publicUrl

    // If this is the first image or marked as primary, set others to not primary
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }

    // Get current max display_order
    const { data: images } = await supabase
      .from('product_images')
      .select('display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: false })
      .limit(1)

    const displayOrder = images && images.length > 0 ? (images[0].display_order || 0) + 1 : 0

    // Insert image record
    const { error: insertError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        is_primary: isPrimary,
        display_order: displayOrder,
      })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true, imageUrl }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload image' }
  }
}

// Delete product image
export async function deleteProductImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get image URL first to delete from storage
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Extract file path from URL
    const url = new URL(image.image_url)
    const pathParts = url.pathname.split('/')
    // Find the index after 'product-images' bucket name
    const bucketIndex = pathParts.indexOf('product-images')
    // Get path after bucket name (skip bucket name itself)
    const filePath = bucketIndex >= 0 
      ? pathParts.slice(bucketIndex + 1).join('/')
      : pathParts[pathParts.length - 1]

    // Delete from storage
    await supabase.storage.from('product-images').remove([filePath])

    // Delete from database
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete image' }
  }
}

// Get all categories (parents and subcategories) for product form
export async function getCategories(): Promise<Array<{ id: string; name: string; parent_id: string | null; parent_name?: string | null }>> {
  try {
    const { data: allCategories, error: allError } = await supabase
      .from('categories')
      .select('id, name, parent_id, parent:categories!parent_id(id, name)')
      .eq('is_active', true)
      .order('name')

    if (allError) {
      return []
    }

    if (!allCategories) return []

    return allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      parent_id: cat.parent_id,
      parent_name: (cat.parent as any)?.name || null,
    }))
  } catch (error) {
    return []
  }
}

// Get all brands
export async function getBrands(): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return []
    }

    return (data || []) as Array<{ id: string; name: string }>
  } catch (error) {
    return []
  }
}

// Get all colors
export async function getColors(): Promise<Array<{ id: string; name: string; hex_code: string }>> {
  try {
    const { data, error } = await supabase
      .from('colors')
      .select('id, name, hex_code')
      .order('name')

    if (error) {
      return []
    }

    return (data || []) as Array<{ id: string; name: string; hex_code: string }>
  } catch (error) {
    return []
  }
}

// Get all sizes
export async function getSizes(): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabase
      .from('sizes')
      .select('id, name')
      .order('display_order')

    if (error) {
      return []
    }

    return (data || []) as Array<{ id: string; name: string }>
  } catch (error) {
    return []
  }
}

// Create new color (or get existing one)
export async function createColor(
  name: string,
  hexCode: string
): Promise<{ success: boolean; colorId?: string; error?: string }> {
  try {
    const trimmedName = name.trim()
    const trimmedHex = hexCode.trim()
    
    // First, check if color already exists
    const { data: existingColor, error: checkError } = await supabase
      .from('colors')
      .select('id')
      .eq('name', trimmedName)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message }
    }

    // If color exists, return its ID
    if (existingColor) {
      return { success: true, colorId: existingColor.id }
    }

    // Color doesn't exist, create it
    const { data: color, error } = await supabase
      .from('colors')
      .insert({
        name: trimmedName,
        hex_code: trimmedHex,
      })
      .select('id')
      .single()

    if (error) {
      // If it's a duplicate key error, try to fetch the existing one
      if (error.code === '23505') {
        const { data: existing, error: fetchError } = await supabase
          .from('colors')
          .select('id')
          .eq('name', trimmedName)
          .single()
        
        if (!fetchError && existing) {
          return { success: true, colorId: existing.id }
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true, colorId: color.id }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create color' }
  }
}

// Create new size (or get existing one)
export async function createSize(
  name: string
): Promise<{ success: boolean; sizeId?: string; error?: string }> {
  try {
    const trimmedName = name.trim()
    
    // First, check if size already exists
    const { data: existingSize, error: checkError } = await supabase
      .from('sizes')
      .select('id')
      .eq('name', trimmedName)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message }
    }

    // If size exists, return its ID
    if (existingSize) {
      return { success: true, sizeId: existingSize.id }
    }

    // Size doesn't exist, create it
    const { data: size, error } = await supabase
      .from('sizes')
      .insert({
        name: trimmedName,
        display_order: 0,
      })
      .select('id')
      .single()

    if (error) {
      // If it's a duplicate key error, try to fetch the existing one
      if (error.code === '23505') {
        const { data: existing, error: fetchError } = await supabase
          .from('sizes')
          .select('id')
          .eq('name', trimmedName)
          .single()
        
        if (!fetchError && existing) {
          return { success: true, sizeId: existing.id }
        }
      }
      return { success: false, error: error.message }
    }

    return { success: true, sizeId: size.id }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create size' }
  }
}

// Create or update product variant
export interface VariantData {
  product_id: string
  color_id?: string | null
  size_id?: string | null
  stock_quantity: number
  price_override?: number | null
  is_active?: boolean
}

export async function upsertVariant(
  variantId: string | null,
  data: VariantData
): Promise<{ success: boolean; variantId?: string; error?: string }> {
  try {
    if (variantId) {
      // Update existing variant
      const { data: updated, error } = await supabase
        .from('product_variants')
        .update(data)
        .eq('id', variantId)
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, variantId }
    } else {
      // Create new variant
      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert(data)
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, variantId: variant.id }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save variant' }
  }
}

// Create variant with dynamic attributes
export interface DynamicVariantData {
  product_id: string
  stock_quantity: number
  price_override?: number | null
  is_active?: boolean
  attributes: Array<{
    attribute_id: string
    attribute_value_id: string
  }>
}

export async function createVariantWithAttributes(
  data: DynamicVariantData
): Promise<{ success: boolean; variantId?: string; error?: string }> {
  try {
    console.log("=== createVariantWithAttributes CALLED ===");
    console.log("Input data:", data);
    console.log("Attributes to assign:", data.attributes);
    
    // First create the variant (without color_id/size_id for now)
    console.log("Creating variant in database...");
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .insert({
        product_id: data.product_id,
        stock_quantity: data.stock_quantity,
        price_override: data.price_override || null,
        is_active: data.is_active ?? true,
        color_id: null, // Will use dynamic attributes instead
        size_id: null, // Will use dynamic attributes instead
      })
      .select('id')
      .single()

    if (variantError || !variant) {
      console.error("❌ Failed to create variant:", variantError);
      return { success: false, error: variantError?.message || 'Failed to create variant' }
    }

    console.log("✅ Variant created successfully:", variant.id);

    // Then create attribute associations
    if (data.attributes.length > 0) {
      console.log("Creating attribute associations...");
      const variantAttributes = data.attributes.map(attr => ({
        variant_id: variant.id,
        attribute_id: attr.attribute_id,
        attribute_value_id: attr.attribute_value_id,
      }))

      console.log("Variant attributes to insert:", variantAttributes);

      const { error: attrError } = await supabase
        .from('product_variant_attributes')
        .insert(variantAttributes)

      if (attrError) {
        console.error("❌ Failed to create attribute associations:", attrError);
        // Rollback variant creation
        await supabase.from('product_variants').delete().eq('id', variant.id)
        return { success: false, error: attrError.message }
      }
      
      console.log("✅ Attribute associations created successfully");
    } else {
      console.log("⚠️ No attributes to assign");
    }

    console.log("=== createVariantWithAttributes SUCCESS ===\n");
    return { success: true, variantId: variant.id }
  } catch (error: any) {
    console.error("❌ Exception in createVariantWithAttributes:", error);
    return { success: false, error: error.message || 'Failed to create variant' }
  }
}

// Delete variant
export async function deleteVariant(
  variantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete variant' }
  }
}

// Update variant stock (increase or decrease)
export async function updateVariantStock(
  variantId: string,
  newStockQuantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (newStockQuantity < 0) {
      return { success: false, error: 'Stock quantity cannot be negative' }
    }

    const { error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStockQuantity })
      .eq('id', variantId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock' }
  }
}

// Increase variant stock (add to existing)
export async function increaseVariantStock(
  variantId: string,
  quantityToAdd: number
): Promise<{ success: boolean; error?: string; newStock?: number }> {
  try {
    if (quantityToAdd <= 0) {
      return { success: false, error: 'Quantity to add must be greater than 0' }
    }

    // Get current stock
    const { data: variant, error: fetchError } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .single()

    if (fetchError || !variant) {
      return { success: false, error: fetchError?.message || 'Variant not found' }
    }

    const currentStock = variant.stock_quantity || 0
    const newStock = currentStock + quantityToAdd

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', variantId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, newStock }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to increase stock' }
  }
}

// Product Specifications Management
export interface ProductSpecification {
  id: string
  product_id: string
  spec_key: string
  spec_value: string
  display_order: number
  created_at: string
}

// Get product specifications
export async function getProductSpecifications(
  productId: string
): Promise<ProductSpecification[]> {
  try {
    const { data, error } = await supabase
      .from('product_specifications')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })
      .order('spec_key', { ascending: true })

    if (error) {
      console.error('Error fetching product specifications:', error)
      return []
    }

    return (data || []) as ProductSpecification[]
  } catch (error) {
    console.error('Error fetching product specifications:', error)
    return []
  }
}

// Create product specification
export async function createProductSpecification(
  productId: string,
  specData: {
    spec_key: string
    spec_value: string
    display_order?: number
  }
): Promise<{ success: boolean; data?: ProductSpecification; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('product_specifications')
      .insert({
        product_id: productId,
        spec_key: specData.spec_key,
        spec_value: specData.spec_value,
        display_order: specData.display_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product specification:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductSpecification }
  } catch (error: any) {
    console.error('Error creating product specification:', error)
    return { success: false, error: error.message || 'Failed to create specification' }
  }
}

// Update product specification
export async function updateProductSpecification(
  specId: string,
  specData: {
    spec_key?: string
    spec_value?: string
    display_order?: number
  }
): Promise<{ success: boolean; data?: ProductSpecification; error?: string }> {
  try {
    const updateData: any = {}
    if (specData.spec_key !== undefined) updateData.spec_key = specData.spec_key
    if (specData.spec_value !== undefined) updateData.spec_value = specData.spec_value
    if (specData.display_order !== undefined) updateData.display_order = specData.display_order

    const { data, error } = await supabase
      .from('product_specifications')
      .update(updateData)
      .eq('id', specId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product specification:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductSpecification }
  } catch (error: any) {
    console.error('Error updating product specification:', error)
    return { success: false, error: error.message || 'Failed to update specification' }
  }
}

// Delete product specification
export async function deleteProductSpecification(
  specId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_specifications')
      .delete()
      .eq('id', specId)

    if (error) {
      console.error('Error deleting product specification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting product specification:', error)
    return { success: false, error: error.message || 'Failed to delete specification' }
  }
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

