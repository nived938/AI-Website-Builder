"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Bell, User, Sparkles, Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCredits } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [wallet, setWallet] = useState<{
    dailyFree: number;
    total: number;
    resetCountdown: string;
    isTestMode: boolean;
  }>({
    dailyFree: 200,
    total: 10200,
    resetCountdown: "6h 12m",
    isTestMode: true,
  });

  useEffect(() => {
    fetch("/api/billing/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.creditAccount) {
          setWallet({
            dailyFree: data.creditAccount.dailyFreeCredits,
            total: data.creditAccount.totalAvailable,
            resetCountdown: data.resetCountdown?.formatted || "6h 12m",
            isTestMode: data.subscription?.isSimulated ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "Templates", href: "/templates" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-mint font-mono text-sm font-black text-background transition-transform duration-200 group-hover:scale-105 shadow-mint">
              V
            </span>
            <span className="font-sans text-base font-extrabold tracking-tight text-porcelain">
              VEYRA <span className="font-normal text-porcelain-muted">Studio</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-graphite-100 text-mint"
                      : "text-porcelain-muted hover:text-porcelain hover:bg-graphite-200/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Credits, Billing Mode, and User Profile */}
        <div className="flex items-center gap-3">
          {/* Daily Credit Reset Pill */}
          <Link
            href="/wallet"
            className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-graphite-200/60 px-3 py-1 text-xs text-porcelain transition hover:border-mint/50 hover:bg-graphite-100"
            title={`Free daily reset in ${wallet.resetCountdown}`}
          >
            <Zap className="h-3.5 w-3.5 text-mint animate-pulse" />
            <span className="font-mono font-medium text-mint">
              {formatCredits(wallet.total)}
            </span>
            <span className="text-porcelain-muted text-[11px] hidden lg:inline">
              (Reset in {wallet.resetCountdown})
            </span>
          </Link>

          {/* Test Mode Badge */}
          {wallet.isTestMode && (
            <span className="hidden xl:inline-flex items-center gap-1 rounded bg-violet-dim px-2 py-0.5 text-[10px] font-mono font-semibold text-violet border border-violet/30">
              <Terminal className="h-2.5 w-2.5" />
              TEST MODE
            </span>
          )}

          {/* Notification Icon */}
          <button
            type="button"
            className="relative rounded-md p-1.5 text-porcelain-muted hover:bg-graphite-200 hover:text-porcelain transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-mint" />
          </button>

          {/* User Profile / Dashboard CTA */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full border border-border bg-graphite-100 p-1 pl-2.5 text-xs font-semibold text-porcelain hover:border-mint/50 transition"
          >
            <span className="hidden sm:inline text-xs">Alex Vance</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet text-background font-mono text-[11px] font-bold">
              AV
            </div>
          </Link>

          {/* Primary Action Button */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-1.5 rounded-md bg-mint px-3 py-1.5 text-xs font-bold text-background transition hover:bg-mint-hover shadow-mint"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Website
          </Link>
        </div>
      </div>
    </header>
  );
}
