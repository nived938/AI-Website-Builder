# Database Architecture & Migration Log: VEYRA Studio

## 1. Connection Architecture
- **Engine**: PostgreSQL 15+ (Hosted on Supabase or self-hosted)
- **Extensions**: `uuid-ossp`, `pgcrypto`, optional `pgvector` for semantic memory retrieval.
- **Access Model**: All direct client access is strictly controlled by Row Level Security (RLS). Server-side operations run through authenticated client contexts or controlled service-role functions with explicit audit logs.

## 2. Core Relational Schema

### Auth & Profiles
- `profiles`: User identities, display names, avatars, created_at.
- `user_settings`: User preferences, default editor themes, notifications.
- `user_roles`: Role-based access control (`admin`, `user`).

### Projects & File Storage
- `projects`: Project metadata, framework (`html`, `react`, `nextjs`), created_at, updated_at.
- `project_files`: File paths, content, size, mime_type, project_id.
- `project_file_versions`: Historical file snapshots for rollback and diffing.
- `project_assets`: Uploaded images and documents with size, mime_type, storage_path.
- `project_checkpoints`: Named milestones created prior to major AI mutations.
- `deployments`: Published URLs, Cloudflare Pages deployment status, timestamps.

### AI Engine & Memory
- `conversations`: Chat sessions tied to specific projects.
- `messages`: Message role (`user`, `assistant`, `system`, `tool`), content, token count.
- `ai_runs`: Individual inference runs, status, model used, effort level.
- `ai_tool_calls`: Tool names, input arguments, execution outputs.
- `project_memory`: Project-level technical decisions, architectural preferences, goals.
- `conversation_summaries`: Incremental rolling summaries of chat history.
- `memory_chunks`: Granular searchable chunks for RAG context retrieval.
- `web_sources`: Citations, source URLs, publication dates, and extracted references.

### Billing & Credit Wallet
- `plans`: Configurable tiers (`FREE`, `STARTER`, `PRO`, `ULTIMATE`), prices, credit allocations.
- `subscriptions`: Active user subscriptions, renewal dates, payment status.
- `credit_accounts`: Cached balances (daily free, subscription, purchased).
- `credit_ledger`: Immutable audit trail of every credit transaction.
- `credit_reservations`: In-flight credit holds during AI task execution.
- `credit_bundles`: Available one-time top-up packages.
- `payment_orders`: Orders created for Razorpay or simulated test mode.
- `payment_events`: Webhook audit trail and signature verification logs.

### Security & Governance
- `audit_logs`: Detailed administrative and security actions.
- `rate_limit_records`: Rate limiting counters for database fallback mode.
- `application_settings`: Dynamic global parameters editable by admins.
