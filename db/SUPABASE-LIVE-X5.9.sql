-- =============================================================================
-- EvoRank X5.9 – Einrichtung für das BESTEHENDE Supabase-Projekt
-- Angepasst an die echte Datenbank: Profile heißen dort public.rf_profiles (Spalte id),
-- nicht rankforge_profiles. Reihenfolge: Bestenlisten, Geburtstag, Strava, Garmin,
-- Sicherheit. Jeder Block ist atomar und wiederholbar. Ändert keine Trainingsdaten.
-- Angewendet am 23.09.2026 über den Supabase-Konnektor (Migrationen evorank_x59_*).
-- =============================================================================

-- EvoRank X5.4: one atomic setup for all four leaderboards.
-- Run in the SQL Editor of the EXISTING Supabase project, never in Netlify.
-- Requires the existing account/profile setup. Does not enable anyone's consent.
begin;
do $$ begin
  if to_regclass('public.rf_profiles') is null then
    raise exception 'EvoRank-Kontoeinrichtung fehlt: zuerst die beiliegende Anleitung lesen.';
  end if;
end $$;
-- =============================================================================
-- EVORANK 10.9 – sichere Top-10-Bestenlisten für Gym, Schwimmen, Laufen, Rad
-- Diese Datei einmal vollständig im Supabase SQL Editor ausführen.
-- =============================================================================

create table if not exists public.evorank_leaderboard_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  sport text not null check (sport in ('strength', 'swim', 'run', 'bike')),
  score integer not null default 0 check (score between 0 and 9999),
  rank_label text not null default '',
  stats jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, sport),
  constraint evorank_leaderboard_rank_label_size check (char_length(rank_label) <= 80),
  constraint evorank_leaderboard_stats_size check (pg_column_size(stats) < 16 * 1024)
);

create index if not exists evorank_leaderboard_sport_score_idx
  on public.evorank_leaderboard_entries (sport, score desc, updated_at desc);

alter table public.evorank_leaderboard_entries enable row level security;
revoke all on public.evorank_leaderboard_entries from public, anon, authenticated;


create table if not exists public.evorank_data_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  leaderboard_enabled boolean not null default false,
  policy_version text not null default '10.10-2026-08',
  consented_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.evorank_leaderboard_reports (
  id bigint generated always as identity primary key,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  sport text not null check (sport in ('strength', 'swim', 'run', 'bike')),
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  constraint evorank_report_not_self check (reporter_user_id <> reported_user_id)
);

create index if not exists evorank_leaderboard_reports_status_idx
  on public.evorank_leaderboard_reports(status, created_at desc);

create table if not exists public.evorank_leaderboard_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint evorank_block_not_self check (blocker_user_id <> blocked_user_id)
);

alter table public.evorank_leaderboard_entries
  add column if not exists source text not null default 'manual',
  add column if not exists moderation_state text not null default 'visible',
  add column if not exists published_at timestamptz not null default now();

alter table public.evorank_leaderboard_entries
  drop constraint if exists evorank_leaderboard_source_check;
alter table public.evorank_leaderboard_entries
  add constraint evorank_leaderboard_source_check check (source in ('manual', 'garmin'));
alter table public.evorank_leaderboard_entries
  drop constraint if exists evorank_leaderboard_moderation_check;
alter table public.evorank_leaderboard_entries
  add constraint evorank_leaderboard_moderation_check check (moderation_state in ('visible', 'review', 'rejected'));

alter table public.evorank_data_consents enable row level security;
alter table public.evorank_leaderboard_reports enable row level security;
alter table public.evorank_leaderboard_blocks enable row level security;

revoke all on public.evorank_data_consents from public, anon, authenticated;
revoke all on public.evorank_leaderboard_reports from public, anon, authenticated;
revoke all on public.evorank_leaderboard_blocks from public, anon, authenticated;
revoke all on public.evorank_leaderboard_entries from public, anon, authenticated;

grant all on public.evorank_data_consents to service_role;
grant all on public.evorank_leaderboard_reports to service_role;
grant all on public.evorank_leaderboard_blocks to service_role;
grant all on public.evorank_leaderboard_entries to service_role;

create or replace function public.evorank_leaderboard_consent(p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  insert into public.evorank_data_consents(
    user_id, leaderboard_enabled, policy_version, consented_at, revoked_at, updated_at
  ) values (
    auth.uid(), coalesce(p_enabled, false), '10.10-2026-08',
    case when coalesce(p_enabled, false) then now() else null end,
    case when coalesce(p_enabled, false) then null else now() end,
    now()
  ) on conflict(user_id) do update set
    leaderboard_enabled = excluded.leaderboard_enabled,
    policy_version = excluded.policy_version,
    consented_at = case when excluded.leaderboard_enabled then now() else evorank_data_consents.consented_at end,
    revoked_at = case when excluded.leaderboard_enabled then null else now() end,
    updated_at = now();

  if not coalesce(p_enabled, false) then
    delete from public.evorank_leaderboard_entries where user_id = auth.uid();
  end if;

  return jsonb_build_object('ok', true, 'enabled', coalesce(p_enabled, false), 'updatedAt', now());
end;
$$;

create or replace function public.evorank_leaderboard_publish(
  p_sport text,
  p_score integer,
  p_rank_label text,
  p_stats jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sport text := lower(trim(coalesce(p_sport, '')));
  v_stats jsonb := case when jsonb_typeof(p_stats) = 'object' then p_stats else '{}'::jsonb end;
  v_source text := case when lower(coalesce(p_stats->>'source', 'manual')) = 'garmin' then 'garmin' else 'manual' end;
  v_safe_stats jsonb;
  v_sessions integer;
  v_recent integer;
  v_workouts integer;
  v_weekly integer;
  v_distance numeric;
  v_volume numeric;
  v_previous_score integer;
  v_previous_moderation text;
  v_garmin_verified boolean := false;
  v_moderation text := 'visible';
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if v_sport not in ('strength', 'swim', 'run', 'bike') then raise exception 'invalid_sport'; end if;
  if coalesce(p_score, -1) not between 0 and 9999 then raise exception 'invalid_score'; end if;
  if not exists (select 1 from public.rf_profiles where id = auth.uid()) then raise exception 'profile_required'; end if;
  if not exists (
    select 1 from public.evorank_data_consents
    where user_id = auth.uid() and leaderboard_enabled = true
  ) then raise exception 'leaderboard_consent_required'; end if;

  if exists (
    select 1 from public.evorank_leaderboard_entries
    where user_id = auth.uid() and sport = v_sport and updated_at > now() - interval '15 seconds'
  ) then raise exception 'publish_rate_limited'; end if;

  v_sessions := case when coalesce(v_stats->>'sessions', '') ~ '^[0-9]{1,9}$'
    then least((v_stats->>'sessions')::integer, 999999) else 0 end;
  v_recent := case when coalesce(v_stats->>'recentSessions', '') ~ '^[0-9]{1,9}$'
    then least((v_stats->>'recentSessions')::integer, 999999) else 0 end;
  v_workouts := case when coalesce(v_stats->>'workouts', '') ~ '^[0-9]{1,9}$'
    then least((v_stats->>'workouts')::integer, 999999) else 0 end;
  v_weekly := case when coalesce(v_stats->>'weeklyWorkouts', '') ~ '^[0-9]{1,9}$'
    then least((v_stats->>'weeklyWorkouts')::integer, 9999) else 0 end;
  v_distance := case when coalesce(v_stats->>'distanceMeters', '') ~ '^[0-9]+([.][0-9]+)?$'
    then least((v_stats->>'distanceMeters')::numeric, 1000000000) else 0 end;
  v_volume := case when coalesce(v_stats->>'volumeKg', '') ~ '^[0-9]+([.][0-9]+)?$'
    then least((v_stats->>'volumeKg')::numeric, 1000000000) else 0 end;

  if v_recent > v_sessions or v_weekly > greatest(v_workouts, v_sessions) then raise exception 'inconsistent_stats'; end if;

  if v_source = 'garmin' and v_sport <> 'strength' then
    if to_regclass('public.rf_garmin_activities') is null then
      raise exception 'garmin_activity_not_verified';
    end if;
    execute 'select exists (select 1 from public.rf_garmin_activities where user_id = $1 and sport = $2)'
      into v_garmin_verified using auth.uid(), v_sport;
    if not v_garmin_verified then raise exception 'garmin_activity_not_verified'; end if;
  end if;

  select score, moderation_state into v_previous_score, v_previous_moderation
  from public.evorank_leaderboard_entries
  where user_id = auth.uid() and sport = v_sport;
  if v_previous_moderation in ('review', 'rejected') then
    v_moderation := v_previous_moderation;
  elsif v_source = 'manual' and v_previous_score is not null and p_score > v_previous_score + 2500 then
    v_moderation := 'review';
  end if;

  v_safe_stats := jsonb_build_object(
    'sessions', v_sessions,
    'recentSessions', v_recent,
    'workouts', v_workouts,
    'weeklyWorkouts', v_weekly,
    'distanceMeters', v_distance,
    'volumeKg', v_volume,
    'bestPerformance', left(coalesce(v_stats->>'bestPerformance', ''), 80),
    'topExercise', left(coalesce(v_stats->>'topExercise', ''), 80),
    'garminConnected', v_source = 'garmin',
    'source', v_source
  );

  insert into public.evorank_leaderboard_entries(
    user_id, sport, score, rank_label, stats, source, moderation_state, published_at, updated_at
  ) values (
    auth.uid(), v_sport, p_score, left(trim(coalesce(p_rank_label, '')), 80),
    v_safe_stats, v_source, v_moderation, now(), now()
  ) on conflict(user_id, sport) do update set
    score = excluded.score,
    rank_label = excluded.rank_label,
    stats = excluded.stats,
    source = excluded.source,
    moderation_state = excluded.moderation_state,
    published_at = now(),
    updated_at = now();

  return jsonb_build_object('ok', true, 'sport', v_sport, 'moderationState', v_moderation, 'updatedAt', now());
exception when invalid_text_representation then
  raise exception 'invalid_stats';
end;
$$;

create or replace function public.evorank_leaderboard_top(p_sport text, p_limit integer default 10)
returns setof jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', e.user_id,
    'sport', e.sport,
    'nickname', p.nickname::text,
    'displayName', p.display_name,
    'avatar', p.avatar,
    'score', e.score,
    'rankLabel', e.rank_label,
    'stats', e.stats,
    'updatedAt', e.updated_at,
    'isMe', e.user_id = auth.uid()
  )
  from public.evorank_leaderboard_entries e
  join public.rf_profiles p on p.id = e.user_id
  join public.evorank_data_consents c on c.user_id = e.user_id and c.leaderboard_enabled = true
  where auth.uid() is not null
    and e.sport = lower(trim(coalesce(p_sport, '')))
    and e.sport in ('strength', 'swim', 'run', 'bike')
    and e.moderation_state = 'visible'
    and not exists (
      select 1 from public.evorank_leaderboard_blocks b
      where (b.blocker_user_id = auth.uid() and b.blocked_user_id = e.user_id)
         or (b.blocker_user_id = e.user_id and b.blocked_user_id = auth.uid())
    )
  order by e.score desc, e.updated_at desc, p.nickname::text
  limit greatest(1, least(coalesce(p_limit, 10), 10));
$$;

create or replace function public.evorank_leaderboard_withdraw()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from public.evorank_leaderboard_entries where user_id = auth.uid();
  update public.evorank_data_consents set leaderboard_enabled = false, revoked_at = now(), updated_at = now()
  where user_id = auth.uid();
  return jsonb_build_object('ok', true, 'withdrawnAt', now());
end;
$$;

create or replace function public.evorank_leaderboard_report(
  p_reported_user_id uuid,
  p_sport text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_sport text := lower(trim(coalesce(p_sport, ''))); v_reason text := trim(coalesce(p_reason, ''));
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_reported_user_id is null or p_reported_user_id = auth.uid() then raise exception 'invalid_report_target'; end if;
  if v_sport not in ('strength', 'swim', 'run', 'bike') then raise exception 'invalid_sport'; end if;
  if char_length(v_reason) not between 3 and 500 then raise exception 'invalid_reason'; end if;
  if not exists (select 1 from public.evorank_leaderboard_entries where user_id = p_reported_user_id and sport = v_sport) then raise exception 'profile_not_found'; end if;
  insert into public.evorank_leaderboard_reports(reporter_user_id, reported_user_id, sport, reason)
  values(auth.uid(), p_reported_user_id, v_sport, v_reason);
  return jsonb_build_object('ok', true, 'createdAt', now());
end;
$$;

create or replace function public.evorank_leaderboard_block(p_blocked_user_id uuid, p_blocked boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_blocked_user_id is null or p_blocked_user_id = auth.uid() then raise exception 'invalid_block_target'; end if;
  if coalesce(p_blocked, true) then
    insert into public.evorank_leaderboard_blocks(blocker_user_id, blocked_user_id)
    values(auth.uid(), p_blocked_user_id) on conflict do nothing;
  else
    delete from public.evorank_leaderboard_blocks
    where blocker_user_id = auth.uid() and blocked_user_id = p_blocked_user_id;
  end if;
  return jsonb_build_object('ok', true, 'blocked', coalesce(p_blocked, true), 'updatedAt', now());
end;
$$;

revoke all on function public.evorank_leaderboard_consent(boolean) from public, anon;
revoke all on function public.evorank_leaderboard_publish(text, integer, text, jsonb) from public, anon;
revoke all on function public.evorank_leaderboard_top(text, integer) from public, anon;
revoke all on function public.evorank_leaderboard_withdraw() from public, anon;
revoke all on function public.evorank_leaderboard_report(uuid, text, text) from public, anon;
revoke all on function public.evorank_leaderboard_block(uuid, boolean) from public, anon;

grant execute on function public.evorank_leaderboard_consent(boolean) to authenticated;
grant execute on function public.evorank_leaderboard_publish(text, integer, text, jsonb) to authenticated;
grant execute on function public.evorank_leaderboard_top(text, integer) to authenticated;
grant execute on function public.evorank_leaderboard_withdraw() to authenticated;
grant execute on function public.evorank_leaderboard_report(uuid, text, text) to authenticated;
grant execute on function public.evorank_leaderboard_block(uuid, boolean) to authenticated;


-- Die Browser-Rollen erhalten absichtlich keinen direkten Tabellenzugriff.
-- E-Mail-Adressen werden von keiner Bestenlistenfunktion ausgegeben.

notify pgrst, 'reload schema';
commit;
-- Empty array is expected when nobody has consented yet.
select 'Bestenlisten eingerichtet: Gym, Laufen, Radfahren, Schwimmen' as ergebnis;

-- =============================================================================
-- EvoRank 10.11 – Geburtsdatum, einmaliger Geburtstagsbonus und Mailversand
-- Nach den vorhandenen 9.8–10.10-SQL-Dateien im Supabase SQL Editor ausführen.
-- =============================================================================

begin;

alter table public.rf_profiles
  add column if not exists birth_date date;

create table if not exists public.evorank_birthday_rewards (
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_year integer not null check (reward_year between 2020 and 2200),
  coins integer not null default 20 check (coins between 0 and 100),
  claimed_at timestamptz,
  email_sent_at timestamptz,
  primary key (user_id, reward_year)
);

alter table public.evorank_birthday_rewards enable row level security;
revoke all on public.evorank_birthday_rewards from public, anon, authenticated;
grant all on public.evorank_birthday_rewards to service_role;

create or replace function public.evorank_profile_birth_date(p_birth_date date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_birth_date is null or p_birth_date > current_date or p_birth_date < date '1900-01-01' then
    raise exception 'invalid_birth_date';
  end if;
  update public.rf_profiles
     set birth_date = p_birth_date, updated_at = now()
   where id = auth.uid();
  if not found then raise exception 'profile_required'; end if;
  return jsonb_build_object('ok', true, 'birthDate', p_birth_date);
end;
$$;

create or replace function public.evorank_birthday_claim()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_birth date;
  v_year integer := extract(year from current_date)::integer;
  v_count integer := 0;
  v_granted boolean := false;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select birth_date into v_birth from public.rf_profiles where id = auth.uid();
  if v_birth is null then return jsonb_build_object('granted', false, 'reason', 'birth_date_missing', 'coins', 0); end if;
  if extract(month from v_birth) <> extract(month from current_date)
     or extract(day from v_birth) <> extract(day from current_date) then
    return jsonb_build_object('granted', false, 'reason', 'not_birthday', 'coins', 0);
  end if;
  insert into public.evorank_birthday_rewards(user_id, reward_year, coins, claimed_at)
  values(auth.uid(), v_year, 20, now())
  on conflict(user_id, reward_year) do update
    set claimed_at = now()
    where evorank_birthday_rewards.claimed_at is null;
  get diagnostics v_count = row_count;
  v_granted := v_count > 0;
  return jsonb_build_object('granted', v_granted, 'coins', case when v_granted then 20 else 0 end, 'year', v_year);
end;
$$;

create or replace function public.evorank_birthdays_due(p_on_date date default current_date)
returns table(user_id uuid, nickname text, display_name text, reward_year integer)
language sql
security definer
set search_path = public
as $$
  select p.id, p.nickname::text, p.display_name, extract(year from p_on_date)::integer
  from public.rf_profiles p
  left join public.evorank_birthday_rewards r
    on r.user_id = p.id and r.reward_year = extract(year from p_on_date)::integer
  where p.birth_date is not null
    and extract(month from p.birth_date) = extract(month from p_on_date)
    and extract(day from p.birth_date) = extract(day from p_on_date)
    and r.email_sent_at is null;
$$;

create or replace function public.evorank_birthday_mark_emailed(p_user_id uuid, p_reward_year integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.evorank_birthday_rewards(user_id, reward_year, coins, claimed_at, email_sent_at)
  values(p_user_id, p_reward_year, 20, null, now())
  on conflict(user_id, reward_year) do update set email_sent_at = coalesce(evorank_birthday_rewards.email_sent_at, now());
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.evorank_profile_birth_date(date) from public, anon;
revoke all on function public.evorank_birthday_claim() from public, anon;
revoke all on function public.evorank_birthdays_due(date) from public, anon, authenticated;
revoke all on function public.evorank_birthday_mark_emailed(uuid, integer) from public, anon, authenticated;
grant execute on function public.evorank_profile_birth_date(date) to authenticated;
grant execute on function public.evorank_birthday_claim() to authenticated;
grant execute on function public.evorank_birthdays_due(date) to service_role;
grant execute on function public.evorank_birthday_mark_emailed(uuid, integer) to service_role;

commit;

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

-- =============================================================================
-- EvoRank X5.9 – Sicherheit und vollständige Kontolöschung
-- =============================================================================
begin;

-- Event-Trigger-Helfer: nur die Datenbank selbst darf ihn ausführen.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- "Konto löschen" löscht jetzt wirklich alles, was die App verspricht:
-- Cloud-Sicherung, Profil, Freundschaften, Bestenlisten, Einwilligungen,
-- Verbindungen und zuletzt das Login-Konto selbst.
create or replace function public.rf_account_delete()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  delete from public.rankforge_state where user_id = me;
  delete from public.rf_friendships where requester_id = me or addressee_id = me;
  if to_regclass('public.evorank_leaderboard_entries') is not null then
    delete from public.evorank_leaderboard_entries where user_id = me;
    delete from public.evorank_leaderboard_blocks where blocker_user_id = me or blocked_user_id = me;
    delete from public.evorank_leaderboard_reports where reporter_user_id = me or reported_user_id = me;
    delete from public.evorank_data_consents where user_id = me;
  end if;
  if to_regclass('public.evorank_birthday_rewards') is not null then
    delete from public.evorank_birthday_rewards where user_id = me;
  end if;
  if to_regclass('public.rf_strava_connections') is not null then
    delete from public.rf_strava_connections where user_id = me;
    delete from public.rf_strava_oauth_states where user_id = me;
  end if;
  if to_regclass('public.rf_garmin_connections') is not null then
    delete from public.rf_garmin_activities where user_id = me;
    delete from public.rf_garmin_connections where user_id = me;
    delete from public.rf_garmin_oauth_states where user_id = me;
  end if;
  delete from public.rf_profiles where id = me;
  begin
    delete from public.rankforge_public_profiles where profile_id = me::text;
  exception when undefined_table or undefined_column then null;
  end;
  delete from auth.users where id = me;
  return jsonb_build_object('ok', true, 'deleted', true);
end;
$$;
revoke all on function public.rf_account_delete() from public, anon;
grant execute on function public.rf_account_delete() to authenticated;

commit;

-- =============================================================================
-- Einmalig am 23.09.2026 zusätzlich eingespielt (nicht wiederholen):
--  * evorank_x59_backup_before_setup: Kopie von rankforge_state, rf_profiles,
--    rf_friendships und den rf_*-Funktionen im Schema evorank_backup_20260923
--    (ohne API-Zugriff).
--  * evorank_x59_backup_auto_delete: pg_cron-Job 'evorank-drop-backup-20260923'
--    löscht dieses Schema am 23.10.2026 um 03:00 UTC und entfernt sich danach.
-- =============================================================================
