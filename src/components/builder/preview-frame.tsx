"use client";

import { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Maximize2,
  ExternalLink,
  Lock,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface PreviewFrameProps {
  projectId: string;
  projectName: string;
  refreshTrigger?: number;
}

export function PreviewFrame({
  projectId,
  projectName,
  refreshTrigger = 0,
}: PreviewFrameProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [key, setKey] = useState<number>(0);

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const previewPath = `/preview/${projectId}`;

  return (
    <div className="flex flex-col h-full w-full bg-graphite-400 overflow-hidden select-none">
      {/* Viewport & Controls Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-border bg-graphite-200/80 px-3 text-xs">
        {/* Left: Device Viewport Switches */}
        <div className="flex items-center gap-1 bg-graphite-300 p-0.5 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              device === "desktop"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="Desktop (1440px)"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              device === "tablet"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
              device === "mobile"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="Mobile (390px)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Simulated Browser Address Bar */}
        <div className="hidden md:flex items-center gap-2 max-w-sm flex-1 mx-4 bg-graphite-300 px-3 py-1 rounded-full border border-border text-[11px] text-porcelain-muted font-mono truncate">
          <Lock className="h-3 w-3 text-mint shrink-0" />
          <span className="truncate">https://preview.veyra.studio/{projectId}</span>
        </div>

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-2 text-porcelain-muted">
          <div className="flex items-center gap-1 bg-graphite-300 px-2 py-0.5 rounded border border-border text-[11px]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="hover:text-porcelain"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="font-mono text-[10px] w-8 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="hover:text-porcelain"
              title="Zoom In"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-1.5 hover:text-mint transition rounded hover:bg-graphite-100"
            title="Reload Preview"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <a
            href={previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:text-mint transition rounded hover:bg-graphite-100"
            title="Open in Isolated Window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto bg-[#070B16]">
        <div
          style={{
            width: deviceWidths[device],
            maxWidth: "100%",
            height: device === "desktop" ? "100%" : "844px",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className={`relative bg-background border border-border shadow-2xl transition-all duration-200 overflow-hidden ${
            device !== "desktop" ? "rounded-2xl ring-1 ring-border" : "rounded-md"
          }`}
        >
          {device !== "desktop" && (
            <div className="absolute top-0 inset-x-0 h-6 bg-graphite-300 flex items-center justify-center z-20 border-b border-border">
              <div className="w-16 h-1 rounded-full bg-graphite-50" />
            </div>
          )}

          <iframe
            key={`${key}-${refreshTrigger}`}
            src={previewPath}
            title={`${projectName} Sandbox Preview`}
            sandbox="allow-scripts allow-forms allow-same-origin"
            className="w-full h-full border-0 pt-0"
            style={{ paddingTop: device !== "desktop" ? "24px" : "0" }}
          />
        </div>
      </div>
    </div>
  );
}
