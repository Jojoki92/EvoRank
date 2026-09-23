-- =============================================================================
-- EvoRank 10.11 – Geburtsdatum, einmaliger Geburtstagsbonus und Mailversand
-- Nach den vorhandenen 9.8–10.10-SQL-Dateien im Supabase SQL Editor ausführen.
-- =============================================================================

begin;

alter table public.rankforge_profiles
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
  update public.rankforge_profiles
     set birth_date = p_birth_date, updated_at = now()
   where user_id = auth.uid();
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
  select birth_date into v_birth from public.rankforge_profiles where user_id = auth.uid();
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
  select p.user_id, p.nickname, p.display_name, extract(year from p_on_date)::integer
  from public.rankforge_profiles p
  left join public.evorank_birthday_rewards r
    on r.user_id = p.user_id and r.reward_year = extract(year from p_on_date)::integer
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
