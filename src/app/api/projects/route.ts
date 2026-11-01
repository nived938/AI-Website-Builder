import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { rateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_alex_vance";

    const projects = dbStore.getProjects(userId);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description = "", framework = "html", userId = "usr_alex_vance" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Rate limit project creation
    const rateCheck = await rateLimiter.checkRateLimit("project_create", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Project creation rate limit reached. Retry in ${rateCheck.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const project = dbStore.createProject(userId, name, description, framework);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
