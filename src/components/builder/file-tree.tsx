"use client";

import { useState } from "react";
import {
  Folder,
  FileCode,
  FileText,
  Plus,
  Trash2,
  Search,
  HardDrive,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { ProjectFileRecord } from "@/lib/db/store";
import { formatBytes } from "@/lib/utils";

interface FileTreeProps {
  files: ProjectFileRecord[];
  activeFilePath?: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  storageUsedBytes?: number;
  totalStorageBytes?: number;
}

export function FileTree({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  storageUsedBytes = 5400,
  totalStorageBytes = 25 * 1024 * 1024,
}: FileTreeProps) {
  const [search, setSearch] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    components: true,
  });

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim());
    setNewFileName("");
    setIsAddingFile(false);
  };

  const storagePercent = Math.min(
    100,
    Math.round((storageUsedBytes / totalStorageBytes) * 100)
  );

  return (
    <aside className="w-64 border-r border-border bg-graphite-300 flex flex-col h-full select-none text-xs">
      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 bg-graphite-200 px-2.5 py-1.5 rounded-md border border-border text-porcelain-muted focus-within:border-mint/50 focus-within:text-porcelain transition">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files (⌘K)..."
            className="w-full bg-transparent text-xs text-porcelain focus:outline-none placeholder:text-porcelain-muted"
          />
        </div>
      </div>

      {/* Explorer Tree Header */}
      <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-porcelain-muted">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-mint" />
          <span>Project Files</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingFile(true)}
          className="p-1 hover:text-mint rounded hover:bg-graphite-100 transition"
          title="New File"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Create File Input Form */}
      {isAddingFile && (
        <form onSubmit={handleCreate} className="px-3 pb-2">
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. about.html"
              className="flex-1 bg-graphite-100 px-2 py-1 rounded text-xs text-porcelain border border-mint focus:outline-none"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-mint text-background rounded font-bold text-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingFile(false)}
              className="px-1 text-porcelain-muted hover:text-porcelain text-xs"
            >
              ✕
            </button>
          </div>
        </form>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredFiles.map((file) => {
          const isActive = file.path === activeFilePath;
          return (
            <div
              key={file.id}
              className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition ${
                isActive
                  ? "bg-graphite-100 text-mint font-semibold"
                  : "text-porcelain-muted hover:bg-graphite-200/60 hover:text-porcelain"
              }`}
              onClick={() => onSelectFile(file.path)}
            >
              <div className="flex items-center gap-2 truncate">
                {file.path.endsWith(".html") ? (
                  <FileCode className="h-3.5 w-3.5 text-mint shrink-0" />
                ) : file.path.endsWith(".css") ? (
                  <FileText className="h-3.5 w-3.5 text-violet shrink-0" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-porcelain-muted shrink-0" />
                )}
                <span className="truncate">{file.path}</span>
              </div>

              {files.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete file "${file.path}"?`)) {
                      onDeleteFile(file.path);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-porcelain-muted hover:text-red-400 p-0.5 transition"
                  title="Delete File"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Storage Quota Gauge */}
      <div className="p-3 border-t border-border bg-graphite-400/50">
        <div className="flex items-center justify-between text-[11px] text-porcelain-muted mb-1.5 font-medium">
          <span className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5 text-violet" />
            Storage Used
          </span>
          <span className="font-mono">{storagePercent}%</span>
        </div>
        <div className="w-full bg-graphite-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-mint h-full transition-all duration-300"
            style={{ width: `${Math.max(4, storagePercent)}%` }}
          />
        </div>
        <div className="text-[10px] text-porcelain-muted mt-1 font-mono">
          {formatBytes(storageUsedBytes)} / {formatBytes(totalStorageBytes)}
        </div>
      </div>
    </aside>
  );
}
