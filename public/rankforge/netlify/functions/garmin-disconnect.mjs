import {
  authenticatedUser,
  deleteConnection,
  freshAccessToken,
  getConnection,
  json,
  oauthConfig,
  serverError
} from "./_garmin-common.mjs";

export default async function handler(request) {
  if (request.method !== "POST") return json(405, { error:"Nur POST wird unterstützt." });
  try {
    const user = await authenticatedUser(request);
    const connection = await getConnection(user.id);
    if (connection) {
      try {
        const config = oauthConfig();
        if (config.revocationUrl) {
          const token = await freshAccessToken(connection);
          await fetch(config.revocationUrl, {
            method:"POST",
            headers:{ authorization:`Bearer ${token}`, "content-type":"application/x-www-form-urlencoded" },
            body:new URLSearchParams({ token })
          });
        }
      } catch (error) {
        console.warn("[EVORANK Garmin] Token konnte nicht remote widerrufen werden", error?.message || error);
      }
      await deleteConnection(user.id);
    }
    return json(200, { disconnected:true });
  } catch (error) {
    return serverError(error, "Garmin konnte nicht getrennt werden.");
  }
}
