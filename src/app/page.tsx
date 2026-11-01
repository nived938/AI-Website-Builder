import Link from "next/link";
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Code2,
  Globe,
  Database,
  Lock,
  CheckCircle2,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-mint/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet-dim px-3.5 py-1 text-xs font-semibold text-violet mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-violet" />
          <span>Powered by Local Ollama Inference & 4,000-Token Persistent Memory</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6">
          Your idea, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint via-porcelain to-violet">
            built for the web.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-porcelain-muted mb-10 leading-relaxed">
          Describe any website in natural language. VEYRA Studio architects pages,
          writes source code, manages persistent long-term memory, and publishes live
          to the edge—with zero external LLM lock-in.
        </p>

        {/* Interactive Prompt Simulator Bar */}
        <div className="w-full max-w-2xl bg-graphite-300 p-2 sm:p-2.5 rounded-xl border border-border shadow-2xl flex items-center gap-2 mb-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-graphite-200 text-mint shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <input
            type="text"
            readOnly
            value="Build a high-performance audio synthesis landing page with real-time canvas waveform..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-porcelain font-mono focus:outline-none truncate"
          />
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-xs sm:text-sm font-bold text-background transition hover:bg-mint-hover shadow-mint shrink-0"
          >
            <span>Generate Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono text-porcelain-muted">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-mint" />
            <span>200 Free Credits Daily</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-violet" />
            <span>100% Local Ollama Models</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-porcelain" />
            <span>Isolated Iframe Sandbox</span>
          </div>
        </div>

        {/* Product Workspace Mockup Window */}
        <div className="mt-14 w-full rounded-xl border border-border bg-graphite-400 p-1.5 sm:p-2 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-graphite-300 rounded-t-lg border-b border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-porcelain-muted hidden sm:inline">
                veyra-studio://workspace/aura-spatial-labs
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-mint">● Ollama Connected</span>
              <span className="text-porcelain-muted hidden md:inline">4,096 Token Budget Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-background">
            {/* Left Mockup Sidebar */}
            <div className="hidden lg:block lg:col-span-3 border-r border-border bg-graphite-300 p-3 text-left">
              <div className="text-[10px] uppercase font-bold text-porcelain-muted mb-2 tracking-wider">
                Project Files
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="bg-graphite-100 text-mint p-1.5 rounded flex items-center justify-between">
                  <span>index.html</span>
                  <span className="text-[10px] text-mint">Active</span>
                </div>
                <div className="text-porcelain-muted p-1.5">styles.css</div>
                <div className="text-porcelain-muted p-1.5">app.js</div>
                <div className="text-porcelain-muted p-1.5">tailwind.config.js</div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-[10px] uppercase font-bold text-porcelain-muted mb-1.5 tracking-wider">
                  Persistent Memory
                </div>
                <p className="text-[11px] text-porcelain-muted leading-relaxed font-sans">
                  Target: Spatial audio acoustics with luminous mint action triggers and HTML5 canvas waves.
                </p>
              </div>
            </div>

            {/* Center Mockup Preview */}
            <div className="lg:col-span-6 p-4 flex flex-col items-center justify-center bg-graphite-500/40">
              <div className="w-full max-w-md bg-graphite-300 p-6 rounded-lg border border-border text-center shadow-lg">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-violet-dim text-violet text-[10px] font-bold mb-3">
                  ACOUSTIC STUDIO V2.4
                </div>
                <h3 className="text-2xl font-black mb-2 text-porcelain">
                  Sound in <span className="text-mint">Four Dimensions</span>.
                </h3>
                <p className="text-xs text-porcelain-muted mb-4">
                  Ultra-low distortion planar magnetic drivers paired with real-time calibration.
                </p>
                <div className="flex justify-center gap-2">
                  <button className="bg-mint text-background text-xs font-bold px-3 py-1.5 rounded">
                    Reserve Studio Unit
                  </button>
                  <button className="bg-graphite-200 text-porcelain text-xs font-semibold px-3 py-1.5 rounded border border-border">
                    Listen Demo ▶
                  </button>
                </div>
              </div>
            </div>

            {/* Right Mockup AI Copilot */}
            <div className="hidden lg:block lg:col-span-3 border-l border-border bg-graphite-300 p-3 text-left">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Sparkles className="h-4 w-4 text-violet" />
                <span className="font-bold text-xs">AI Architect</span>
                <span className="ml-auto text-[10px] font-mono text-mint">⚡ 1x (LOW)</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="bg-graphite-200 p-2 rounded text-[11px] text-porcelain">
                  "Add a live harmonic canvas wave visualizer and make buttons luminous mint."
                </div>
                <div className="bg-graphite-100 p-2 rounded text-[11px] text-mint">
                  ✓ Created app.js with 60FPS WebGL waveform synthesis.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4,000-TOKEN PERSISTENT MEMORY ENGINE */}
      <section className="py-20 border-t border-border bg-graphite-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-mint uppercase tracking-wider mb-2">
              The Architecture Advantage
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-porcelain">
              4,000-Token Local Context. Zero Amnesia.
            </h3>
            <p className="text-sm text-porcelain-muted mt-3">
              Most local LLMs have approximately 4,000 tokens of context. In naive builders, long conversations overflow or forget design choices. VEYRA's persistent memory layer keeps conversations seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-graphite-300 border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-mint/10 border border-mint/30 flex items-center justify-center text-mint">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-porcelain">Persistent Project Memory</h4>
              <p className="text-xs text-porcelain-muted leading-relaxed">
                Every architectural decision, preferred color token, and file relationship is indexed into PostgreSQL. The AI always recalls your project context.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-graphite-300 border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-violet/10 border border-violet/30 flex items-center justify-center text-violet">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-porcelain">Rolling Incremental Summaries</h4>
              <p className="text-xs text-porcelain-muted leading-relaxed">
                When dialog rounds approach token budgets, older turns are seamlessly distilled into technical summaries without deleting underlying message records.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-graphite-300 border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-porcelain/10 border border-porcelain/30 flex items-center justify-center text-porcelain">
                <Code2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-porcelain">Deterministic Token Budgeting</h4>
              <p className="text-xs text-porcelain-muted leading-relaxed">
                Allocates exact bounds for system rules (500), project decisions (300), RAG chunks (700), recent messages (600), reserving 800+ tokens for streaming code output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EFFORT TIERS & DUAL-MODE BILLING */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-violet uppercase tracking-wider mb-2">
              Flexible Billing & Entitlements
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-porcelain">
              Pay with Credits. Switch Modes Instantly.
            </h3>
            <p className="text-sm text-porcelain-muted mt-3">
              Transparent, immutable ledger tracking. Test all paid workflows instantly with <code className="text-mint font-mono">TEST=YES</code>, or switch to live Razorpay checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <div className="p-6 rounded-xl bg-graphite-300 border border-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-porcelain-muted uppercase tracking-wider">Free</span>
                <div className="text-3xl font-extrabold text-porcelain mt-2">₹0</div>
                <div className="text-xs text-mint mt-1 font-mono">200 credits daily</div>
                <p className="text-xs text-porcelain-muted mt-3">
                  Perfect for exploring local AI website building.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-porcelain-muted">
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> 200 free credits daily
                  </li>
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> LOW effort inference
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> 3 saved projects
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="mt-8 block text-center rounded-md bg-graphite-200 hover:bg-graphite-100 py-2 text-xs font-bold text-porcelain transition"
              >
                Get Started
              </Link>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-xl bg-graphite-300 border border-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-porcelain-muted uppercase tracking-wider">Starter</span>
                <div className="text-3xl font-extrabold text-porcelain mt-2">₹999<span className="text-xs text-porcelain-muted">/mo</span></div>
                <div className="text-xs text-mint mt-1 font-mono">2,500 credits + 200 daily</div>
                <p className="text-xs text-porcelain-muted mt-3">
                  For creators building multiple client websites.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-porcelain-muted">
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> LOW & MEDIUM effort
                  </li>
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> 10 saved projects
                  </li>
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Web research enabled
                  </li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center rounded-md bg-graphite-200 hover:bg-graphite-100 py-2 text-xs font-bold text-porcelain transition"
              >
                Upgrade to Starter
              </Link>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-xl bg-graphite-200 border-2 border-mint flex flex-col justify-between shadow-mint relative">
              <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-mint text-background text-[10px] font-extrabold uppercase tracking-wide">
                Popular
              </span>
              <div>
                <span className="text-xs font-bold text-mint uppercase tracking-wider">Pro</span>
                <div className="text-3xl font-extrabold text-porcelain mt-2">₹2,499<span className="text-xs text-porcelain-muted">/mo</span></div>
                <div className="text-xs text-mint mt-1 font-mono">10,000 credits + 200 daily</div>
                <p className="text-xs text-porcelain-muted mt-3">
                  High reasoning effort for production SaaS apps.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-porcelain">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> HIGH reasoning effort
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Unlimited website projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> Custom domain publishing
                  </li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center rounded-md bg-mint hover:bg-mint-hover py-2 text-xs font-extrabold text-background transition shadow-mint"
              >
                Subscribe to Pro
              </Link>
            </div>

            {/* Ultimate */}
            <div className="p-6 rounded-xl bg-graphite-300 border border-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-violet uppercase tracking-wider">Ultimate</span>
                <div className="text-3xl font-extrabold text-porcelain mt-2">₹5,999<span className="text-xs text-porcelain-muted">/mo</span></div>
                <div className="text-xs text-violet mt-1 font-mono">30,000 credits + MAX effort</div>
                <p className="text-xs text-porcelain-muted mt-3">
                  Maximum deep reasoning, research & priority inference.
                </p>
                <ul className="mt-6 space-y-2 text-xs text-porcelain-muted">
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet" /> All effort levels (MAX 8x)
                  </li>
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet" /> Priority Ollama queue
                  </li>
                  <li className="flex items-center gap-2 text-porcelain">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet" /> 2GB storage quota
                  </li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center rounded-md bg-graphite-200 hover:bg-graphite-100 py-2 text-xs font-bold text-porcelain transition"
              >
                Upgrade to Ultimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
