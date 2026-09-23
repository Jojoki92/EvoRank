import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const sql=readFileSync('db/SUPABASE-BESTENLISTEN-X5.4.sql','utf8');
const users=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'];
test('PostgreSQL: atomic, repeatable leaderboard setup, consent, separation, access, blocking and withdrawal',async t=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated, anon;`);
  await t.test('missing profile setup rolls back all changes',async()=>{await assert.rejects(db.exec(sql),/Kontoeinrichtung fehlt/);await db.exec('rollback;');assert.equal((await db.query("select to_regclass('public.evorank_leaderboard_entries') as name")).rows[0].name,null);});
  await db.exec('create table public.rankforge_profiles(user_id uuid primary key references auth.users(id),nickname text,display_name text,avatar text);');
  for(let i=0;i<users.length;i++){await db.query('insert into auth.users values ($1)',[users[i]]);await db.query("insert into public.rankforge_profiles values ($1,$2,$2,'')",[users[i],'test'+i]);}
  await db.exec(sql);
  const asUser=async user=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user||'']);await db.exec('set role authenticated');};
  const publish=(sport,score=410,stats={})=>db.query('select public.evorank_leaderboard_publish($1,$2,$3,$4::jsonb)',[sport,score,'Rang',JSON.stringify(stats)]);
  const top=async sport=>(await db.query('select * from public.evorank_leaderboard_top($1,10)',[sport])).rows.map(r=>r.evorank_leaderboard_top);
  await t.test('anonymous calls and direct browser table access are denied',async()=>{await db.exec('set role anon');await assert.rejects(top('run'),/permission denied/);await asUser(users[0]);await assert.rejects(db.query('select * from public.evorank_leaderboard_entries'),/permission denied/);await assert.rejects(publish('run'),/consent_required/);assert.deepEqual(await top('run'),[]);});
  await t.test('explicit consent allows four separate sport rows, with bounded public fields',async()=>{await db.query('select public.evorank_leaderboard_consent(true)');for(const sport of ['strength','run','bike','swim'])await publish(sport,410,{sessions:2,recentSessions:1,email:'must-not-leak@example.invalid',bodyweightKg:70});for(const sport of ['strength','run','bike','swim']){const rows=await top(sport);assert.equal(rows.length,1);assert.equal(rows[0].sport,sport);assert.equal(rows[0].isMe,true);assert.doesNotMatch(JSON.stringify(rows),/must-not-leak|bodyweightKg/);}});
  await t.test('another account cannot publish without its own consent',async()=>{await asUser(users[1]);await assert.rejects(publish('run'),/consent_required/);await db.query('select public.evorank_leaderboard_consent(true)');await publish('run',510);assert.deepEqual((await top('run')).map(r=>r.score),[510,410]);});
  await t.test('blocking is reciprocal and withdrawal deletes the user across sports',async()=>{await db.query('select public.evorank_leaderboard_block($1,true)',[users[0]]);assert.equal((await top('run')).length,1);await asUser(users[0]);assert.equal((await top('run')).length,1);await db.query('select public.evorank_leaderboard_withdraw()');for(const sport of ['strength','run','bike','swim'])assert.equal((await top(sport)).length,0);await assert.rejects(publish('bike'),/consent_required/);});
  await t.test('repeat setup preserves entries and consent without needing Garmin',async()=>{await db.exec('reset role');await db.exec(sql);assert.equal((await db.query('select count(*)::int as n from public.evorank_leaderboard_entries')).rows[0].n,1);await asUser(users[0]);await db.query('select public.evorank_leaderboard_consent(true)');await publish('bike');await assert.rejects(publish('swim',100,{source:'garmin'}),/garmin_activity_not_verified/);});
  await t.test('invalid sports, scores, rapid publishing and a client-cleared moderation flag are rejected',async()=>{await assert.rejects(publish('yoga'),/invalid_sport/);await assert.rejects(publish('swim',-1),/invalid_score/);await assert.rejects(publish('bike'),/rate_limited/);await db.exec('reset role');await db.query("update public.evorank_leaderboard_entries set moderation_state='rejected',updated_at=now()-interval '1 minute' where user_id=$1 and sport='bike'",[users[0]]);await asUser(users[0]);await publish('bike',411);assert.equal((await top('bike')).length,0);});
 } finally {await db.close();}
});
test('Windows setup matches the tested SQL exactly',()=>{assert.equal(readFileSync('packaging/windows/BESTENLISTEN-EINRICHTEN/1-BESTENLISTEN-EINRICHTEN.sql','utf8'),sql);});
