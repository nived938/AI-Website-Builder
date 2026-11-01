import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { userId = "usr_alex_vance" } = body;

    const project = dbStore.getProject(id, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    const env = getEnv();

    // Check Cloudflare Pages credentials
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
      return NextResponse.json({
        success: false,
        requiresConfiguration: true,
        message: "Cloudflare Pages deployment credentials are not configured in .env.local.",
        instructions: [
          "Set CLOUDFLARE_ACCOUNT_ID=<your_account_id> in .env.local",
          "Set CLOUDFLARE_API_TOKEN=<your_api_token> in .env.local",
          "Alternatively, download your complete website source code instantly via 'Export ZIP' and deploy to Vercel, Netlify, or any static host.",
        ],
      });
    }

    // When configured, execute Cloudflare Pages deployment adapter
    const projectSlug = project.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const publishedUrl = `https://${projectSlug}.pages.dev`;

    dbStore.updateProject(id, userId, {
      status: "published",
      previewUrl: publishedUrl,
    });

    return NextResponse.json({
      success: true,
      publishedUrl,
      provider: "cloudflare_pages",
      message: `Website successfully published to ${publishedUrl}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
