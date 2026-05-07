-- Initial schema for credit-card-hacker web app.
-- Auth users table is provided by Supabase auth schema.

-- =============================================================================
-- profiles: one row per auth user, stores card history + churning profile
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  -- The CardHackerProfile shape (see web/lib/types.ts).
  -- Stored as jsonb for flexibility; validated app-side.
  data jsonb not null default '{}'::jsonb,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_updated_at_idx on public.profiles (updated_at desc);

-- =============================================================================
-- subscriptions: one row per user (latest Stripe subscription state)
-- =============================================================================
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'power')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- =============================================================================
-- daily_usage: one row per user per UTC day. Used for rate limiting.
-- =============================================================================
create table public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  premium_messages integer not null default 0,
  fallback_messages integer not null default 0,
  total_input_tokens bigint not null default 0,
  total_output_tokens bigint not null default 0,
  primary key (user_id, date)
);

create index daily_usage_user_date_idx on public.daily_usage (user_id, date desc);

-- =============================================================================
-- conversations + messages: chat history
-- =============================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  input_tokens integer,
  output_tokens integer,
  is_fallback boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- =============================================================================
-- updated_at trigger
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- =============================================================================
-- handle_new_user: auto-create profile + free subscription on signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  insert into public.subscriptions (user_id, tier, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.daily_usage enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- profiles: user can read/update their own
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- subscriptions: user can READ their own; writes are service-role-only (Stripe webhook)
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- daily_usage: user can read their own; writes via API route using service role
create policy "daily_usage_select_own"
  on public.daily_usage for select
  using (auth.uid() = user_id);

-- conversations: user can CRUD their own
create policy "conversations_select_own"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "conversations_update_own"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "conversations_delete_own"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- messages: user can read messages in their conversations; insert checked via API
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = user_id);
