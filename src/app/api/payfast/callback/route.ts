import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/payfast';
import { updateOrderPaymentStatus, findOrderByIdOrNumber } from '@/lib/supabase/orders';

/**
 * PayFast ITN (Instant Transaction Notification) Callback Handler
 * 
 * PayFast sends payment notifications to this endpoint after payment processing.
 * We need to:
 * 1. Parse the ITN data
 * 2. Verify the signature
 * 3. Update order status based on payment_status
 * 4. Return "VALID" or "INVALID" response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from PayFast ITN
    // PayFast sends data as application/x-www-form-urlencoded
    const formData = await request.formData();
    
    // Convert FormData to object
    const itnData: Record<string, string> = {};
    formData.forEach((value, key) => {
      itnData[key] = value.toString();
    });

    console.log('=== PAYFAST ITN RECEIVED ===');
    console.log('ITN Data:', itnData);

    // Verify signature
    const isValidSignature = verifySignature(itnData);
    
    if (!isValidSignature) {
      console.error('❌ Invalid signature in ITN');
      return new NextResponse('INVALID', { status: 200 });
    }

    console.log('✅ Signature verified');

    // Get order identifier from ITN
    // PayFast sends our order ID in custom_int1 and order number in custom_str1
    const orderId = itnData.custom_int1;
    const orderNumber = itnData.custom_str1;
    const paymentStatus = itnData.payment_status;
    const amountGross = parseFloat(itnData.amount_gross || '0');

    if (!orderId && !orderNumber) {
      console.error('❌ No order identifier found in ITN');
      return new NextResponse('INVALID', { status: 200 });
    }

    // Find the order
    const order = await findOrderByIdOrNumber(orderId, orderNumber);
    
    if (!order) {
      console.error('❌ Order not found:', { orderId, orderNumber });
      return new NextResponse('INVALID', { status: 200 });
    }

    console.log('✅ Order found:', order.id);

    // Verify amount matches (with small tolerance for floating point)
    const expectedAmount = parseFloat(order.total_amount.toString());
    const amountDifference = Math.abs(amountGross - expectedAmount);
    
    if (amountDifference > 0.01) {
      console.error('❌ Amount mismatch:', {
        expected: expectedAmount,
        received: amountGross,
        difference: amountDifference,
      });
      // Still update order but mark as failed due to amount mismatch
      await updateOrderPaymentStatus(order.id, 'failed');
      return new NextResponse('INVALID', { status: 200 });
    }

    // Update order based on payment status
    // PayFast payment_status values: COMPLETE, FAILED, CANCELLED, etc.
    let orderPaymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    let orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | undefined = undefined;

    switch (paymentStatus?.toUpperCase()) {
      case 'COMPLETE':
        orderPaymentStatus = 'paid';
        orderStatus = 'processing'; // Move to processing after payment
        console.log('✅ Payment completed successfully');
        break;
      
      case 'FAILED':
      case 'CANCELLED':
        orderPaymentStatus = 'failed';
        orderStatus = 'cancelled';
        console.log('❌ Payment failed or cancelled');
        break;
      
      case 'REFUNDED':
        orderPaymentStatus = 'refunded';
        orderStatus = 'refunded';
        console.log('⚠️ Payment refunded');
        break;
      
      default:
        console.log('⚠️ Unknown payment status:', paymentStatus);
        // Keep as pending for unknown statuses
        break;
    }

    // Update order in database
    const updateResult = await updateOrderPaymentStatus(
      order.id,
      orderPaymentStatus,
      orderStatus
    );

    if (!updateResult.success) {
      console.error('❌ Failed to update order status:', updateResult.error);
      return new NextResponse('INVALID', { status: 200 });
    }

    console.log('✅ Order status updated:', {
      orderId: order.id,
      paymentStatus: orderPaymentStatus,
      orderStatus: orderStatus,
    });

    // PayFast expects plain text response: "VALID" or "INVALID"
    return new NextResponse('VALID', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error: any) {
    console.error('❌ Exception in PayFast callback:', error);
    console.error('Error stack:', error.stack);
    
    // Return INVALID on error
    return new NextResponse('INVALID', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

// Handle GET requests (PayFast may ping the URL to verify it exists)
export async function GET() {
  return new NextResponse('PayFast ITN endpoint is active', { status: 200 });
}

