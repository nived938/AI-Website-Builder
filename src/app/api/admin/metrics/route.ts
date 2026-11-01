import { NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { ollamaClient } from "@/lib/ai/ollama";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = dbStore.getAdminMetrics();
    const health = await ollamaClient.checkHealth();

    return NextResponse.json({
      metrics,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
