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
  
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    srcUrl: imageUrl,
    gallery: gallery,
    price: Number(dbProduct.base_price),
    discount: discount,
    rating: Number(dbProduct.average_rating || 0),
  }
}

// Get new arrivals products
export async function getNewArrivals(limit: number = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching new arrivals:', error)
    return []
  }

  return (data || []).map(transformProduct)
}

// Get top selling products
export async function getTopSelling(limit: number = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('is_active', true)
    .eq('is_top_selling', true)
    .order('total_reviews', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top selling:', error)
    return []
  }

  return (data || []).map(transformProduct)
}

// Get all products (for shop page)
export async function getAllProducts(limit: number = 10, offset: number = 0): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).map(transformProduct)
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return transformProduct(data)
}

// Get product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product by slug:', error)
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
    console.error('Error fetching related products:', error)
    return []
  }

  return (data || []).map(transformProduct)
}






