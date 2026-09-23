import { authenticatedUser, getConnection, json, listActivities, serverError } from "./_garmin-common.mjs";

export default async function handler(request) {
  if (request.method !== "POST") return json(405, { error:"Nur POST wird unterstützt." });
  try {
    const user = await authenticatedUser(request);
    const connection = await getConnection(user.id);
    if (!connection) return json(409, { error:"Garmin ist noch nicht verbunden.", code:"garmin_not_connected" });
    const rows = await listActivities(user.id);
    const activities = (Array.isArray(rows) ? rows : []).map(row => ({
      id:`garmin-${row.sport}-${row.external_id}`,
      activityId:row.external_id,
      sport:row.sport,
      date:row.started_at,
      distanceMeters:Number(row.distance_m || 0),
      durationSeconds:Number(row.duration_s || 0),
      source:"garmin"
    }));
    return json(200, { activities, lastSyncAt:connection.last_sync_at || "", syncMode:"push" });
  } catch (error) {
    return serverError(error, "Garmin-Aktivitäten konnten nicht geladen werden.");
  }
}
