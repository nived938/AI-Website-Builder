import Link from "next/link";
import { Terminal, Shield, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-graphite-300 py-12 text-xs text-porcelain-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-mint font-mono text-xs font-black text-background">
                V
              </span>
              <span className="font-sans text-sm font-bold text-porcelain">
                VEYRA Studio
              </span>
            </div>
            <p className="max-w-sm text-porcelain-muted leading-relaxed mb-4">
              Your idea, built for the web. An AI-powered SaaS website builder engineered
              with local Ollama inference, persistent 4,000-token memory, credit billing, and isolated preview sandboxes.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-mint">
              <span className="inline-block h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span>Ollama Node Operational (127.0.0.1:11434)</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-porcelain mb-3 text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-mint transition">Features</Link></li>
              <li><Link href="/templates" className="hover:text-mint transition">Template Marketplace</Link></li>
              <li><Link href="/pricing" className="hover:text-mint transition">Pricing & Credits</Link></li>
              <li><Link href="/dashboard" className="hover:text-mint transition">User Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-porcelain mb-3 text-xs uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-2">
              <li><span className="text-porcelain-muted">4,000-Token Context</span></li>
              <li><span className="text-porcelain-muted">Ollama Chat API</span></li>
              <li><span className="text-porcelain-muted">Sandboxed Iframe</span></li>
              <li><span className="text-porcelain-muted">Razorpay Gateway</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-porcelain mb-3 text-xs uppercase tracking-wider">
              Governance & Legal
            </h4>
            <ul className="space-y-2">
              <li><Link href="/admin" className="hover:text-violet transition">Admin Portal</Link></li>
              <li><span className="text-porcelain-muted">Privacy Policy</span></li>
              <li><span className="text-porcelain-muted">Terms of Service</span></li>
              <li><span className="text-porcelain-muted">Security Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} VEYRA Studio. Midnight Atelier design system connected with Google Stitch.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-porcelain-muted">
              <Shield className="h-3.5 w-3.5 text-violet" />
              Isolated Preview Sandbox
            </span>
            <span className="flex items-center gap-1 text-porcelain-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" />
              RLS Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
