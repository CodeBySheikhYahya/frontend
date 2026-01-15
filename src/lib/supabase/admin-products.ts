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
        images:product_images(id, image_url, is_primary, display_order)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return (data || []) as AdminProduct[]
  } catch (error) {
    console.error('Exception fetching products:', error)
    return []
  }
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
      console.error('Error fetching product:', error)
      return null
    }

    return data as AdminProduct
  } catch (error) {
    console.error('Exception fetching product:', error)
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

// Get all categories
export async function getCategories(): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return (data || []) as Array<{ id: string; name: string }>
  } catch (error) {
    console.error('Exception fetching categories:', error)
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
      console.error('Error fetching brands:', error)
      return []
    }

    return (data || []) as Array<{ id: string; name: string }>
  } catch (error) {
    console.error('Exception fetching brands:', error)
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
      console.error('Error fetching colors:', error)
      return []
    }

    return (data || []) as Array<{ id: string; name: string; hex_code: string }>
  } catch (error) {
    console.error('Exception fetching colors:', error)
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
      console.error('Error fetching sizes:', error)
      return []
    }

    return (data || []) as Array<{ id: string; name: string }>
  } catch (error) {
    console.error('Exception fetching sizes:', error)
    return []
  }
}

// Create or update product variant
export interface VariantData {
  product_id: string
  color_id: string
  size_id: string
  stock_quantity: number
  price_override?: number | null
  is_active?: boolean
}

export async function upsertVariant(
  variantId: string | null,
  data: VariantData
): Promise<{ success: boolean; variantId?: string; error?: string }> {
  try {
    console.log('💾 upsertVariant - Called with:', { variantId, data })
    
    if (variantId) {
      // Update existing variant
      console.log('🔄 upsertVariant - Updating existing variant:', variantId)
      const { data: updated, error } = await supabase
        .from('product_variants')
        .update(data)
        .eq('id', variantId)
        .select('id')
        .single()

      if (error) {
        console.error('❌ upsertVariant - Update error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ upsertVariant - Variant updated successfully:', updated)
      return { success: true, variantId }
    } else {
      // Create new variant
      console.log('🆕 upsertVariant - Creating new variant with data:', data)
      const { data: variant, error } = await supabase
        .from('product_variants')
        .insert(data)
        .select('id')
        .single()

      if (error) {
        console.error('❌ upsertVariant - Insert error:', error)
        console.error('❌ upsertVariant - Error details:', JSON.stringify(error, null, 2))
        return { success: false, error: error.message }
      }

      console.log('✅ upsertVariant - Variant created successfully:', variant)
      console.log('✅ upsertVariant - New variant ID:', variant.id)
      return { success: true, variantId: variant.id }
    }
  } catch (error: any) {
    console.error('❌ upsertVariant - Exception:', error)
    return { success: false, error: error.message || 'Failed to save variant' }
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

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

