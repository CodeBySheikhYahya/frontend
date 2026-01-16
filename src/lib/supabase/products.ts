import { supabase } from '../supabase'
import { Product } from '@/types/product.types'

// Transform Supabase product to match your Product type
function transformProduct(dbProduct: any): Product {
  // Get primary image
  const primaryImage = dbProduct.images?.find((img: any) => img.is_primary) || dbProduct.images?.[0]
  const imageUrl = primaryImage?.image_url || '/images/placeholder.png'
  
  // Get all gallery images
  const gallery = dbProduct.images?.map((img: any) => img.image_url) || [imageUrl]
  
  // Calculate discount
  const discount = {
    amount: 0,
    percentage: 0,
  }
  
  if (dbProduct.discount_type === 'percentage' && dbProduct.discount_value) {
    discount.percentage = Number(dbProduct.discount_value)
  } else if (dbProduct.discount_type === 'amount' && dbProduct.discount_value) {
    discount.amount = Number(dbProduct.discount_value)
  }
  
  const variants = dbProduct.variants || []
  
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    srcUrl: imageUrl,
    gallery: gallery,
    price: Number(dbProduct.base_price),
    discount: discount,
    rating: Number(dbProduct.average_rating || 0),
    variants: variants,
  }
}

// Get new arrivals products
export async function getNewArrivals(limit: number = 4, offset: number = 0): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .eq('is_active', true)
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return []
    }

    return (data || []).map(transformProduct)
  } catch (error) {
    return []
  }
}

// Get top selling products
export async function getTopSelling(limit: number = 4, offset: number = 0): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .eq('is_active', true)
      .eq('is_top_selling', true)
      .order('total_reviews', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return []
    }

    return (data || []).map(transformProduct)
  } catch (error) {
    return []
  }
}

// Get on sale products (products with discounts)
export async function getOnSaleProducts(limit: number = 10, offset: number = 0): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .eq('is_active', true)
      .not('discount_type', 'is', null)
      .not('discount_value', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return []
    }

    return (data || []).map(transformProduct)
  } catch (error) {
    return []
  }
}

// Get all products (for shop page)
export async function getAllProducts(limit: number = 10, offset: number = 0): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return []
    }

    return (data || []).map(transformProduct)
  } catch (error) {
    return []
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(
        id,
        stock_quantity,
        is_active,
        color:colors(id, name, hex_code),
        size:sizes(id, name)
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  const transformed = transformProduct(data)

  return transformed
}

// Get product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(
        id,
        stock_quantity,
        is_active,
        color:colors(id, name, hex_code),
        size:sizes(id, name)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return transformProduct(data)
}

// Get related products (same category, exclude current product)
export async function getRelatedProducts(categoryId: string, excludeId: string, limit: number = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(limit)

  if (error) {
    return []
  }

  return (data || []).map(transformProduct)
}






