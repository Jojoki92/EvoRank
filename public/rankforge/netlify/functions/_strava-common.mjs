import crypto from 'node:crypto';
import {adminRequest, authenticatedUser, json, sha256, randomToken} from './_garmin-common.mjs';
export {adminRequest, authenticatedUser, json, sha256, randomToken};
export const fail=(status,message)=>Object.assign(new Error(message),{status});
export function errorResponse(error){return json(error.status||503,{error:error.status?error.message:'Strava ist auf diesem EvoRank-Server noch nicht vollständig eingerichtet.'});}
export function config(){
  const clientId=process.env.STRAVA_CLIENT_ID,clientSecret=process.env.STRAVA_CLIENT_SECRET,key=process.env.STRAVA_TOKEN_ENCRYPTION_KEY;
  let redirect;try{redirect=new URL(process.env.STRAVA_REDIRECT_URI);}catch{}
  if(!clientId||!clientSecret||!key||key.length<32||redirect?.protocol!=='https:'||redirect.pathname!=='/api/strava/callback')throw fail(503,'Strava ist noch nicht eingerichtet. Hinweise stehen in der X4.5-Anleitung.');
  return {clientId,clientSecret,key:crypto.createHash('sha256').update(key).digest(),redirect};
}
export function encrypt(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',config().key,iv);const data=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),data].map(v=>v.toString('base64url')).join('.');}
export function decrypt(value){const [iv,tag,data]=String(value).split('.').map(v=>Buffer.from(v,'base64url'));const cipher=crypto.createDecipheriv('aes-256-gcm',config().key,iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');}
export const connectionPath=id=>`rf_strava_connections?user_id=eq.${encodeURIComponent(id)}`;
export async function getConnection(id){return (await adminRequest(`${connectionPath(id)}&select=*&limit=1`))?.[0]||null;}
export async function tokenRequest(params){
  const c=config();const response=await fetch('https://www.strava.com/oauth/token',{method:'POST',body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,...params}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();if(!response.ok||!data.access_token||!data.refresh_token||!Number.isFinite(data.expires_at))throw fail(502,'Strava hat die Anmeldung nicht bestätigt. Bitte neu verbinden.');return data;
}
export function tokenFields(token){return {access_token_enc:encrypt(token.access_token),refresh_token_enc:encrypt(token.refresh_token),expires_at:new Date(token.expires_at*1000).toISOString()};}
export function normalizedActivity(item){
  const sport=({Run:'run',TrailRun:'run',VirtualRun:'run',Ride:'bike',VirtualRide:'bike',MountainBikeRide:'bike',GravelRide:'bike',Swim:'swim'})[item.sport_type||item.type];
  const date=new Date(item.start_date),duration=Number(item.moving_time),distance=Number(item.distance);
  if(!sport||!/^\d+$/.test(String(item.id))||!Number.isFinite(+date)||!Number.isFinite(duration)||duration<=0||!Number.isFinite(distance)||distance<0)return null;
  return {id:`strava-${item.id}`,externalId:String(item.id),sport,date:date.toISOString(),durationSeconds:Math.round(duration),distanceMeters:Math.round(distance),source:'strava'};
}
export function cookie(value,clear=false){return `evorank_strava_state=${value}; Path=/api/strava; HttpOnly; Secure; SameSite=Lax; Max-Age=${clear?0:600}`;}
export function redirect(result){const target=new URL('/#sports',config().redirect.origin);target.searchParams.set('strava',result);return new Response(null,{status:302,headers:{location:target.href,'cache-control':'no-store','referrer-policy':'no-referrer','set-cookie':cookie('',true)}});}
