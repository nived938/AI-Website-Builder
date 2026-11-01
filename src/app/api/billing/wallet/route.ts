import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { PLANS } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_alex_vance";

    const creditAccount = dbStore.getCreditAccount(userId);
    const subscription = dbStore.getSubscription(userId);
    const ledger = dbStore.getLedger(userId);
    const currentPlan = PLANS[subscription.planId] || PLANS.FREE;

    // Calculate time until next 00:00 UTC reset
    const now = new Date();
    const nextUtcReset = new Date();
    nextUtcReset.setUTCHours(24, 0, 0, 0);
    const msUntilReset = nextUtcReset.getTime() - now.getTime();
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      creditAccount,
      subscription: {
        ...subscription,
        planName: currentPlan.name,
        monthlyCredits: currentPlan.monthlyCredits,
        allowedEffort: currentPlan.allowedEffortLevels,
      },
      ledger,
      resetCountdown: {
        hours,
        minutes,
        formatted: `${hours}h ${minutes}m`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
