"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Shield,
  CreditCard,
  Plus,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatCredits } from "@/lib/utils";

interface LedgerItem {
  id: string;
  amount: number;
  balanceType: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<{
    dailyFree: number;
    subscription: number;
    purchased: number;
    total: number;
    lifetimeUsed: number;
    resetCountdown: string;
  }>({
    dailyFree: 200,
    subscription: 10000,
    purchased: 0,
    total: 10200,
    lifetimeUsed: 180,
    resetCountdown: "6h 12m",
  });

  const [ledger, setLedger] = useState<LedgerItem[]>([]);

  useEffect(() => {
    fetch("/api/billing/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.creditAccount) {
          setWallet({
            dailyFree: data.creditAccount.dailyFreeCredits,
            subscription: data.creditAccount.subscriptionCredits,
            purchased: data.creditAccount.purchasedCredits,
            total: data.creditAccount.totalAvailable,
            lifetimeUsed: data.creditAccount.lifetimeUsedCredits,
            resetCountdown: data.resetCountdown?.formatted || "6h 12m",
          });
        }
        if (data.ledger) {
          setLedger(data.ledger);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-porcelain flex items-center gap-2">
              <Zap className="h-6 w-6 text-mint" />
              Credit Wallet & Ledger
            </h1>
            <p className="text-xs text-porcelain-muted mt-1">
              Concurrency-safe, immutable accounting. Daily free credits reset at 00:00 UTC.
            </p>
          </div>

          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-4 py-2 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Top-up Credits</span>
          </Link>
        </div>

        {/* 4 Balance Breakdown Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-graphite-300 border border-mint/40 shadow-mint">
            <div className="text-xs text-mint font-bold uppercase tracking-wider mb-1">
              Total Available
            </div>
            <div className="text-3xl font-black font-mono text-porcelain">
              {formatCredits(wallet.total)}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">
              Ready for generation
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">
              Daily Free Allowance
            </div>
            <div className="text-2xl font-bold font-mono text-mint">
              {formatCredits(wallet.dailyFree)}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-mint" />
              Reset in {wallet.resetCountdown}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">
              Subscription Allowance
            </div>
            <div className="text-2xl font-bold font-mono text-violet">
              {formatCredits(wallet.subscription)}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">
              Pro plan allocation
            </div>
          </div>

          <div className="p-4 rounded-xl bg-graphite-300 border border-border">
            <div className="text-xs text-porcelain-muted font-medium mb-1">
              Purchased Top-ups
            </div>
            <div className="text-2xl font-bold font-mono text-porcelain">
              {formatCredits(wallet.purchased)}
            </div>
            <div className="text-[11px] text-porcelain-muted mt-1">
              Never expires
            </div>
          </div>
        </div>

        {/* Immutable Credit Transaction Ledger Table */}
        <div className="rounded-xl border border-border bg-graphite-300 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-graphite-200">
            <h2 className="font-bold text-sm text-porcelain flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet" />
              Immutable Transaction Audit Ledger
            </h2>
            <span className="text-[11px] text-porcelain-muted font-mono">
              Double-entry accounting
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-400 text-porcelain-muted font-semibold text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Bucket</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map((item) => {
                  const isPositive = item.amount > 0;
                  return (
                    <tr key={item.id} className="hover:bg-graphite-200/50 transition">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                            isPositive
                              ? "bg-mint/10 text-mint"
                              : "bg-violet-dim text-violet"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          {item.actionType}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 font-mono font-bold ${
                          isPositive ? "text-mint" : "text-porcelain"
                        }`}
                      >
                        {isPositive ? `+${item.amount}` : item.amount}
                      </td>
                      <td className="py-3 px-4 font-mono text-porcelain-muted text-[11px]">
                        {item.balanceType}
                      </td>
                      <td className="py-3 px-4 text-porcelain max-w-sm truncate">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-porcelain-muted">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
