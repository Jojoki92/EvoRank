import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {citext} from '@electric-sql/pglite/contrib/citext';

const sql = readFileSync('db/SUPABASE-LIVE-X5.9.sql', 'utf8');
const [a, b] = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];

// The live project was set up with rf_profiles/rf_friendships (id key), not the
// rankforge_profiles layout of the older repository SQL. Rebuild that shape here.
const liveSchema = `
create extension if not exists citext;
create role anon; create role authenticated; create role service_role;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
create table public.rankforge_state(user_id uuid primary key references auth.users(id), payload jsonb not null default '{}', revision bigint not null default 1, device_id text, device_name text, updated_at timestamptz not null default now());
create table public.rf_profiles(id uuid primary key references auth.users(id), nickname citext not null unique, display_name text not null default '', avatar text not null default '', snapshot jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.rf_friendships(id uuid primary key default gen_random_uuid(), requester_id uuid not null references auth.users(id), addressee_id uuid not null references auth.users(id), status text not null default 'pending', created_at timestamptz not null default now(), responded_at timestamptz);
create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$ begin end $$;
grant usage on schema public to anon, authenticated, service_role;
`;

test('live Supabase setup: leaderboards, birthday, connections and full account deletion', async t => {
  const db = new PGlite({extensions: {citext}});
  try {
    await db.exec(liveSchema);
    for (const [id, nick] of [[a, 'anna'], [b, 'ben']]) {
      await db.query('insert into auth.users values ($1)', [id]);
      await db.query("insert into public.rf_profiles(id, nickname, display_name) values ($1, $2, $3)", [id, nick, nick]);
      await db.query("insert into public.rankforge_state(user_id, payload) values ($1, '{\"workouts\":[]}')", [id]);
    }
    await db.query("insert into public.rf_friendships(requester_id, addressee_id, status) values ($1, $2, 'accepted')", [a, b]);
    await db.exec(sql);
    await db.exec(sql); // repeatable

    const as = async user => { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user || '']); await db.exec(user ? 'set role authenticated' : 'set role anon'); };
    const top = async sport => (await db.query('select * from public.evorank_leaderboard_top($1, 10)', [sport])).rows.map(r => r.evorank_leaderboard_top);

    await t.test('existing training data is untouched', async () => {
      await db.exec('reset role');
      assert.equal((await db.query('select count(*)::int n from public.rankforge_state')).rows[0].n, 2);
      assert.equal((await db.query('select count(*)::int n from public.rf_profiles')).rows[0].n, 2);
    });

    await t.test('leaderboards work with rf_profiles and need consent', async () => {
      await as(a);
      await assert.rejects(db.query("select public.evorank_leaderboard_publish('run', 400, 'Rang', '{}'::jsonb)"), /consent_required/);
      await db.query('select public.evorank_leaderboard_consent(true)');
      await db.query("select public.evorank_leaderboard_publish('run', 400, 'Rang', '{}'::jsonb)");
      const rows = await top('run');
      assert.equal(rows.length, 1);
      assert.equal(rows[0].nickname, 'anna');
      await as(null);
      await assert.rejects(top('run'), /permission denied/);
    });

    await t.test('birthday date is stored on the own profile only', async () => {
      await as(a);
      await db.query("select public.evorank_profile_birth_date('1990-05-01')");
      await db.exec('reset role');
      const rows = (await db.query('select id, birth_date from public.rf_profiles order by nickname')).rows;
      assert.equal(rows.find(r => r.id === a).birth_date.toISOString().slice(0, 10), '1990-05-01');
      assert.equal(rows.find(r => r.id === b).birth_date, null);
    });

    await t.test('helper function and account deletion are not callable anonymously', async () => {
      await as(null);
      await assert.rejects(db.query('select public.rf_account_delete()'), /permission denied/);
      await db.exec('reset role');
      const acl = (await db.query("select has_function_privilege('anon', 'public.rls_auto_enable()', 'execute') a, has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute') b")).rows[0];
      assert.deepEqual(acl, {a: false, b: false});
    });

    await t.test('delete account removes every cloud trace of that user and nothing else', async () => {
      await as(a);
      const result = (await db.query('select public.rf_account_delete() r')).rows[0].r;
      assert.equal(result.ok, true);
      await db.exec('reset role');
      const count = async (q, p = [a]) => (await db.query(q, p)).rows[0].n;
      assert.equal(await count('select count(*)::int n from auth.users where id = $1'), 0);
      assert.equal(await count('select count(*)::int n from public.rankforge_state where user_id = $1'), 0);
      assert.equal(await count('select count(*)::int n from public.rf_profiles where id = $1'), 0);
      assert.equal(await count('select count(*)::int n from public.rf_friendships where requester_id = $1 or addressee_id = $1'), 0);
      assert.equal(await count('select count(*)::int n from public.evorank_leaderboard_entries where user_id = $1'), 0);
      assert.equal(await count('select count(*)::int n from public.evorank_data_consents where user_id = $1'), 0);
      assert.equal(await count('select count(*)::int n from auth.users where id = $1', [b]), 1);
      assert.equal(await count('select count(*)::int n from public.rankforge_state where user_id = $1', [b]), 1);
    });
  } finally {
    await db.close();
  }
});
