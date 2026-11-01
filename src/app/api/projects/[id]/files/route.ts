import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { rateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const files = dbStore.getProjectFiles(id);
    return NextResponse.json({ files });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { path: filePath, content, userId = "usr_alex_vance" } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: "File path and content are required" }, { status: 400 });
    }

    // Rate limit saves
    const rateCheck = await rateLimiter.checkRateLimit("project_save", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Save rate limit exceeded. Retry in ${rateCheck.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const savedFile = dbStore.saveProjectFile(id, filePath, content);
    return NextResponse.json({ file: savedFile }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
