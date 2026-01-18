import { supabase } from '../supabase'

export interface NavigationCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  display_order: number
  children?: NavigationCategory[]
}

// Get categories for navigation (only active, with parent-child relationships)
export async function getCategoriesForNavigation(): Promise<NavigationCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, parent_id, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories for navigation:', error)
      return []
    }

    if (!data) return []

    // Build parent-child hierarchy
    const categoryMap = new Map<string, NavigationCategory>()
    const rootCategories: NavigationCategory[] = []

    // First pass: create all category objects
    data.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      })
    })

    // Second pass: build hierarchy
    data.forEach((cat) => {
      const category = categoryMap.get(cat.id)!
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        // Has parent, add to parent's children
        const parent = categoryMap.get(cat.parent_id)!
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(category)
      } else {
        // No parent or parent not found, add to root
        rootCategories.push(category)
      }
    })

    // Sort children by display_order and name
    const sortCategories = (cats: NavigationCategory[]) => {
      cats.sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order
        }
        return a.name.localeCompare(b.name)
      })
      cats.forEach((cat) => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children)
        }
      })
    }

    sortCategories(rootCategories)

    return rootCategories
  } catch (error) {
    console.error('Error fetching categories for navigation:', error)
    return []
  }
}
