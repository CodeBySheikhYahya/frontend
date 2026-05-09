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
    return null
  }

  return data.id
}

// Look up variant by product, color, and size (parallel color+size lookup)
async function getVariantId(
  productId: string,
  colorName: string,
  sizeName: string
): Promise<string | null> {
  const [{ data: colorData }, { data: sizeData }] = await Promise.all([
    supabase.from('colors').select('id').eq('name', colorName).single(),
    supabase.from('sizes').select('id').eq('name', sizeName).single(),
  ])

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

  return variantData?.id ?? null
}

export interface CreateOrderData {
  cartItems: CartItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    apartment?: string
    city: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  transactionId?: string
  /** Full payment notes (confirmation, trace, receipt filename, etc.). Overrides default from `transactionId` when set. */
  orderNotes?: string | null
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
    const orderNumber = generateOrderNumber()

    // Check current auth user
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare shipping address
    const shippingAddress = {
      firstName: data.shippingInfo.firstName,
      lastName: data.shippingInfo.lastName,
      email: data.shippingInfo.email,
      phone: data.shippingInfo.phone,
      address: data.shippingInfo.address,
      ...(data.shippingInfo.apartment && { apartment: data.shippingInfo.apartment }),
      city: data.shippingInfo.city,
      zipCode: data.shippingInfo.zipCode,
      country: data.shippingInfo.country,
    }

    let orderNotes: string | null = null;
    if (data.orderNotes != null && String(data.orderNotes).trim() !== "") {
      orderNotes = String(data.orderNotes).trim();
    } else if (data.transactionId) {
      orderNotes = `Transaction ID: ${data.transactionId}`;
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
      notes: orderNotes,
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      return {
        success: false,
        error: orderError?.message || 'Failed to create order',
      }
    }

    // Resolve product IDs and variant IDs in parallel
    const resolvedItems = await Promise.all(
      data.cartItems.map(async (cartItem) => {
        let productId: string | null = cartItem.productId || null
        if (!productId) {
          productId = await getProductIdByTitle(cartItem.name)
        }

        let variantId: string | null = null
        if (productId) {
          variantId = await getVariantId(
            productId,
            cartItem.attributes[1] || '',
            cartItem.attributes[0] || ''
          )
        }

        return { cartItem, productId, variantId }
      })
    )

    const orderItems = []
    const failedItems: string[] = []
    const variantsToDestock: Array<{ variantId: string; quantity: number }> = []

    for (const { cartItem, productId, variantId } of resolvedItems) {
      if (!productId) {
        failedItems.push(cartItem.name)
        continue
      }

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

      if (variantId) {
        variantsToDestock.push({ variantId, quantity: cartItem.quantity })
      }
    }

    if (orderItems.length === 0) {
      await supabase.from('orders').delete().eq('id', order.id)
      return {
        success: false,
        error: `Failed to create order items. Products not found: ${failedItems.join(', ')}`,
      }
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      return {
        success: false,
        error: itemsError.message || 'Failed to create order items',
      }
    }

    // Reduce stock in parallel using cached variant IDs
    await Promise.all(
      variantsToDestock.map(async ({ variantId, quantity }) => {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single()

        if (variant) {
          const newStock = Math.max(0, (variant.stock_quantity || 0) - quantity)
          await supabase
            .from('product_variants')
            .update({ stock_quantity: newStock })
            .eq('id', variantId)
        }
      })
    )
    
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    }
  } catch (error: any) {
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
      return {
        success: false,
        error: error.message || 'Failed to update order status',
      };
    }

    return { success: true };
  } catch (error: any) {
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
      return null;
    }

    return data;
  } catch (error: any) {
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
  notes: string | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, payment_method, payment_status, status, total_amount, notes')
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error: any) {
    return null;
  }
}

// Get full order details with items by order ID
export async function getOrderDetailsById(
  orderId: string
): Promise<{
  id: string;
  order_number: string;
  status: string;
  payment_method: string | null;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    product_title: string;
    product_image_url: string | null;
    color_name: string | null;
    size_name: string | null;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
  }>;
} | null> {
  try {
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return null;
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id, product_title, product_image_url, color_name, size_name, quantity, unit_price, discount_amount, total_price')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      return null;
    }

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      shipping_amount: order.shipping_amount,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes || null,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: items || [],
    };
  } catch (error: any) {
    return null;
  }
}

// Get full order details with items by order number (alternative to ID)
export async function getOrderDetailsByNumber(
  orderNumber: string
): Promise<{
  id: string;
  order_number: string;
  status: string;
  payment_method: string | null;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address: any;
  created_at: string;
  items: Array<{
    id: string;
    product_title: string;
    product_image_url: string | null;
    color_name: string | null;
    size_name: string | null;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
  }>;
} | null> {
  try {
    // First get order by order number to get the ID
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !orderData) {
      return null;
    }

    // Then get full details using the ID
    return await getOrderDetailsById(orderData.id);
  } catch (error: any) {
    return null;
  }
}

