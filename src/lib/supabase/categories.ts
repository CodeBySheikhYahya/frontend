import { supabase } from '../supabase'

export interface CategoryWithParent {
  id: string
  name: string
  slug: string
  parent_id: string | null
  parent?: {
    id: string
    name: string
    slug: string
  } | null
}

// Get category by slug path (e.g., ['bag'] or ['bag', 'party-bag'])
export async function getCategoryBySlugPath(slugPath: string[]): Promise<CategoryWithParent | null> {
  try {
    if (slugPath.length === 0) {
      return null
    }

    // If single slug, check if it's a parent category
    if (slugPath.length === 1) {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          parent_id,
          parent:categories!parent_id(id, name, slug)
        `)
        .eq('slug', slugPath[0])
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return null
      }

      // Transform parent from array to single object if needed
      const parentData = Array.isArray(data.parent) 
        ? (data.parent.length > 0 ? data.parent[0] : null)
        : data.parent

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id,
        parent: parentData ? {
          id: parentData.id,
          name: parentData.name,
          slug: parentData.slug,
        } : null,
      } as CategoryWithParent
    }

    // If two slugs, it's parent/child (e.g., bag/party-bag)
    if (slugPath.length === 2) {
      const [parentSlug, childSlug] = slugPath

      // First get parent
      const { data: parent, error: parentError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', parentSlug)
        .eq('is_active', true)
        .is('parent_id', null)
        .single()

      if (parentError || !parent) {
        return null
      }

      // Then get child with this parent
      const { data: child, error: childError } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .eq('slug', childSlug)
        .eq('parent_id', parent.id)
        .eq('is_active', true)
        .single()

      if (childError || !child) {
        return null
      }

      return {
        ...child,
        parent: {
          id: parent.id,
          name: parent.name,
          slug: parent.slug,
        },
      } as CategoryWithParent
    }

    return null
  } catch (error) {
    console.error('Error fetching category by slug path:', error)
    return null
  }
}

// Get all child category IDs for a parent category
export async function getChildCategoryIds(parentCategoryId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', parentCategoryId)
      .eq('is_active', true)

    if (error) {
      return []
    }

    return (data || []).map(c => c.id)
  } catch (error) {
    console.error('Error fetching child category IDs:', error)
    return []
  }
}
