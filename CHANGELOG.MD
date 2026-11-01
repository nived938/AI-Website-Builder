# Changelog

All notable changes to **VEYRA Studio** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-01

### Added
- Complete **VEYRA Studio** core platform initialization with **Midnight Atelier** design system.
- Connected Google Stitch project integration (`projects/2114857465885207418`) and design tokens (`assets/11781549634845847867`).
- Dedicated Ollama orchestration engine supporting streaming responses, tool calling, structured JSON fallbacks, and configurable models via `.env`.
- High-efficiency 4,000-token context budgeting layer with persistent database memory, incremental conversation summarization, and vector/full-text hybrid retrieval.
- Comprehensive website creation workspace: 3-pane responsive layout with live isolated iframe preview, Monaco/CodeMirror code editor, asset manager, and AI chat panel.
- Dual-mode billing system with `TEST=YES` (simulated payments, entitlement tests) and `TEST=NO` (Razorpay order creation, payment signature verification, webhook processing).
- Concurrency-safe, immutable credit ledger with atomic reservations, releases, 200 free daily reset cron, and subscription tier allowances.
- Multi-effort AI reasoning pipeline (LOW, MEDIUM, HIGH, MAX) with tier gating and credit cost multipliers (1x, 2x, 4x, 8x).
- SSRF-safe internet web research system with Tavily / Brave Search abstraction, citations extraction, and source tracking.
- Protected multi-tier Admin Portal for real-time user management, plan editing, credit auditing, and model health diagnostics.
- Full suite of database schema migrations and Row Level Security (RLS) policies for user data isolation.

### Changed
- Refactored prompt synthesis to strictly allocate token budgets across system prompts, memory summaries, recent dialog, and output reservation.
- Enhanced file modification pipeline to produce atomic checkpoints prior to code mutation.

### Fixed
- Prevented prompt injection by strictly isolating uploaded document excerpts and web research results as untrusted data references.
- Eliminated client-side authority over credit balances and billing statuses.
