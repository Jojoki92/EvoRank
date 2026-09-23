import {
  getConnectionByGarminUser,
  json,
  pullPing,
  saveActivity,
  serverError,
  updateConnection,
  webhookAuthorized,
  webhookBodyAllowed,
  webhookItems
} from "./_garmin-common.mjs";

export default async function handler(request) {
  if (request.method === "GET") return json(200, { ok:true, service:"EVORANK Garmin Activity API" });
  if (request.method !== "POST") return json(405, { error:"Nur POST wird unterstützt." });
  if (!webhookBodyAllowed(request)) return json(413, { error:"Garmin-Nachricht ist zu groß." });
  if (!webhookAuthorized(request)) return json(401, { error:"Ungültige Garmin-Webhook-Anmeldung." });
  try {
    const payload = await request.json();
    const entries = webhookItems(payload);
    const touchedUsers = new Set();
    let accepted = 0;
    let ignored = 0;

    for (const entry of entries) {
      const connection = await getConnectionByGarminUser(entry.garminUserId);
      if (!connection) {
        ignored += 1;
        continue;
      }
      if (entry.kind === "activity") {
        if (await saveActivity(connection.user_id, entry.item)) accepted += 1;
        else ignored += 1;
      } else if (entry.kind === "ping") {
        const pulled = await pullPing(entry.callbackUrl, connection);
        const activities = webhookItems(pulled, entry.garminUserId).filter(item => item.kind === "activity");
        for (const activity of activities) {
          if (await saveActivity(connection.user_id, activity.item)) accepted += 1;
          else ignored += 1;
        }
      }
      touchedUsers.add(connection.user_id);
    }

    const now = new Date().toISOString();
    for (const userId of touchedUsers) await updateConnection(userId, { last_sync_at:now });
    return json(202, { accepted, ignored });
  } catch (error) {
    return serverError(error, "Garmin-Aktivitäten konnten nicht übernommen werden.");
  }
}
