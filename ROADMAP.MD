# VEYRA Studio: Product Roadmap & Implementation Matrix

## Phase 1: Stitch Design & Application Shell
- [x] Create Google Stitch Project and apply Midnight Atelier design system (`projects/2114857465885207418`)
- [x] Generate desktop workspace, public landing, user dashboard, pricing/billing, admin, and mobile screens in Stitch
- [x] Set up Next.js App Router project workspace with TypeScript, Tailwind CSS, and Midnight Atelier tokens
- [x] Implement responsive application shell, navigation bars, and layout sidebars

## Phase 2: Authentication, Security & Database Foundation
- [x] Configure Supabase Auth client & server-side session management
- [x] Author comprehensive PostgreSQL database schema with migration files
- [x] Establish Row Level Security (RLS) policies for user data isolation
- [x] Implement profiles, user settings, audit logs, and authentication rate limits

## Phase 3: Ollama Connector & 4,000-Token Persistent AI Memory
- [x] Implement robust server-side Ollama client with streaming support and configurable `OLLAMA_MODEL`
- [x] Design token budgeting engine adhering strictly to `OLLAMA_NUM_CTX=4096`
- [x] Build incremental conversation summarization and technical decision preservation
- [x] Implement hybrid retrieval (PostgreSQL full-text search + project memory chunks)
- [x] Create server-side AI tool registry with strict argument schema validation

## Phase 4: Website Builder Workspace & Code Editor
- [x] Build 3-column builder layout (File tree, Live Preview / Code Editor split, AI Chat panel)
- [x] Implement responsive device toggles (Desktop 1440px, Tablet 768px, Mobile 390px)
- [x] Integrate high-performance code editor (CodeMirror/Monaco) with syntax highlighting and AI diff visualizer
- [x] Create isolated sandboxed iframe preview with safe parent-child communication bridge
- [x] Implement multi-format asset uploader (images, documents) with size & MIME validation

## Phase 5: Web Research & Document Extraction
- [x] Abstract search provider interface supporting Tavily & Brave Search APIs
- [x] Implement SSRF protection (localhost/private IP blocking, redirect validation, payload limits)
- [x] Add source metadata storage (citations, publication dates, relevant text snippets)
- [x] Build workspace research panel with clickable source citations

## Phase 6: Subscriptions, Credit Wallet & Dual Payment Switch
- [x] Build immutable `credit_ledger` with atomic reservations, releases, and 200 free daily reset logic
- [x] Implement AI Effort level multiplier (LOW 1x, MED 2x, HIGH 4x, MAX 8x) with plan tier gating
- [x] Implement `TEST=YES` simulation engine (instant sandbox checkout, simulated entitlements)
- [x] Implement `TEST=NO` Razorpay integration (order creation, HMAC SHA256 signature verification, webhook ingestion)
- [x] Build user credit wallet UI with ledger history and credit pack purchases

## Phase 7: Rate Limiting, Admin Portal & SEO
- [x] Implement distributed Redis rate limiting with PostgreSQL fallback
- [x] Build protected Admin Dashboard (user management, plan adjustments, Ollama node diagnostics, audit stream)
- [x] Implement VEYRA platform SEO (meta tags, OpenGraph, JSON-LD, sitemap.xml, robots.txt)
- [x] Add in-builder SEO audit tools for generated websites (meta tags, heading hierarchy, alt text suggestions)

## Phase 8: Testing, Verification & Production Packaging
- [x] Unit & integration tests for credit accounting, token budgeting, and tool validation
- [x] End-to-end tests for website creation, editing, previewing, and ZIP exporting
- [x] Full documentation suite and deployment guides
