"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  Layers,
  ExternalLink,
  ArrowRight,
  Code2,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const TEMPLATES = [
  {
    id: "tpl_spatial_audio",
    name: "Aura Spatial Labs",
    category: "Hardware & Audio",
    description: "Sleek spatial acoustics landing page with HTML5 Canvas audio wave synthesis, dark luxury cards, and responsive navbar.",
    framework: "HTML5 / Canvas",
    thumbnail: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    badge: "Midnight Atelier",
  },
  {
    id: "tpl_cyber_vault",
    name: "CyberVault Enclave",
    category: "Security & Crypto",
    description: "Zero-knowledge decentralized encryption key management dashboard with high-contrast glowing charts and status badges.",
    framework: "HTML / Tailwind",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    badge: "Popular",
  },
  {
    id: "tpl_zenith_fintech",
    name: "Zenith Treasury",
    category: "FinTech & Banking",
    description: "Cross-border liquidity routing interface with currency converter modal, dark glass cards, and live audit telemetry.",
    framework: "HTML / JS",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80",
    badge: "Enterprise",
  },
  {
    id: "tpl_neon_nexus",
    name: "NeonNexus Gaming",
    category: "Gaming & 3D",
    description: "Cyberpunk esports marketplace featuring 3D-styled hero section, interactive character selector, and dark neon accents.",
    framework: "HTML / CSS",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    badge: "New",
  },
  {
    id: "tpl_minimal_portfolio",
    name: "Aether Minimalist Portfolio",
    category: "Portfolio & Creative",
    description: "Ultra-clean portfolio for designers and engineers with dark mode typography, project case-study bento grids, and contact drawer.",
    framework: "HTML / CSS",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    badge: "Clean",
  },
  {
    id: "tpl_ai_agent_studio",
    name: "Synapse AI Platform",
    category: "AI & SaaS",
    description: "B2B AI orchestration landing page with interactive LLM benchmarking calculator, pricing slider, and enterprise security checklist.",
    framework: "HTML / Tailwind",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    badge: "AI Powered",
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [cloningId, setCloningId] = useState<string | null>(null);

  const handleUseTemplate = async (template: typeof TEMPLATES[0]) => {
    setCloningId(template.id);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          framework: "html",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/builder/${data.project.id}`);
      }
    } catch {
      setCloningId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-3xl sm:text-5xl font-black text-porcelain">
            Template Marketplace
          </h1>
          <p className="text-sm text-porcelain-muted mt-3">
            Fork curated starter architectures engineered to the Midnight Atelier design system. Modify any element naturally using your local Ollama copilot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="group rounded-xl border border-border bg-graphite-300 overflow-hidden hover:border-mint/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="h-48 bg-graphite-400 relative overflow-hidden">
                <img
                  src={tpl.thumbnail}
                  alt={tpl.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-graphite-100/90 text-mint border border-border">
                  {tpl.badge}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 backdrop-blur-md text-porcelain">
                  {tpl.framework}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-porcelain-muted uppercase tracking-wider mb-1">
                    {tpl.category}
                  </div>
                  <h3 className="font-bold text-base text-porcelain group-hover:text-mint transition mb-2">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-porcelain-muted leading-relaxed line-clamp-3">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-porcelain-muted font-mono">
                    Free with 200 credits
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tpl)}
                    disabled={cloningId === tpl.id}
                    className="flex items-center gap-1.5 rounded-md bg-mint px-3.5 py-1.5 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint disabled:opacity-50"
                  >
                    {cloningId === tpl.id ? (
                      <span>Forking...</span>
                    ) : (
                      <>
                        <span>Use Template</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
