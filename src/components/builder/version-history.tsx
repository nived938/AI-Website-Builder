"use client";

import { useState } from "react";
import { History, RotateCcw, Clock, Check, ShieldCheck } from "lucide-react";
import { CheckpointRecord } from "@/lib/db/store";

interface VersionHistoryProps {
  projectId: string;
  checkpoints: CheckpointRecord[];
  onRestore: (checkpointId: string) => void;
  onClose: () => void;
}

export function VersionHistoryModal({
  projectId,
  checkpoints,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    checkpoints[0]?.id || null
  );
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const selectedCheckpoint = checkpoints.find((c) => c.id === selectedId);

  const handleRestore = () => {
    if (!selectedId) return;
    onRestore(selectedId);
    setRestoredId(selectedId);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-graphite-300 border border-border rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border bg-graphite-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-mint" />
            <h3 className="font-bold text-sm text-porcelain">
              Version History & Checkpoints
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-porcelain-muted hover:text-porcelain text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden divide-x divide-border">
          {/* Checkpoints List */}
          <div className="w-1/2 overflow-y-auto p-3 space-y-2">
            {checkpoints.length === 0 ? (
              <div className="p-6 text-center text-xs text-porcelain-muted">
                No checkpoints saved yet. Checkpoints are automatically captured prior to AI file modifications.
              </div>
            ) : (
              checkpoints.map((cp) => {
                const isSelected = cp.id === selectedId;
                const fileCount = Object.keys(cp.files || {}).length;

                return (
                  <div
                    key={cp.id}
                    onClick={() => setSelectedId(cp.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                      isSelected
                        ? "bg-graphite-100 border-mint/60 text-porcelain"
                        : "bg-graphite-200 border-border text-porcelain-muted hover:border-border/80 hover:text-porcelain"
                    }`}
                  >
                    <div className="font-semibold text-xs text-porcelain flex items-center justify-between">
                      <span className="truncate">{cp.name}</span>
                      <span className="text-[10px] font-mono text-porcelain-muted">
                        {fileCount} files
                      </span>
                    </div>
                    {cp.description && (
                      <p className="text-[11px] text-porcelain-muted mt-1 truncate">
                        {cp.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-porcelain-muted/80 mt-2 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(cp.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details / File Snapshot Preview */}
          <div className="w-1/2 p-4 flex flex-col justify-between overflow-y-auto">
            {selectedCheckpoint ? (
              <div className="space-y-3">
                <div className="border-b border-border pb-2">
                  <h4 className="font-bold text-xs text-porcelain">
                    {selectedCheckpoint.name}
                  </h4>
                  <p className="text-[11px] text-porcelain-muted mt-0.5">
                    {selectedCheckpoint.description || "Project snapshot"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-porcelain-muted uppercase tracking-wider">
                    Files In Snapshot:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {Object.keys(selectedCheckpoint.files || {}).map((path) => (
                      <li
                        key={path}
                        className="text-[11px] font-mono text-porcelain bg-graphite-200 px-2 py-1 rounded"
                      >
                        {path}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-xs text-porcelain-muted text-center py-10">
                Select a checkpoint to view snapshot details.
              </div>
            )}

            {selectedCheckpoint && (
              <div className="pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoredId === selectedCheckpoint.id}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-mint px-4 py-2 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint disabled:opacity-50"
                >
                  {restoredId === selectedCheckpoint.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Restored Successfully!</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Restore to This Version</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
