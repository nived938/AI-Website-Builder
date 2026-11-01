import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  
  // Billing Test Mode: YES = Simulated, NO = Real Payment Gateway
  TEST: z.enum(["YES", "NO"]).default("YES"),

  // Ollama AI Engine
  OLLAMA_BASE_URL: z.string().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default(""),
  OLLAMA_NUM_CTX: z.coerce.number().default(4096),
  OLLAMA_TEMPERATURE: z.coerce.number().default(0.2),
  OLLAMA_TIMEOUT_MS: z.coerce.number().default(120000),
  OLLAMA_KEEP_ALIVE: z.string().default("5m"),

  // Database & Supabase
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Search Provider (Tavily or Brave)
  SEARCH_PROVIDER: z.enum(["tavily", "brave"]).default("tavily"),
  TAVILY_API_KEY: z.string().optional(),
  BRAVE_SEARCH_API_KEY: z.string().optional(),

  // Payment
  PAYMENT_PROVIDER: z.string().default("razorpay"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),

  // Deployment
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid application environment configuration. Check server logs.");
  }

  const env = result.data;

  // Critical Security Check: In production, TEST mode cannot be YES
  if (env.NODE_ENV === "production" && env.TEST === "YES") {
    console.warn("⚠️ SECURITY WARNING: TEST=YES is set in production. Billing simulation must be disabled in production.");
  }

  // When TEST=NO, check Razorpay credentials
  if (env.TEST === "NO" && (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET)) {
    console.warn("⚠️ PAYMENT CONFIG WARNING: TEST=NO requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET. Real payments will fail without them.");
  }

  parsedEnv = env;
  return parsedEnv;
}
