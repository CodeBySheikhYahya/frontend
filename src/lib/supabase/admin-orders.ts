import { supabase } from '../supabase'
import { getOrderDetailsById } from './orders'

// Order status types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Admin order interface
export interface AdminOrder {
  id: string
  order_number: string
  status: OrderStatus
  payment_method: string | null
  payment_status: PaymentStatus
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total_amount: number
  shipping_address: any
  billing_address: any | null
  created_at: string
  updated_at: string
  user_id: string | null
  notes: string | null
}

// Get all orders for admin (with pagination)
export async function getAllAdminOrders(
  statusFilter?: OrderStatus | 'all',
  limit: number = 50,
  offset: number = 0
): Promise<AdminOrder[]> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      return []
    }

    return (data || []) as AdminOrder[]
  } catch (error) {
    return []
  }
}

// Get order by ID for admin (with full details)
export async function getAdminOrderById(orderId: string) {
  return await getOrderDetailsById(orderId)
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update order status' }
  }
}

// Update payment status
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payment status' }
  }
}

// Update order notes
export async function updateOrderNotes(
  orderId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update order notes' }
  }
}

// Get order statistics using parallel count queries instead of full table scan
export async function getOrderStats(): Promise<{
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}> {
  const zero = { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 }

  try {
    const countQuery = (status?: OrderStatus) => {
      let q = supabase.from('orders').select('*', { count: 'exact', head: true })
      if (status) q = q.eq('status', status)
      return q
    }

    const [total, pending, processing, shipped, delivered, cancelled, refunded] =
      await Promise.all([
        countQuery(),
        countQuery('pending'),
        countQuery('processing'),
        countQuery('shipped'),
        countQuery('delivered'),
        countQuery('cancelled'),
        countQuery('refunded'),
      ])

    return {
      total: total.count ?? 0,
      pending: pending.count ?? 0,
      processing: processing.count ?? 0,
      shipped: shipped.count ?? 0,
      delivered: delivered.count ?? 0,
      cancelled: cancelled.count ?? 0,
      refunded: refunded.count ?? 0,
    }
  } catch (error) {
    return zero
  }
}

