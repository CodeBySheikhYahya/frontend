import { supabase } from '../supabase'

export interface NewsletterSubscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all newsletter subscribers (with pagination)
 */
export async function getAllNewsletterSubscribers(
  limit: number = 50,
  offset: number = 0
): Promise<NewsletterSubscriber[]> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return []
    }

    return (data || []) as NewsletterSubscriber[]
  } catch (error) {
    return []
  }
}

/**
 * Get active newsletter subscribers count
 */
export async function getActiveSubscribersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      return 0
    }

    return count || 0
  } catch (error) {
    return 0
  }
}

/**
 * Unsubscribe a user (set is_active to false)
 */
export async function unsubscribeSubscriber(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unsubscribe' }
  }
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriber(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete subscriber' }
  }
}
