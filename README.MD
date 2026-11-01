# VEYRA Studio
> **Your idea, built for the web.**

VEYRA Studio is a production-oriented AI website builder and SaaS IDE designed for rapid, natural-language web development powered by local **Ollama** inference, persistent 4,000-token memory, credit billing, and dual payment modes (`TEST=YES` simulation / `TEST=NO` Razorpay gateway).

---

## Key Features

- **Local Ollama Inference**: Pure server-side orchestration with configurable models via `.env`. No expensive third-party LLM lock-in.
- **4,000-Token Persistent Memory**: Long conversations never cause amnesia or context-overflow errors. Context is dynamically budgeted with rolling summaries, technical decision logs, and PostgreSQL full-text search.
- **Midnight Atelier Design System**: Premium, dark luxury aesthetic designed in Google Stitch (`#0B1020` deep background, `#111827` graphite, `#C8FF70` luminous mint, `#8B75FF` electric violet).
- **Interactive Website Creation Workspace**:
  - Live preview with isolated iframe sandbox (Desktop, Tablet, Mobile responsive modes).
  - Code editor with syntax highlighting and AI diff visualizer.
  - Project file manager, asset uploader (images & documents), and version history checkpoints.
- **AI Reasoning Effort Engine**: 4 configurable effort tiers (LOW 1x, MEDIUM 2x, HIGH 4x, MAX 8x) controlling plan depth, file inspection, and verification passes.
- **Dual-Mode Billing & Wallet**:
  - `TEST=YES`: Simulated payment checkout, instant test entitlements, and sandboxed credit testing.
  - `TEST=NO`: Real Razorpay gateway with order verification, HMAC SHA256 webhook signatures, and subscription management.
  - Free tier with automatic 200 daily credits reset.
- **Internet Web Research**: SSRF-protected search engine integration (Tavily / Brave Search) with citations and source panel.
- **Protected Admin Portal**: Real-time user metrics, credit adjustment with audit reasons, plan pricing editor, and Ollama node health diagnostics.
- **Export & Publishing**: 1-click ZIP bundle export and Cloudflare Pages deployment adapter.

---

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Next.js Server Actions & API Route Handlers, Zod Validation.
- **Database**: PostgreSQL with Supabase Auth & Row Level Security (RLS).
- **AI Engine**: Ollama HTTP API with streaming support and server-side tool execution.
- **Payment Processing**: Razorpay Node.js SDK with automated test mode simulation.
- **Testing**: Vitest for unit & integration tests, Playwright for end-to-end browser flows.

---

## Quick Start

### 1. Prerequisites
- Node.js `v20.x` or higher
- Ollama installed and running locally (`ollama run <model>`)
- PostgreSQL database (Supabase instance)

### 2. Installation
```bash
git clone https://github.com/veyra-studio/veyra-studio.git
cd veyra-studio
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your database and Ollama parameters:
```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
TEST=YES
```

### 4. Database Setup & Migrations
```bash
npm run db:migrate
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view VEYRA Studio in your browser.
