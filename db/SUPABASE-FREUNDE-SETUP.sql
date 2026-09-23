-- RANKFORGE 9.0.0: optionale Live-Freunde-Datenbank
-- Im Supabase SQL Editor vollständig ausführen.
-- Es werden nur zusammengefasste, ausdrücklich freigegebene Profilwerte gespeichert.

create extension if not exists pgcrypto;

create table if not exists public.rankforge_public_profiles (
  profile_id text primary key,
  write_token_hash text not null,
  display_name text not null,
  rank_score integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rankforge_profile_id_format check (profile_id ~ '^athlete-[A-Za-z0-9-]{8,90}$'),
  constraint rankforge_display_name_length check (char_length(display_name) between 1 and 60),
  constraint rankforge_rank_score_range check (rank_score between 0 and 100000)
);

alter table public.rankforge_public_profiles drop constraint if exists rankforge_payload_size;
alter table public.rankforge_public_profiles
  add constraint rankforge_payload_size check (octet_length(payload::text) <= 100000);

alter table public.rankforge_public_profiles enable row level security;
revoke all on public.rankforge_public_profiles from anon, authenticated;

create or replace function public.rf_safe_int(p_value text, p_min integer, p_max integer, p_default integer default 0)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when coalesce(p_value, '') ~ '^-?[0-9]{1,12}$'
      then greatest(p_min::numeric, least(p_max::numeric, p_value::numeric))::integer
    else greatest(p_min, least(p_max, p_default))
  end;
$$;

create or replace function public.rf_rank_from_score(p_score integer)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_score integer := greatest(0, least(100000, coalesce(p_score, 0)));
  v_index integer := least(8, floor(v_score / 100.0)::integer);
  v_lp integer := case when v_index = 8 then greatest(0, v_score - 800) else v_score - v_index * 100 end;
  v_key text[] := array['wood','bronze','silver','gold','platinum','diamond','champion','titan','olympian'];
  v_name text[] := array['Wood','Bronze','Silver','Gold','Platinum','Diamond','Champion','Titan','Olympian'];
  v_color text[] := array['#8c6b42','#c87342','#b8c0cc','#f0bd26','#27c6b1','#6678f5','#d357c6','#df4e5c','#54cbde'];
  v_division text := case when v_index = 8 then '' when v_lp < 34 then 'III' when v_lp < 67 then 'II' else 'I' end;
begin
  return jsonb_build_object(
    'key', v_key[v_index + 1],
    'name', v_name[v_index + 1],
    'color', v_color[v_index + 1],
    'score', v_score,
    'lp', v_lp,
    'division', v_division
  );
end;
$$;

create or replace function public.rf_sanitize_muscles(p_muscles jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  with keys(key) as (
    values ('shoulders'),('chest'),('biceps'),('triceps'),('forearms'),('core'),('adductors'),('quads'),('upperBack'),('lats'),('lowerBack'),('glutes'),('hamstrings'),('calves')
  ), safe as (
    select key,
      public.rf_safe_int(p_muscles->key->>'score', 0, 100000, 0) as score
    from keys
  )
  select coalesce(jsonb_object_agg(key, jsonb_build_object('score', score, 'rank', public.rf_rank_from_score(score))), '{}'::jsonb)
  from safe;
$$;

create or replace function public.rf_sanitize_stats(p_stats jsonb)
returns jsonb
language sql
immutable
set search_path = public
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'workouts', public.rf_safe_int(p_stats->>'workouts', 0, 10000000, 0),
    'streak', public.rf_safe_int(p_stats->>'streak', 0, 10000, 0),
    'weeklyXp', public.rf_safe_int(p_stats->>'weeklyXp', 0, 2000000000, 0),
    'totalXp', public.rf_safe_int(p_stats->>'totalXp', 0, 2000000000, 0),
    'lastWorkoutAt', case when coalesce(p_stats->>'lastWorkoutAt','') ~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}T' then left(p_stats->>'lastWorkoutAt', 40) else null end
  ));
$$;

create or replace function public.rf_sanitize_garmin(p_garmin jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  v_used boolean := lower(coalesce(p_garmin->>'used','false')) = 'true';
begin
  if not v_used then return null; end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'used', true,
    'activityCount', public.rf_safe_int(p_garmin->>'activityCount', 0, 100000, 0),
    'totalDistanceMeters', public.rf_safe_int(p_garmin->>'totalDistanceMeters', 0, 100000000, 0),
    'latestAt', case when coalesce(p_garmin->>'latestAt','') ~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}' then left(p_garmin->>'latestAt', 40) else null end,
    'latestDistanceMeters', public.rf_safe_int(p_garmin->>'latestDistanceMeters', 0, 1000000, 0),
    'latestDurationSeconds', public.rf_safe_int(p_garmin->>'latestDurationSeconds', 0, 864000, 0),
    'pace100Seconds', public.rf_safe_int(p_garmin->>'pace100Seconds', 0, 10000, 0),
    'avgHeartRate', public.rf_safe_int(p_garmin->>'avgHeartRate', 0, 260, 0),
    'avgSwolf', public.rf_safe_int(p_garmin->>'avgSwolf', 0, 1000, 0),
    'nextPlan', case when jsonb_typeof(p_garmin->'nextPlan') = 'object' then jsonb_strip_nulls(jsonb_build_object(
      'distanceMeters', public.rf_safe_int(p_garmin->'nextPlan'->>'distanceMeters', 0, 1000000, 0),
      'focus', left(regexp_replace(coalesce(p_garmin->'nextPlan'->>'focus',''), '[[:cntrl:]]', '', 'g'), 50),
      'durationSeconds', public.rf_safe_int(p_garmin->'nextPlan'->>'durationSeconds', 0, 864000, 0)
    )) else null end
  ));
end;
$$;

create or replace function public.rf_publish_profile(p_profile jsonb, p_write_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := left(coalesce(p_profile->>'athleteId', ''), 90);
  v_name text := left(trim(regexp_replace(coalesce(p_profile->>'name', ''), '[[:cntrl:]]', '', 'g')), 60);
  v_score integer := public.rf_safe_int(p_profile->'rank'->>'score', 0, 100000, 0);
  v_body_profile text := case lower(coalesce(p_profile->>'bodyProfile','unspecified')) when 'female' then 'female' when 'male' then 'male' else 'unspecified' end;
  v_hash text;
  v_existing_hash text;
  v_payload jsonb;
begin
  if p_profile is null or jsonb_typeof(p_profile) <> 'object' then raise exception 'invalid profile payload'; end if;
  if octet_length(p_profile::text) > 100000 then raise exception 'profile payload too large'; end if;
  if v_id !~ '^athlete-[A-Za-z0-9-]{8,90}$' then raise exception 'invalid profile id'; end if;
  if char_length(v_name) < 1 then raise exception 'display name required'; end if;
  if char_length(coalesce(p_write_token, '')) < 24 or char_length(p_write_token) > 200 then raise exception 'invalid write token'; end if;

  v_hash := encode(digest(p_write_token, 'sha256'), 'hex');
  select write_token_hash into v_existing_hash from public.rankforge_public_profiles where profile_id = v_id;
  if v_existing_hash is not null and v_existing_hash <> v_hash then raise exception 'write token rejected'; end if;

  v_payload := jsonb_build_object(
    'version', 3,
    'athleteId', v_id,
    'name', v_name,
    'bodyProfile', v_body_profile,
    'updatedAt', now(),
    'rank', public.rf_rank_from_score(v_score),
    'muscles', public.rf_sanitize_muscles(coalesce(p_profile->'muscles', '{}'::jsonb)),
    'stats', public.rf_sanitize_stats(coalesce(p_profile->'stats', '{}'::jsonb)),
    'garmin', public.rf_sanitize_garmin(coalesce(p_profile->'garmin', '{}'::jsonb))
  );

  insert into public.rankforge_public_profiles(profile_id, write_token_hash, display_name, rank_score, payload, updated_at)
  values(v_id, v_hash, v_name, v_score, v_payload, now())
  on conflict(profile_id) do update set
    display_name = excluded.display_name,
    rank_score = excluded.rank_score,
    payload = excluded.payload,
    updated_at = now()
  where public.rankforge_public_profiles.write_token_hash = v_hash;

  return jsonb_build_object('ok', true, 'profileId', v_id, 'updatedAt', now());
end;
$$;

create or replace function public.rf_search_profiles(p_query text, p_limit integer default 20)
returns setof jsonb
language sql
security definer
set search_path = public
stable
as $$
  select payload
  from public.rankforge_public_profiles
  where char_length(trim(coalesce(p_query, ''))) between 2 and 60
    and position(lower(left(trim(p_query), 60)) in lower(display_name)) > 0
  order by rank_score desc, updated_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 25));
$$;

create or replace function public.rf_get_profiles(p_profile_ids text[])
returns setof jsonb
language sql
security definer
set search_path = public
stable
as $$
  select payload
  from public.rankforge_public_profiles
  where profile_id = any(coalesce(p_profile_ids[1:100], array[]::text[]))
  order by rank_score desc, updated_at desc
  limit 100;
$$;

create or replace function public.rf_delete_profile(p_profile_id text, p_write_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(coalesce(p_write_token, ''), 'sha256'), 'hex');
  v_deleted integer := 0;
begin
  if p_profile_id !~ '^athlete-[A-Za-z0-9-]{8,90}$' or char_length(coalesce(p_write_token,'')) < 24 then
    return jsonb_build_object('ok', false);
  end if;
  delete from public.rankforge_public_profiles where profile_id = p_profile_id and write_token_hash = v_hash;
  get diagnostics v_deleted = row_count;
  return jsonb_build_object('ok', v_deleted = 1);
end;
$$;

revoke all on function public.rf_safe_int(text, integer, integer, integer) from public;
revoke all on function public.rf_rank_from_score(integer) from public;
revoke all on function public.rf_sanitize_muscles(jsonb) from public;
revoke all on function public.rf_sanitize_stats(jsonb) from public;
revoke all on function public.rf_sanitize_garmin(jsonb) from public;
revoke all on function public.rf_publish_profile(jsonb, text) from public;
revoke all on function public.rf_search_profiles(text, integer) from public;
revoke all on function public.rf_get_profiles(text[]) from public;
revoke all on function public.rf_delete_profile(text, text) from public;

grant execute on function public.rf_publish_profile(jsonb, text) to anon, authenticated;
grant execute on function public.rf_search_profiles(text, integer) to anon, authenticated;
grant execute on function public.rf_get_profiles(text[]) to anon, authenticated;
grant execute on function public.rf_delete_profile(text, text) to anon, authenticated;
