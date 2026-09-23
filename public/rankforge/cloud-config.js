/* RANKFORGE Live-Freunde Konfiguration.
   Diese beiden Werte einmalig aus Supabase eintragen. Der Publishable Key darf
   im Browser stehen; die Datenbank wird durch die SQL-Funktionen und RLS geschützt. */
window.RANKFORGE_CLOUD = Object.freeze({
  supabaseUrl: location.hostname === "terminal.local" ? "" : "https://wbujkhjoxepglsmtwqrf.supabase.co",
  supabasePublishableKey: location.hostname === "terminal.local" ? "" : "sb_publishable_Wx7mimtdaRGvY8WWntcDzg_NIwtOb4D",
  // Bestätigungs- und Passwort-E-Mails kehren zur Domain zurück, auf der
  // EvoRank geöffnet wurde. Dadurch funktioniert dieselbe Datei sowohl mit
  // der festen Netlify-Adresse als auch mit der ChatGPT-Sites-Adresse.
  authRedirectUrl: location.hostname === "terminal.local"
    ? `${location.origin}/rankforge/index.html?auth=recovery&build=1100-r1`
    : new URL(`./index.html?auth=recovery&build=1100-r1`, location.href).href,
  syncIntervalSeconds: 60
});
