export type EffortLevel = "LOW" | "MEDIUM" | "HIGH" | "MAX";

export interface PlanConfig {
  id: "FREE" | "STARTER" | "PRO" | "ULTIMATE";
  name: string;
  monthlyPriceINR: number;
  annualPriceINR: number;
  monthlyCredits: number;
  dailyFreeCredits: number;
  allowedEffortLevels: EffortLevel[];
  maxProjects: number;
  maxUploadSizeMB: number;
  maxTotalStorageMB: number;
  webResearchEnabled: boolean;
  customDomainsEnabled: boolean;
  priorityInference: boolean;
}

export const EFFORT_MULTIPLIERS: Record<EffortLevel, number> = {
  LOW: 1.0,
  MEDIUM: 2.0,
  HIGH: 4.0,
  MAX: 8.0,
};

export const PLANS: Record<string, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    monthlyPriceINR: 0,
    annualPriceINR: 0,
    monthlyCredits: 0,
    dailyFreeCredits: 200,
    allowedEffortLevels: ["LOW"],
    maxProjects: 3,
    maxUploadSizeMB: 5,
    maxTotalStorageMB: 25,
    webResearchEnabled: false,
    customDomainsEnabled: false,
    priorityInference: false,
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    monthlyPriceINR: 999,
    annualPriceINR: 9990,
    monthlyCredits: 2500,
    dailyFreeCredits: 200,
    allowedEffortLevels: ["LOW", "MEDIUM"],
    maxProjects: 10,
    maxUploadSizeMB: 10,
    maxTotalStorageMB: 100,
    webResearchEnabled: true,
    customDomainsEnabled: false,
    priorityInference: false,
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    monthlyPriceINR: 2499,
    annualPriceINR: 24990,
    monthlyCredits: 10000,
    dailyFreeCredits: 200,
    allowedEffortLevels: ["LOW", "MEDIUM", "HIGH"],
    maxProjects: 100,
    maxUploadSizeMB: 25,
    maxTotalStorageMB: 500,
    webResearchEnabled: true,
    customDomainsEnabled: true,
    priorityInference: false,
  },
  ULTIMATE: {
    id: "ULTIMATE",
    name: "Ultimate",
    monthlyPriceINR: 5999,
    annualPriceINR: 59990,
    monthlyCredits: 30000,
    dailyFreeCredits: 200,
    allowedEffortLevels: ["LOW", "MEDIUM", "HIGH", "MAX"],
    maxProjects: 1000,
    maxUploadSizeMB: 50,
    maxTotalStorageMB: 2048,
    webResearchEnabled: true,
    customDomainsEnabled: true,
    priorityInference: true,
  },
};

export const CREDIT_BUNDLES = [
  { id: "bundle_1k", name: "1,000 Credits", credits: 1000, priceINR: 499 },
  { id: "bundle_5k", name: "5,000 Credits", credits: 5000, priceINR: 1999 },
  { id: "bundle_20k", name: "20,000 Credits", credits: 20000, priceINR: 6999 },
];

/**
 * Validates whether a user's plan permits the selected effort level.
 */
export function validateEffortForPlan(planId: string, effort: EffortLevel): boolean {
  const plan = PLANS[planId] || PLANS.FREE;
  return plan.allowedEffortLevels.includes(effort);
}

/**
 * Calculates credit estimate for a proposed generation task.
 */
export function estimateTaskCredits(baseTokens: number, effort: EffortLevel): number {
  const multiplier = EFFORT_MULTIPLIERS[effort] || 1.0;
  // Standard conversion: 1 credit per ~100 tokens processed, multiplied by effort
  const baseCredits = Math.max(1, Math.ceil(baseTokens / 100));
  return Math.ceil(baseCredits * multiplier);
}
