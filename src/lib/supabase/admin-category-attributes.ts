import { supabase } from '../supabase'

export interface CategoryAttribute {
  id: string
  category_id: string
  attribute_id: string
  is_required: boolean
  display_order: number
  created_at: string
  attribute?: {
    id: string
    name: string
    display_name: string
    attribute_type: string
  }
}

// Get all attributes assigned to a category
export async function getCategoryAttributes(
  categoryId: string
): Promise<CategoryAttribute[]> {
  try {
    const { data, error } = await supabase
      .from('category_attributes')
      .select(`
        *,
        attribute:product_attributes(id, name, display_name, attribute_type)
      `)
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as CategoryAttribute[]
  } catch (error) {
    return []
  }
}

// Assign attribute to category
export async function assignAttributeToCategory(
  categoryId: string,
  attributeId: string,
  options?: {
    is_required?: boolean
    display_order?: number
  }
): Promise<{ success: boolean; data?: CategoryAttribute; error?: string }> {
  try {
    // Check if already assigned
    const { data: existing } = await supabase
      .from('category_attributes')
      .select('id')
      .eq('category_id', categoryId)
      .eq('attribute_id', attributeId)
      .single()

    if (existing) {
      return { success: false, error: 'Attribute is already assigned to this category' }
    }

    const { data, error } = await supabase
      .from('category_attributes')
      .insert({
        category_id: categoryId,
        attribute_id: attributeId,
        is_required: options?.is_required ?? true,
        display_order: options?.display_order ?? 0,
      })
      .select(`
        *,
        attribute:product_attributes(id, name, display_name, attribute_type)
      `)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as CategoryAttribute }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign attribute' }
  }
}

// Remove attribute from category
export async function removeAttributeFromCategory(
  categoryAttributeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('category_attributes')
      .delete()
      .eq('id', categoryAttributeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove attribute' }
  }
}

// Update category attribute settings
export async function updateCategoryAttribute(
  categoryAttributeId: string,
  updates: {
    is_required?: boolean
    display_order?: number
  }
): Promise<{ success: boolean; data?: CategoryAttribute; error?: string }> {
  try {
    const updateData: any = {}
    if (updates.is_required !== undefined) updateData.is_required = updates.is_required
    if (updates.display_order !== undefined) updateData.display_order = updates.display_order

    const { data, error } = await supabase
      .from('category_attributes')
      .update(updateData)
      .eq('id', categoryAttributeId)
      .select(`
        *,
        attribute:product_attributes(id, name, display_name, attribute_type)
      `)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as CategoryAttribute }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update category attribute' }
  }
}
