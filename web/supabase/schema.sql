-- ═══════════════════════════════════════════════════════════════════════
-- BLUE SHEEP ADVENTURES — Supabase Schema (Phase 1, CLAUDE.md §6.1)
-- Run this in the Supabase SQL Editor. Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists vector;

-- ── Leads ────────────────────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  source text default 'ai_chat',
  user_id uuid references auth.users,             -- linked at first login (email match)
  created_at timestamptz default now()
);
create unique index if not exists leads_phone_idx on leads(phone);  -- metering dedupe

-- ── Providers ────────────────────────────────────────────────────────
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('guide','taxi_driver','host','instructor','operator')),
  name text not null,
  phone text not null,                            -- RLS: never client-readable
  photo_url text,
  regions text[] not null,
  activities text[] not null,
  treks text[],
  languages text[],
  years_experience int,
  status text default 'pending' check (status in ('pending','verified','paused')),
  consent_signed_at timestamptz,                  -- DPDP: required before status='verified'
  response_rate numeric,
  created_at timestamptz default now()
);

-- Public view that excludes phone — clients query this, never the raw table
create or replace view providers_public as
  select
    id, type, name, photo_url, regions, activities, treks,
    languages, years_experience, status, response_rate, created_at
  from providers
  where status = 'verified';

-- ── Chat Sessions ────────────────────────────────────────────────────
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads not null,
  free_messages_used int default 0,               -- the meter
  created_at timestamptz default now()
);

-- ── Chat Messages ────────────────────────────────────────────────────
create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  session_id uuid references chat_sessions not null,
  role text check (role in ('user','assistant','system')),
  content text not null,
  counts_against_free boolean default false,      -- lead-capture turns = false
  created_at timestamptz default now()
);

-- ── Itineraries ──────────────────────────────────────────────────────
create table if not exists itineraries (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('karan_seed','ai_generated')),
  trek text,
  region text,
  content jsonb not null,
  lead_id uuid references leads,
  user_id uuid references auth.users,
  editable boolean default false,                 -- premium flips true
  created_at timestamptz default now()
);

-- ── Vector Embeddings (RAG) ──────────────────────────────────────────
create table if not exists itinerary_chunks (
  id bigint generated always as identity primary key,
  itinerary_id uuid references itineraries not null,
  chunk_text text not null,
  chunk_hash text,                                -- re-runnable ingestion (upsert key)
  embedding vector(1024)                          -- nv-embedqa-e5-v5
);
create unique index if not exists itinerary_chunks_hash_idx
  on itinerary_chunks(itinerary_id, chunk_hash);
create index if not exists itinerary_chunks_embedding_idx
  on itinerary_chunks using hnsw (embedding vector_cosine_ops);

-- ── PDF Downloads ────────────────────────────────────────────────────
create table if not exists pdf_downloads (
  id bigint generated always as identity primary key,
  itinerary_id uuid references itineraries not null,
  lead_id uuid references leads not null,
  user_id uuid references auth.users,
  created_at timestamptz default now()
);

-- ── Payments ─────────────────────────────────────────────────────────
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  amount int not null,
  type text check (type in ('single_unlock','premium')),
  status text default 'created' check (status in ('created','paid','failed','refunded')),
  created_at timestamptz default now()
);

-- ── Subscriptions ────────────────────────────────────────────────────
create table if not exists subscriptions (
  user_id uuid primary key references auth.users,
  unlock_credits int default 0,
  ai_unlimited boolean default false,
  itinerary_editing boolean default false,
  expires_at timestamptz
);

-- ── Unlocks ──────────────────────────────────────────────────────────
create table if not exists unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  provider_id uuid references providers not null,
  payment_id uuid references payments,
  source text check (source in ('single','premium_credit','credit_back')),
  response_reported boolean default false,        -- 48h guarantee
  report_resolved text,                           -- 'credit_issued' | 'rejected'
  created_at timestamptz default now(),
  unique (user_id, provider_id)                   -- never charge twice
);

-- ═══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- All writes happen via service-role in route handlers (bypasses RLS).
-- ═══════════════════════════════════════════════════════════════════════

alter table leads enable row level security;
alter table providers enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table itineraries enable row level security;
alter table itinerary_chunks enable row level security;
alter table pdf_downloads enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;
alter table unlocks enable row level security;

drop policy if exists "Users read own leads" on leads;
create policy "Users read own leads"
  on leads for select
  using (auth.uid() = user_id);

-- Providers: NO client reads on raw table (use providers_public view)
drop policy if exists "No client access to providers" on providers;
create policy "No client access to providers"
  on providers for select
  using (false);

drop policy if exists "Users read own chat sessions" on chat_sessions;
create policy "Users read own chat sessions"
  on chat_sessions for select
  using (lead_id in (select id from leads where user_id = auth.uid()));

drop policy if exists "Users read own chat messages" on chat_messages;
create policy "Users read own chat messages"
  on chat_messages for select
  using (session_id in (
    select cs.id from chat_sessions cs
    join leads l on cs.lead_id = l.id
    where l.user_id = auth.uid()
  ));

drop policy if exists "Users read own itineraries" on itineraries;
create policy "Users read own itineraries"
  on itineraries for select
  using (user_id = auth.uid() or lead_id in (select id from leads where user_id = auth.uid()));

drop policy if exists "Public read itinerary chunks" on itinerary_chunks;
create policy "Public read itinerary chunks"
  on itinerary_chunks for select
  using (true);

drop policy if exists "Users read own pdf downloads" on pdf_downloads;
create policy "Users read own pdf downloads"
  on pdf_downloads for select
  using (user_id = auth.uid() or lead_id in (select id from leads where user_id = auth.uid()));

drop policy if exists "Users read own payments" on payments;
create policy "Users read own payments"
  on payments for select
  using (user_id = auth.uid());

drop policy if exists "Users read own subscriptions" on subscriptions;
create policy "Users read own subscriptions"
  on subscriptions for select
  using (user_id = auth.uid());

drop policy if exists "Users read own unlocks" on unlocks;
create policy "Users read own unlocks"
  on unlocks for select
  using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════

-- Cosine similarity search over itinerary_chunks (RAG retrieval)
create or replace function match_chunks (
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  itinerary_id uuid,
  chunk_text text,
  similarity float
)
language sql stable
as $$
  select
    itinerary_chunks.id,
    itinerary_chunks.itinerary_id,
    itinerary_chunks.chunk_text,
    1 - (itinerary_chunks.embedding <=> query_embedding) as similarity
  from itinerary_chunks
  where 1 - (itinerary_chunks.embedding <=> query_embedding) > match_threshold
  order by itinerary_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Atomic unlock-credit spend (§7.4): returns true only if a credit was taken
create or replace function spend_unlock_credit(p_user_id uuid)
returns boolean
language plpgsql
as $$
declare updated int;
begin
  update subscriptions
     set unlock_credits = unlock_credits - 1
   where user_id = p_user_id and unlock_credits > 0;
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;
