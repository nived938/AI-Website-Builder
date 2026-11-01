"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Zap,
  Terminal,
  Shield,
  CreditCard,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PLANS, CREDIT_BUNDLES, PlanConfig } from "@/lib/billing/plans";
import { formatCredits, formatINR } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activePlanId, setActivePlanId] = useState<string>("PRO");
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    itemType: "subscription" | "credit_bundle";
    itemId: string;
    itemName: string;
    amountINR: number;
    orderId?: string;
  } | null>(null);

  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/billing/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) {
          setActivePlanId(data.subscription.planId);
          setIsTestMode(data.subscription.isSimulated ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenCheckout = async (
    itemType: "subscription" | "credit_bundle",
    itemId: string,
    itemName: string,
    amountINR: number
  ) => {
    setCheckoutStatus(null);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout initiation failed");

      setCheckoutModal({
        open: true,
        itemType,
        itemId,
        itemName,
        amountINR,
        orderId: data.order?.orderId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!checkoutModal) return;
    setIsProcessing(true);
    setCheckoutStatus("Verifying simulated cryptographic transaction...");

    try {
      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: checkoutModal.orderId,
          paymentId: `pay_sim_${Date.now()}`,
          signature: "simulated_sig_ok",
          itemType: checkoutModal.itemType,
          itemId: checkoutModal.itemId,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setCheckoutStatus("Transaction confirmed! Entitlements and credits updated.");
      if (checkoutModal.itemType === "subscription") {
        setActivePlanId(checkoutModal.itemId);
      }

      setTimeout(() => {
        setCheckoutModal(null);
        setCheckoutStatus(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCheckoutStatus(`Simulation error: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-porcelain font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Header & Mode Notice */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* TEST MODE SWITCH BADGE */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet/40 bg-violet-dim px-4 py-1 text-xs font-mono font-bold text-violet mb-4">
            <Terminal className="h-3.5 w-3.5" />
            <span>
              {isTestMode
                ? "TEST MODE: SIMULATED BILLING (TEST=YES)"
                : "LIVE GATEWAY: RAZORPAY ACTIVE (TEST=NO)"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-porcelain">
            Simple, Transparent Credit Billing
          </h1>
          <p className="text-sm text-porcelain-muted mt-3">
            Every account gets 200 daily free credits. Subscribe for higher monthly credit allowances, or purchase top-up bundles that never expire.
          </p>

          {/* Monthly vs Annual Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs">
            <span
              className={`font-semibold cursor-pointer ${
                billingCycle === "monthly" ? "text-mint font-bold" : "text-porcelain-muted"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() =>
                setBillingCycle((prev) => (prev === "monthly" ? "annual" : "monthly"))
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-graphite-100 border border-border transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-mint transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <span
              className={`font-semibold cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual" ? "text-mint font-bold" : "text-porcelain-muted"
              }`}
              onClick={() => setBillingCycle("annual")}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-mint/20 text-mint px-2 py-0.5 text-[10px] font-mono font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 4 Plan Tiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {(Object.values(PLANS) as PlanConfig[]).map((plan) => {
            const isCurrent = activePlanId === plan.id;
            const price =
              billingCycle === "annual" ? plan.annualPriceINR : plan.monthlyPriceINR;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-xl bg-graphite-300 border flex flex-col justify-between transition-all duration-200 relative ${
                  plan.id === "PRO"
                    ? "border-mint shadow-mint bg-graphite-200/90"
                    : "border-border hover:border-border/80"
                }`}
              >
                {plan.id === "PRO" && (
                  <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-mint text-background text-[10px] font-extrabold uppercase tracking-wide">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-porcelain-muted">
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mint/20 text-mint font-bold">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-extrabold text-porcelain mt-3">
                    {formatINR(price)}
                    <span className="text-xs text-porcelain-muted font-normal">
                      /{billingCycle === "annual" ? "yr" : "mo"}
                    </span>
                  </div>

                  <div className="text-xs text-mint mt-1 font-mono font-semibold">
                    {plan.monthlyCredits > 0
                      ? `+${formatCredits(plan.monthlyCredits)} credits/mo`
                      : "200 daily free credits"}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-porcelain-muted">
                    <li className="flex items-center gap-2 text-porcelain">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint shrink-0" />
                      <span>{plan.dailyFreeCredits} daily credits reset</span>
                    </li>
                    <li className="flex items-center gap-2 text-porcelain">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint shrink-0" />
                      <span>Effort: {plan.allowedEffortLevels.join(", ")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint shrink-0" />
                      <span>Max {plan.maxProjects} website projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint shrink-0" />
                      <span>Up to {plan.maxUploadSizeMB}MB uploads</span>
                    </li>
                    {plan.webResearchEnabled && (
                      <li className="flex items-center gap-2 text-porcelain">
                        <CheckCircle2 className="h-3.5 w-3.5 text-mint shrink-0" />
                        <span>Web research & citations</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-border">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded-md bg-graphite-100 text-porcelain-muted text-xs font-bold cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenCheckout("subscription", plan.id, `${plan.name} Plan`, price)
                      }
                      className={`w-full py-2 rounded-md text-xs font-bold transition shadow-sm ${
                        plan.id === "PRO"
                          ? "bg-mint text-background hover:bg-mint-hover shadow-mint"
                          : "bg-graphite-100 text-porcelain hover:bg-graphite-50"
                      }`}
                    >
                      {price === 0 ? "Downgrade to Free" : `Subscribe to ${plan.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pay-As-You-Go Credit Top-Up Packs */}
        <div className="rounded-xl border border-border bg-graphite-300 p-6 sm:p-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-porcelain flex items-center gap-2">
                <Zap className="h-5 w-5 text-mint" />
                Pay-As-You-Go Credit Bundles
              </h2>
              <p className="text-xs text-porcelain-muted mt-1">
                Need more credits for deep MAX effort generation? Top-up credits never expire.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_BUNDLES.map((bundle) => (
              <div
                key={bundle.id}
                className="p-5 rounded-lg bg-graphite-200 border border-border flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-porcelain">{bundle.name}</div>
                  <div className="font-mono text-xs text-mint mt-0.5">
                    {formatCredits(bundle.credits)} AI Credits
                  </div>
                  <div className="text-xs text-porcelain-muted mt-1">
                    {formatINR(bundle.priceINR)} one-time
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenCheckout("credit_bundle", bundle.id, bundle.name, bundle.priceINR)
                  }
                  className="px-3 py-1.5 rounded-md bg-mint text-background text-xs font-bold hover:bg-mint-hover transition shadow-mint"
                >
                  Buy Pack
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Simulated Checkout & Razorpay Switch */}
        {checkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-graphite-300 border border-border rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-mint" />
                  <h3 className="font-bold text-sm text-porcelain">
                    Secure Payment Checkout
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutModal(null)}
                  className="text-porcelain-muted hover:text-porcelain"
                >
                  ✕
                </button>
              </div>

              {isTestMode ? (
                /* SIMULATED BILLING (TEST=YES) */
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-lg bg-violet-dim border border-violet/30 text-violet text-[11px] font-mono">
                    <span className="font-bold">SANDBOX SIMULATION ACTIVE</span>: You are testing with TEST=YES. No real credit card or INR charge will occur.
                  </div>

                  <div className="p-4 rounded-lg bg-graphite-200 border border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-porcelain-muted">Item:</span>
                      <span className="font-semibold text-porcelain">{checkoutModal.itemName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-porcelain-muted">Cycle:</span>
                      <span className="font-mono text-porcelain">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                      <span>Total Amount:</span>
                      <span className="text-mint">{formatINR(checkoutModal.amountINR)}</span>
                    </div>
                    <div className="text-[10px] font-mono text-porcelain-muted truncate">
                      OrderId: {checkoutModal.orderId}
                    </div>
                  </div>

                  {checkoutStatus && (
                    <div className="p-2 rounded bg-mint/10 border border-mint/30 text-mint text-[11px]">
                      {checkoutStatus}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePaymentSuccess}
                      className="w-full py-2.5 rounded-md bg-mint text-background hover:bg-mint-hover font-bold text-xs shadow-mint transition disabled:opacity-50"
                    >
                      {isProcessing ? "Processing Simulation..." : "Simulate Successful Payment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutModal(null)}
                      className="w-full py-2 rounded-md bg-graphite-200 hover:bg-graphite-100 text-porcelain-muted text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* REAL RAZORPAY GATEWAY (TEST=NO) */
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-lg bg-mint/10 border border-mint/30 text-mint text-[11px]">
                    Connecting to live Razorpay checkout window...
                  </div>
                  <div className="text-center py-4 text-porcelain-muted">
                    Order ID: <code className="text-porcelain">{checkoutModal.orderId}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
