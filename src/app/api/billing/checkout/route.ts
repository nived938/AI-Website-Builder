import { NextRequest, NextResponse } from "next/server";
import { paymentGatewayService } from "@/lib/billing/razorpay";
import { PLANS, CREDIT_BUNDLES } from "@/lib/billing/plans";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemType, itemId, billingCycle = "monthly", userId = "usr_alex_vance" } = body;

    // Rate limit payment checkout attempts
    const rateCheck = await rateLimiter.checkRateLimit("payment_create", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Payment creation rate limit exceeded. Retry in ${rateCheck.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    let amountINR = 0;
    let description = "";

    if (itemType === "subscription") {
      const plan = PLANS[itemId];
      if (!plan) return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
      amountINR = billingCycle === "annual" ? plan.annualPriceINR : plan.monthlyPriceINR;
      description = `Subscription to ${plan.name} (${billingCycle})`;
    } else if (itemType === "credit_bundle") {
      const bundle = CREDIT_BUNDLES.find((b) => b.id === itemId);
      if (!bundle) return NextResponse.json({ error: "Invalid credit bundle" }, { status: 400 });
      amountINR = bundle.priceINR;
      description = `Purchase ${bundle.name}`;
    } else {
      return NextResponse.json({ error: "Invalid itemType (must be subscription or credit_bundle)" }, { status: 400 });
    }

    const env = getEnv();
    const orderResult = await paymentGatewayService.createOrder({
      amountINR,
      currency: "INR",
      receipt: `rcpt_${userId}_${Date.now()}`,
      notes: { userId, itemType, itemId, billingCycle },
    });

    return NextResponse.json({
      order: orderResult,
      isTestMode: env.TEST === "YES",
      description,
      amountINR,
      razorpayKeyId: env.TEST === "NO" ? env.RAZORPAY_KEY_ID : "rzp_test_simulated_key",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
