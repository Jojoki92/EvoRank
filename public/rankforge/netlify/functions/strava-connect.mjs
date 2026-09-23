import {authenticatedUser,adminRequest,config,json,errorResponse,randomToken,sha256,cookie} from './_strava-common.mjs';
export default async function handler(request){
  if(request.method!=='POST')return json(405,{error:'Nur POST wird unterstützt.'});
  try{
    const user=await authenticatedUser(request),c=config(),state=randomToken();
    await adminRequest('rf_strava_oauth_states',{method:'POST',prefer:'return=minimal',body:{state_hash:sha256(state),user_id:user.id,expires_at:new Date(Date.now()+600000).toISOString()}});
    const url=new URL('https://www.strava.com/oauth/authorize');
    for(const [key,value] of Object.entries({client_id:c.clientId,redirect_uri:c.redirect.href,response_type:'code',scope:'activity:read',approval_prompt:'auto',state}))url.searchParams.set(key,value);
    const response=json(200,{authorizationUrl:url.href});response.headers.set('set-cookie',cookie(sha256(state)));return response;
  }catch(error){return errorResponse(error);}
}
