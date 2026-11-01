"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Plus,
  ExternalLink,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  HardDrive,
  Cpu,
  Globe,
  Clock,
  Layers,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatCredits } from "@/lib/utils";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  framework: string;
  status: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [wallet, setWallet] = useState<{ total: number; resetCountdown: string }>({
    total: 10200,
    resetCountdown: "6h 12m",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch(() => {});

    fetch("/api/billing/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.creditAccount) {
          setWallet({
            total: data.creditAccount.totalAvailable,
            resetCountdown: data.resetCountdown?.formatted || "6h 12m",
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          framework: "html",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCreating(false);
        setNewProjectName("");
        setNewProjectDesc("");
        router.push(`/builder/${data.project.id}`);
      }
    } catch {}
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setActiveMenuId(null);
    } catch {}
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === "published" && p.status !== "published") return false;
    if (filter === "draft" && p.status !== "draft") return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Top Welcome Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-mint mb-1">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span>Connected to Ollama (127.0.0.1:11434)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-porcelain">
              Welcome back, Alex Vance
            </h1>
            <p className="text-xs text-porcelain-muted mt-1">
              Manage your generated websites, code repositories, and persistent memories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2.5 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Website</span>
            </button>
          </div>
        </div>

        {/* KPI Stat Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Total Websites</div>
            <div className="text-2xl font-bold font-mono text-porcelain">{projects.length}</div>
            <div className="text-[11px] text-mint mt-1">Active projects</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Active Published</div>
            <div className="text-2xl font-bold font-mono text-mint">
              {projects.filter((p) => p.status === "published").length}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">Live on edge CDN</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Credits Remaining</div>
            <div className="text-2xl font-bold font-mono text-violet">
              {formatCredits(wallet.total)}
            </div>
            <div className="text-[11px] text-mint mt-1">Reset in {wallet.resetCountdown}</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Active Plan</div>
            <div className="text-2xl font-bold font-mono text-porcelain">PRO</div>
            <div className="text-[11px] text-porcelain-muted mt-1">HIGH reasoning effort</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-graphite-300 p-1 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filter === "all" ? "bg-graphite-100 text-mint" : "text-porcelain-muted hover:text-porcelain"
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("published")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filter === "published" ? "bg-graphite-100 text-mint" : "text-porcelain-muted hover:text-porcelain"
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setFilter("draft")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                filter === "draft" ? "bg-graphite-100 text-mint" : "text-porcelain-muted hover:text-porcelain"
              }`}
            >
              Drafts
            </button>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-2 bg-graphite-300 px-3 py-1.5 rounded-lg border border-border text-xs text-porcelain-muted focus-within:border-mint/50 focus-within:text-porcelain">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search websites..."
              className="w-full bg-transparent text-xs text-porcelain focus:outline-none"
            />
          </div>
        </div>

        {/* Recent Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-border bg-graphite-300 overflow-hidden hover:border-mint/40 transition duration-200 flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="h-44 bg-graphite-400 relative overflow-hidden flex items-center justify-center">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-porcelain-muted">
                    <Layers className="h-8 w-8 text-mint" />
                    <span className="font-mono text-[11px]">{project.framework.toUpperCase()} Project</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      project.status === "published"
                        ? "bg-mint/90 text-background"
                        : "bg-graphite-100 text-porcelain-muted border border-border"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* 3-Dot Context Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveMenuId(activeMenuId === project.id ? null : project.id);
                    }}
                    className="h-7 w-7 rounded-full bg-graphite-300/80 hover:bg-graphite-200 backdrop-blur-md flex items-center justify-center text-porcelain transition"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {activeMenuId === project.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-graphite-100 border border-border rounded-lg shadow-xl p-1 z-30 text-xs">
                      <Link
                        href={`/builder/${project.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-graphite-200 text-porcelain"
                      >
                        <Sparkles className="h-3 w-3 text-mint" />
                        Open Studio
                      </Link>
                      <a
                        href={`/api/projects/${project.id}/export`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-graphite-200 text-porcelain"
                      >
                        <Download className="h-3 w-3 text-porcelain-muted" />
                        Export ZIP
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/20 text-red-400 text-left"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-porcelain group-hover:text-mint transition mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-porcelain-muted line-clamp-2 leading-relaxed">
                    {project.description || "Website project powered by VEYRA Studio."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-porcelain-muted">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/builder/${project.id}`}
                    className="flex items-center gap-1 font-bold text-mint hover:underline"
                  >
                    <span>Launch Studio</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create Website */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-graphite-300 border border-border rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mint" />
                  <h3 className="font-bold text-sm text-porcelain">
                    Create New Website Project
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-porcelain-muted hover:text-porcelain"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                <div>
                  <label className="block text-porcelain-muted font-medium mb-1.5">
                    Website Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Apex SaaS Platform"
                    className="w-full rounded-md border border-border bg-graphite-100 p-2.5 text-xs text-porcelain focus:border-mint focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-porcelain-muted font-medium mb-1.5">
                    Description & Goals:
                  </label>
                  <textarea
                    rows={3}
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Briefly describe what this website does..."
                    className="w-full rounded-md border border-border bg-graphite-100 p-2.5 text-xs text-porcelain focus:border-mint focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-md bg-graphite-200 hover:bg-graphite-100 text-porcelain font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-mint text-background hover:bg-mint-hover font-bold text-xs shadow-mint"
                  >
                    Create & Open Studio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
