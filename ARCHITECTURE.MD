# VEYRA Studio Architecture: High-Level Data Flow & Modular Design

```
+-----------------------------------------------------------------------------------+
|                                  BROWSER CLIENT                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | File Tree & Assets |  | Live Sandboxed Frame |  | AI Copilot & Effort Multi |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------|-----------------------------------------+
                                          | HTTPS / SSE Streaming
                                          v
+-----------------------------------------------------------------------------------+
|                            NEXT.JS APP ROUTER BACKEND                             |
|                                                                                   |
|  [Security & Rate Limiting] --> [Supabase Auth & Session] --> [Plan & Credit Gate]|
|                                                                                   |
|  +-----------------------+     +------------------------+     +----------------+  |
|  | Context Budgeter      |     | Ollama Orchestration   |     | Tool Registry  |  |
|  | - 4K Token Window     | --> | - Streaming Chat API   | <-> | - File Ops     |  |
|  | - Memory & Summaries  |     | - Configurable Model   |     | - Web Search   |  |
|  +-----------------------+     +------------------------+     +----------------+  |
+-----------------------------------------|-----------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
+------------------------------------+         +------------------------------------+
|         SUPABASE / POSTGRES        |         |            LOCAL OLLAMA            |
|  - RLS Security Policies           |         |  - Endpoint: 127.0.0.1:11434       |
|  - Projects & File Versions        |         |  - Configurable OLLAMA_MODEL       |
|  - Persistent Memory & Summaries   |         |  - Real-time Token Streaming       |
|  - Immutable Credit Ledger         |         +------------------------------------+
|  - Plans & Subscriptions           |
+------------------------------------+
```

## 1. Architectural Layers

### Frontend Layer
- **Framework**: Next.js App Router (React 19, TypeScript).
- **Design Tokens**: **Midnight Atelier** design system faithfully translated from Google Stitch.
- **Preview Isolation**: Generated user websites run inside an isolated `<iframe>` sandbox communicating via strict `postMessage` contracts. Application secrets, cookies, and tokens are completely shielded from generated code.
- **Code Editor**: Integrated Monaco/CodeMirror editor featuring syntax highlighting, error checking, and AI diff acceptance.

### Backend Orchestration Layer
- **AI Orchestrator**: Manages conversation history, token allocation, tool invocation, and streaming responses from Ollama.
- **Context Budgeting Engine**: Ensures prompt payloads strictly fit inside the ~4,000 token limit without truncation or amnesia by utilizing persistent project memory, semantic chunks, and incremental summaries.
- **Tool Execution System**: Validates tool calls against strict Zod schemas and executes server-side operations (file read/write, search, memory updates).

### Storage & Persistence Layer
- **PostgreSQL via Supabase**: Stores projects, file metadata, memory chunks, and billing records with strict Row Level Security (RLS).
- **Object Storage**: Private bucket storage (Supabase Storage / Cloudflare R2) for user uploaded images, assets, and project export archives.

### Billing & Entitlements Engine
- **Test Mode (`TEST=YES`)**: Instant checkout simulation, simulated payment records, and test entitlement grants.
- **Production Mode (`TEST=NO`)**: Razorpay API integration, HMAC SHA256 webhook signature validation, idempotency guards, and payment capture.
- **Immutable Ledger**: Concurrency-safe double-entry ledger tracking daily allowances, subscription grants, reservations, deductions, and refunds.
