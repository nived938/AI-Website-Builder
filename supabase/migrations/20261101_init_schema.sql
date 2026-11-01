-- ==============================================================================
-- VEYRA STUDIO: COMPLETE POSTGRESQL SCHEMA MIGRATION
-- Multi-tier AI Website Builder with Persistent Memory, Credit Ledger & RLS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. AUTH & PROFILES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    default_effort TEXT NOT NULL DEFAULT 'LOW' CHECK (default_effort IN ('LOW', 'MEDIUM', 'HIGH', 'MAX')),
    theme TEXT NOT NULL DEFAULT 'midnight',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PROJECTS & CODE FILE SYSTEM
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    framework TEXT NOT NULL DEFAULT 'html' CHECK (framework IN ('html', 'react', 'nextjs')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    preview_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    seo_title TEXT,
    seo_description TEXT,
    custom_domain TEXT,
    custom_head_tags TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    size_bytes INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'text/plain',
    is_directory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, path)
);

CREATE TABLE IF NOT EXISTS public.project_file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    commit_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'document', 'other')),
    storage_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'cloudflare_pages',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'live', 'failed')),
    published_url TEXT,
    deployment_id TEXT,
    build_logs TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. AI ORCHESTRATION & PERSISTENT MEMORY (4,000-TOKEN ARCHITECTURE)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Website Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    effort_level TEXT NOT NULL CHECK (effort_level IN ('LOW', 'MEDIUM', 'HIGH', 'MAX')),
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    credits_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ai_tool_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ai_run_id UUID NOT NULL REFERENCES public.ai_runs(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    arguments JSONB NOT NULL,
    result JSONB,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
    summary TEXT NOT NULL DEFAULT '',
    primary_goals TEXT[] DEFAULT '{}',
    tech_stack_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    design_system_notes TEXT DEFAULT '',
    known_issues TEXT[] DEFAULT '{}',
    completed_milestones TEXT[] DEFAULT '{}',
    pending_tasks TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL UNIQUE REFERENCES public.conversations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    summary TEXT NOT NULL DEFAULT '',
    key_decisions TEXT[] DEFAULT '{}',
    last_processed_message_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memory_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('decision', 'requirement', 'design_token', 'code_pattern', 'bugfix')),
    importance INTEGER NOT NULL DEFAULT 1,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    decision TEXT NOT NULL,
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.web_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    snippet TEXT,
    publication_date TEXT,
    retrieval_date TIMESTAMPTZ DEFAULT NOW(),
    search_query TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.project_assets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    summary TEXT,
    parsed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. BILLING, CREDITS, & SUBSCRIPTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- 'FREE', 'STARTER', 'PRO', 'ULTIMATE'
    name TEXT NOT NULL,
    monthly_price_inr INTEGER NOT NULL DEFAULT 0,
    annual_price_inr INTEGER NOT NULL DEFAULT 0,
    monthly_credits INTEGER NOT NULL DEFAULT 0,
    daily_free_credits INTEGER NOT NULL DEFAULT 200,
    allowed_effort_levels TEXT[] NOT NULL DEFAULT '{"LOW"}',
    max_projects INTEGER NOT NULL DEFAULT 3,
    max_upload_size_mb INTEGER NOT NULL DEFAULT 5,
    max_total_storage_mb INTEGER NOT NULL DEFAULT 25,
    web_research_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    custom_domains_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    razorpay_subscription_id TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_accounts (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_free_credits NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    daily_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subscription_credits NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    purchased_credits NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    lifetime_used_credits NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_negative_balances CHECK (
        daily_free_credits >= 0 AND 
        subscription_credits >= 0 AND 
        purchased_credits >= 0
    )
);

CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL, -- Negative for deduction, Positive for credit
    balance_type TEXT NOT NULL CHECK (balance_type IN ('daily_free', 'subscription', 'purchased')),
    action_type TEXT NOT NULL CHECK (action_type IN ('daily_reset', 'subscription_grant', 'purchase', 'ai_generation', 'ai_reservation_refund', 'admin_adjustment')),
    description TEXT NOT NULL,
    reference_id TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ai_run_id UUID,
    reserved_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'settled', 'released')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_bundles (
    id TEXT PRIMARY KEY, -- 'bundle_1k', 'bundle_5k', 'bundle_20k'
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_inr INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_type TEXT NOT NULL CHECK (order_type IN ('subscription', 'credit_bundle')),
    item_id TEXT NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    payment_order_id UUID REFERENCES public.payment_orders(id),
    amount_inr NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id),
    action TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    credits_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. AUDIT, RATE LIMITS, & SYSTEM CONFIG
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL, -- e.g. "ip:192.168.1.1:login" or "user:uuid:ai"
    count INTEGER NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(key)
);

CREATE TABLE IF NOT EXISTS public.authentication_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failure', 'signup', 'logout', 'password_reset_request', 'password_reset_success')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. FULL-TEXT SEARCH & PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_web_sources_project_id ON public.web_sources(project_id);

-- GIN Index for RAG memory search
CREATE INDEX IF NOT EXISTS idx_memory_chunks_fts ON public.memory_chunks USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_project_files_content_fts ON public.project_files USING gin(to_tsvector('english', content));

-- ==============================================================================
-- 7. SEED INITIAL CONFIGURATION & PLANS
-- ==============================================================================

INSERT INTO public.plans (id, name, monthly_price_inr, annual_price_inr, monthly_credits, daily_free_credits, allowed_effort_levels, max_projects, max_upload_size_mb, max_total_storage_mb, web_research_enabled, custom_domains_enabled)
VALUES
('FREE', 'Free', 0, 0, 0, 200, '{"LOW"}', 3, 5, 25, FALSE, FALSE),
('STARTER', 'Starter', 999, 9990, 2500, 200, '{"LOW","MEDIUM"}', 10, 10, 100, TRUE, FALSE),
('PRO', 'Pro', 2499, 24990, 10000, 200, '{"LOW","MEDIUM","HIGH"}', 100, 25, 500, TRUE, TRUE),
('ULTIMATE', 'Ultimate', 5999, 59990, 30000, 200, '{"LOW","MEDIUM","HIGH","MAX"}', 1000, 50, 2048, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price_inr = EXCLUDED.monthly_price_inr,
    monthly_credits = EXCLUDED.monthly_credits,
    allowed_effort_levels = EXCLUDED.allowed_effort_levels;

INSERT INTO public.credit_bundles (id, name, credits, price_inr)
VALUES
('bundle_1k', '1,000 Credits', 1000, 499),
('bundle_5k', '5,000 Credits', 5000, 1999),
('bundle_20k', '20,000 Credits', 20000, 6999)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.application_settings (key, value, description)
VALUES
('general', '{"app_name": "VEYRA Studio", "allow_registration": true, "maintenance_mode": false}'::jsonb, 'Global application configuration'),
('ai_limits', '{"default_model": "llama3.2", "context_window": 4096, "low_multiplier": 1.0, "med_multiplier": 2.0, "high_multiplier": 4.0, "max_multiplier": 8.0}'::jsonb, 'Ollama inference multipliers and limits')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users only see and manage their own projects
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Project Files: only accessible if user owns parent project
CREATE POLICY "Users access own project files" ON public.project_files FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_files.project_id AND projects.user_id = auth.uid())
);

-- Conversations & Messages: only project owner can access
CREATE POLICY "Users access own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own messages" ON public.messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);

-- Credit Account & Ledger: Read-only for authenticated user; modifications strictly via server-side RPC / API
CREATE POLICY "Users view own credit balance" ON public.credit_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own credit ledger" ON public.credit_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
