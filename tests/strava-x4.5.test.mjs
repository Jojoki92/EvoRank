import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import connect from '../public/rankforge/netlify/functions/strava-connect.mjs';
import callback from '../public/rankforge/netlify/functions/strava-callback.mjs';
import sync from '../public/rankforge/netlify/functions/strava-sync.mjs';
import status from '../public/rankforge/netlify/functions/strava-status.mjs';
import disconnect from '../public/rankforge/netlify/functions/strava-disconnect.mjs';
import {encrypt,decrypt,normalizedActivity,sha256} from '../public/rankforge/netlify/functions/_strava-common.mjs';
const previousFetch=globalThis.fetch;
const vars={STRAVA_CLIENT_ID:'123',STRAVA_CLIENT_SECRET:'test-client-secret',STRAVA_TOKEN_ENCRYPTION_KEY:'test-key-not-for-production-123456789',STRAVA_REDIRECT_URI:'https://evorank.example/api/strava/callback',SUPABASE_URL:'https://db.example',SUPABASE_SERVICE_ROLE_KEY:'test-service-key',SUPABASE_PUBLISHABLE_KEY:'test-public-key'};
const saved=Object.fromEntries(Object.keys(vars).map(key=>[key,process.env[key]]));Object.assign(process.env,vars);
after(()=>{globalThis.fetch=previousFetch;for(const [key,value]of Object.entries(saved))if(value===undefined)delete process.env[key];else process.env[key]=value;});
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const request=(name,method='POST',headers={})=>new Request(`https://evorank.example/api/strava/${name}`,{method,headers:{authorization:'Bearer test-user-token',...headers}});
const user='00000000-0000-4000-8000-000000000001';
test('Strava imports only supported personal activity fields',()=>{
  const item=normalizedActivity({id:123,type:'Run',start_date:'2026-09-01T10:00:00Z',moving_time:1200,distance:5000,map:{private:'route'},name:'Private name'});
  assert.equal(item.source,'strava');assert.equal(item.sport,'run');assert.equal(item.map,undefined);assert.equal(item.name,undefined);
  assert.equal(normalizedActivity({id:123,type:'Walk'}),null);
});
test('Strava token storage uses authenticated encryption and rejects tampering',()=>{
  const encrypted=encrypt('private-access-token');assert.equal(decrypt(encrypted),'private-access-token');assert.ok(!encrypted.includes('private-access-token'));
  const parts=encrypted.split('.');parts[1]=Buffer.alloc(16).toString('base64url');assert.throws(()=>decrypt(parts.join('.')));
});
test('all account endpoints reject unauthenticated requests before outbound calls',async()=>{
  globalThis.fetch=()=>{throw new Error('Unexpected network');};
  for(const [name,handler,method]of[['connect',connect,'POST'],['sync',sync,'POST'],['status',status,'GET'],['disconnect',disconnect,'POST']])assert.equal((await handler(new Request(`https://evorank.example/api/strava/${name}`,{method}))).status,401);
});
test('connect uses current account, read-only scope and browser-bound OAuth state',async()=>{
  let stored;globalThis.fetch=async(url,options)=>String(url).endsWith('/auth/v1/user')?response({id:user}):(stored=JSON.parse(options.body),response(null));
  const result=await connect(request('connect')),body=await result.json(),url=new URL(body.authorizationUrl);
  assert.equal(url.origin,'https://www.strava.com');assert.equal(url.searchParams.get('scope'),'activity:read');assert.equal(stored.user_id,user);assert.equal(stored.state_hash,sha256(url.searchParams.get('state')));assert.ok(result.headers.get('set-cookie').includes('HttpOnly'));assert.ok(!JSON.stringify(body).includes(vars.STRAVA_CLIENT_SECRET));
});
test('callback rejects missing browser binding without exchanging a code',async()=>{
  globalThis.fetch=()=>{throw new Error('Unexpected network');};
  const result=await callback(new Request('https://evorank.example/api/strava/callback?state=wrong&code=test&scope=activity:read'));
  assert.equal(result.status,400);
});
test('callback consumes OAuth state once, encrypts tokens and redirects to the configured origin',async()=>{
  let consumed=false,stored;
  globalThis.fetch=async(url,options)=>{
    if(String(url).includes('rf_strava_oauth_states')){assert.equal(options.method,'DELETE');if(consumed)return response([]);consumed=true;return response([{user_id:user}]);}
    if(String(url).endsWith('/oauth/token'))return response({access_token:'secret-access',refresh_token:'secret-refresh',expires_at:Math.floor(Date.now()/1000)+21600,athlete:{id:123}});
    stored=JSON.parse(options.body);return response(null);
  };
  const req=()=>new Request('https://evorank.example/api/strava/callback?state=test-state&code=test&scope=activity:read',{headers:{cookie:`evorank_strava_state=${sha256('test-state')}`}});
  const result=await callback(req());assert.equal(result.status,302);assert.equal(new URL(result.headers.get('location')).origin,'https://evorank.example');assert.equal(stored.user_id,user);assert.equal(decrypt(stored.access_token_enc),'secret-access');assert.equal((await callback(req())).status,400);
});
test('sync refreshes tokens under a per-user lease and returns only normalized activities',async()=>{
  const connection={user_id:user,expires_at:'2020-01-01',access_token_enc:encrypt('old'),refresh_token_enc:encrypt('refresh')};
  let refreshed=false,leased=false,stored;
  globalThis.fetch=async(url,options={})=>{
    const address=String(url);
    if(address.endsWith('/auth/v1/user'))return response({id:user});
    if(address.endsWith('/oauth/token')){assert.equal(leased,true);refreshed=true;return response({access_token:'new',refresh_token:'rotated',expires_at:Math.floor(Date.now()/1000)+21600});}
    if(address.includes('/athlete/activities')){assert.equal(refreshed,true);assert.equal(options.headers.authorization,'Bearer new');return response([{id:987,type:'Run',start_date:'2026-09-08T12:00:00Z',distance:5000,moving_time:1500,private:true,map:{private:'coordinates'}}]);}
    if(!options.method||options.method==='GET')return response([connection]);
    const body=JSON.parse(options.body);
    if(body.sync_locked_until){leased=true;return response([connection]);}
    if(body.activities){stored=body;return response([connection]);}
    return response(null);
  };
  const result=await sync(request('sync')),body=await result.json();assert.equal(result.status,200);assert.equal(body.activities.length,1);assert.equal(body.activities[0].map,undefined);assert.equal(stored.sync_locked_until,null);assert.ok(!JSON.stringify(body).includes('rotated'));
});
test('a concurrent Strava sync cannot refresh the same token twice',async()=>{
  globalThis.fetch=async(url,options={})=>String(url).endsWith('/auth/v1/user')?response({id:user}):response(options.method==='PATCH'?[]:[{expires_at:'2020-01-01'}]);
  assert.equal((await sync(request('sync'))).status,409);
});
test('disconnect refreshes expired access, revokes authorization and deletes only its leased row',async()=>{
  const connection={user_id:user,expires_at:'2020-01-01',access_token_enc:encrypt('old'),refresh_token_enc:encrypt('refresh')};let revoked=false,removed=false;
  globalThis.fetch=async(url,options={})=>{
    const address=String(url);if(address.endsWith('/auth/v1/user'))return response({id:user});
    if(address.endsWith('/oauth/token'))return response({access_token:'fresh',refresh_token:'renewed',expires_at:Math.floor(Date.now()/1000)+21600});
    if(address.endsWith('/oauth/deauthorize')){assert.equal(options.body.get('access_token'),'fresh');revoked=true;return response({});}
    if(options.method==='DELETE'){assert.equal(revoked,true);assert.ok(address.includes('sync_locked_until=eq.'));removed=true;return response([connection]);}
    return response([connection]);
  };
  assert.equal((await disconnect(request('disconnect'))).status,200);assert.equal(removed,true);
});
