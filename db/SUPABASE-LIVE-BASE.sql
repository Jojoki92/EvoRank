-- =============================================================================
-- EvoRank – Grundaufbau des BESTEHENDEN Supabase-Projekts (Stand 23.09.2026)
-- Aus der echten Datenbank ausgelesen (nur Struktur, keine Nutzerdaten).
-- Dient als Referenz und für lokale Tests. NICHT erneut auf dem echten Projekt
-- ausführen – dort existiert das alles bereits. Danach gilt SUPABASE-LIVE-X5.9.sql.
-- =============================================================================

create extension if not exists citext;

create table if not exists public.rankforge_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1,
  device_id text,
  device_name text,
  updated_at timestamptz not null default now(),
  constraint rankforge_state_size check (pg_column_size(payload) < 6 * 1024 * 1024)
);
comment on table public.rankforge_state is 'Cloud-Sicherung des lokalen Trainingsstands. Eine Zeile pro Benutzer.';

create table if not exists public.rf_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname citext not null,
  display_name text not null default '',
  avatar text not null default '',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rf_profiles_nickname_format check (nickname ~ '^[a-z0-9]([a-z0-9._]{1,18})[a-z0-9]$'::citext),
  constraint rf_profiles_display_name_length check (char_length(display_name) <= 40),
  constraint rf_profiles_avatar_length check (char_length(avatar) <= 4000),
  constraint rf_profiles_snapshot_size check (pg_column_size(snapshot) <= 262144)
);
create unique index if not exists rf_profiles_nickname_key on public.rf_profiles (nickname);

create table if not exists public.rf_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint rf_friendships_status check (status = any (array['pending'::text, 'accepted'::text])),
  constraint rf_friendships_no_self check (requester_id <> addressee_id)
);
create unique index if not exists rf_friendships_pair_key
  on public.rf_friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists rf_friendships_requester on public.rf_friendships (requester_id);
create index if not exists rf_friendships_addressee on public.rf_friendships (addressee_id);

alter table public.rankforge_state enable row level security;
alter table public.rf_profiles enable row level security;
alter table public.rf_friendships enable row level security;

create policy rankforge_state_select on public.rankforge_state for select using (auth.uid() = user_id);
create policy rankforge_state_insert on public.rankforge_state for insert with check (auth.uid() = user_id);
create policy rankforge_state_update on public.rankforge_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy rankforge_state_delete on public.rankforge_state for delete using (auth.uid() = user_id);
create policy rf_profiles_self_select on public.rf_profiles for select using (auth.uid() = id);
create policy rf_profiles_self_write on public.rf_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy rf_friendships_involved_select on public.rf_friendships for select using ((auth.uid() = requester_id) or (auth.uid() = addressee_id));

create or replace function public.rf_are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.rf_friendships f
    where f.status = 'accepted'
      and ((f.requester_id = a and f.addressee_id = b)
        or (f.requester_id = b and f.addressee_id = a))
  );
$$;

create or replace function public.rf_state_load()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_row public.rankforge_state;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  select * into v_row from public.rankforge_state where user_id = auth.uid();
  if not found then return jsonb_build_object('found', false, 'revision', 0); end if;
  return jsonb_build_object('found', true, 'revision', v_row.revision, 'payload', v_row.payload,
    'updatedAt', v_row.updated_at, 'deviceName', v_row.device_name);
end;
$$;

create or replace function public.rf_state_save(p_payload jsonb, p_revision bigint, p_device_id text default null, p_device_name text default null, p_force boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_current public.rankforge_state;
  v_next bigint;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'ungueltiger Inhalt'; end if;
  if pg_column_size(p_payload) >= 6 * 1024 * 1024 then raise exception 'Trainingsstand ist zu gross'; end if;
  select * into v_current from public.rankforge_state where user_id = auth.uid() for update;
  if not found then
    insert into public.rankforge_state (user_id, payload, revision, device_id, device_name)
    values (auth.uid(), p_payload, 1, p_device_id, left(coalesce(p_device_name, ''), 60));
    return jsonb_build_object('ok', true, 'revision', 1);
  end if;
  if not p_force and v_current.revision <> coalesce(p_revision, 0) then
    return jsonb_build_object('ok', false, 'conflict', true, 'serverRevision', v_current.revision,
      'serverUpdatedAt', v_current.updated_at, 'serverDevice', v_current.device_name, 'serverPayload', v_current.payload);
  end if;
  v_next := v_current.revision + 1;
  update public.rankforge_state
     set payload = p_payload, revision = v_next, device_id = p_device_id,
         device_name = left(coalesce(p_device_name, ''), 60), updated_at = now()
   where user_id = auth.uid();
  return jsonb_build_object('ok', true, 'revision', v_next);
end;
$$;

create or replace function public.rf_profile_me()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  row_data public.rf_profiles;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  select * into row_data from public.rf_profiles where id = me;
  if not found then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'profile', jsonb_build_object(
    'id', row_data.id, 'nickname', row_data.nickname::text, 'displayName', row_data.display_name,
    'avatar', row_data.avatar, 'updatedAt', row_data.updated_at));
end;
$$;

create or replace function public.rf_profile_upsert(p_nickname text, p_display_name text default '', p_avatar text default '')
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  clean citext := lower(btrim(p_nickname));
  row_data public.rf_profiles;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if clean !~ '^[a-z0-9]([a-z0-9._]{1,18})[a-z0-9]$' or clean ~ '[._]{2,}' then raise exception 'nickname_invalid'; end if;
  if exists (select 1 from public.rf_profiles where nickname = clean and id <> me) then raise exception 'nickname_taken'; end if;
  insert into public.rf_profiles as p (id, nickname, display_name, avatar)
  values (me, clean, left(coalesce(p_display_name, ''), 40), left(coalesce(p_avatar, ''), 4000))
  on conflict (id) do update
    set nickname = excluded.nickname, display_name = excluded.display_name,
        avatar = excluded.avatar, updated_at = now()
  returning * into row_data;
  return jsonb_build_object('ok', true, 'profile', jsonb_build_object(
    'id', row_data.id, 'nickname', row_data.nickname::text, 'displayName', row_data.display_name,
    'avatar', row_data.avatar, 'updatedAt', row_data.updated_at));
end;
$$;

create or replace function public.rf_profile_publish(p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'snapshot_invalid'; end if;
  if pg_column_size(p_snapshot) > 262144 then raise exception 'snapshot_too_large'; end if;
  update public.rf_profiles set snapshot = p_snapshot, updated_at = now() where id = me;
  if not found then raise exception 'profile_missing'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_profile_search(p_query text, p_limit integer default 20)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  term text := lower(btrim(coalesce(p_query, '')));
  cap integer := least(greatest(coalesce(p_limit, 20), 1), 25);
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if char_length(term) < 3 then raise exception 'query_too_short'; end if;
  return coalesce((
    select jsonb_agg(entry order by entry ->> 'nickname')
    from (
      select jsonb_build_object('id', p.id, 'nickname', p.nickname::text, 'displayName', p.display_name,
        'rank', coalesce(p.snapshot #>> '{rank,title}', p.snapshot ->> 'rankTitle', '')) as entry
      from public.rf_profiles p
      where p.id <> me and p.nickname::text like term || '%'
      order by p.nickname
      limit cap
    ) hits
  ), '[]'::jsonb);
end;
$$;

create or replace function public.rf_friend_request(p_nickname text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  target uuid;
  offen integer;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.rf_profiles where id = me) then raise exception 'profile_missing'; end if;
  select id into target from public.rf_profiles where nickname = lower(btrim(p_nickname));
  if target is null then raise exception 'profile_not_found'; end if;
  if target = me then raise exception 'self_request'; end if;
  select count(*) into offen from public.rf_friendships where requester_id = me and status = 'pending';
  if offen >= 50 then raise exception 'too_many_pending'; end if;
  if exists (
    select 1 from public.rf_friendships
     where least(requester_id, addressee_id) = least(me, target)
       and greatest(requester_id, addressee_id) = greatest(me, target)
  ) then raise exception 'already_requested'; end if;
  insert into public.rf_friendships (requester_id, addressee_id, status) values (me, target, 'pending');
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_accept(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  update public.rf_friendships set status = 'accepted', responded_at = now()
   where id = p_request_id and addressee_id = me and status = 'pending';
  if not found then raise exception 'request_not_found'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_decline(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  delete from public.rf_friendships
   where id = p_request_id and status = 'pending' and me in (requester_id, addressee_id);
  if not found then raise exception 'request_not_found'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_remove(p_friend_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  delete from public.rf_friendships
   where least(requester_id, addressee_id) = least(me, p_friend_id)
     and greatest(requester_id, addressee_id) = greatest(me, p_friend_id);
  if not found then raise exception 'friendship_not_found'; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.rf_friend_list()
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not_authenticated'; end if;
  return jsonb_build_object(
    'friends', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'nickname', p.nickname::text, 'displayName', p.display_name,
        'avatar', p.avatar, 'snapshot', p.snapshot, 'updatedAt', p.updated_at) order by p.nickname)
      from public.rf_friendships f
      join public.rf_profiles p on p.id = case when f.requester_id = me then f.addressee_id else f.requester_id end
      where f.status = 'accepted' and me in (f.requester_id, f.addressee_id)
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object('requestId', f.id, 'id', p.id, 'nickname', p.nickname::text,
        'displayName', p.display_name, 'createdAt', f.created_at) order by f.created_at desc)
      from public.rf_friendships f join public.rf_profiles p on p.id = f.requester_id
      where f.status = 'pending' and f.addressee_id = me
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object('requestId', f.id, 'id', p.id, 'nickname', p.nickname::text,
        'displayName', p.display_name, 'createdAt', f.created_at) order by f.created_at desc)
      from public.rf_friendships f join public.rf_profiles p on p.id = f.addressee_id
      where f.status = 'pending' and f.requester_id = me
    ), '[]'::jsonb)
  );
end;
$$;
