-- X4.5 optional Strava integration. Run on the existing Supabase project.
-- Tokens and activity caches are accessible only to authenticated server functions.
begin;
create table if not exists public.rf_strava_oauth_states (
  state_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists rf_strava_oauth_expiry on public.rf_strava_oauth_states(expires_at);
create table if not exists public.rf_strava_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id text not null unique,
  access_token_enc text not null,
  refresh_token_enc text not null,
  expires_at timestamptz not null,
  scope text not null,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  sync_locked_until timestamptz,
  activities jsonb not null default '[]'::jsonb check (jsonb_typeof(activities) = 'array')
);
alter table public.rf_strava_oauth_states enable row level security;
alter table public.rf_strava_connections enable row level security;
revoke all on public.rf_strava_oauth_states,public.rf_strava_connections from anon,authenticated;
grant all on public.rf_strava_oauth_states,public.rf_strava_connections to service_role;
commit;
