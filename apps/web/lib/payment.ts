import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface InitializePaymentParams {
  email: string;
  amount: number; // Amount in kobo (multiply naira by 100)
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  channels?: string[]; // Payment channels: card, bank, ussd, qr, mobile_money, bank_transfer
}

interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Initialize a Paystack payment
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
        channels: params.channels, // Specify which payment methods to show
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to initialize payment"
    );
  }
}

interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    fees: number;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
  };
}

/**
 * Verify a Paystack payment
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to verify payment"
    );
  }
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `CHW-${userId.substring(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Convert naira to kobo (Paystack uses kobo)
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert kobo to naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}
