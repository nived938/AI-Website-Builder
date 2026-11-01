import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, reason } = body;

    if (!userId || amount === undefined || !reason) {
      return NextResponse.json(
        { error: "userId, amount, and reason are required for admin credit adjustment." },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return NextResponse.json({ error: "Amount must be a valid number" }, { status: 400 });
    }

    let updatedAccount;
    if (numAmount >= 0) {
      updatedAccount = dbStore.addCredits(
        userId,
        numAmount,
        "purchased",
        "admin_adjustment",
        `Admin credit adjustment: ${reason}`,
        `admin_${Date.now()}`
      );
    } else {
      updatedAccount = dbStore.deductCredits(
        userId,
        Math.abs(numAmount),
        `Admin credit deduction: ${reason}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Adjusted ${numAmount} credits for user ${userId}.`,
      creditAccount: updatedAccount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
