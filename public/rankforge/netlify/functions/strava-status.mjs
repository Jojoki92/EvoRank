import {authenticatedUser,config,getConnection,json,errorResponse} from './_strava-common.mjs';
export default async function handler(request){
  if(request.method!=='GET')return json(405,{error:'Nur GET wird unterstützt.'});
  try{const user=await authenticatedUser(request);config();const c=await getConnection(user.id);return json(200,{connected:Boolean(c),lastSyncAt:c?.last_sync_at||''});}catch(error){return errorResponse(error);}
}
