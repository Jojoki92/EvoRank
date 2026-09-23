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

create or replace function public.evorank_leaderboard_publish(
  p_sport text,
  p_score integer,
  p_rank_label text,
  p_stats jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sport text := lower(trim(coalesce(p_sport, '')));
  v_stats jsonb := case when jsonb_typeof(p_stats) = 'object' then p_stats else '{}'::jsonb end;
  v_safe_stats jsonb;
  v_sessions integer;
  v_recent integer;
  v_workouts integer;
  v_weekly integer;
  v_distance numeric;
  v_volume numeric;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if v_sport not in ('strength', 'swim', 'run', 'bike') then raise exception 'invalid_sport'; end if;
  if not exists (select 1 from public.rankforge_profiles where user_id = auth.uid()) then
    raise exception 'profile_required';
  end if;

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

  v_safe_stats := jsonb_build_object(
    'sessions', v_sessions,
    'recentSessions', v_recent,
    'workouts', v_workouts,
    'weeklyWorkouts', v_weekly,
    'distanceMeters', v_distance,
    'volumeKg', v_volume,
    'bestPerformance', left(coalesce(v_stats->>'bestPerformance', ''), 80),
    'topExercise', left(coalesce(v_stats->>'topExercise', ''), 80),
    'garminConnected', coalesce((v_stats->>'garminConnected')::boolean, false)
  );

  insert into public.evorank_leaderboard_entries(user_id, sport, score, rank_label, stats, updated_at)
  values(
    auth.uid(),
    v_sport,
    greatest(0, least(coalesce(p_score, 0), 9999)),
    left(trim(coalesce(p_rank_label, '')), 80),
    v_safe_stats,
    now()
  )
  on conflict(user_id, sport) do update set
    score = excluded.score,
    rank_label = excluded.rank_label,
    stats = excluded.stats,
    updated_at = now();

  return jsonb_build_object('ok', true, 'sport', v_sport, 'updatedAt', now());
exception when invalid_text_representation then
  raise exception 'invalid_stats';
end;
$$;

create or replace function public.evorank_leaderboard_top(
  p_sport text,
  p_limit integer default 10
)
returns setof jsonb
language sql
security definer
stable
set search_path = public
as $$
  select jsonb_build_object(
    'id', e.user_id,
    'sport', e.sport,
    'nickname', p.nickname,
    'displayName', p.display_name,
    'avatar', p.avatar,
    'score', e.score,
    'rankLabel', e.rank_label,
    'stats', e.stats,
    'updatedAt', e.updated_at,
    'isMe', e.user_id = auth.uid()
  )
  from public.evorank_leaderboard_entries e
  join public.rankforge_profiles p on p.user_id = e.user_id
  where auth.uid() is not null
    and e.sport = lower(trim(coalesce(p_sport, '')))
    and e.sport in ('strength', 'swim', 'run', 'bike')
  order by e.score desc, e.updated_at desc, p.nickname
  limit greatest(1, least(coalesce(p_limit, 10), 10));
$$;

revoke all on function public.evorank_leaderboard_publish(text, integer, text, jsonb) from public, anon;
revoke all on function public.evorank_leaderboard_top(text, integer) from public, anon;
grant execute on function public.evorank_leaderboard_publish(text, integer, text, jsonb) to authenticated;
grant execute on function public.evorank_leaderboard_top(text, integer) to authenticated;

-- Sicherheitskontrolle:
-- 1. Tabellenzugriff ist für Browser-Rollen vollständig gesperrt.
-- 2. Schreiben ist nur für auth.uid() und nur über die Publish-Funktion möglich.
-- 3. Die Top-10-Funktion liefert höchstens 10 Einträge.
-- 4. Ausgegeben werden Spitzname, Anzeigename, Avatar und Sportwerte – nie E-Mail.
