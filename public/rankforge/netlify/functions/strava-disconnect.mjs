import {authenticatedUser,adminRequest,getConnection,connectionPath,decrypt,tokenRequest,tokenFields,json,errorResponse,fail} from './_strava-common.mjs';
export default async function handler(request){
  if(request.method!=='POST')return json(405,{error:'Nur POST wird unterstützt.'});
  let lockedPath='';
  try{
    const user=await authenticatedUser(request),c=await getConnection(user.id);
    if(c){
      const now=new Date().toISOString(),lease=new Date(Date.now()+90000).toISOString();
      const rows=await adminRequest(`${connectionPath(user.id)}&or=(sync_locked_until.is.null,sync_locked_until.lt.${encodeURIComponent(now)})`,{method:'PATCH',prefer:'return=representation',body:{sync_locked_until:lease}});
      if(!rows?.[0])throw fail(409,'Strava wird gerade aktualisiert. Bitte danach erneut trennen.');
      Object.assign(c,rows[0]);lockedPath=`${connectionPath(user.id)}&sync_locked_until=eq.${encodeURIComponent(lease)}`;
      if(Date.parse(c.expires_at)<Date.now()+60000){
        const token=await tokenRequest({grant_type:'refresh_token',refresh_token:decrypt(c.refresh_token_enc)});
        const fields=tokenFields(token);
        await adminRequest(lockedPath,{method:'PATCH',prefer:'return=minimal',body:fields});
        Object.assign(c,fields);
      }
      const response=await fetch('https://www.strava.com/oauth/deauthorize',{method:'POST',body:new URLSearchParams({access_token:decrypt(c.access_token_enc)}),signal:AbortSignal.timeout(15000)});
      if(!response.ok&&response.status!==401)throw fail(502,'Strava konnte die Verbindung noch nicht trennen. Bitte erneut versuchen.');
      const removed=await adminRequest(lockedPath,{method:'DELETE',prefer:'return=representation'});
      if(!removed?.length)throw fail(409,'Die Verbindung wurde inzwischen geändert. Bitte ihren Stand aktualisieren.');
      lockedPath='';
    }
    return json(200,{connected:false});
  }catch(error){return errorResponse(error);}finally{if(lockedPath)await adminRequest(lockedPath,{method:'PATCH',prefer:'return=minimal',body:{sync_locked_until:null}}).catch(()=>{});}
}
