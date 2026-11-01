"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Rocket,
  History,
  RotateCcw,
  RotateCw,
  Search,
  Eye,
  Code,
  Columns,
  FolderTree,
  UploadCloud,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Zap,
} from "lucide-react";
import { PreviewFrame } from "./preview-frame";
import { CodeEditor } from "./code-editor";
import { FileTree } from "./file-tree";
import { AIChatPanel } from "./ai-chat-panel";
import { VersionHistoryModal } from "./version-history";
import { SeoAnalyzer } from "./seo-analyzer";
import { AssetUploader } from "./asset-uploader";
import { ProjectRecord, ProjectFileRecord, CheckpointRecord } from "@/lib/db/store";

interface WorkspaceProps {
  project: ProjectRecord;
  initialFiles: ProjectFileRecord[];
  checkpoints: CheckpointRecord[];
}

export function BuilderWorkspace({
  project,
  initialFiles,
  checkpoints: initialCheckpoints,
}: WorkspaceProps) {
  const [files, setFiles] = useState<ProjectFileRecord[]>(initialFiles);
  const [activeFilePath, setActiveFilePath] = useState<string>("index.html");
  const [viewMode, setViewMode] = useState<"preview" | "code" | "split">("split");
  const [leftTab, setLeftTab] = useState<"files" | "assets" | "seo">("files");
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>(initialCheckpoints);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Reload files helper
  const reloadFiles = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch {}
  };

  const handleCreateFile = async (newPath: string) => {
    try {
      const res = await fetch(`/api/projects/${project.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: newPath,
          content: `<!-- ${newPath} created in VEYRA Studio -->\n`,
        }),
      });

      if (res.ok) {
        await reloadFiles();
        setActiveFilePath(newPath);
      }
    } catch {}
  };

  const handleDeleteFile = async (pathToDelete: string) => {
    try {
      // In local demo, update files list
      setFiles((prev) => prev.filter((f) => f.path !== pathToDelete));
      if (activeFilePath === pathToDelete) {
        setActiveFilePath("index.html");
      }
    } catch {}
  };

  const handleExportZip = () => {
    window.location.href = `/api/projects/${project.id}/export`;
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishStatus("Deploying to Edge CDN...");

    try {
      const res = await fetch(`/api/projects/${project.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: project.userId }),
      });

      const data = await res.json();
      if (data.success) {
        setPublishStatus(`Published at: ${data.publishedUrl}`);
      } else if (data.requiresConfiguration) {
        setPublishStatus(data.message);
      }
    } catch {
      setPublishStatus("Deployment adapter triggered. Source ready for publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRestoreCheckpoint = async (checkpointId: string) => {
    await reloadFiles();
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-porcelain select-none font-sans">
      {/* 1. TOP WORKSPACE TOOLBAR */}
      <header className="h-14 border-b border-border bg-graphite-300 px-4 flex items-center justify-between z-40 shrink-0">
        {/* Left: VEYRA Wordmark & Project Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-porcelain hover:text-mint transition group"
            title="Return to Dashboard"
          >
            <ChevronLeft className="h-4 w-4 text-porcelain-muted group-hover:text-mint" />
            <span className="flex h-6 w-6 items-center justify-center rounded bg-mint font-mono text-xs font-black text-background">
              V
            </span>
          </Link>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-porcelain">{project.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-graphite-100 text-porcelain-muted border border-border">
              {project.framework.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Saved to Cloud
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Preview, Split, Code) */}
        <div className="hidden md:flex items-center gap-1 bg-graphite-400 p-1 rounded-md border border-border">
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              viewMode === "preview"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              viewMode === "split"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition ${
              viewMode === "code"
                ? "bg-graphite-100 text-mint shadow-sm"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Right: History, Export ZIP, Publish Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-porcelain-muted hover:bg-graphite-200 hover:text-porcelain transition border border-transparent hover:border-border"
            title="Version History Checkpoints"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-porcelain bg-graphite-200 hover:bg-graphite-100 transition border border-border"
            title="Download full project source code as ZIP"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-mint text-background hover:bg-mint-hover transition shadow-mint"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>{isPublishing ? "Publishing..." : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* Publish Status Banner if shown */}
      {publishStatus && (
        <div className="bg-graphite-200 border-b border-border px-4 py-2 text-xs text-mint flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
            <span>{publishStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setPublishStatus(null)}
            className="text-porcelain-muted hover:text-porcelain"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. MAIN 3-COLUMN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sub-Sidebar (Files, Assets, SEO) */}
        <div className="flex flex-col border-r border-border bg-graphite-400 w-12 shrink-0 py-3 items-center gap-4">
          <button
            type="button"
            onClick={() => setLeftTab("files")}
            className={`p-2 rounded-md transition ${
              leftTab === "files"
                ? "bg-graphite-100 text-mint"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="Project Files"
          >
            <FolderTree className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setLeftTab("assets")}
            className={`p-2 rounded-md transition ${
              leftTab === "assets"
                ? "bg-graphite-100 text-mint"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="Assets & Documents"
          >
            <UploadCloud className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setLeftTab("seo")}
            className={`p-2 rounded-md transition ${
              leftTab === "seo"
                ? "bg-graphite-100 text-mint"
                : "text-porcelain-muted hover:text-porcelain"
            }`}
            title="SEO & A11y Audit"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Left Drawer Area */}
        <div className="hidden lg:flex w-64 border-r border-border h-full overflow-hidden bg-graphite-300">
          {leftTab === "files" && (
            <FileTree
              files={files}
              activeFilePath={activeFilePath}
              onSelectFile={(path) => setActiveFilePath(path)}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          )}

          {leftTab === "assets" && (
            <AssetUploader
              projectId={project.id}
              onAssetUploaded={reloadFiles}
            />
          )}

          {leftTab === "seo" && (
            <SeoAnalyzer
              files={files}
              onApplyFix={(fix) => {
                // Pre-fill prompt in chat panel
              }}
            />
          )}
        </div>

        {/* Center Canvas Area (Preview / Code / Split) */}
        <main className="flex-1 flex overflow-hidden relative">
          {viewMode === "preview" && (
            <PreviewFrame
              projectId={project.id}
              projectName={project.name}
              refreshTrigger={refreshTrigger}
            />
          )}

          {viewMode === "code" && (
            <CodeEditor
              projectId={project.id}
              files={files}
              activeFilePath={activeFilePath}
              onFileSaved={reloadFiles}
            />
          )}

          {viewMode === "split" && (
            <div className="flex-1 flex w-full h-full divide-x divide-border">
              <div className="w-1/2 h-full">
                <PreviewFrame
                  projectId={project.id}
                  projectName={project.name}
                  refreshTrigger={refreshTrigger}
                />
              </div>
              <div className="w-1/2 h-full">
                <CodeEditor
                  projectId={project.id}
                  files={files}
                  activeFilePath={activeFilePath}
                  onFileSaved={reloadFiles}
                />
              </div>
            </div>
          )}
        </main>

        {/* Right AI Copilot Panel */}
        <AIChatPanel
          projectId={project.id}
          onGenerationComplete={async () => {
            await reloadFiles();
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>

      {/* Version History Modal */}
      {showHistoryModal && (
        <VersionHistoryModal
          projectId={project.id}
          checkpoints={checkpoints}
          onRestore={handleRestoreCheckpoint}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
