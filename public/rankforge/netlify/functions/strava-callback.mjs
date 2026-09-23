import {adminRequest,config,json,errorResponse,sha256,tokenRequest,tokenFields,redirect,fail} from './_strava-common.mjs';
export default async function handler(request){
  if(request.method!=='GET')return json(405,{error:'Nur GET wird unterstützt.'});
  try{
    config();const params=new URL(request.url).searchParams,state=params.get('state')||'';
    const browser=String(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('evorank_strava_state='))?.slice(21);
    if(!state||browser!==sha256(state))throw fail(400,'Strava-Anmeldung gehört nicht zu diesem Browser oder ist abgelaufen.');
    // DELETE RETURNING consumes state atomically: two callbacks cannot reuse it.
    const rows=await adminRequest(`rf_strava_oauth_states?state_hash=eq.${encodeURIComponent(sha256(state))}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`,{method:'DELETE',prefer:'return=representation'});
    if(!rows?.[0])throw fail(400,'Strava-Anmeldung ist abgelaufen.');
    if(params.has('error'))return redirect('cancelled');
    const scopes=String(params.get('scope')||'').split(/[, ]+/);
    if(!scopes.includes('activity:read')&&!scopes.includes('activity:read_all'))return redirect('scope-required');
    const code=params.get('code');if(!code)throw fail(400,'Strava-Anmeldecode fehlt.');
    const token=await tokenRequest({grant_type:'authorization_code',code});
    if(!token.athlete?.id)throw fail(502,'Strava hat keine Kontokennung geliefert.');
    await adminRequest('rf_strava_connections?on_conflict=user_id',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:{user_id:rows[0].user_id,athlete_id:String(token.athlete.id),...tokenFields(token),scope:scopes.join(','),connected_at:new Date().toISOString(),sync_locked_until:null,last_sync_at:null,activities:[]}});
    return redirect('connected');
  }catch(error){return errorResponse(error);}
}
