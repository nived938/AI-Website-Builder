import {
  Cpu,
  Layers,
  Code2,
  Globe,
  Database,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FeaturesPage() {
  const featureList = [
    {
      icon: Cpu,
      title: "Local Ollama Inference",
      description:
        "Communicate directly with your local or self-hosted Ollama node over HTTP streaming. No closed-source API lock-in, zero privacy leakage, and configurable model weights.",
    },
    {
      icon: Database,
      title: "4,000-Token Persistent Memory",
      description:
        "Multi-tier retrieval engine combining PostgreSQL full-text search, incremental rolling conversation summaries, and technical decision tracking so long chats never lose context.",
    },
    {
      icon: Lock,
      title: "Sandboxed Isolated Preview",
      description:
        "Generated HTML/CSS/JS executes in an isolated iframe sandbox with strict postMessage communication boundaries. Application cookies and API secrets remain 100% shielded.",
    },
    {
      icon: Code2,
      title: "Monaco & CodeMirror Editor",
      description:
        "Syntax highlighting, line numbers, and AI diff visualizer with one-click 'Accept Diff (Tab)' and 'Reject' actions directly in your browser.",
    },
    {
      icon: Globe,
      title: "SSRF-Safe Web Research",
      description:
        "Give your AI live internet access for research via Tavily or Brave Search with automated IP loopback blocking, content sanitization, and clickable source citations.",
    },
    {
      icon: Zap,
      title: "Dual-Mode Credit Billing",
      description:
        "Switch seamlessly between TEST=YES simulated instant checkouts and TEST=NO live Razorpay transactions with an immutable double-entry credit ledger.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3.5 py-1 text-xs font-mono font-bold text-mint mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for Modern SaaS Engineering</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-porcelain">
            Architected for Speed, Safety & Persistence
          </h1>
          <p className="text-sm text-porcelain-muted mt-3">
            Every feature in VEYRA Studio was purpose-built to solve real engineering bottlenecks in AI-generated web software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-graphite-300 border border-border hover:border-mint/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-mint/10 border border-mint/30 flex items-center justify-center text-mint mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-porcelain mb-2">{f.title}</h3>
                  <p className="text-xs text-porcelain-muted leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
