import { supabase } from '../supabase'

export interface ProductAttribute {
  id: string
  name: string
  display_name: string
  attribute_type: 'select' | 'text' | 'color'
  is_predefined: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface AttributeValue {
  id: string
  attribute_id: string
  value: string
  display_value: string | null
  hex_code: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

// Get all attributes
export async function getAllAttributes(): Promise<ProductAttribute[]> {
  try {
    const { data, error } = await supabase
      .from('product_attributes')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as ProductAttribute[]
  } catch (error) {
    return []
  }
}

// Get single attribute by ID
export async function getAttributeById(id: string): Promise<ProductAttribute | null> {
  try {
    const { data, error } = await supabase
      .from('product_attributes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data as ProductAttribute
  } catch (error) {
    return null
  }
}

// Get attribute values for an attribute
export async function getAttributeValues(
  attributeId: string
): Promise<AttributeValue[]> {
  try {
    const { data, error } = await supabase
      .from('product_attribute_values')
      .select('*')
      .eq('attribute_id', attributeId)
      .order('display_order', { ascending: true })
      .order('value', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as AttributeValue[]
  } catch (error) {
    return []
  }
}

// Create attribute
export async function createAttribute(
  attributeData: {
    name: string
    display_name?: string
    attribute_type: 'select' | 'text' | 'color'
    is_predefined?: boolean
    display_order?: number
  }
): Promise<{ success: boolean; data?: ProductAttribute; error?: string }> {
  try {
    const displayName = attributeData.display_name || attributeData.name

    // Check if name already exists
    const { data: existing } = await supabase
      .from('product_attributes')
      .select('id')
      .eq('name', attributeData.name)
      .single()

    if (existing) {
      return { success: false, error: 'An attribute with this name already exists' }
    }

    const { data, error } = await supabase
      .from('product_attributes')
      .insert({
        name: attributeData.name,
        display_name: displayName,
        attribute_type: attributeData.attribute_type,
        is_predefined: attributeData.is_predefined ?? false,
        display_order: attributeData.display_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductAttribute }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create attribute' }
  }
}

// Update attribute
export async function updateAttribute(
  id: string,
  attributeData: {
    name?: string
    display_name?: string
    attribute_type?: 'select' | 'text' | 'color'
    is_predefined?: boolean
    display_order?: number
  }
): Promise<{ success: boolean; data?: ProductAttribute; error?: string }> {
  try {
    // Check if name already exists (excluding current attribute)
    if (attributeData.name) {
      const { data: existing } = await supabase
        .from('product_attributes')
        .select('id')
        .eq('name', attributeData.name)
        .neq('id', id)
        .single()

      if (existing) {
        return { success: false, error: 'An attribute with this name already exists' }
      }
    }

    const updateData: any = {}
    if (attributeData.name !== undefined) updateData.name = attributeData.name
    if (attributeData.display_name !== undefined) updateData.display_name = attributeData.display_name
    if (attributeData.attribute_type !== undefined) updateData.attribute_type = attributeData.attribute_type
    if (attributeData.is_predefined !== undefined) updateData.is_predefined = attributeData.is_predefined
    if (attributeData.display_order !== undefined) updateData.display_order = attributeData.display_order

    const { data, error } = await supabase
      .from('product_attributes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductAttribute }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update attribute' }
  }
}

// Delete attribute
export async function deleteAttribute(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if attribute is used in category_attributes
    const { data: categoryAttrs, error: categoryAttrsError } = await supabase
      .from('category_attributes')
      .select('id')
      .eq('attribute_id', id)
      .limit(1)

    if (categoryAttrsError) {
    }

    if (categoryAttrs && categoryAttrs.length > 0) {
      return {
        success: false,
        error: 'Cannot delete attribute: It is assigned to one or more categories. Please remove it from categories first.',
      }
    }

    // Check if attribute values are used in variants
    const { data: values } = await supabase
      .from('product_attribute_values')
      .select('id')
      .eq('attribute_id', id)
      .limit(1)

    if (values && values.length > 0) {
      // Check if any values are used in variants
      const valueIds = values.map(v => v.id)
      const { data: variantAttrs } = await supabase
        .from('product_variant_attributes')
        .select('id')
        .in('attribute_value_id', valueIds)
        .limit(1)

      if (variantAttrs && variantAttrs.length > 0) {
        return {
          success: false,
          error: 'Cannot delete attribute: It is used in product variants. Please remove it from products first.',
        }
      }
    }

    const { error } = await supabase.from('product_attributes').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete attribute' }
  }
}

// Create attribute value
export async function createAttributeValue(
  valueData: {
    attribute_id: string
    value: string
    display_value?: string
    hex_code?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; data?: AttributeValue; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('product_attribute_values')
      .insert({
        attribute_id: valueData.attribute_id,
        value: valueData.value,
        display_value: valueData.display_value || null,
        hex_code: valueData.hex_code || null,
        display_order: valueData.display_order ?? 0,
        is_active: valueData.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as AttributeValue }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create attribute value' }
  }
}

// Update attribute value
export async function updateAttributeValue(
  id: string,
  valueData: {
    value?: string
    display_value?: string
    hex_code?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; data?: AttributeValue; error?: string }> {
  try {
    const updateData: any = {}
    if (valueData.value !== undefined) updateData.value = valueData.value
    if (valueData.display_value !== undefined) updateData.display_value = valueData.display_value
    if (valueData.hex_code !== undefined) updateData.hex_code = valueData.hex_code
    if (valueData.display_order !== undefined) updateData.display_order = valueData.display_order
    if (valueData.is_active !== undefined) updateData.is_active = valueData.is_active

    const { data, error } = await supabase
      .from('product_attribute_values')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as AttributeValue }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update attribute value' }
  }
}

// Delete attribute value
export async function deleteAttributeValue(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if value is used in variants
    const { data: variantAttrs } = await supabase
      .from('product_variant_attributes')
      .select('id')
      .eq('attribute_value_id', id)
      .limit(1)

    if (variantAttrs && variantAttrs.length > 0) {
      return {
        success: false,
        error: 'Cannot delete value: It is used in product variants. Please remove it from products first.',
      }
    }

    const { error } = await supabase
      .from('product_attribute_values')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete attribute value' }
  }
}
