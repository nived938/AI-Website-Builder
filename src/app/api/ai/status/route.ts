import { NextResponse } from "next/server";
import { ollamaClient } from "@/lib/ai/ollama";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await ollamaClient.checkHealth();
    const env = getEnv();

    return NextResponse.json({
      status: "ok",
      health,
      config: {
        baseUrl: env.OLLAMA_BASE_URL,
        model: env.OLLAMA_MODEL || "(Not configured in .env.local)",
        numCtx: env.OLLAMA_NUM_CTX,
        temperature: env.OLLAMA_TEMPERATURE,
        timeoutMs: env.OLLAMA_TIMEOUT_MS,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: "error",
        error: msg,
      },
      { status: 500 }
    );
  }
}
