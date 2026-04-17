import { supabase } from '../supabase'

export interface HeroBanner {
  id: string
  type: 'image' | 'video'
  media_url: string
  alt_text: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export async function getActiveBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as HeroBanner[]
  } catch {
    return []
  }
}

export async function getAllBanners(): Promise<HeroBanner[]> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as HeroBanner[]
  } catch {
    return []
  }
}

export async function createBanner(
  bannerData: {
    type: 'image' | 'video'
    media_url: string
    alt_text?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; banner?: HeroBanner; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .insert({
        type: bannerData.type,
        media_url: bannerData.media_url,
        alt_text: bannerData.alt_text || null,
        display_order: bannerData.display_order ?? 0,
        is_active: bannerData.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, banner: data as HeroBanner }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create banner' }
  }
}

export async function updateBanner(
  id: string,
  updates: {
    alt_text?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('hero_banners')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update banner' }
  }
}

export async function deleteBanner(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: banner, error: fetchError } = await supabase
      .from('hero_banners')
      .select('media_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    if (banner?.media_url?.includes('supabase.co')) {
      try {
        const url = new URL(banner.media_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.indexOf('hero-banners')
        const filePath = bucketIndex >= 0
          ? pathParts.slice(bucketIndex + 1).join('/')
          : null
        if (filePath) {
          await supabase.storage.from('hero-banners').remove([filePath])
        }
      } catch {
        // skip storage cleanup on URL parse failure
      }
    }

    const { error: deleteError } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete banner' }
  }
}

export async function uploadBannerMedia(
  file: File
): Promise<{ success: boolean; mediaUrl?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('hero-banners')
      .upload(fileName, file, {
        cacheControl: '86400',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage
      .from('hero-banners')
      .getPublicUrl(fileName)

    return { success: true, mediaUrl: urlData.publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload media' }
  }
}
