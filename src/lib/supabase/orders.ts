import { supabase } from '../supabase'
import { CartItem } from '@/lib/features/carts/cartsSlice'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `ORD-${timestamp}-${random}`
}

// Look up product by title to get UUID
async function getProductIdByTitle(title: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('title', title)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.error('Error finding product by title:', error)
    return null
  }

  return data.id
}

// Look up variant by product, color, and size
async function getVariantId(
  productId: string,
  colorName: string,
  sizeName: string
): Promise<string | null> {
  const { data: colorData } = await supabase
    .from('colors')
    .select('id')
    .eq('name', colorName)
    .single()

  const { data: sizeData } = await supabase
    .from('sizes')
    .select('id')
    .eq('name', sizeName)
    .single()

  if (!colorData || !sizeData) {
    return null
  }

  const { data: variantData } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', productId)
    .eq('color_id', colorData.id)
    .eq('size_id', sizeData.id)
    .single()

  if (!variantData) {
    return null
  }

  return variantData.id
}

export interface CreateOrderData {
  cartItems: CartItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  subtotal: number
  discountAmount: number
  totalAmount: number
  userId?: string
}

export interface OrderResult {
  success: boolean
  orderId?: string
  orderNumber?: string
  error?: string
}

// Create COD order
export async function createCODOrder(data: CreateOrderData): Promise<OrderResult> {
  try {
    console.log('=== STARTING COD ORDER CREATION ===')
    console.log('Input data:', {
      userId: data.userId,
      cartItemsCount: data.cartItems.length,
      subtotal: data.subtotal,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
    })

    const orderNumber = generateOrderNumber()
    console.log('Generated order number:', orderNumber)

    // Check current auth user
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current auth user:', user ? user.id : 'NO USER (guest)')

    // Prepare shipping address
    const shippingAddress = {
      firstName: data.shippingInfo.firstName,
      lastName: data.shippingInfo.lastName,
      email: data.shippingInfo.email,
      phone: data.shippingInfo.phone,
      address: data.shippingInfo.address,
      city: data.shippingInfo.city,
      zipCode: data.shippingInfo.zipCode,
      country: data.shippingInfo.country,
    }

    const orderData = {
      user_id: data.userId || null,
      order_number: orderNumber,
      status: 'pending',
      subtotal: data.subtotal,
      discount_amount: data.discountAmount,
      shipping_amount: 0,
      tax_amount: 0,
      total_amount: data.totalAmount,
      shipping_address: shippingAddress,
      payment_method: data.paymentMethod,
      payment_status: 'pending',
    }

    console.log('Order data to insert:', orderData)
    console.log('user_id value:', orderData.user_id, '(type:', typeof orderData.user_id, ')')

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    console.log('Order insert result:', {
      order: order ? 'SUCCESS' : 'NULL',
      error: orderError ? {
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
        code: orderError.code,
      } : 'NO ERROR',
    })

    if (orderError || !order) {
      console.error('❌ ERROR creating order:', orderError)
      console.error('Full error object:', JSON.stringify(orderError, null, 2))
      return {
        success: false,
        error: orderError?.message || 'Failed to create order',
      }
    }

    console.log('✅ Order created successfully:', order.id)

    // Create order items
    console.log('=== CREATING ORDER ITEMS ===')
    const orderItems = []
    for (const cartItem of data.cartItems) {
      console.log(`Processing cart item: ${cartItem.name}`)
      // Try to find product by title
      const productId = await getProductIdByTitle(cartItem.name)
      console.log(`Product ID found: ${productId || 'NOT FOUND'}`)
      
      if (!productId) {
        console.warn(`⚠️ Product not found: ${cartItem.name}, skipping order item`)
        // Still create order item with snapshot data
        // Note: This will fail if product_id is required, so we'll skip for now
        continue
      }

      // Try to find variant
      const variantId = await getVariantId(
        productId,
        cartItem.attributes[1] || '', // color
        cartItem.attributes[0] || '' // size
      )

      // Calculate unit price and discount
      const unitPrice = cartItem.discount.percentage > 0
        ? cartItem.price - (cartItem.price * cartItem.discount.percentage) / 100
        : cartItem.discount.amount > 0
        ? cartItem.price - cartItem.discount.amount
        : cartItem.price

      const discountAmount = cartItem.discount.percentage > 0
        ? (cartItem.price * cartItem.discount.percentage) / 100
        : cartItem.discount.amount

      const totalPrice = unitPrice * cartItem.quantity

      orderItems.push({
        order_id: order.id,
        product_id: productId,
        variant_id: variantId,
        product_title: cartItem.name,
        product_image_url: cartItem.srcUrl,
        color_name: cartItem.attributes[1] || null,
        size_name: cartItem.attributes[0] || null,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        discount_amount: discountAmount * cartItem.quantity,
        total_price: totalPrice,
      })
    }

    // Insert order items
    console.log(`=== INSERTING ${orderItems.length} ORDER ITEMS ===`)
    if (orderItems.length > 0) {
      console.log('Order items to insert:', orderItems)
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      console.log('Order items insert result:', {
        error: itemsError ? {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
          code: itemsError.code,
        } : 'NO ERROR - Success',
      })

      if (itemsError) {
        console.error('❌ ERROR creating order items:', itemsError)
        console.error('Full error object:', JSON.stringify(itemsError, null, 2))
        // Order is created but items failed - this is a problem
        // We could delete the order or mark it as error
        return {
          success: false,
          error: itemsError.message || 'Failed to create order items',
        }
      }

      console.log('✅ Order items created successfully')
    } else {
      console.warn('⚠️ No order items to insert')
    }

    console.log('=== ORDER CREATION COMPLETE ===')
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION in createCODOrder:', error)
    console.error('Error stack:', error.stack)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

// Create PayFast order (similar to COD but for PayFast payment)
export async function createPayFastOrder(data: CreateOrderData): Promise<OrderResult> {
  try {
    console.log('=== STARTING PAYFAST ORDER CREATION ===')
    console.log('Input data:', {
      userId: data.userId,
      cartItemsCount: data.cartItems.length,
      subtotal: data.subtotal,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
    })

    const orderNumber = generateOrderNumber()
    console.log('Generated order number:', orderNumber)

    // Check current auth user
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current auth user:', user ? user.id : 'NO USER (guest)')

    // Prepare shipping address
    const shippingAddress = {
      firstName: data.shippingInfo.firstName,
      lastName: data.shippingInfo.lastName,
      email: data.shippingInfo.email,
      phone: data.shippingInfo.phone,
      address: data.shippingInfo.address,
      city: data.shippingInfo.city,
      zipCode: data.shippingInfo.zipCode,
      country: data.shippingInfo.country,
    }

    const orderData = {
      user_id: data.userId || null,
      order_number: orderNumber,
      status: 'pending',
      subtotal: data.subtotal,
      discount_amount: data.discountAmount,
      shipping_amount: 0,
      tax_amount: 0,
      total_amount: data.totalAmount,
      shipping_address: shippingAddress,
      payment_method: 'payfast',
      payment_status: 'pending',
    }

    console.log('Order data to insert:', orderData)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      console.error('❌ ERROR creating order:', orderError)
      return {
        success: false,
        error: orderError?.message || 'Failed to create order',
      }
    }

    console.log('✅ Order created successfully:', order.id)

    // Create order items
    const orderItems = []
    for (const cartItem of data.cartItems) {
      const productId = await getProductIdByTitle(cartItem.name)
      
      if (!productId) {
        console.warn(`⚠️ Product not found: ${cartItem.name}, skipping order item`)
        continue
      }

      const variantId = await getVariantId(
        productId,
        cartItem.attributes[1] || '', // color
        cartItem.attributes[0] || '' // size
      )

      const unitPrice = cartItem.discount.percentage > 0
        ? cartItem.price - (cartItem.price * cartItem.discount.percentage) / 100
        : cartItem.discount.amount > 0
        ? cartItem.price - cartItem.discount.amount
        : cartItem.price

      const discountAmount = cartItem.discount.percentage > 0
        ? (cartItem.price * cartItem.discount.percentage) / 100
        : cartItem.discount.amount

      const totalPrice = unitPrice * cartItem.quantity

      orderItems.push({
        order_id: order.id,
        product_id: productId,
        variant_id: variantId,
        product_title: cartItem.name,
        product_image_url: cartItem.srcUrl,
        color_name: cartItem.attributes[1] || null,
        size_name: cartItem.attributes[0] || null,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        discount_amount: discountAmount * cartItem.quantity,
        total_price: totalPrice,
      })
    }

    // Insert order items
    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('❌ ERROR creating order items:', itemsError)
        return {
          success: false,
          error: itemsError.message || 'Failed to create order items',
        }
      }

      console.log('✅ Order items created successfully')
    }

    console.log('=== PAYFAST ORDER CREATION COMPLETE ===')
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION in createPayFastOrder:', error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

// Update order payment status
export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  orderStatus?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      payment_status: paymentStatus,
    };

    // Update order status if provided
    if (orderStatus) {
      updateData.status = orderStatus;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order payment status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update order status',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception updating order payment status:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

// Find order by ID or order number
export async function findOrderByIdOrNumber(
  orderId?: string,
  orderNumber?: string
): Promise<{ id: string; order_number: string; total_amount: number } | null> {
  try {
    let query = supabase.from('orders').select('id, order_number, total_amount');

    if (orderId) {
      query = query.eq('id', orderId);
    } else if (orderNumber) {
      query = query.eq('order_number', orderNumber);
    } else {
      return null;
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.error('Error finding order:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Exception finding order:', error);
    return null;
  }
}

// Get order details by order number (for client-side use)
export async function getOrderByNumber(
  orderNumber: string
): Promise<{
  id: string;
  order_number: string;
  payment_method: string | null;
  payment_status: string;
  status: string;
  total_amount: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, payment_method, payment_status, status, total_amount')
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    console.error('Exception fetching order:', error);
    return null;
  }
}

