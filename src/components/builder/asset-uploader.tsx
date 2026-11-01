"use client";

import { useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface AssetUploaderProps {
  projectId: string;
  onAssetUploaded?: () => void;
}

export function AssetUploader({ projectId, onAssetUploaded }: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadStatus("Uploading and analyzing asset...");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `Upload failed (HTTP ${res.status})`);
        }

        const data = await res.json();
        setUploadStatus(`Uploaded: ${file.name}`);
        onAssetUploaded?.();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    }

    setIsUploading(false);
  };

  return (
    <div className="p-4 space-y-4 text-xs font-sans text-porcelain">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <UploadCloud className="h-4 w-4 text-mint" />
        <h3 className="font-bold text-sm text-porcelain">Asset & Document Library</h3>
      </div>

      {/* Upload Dropzone */}
      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-graphite-200/50 hover:bg-graphite-200 hover:border-mint/50 cursor-pointer transition">
        <UploadCloud className="h-8 w-8 text-mint mb-2 animate-bounce" />
        <span className="font-semibold text-xs text-porcelain">
          Click to upload images or reference docs
        </span>
        <span className="text-[11px] text-porcelain-muted mt-1">
          PNG, JPEG, WebP, AVIF, PDF, Markdown, CSV, JSON
        </span>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      {uploadStatus && (
        <div className="p-2 rounded bg-mint/10 border border-mint/30 text-mint text-[11px] flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {error && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[11px]">
          {error}
        </div>
      )}

      <div className="text-[11px] text-porcelain-muted leading-relaxed">
        <p className="font-semibold text-porcelain mb-1">Free Tier Upload Limits:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Up to 5 files per project</li>
          <li>Max 5MB per image, 10MB per document</li>
          <li>Max 25MB total project storage</li>
        </ul>
      </div>
    </div>
  );
}
