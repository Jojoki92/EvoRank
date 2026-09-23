/*
  Garmin Connect server contract for EVORANK.

  Keep OAuth client secrets and access tokens on the server. Once RANKFORGE is
  approved for Garmin's business-only Connect Developer Program, the Netlify
  functions behind these same-origin endpoints complete OAuth and receive
  Activity API push updates:

  - connectPath: starts OAuth 2.0 and returns to #sports
  - statusPath: GET -> { connected, accountLabel? }
  - syncPath: POST -> { activities: [...] }
  - disconnectPath: optional server-side revocation endpoint
*/
window.RANKFORGE_GARMIN_CONNECT = Object.freeze({
  connectPath: "/api/garmin/connect",
  statusPath: "/api/garmin/status",
  syncPath: "/api/garmin/sync",
  disconnectPath: "/api/garmin/disconnect",
  webhookPath: "/api/garmin/webhook",
  syncMode: "push",
  autoSyncIntervalSeconds: 300
});
