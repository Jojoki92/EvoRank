// Local stand-in for the EvoRank Supabase project, for tests only.
// Real PostgreSQL rules (PGlite) with the live schema from db/SUPABASE-LIVE-*.sql,
// plus the few Auth/REST endpoints the app calls. No network, no real accounts.
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {citext} from '@electric-sql/pglite/contrib/citext';

const root = new URL('../../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

const PRELUDE = `
create role anon; create role authenticated; create role service_role;
create schema auth;
create table auth.users(id uuid primary key, email text unique, password text, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$ begin end $$;
`;

export async function createDatabase(extraSql = []) {
  const db = new PGlite({extensions: {citext}});
  await db.exec(PRELUDE);
  await db.exec(read('db/SUPABASE-LIVE-BASE.sql'));
  await db.exec(read('db/SUPABASE-LIVE-X5.9.sql'));
  for (const file of extraSql) await db.exec(read(file));
  return db;
}

export async function startSupabaseMock({port = 0, extraSql = []} = {}) {
  const db = await createDatabase(extraSql);
  const tokens = new Map(); // token -> user id
  let queue = Promise.resolve();
  const serial = task => (queue = queue.then(task, task));

  const issue = user => {
    const access = 'at-' + randomUUID();
    const refresh = 'rt-' + randomUUID();
    tokens.set(access, user.id);
    tokens.set(refresh, user.id);
    return {access_token: access, refresh_token: refresh, token_type: 'bearer', expires_in: 3600, user: {id: user.id, email: user.email}};
  };

  async function rpc(name, args, userId) {
    const fn = (await db.query(
      "select p.proretset as set, coalesce(p.proargnames, '{}') as names from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = $1",
      [name])).rows[0];
    if (!fn) return {status: 404, body: {message: `Could not find the function public.${name} in the schema cache`}};
    const keys = Object.keys(args || {}).filter(key => fn.names.includes(key));
    const params = keys.map(key => {
      const value = args[key];
      return value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
    });
    const call = `public.${name}(${keys.map((key, i) => `${key} => $${i + 1}`).join(', ')})`;
    try {
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId || '']);
      await db.exec(userId ? 'set role authenticated' : 'set role anon');
      const result = await db.query(fn.set ? `select * from ${call} as r` : `select ${call} as r`, params);
      const values = result.rows.map(row => Object.values(row)[0]);
      return {status: 200, body: fn.set ? values : values[0] ?? null};
    } catch (error) {
      return {status: 400, body: {message: error.message, code: error.code || ''}};
    } finally {
      await db.exec('reset role');
    }
  }

  async function handle(req, body) {
    const url = new URL(req.url, 'http://mock');
    const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const userId = tokens.get(bearer) || null;
    if (url.pathname === '/auth/v1/signup' && req.method === 'POST') {
      const email = String(body.email || '').toLowerCase();
      if ((await db.query('select 1 from auth.users where email = $1', [email])).rows.length) return {status: 422, body: {msg: 'User already registered', error_code: 'user_already_exists'}};
      const user = {id: randomUUID(), email};
      await db.query('insert into auth.users(id, email, password) values ($1, $2, $3)', [user.id, email, String(body.password || '')]);
      return {status: 200, body: issue(user)};
    }
    if (url.pathname === '/auth/v1/token' && req.method === 'POST') {
      if (url.searchParams.get('grant_type') === 'password') {
        const row = (await db.query('select id, email from auth.users where email = $1 and password = $2', [String(body.email || '').toLowerCase(), String(body.password || '')])).rows[0];
        return row ? {status: 200, body: issue(row)} : {status: 400, body: {error: 'invalid_grant', error_description: 'Invalid login credentials'}};
      }
      const id = tokens.get(String(body.refresh_token || ''));
      const row = id && (await db.query('select id, email from auth.users where id = $1', [id])).rows[0];
      return row ? {status: 200, body: issue(row)} : {status: 400, body: {error: 'invalid_grant', error_description: 'Invalid Refresh Token'}};
    }
    if (url.pathname === '/auth/v1/user') {
      const row = userId && (await db.query('select id, email from auth.users where id = $1', [userId])).rows[0];
      return row ? {status: 200, body: row} : {status: 401, body: {msg: 'invalid JWT'}};
    }
    if (url.pathname.startsWith('/auth/v1/')) return {status: 200, body: {}};
    const match = /^\/rest\/v1\/rpc\/([a-z0-9_]+)$/.exec(url.pathname);
    if (match && req.method === 'POST') return rpc(match[1], body, userId);
    return {status: 404, body: {message: 'not found'}};
  }

  const server = http.createServer((req, res) => {
    const cors = {
      'access-control-allow-origin': req.headers.origin || '*',
      'access-control-allow-headers': 'apikey, authorization, content-type, x-client-info, prefer',
      'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => serial(async () => {
      let body = {};
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
      const out = await handle(req, body).catch(error => ({status: 500, body: {message: error.message}}));
      res.writeHead(out.status, {...cors, 'content-type': 'application/json'});
      res.end(out.body === undefined ? '' : JSON.stringify(out.body));
    }));
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return {
    db,
    url: `http://127.0.0.1:${server.address().port}`,
    rpc,
    close: async () => { await new Promise(resolve => server.close(resolve)); await db.close(); }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 54321);
  const extra = (process.env.EXTRA_SQL || '').split(',').filter(Boolean);
  const mock = await startSupabaseMock({port, extraSql: extra});
  console.log(`Supabase-Testserver läuft: ${mock.url}`);
}
