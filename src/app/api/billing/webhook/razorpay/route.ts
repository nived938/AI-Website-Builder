import { NextRequest, NextResponse } from "next/server";
import { paymentGatewayService } from "@/lib/billing/razorpay";
import { dbStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const isValid = paymentGatewayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle supported payment events
    if (event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const userId = notes.userId;
      const itemType = notes.itemType;
      const itemId = notes.itemId;

      if (userId && itemType === "credit_bundle") {
        const bundleCredits = parseInt(notes.credits || "1000", 10);
        dbStore.addCredits(
          userId,
          bundleCredits,
          "purchased",
          "purchase",
          `Razorpay Webhook: Captured payment ${paymentEntity.id}`,
          `webhook_pay_${paymentEntity.id}`
        );
      }
    } else if (event === "subscription.activated") {
      const subEntity = payload.payload?.subscription?.entity;
      const notes = subEntity?.notes || {};
      const userId = notes.userId;
      const planId = notes.planId;

      if (userId && planId) {
        dbStore.updateSubscription(userId, planId, "monthly", false);
      }
    }

    return NextResponse.json({ status: "processed" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
