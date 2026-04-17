import { supabase } from '../supabase'

export interface BtsVideo {
  id: string
  video_url: string
  poster_url: string | null
  title: string | null
  subtitle: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export async function getActiveBtsVideos(): Promise<BtsVideo[]> {
  try {
    const { data, error } = await supabase
      .from('bts_videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as BtsVideo[]
  } catch {
    return []
  }
}

export async function getAllBtsVideos(): Promise<BtsVideo[]> {
  try {
    const { data, error } = await supabase
      .from('bts_videos')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return []
    }

    return (data || []) as BtsVideo[]
  } catch {
    return []
  }
}

export async function createBtsVideo(
  videoData: {
    video_url: string
    poster_url?: string
    title?: string
    subtitle?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; video?: BtsVideo; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bts_videos')
      .insert({
        video_url: videoData.video_url,
        poster_url: videoData.poster_url || null,
        title: videoData.title || 'Our Journey',
        subtitle: videoData.subtitle || null,
        display_order: videoData.display_order ?? 0,
        is_active: videoData.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, video: data as BtsVideo }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create BTS video' }
  }
}

export async function updateBtsVideo(
  id: string,
  updates: {
    title?: string
    subtitle?: string
    display_order?: number
    is_active?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bts_videos')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update BTS video' }
  }
}

export async function deleteBtsVideo(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: video, error: fetchError } = await supabase
      .from('bts_videos')
      .select('video_url, poster_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    const urlsToClean = [video?.video_url, video?.poster_url].filter(Boolean)
    for (const mediaUrl of urlsToClean) {
      if (mediaUrl?.includes('supabase.co')) {
        try {
          const url = new URL(mediaUrl)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.indexOf('bts-videos')
          const filePath = bucketIndex >= 0
            ? pathParts.slice(bucketIndex + 1).join('/')
            : null
          if (filePath) {
            await supabase.storage.from('bts-videos').remove([filePath])
          }
        } catch {
          // skip storage cleanup on URL parse failure
        }
      }
    }

    const { error: deleteError } = await supabase
      .from('bts_videos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete BTS video' }
  }
}

export async function uploadBtsMedia(
  file: File,
  subfolder: 'videos' | 'posters'
): Promise<{ success: boolean; mediaUrl?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${subfolder}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('bts-videos')
      .upload(fileName, file, {
        cacheControl: '86400',
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage
      .from('bts-videos')
      .getPublicUrl(fileName)

    return { success: true, mediaUrl: urlData.publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload media' }
  }
}
