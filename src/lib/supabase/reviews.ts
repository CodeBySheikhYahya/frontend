import { supabase } from '../supabase'
import { Review } from '@/types/review.types'

// Transform Supabase review to match your Review type
function transformReview(dbReview: any): Review {
  return {
    id: dbReview.id,
    user: dbReview.user_name,
    content: dbReview.content,
    rating: dbReview.rating,
    date: new Date(dbReview.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  }
}

// Get reviews for homepage (featured reviews)
export async function getFeaturedReviews(limit: number = 3): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_approved', true)
    .order('helpful_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return (data || []).map(transformReview)
}

// Get reviews for a product
export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching product reviews:', error)
    return []
  }

  return (data || []).map(transformReview)
}






