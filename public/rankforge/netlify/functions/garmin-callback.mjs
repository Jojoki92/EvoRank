import {
  accountLabel,
  adminRequest,
  decryptSecret,
  encryptSecret,
  garminUserId,
  garminUserInfo,
  oauthConfig,
  saveConnection,
  sha256,
  tokenRequest
} from "./_garmin-common.mjs";

function appOrigin(request) {
  const candidates = [process.env.URL, process.env.DEPLOY_PRIME_URL, new URL(request.url).origin];
  for (const value of candidates) {
    try {
      const url = new URL(value);
      if (url.protocol === "https:" || url.hostname === "localhost") return url.origin;
    } catch { /* next candidate */ }
  }
  return new URL(request.url).origin;
}

function redirectToApp(request, returnTo, result) {
  const target = new URL(String(returnTo || "/#sports"), appOrigin(request));
  if (target.origin !== appOrigin(request)) target.href = `${appOrigin(request)}/#sports`;
  target.searchParams.set("garmin", result);
  return new Response(null, {
    status:302,
    headers:{ location:target.href, "cache-control":"no-store", "referrer-policy":"no-referrer" }
  });
}

export default async function handler(request) {
  if (request.method !== "GET") return new Response("Method Not Allowed", { status:405 });
  const url = new URL(request.url);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  let oauthState = null;
  try {
    if (!state || !code || url.searchParams.get("error")) throw new Error("Garmin-Autorisierung abgebrochen");
    const rows = await adminRequest(`rf_garmin_oauth_states?select=*&state_hash=eq.${encodeURIComponent(sha256(state))}&limit=1`);
    oauthState = Array.isArray(rows) ? rows[0] || null : null;
    if (!oauthState || Date.parse(oauthState.expires_at || "") < Date.now()) throw new Error("Garmin-Anmeldung ist abgelaufen");
    await adminRequest(`rf_garmin_oauth_states?state_hash=eq.${encodeURIComponent(oauthState.state_hash)}`, { method:"DELETE", prefer:"return=minimal" });

    const config = oauthConfig();
    const token = await tokenRequest({
      grant_type:"authorization_code",
      code,
      redirect_uri:config.redirectUri,
      code_verifier:decryptSecret(oauthState.code_verifier_enc)
    });
    const userInfo = await garminUserInfo(token.access_token);
    const externalUserId = garminUserId(userInfo, token);
    if (!externalUserId) throw new Error("Garmin hat keine Benutzerkennung geliefert");
    const now = new Date().toISOString();
    await saveConnection({
      user_id:oauthState.user_id,
      garmin_user_id:externalUserId,
      account_label:accountLabel(userInfo, token),
      access_token_enc:encryptSecret(token.access_token),
      refresh_token_enc:encryptSecret(token.refresh_token || ""),
      token_expires_at:new Date(Date.now() + Math.max(60, Number(token.expires_in || 3600)) * 1000).toISOString(),
      scope:String(token.scope || config.scope || ""),
      connected_at:now,
      updated_at:now
    });
    return redirectToApp(request, oauthState.return_to, "connected");
  } catch (error) {
    console.error("[EVORANK Garmin callback]", error);
    return redirectToApp(request, oauthState?.return_to, "error");
  }
}
