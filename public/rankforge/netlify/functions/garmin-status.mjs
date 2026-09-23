import { authenticatedUser, getConnection, json, serverError } from "./_garmin-common.mjs";

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { error:"Nur GET wird unterstützt." });
  try {
    const user = await authenticatedUser(request);
    const connection = await getConnection(user.id);
    return json(200, {
      connected:Boolean(connection),
      accountLabel:connection?.account_label || "",
      connectedAt:connection?.connected_at || "",
      lastSyncAt:connection?.last_sync_at || "",
      syncMode:"push"
    });
  } catch (error) {
    return serverError(error, "Garmin-Status konnte nicht geladen werden.");
  }
}
