import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { PLANS } from "@/lib/billing/plans";
import { rateLimiter } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  // Documents
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const userId = (formData.get("userId") as string) || "usr_alex_vance";

    if (!file || !projectId) {
      return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
    }

    // Rate limiting check
    const rateCheck = await rateLimiter.checkRateLimit("file_upload", userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Upload rate limit reached. Retry in ${rateCheck.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    // 1. MIME Validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type '${file.type}'. Allowed: PNG, JPEG, WebP, AVIF, PDF, TXT, MD, CSV, JSON.`,
        },
        { status: 400 }
      );
    }

    // 2. Plan Entitlement & Storage Quota
    const subscription = dbStore.getSubscription(userId);
    const plan = PLANS[subscription.planId] || PLANS.FREE;

    const maxFileSize = plan.maxUploadSizeMB * 1024 * 1024;
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds your plan limit of ${plan.maxUploadSizeMB}MB. Upgrade your plan for larger uploads.`,
        },
        { status: 413 }
      );
    }

    const currentAssets = dbStore.getAssets(projectId);
    if (subscription.planId === "FREE" && currentAssets.length >= 5) {
      return NextResponse.json(
        {
          error: "Free plan allows a maximum of 5 uploaded files per project. Please upgrade to Pro for higher asset quotas.",
        },
        { status: 403 }
      );
    }

    // 3. Extract text for documents
    let extractedText = "";
    if (
      file.type === "text/plain" ||
      file.type === "text/markdown" ||
      file.type === "text/csv" ||
      file.type === "application/json"
    ) {
      extractedText = await file.text();
    }

    // Save asset record
    const asset = dbStore.saveAsset(projectId, userId, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: `/uploads/${file.name}`,
    });

    return NextResponse.json({
      success: true,
      asset,
      extractedSnippet: extractedText ? extractedText.slice(0, 300) : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
