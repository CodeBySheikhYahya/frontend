import crypto from 'crypto';

/**
 * PayFast Configuration
 * These values should come from environment variables
 */
const PAYFAST_CONFIG = {
  merchantId: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '',
  saltPassphrase: process.env.PAYFAST_SALT_PASSPHRASE || '',
  sandboxUrl: process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_URL || 'https://sandbox.payfast.co.za/eng/process',
  productionUrl: 'https://www.payfast.co.za/eng/process',
};

/**
 * Format amount for PayFast
 * PayFast requires amounts as strings with 2 decimal places
 * Example: 100.50 -> "100.50"
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Generate PayFast payment signature
 * 
 * PayFast signature process:
 * 1. Sort all parameters alphabetically by key
 * 2. Create query string: key1=value1&key2=value2
 * 3. Append passphrase if provided
 * 4. Create MD5 hash of the result
 * 
 * @param data - Payment data object
 * @returns MD5 signature string
 */
export function generateSignature(data: Record<string, string>): string {
  // Remove signature and empty values from data
  const cleanData: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== 'signature' && value !== '' && value !== null && value !== undefined) {
      cleanData[key] = String(value);
    }
  }

  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(cleanData).sort();

  // Build query string
  const queryString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(cleanData[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Append passphrase if provided
  const stringToHash = PAYFAST_CONFIG.saltPassphrase
    ? `${queryString}&passphrase=${encodeURIComponent(PAYFAST_CONFIG.saltPassphrase)}`
    : queryString;

  // Generate MD5 hash
  const signature = crypto.createHash('md5').update(stringToHash).digest('hex');

  return signature;
}

/**
 * Payment data interface for PayFast
 */
export interface PayFastPaymentData {
  // Required fields
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  cell_number?: string;
  amount: string;
  item_name: string;
  
  // Optional fields
  item_description?: string;
  custom_int1?: string; // Order ID
  custom_str1?: string; // Order number
  custom_str2?: string; // Additional data
  
  // Signature (generated)
  signature?: string;
}

/**
 * Build PayFast payment data object
 * 
 * @param params - Payment parameters
 * @returns Complete PayFast payment data object with signature
 */
export function buildPaymentData(params: {
  amount: number;
  itemName: string;
  itemDescription?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  orderId?: string;
  orderNumber?: string;
}): PayFastPaymentData {
  const paymentData: PayFastPaymentData = {
    // Merchant credentials
    merchant_id: PAYFAST_CONFIG.merchantId,
    merchant_key: PAYFAST_CONFIG.merchantKey,
    
    // Payment details
    amount: formatAmount(params.amount),
    item_name: params.itemName,
    
    // Customer information
    name_first: params.firstName,
    name_last: params.lastName,
    email_address: params.email,
    
    // URLs
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    
    // Optional fields
    ...(params.itemDescription && { item_description: params.itemDescription }),
    ...(params.phone && { cell_number: params.phone }),
    ...(params.orderId && { custom_int1: params.orderId }),
    ...(params.orderNumber && { custom_str1: params.orderNumber }),
  };

  // Generate and add signature
  paymentData.signature = generateSignature(paymentData);

  return paymentData;
}

/**
 * Verify PayFast callback signature
 * Used to verify ITN (Instant Transaction Notification) callbacks
 * 
 * @param data - Callback data from PayFast
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(data: Record<string, string>): boolean {
  const receivedSignature = data.signature;
  if (!receivedSignature) {
    return false;
  }

  // Generate expected signature
  const expectedSignature = generateSignature(data);

  // Compare signatures (case-insensitive)
  return receivedSignature.toLowerCase() === expectedSignature.toLowerCase();
}

/**
 * Get PayFast payment URL (sandbox or production)
 */
export function getPayFastUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production' && !PAYFAST_CONFIG.sandboxUrl.includes('sandbox');
  return isProduction ? PAYFAST_CONFIG.productionUrl : PAYFAST_CONFIG.sandboxUrl;
}

/**
 * Build PayFast payment form data as URL-encoded string
 * Used for redirecting to PayFast
 * 
 * @param paymentData - Payment data object
 * @returns URL-encoded form data string
 */
export function buildFormData(paymentData: PayFastPaymentData): string {
  const formData = new URLSearchParams();
  
  for (const [key, value] of Object.entries(paymentData)) {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  }
  
  return formData.toString();
}

