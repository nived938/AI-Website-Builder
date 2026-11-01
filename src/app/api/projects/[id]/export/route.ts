import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { dbStore } from "@/lib/db/store";
import { rateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_alex_vance";

    // Rate limit exports
    const rateCheck = await rateLimiter.checkRateLimit("export", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Export rate limit exceeded. Retry in ${rateCheck.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const project = dbStore.getProject(id, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const files = dbStore.getProjectFiles(id);
    if (files.length === 0) {
      return NextResponse.json({ error: "Project contains no files to export" }, { status: 400 });
    }

    const zip = new JSZip();
    for (const f of files) {
      zip.file(f.path, f.content);
    }

    // Include VEYRA metadata readme
    zip.file(
      "VEYRA_METADATA.json",
      JSON.stringify(
        {
          projectName: project.name,
          framework: project.framework,
          exportedAt: new Date().toISOString(),
          generatedWith: "VEYRA Studio — Your idea, built for the web",
        },
        null,
        2
      )
    );

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const safeSlug = project.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return new Response(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeSlug}-source.zip"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
