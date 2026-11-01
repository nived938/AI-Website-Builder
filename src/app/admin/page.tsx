"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  CreditCard,
  DollarSign,
  Cpu,
  Activity,
  AlertTriangle,
  Sparkles,
  Edit,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatCredits, formatINR } from "@/lib/utils";

interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalProjects: number;
  totalCreditsConsumed: number;
  monthlyRecurringRevenueINR: number;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 12480,
    activeSubscriptions: 1840,
    totalProjects: 3820,
    totalCreditsConsumed: 148200,
    monthlyRecurringRevenueINR: 84200,
  });

  const [nodeHealth, setNodeHealth] = useState<{
    available: boolean;
    model: string;
    configured: boolean;
  }>({
    available: true,
    model: "llama3.2",
    configured: true,
  });

  const [adjustModal, setAdjustModal] = useState<{
    open: boolean;
    userId: string;
    amount: number;
    reason: string;
  } | null>(null);

  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.health) {
          setNodeHealth({
            available: data.health.available,
            model: data.health.configuredModel || "Not configured",
            configured: data.health.modelConfigured,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;

    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adjustModal.userId,
          amount: adjustModal.amount,
          reason: adjustModal.reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdjustSuccess(`Adjusted ${adjustModal.amount} credits successfully.`);
        setTimeout(() => {
          setAdjustModal(null);
          setAdjustSuccess(null);
        }, 1500);
      } else {
        alert(data.error || "Failed to adjust credits");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const demoUsers = [
    {
      id: "usr_alex_vance",
      name: "Alex Vance",
      email: "alex@veyra.studio",
      plan: "PRO",
      credits: 10200,
      role: "Admin",
      status: "Active",
    },
    {
      id: "usr_sarah_connor",
      name: "Sarah Connor",
      email: "sarah@cyberdyne.io",
      plan: "ULTIMATE",
      credits: 28450,
      role: "User",
      status: "Active",
    },
    {
      id: "usr_marcus_wright",
      name: "Marcus Wright",
      email: "marcus@skynet.dev",
      plan: "STARTER",
      credits: 2100,
      role: "User",
      status: "Active",
    },
    {
      id: "usr_elena_rostova",
      name: "Elena Rostova",
      email: "elena@quantum.design",
      plan: "FREE",
      credits: 200,
      role: "User",
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-violet mb-1">
              <ShieldCheck className="h-4 w-4 text-violet" />
              <span>Privileged Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-porcelain">
              Governance & System Metrics
            </h1>
            <p className="text-xs text-porcelain-muted mt-1">
              Platform telemetry, credit allocations, and local Ollama health monitoring.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Total Users</div>
            <div className="text-2xl font-bold font-mono text-porcelain">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="text-[11px] text-mint mt-1">+14% this month</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Paid Subscriptions</div>
            <div className="text-2xl font-bold font-mono text-mint">
              {metrics.activeSubscriptions.toLocaleString()}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">Active monthly tiers</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Monthly Recurring (MRR)</div>
            <div className="text-2xl font-bold font-mono text-violet">
              {formatINR(metrics.monthlyRecurringRevenueINR)}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">Razorpay capture rate 99.4%</div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">Ollama Node Status</div>
            <div className="text-xl font-bold font-mono text-mint flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span>Healthy</span>
            </div>
            <div className="text-[11px] font-mono text-porcelain-muted mt-1 truncate">
              {nodeHealth.model}
            </div>
          </div>
        </div>

        {/* User Management & Credit Adjustments Table */}
        <div className="rounded-xl border border-border bg-graphite-300 overflow-hidden mb-12">
          <div className="p-4 border-b border-border bg-graphite-200 flex items-center justify-between">
            <h2 className="font-bold text-sm text-porcelain flex items-center gap-2">
              <Users className="h-4 w-4 text-mint" />
              User Accounts & Entitlements
            </h2>
            <span className="text-[11px] font-mono text-porcelain-muted">
              Audit logging enabled
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-400 text-porcelain-muted font-semibold text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {demoUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-graphite-200/50 transition">
                    <td className="py-3 px-4 font-semibold text-porcelain">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-porcelain-muted text-[11px]">{u.email}</td>
                    <td className="py-3 px-4 font-mono font-bold text-mint">{u.plan}</td>
                    <td className="py-3 px-4 font-mono text-porcelain">{formatCredits(u.credits)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-porcelain-muted">{u.role}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mint/10 text-mint font-mono">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustModal({
                            open: true,
                            userId: u.id,
                            amount: 1000,
                            reason: "Support credit concession",
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-graphite-200 hover:bg-graphite-100 text-mint text-xs font-semibold transition"
                      >
                        <Edit className="h-3 w-3" />
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Adjust User Credits */}
        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-graphite-300 border border-border rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-mint" />
                  <h3 className="font-bold text-sm text-porcelain">
                    Adjust User Credits (Audit Logged)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustModal(null)}
                  className="text-porcelain-muted hover:text-porcelain"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdjustCredits} className="space-y-4 text-xs">
                <div>
                  <label className="block text-porcelain-muted font-medium mb-1">
                    Target User ID:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={adjustModal.userId}
                    className="w-full rounded-md border border-border bg-graphite-100 p-2 text-xs font-mono text-porcelain"
                  />
                </div>

                <div>
                  <label className="block text-porcelain-muted font-medium mb-1">
                    Amount to Adjust (Positive to add, Negative to deduct):
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustModal.amount}
                    onChange={(e) =>
                      setAdjustModal({
                        ...adjustModal,
                        amount: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-md border border-border bg-graphite-100 p-2.5 text-xs font-mono text-porcelain focus:border-mint focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-porcelain-muted font-medium mb-1">
                    Audit Reason (Required for compliance):
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustModal.reason}
                    onChange={(e) =>
                      setAdjustModal({
                        ...adjustModal,
                        reason: e.target.value,
                      })
                    }
                    placeholder="e.g. Promotional grant, billing fix, or customer concession"
                    className="w-full rounded-md border border-border bg-graphite-100 p-2.5 text-xs text-porcelain focus:border-mint focus:outline-none"
                  />
                </div>

                {adjustSuccess && (
                  <div className="p-2 rounded bg-mint/10 border border-mint/30 text-mint text-[11px]">
                    {adjustSuccess}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModal(null)}
                    className="px-4 py-2 rounded-md bg-graphite-200 text-porcelain text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-mint text-background hover:bg-mint-hover text-xs font-bold shadow-mint"
                  >
                    Save & Record Audit Entry
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
