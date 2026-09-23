-- =============================================================================
-- EvoRank X6.0 – Freunde finden ohne Links
-- * Suche nach Spitzname ODER Anzeigename, ab 2 Zeichen. Leere Suche zeigt
--   Vorschläge (zuletzt aktive Profile). Jeder Treffer nennt die Beziehung.
-- * Schickt B eine Anfrage an A, während A schon B angefragt hat, sind beide
--   sofort befreundet.
-- Nur Spitzname, Anzeigename und Rang-Titel werden gezeigt – nie E-Mail.
-- =============================================================================
begin;

create or replace function public.rf_profile_search(p_query text, p_limit integer default 20)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  term text := lower(btrim(coalesce(p_query, '')));
  pattern text;
  cap integer := least(greatest(coalesce(p_limit, 20), 1), 25);
begin
  if me is null then raise exception 'not_authenticated'; end if;
  term := ltrim(term, '@');
  if char_length(term) = 1 then raise exception 'query_too_short'; end if;
  pattern := replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_');
  return coalesce((
    select jsonb_agg(entry)
    from (
      select jsonb_build_object(
               'id', p.id,
               'nickname', p.nickname::text,
               'displayName', p.display_name,
               'rank', coalesce(p.snapshot #>> '{rank,title}', nullif(btrim(concat_ws(' ', p.snapshot #>> '{rank,name}', p.snapshot #>> '{rank,division}')), ''), p.snapshot ->> 'rankTitle', ''),
               'relation', case
                 when f.status = 'accepted' then 'friend'
                 when f.status = 'pending' and f.requester_id = me then 'outgoing'
                 when f.status = 'pending' then 'incoming'
                 else '' end,
               'requestId', case when f.status = 'pending' then f.id end
             ) as entry
      from public.rf_profiles p
      left join public.rf_friendships f
        on least(f.requester_id, f.addressee_id) = least(me, p.id)
       and greatest(f.requester_id, f.addressee_id) = greatest(me, p.id)
      where p.id <> me
        and (term = ''
          or p.nickname::text like '%' || pattern || '%'
          or lower(p.display_name) like '%' || pattern || '%')
      order by (term <> '' and p.nickname::text like pattern || '%') desc, p.updated_at desc, p.nickname::text
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
  existing public.rf_friendships;
  offen integer;
begin
  if me is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.rf_profiles where id = me) then raise exception 'profile_missing'; end if;
  select id into target from public.rf_profiles where nickname = lower(btrim(ltrim(btrim(p_nickname), '@')));
  if target is null then raise exception 'profile_not_found'; end if;
  if target = me then raise exception 'self_request'; end if;

  select * into existing from public.rf_friendships
   where least(requester_id, addressee_id) = least(me, target)
     and greatest(requester_id, addressee_id) = greatest(me, target);
  if found then
    if existing.status = 'pending' and existing.addressee_id = me then
      update public.rf_friendships set status = 'accepted', responded_at = now() where id = existing.id;
      return jsonb_build_object('ok', true, 'accepted', true);
    end if;
    raise exception 'already_requested';
  end if;

  select count(*) into offen from public.rf_friendships where requester_id = me and status = 'pending';
  if offen >= 50 then raise exception 'too_many_pending'; end if;

  insert into public.rf_friendships (requester_id, addressee_id, status) values (me, target, 'pending');
  return jsonb_build_object('ok', true, 'accepted', false);
end;
$$;

revoke all on function public.rf_profile_search(text, integer) from public, anon;
revoke all on function public.rf_friend_request(text) from public, anon;
grant execute on function public.rf_profile_search(text, integer) to authenticated;
grant execute on function public.rf_friend_request(text) to authenticated;

commit;
