import {authenticatedUser,adminRequest,config,getConnection,connectionPath,decrypt,tokenRequest,tokenFields,normalizedActivity,json,errorResponse,fail} from './_strava-common.mjs';
export default async function handler(request){
  if(request.method!=='POST')return json(405,{error:'Nur POST wird unterstützt.'});
  let lockedPath='';
  try{
    const user=await authenticatedUser(request);config();let c=await getConnection(user.id);
    if(!c)throw fail(409,'Strava ist nicht verbunden.');
    if(Date.now()-Date.parse(c.last_sync_at||'')<300000)return json(200,{activities:c.activities||[],lastSyncAt:c.last_sync_at,cached:true});
    const now=new Date().toISOString(),lease=new Date(Date.now()+120000).toISOString();
    const locked=await adminRequest(`${connectionPath(user.id)}&or=(sync_locked_until.is.null,sync_locked_until.lt.${encodeURIComponent(now)})`,{method:'PATCH',prefer:'return=representation',body:{sync_locked_until:lease}});
    if(!locked?.[0])throw fail(409,'Strava wird gerade aktualisiert. Bitte kurz warten.');
    c=locked[0];lockedPath=`${connectionPath(user.id)}&sync_locked_until=eq.${encodeURIComponent(lease)}`;
    if(Date.parse(c.expires_at)<Date.now()+60000){const token=await tokenRequest({grant_type:'refresh_token',refresh_token:decrypt(c.refresh_token_enc)});const fields=tokenFields(token);await adminRequest(lockedPath,{method:'PATCH',prefer:'return=minimal',body:fields});Object.assign(c,fields);}
    const access=decrypt(c.access_token_enc),activities=[];let truncated=false;
    for(let page=1;page<=5;page++){
      const url=new URL('https://www.strava.com/api/v3/athlete/activities');url.searchParams.set('after',String(Math.floor(Date.now()/1000)-90*86400));url.searchParams.set('per_page','100');url.searchParams.set('page',String(page));
      const response=await fetch(url,{headers:{authorization:`Bearer ${access}`},signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw fail(response.status===429?429:502,response.status===429?'Strava-Anfragelimit erreicht. Bitte später erneut versuchen.':'Strava-Abruf fehlgeschlagen. Bitte erneut versuchen oder neu verbinden.');
      const rows=await response.json();if(!Array.isArray(rows))throw fail(502,'Unbekannte Strava-Antwort.');
      activities.push(...rows.map(normalizedActivity).filter(Boolean));
      if(rows.length<100)break;if(page===5)truncated=true;
    }
    const unique=[...new Map(activities.map(item=>[item.id,item])).values()],lastSyncAt=new Date().toISOString();
    const saved=await adminRequest(lockedPath,{method:'PATCH',prefer:'return=representation',body:{activities:unique,last_sync_at:lastSyncAt,sync_locked_until:null}});
    if(!saved?.length)throw fail(409,'Die Strava-Verbindung wurde inzwischen geändert.');
    lockedPath='';return json(200,{activities:unique,lastSyncAt,truncated});
  }catch(error){return errorResponse(error);}finally{if(lockedPath)await adminRequest(lockedPath,{method:'PATCH',prefer:'return=minimal',body:{sync_locked_until:null}}).catch(()=>{});}
}
