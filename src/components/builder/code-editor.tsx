"use client";

import { useState, useEffect } from "react";
import { Save, Check, Code, FileText, Sparkles, CheckCheck, X } from "lucide-react";
import { ProjectFileRecord } from "@/lib/db/store";

interface CodeEditorProps {
  projectId: string;
  files: ProjectFileRecord[];
  activeFilePath?: string;
  onFileSaved?: (path: string, content: string) => void;
  pendingAiDiff?: {
    path: string;
    originalContent: string;
    suggestedContent: string;
  } | null;
  onAcceptDiff?: () => void;
  onRejectDiff?: () => void;
}

export function CodeEditor({
  projectId,
  files,
  activeFilePath = "index.html",
  onFileSaved,
  pendingAiDiff,
  onAcceptDiff,
  onRejectDiff,
}: CodeEditorProps) {
  const [currentPath, setCurrentPath] = useState(activeFilePath);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  // Sync active file
  useEffect(() => {
    const file = files.find((f) => f.path === currentPath) || files[0];
    if (file) {
      setCurrentPath(file.path);
      setEditorContent(file.content);
      setIsSaved(true);
    }
  }, [currentPath, files]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: currentPath,
          content: editorContent,
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        onFileSaved?.(currentPath, editorContent);
      }
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const lines = editorContent.split("\n");

  return (
    <div className="flex flex-col h-full w-full bg-graphite-500 overflow-hidden text-xs font-mono">
      {/* File Tabs Header */}
      <div className="flex items-center justify-between border-b border-border bg-graphite-300 px-2 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {files.map((file) => {
            const isActive = file.path === currentPath;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  setCurrentPath(file.path);
                  setEditorContent(file.content);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs transition border-b-2 ${
                  isActive
                    ? "bg-graphite-400 text-mint border-mint font-semibold"
                    : "text-porcelain-muted border-transparent hover:bg-graphite-200 hover:text-porcelain"
                }`}
              >
                {file.path.endsWith(".html") ? (
                  <Code className="h-3.5 w-3.5 text-mint" />
                ) : file.path.endsWith(".css") ? (
                  <FileText className="h-3.5 w-3.5 text-violet" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-porcelain-muted" />
                )}
                <span>{file.name}</span>
                {!isSaved && isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                )}
              </button>
            );
          })}
        </div>

        {/* Save & Status Actions */}
        <div className="flex items-center gap-2 pl-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-sans font-bold transition ${
              isSaved
                ? "bg-transparent text-porcelain-muted"
                : "bg-mint text-background hover:bg-mint-hover shadow-mint"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-3 w-3 text-mint" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                <span>{isSaving ? "Saving..." : "Save (Cmd+S)"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Diff Suggestion Banner if present */}
      {pendingAiDiff && pendingAiDiff.path === currentPath && (
        <div className="flex items-center justify-between bg-violet-dim border-b border-violet/40 px-4 py-2 text-porcelain">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet animate-pulse" />
            <span className="font-sans font-semibold text-xs text-violet">
              AI Proposed Code Modifications
            </span>
            <span className="text-porcelain-muted text-[11px]">
              Review suggested updates before applying to project
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRejectDiff}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-graphite-200 hover:bg-graphite-100 text-porcelain-muted hover:text-porcelain text-xs font-sans font-semibold"
            >
              <X className="h-3 w-3" />
              Reject
            </button>
            <button
              type="button"
              onClick={onAcceptDiff}
              className="flex items-center gap-1 px-3 py-1 rounded bg-violet text-porcelain hover:bg-violet-hover text-xs font-sans font-bold shadow-violet"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Accept Diff (Tab)
            </button>
          </div>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div className="w-12 bg-graphite-400/80 border-r border-border text-porcelain-muted select-none text-right pr-3 py-3 space-y-[2px] leading-5 text-[11px] shrink-0">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={editorContent}
          onChange={(e) => {
            setEditorContent(e.target.value);
            setIsSaved(false);
          }}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-porcelain text-[12px] leading-5 font-mono resize-none focus:outline-none overflow-auto border-none selection:bg-mint/20"
        />
      </div>

      {/* Editor Status Footer */}
      <div className="h-6 bg-graphite-300 border-t border-border flex items-center justify-between px-3 text-[10px] text-porcelain-muted font-sans">
        <div className="flex items-center gap-3">
          <span>{currentPath}</span>
          <span>{lines.length} lines</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-mint">Tab Size: 2</span>
          <span>TypeScript / HTML</span>
        </div>
      </div>
    </div>
  );
}
