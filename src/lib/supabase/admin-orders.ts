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

// Get all orders for admin
export async function getAllAdminOrders(
  statusFilter?: OrderStatus | 'all'
): Promise<AdminOrder[]> {
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

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
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

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
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

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

// Get order statistics
export async function getOrderStats(): Promise<{
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')

    if (error) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
      }
    }

    const orders = data || []
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      refunded: orders.filter((o) => o.status === 'refunded').length,
    }
  } catch (error) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    }
  }
}

