import {
  adminRequest,
  authenticatedUser,
  encryptSecret,
  json,
  normalizeReturnTo,
  oauthConfig,
  randomToken,
  serverError,
  sha256
} from "./_garmin-common.mjs";

export default async function handler(request) {
  if (request.method !== "POST") return json(405, { error:"Nur POST wird unterstützt." });
  try {
    const user = await authenticatedUser(request);
    const config = oauthConfig();
    const input = await request.json().catch(() => ({}));
    const state = randomToken(32);
    const verifier = randomToken(48);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await adminRequest("rf_garmin_oauth_states", {
      method:"POST",
      prefer:"return=minimal",
      body:{
        state_hash:sha256(state),
        user_id:user.id,
        code_verifier_enc:encryptSecret(verifier),
        return_to:normalizeReturnTo(request, input.returnTo),
        expires_at:expiresAt
      }
    });

    const authorization = new URL(config.authorizationUrl);
    authorization.searchParams.set("response_type", "code");
    authorization.searchParams.set("client_id", config.clientId);
    authorization.searchParams.set("redirect_uri", config.redirectUri);
    authorization.searchParams.set("scope", config.scope);
    authorization.searchParams.set("state", state);
    authorization.searchParams.set("code_challenge", sha256(verifier));
    authorization.searchParams.set("code_challenge_method", "S256");
    return json(200, { authorizationUrl:authorization.href, expiresAt });
  } catch (error) {
    return serverError(error, "Garmin-Verbindung konnte nicht gestartet werden.");
  }
}
