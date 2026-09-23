import test from 'node:test';
import assert from 'node:assert/strict';
import {startSupabaseMock} from './helpers/supabase-mock.mjs';

test('friends without links: suggestions, search by name, mutual request, live status', async () => {
  const mock = await startSupabaseMock({extraSql: ['db/SUPABASE-LIVE-X6.0.sql']});
  const post = async (path, body, token) => {
    const res = await fetch(mock.url + path, {method: 'POST', headers: {'content-type': 'application/json', ...(token ? {authorization: 'Bearer ' + token} : {})}, body: JSON.stringify(body || {})});
    return {status: res.status, body: await res.json()};
  };
  try {
    const users = {};
    for (const [nick, name] of [['anna', 'Anna Berger'], ['ben_k', 'Ben'], ['carla', 'Carla']]) {
      const {body} = await post('/auth/v1/signup', {email: nick + '@test.at', password: 'x'});
      users[nick] = body.access_token;
      await post('/rest/v1/rpc/rf_profile_upsert', {p_nickname: nick, p_display_name: name}, users[nick]);
    }
    const rpc = async (who, name, args) => post('/rest/v1/rpc/' + name, args, users[who]);

    const suggestions = (await rpc('anna', 'rf_profile_search', {p_query: ''})).body;
    assert.deepEqual(suggestions.map(p => p.nickname).sort(), ['ben_k', 'carla']);
    assert.ok(suggestions.every(p => !('email' in p)));
    assert.equal((await rpc('ben_k', 'rf_profile_search', {p_query: 'berg'})).body[0].nickname, 'anna', 'display name search');
    assert.equal((await rpc('anna', 'rf_profile_search', {p_query: '@ca'})).body[0].nickname, 'carla');
    assert.equal((await rpc('anna', 'rf_profile_search', {p_query: '_'})).status, 400);
    assert.equal((await rpc('anna', 'rf_profile_search', {p_query: 'n_'})).body.length, 1, 'underscore is literal');
    assert.equal((await post('/rest/v1/rpc/rf_profile_search', {p_query: ''})).status, 400, 'anonymous search denied');

    assert.equal((await rpc('anna', 'rf_friend_request', {p_nickname: 'ben_k'})).body.accepted, false);
    const seen = (await rpc('ben_k', 'rf_profile_search', {p_query: 'anna'})).body[0];
    assert.equal(seen.relation, 'incoming');
    assert.ok(seen.requestId);
    assert.equal((await rpc('ben_k', 'rf_friend_request', {p_nickname: '@anna'})).body.accepted, true, 'mutual request befriends');

    await rpc('ben_k', 'rf_profile_publish', {p_snapshot: {name: 'Ben', rank: {title: 'Silber II'}, stats: {workouts: 12}}});
    const list = (await rpc('anna', 'rf_friend_list', {})).body;
    assert.equal(list.friends.length, 1);
    assert.equal(list.friends[0].snapshot.rank.title, 'Silber II');
    assert.equal((await rpc('carla', 'rf_friend_list', {})).body.friends.length, 0, 'others see nothing');
    assert.equal((await rpc('anna', 'rf_profile_search', {p_query: 'ben'})).body[0].relation, 'friend');
  } finally {
    await mock.close();
  }
});
