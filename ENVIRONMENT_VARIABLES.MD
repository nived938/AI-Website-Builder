# Environment Variables Guide: VEYRA Studio

This document details every environment variable used across VEYRA Studio, its security scope, and expected format.

| Variable Name | Required | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Node.js runtime environment |
| `APP_URL` | Yes | `http://localhost:3000` | Canonical origin of the platform |
| **`TEST`** | **Yes** | **`YES`** or **`NO`** | Billing test mode switch. Set to `YES` to simulate payments without a real gateway. |
| `OLLAMA_BASE_URL` | Yes | `http://127.0.0.1:11434` | Endpoint for local or private Ollama instance |
| **`OLLAMA_MODEL`** | **Yes** | *(Empty by default)* | Model tag to use (e.g., `llama3.2`, `qwen2.5-coder:7b`) |
| `OLLAMA_NUM_CTX` | No | `4096` | Token context window budget |
| `OLLAMA_TEMPERATURE` | No | `0.2` | Temperature for deterministic code output |
| `OLLAMA_TIMEOUT_MS` | No | `120000` | HTTP request timeout in milliseconds |
| `OLLAMA_KEEP_ALIVE` | No | `5m` | Keeps the model loaded in GPU VRAM |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://xyz.supabase.co` | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJhb...` | Public client anon key for browser authentication |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJhb...` | Server-only secret key for privileged operations |
| `DATABASE_URL` | No | `postgres://user:pass@host:5432/db` | Direct PostgreSQL connection string |
| `SEARCH_PROVIDER` | No | `tavily` or `brave` | Provider for AI web research |
| `TAVILY_API_KEY` | Optional | `tvly-...` | Tavily Search API key |
| `BRAVE_SEARCH_API_KEY` | Optional | `BSA...` | Brave Search API key |
| `PAYMENT_PROVIDER` | Yes | `razorpay` | Primary payment processing engine |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` / `rzp_live_...` | Razorpay Key ID (Mandatory when `TEST=NO`) |
| `RAZORPAY_KEY_SECRET` | Optional | `...` | Razorpay Key Secret (Mandatory when `TEST=NO`) |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `...` | Webhook verification secret |
| `UPSTASH_REDIS_REST_URL` | Optional | `https://...upstash.io` | Distributed Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `...` | Upstash Redis REST token |
| `CLOUDFLARE_ACCOUNT_ID` | Optional | `...` | Cloudflare account ID for website publishing |
| `CLOUDFLARE_API_TOKEN` | Optional | `...` | Cloudflare Pages deployment token |
