# Antigravity (AGY) Build Configuration

## Project: VEYRA Studio
**Tagline**: Your idea, built for the web.

```yaml
version: "2.0"
runtime:
  framework: "nextjs-app-router"
  engine: "nodejs-24.x"
  package_manager: "npm"
  typescript: true
  strict_mode: true

design_system:
  theme: "Midnight Atelier"
  connected_stitch_project: "projects/2114857465885207418"
  connected_stitch_asset: "assets/11781549634845847867"
  palette:
    background: "#0B1020"
    graphite: "#111827"
    porcelain: "#F4F3EF"
    electric_violet: "#8B75FF"
    luminous_mint: "#C8FF70"
    secondary_text: "#929BAD"

ai_inference:
  provider: "ollama"
  endpoint: "http://127.0.0.1:11434"
  context_budget: 4096
  streaming: true
  temperature: 0.2
  reasoning_effort_multipliers:
    low: 1.0
    medium: 2.0
    high: 4.0
    max: 8.0

billing_system:
  test_mode_switch: "TEST" # Controlled by env variable TEST=YES or TEST=NO
  daily_free_credits: 200
  gateway: "razorpay"
  currency: "INR"

security:
  isolation: "strict-iframe-sandbox"
  ssrf_guard: true
  rate_limiting: "redis-with-postgres-fallback"
  token_budget_guard: true
```
