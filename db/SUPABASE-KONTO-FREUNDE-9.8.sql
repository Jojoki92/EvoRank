-- =============================================================================
-- RANKFORGE 9.8 - Konto, Cloud-Sicherung und bestätigte Freundschaften
-- Im Supabase SQL Editor vollständig ausführen.
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists public.rankforge_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1,
  device_id text,
  device_name text,
  updated_at timestamptz not null default now(),
  constraint rankforge_state_size check (pg_column_size(payload) < 6 * 1024 * 1024)
);

create table if not exists public.rankforge_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  display_name text not null default '',
  avatar text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rankforge_nickname_format check (nickname ~ '^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$'),
  constraint rankforge_display_name_size check (char_length(display_name) <= 40),
  constraint rankforge_avatar_size check (char_length(avatar) <= 4000),
  constraint rankforge_snapshot_size check (pg_column_size(snapshot) < 128 * 1024)
);

create table if not exists public.rankforge_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rankforge_no_self_friend check (requester_id <> addressee_id)
);

create unique index if not exists rankforge_friend_pair_unique
  on public.rankforge_friendships (
    least(requester_id::text, addressee_id::text),
    greatest(requester_id::text, addressee_id::text)
  );

alter table public.rankforge_state enable row level security;
alter table public.rankforge_profiles enable row level security;
alter table public.rankforge_friendships enable row level security;

revoke all on public.rankforge_state from anon, authenticated;
revoke all on public.rankforge_profiles from anon, authenticated;
revoke all on public.rankforge_friendships from anon, authenticated;

-- ------------------------------------------------------------------- Backup
create or replace function public.rf_state_load()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rankforge_state;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select * into v_row from public.rankforge_state where user_id = auth.uid();
  if not found then return jsonb_build_object('found', false, 'revision', 0); end if;
  return jsonb_build_object(
    'found', true,
    'revision', v_row.revision,
    'payload', v_row.payload,
    'updatedAt', v_row.updated_at,
    'deviceName', v_row.device_name
  );
end;
$$;

create or replace function public.rf_state_save(
  p_payload jsonb,
  p_revision bigint,
  p_device_id text default null,
  p_device_name text default null,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current public.rankforge_state;
  v_next bigint;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'invalid_payload'; end if;
  if pg_column_size(p_payload) >= 6 * 1024 * 1024 then raise exception 'payload_too_large'; end if;

  select * into v_current
    from public.rankforge_state
    where user_id = auth.uid()
    for update;

  if not found then
    insert into public.rankforge_state(user_id, payload, revision, device_id, device_name)
    values(auth.uid(), p_payload, 1, left(coalesce(p_device_id, ''), 120), left(coalesce(p_device_name, ''), 60));
    return jsonb_build_object('ok', true, 'revision', 1);
  end if;

  if not p_force and v_current.revision <> coalesce(p_revision, 0) then
    return jsonb_build_object(
      'ok', false,
      'conflict', true,
      'serverRevision', v_current.revision,
      'serverUpdatedAt', v_current.updated_at,
      'serverDevice', v_current.device_name,
      'serverPayload', v_current.payload
    );
  end if;

  v_next := v_current.revision + 1;
  update public.rankforge_state
     set payload = p_payload,
         revision = v_next,
         device_id = left(coalesce(p_device_id, ''), 120),
         device_name = left(coalesce(p_device_name, ''), 60),
         updated_at = now()
   where user_id = auth.uid();
  return jsonb_build_object('ok', true, 'revision', v_next);
end;
$$;

-- ------------------------------------------------------------------ Profile
create or replace function public.rf_profile_me()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rankforge_profiles;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select * into v_row from public.rankforge_profiles where user_id = auth.uid();
  if not found then return jsonb_build_object('found', false); end if;
  return jsonb_build_object(
    'found', true,
    'profile', jsonb_build_object(
      'id', v_row.user_id,
      'nickname', v_row.nickname,
      'displayName', v_row.display_name,
      'avatar', v_row.avatar,
      'updatedAt', v_row.updated_at
    )
  );
end;
$$;

create or replace function public.rf_profile_upsert(
  p_nickname text,
  p_display_name text default '',
  p_avatar text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text := lower(trim(coalesce(p_nickname, '')));
  v_row public.rankforge_profiles;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if v_nickname !~ '^[a-z0-9][a-z0-9._]{1,18}[a-z0-9]$'
     or v_nickname ~ '[._]{2,}' then
    raise exception 'nickname_invalid';
  end if;

  begin
    insert into public.rankforge_profiles(user_id, nickname, display_name, avatar)
    values(
      auth.uid(),
      v_nickname,
      left(trim(coalesce(p_display_name, '')), 40),
      left(coalesce(p_avatar, ''), 4000)
    )
    on conflict(user_id) do update set
      nickname = excluded.nickname,
      display_name = excluded.display_name,
      avatar = excluded.avatar,
      updated_at = now()
    returning * into v_row;
  exception when unique_violation then
    raise exception 'nickname_taken';
  end;

  return jsonb_build_object(
    'ok', true,
    'profile', jsonb_build_object(
      'id', v_row.user_id,
      'nickname', v_row.nickname,
      'displayName', v_row.display_name,
      'avatar', v_row.avatar,
      'updatedAt', v_row.updated_at
    )
  );
end;
$$;

create or replace function public.rf_profile_publish(p_snapshot jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'invalid_snapshot'; end if;
  if pg_column_size(p_snapshot) >= 128 * 1024 then raise exception 'snapshot_too_large'; end if;

  update public.rankforge_profiles
     set snapshot = p_snapshot || jsonb_build_object('athleteId', auth.uid()::text),
         updated_at = now()
   where user_id = auth.uid();
  if not found then raise exception 'profile_required'; end if;
  return jsonb_build_object('ok', true, 'updatedAt', now());
end;
$$;

create or replace function public.rf_profile_search(p_query text, p_limit integer default 20)
returns setof jsonb
language sql
security definer
stable
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.user_id,
    'nickname', p.nickname,
    'displayName', p.display_name,
    'avatar', p.avatar
  )
  from public.rankforge_profiles p
  where auth.uid() is not null
    and p.user_id <> auth.uid()
    and char_length(trim(coalesce(p_query, ''))) between 3 and 30
    and p.nickname like '%' || lower(trim(p_query)) || '%'
  order by
    case when p.nickname = lower(trim(p_query)) then 0 else 1 end,
    p.nickname
  limit greatest(1, least(coalesce(p_limit, 20), 20));
$$;

-- -------------------------------------------------------------- Freundschaft
create or replace function public.rf_friend_request(p_nickname text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select user_id into v_target
    from public.rankforge_profiles
    where nickname = lower(trim(coalesce(p_nickname, '')));
  if v_target is null then raise exception 'profile_not_found'; end if;
  if v_target = auth.uid() then raise exception 'self_request'; end if;

  begin
    insert into public.rankforge_friendships(requester_id, addressee_id)
    values(auth.uid(), v_target);
  exception when unique_violation then
    raise exception 'already_requested';
  end;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_accept(p_request_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update public.rankforge_friendships
     set status = 'accepted', updated_at = now()
   where id = p_request_id::uuid
     and addressee_id = auth.uid()
     and status = 'pending';
  if not found then raise exception 'request_not_found'; end if;
  return jsonb_build_object('ok', true);
exception when invalid_text_representation then
  raise exception 'request_not_found';
end;
$$;

create or replace function public.rf_friend_decline(p_request_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from public.rankforge_friendships
   where id = p_request_id::uuid
     and status = 'pending'
     and (requester_id = auth.uid() or addressee_id = auth.uid());
  if not found then raise exception 'request_not_found'; end if;
  return jsonb_build_object('ok', true);
exception when invalid_text_representation then
  raise exception 'request_not_found';
end;
$$;

create or replace function public.rf_friend_remove(p_friend_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_friend uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  begin
    v_friend := p_friend_id::uuid;
  exception when invalid_text_representation then
    raise exception 'not_friends';
  end;
  delete from public.rankforge_friendships
   where status = 'accepted'
     and ((requester_id = auth.uid() and addressee_id = v_friend)
       or (addressee_id = auth.uid() and requester_id = v_friend));
  if not found then raise exception 'not_friends'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_list()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with accepted as (
    select case
      when f.requester_id = auth.uid() then f.addressee_id
      else f.requester_id
    end as person_id
    from public.rankforge_friendships f
    where f.status = 'accepted'
      and (f.requester_id = auth.uid() or f.addressee_id = auth.uid())
  ),
  friend_rows as (
    select jsonb_build_object(
      'id', p.user_id,
      'nickname', p.nickname,
      'displayName', p.display_name,
      'avatar', p.avatar,
      'snapshot', p.snapshot,
      'updatedAt', p.updated_at
    ) as item
    from accepted a
    join public.rankforge_profiles p on p.user_id = a.person_id
    order by p.nickname
  ),
  incoming_rows as (
    select jsonb_build_object(
      'requestId', f.id,
      'id', p.user_id,
      'nickname', p.nickname,
      'displayName', p.display_name,
      'avatar', p.avatar
    ) as item
    from public.rankforge_friendships f
    join public.rankforge_profiles p on p.user_id = f.requester_id
    where f.status = 'pending' and f.addressee_id = auth.uid()
    order by f.created_at
  ),
  outgoing_rows as (
    select jsonb_build_object(
      'requestId', f.id,
      'id', p.user_id,
      'nickname', p.nickname,
      'displayName', p.display_name,
      'avatar', p.avatar
    ) as item
    from public.rankforge_friendships f
    join public.rankforge_profiles p on p.user_id = f.addressee_id
    where f.status = 'pending' and f.requester_id = auth.uid()
    order by f.created_at
  )
  select case when auth.uid() is null then
    jsonb_build_object('friends', '[]'::jsonb, 'incoming', '[]'::jsonb, 'outgoing', '[]'::jsonb)
  else
    jsonb_build_object(
      'friends', coalesce((select jsonb_agg(item) from friend_rows), '[]'::jsonb),
      'incoming', coalesce((select jsonb_agg(item) from incoming_rows), '[]'::jsonb),
      'outgoing', coalesce((select jsonb_agg(item) from outgoing_rows), '[]'::jsonb)
    )
  end;
$$;

-- Löscht die RankForge-Daten und anschließend das Auth-Konto.
create or replace function public.rf_account_delete()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  delete from public.rankforge_friendships
   where requester_id = v_user or addressee_id = v_user;
  delete from public.rankforge_profiles where user_id = v_user;
  delete from public.rankforge_state where user_id = v_user;
  delete from auth.users where id = v_user;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.rf_state_load() from public, anon;
revoke all on function public.rf_state_save(jsonb, bigint, text, text, boolean) from public, anon;
revoke all on function public.rf_profile_me() from public, anon;
revoke all on function public.rf_profile_upsert(text, text, text) from public, anon;
revoke all on function public.rf_profile_publish(jsonb) from public, anon;
revoke all on function public.rf_profile_search(text, integer) from public, anon;
revoke all on function public.rf_friend_request(text) from public, anon;
revoke all on function public.rf_friend_accept(text) from public, anon;
revoke all on function public.rf_friend_decline(text) from public, anon;
revoke all on function public.rf_friend_remove(text) from public, anon;
revoke all on function public.rf_friend_list() from public, anon;
revoke all on function public.rf_account_delete() from public, anon;

grant execute on function public.rf_state_load() to authenticated;
grant execute on function public.rf_state_save(jsonb, bigint, text, text, boolean) to authenticated;
grant execute on function public.rf_profile_me() to authenticated;
grant execute on function public.rf_profile_upsert(text, text, text) to authenticated;
grant execute on function public.rf_profile_publish(jsonb) to authenticated;
grant execute on function public.rf_profile_search(text, integer) to authenticated;
grant execute on function public.rf_friend_request(text) to authenticated;
grant execute on function public.rf_friend_accept(text) to authenticated;
grant execute on function public.rf_friend_decline(text) to authenticated;
grant execute on function public.rf_friend_remove(text) to authenticated;
grant execute on function public.rf_friend_list() to authenticated;
grant execute on function public.rf_account_delete() to authenticated;

-- Kontrolle:
-- 1. Tabellenzugriff für anon/authenticated ist entzogen.
-- 2. Alle RPCs sind nur für authenticated ausführbar.
-- 3. Suche liefert keine E-Mail-Adresse und keine Trainingsdaten.
-- 4. Snapshots erscheinen ausschließlich in rf_friend_list bei bestätigten Freunden.
