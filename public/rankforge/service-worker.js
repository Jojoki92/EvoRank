const CACHE = "evorank-x5.7-r1";
const CORE = [
  "./assets/evorank-x5.1-ui.css?build=x5.7-r1",
  "./assets/progress-x5.1.js?build=x5.7-r1",
  "./assets/rank-art-x5.1.js?build=x5.7-r1",
  "./assets/evorank-x5.1.js?build=x5.7-r1",
  "./assets/sports-profile-x5.3.js?build=x5.7-r1",
  "./assets/interface-x5.5.js?build=x5.7-r1",
  "./assets/ranks-x5.7/strength-0.png",
  "./assets/ranks-x5.7/strength-1.png",
  "./assets/ranks-x5.7/strength-2.png",
  "./assets/ranks-x5.7/strength-3.png",
  "./assets/ranks-x5.7/strength-4.png",
  "./assets/ranks-x5.7/strength-5.png",
  "./assets/ranks-x5.7/strength-6.png",
  "./assets/ranks-x5.7/strength-7.png",
  "./assets/ranks-x5.7/strength-8.png",
  "./assets/ranks-x5.7/run-0.png",
  "./assets/ranks-x5.7/run-1.png",
  "./assets/ranks-x5.7/run-2.png",
  "./assets/ranks-x5.7/run-3.png",
  "./assets/ranks-x5.7/run-4.png",
  "./assets/ranks-x5.7/run-5.png",
  "./assets/ranks-x5.7/run-6.png",
  "./assets/ranks-x5.7/run-7.png",
  "./assets/ranks-x5.7/run-8.png",
  "./assets/ranks-x5.7/bike-0.png",
  "./assets/ranks-x5.7/bike-1.png",
  "./assets/ranks-x5.7/bike-2.png",
  "./assets/ranks-x5.7/bike-3.png",
  "./assets/ranks-x5.7/bike-4.png",
  "./assets/ranks-x5.7/bike-5.png",
  "./assets/ranks-x5.7/bike-6.png",
  "./assets/ranks-x5.7/bike-7.png",
  "./assets/ranks-x5.7/bike-8.png",
  "./assets/ranks-x5.7/swim-0.png",
  "./assets/ranks-x5.7/swim-1.png",
  "./assets/ranks-x5.7/swim-2.png",
  "./assets/ranks-x5.7/swim-3.png",
  "./assets/ranks-x5.7/swim-4.png",
  "./assets/ranks-x5.7/swim-5.png",
  "./assets/ranks-x5.7/swim-6.png",
  "./assets/ranks-x5.7/swim-7.png",
  "./assets/ranks-x5.7/swim-8.png",
  "./assets/ranks-x5.1/design.json",
  "./licenses/LIZENZANALYSE-X5.1.md",
  "./licenses/DEPENDENCY-NOTICES.txt",
  "./assets/evorank-x5.0-ui.css?build=x5.7-r1",
  "./assets/legal-theme-x5.0.js?build=x5.7-r1",
  "./assets/cloud-consent-x4.9.js?build=x5.7-r1",
  "./assets/apple-interface-x4.9.js?build=x5.7-r1",
  "./assets/legal-links-x4.9.js?build=x5.7-r1",
  "./assets/evorank-x4.9-ui.css?build=x5.7-r1",
  "./assets/legal-x4.9.css?build=x5.7-r1",
  "./cookies.html",
  "./refunds.html",
  "./impressum.html",
  "./accessibility.html",

  "./assets/endurance-ranking-x4.8.js?build=x5.7-r1",
  "./assets/evorank-x4.8.js?build=x5.7-r1",
  "./assets/evorank-x4.8-ui.css?build=x5.7-r1",
  "./assets/age-ranking-x4.7.js?build=x5.7-r1",
  "./assets/evorank-x4.7.js?build=x5.7-r1",
  "./assets/evorank-x4.7-ui.css?build=x5.7-r1",
  "./assets/evorank-x4.6-ui.css?build=x5.7-r1",
  "./assets/evorank-x4.5-ui.css?build=x5.7-r1",
  "./assets/evorank-x4.5.js?build=x5.7-r1",
  "./assets/strava-x4.5.js?build=x5.7-r1",
  "./assets/evorank-alarm-x4.5.wav",
  "./hilfe-x4.5.html",
  "./assets/evorank-x4.4-ui.css?build=x5.7-r1",
  "./assets/exercise-families-x4.3.js?build=x5.7-r1",
  "./assets/evorank-x4.3-ui.css?build=x5.7-r1",
  "./assets/strength-standards-x4.2.js?build=x5.7-r1",
  "./assets/endurance-tracker-x4.2.js?build=x5.7-r1",
  "./assets/evorank-x4.2-ui.css?build=x5.7-r1",
  "./assets/brand-x4.1/evorank-er-flat.png",
  "./assets/evorank-x4.1-ui.css?build=x5.7-r1",
  "./assets/evorank-x4-brand.css?build=x5.7-r1",
  "./designs-x3.html",
  "./assets/designs-x3/design-a-graphit.png",
  "./assets/designs-x3/design-b-magenta.png",
  "./assets/designs-x3/design-c-titan.png",
  "./assets/designs-x3.css",
  "./icons/evorank-x4-32.png",
  "./assets/evorank-x3-ui.css?build=x5.7-r1",
  "./assets/evorank-x2-ranks.js?build=x5.7-r1",
  "./assets/evorank-x2-ui.js?build=x5.7-r1",
  "./assets/evorank-x2-ui.css?build=x5.7-r1",
  "./icons/evorank-x4-maskable-512.png?build=x5.7-r1",
  "./",
  "./index.html",
  "./manifest.webmanifest?build=x5.7-r1",
  "./version.txt",
  "./cloud-config.js?build=x5.7-r1&mode=auto",
  "./garmin-connect-config.js?build=x5.7-r1",
  "./assets/account-sync-v2.js?build=x5.7-r1",
  "./assets/account-bridge-v1.js?build=x5.7-r1",
  "./assets/account-ui-v2.js?build=x5.7-r1",
  "./app-config-v9.1.1.js?build=x5.7-r1",
  "./assets/bootstrap-v9.1.1.js?build=x5.7-r1",
  "./assets/security-bootstrap-v9.1.1.js?build=x5.7-r1",
  "./assets/rankforge-v9.2.0.css?build=x5.7-r1",
  "./assets/rankforge-v9.2.0-patch.css?build=x5.7-r1",
  "./assets/triathlon-v9.7.css?build=x5.7-r1",
  "./assets/calendar-plan-v10.0.css?build=x5.7-r1",
  "./assets/home-control-v10.1-r1.css?build=x5.7-r1",
  "./assets/rank-dashboard-v10.2-r1.css?build=x5.7-r1",
  "./assets/rank-dashboard-v10.3-r1.css?build=x5.7-r1",
  "./assets/home-rank-frame-v10.4-r1.css?build=x5.7-r1",
  "./assets/bodygraph-selection-v10.6-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.8-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.9-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.10-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.11-r1.css?build=x5.7-r1",
  "./assets/workout-clarity-v10.11.1.css?build=x5.7-r1",
  "./assets/evorank-v10.11.2-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.11.3-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.11.4-r1.css?build=x5.7-r1",
  "./assets/evorank-v10.11.5-r1.css?build=x5.7-r1",
  "./assets/evorank-x1-r1.css?build=x5.7-r1",
  "./assets/bodygraph-v9.1.1.js?build=x5.7-r1",
  "./assets/rankforge-v9.2.0.js?build=x5.7-r1",
  "./assets/i18n-v9.2.0.js?build=x5.7-r1",
  "./assets/rankforge-v9.2.0-patch.js?build=x5.7-r1",
  "./assets/account-local-v10.7-r2.js?build=x5.7-r1",
  "./assets/rf93-unilateral-v1.js?build=x5.7-r1",
  "./assets/rf93-friends-v1.js?build=x5.7-r1",
  "./assets/triathlon-v9.7.js?build=x5.7-r1",
  "./assets/calendar-plan-v10.0.js?build=x5.7-r1",
  "./assets/home-control-v10.1-r1.js?build=x5.7-r1",
  "./assets/rank-dashboard-v10.2-r1.js?build=x5.7-r1",
  "./assets/rank-dashboard-v10.3-r1.js?build=x5.7-r1",
  "./assets/home-rank-frame-v10.4-r1.js?build=x5.7-r1",
  "./assets/evorank-brand-v10.7-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.8-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.9-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.10-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.11-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.11.2-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.11.3-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.11.4-r1.js?build=x5.7-r1",
  "./assets/evorank-v10.11.5-r1.js?build=x5.7-r1",
  "./assets/evorank-x1-r1.js?build=x5.7-r1",
  "./assets/rank-icons/evorank-seahorse-v10.8.png",
  "./assets/female-bodygraph-v9.1.1.png",
  "./assets/body/male-front-v9.1.2.webp",
  "./assets/body/male-back-v9.1.2.webp",
  "./assets/body/male-front-clean-v9.1.2.webp",
  "./assets/body/male-back-clean-v9.1.2.webp",
  "./assets/body/male-front-neutral-light-v9.2.0.webp",
  "./assets/body/male-front-neutral-dark-v9.2.0.webp",
  "./assets/body/male-front-neutral-light-v9.2.0-groin-clean.png",
  "./assets/body/male-front-neutral-dark-v9.2.0-groin-clean.png",
  "./assets/body/male-back-neutral-light-v9.2.0.webp",
  "./assets/body/male-back-neutral-dark-v9.2.0.webp",
  "./assets/body/masks-v9.2.0/male-front-shoulders-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-chest-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-biceps-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-triceps-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-forearms-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-core-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-adductors-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-quads-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-front-calves-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-shoulders-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-upperBack-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-lats-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-triceps-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-forearms-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-lowerBack-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-glutes-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-hamstrings-v9.2.0.png",
  "./assets/body/masks-v9.2.0/male-back-calves-v9.2.0.png",
  "./assets/ranks/wood.webp",
  "./assets/ranks/bronze.webp",
  "./assets/ranks/silver.webp",
  "./assets/ranks/gold.webp",
  "./assets/ranks/platinum.webp",
  "./assets/ranks/platinum-v9.2.0.png",
  "./assets/ranks/diamond.webp",
  "./assets/ranks/diamond-v9.2.0.png",
  "./assets/ranks/champion.webp",
  "./assets/ranks/champion-v9.2.0.png",
  "./assets/ranks/titan.webp",
  "./assets/ranks/titan-v9.2.0.png",
  "./assets/ranks/olympian.webp",
  "./privacy.html",
  "./privacy-choices.html",
  "./terms.html",
  "./support.html",
  "./icons/evorank-icon-180.png",
  "./icons/evorank-icon-192.png",
  "./icons/evorank-icon-512.png",
  "./icons/favicon-light-evorank.svg",
  "./icons/favicon-dark-evorank.svg",
  "./icons/evorank-icon-v10.7-180.png",
  "./icons/evorank-icon-v10.7-192.png",
  "./icons/evorank-icon-v10.7-512.png",
  "./icons/evorank-x4-180.png?build=x5.7-r1",
  "./icons/evorank-x4-192.png?build=x5.7-r1",
  "./icons/evorank-x4-512.png?build=x5.7-r1",
  "./icons/favicon-light-evorank-v10.7.svg",
  "./icons/favicon-dark-evorank-v10.7.svg",
  "./splash/evorank-x4-splash-440x956@3x.png",
  "./splash/evorank-x4-splash-430x932@3x.png",
  "./splash/evorank-x4-splash-402x874@3x.png",
  "./splash/evorank-x4-splash-393x852@3x.png",
  "./splash/evorank-x4-splash-390x844@3x.png",
  "./splash/evorank-x4-splash-428x926@3x.png",
  "./splash/evorank-x4-splash-414x896@3x.png",
  "./splash/evorank-x4-splash-375x812@3x.png",
  "./splash/evorank-x4-splash-414x896@2x.png",
  "./splash/evorank-x4-splash-375x667@2x.png",
  "./splash/evorank-x4-splash-320x568@2x.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE && /^(evorank|rankforge)-/.test(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const relative = url.pathname.slice(scope.pathname.length);
  // Account, GPS/provider and function responses never belong in the app cache.
  // Only the public files in this app's scope are handled here.
  const allowed = CORE.some(file => new URL(file, scope).pathname === url.pathname) ||
    /^(assets|icons|splash)\//.test(relative);
  if (!allowed && relative !== "") return;

  if (event.request.mode === "navigate") {
    const cacheKey = relative === "" || relative === "index.html" ? new URL("./index.html",scope).href : url.origin+url.pathname;
    const network = fetch(event.request).then(async response => {
      if(response?.ok){const cache=await caches.open(CACHE);await cache.put(cacheKey,response.clone());}
      return response;
    }).catch(() => null);
    event.waitUntil(network.then(() => {}));
    event.respondWith((async () => {
      const cached=await caches.match(cacheKey);
      if(!cached)return await network || Response.error();
      // Use the saved app after 1.5 seconds on a stalled mobile connection.
      // A completed refresh is cached for the next visit, never auto-reloaded.
      let timer;
      const timeout=new Promise(resolve=>{timer=setTimeout(()=>resolve(null),1500);});
      const response=await Promise.race([network,timeout]);clearTimeout(timer);
      return response?.ok?response:cached;
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
        caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      }
      return response;
    }))
  );
});
