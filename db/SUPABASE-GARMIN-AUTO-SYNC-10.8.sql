-- EVORANK 10.8 — sichere Garmin-OAuth- und Activity-API-Ablage
-- Einmal vollständig im Supabase SQL Editor ausführen.

begin;

create table if not exists public.rf_garmin_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  garmin_user_id text not null unique,
  account_label text not null default 'Garmin Connect',
  access_token_enc text not null,
  refresh_token_enc text not null default '',
  token_expires_at timestamptz,
  scope text not null default '',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.rf_garmin_oauth_states (
  state_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  code_verifier_enc text not null,
  return_to text not null default '/#sports',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rf_garmin_activities (
  user_id uuid not null references auth.users(id) on delete cascade,
  external_id text not null,
  sport text not null check (sport in ('strength', 'swim', 'run', 'bike')),
  started_at timestamptz not null,
  distance_m numeric not null check (distance_m > 0),
  duration_s integer not null check (duration_s > 0),
  raw jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  primary key (user_id, external_id)
);

create index if not exists rf_garmin_activities_user_started_idx
  on public.rf_garmin_activities (user_id, started_at desc);

create index if not exists rf_garmin_oauth_states_expiry_idx
  on public.rf_garmin_oauth_states (expires_at);

alter table public.rf_garmin_connections enable row level security;
alter table public.rf_garmin_oauth_states enable row level security;
alter table public.rf_garmin_activities enable row level security;

-- Diese Tabellen sind absichtlich nicht direkt aus dem Browser lesbar.
-- Ausschließlich die Netlify Functions mit dem Service-Role-Key dürfen darauf zugreifen.
revoke all on table public.rf_garmin_connections from anon, authenticated;
revoke all on table public.rf_garmin_oauth_states from anon, authenticated;
revoke all on table public.rf_garmin_activities from anon, authenticated;
grant all on table public.rf_garmin_connections to service_role;
grant all on table public.rf_garmin_oauth_states to service_role;
grant all on table public.rf_garmin_activities to service_role;

commit;
