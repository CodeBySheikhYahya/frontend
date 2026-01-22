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

// Get product specifications
export interface ProductSpecification {
  id: string
  spec_key: string
  spec_value: string
  display_order: number
}

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

// Get all categories (for filters)
export async function getCategoriesForShop(): Promise<Array<{ id: string; name: string; slug: string; parent_id: string | null; parent_slug?: string | null }>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent_id, parent:categories!parent_id(slug)')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id,
      parent_slug: (cat.parent as any)?.slug || null,
    })) as Array<{ id: string; name: string; slug: string; parent_id: string | null; parent_slug?: string | null }>
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Product Tabs Configuration
export interface ProductTab {
  id: string
  tab_key: string
  display_name: string
  component_type: string
  display_order: number
  is_active: boolean
  is_required: boolean
}

// Get active product tabs
export async function getProductTabs(): Promise<ProductTab[]> {
  try {
    const { data, error } = await supabase
      .from('product_tabs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('display_name', { ascending: true })

    if (error) {
      console.error('Error fetching product tabs:', error)
      // Return default tabs if table doesn't exist yet
      return [
        { id: '1', tab_key: 'details', display_name: 'Product Details', component_type: 'details', display_order: 1, is_active: true, is_required: true },
        { id: '2', tab_key: 'reviews', display_name: 'Rating & Reviews', component_type: 'reviews', display_order: 2, is_active: true, is_required: false },
        { id: '3', tab_key: 'faq', display_name: 'FAQs', component_type: 'faq', display_order: 3, is_active: true, is_required: false },
      ]
    }

    return (data || []) as ProductTab[]
  } catch (error) {
    console.error('Error fetching product tabs:', error)
    // Return default tabs on error
    return [
      { id: '1', tab_key: 'details', display_name: 'Product Details', component_type: 'details', display_order: 1, is_active: true, is_required: true },
      { id: '2', tab_key: 'reviews', display_name: 'Rating & Reviews', component_type: 'reviews', display_order: 2, is_active: true, is_required: false },
      { id: '3', tab_key: 'faq', display_name: 'FAQs', component_type: 'faq', display_order: 3, is_active: true, is_required: false },
    ]
  }
}

// Get products filtered by category and attributes
export async function getFilteredProducts(
  options: {
    categoryId?: string
    attributeFilters?: Record<string, string[]> // attribute_id -> array of attribute_value_ids
    limit?: number
    offset?: number
  }
): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(
          id,
          stock_quantity,
          is_active,
          color:colors(id, name, hex_code),
          size:sizes(id, name),
          variant_attributes:product_variant_attributes(
            attribute_id,
            attribute_value_id
          )
        )
      `)
      .eq('is_active', true)

    // Filter by category
    if (options.categoryId) {
      // Check if this category has children (is a parent category)
      const { data: childCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', options.categoryId)
        .eq('is_active', true)
      
      if (childCategories && childCategories.length > 0) {
        // Parent category: include products from all child categories
        const childCategoryIds = childCategories.map(c => c.id)
        query = query.in('category_id', childCategoryIds)
      } else {
        // Child category or category with no children: filter by exact category
        query = query.eq('category_id', options.categoryId)
      }
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 10) - 1)

    if (error) {
      console.error('Error fetching filtered products:', error)
      return []
    }

    let products = (data || []).map(transformProduct)

    // Filter by attributes if provided
    if (options.attributeFilters && Object.keys(options.attributeFilters).length > 0) {
      // First, get all products that have variants matching the attribute filters
      // We need to query product_variant_attributes directly
      const attributeFilterEntries = Object.entries(options.attributeFilters)
      
      // For each attribute filter, find variant IDs that match
      const matchingVariantIds = new Set<string>()
      
      for (const [attrId, valueIds] of attributeFilterEntries) {
        const { data: variantAttrs } = await supabase
          .from('product_variant_attributes')
          .select('variant_id')
          .eq('attribute_id', attrId)
          .in('attribute_value_id', valueIds)
        
        if (variantAttrs) {
          const variantIds = variantAttrs.map((va: any) => va.variant_id)
          
          if (matchingVariantIds.size === 0) {
            // First filter - add all matching variants
            variantIds.forEach((id: string) => matchingVariantIds.add(id))
          } else {
            // Subsequent filters - keep only variants that match this filter too
            const currentIds = Array.from(matchingVariantIds)
            matchingVariantIds.clear()
            currentIds.forEach((id) => {
              if (variantIds.includes(id)) {
                matchingVariantIds.add(id)
              }
            })
          }
        }
      }
      
      // Now get product IDs from matching variants
      if (matchingVariantIds.size > 0) {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('product_id')
          .in('id', Array.from(matchingVariantIds))
        
        if (variants) {
          const productIds = [...new Set(variants.map((v: any) => v.product_id))]
          products = products.filter((p) => productIds.includes(p.id as string))
        } else {
          products = []
        }
      } else {
        products = []
      }
    }

    return products
  } catch (error) {
    console.error('Error fetching filtered products:', error)
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
        color_id,
        size_id,
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

  // Enrich variants with dynamic attributes if they don't have legacy color/size
  if (data.variants && data.variants.length > 0) {
    const variantIds = data.variants.map((v: any) => v.id)
    
    // Fetch all variant attributes
    const { data: variantAttrs } = await supabase
      .from('product_variant_attributes')
      .select(`
        variant_id,
        attribute_id,
        attribute_value_id,
        attribute:product_attributes(id, name, attribute_type),
        attribute_value:product_attribute_values(id, value, display_value, hex_code)
      `)
      .in('variant_id', variantIds)
    
    if (variantAttrs && variantAttrs.length > 0) {
      // Group attributes by variant_id
      const attrsByVariant = new Map<string, any[]>()
      variantAttrs.forEach((va: any) => {
        if (!attrsByVariant.has(va.variant_id)) {
          attrsByVariant.set(va.variant_id, [])
        }
        attrsByVariant.get(va.variant_id)!.push(va)
      })
      
      // Enrich variants with dynamic attributes
      data.variants = data.variants.map((variant: any) => {
        // If variant already has legacy color/size, keep it
        if (variant.color || variant.size) {
          return variant
        }
        
        // Otherwise, try to map dynamic attributes to color/size
        const variantAttrsList = attrsByVariant.get(variant.id) || []
        
        // Find color and size attributes
        let colorAttr: any = null
        let sizeAttr: any = null
        
        variantAttrsList.forEach((va: any) => {
          if (va.attribute?.attribute_type === 'color') {
            colorAttr = va
          } else if (va.attribute?.attribute_type === 'select' && 
                     (va.attribute?.name?.toLowerCase().includes('size') || 
                      va.attribute?.display_name?.toLowerCase().includes('size'))) {
            sizeAttr = va
          }
        })
        
        // Map to expected format
        if (colorAttr && colorAttr.attribute_value) {
          variant.color = {
            id: colorAttr.attribute_value.id,
            name: colorAttr.attribute_value.display_value || colorAttr.attribute_value.value,
            hex_code: colorAttr.attribute_value.hex_code || '#000000'
          }
        }
        
        if (sizeAttr && sizeAttr.attribute_value) {
          variant.size = {
            id: sizeAttr.attribute_value.id,
            name: sizeAttr.attribute_value.display_value || sizeAttr.attribute_value.value
          }
        }
        
        return variant
      })
    }
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
        color_id,
        size_id,
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

  // Enrich variants with dynamic attributes if they don't have legacy color/size
  if (data.variants && data.variants.length > 0) {
    const variantIds = data.variants.map((v: any) => v.id)
    
    // Fetch all variant attributes
    const { data: variantAttrs } = await supabase
      .from('product_variant_attributes')
      .select(`
        variant_id,
        attribute_id,
        attribute_value_id,
        attribute:product_attributes(id, name, attribute_type),
        attribute_value:product_attribute_values(id, value, display_value, hex_code)
      `)
      .in('variant_id', variantIds)
    
    if (variantAttrs && variantAttrs.length > 0) {
      // Group attributes by variant_id
      const attrsByVariant = new Map<string, any[]>()
      variantAttrs.forEach((va: any) => {
        if (!attrsByVariant.has(va.variant_id)) {
          attrsByVariant.set(va.variant_id, [])
        }
        attrsByVariant.get(va.variant_id)!.push(va)
      })
      
      // Enrich variants with dynamic attributes
      data.variants = data.variants.map((variant: any) => {
        // If variant already has legacy color/size, keep it
        if (variant.color || variant.size) {
          return variant
        }
        
        // Otherwise, try to map dynamic attributes to color/size
        const variantAttrsList = attrsByVariant.get(variant.id) || []
        
        // Find color and size attributes
        let colorAttr: any = null
        let sizeAttr: any = null
        
        variantAttrsList.forEach((va: any) => {
          if (va.attribute?.attribute_type === 'color') {
            colorAttr = va
          } else if (va.attribute?.attribute_type === 'select' && 
                     (va.attribute?.name?.toLowerCase().includes('size') || 
                      va.attribute?.display_name?.toLowerCase().includes('size'))) {
            sizeAttr = va
          }
        })
        
        // Map to expected format
        if (colorAttr && colorAttr.attribute_value) {
          variant.color = {
            id: colorAttr.attribute_value.id,
            name: colorAttr.attribute_value.display_value || colorAttr.attribute_value.value,
            hex_code: colorAttr.attribute_value.hex_code || '#000000'
          }
        }
        
        if (sizeAttr && sizeAttr.attribute_value) {
          variant.size = {
            id: sizeAttr.attribute_value.id,
            name: sizeAttr.attribute_value.display_value || sizeAttr.attribute_value.value
          }
        }
        
        return variant
      })
    }
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

// Search products by name and category name (server-side)
export async function searchProducts(
  searchQuery: string,
  limit: number = 50,
  offset: number = 0
): Promise<Product[]> {
  try {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return []
    }

    const query = searchQuery.trim()
    const uniqueProducts = new Map<string, any>()

    // First, find categories that match the search query
    const { data: matchingCategories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)

    const categoryIds: string[] = []
    if (!categoryError && matchingCategories) {
      categoryIds.push(...matchingCategories.map(c => c.id))
      
      // Also get child categories if parent matches
      for (const cat of matchingCategories) {
        const { data: children } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', cat.id)
          .eq('is_active', true)
        
        if (children) {
          categoryIds.push(...children.map(c => c.id))
        }
      }
    }

    // Search products by title OR description
    const { data: productsByText, error: textError } = await supabase
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
        ),
        category:categories(id, name, slug)
      `)
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!textError && productsByText) {
      productsByText.forEach((product: any) => {
        if (!uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product)
        }
      })
    }

    // Search products by category IDs (if any matched)
    if (categoryIds.length > 0) {
      const { data: productsByCategory, error: categorySearchError } = await supabase
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
          ),
          category:categories(id, name, slug)
        `)
        .eq('is_active', true)
        .in('category_id', categoryIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!categorySearchError && productsByCategory) {
        productsByCategory.forEach((product: any) => {
          if (!uniqueProducts.has(product.id)) {
            uniqueProducts.set(product.id, product)
          }
        })
      }
    }

    // Convert to array, apply offset and limit
    const allProducts = Array.from(uniqueProducts.values())
    const paginatedProducts = allProducts.slice(offset, offset + limit)

    return paginatedProducts.map(transformProduct)
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}






