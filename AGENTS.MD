# Agent Task Instructions & Alignment Rules: VEYRA Studio

This document governs agentic coding behaviors, architectural contracts, and operational guidelines for autonomous and semi-autonomous coding agents working within **VEYRA Studio**.

## 1. Core Architectural Directives

- **Zero Fake Functionality**: Never mock backend responses or simulate success in production execution paths. If an external credential is missing, surface a clean missing-configuration error with setup instructions.
- **Ollama Exclusivity**: All natural language reasoning, code planning, code synthesis, and diff generation must flow through the server-side Ollama client. Do not introduce paid external LLM dependencies.
- **Strict Context Budgeting**: Assume a hard 4,000 token context window (`OLLAMA_NUM_CTX=4096`). Under no circumstance should an agent dump raw file histories or extensive uncompressed conversations into the prompt. Always invoke the retrieval and incremental summarization pipeline.
- **Billing Security**:
  - The `TEST` environment variable is the sole authoritative switch for billing simulation.
  - When `TEST=YES`, simulate payments and entitlements with clear test mode markers.
  - When `TEST=NO`, require authentic Razorpay signature verification and webhook authentication.
  - Never allow client-side modification of credit balances or plan tiers.

## 2. Code Generation Protocol
1. Before proposing file mutations:
   - Check user project ownership and authorization.
   - Atomically reserve estimated credits based on task complexity and selected Effort level (LOW, MED, HIGH, MAX).
   - Create a project checkpoint.
2. Validate generated HTML/CSS/JS/React code before committing it to the project file manager.
3. Serve website previews through sandboxed iframe containers with strict origin isolation.
4. Record actual token/credit usage in the immutable `credit_ledger` and release any unused credit reservations.

## 3. Design System Conformance
- Always apply the **Midnight Atelier** design system:
  - Deep obsidian background: `#0B1020`
  - Slate graphite container: `#111827`
  - Clean porcelain text: `#F4F3EF`
  - Luminous mint for primary actions and progress: `#C8FF70`
  - Electric violet for AI thinking and telemetry: `#8B75FF`
  - Secondary text: `#929BAD`
- Interface typography: **Manrope**
- Code & technical tokens: **JetBrains Mono**
