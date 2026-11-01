import { NextRequest, NextResponse } from "next/server";
import { paymentGatewayService } from "@/lib/billing/razorpay";
import { dbStore } from "@/lib/db/store";
import { CREDIT_BUNDLES, PLANS } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      paymentId,
      signature,
      itemType,
      itemId,
      billingCycle = "monthly",
      userId = "usr_alex_vance",
    } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "orderId, paymentId, and signature are required for payment verification." },
        { status: 400 }
      );
    }

    // 1. Verify Payment Signature
    const isValid = paymentGatewayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid cryptographic signature." },
        { status: 400 }
      );
    }

    const isTestMode = paymentGatewayService.getMode() === "TEST";

    // 2. Apply Entitlements
    if (itemType === "subscription") {
      const plan = PLANS[itemId];
      if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      dbStore.updateSubscription(
        userId,
        itemId as "FREE" | "STARTER" | "PRO" | "ULTIMATE",
        billingCycle,
        isTestMode
      );
    } else if (itemType === "credit_bundle") {
      const bundle = CREDIT_BUNDLES.find((b) => b.id === itemId);
      if (!bundle) return NextResponse.json({ error: "Invalid credit bundle" }, { status: 400 });

      dbStore.addCredits(
        userId,
        bundle.credits,
        "purchased",
        "purchase",
        `Purchased ${bundle.name} ${isTestMode ? "(Simulated Test Mode)" : ""}`,
        `topup_${paymentId}`
      );
    }

    const updatedAccount = dbStore.getCreditAccount(userId);
    const updatedSub = dbStore.getSubscription(userId);

    return NextResponse.json({
      success: true,
      isSimulated: isTestMode,
      message: isTestMode
        ? "Simulated payment verified successfully! Entitlements applied."
        : "Payment verified successfully! Plan activated.",
      creditAccount: updatedAccount,
      subscription: updatedSub,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
