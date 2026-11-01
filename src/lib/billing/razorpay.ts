import crypto from "crypto";
import { getEnv } from "@/lib/env";

export interface CreateOrderParams {
  amountINR: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  isSimulated: boolean;
}

export class PaymentGatewayService {
  private isTestMode: boolean;
  private keyId?: string;
  private keySecret?: string;
  private webhookSecret?: string;

  constructor() {
    const env = getEnv();
    this.isTestMode = env.TEST === "YES";
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  }

  getMode(): "TEST" | "LIVE" {
    return this.isTestMode ? "TEST" : "LIVE";
  }

  /**
   * Creates an order for Razorpay or generates a simulated order if TEST=YES.
   */
  async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
    if (this.isTestMode) {
      // Return simulated test order immediately
      const testOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        orderId: testOrderId,
        amount: params.amountINR * 100, // in paise
        currency: params.currency || "INR",
        isSimulated: true,
      };
    }

    // LIVE Mode: Check Razorpay credentials
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local, or set TEST=YES for simulated payments."
      );
    }

    try {
      const basicAuth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount: Math.round(params.amountINR * 100), // in paise
          currency: params.currency || "INR",
          receipt: params.receipt,
          notes: params.notes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Razorpay Order creation failed: ${JSON.stringify(errorData)}`);
      }

      const orderData = (await res.json()) as { id: string; amount: number; currency: string };
      return {
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        isSimulated: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Payment gateway order error: ${msg}`);
    }
  }

  /**
   * Verifies Razorpay payment signature using HMAC SHA256.
   * If in TEST=YES mode, validates simulated payment signature.
   */
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (this.isTestMode) {
      // In TEST mode, valid if orderId is a simulated order and signature contains 'simulated'
      return params.orderId.startsWith("order_sim_") && params.signature.includes("simulated_sig");
    }

    if (!this.keySecret) {
      throw new Error("Cannot verify signature: RAZORPAY_KEY_SECRET is not configured.");
    }

    const body = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === params.signature;
  }

  /**
   * Verifies incoming webhook signature from Razorpay.
   */
  verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
    if (this.isTestMode) {
      return true;
    }

    if (!this.webhookSecret) {
      console.warn("⚠️ RAZORPAY_WEBHOOK_SECRET not set; webhook validation skipped.");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    return expectedSignature === webhookSignature;
  }
}

export const paymentGatewayService = new PaymentGatewayService();
