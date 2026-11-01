# API Documentation: VEYRA Studio Server Endpoints

All private API routes require an authenticated user session cookie or `Authorization: Bearer <token>`.

## 1. AI & Generation
- `POST /api/ai/chat`: Streaming SSE endpoint for Ollama conversations.
  - Body: `{ projectId, conversationId, message, effortLevel, attachments }`
  - Validates project ownership, reserves credits, budgets tokens, streams responses.
- `POST /api/ai/cancel`: Cancels an active inference run and releases credit hold.
- `GET /api/ai/memory`: Retrieves persistent project memory and rolling summaries.

## 2. Projects & File System
- `GET /api/projects`: List user projects with pagination and filters.
- `POST /api/projects`: Create a new project scaffold.
- `GET /api/projects/:id`: Get full project metadata, pages, and file tree.
- `PUT /api/projects/:id/files`: Save or update a project file.
- `POST /api/projects/:id/export`: In-memory ZIP archive generation.
- `POST /api/projects/:id/publish`: Trigger Cloudflare Pages deployment adapter.

## 3. Billing & Credits
- `GET /api/billing/wallet`: Retrieve credit balance, daily reset countdown, and ledger.
- `POST /api/billing/checkout`:
  - When `TEST=YES`: Simulates payment capture and activates plan instantly.
  - When `TEST=NO`: Calls Razorpay Orders API to return `order_id` for gateway checkout.
- `POST /api/billing/verify`: Server-side HMAC SHA256 payment signature verification.
- `POST /api/billing/webhook/razorpay`: Razorpay webhook ingestion endpoint.

## 4. Web Research
- `POST /api/research/search`: SSRF-protected web search and citation extraction.

## 5. Admin Governance
- `GET /api/admin/metrics`: Platform revenue, active subscriptions, total tokens, node health.
- `GET /api/admin/users`: Paginated user list with plan and credit balances.
- `POST /api/admin/credits/adjust`: Manually grant or deduct credits with an audit reason.
- `PUT /api/admin/plans`: Update plan pricing, credit allotments, and effort permissions.
