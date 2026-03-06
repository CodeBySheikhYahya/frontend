import { supabase } from '../supabase'
import { ProductTab } from './products'

// Re-export ProductTab type for use in other modules
export type { ProductTab }

// Get all tabs (for admin)
export async function getAllTabs(): Promise<ProductTab[]> {
  try {
    const { data, error } = await supabase
      .from('product_tabs')
      .select('*')
      .order('display_order', { ascending: true })
      .order('display_name', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as ProductTab[]
  } catch (error) {
    return []
  }
}

// Get single tab by ID
export async function getTabById(id: string): Promise<ProductTab | null> {
  try {
    const { data, error } = await supabase
      .from('product_tabs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data as ProductTab
  } catch (error) {
    return null
  }
}

// Create new tab
export async function createTab(
  tabData: {
    tab_key: string
    display_name: string
    component_type: string
    display_order?: number
    is_active?: boolean
    is_required?: boolean
  }
): Promise<{ success: boolean; data?: ProductTab; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('product_tabs')
      .insert({
        tab_key: tabData.tab_key,
        display_name: tabData.display_name,
        component_type: tabData.component_type,
        display_order: tabData.display_order ?? 0,
        is_active: tabData.is_active ?? true,
        is_required: tabData.is_required ?? false,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductTab }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create tab' }
  }
}

// Update tab
export async function updateTab(
  id: string,
  updates: {
    display_name?: string
    component_type?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; data?: ProductTab; error?: string }> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name
    if (updates.component_type !== undefined) updateData.component_type = updates.component_type
    if (updates.display_order !== undefined) updateData.display_order = updates.display_order
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active

    const { data, error } = await supabase
      .from('product_tabs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data as ProductTab }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update tab' }
  }
}

// Delete tab (only if not required)
export async function deleteTab(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if tab is required
    const tab = await getTabById(id)
    if (tab && tab.is_required) {
      return { success: false, error: 'Cannot delete required tab' }
    }

    const { error } = await supabase
      .from('product_tabs')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete tab' }
  }
}
