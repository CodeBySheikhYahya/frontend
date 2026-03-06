import { supabase } from '../supabase'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  parent?: { id: string; name: string } | null
}

// Get all categories (including inactive for admin)
export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as Category[]
  } catch (error) {
    return []
  }
}

// Get single category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data as Category
  } catch (error) {
    return null
  }
}

// Generate slug from name
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Create category
export async function createCategory(
  categoryData: {
    name: string
    slug?: string
    description?: string
    image_url?: string
    parent_id?: string | null
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const slug = categoryData.slug || generateCategorySlug(categoryData.name)

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return { success: false, error: 'A category with this slug already exists' }
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description || null,
        image_url: categoryData.image_url || null,
        parent_id: categoryData.parent_id || null,
        display_order: categoryData.display_order ?? 0,
        is_active: categoryData.is_active ?? true,
      })
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Category }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create category' }
  }
}

// Update category
export async function updateCategory(
  id: string,
  categoryData: {
    name?: string
    slug?: string
    description?: string
    image_url?: string
    parent_id?: string | null
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    // If name is being updated, generate slug if not provided
    let slug = categoryData.slug
    if (categoryData.name && !slug) {
      slug = generateCategorySlug(categoryData.name)
    }

    // Check if slug already exists (excluding current category)
    if (slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existing) {
        return { success: false, error: 'A category with this slug already exists' }
      }
    }

    const updateData: any = {}
    if (categoryData.name !== undefined) updateData.name = categoryData.name
    if (slug !== undefined) updateData.slug = slug
    if (categoryData.description !== undefined) updateData.description = categoryData.description
    if (categoryData.image_url !== undefined) updateData.image_url = categoryData.image_url
    if (categoryData.parent_id !== undefined) updateData.parent_id = categoryData.parent_id
    if (categoryData.display_order !== undefined) updateData.display_order = categoryData.display_order
    if (categoryData.is_active !== undefined) updateData.is_active = categoryData.is_active

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Category }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update category' }
  }
}

// Delete category
export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if category has products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1)

    if (productsError) {
    }

    if (products && products.length > 0) {
      return {
        success: false,
        error: 'Cannot delete category: It has associated products. Please remove products first or reassign them to another category.',
      }
    }

    // Check if category has subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1)

    if (subcategoriesError) {
    }

    if (subcategories && subcategories.length > 0) {
      return {
        success: false,
        error: 'Cannot delete category: It has subcategories. Please delete or reassign subcategories first.',
      }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete category' }
  }
}
