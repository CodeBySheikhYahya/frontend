import { NextRequest, NextResponse } from 'next/server';
import { createPayFastOrder } from '@/lib/supabase/orders';
import { buildPaymentData, getPayFastUrl, buildFormData } from '@/lib/payfast';
import { CartItem } from '@/lib/features/carts/cartsSlice';

interface InitiatePaymentRequest {
  cartItems: CartItem[];
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: InitiatePaymentRequest = await request.json();

    // Validate required fields
    if (!body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!body.shippingInfo || !body.totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required information' },
        { status: 400 }
      );
    }

    // Create pending order in database
    const orderResult = await createPayFastOrder({
      cartItems: body.cartItems,
      shippingInfo: body.shippingInfo,
      paymentMethod: 'payfast',
      subtotal: body.subtotal,
      discountAmount: body.discountAmount,
      totalAmount: body.totalAmount,
      userId: body.userId,
    });

    if (!orderResult.success || !orderResult.orderId || !orderResult.orderNumber) {
      return NextResponse.json(
        { success: false, error: orderResult.error || 'Failed to create order' },
        { status: 500 }
      );
    }

    // Get base URL for callback URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    request.headers.get('origin') || 
                    'http://localhost:3000';

    // Build item name from cart items
    const itemNames = body.cartItems.map(item => item.name).join(', ');
    const itemName = body.cartItems.length === 1 
      ? itemNames 
      : `${body.cartItems.length} items`;

    // Generate PayFast payment data
    const paymentData = buildPaymentData({
      amount: body.totalAmount,
      itemName: itemName,
      itemDescription: itemNames.length > 100 ? itemNames.substring(0, 100) + '...' : itemNames,
      firstName: body.shippingInfo.firstName,
      lastName: body.shippingInfo.lastName,
      email: body.shippingInfo.email,
      phone: body.shippingInfo.phone,
      returnUrl: `${baseUrl}/payment/success?orderNumber=${orderResult.orderNumber}`,
      cancelUrl: `${baseUrl}/payment/failure?orderNumber=${orderResult.orderNumber}`,
      notifyUrl: `${baseUrl}/api/payfast/callback`,
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
    });

    // Log payment data for debugging (remove sensitive data in production)
    console.log('PayFast Payment Data:', {
      merchant_id: paymentData.merchant_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      item_name: paymentData.item_name,
      email: paymentData.email_address,
      return_url: paymentData.return_url,
      signature: paymentData.signature?.substring(0, 10) + '...',
    });

    // Get PayFast payment URL
    const payFastUrl = getPayFastUrl();

    // Return payment URL and payment data (frontend will build form)
    // Don't URL-encode here - let the form handle encoding naturally
    return NextResponse.json({
      success: true,
      paymentUrl: payFastUrl,
      paymentData: paymentData, // Send raw data object
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
    });

  } catch (error: any) {
    console.error('Error initiating PayFast payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

