/* EVORANK 10.9 r1 — category leaderboards and compact mobility library */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__evorank109Installed) return;

  const VERSION = "10.9";
  const BUILD = "1090-r3";
  const SCHEMA = 35;
  const SPORTS = Object.freeze(["strength", "swim", "run", "bike"]);
  const SPORT_COPY = Object.freeze({
    strength:{ name:"Gym", color:"#ff3b5f", unit:"LP" },
    swim:{ name:"Schwimmen", color:"#2f7dff", unit:"Punkte" },
    run:{ name:"Laufen", color:"#42c86b", unit:"Punkte" },
    bike:{ name:"Radfahren", color:"#f2bd35", unit:"Punkte" }
  });
  const LOAD_TTL_MS = 60_000;
  const PUBLISH_DEBOUNCE_MS = 12_000;

  const esc = value => typeof escapeHtml === "function"
    ? escapeHtml(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
  const attr = value => typeof escapeAttr === "function" ? escapeAttr(String(value ?? "")) : esc(value);
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, finite(value)));
  const integer = (value, maximum = 999_999) => Math.round(clamp(value, 0, maximum));
  const sportName = sport => SPORT_COPY[sport]?.name || sport;
  const sportColor = sport => SPORT_COPY[sport]?.color || "#2f7dff";

  function safeAvatar(value) {
    const avatar = String(value || "").slice(0, 4000);
    if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(avatar)) return avatar;
    if (/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(avatar)) return avatar;
    return "";
  }

  function initials(entry) {
    const value = String(entry?.displayName || entry?.nickname || "EV").trim();
    return value.split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase().slice(0, 2) || "EV";
  }

  function formatNumber(value, decimals = 0) {
    return finite(value).toLocaleString("de-DE", { maximumFractionDigits:decimals });
  }

  function clock(seconds) {
    const total = integer(seconds, 7 * 24 * 3600);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const rest = total % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}` : `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function performanceText(item, sport) {
    if (!item || finite(item.distanceMeters) <= 0 || finite(item.durationSeconds) <= 0) return "Noch kein Bestwert";
    if (sport === "swim") return `${clock(item.durationSeconds / item.distanceMeters * 100)} / 100 m`;
    const kilometers = item.distanceMeters / 1000;
    if (sport === "run") return `${clock(item.durationSeconds / kilometers)} / km`;
    return `${(kilometers / (item.durationSeconds / 3600)).toFixed(1)} km/h`;
  }

  // ---------------------------------------------------------------- Mobility library

  const STRETCH_BASES = Object.freeze([
    ["Seitliche Nackendehnung", "Schultern", "Körpergewicht", ["Oberer Rücken"]],
    ["Kontrollierte Nackenrotation", "Schultern", "Körpergewicht", ["Oberer Rücken"]],
    ["Levator-scapulae-Dehnung", "Oberer Rücken", "Körpergewicht", ["Schultern"]],
    ["Brustdehnung im Türrahmen", "Brust", "Türrahmen", ["Schultern"]],
    ["Brustdehnung an der Wand", "Brust", "Wand", ["Bizeps", "Schultern"]],
    ["Überkopf-Trizepsdehnung", "Trizeps", "Körpergewicht", ["Schultern"]],
    ["Crossbody-Schulterdehnung", "Schultern", "Körpergewicht", ["Oberer Rücken"]],
    ["Lat-Dehnung an der Bank", "Lat", "Bank", ["Schultern"]],
    ["Child's Pose mit Seitgriff", "Lat", "Matte", ["Unterer Rücken"]],
    ["Thread the Needle", "Oberer Rücken", "Matte", ["Schultern", "Core"]],
    ["Cat-Cow-Mobilisation", "Unterer Rücken", "Matte", ["Core", "Oberer Rücken"]],
    ["Brustwirbelsäulenrotation im Vierfüßler", "Oberer Rücken", "Matte", ["Core"]],
    ["Wall Angels", "Oberer Rücken", "Wand", ["Schultern"]],
    ["Sleeper Stretch", "Schultern", "Matte", ["Oberer Rücken"]],
    ["Prayer Stretch für Handgelenke", "Unterarme", "Körpergewicht", ["Bizeps"]],
    ["Reverse Prayer Stretch", "Unterarme", "Körpergewicht", ["Trizeps"]],
    ["Unterarmbeuger-Dehnung an der Wand", "Unterarme", "Wand", ["Bizeps"]],
    ["Unterarmstrecker-Dehnung an der Wand", "Unterarme", "Wand", ["Trizeps"]],
    ["Sphinx Stretch", "Core", "Matte", ["Unterer Rücken"]],
    ["Sanfte Cobra", "Core", "Matte", ["Unterer Rücken"]],
    ["Liegender Wirbelsäulen-Twist", "Unterer Rücken", "Matte", ["Gesäß", "Core"]],
    ["90/90 Hip Switch", "Gesäß", "Matte", ["Adduktoren"]],
    ["Tauben-Dehnung", "Gesäß", "Matte", ["Beinbeuger"]],
    ["Figure-Four-Dehnung liegend", "Gesäß", "Matte", ["Beinbeuger"]],
    ["Hüftbeuger-Dehnung halbkniend", "Quadrizeps", "Matte", ["Gesäß"]],
    ["Couch Stretch", "Quadrizeps", "Wand", ["Gesäß"]],
    ["Quadrizeps-Dehnung stehend", "Quadrizeps", "Körpergewicht", ["Gesäß"]],
    ["Beinbeuger-Dehnung mit Gurt", "Beinbeuger", "Gurt / Handtuch", ["Waden"]],
    ["Einbeinige Beinbeuger-Dehnung sitzend", "Beinbeuger", "Matte", ["Waden"]],
    ["Beinbeuger-Hinge im Stand", "Beinbeuger", "Körpergewicht", ["Gesäß"]],
    ["Adduktoren-Rockback", "Adduktoren", "Matte", ["Gesäß"]],
    ["Schmetterlings-Dehnung", "Adduktoren", "Matte", ["Gesäß"]],
    ["Frog Stretch", "Adduktoren", "Matte", ["Gesäß"]],
    ["Seitlicher Ausfallschritt zur Mobilität", "Adduktoren", "Körpergewicht", ["Quadrizeps", "Gesäß"]],
    ["Waden-Dehnung mit gestrecktem Knie", "Waden", "Wand", ["Beinbeuger"]],
    ["Soleus-Dehnung mit gebeugtem Knie", "Waden", "Wand", ["Quadrizeps"]],
    ["Downward Dog mit Wadenwechsel", "Waden", "Matte", ["Beinbeuger", "Schultern"]],
    ["Sprunggelenk-Mobilität an der Wand", "Waden", "Wand", ["Quadrizeps"]],
    ["Tiefe Kniebeuge halten", "Quadrizeps", "Körpergewicht", ["Adduktoren", "Gesäß"]],
    ["World's Greatest Stretch", "Gesäß", "Matte", ["Quadrizeps", "Oberer Rücken"]],
    ["Ausfallschritt mit Oberkörperrotation", "Quadrizeps", "Matte", ["Core", "Gesäß"]],
    ["Beinschwung vor und zurück", "Beinbeuger", "Körpergewicht", ["Quadrizeps", "Gesäß"]],
    ["Seitlicher Beinschwung", "Adduktoren", "Körpergewicht", ["Gesäß"]],
    ["Kontrollierte Armkreise", "Schultern", "Körpergewicht", ["Brust", "Oberer Rücken"]],
    ["Schulter-Pass-through mit Band", "Schultern", "Widerstandsband", ["Brust", "Oberer Rücken"]],
    ["Lat-Dehnung mit Band", "Lat", "Widerstandsband", ["Schultern"]],
    ["Bizeps-Dehnung im Türrahmen", "Bizeps", "Türrahmen", ["Brust", "Unterarme"]],
    ["Brustöffner mit Händen hinter dem Rücken", "Brust", "Körpergewicht", ["Schultern", "Bizeps"]],
    ["Seitbeuge im Sitz", "Lat", "Matte", ["Core", "Unterer Rücken"]],
    ["Handgelenk-Rocks im Vierfüßler", "Unterarme", "Matte", ["Schultern"]]
  ]);

  const STRETCH_PROTOCOLS = Object.freeze([
    { label:"Basis", seconds:30, cue:"Ruhig in eine angenehme Endposition gehen und gleichmäßig weiteratmen." },
    { label:"kurz & sanft", seconds:20, cue:"Mit kleinem Bewegungsradius beginnen und niemals in den Schmerz drücken." },
    { label:"kontrollierter Bewegungsradius", seconds:35, cue:"Den verfügbaren Bewegungsradius langsam und ohne Schwung erkunden." },
    { label:"dynamisch", seconds:30, cue:"Langsam zwischen Ausgangs- und Endposition wechseln; nicht federn." },
    { label:"aktiv", seconds:30, cue:"Die Gegenmuskulatur leicht anspannen und die Position aktiv kontrollieren." },
    { label:"mit Atemfokus", seconds:60, cue:"Bei jeder Ausatmung Spannung reduzieren, ohne die Position zu erzwingen." },
    { label:"Morgenroutine", seconds:30, cue:"Besonders sanft starten und erst nach einigen Atemzügen etwas weitergehen." },
    { label:"Warm-up", seconds:20, cue:"Fließend bewegen und die Position nur kurz halten." },
    { label:"Cool-down", seconds:45, cue:"Nach dem Training ruhig halten und bewusst locker lassen." },
    { label:"60 Sekunden", seconds:60, cue:"Die Intensität so wählen, dass eine volle Minute ruhig möglich bleibt." }
  ]);

  function createStretchLibrary() {
    const collection = typeof EXERCISES !== "undefined" && Array.isArray(EXERCISES) ? EXERCISES : [];
    const index = typeof exerciseIndex !== "undefined" && exerciseIndex?.set ? exerciseIndex : null;
    const existingIds = new Set(collection.map(item => String(item.id)));
    const created = [];
    STRETCH_BASES.forEach((base, baseIndex) => {
      STRETCH_PROTOCOLS.forEach((protocol, protocolIndex) => {
        const id = `EV109-STRETCH-${String(baseIndex + 1).padStart(3, "0")}-${String(protocolIndex + 1).padStart(2, "0")}`;
        const exercise = {
          id,
          name:`${base[0]} · ${protocol.label}`,
          muscle:base[1],
          secondaryMuscles:base[3],
          color:sportColor("run"),
          equipment:base[2],
          rankable:false,
          bodyweightMode:"none",
          bodyweightExponent:0,
          reference1RMKg:0,
          defaultRestSeconds:15,
          defaultSets:[{ weightKg:0, reps:0, durationSeconds:protocol.seconds, type:"normal" }],
          tracking:"time",
          aliases:["dehnen", "dehnung", "stretching", "mobilität", "mobility", base[0], protocol.label, ...(protocolIndex === 0 ? ["geprüfte basis"] : [])],
          source:"EVORANK 10.9 mobility library",
          instructions:`Nimm die Position kontrolliert ein. ${protocol.cue}`,
          tips:["Bleibe im schmerzfreien Bereich und atme ruhig weiter.", "Bei stechendem Schmerz, Taubheit oder Schwindel sofort stoppen."],
          searchText:`${base[0]} ${protocol.label} ${base[1]} ${base[2]} dehnen dehnung stretching mobilität mobility ${protocolIndex === 0 ? "geprüfte basis" : ""}`.toLocaleLowerCase("de"),
          isCustom:false,
          mobility:true,
          curation:protocolIndex === 0 ? "reviewed-base" : "generated-variant",
          safetyLevel:"general-wellness",
          safetyNotice:"Nur im schmerzfreien Bereich ausführen. Bei Verletzung, Taubheit, Schwindel oder anhaltenden Beschwerden medizinischen Rat einholen."
        };
        created.push(exercise);
        if (!existingIds.has(id)) {
          collection.push(exercise);
          index?.set(id, exercise);
          existingIds.add(id);
        }
      });
    });
    return created;
  }

  const STRETCH_LIBRARY = Object.freeze(createStretchLibrary());

  // ---------------------------------------------------------------- Secure Supabase RPC

  function cloudConfig() {
    const raw = window.RANKFORGE_CLOUD || {};
    const url = String(raw.supabaseUrl || "").replace(/\/+$/, "");
    const key = String(raw.supabasePublishableKey || "");
    return { url, key, ready:Boolean(url && key) };
  }

  async function leaderboardRpc(name, args = {}) {
    const config = cloudConfig();
    if (!config.ready) throw Object.assign(new Error("Cloud ist nicht konfiguriert"), { code:"cloud_not_configured" });
    const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
    if (!token) throw Object.assign(new Error("Bitte zuerst anmelden"), { code:"not_authenticated" });
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method:"POST",
      headers:{ apikey:config.key, authorization:`Bearer ${token}`, "content-type":"application/json" },
      body:JSON.stringify(args)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const missing = response.status === 404 || String(body?.message || "").includes("schema cache");
      const error = new Error(missing ? "Bestenliste muss einmalig in Supabase aktiviert werden" : body?.message || body?.error_description || `Cloud-Fehler ${response.status}`);
      error.code = missing ? "leaderboard_setup_required" : body?.code || `http_${response.status}`;
      throw error;
    }
    return body;
  }

  function leaderboardStore(app) {
    app.ui ||= {};
    app.ui.rf109Leaderboards ||= Object.fromEntries(SPORTS.map(sport => [sport, { status:"idle", rows:[], error:"", loadedAt:0 }]));
    return app.ui.rf109Leaderboards;
  }

  function categorySnapshot(app, sport) {
    const rankData = window.RANKFORGE103?.rankData?.(app, sport) || {};
    if (sport === "strength") {
      const metrics = app.metrics || {};
      const workouts = Array.isArray(metrics.workouts) ? metrics.workouts : Array.isArray(app.state?.workouts) ? app.state.workouts : [];
      const weekly = Array.isArray(metrics.weeklyWorkouts) ? metrics.weeklyWorkouts : [];
      const top = Array.isArray(metrics.exerciseRanks) ? metrics.exerciseRanks[0] : null;
      const volumeKg = workouts.reduce((sum, workout) => sum + finite(workout?.volumeKg), 0);
      return {
        sport,
        score:integer(rankData.score, 9999),
        rankLabel:String(rankData.label || "Wood").slice(0, 80),
        stats:{ workouts:workouts.length, weeklyWorkouts:weekly.length, volumeKg:Math.round(volumeKg), topExercise:String(top?.name || "").slice(0, 80), sessions:workouts.length, source:"manual" }
      };
    }
    const metrics = window.RANKFORGE970?.sportMetrics?.(sport, app) || {};
    const list = Array.isArray(metrics.list) ? metrics.list : [];
    const recent = Array.isArray(metrics.recent) ? metrics.recent : [];
    const allDistance = list.reduce((sum, item) => sum + finite(item?.distanceMeters), 0);
    return {
      sport,
      score:integer(rankData.score ?? metrics.score, 9999),
      rankLabel:String(rankData.label || metrics.current?.[1] || sportName(sport)).slice(0, 80),
      stats:{
        sessions:list.length,
        recentSessions:recent.length,
        distanceMeters:Math.round(allDistance),
        bestPerformance:performanceText(metrics.best, sport).slice(0, 80),
        garminConnected:list.some(item => String(item?.source || "").toLocaleLowerCase("de").includes("garmin")),
        source:list.some(item => String(item?.source || "").toLocaleLowerCase("de").includes("garmin")) ? "garmin" : "manual"
      }
    };
  }

  async function publishLeaderboards(app) {
    const status = window.RANKFORGE_ACCOUNT?.status?.() || {};
    if (!app || !status.signedIn || !status.hasProfile || navigator.onLine === false || app.state?.privacyV110?.leaderboardConsent !== true) return false;
    for (const sport of SPORTS) {
      const entry = categorySnapshot(app, sport);
      try {
        await leaderboardRpc("evorank_leaderboard_publish", {
          p_sport:sport,
          p_score:entry.score,
          p_rank_label:entry.rankLabel,
          p_stats:entry.stats
        });
      } catch (error) {
        if (error.code === "leaderboard_setup_required") break;
        console.warn("[EVORANK] Bestenlisten-Profil konnte nicht aktualisiert werden:", error?.message || error);
      }
    }
    return true;
  }

  async function loadLeaderboard(app, sport, options = {}) {
    if (!SPORTS.includes(sport)) return [];
    const store = leaderboardStore(app);
    const state = store[sport];
    if (state.status === "loading") return state.rows;
    if (!options.force && state.loadedAt && Date.now() - state.loadedAt < LOAD_TTL_MS) return state.rows;
    const account = window.RANKFORGE_ACCOUNT?.status?.() || {};
    if (!account.signedIn) {
      Object.assign(state, { status:"signed-out", rows:[], error:"", loadedAt:Date.now() });
      app.render?.();
      return [];
    }
    if (!account.hasProfile) {
      Object.assign(state, { status:"profile-required", rows:[], error:"", loadedAt:Date.now() });
      app.render?.();
      return [];
    }
    state.status = "loading";
    state.error = "";
    if (options.render !== false) app.render?.();
    try {
      const result = await leaderboardRpc("evorank_leaderboard_top", { p_sport:sport, p_limit:10 });
      const blocked = new Set((app.state?.privacyV110?.blockedLeaderboardIds || []).map(String));
      const rows = Array.isArray(result) ? result.filter(entry => !blocked.has(String(entry?.id || ""))).slice(0, 10) : [];
      Object.assign(state, { status:"ready", rows, error:"", loadedAt:Date.now() });
    } catch (error) {
      Object.assign(state, { status:error.code === "leaderboard_setup_required" ? "setup-required" : "error", rows:[], error:error.message || "Bestenliste konnte nicht geladen werden", loadedAt:Date.now() });
    }
    app.render?.();
    return state.rows;
  }

  function scheduleLeaderboardLoad(app, sport) {
    const state = leaderboardStore(app)[sport];
    if (state.status === "loading" || (state.loadedAt && Date.now() - state.loadedAt < LOAD_TTL_MS)) return;
    window.setTimeout(() => loadLeaderboard(app, sport, { render:true }).catch(() => {}), 0);
  }

  function distanceLabel(meters, sport) {
    if (sport === "swim") return `${integer(meters).toLocaleString("de-DE")} m`;
    return `${(finite(meters) / 1000).toLocaleString("de-DE", { maximumFractionDigits:1 })} km`;
  }

  function avatarMarkup(entry, large = false) {
    const avatar = safeAvatar(entry?.avatar);
    return `<span class="rf109-avatar ${large ? "is-large" : ""}" style="--sport:${sportColor(entry?.sport)}">${avatar ? `<img src="${attr(avatar)}" alt="">` : esc(initials(entry))}</span>`;
  }

  function leaderboardRows(app, sport, rows) {
    return rows.map((entry, index) => {
      const name = String(entry?.displayName || entry?.nickname || "Athlet").slice(0, 60);
      const score = integer(entry?.score, 9999);
      return `<button class="rf109-leader-row place-${index + 1}" data-action="rf109-leader-profile" data-sport="${sport}" data-entry-id="${attr(entry?.id || "")}" style="--sport:${sportColor(sport)}">
        <b class="rf109-place">${index + 1}</b>${avatarMarkup({ ...entry, sport })}<span class="rf109-leader-copy"><strong>${esc(name)}${entry?.isMe ? " <em>DU</em>" : ""}</strong><small>@${esc(entry?.nickname || "athlet")} · ${esc(entry?.rankLabel || sportName(sport))}</small></span><span class="rf109-leader-score"><b>${score.toLocaleString("de-DE")}</b><small>${esc(SPORT_COPY[sport].unit)}</small></span><i aria-hidden="true">›</i>
      </button>`;
    }).join("");
  }

  function leaderboardSection(app, sport) {
    const state = leaderboardStore(app)[sport];
    const account = window.RANKFORGE_ACCOUNT?.status?.() || {};
    let body = "";
    if (state.status === "loading" || state.status === "idle") {
      body = `<div class="rf109-leader-loading"><i></i><span>Top 10 werden geladen …</span></div>`;
    } else if (!account.signedIn || state.status === "signed-out") {
      body = `<div class="rf109-leader-empty"><strong>Für die Bestenliste anmelden</strong><p>Nur Profile mit Spitznamen erscheinen öffentlich. Deine E-Mail bleibt privat.</p><button data-action="rf109-open-account">Konto öffnen</button></div>`;
    } else if (!account.hasProfile || state.status === "profile-required") {
      body = `<div class="rf109-leader-empty"><strong>Spitzname fehlt</strong><p>Lege einmal dein öffentliches Profil an. E-Mail und private Workouts werden nie angezeigt.</p><button data-action="rf109-open-account">Profil anlegen</button></div>`;
    } else if (state.status === "setup-required") {
      body = `<div class="rf109-leader-empty"><strong>Bestenliste noch nicht eingerichtet</strong><p>Die Community-Bestenlisten warten auf die Freischaltung durch den Betreiber. Persönliche Ränge bleiben verfügbar.</p><button data-action="rf109-leader-reload" data-sport="${sport}">Erneut prüfen</button></div>`;
    } else if (state.status === "error") {
      body = `<div class="rf109-leader-empty"><strong>Gerade nicht erreichbar</strong><p>${esc(state.error)}</p><button data-action="rf109-leader-reload" data-sport="${sport}">Erneut versuchen</button></div>`;
    } else if (!state.rows.length) {
      body = `<div class="rf109-leader-empty"><strong>Noch kein freigegebener Eintrag</strong><p>Jeder entscheidet selbst, ob sein Profil an der Community-Bestenliste teilnimmt.</p><button data-action="rf110-open-production">Teilnahme verwalten</button></div>`;
    } else {
      body = `<div class="rf109-leader-list">${leaderboardRows(app, sport, state.rows)}</div>`;
    }
    return `<section class="rf109-leaderboard" style="--sport:${sportColor(sport)}" aria-label="Top 10 ${attr(sportName(sport))}"><header><div><small>${esc(sportName(sport).toUpperCase())} · COMMUNITY</small><h2>Bestenliste</h2><p>Die 10 höchsten öffentlichen ${esc(sportName(sport))}-Werte</p></div><button data-action="rf109-leader-reload" data-sport="${sport}" aria-label="Bestenliste aktualisieren">↻</button></header>${body}<footer>Antippen zeigt nur das öffentliche ${esc(sportName(sport))}-Profil – keine E-Mail und keine privaten Trainingsdetails.</footer></section>`;
  }

  function statCards(entry, sport) {
    const stats = entry?.stats && typeof entry.stats === "object" ? entry.stats : {};
    if (sport === "strength") {
      return [
        ["WORKOUTS", integer(stats.workouts).toLocaleString("de-DE")],
        ["DIESE WOCHE", integer(stats.weeklyWorkouts).toLocaleString("de-DE")],
        ["VOLUMEN", `${formatNumber(stats.volumeKg)} kg`],
        ["TOP-ÜBUNG", String(stats.topExercise || "—").slice(0, 80)]
      ];
    }
    return [
      ["EINHEITEN", integer(stats.sessions).toLocaleString("de-DE")],
      ["LETZTE 28 TAGE", integer(stats.recentSessions).toLocaleString("de-DE")],
      ["DISTANZ", distanceLabel(stats.distanceMeters, sport)],
      ["BESTWERT", String(stats.bestPerformance || "—").slice(0, 80)]
    ];
  }

  function profileModal(app) {
    const modal = app.ui?.modal || {};
    const sport = SPORTS.includes(modal.sport) ? modal.sport : "strength";
    const rows = leaderboardStore(app)[sport].rows;
    const entry = rows.find(item => String(item.id) === String(modal.entryId));
    if (!entry) return `${app.modalHeader("BESTENLISTE", "Profil nicht gefunden")}<div class="modal-scroll rf109-profile"><p>Aktualisiere die Bestenliste und versuche es erneut.</p></div>`;
    const name = String(entry.displayName || entry.nickname || "Athlet").slice(0, 60);
    const cards = statCards(entry, sport).map(([label, value]) => `<article><small>${esc(label)}</small><strong>${esc(value)}</strong></article>`).join("");
    const garmin = Boolean(entry?.stats?.garminConnected);
    return `${app.modalHeader(`${sportName(sport).toUpperCase()} · ÖFFENTLICHES PROFIL`, name)}<div class="modal-scroll rf109-profile" style="--sport:${sportColor(sport)}"><section class="rf109-profile-head">${avatarMarkup({ ...entry, sport }, true)}<div><small>@${esc(entry.nickname || "athlet")}${entry.isMe ? " · DEIN PROFIL" : ""}</small><h2>${esc(entry.rankLabel || sportName(sport))}</h2><p><b>${integer(entry.score, 9999).toLocaleString("de-DE")}</b> ${esc(SPORT_COPY[sport].unit)}</p></div></section>${garmin ? `<div class="rf109-garmin-badge">✓ Garmin-Daten verbunden</div>` : ""}<section class="rf109-profile-stats">${cards}</section><p class="rf109-profile-privacy">Dieses Profil zeigt ausschließlich die Werte für ${esc(sportName(sport))}. E-Mail, einzelne Trainings und andere Sportarten bleiben privat.</p></div>`;
  }

  function injectBeforeScreenEnd(html, addition) {
    return typeof html === "string" && /<\/section>\s*$/u.test(html) ? html.replace(/<\/section>\s*$/u, `${addition}</section>`) : `${html}${addition}`;
  }

  // ---------------------------------------------------------------- Prototype integration

  const proto = AppClass.prototype;
  proto.__evorank109Installed = true;
  const previous = {
    renderRanks:proto.renderRanks,
    renderModal:proto.renderModal,
    renderExercisePickerModal:proto.renderExercisePickerModal,
    handleClick:proto.handleClick,
    scheduleSave:proto.scheduleSave,
    init:proto.init
  };

  proto.renderRanks = function(...args) {
    this.state.schemaVersion = Math.max(SCHEMA, Number(this.state.schemaVersion || 0));
    this.state.appVersion = VERSION;
    const rankOrder = window.EVORANK108?.ensureRankState?.(this)?.rankOrder || ["strength"];
    const sport = rankOrder.includes(this.ui.rf103RankSport) ? this.ui.rf103RankSport : rankOrder[0] || "strength";
    scheduleLeaderboardLoad(this, sport);
    return injectBeforeScreenEnd(previous.renderRanks.apply(this, args), leaderboardSection(this, sport));
  };

  proto.renderModal = function(...args) {
    if (this.ui?.modal?.type === "rf109-leader-profile") {
      return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet rf109-profile-modal" role="dialog" aria-modal="true">${profileModal(this)}</section></div>`;
    }
    return previous.renderModal.apply(this, args);
  };

  proto.renderExercisePickerModal = function(...args) {
    const html = previous.renderExercisePickerModal.apply(this, args);
    const marker = /(<div class="rf81-library-count">[\s\S]*?<\/div>)/u;
    const quick = `<button type="button" class="rf109-stretch-filter ${String(this.ui.exerciseSearch || "").toLocaleLowerCase("de").includes("mobilität") ? "is-active" : ""}" data-action="rf109-stretch-filter"><span>↗</span><div><strong>500× Dehnen & Mobilität</strong><small>Warm-up, Cool-down und Atemfokus</small></div><b>${STRETCH_LIBRARY.length}</b></button>`;
    return marker.test(html) ? html.replace(marker, `$1${quick}`) : `${quick}${html}`;
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (action === "rf109-leader-profile") {
      event.preventDefault();
      this.openModal("rf109-leader-profile", { sport:element.dataset.sport, entryId:element.dataset.entryId });
      return;
    }
    if (action === "rf109-leader-reload") {
      event.preventDefault();
      const sport = SPORTS.includes(element.dataset.sport) ? element.dataset.sport : "strength";
      await publishLeaderboards(this);
      await loadLeaderboard(this, sport, { force:true, render:true });
      return;
    }
    if (action === "rf109-open-account") {
      event.preventDefault();
      window.RANKFORGE_ACCOUNT_UI?.open?.();
      return;
    }
    if (action === "rf109-stretch-filter") {
      event.preventDefault();
      this.ui.exerciseSearch = "mobilität";
      this.ui.exerciseMuscle = "Alle";
      this.ui.exerciseEquipment = "Alle";
      this.ui.exerciseLimit = typeof EXERCISE_PICKER_PAGE_SIZE !== "undefined" ? EXERCISE_PICKER_PAGE_SIZE : 60;
      this.render();
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.scheduleSave = function(...args) {
    const result = typeof previous.scheduleSave === "function" ? previous.scheduleSave.apply(this, args) : undefined;
    window.clearTimeout(this.ui?.rf109PublishTimer);
    if (this.ui) this.ui.rf109PublishTimer = window.setTimeout(() => publishLeaderboards(this), PUBLISH_DEBOUNCE_MS);
    return result;
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    this.state.schemaVersion = Math.max(SCHEMA, Number(this.state.schemaVersion || 0));
    this.state.appVersion = VERSION;
    leaderboardStore(this);
    window.setTimeout(() => publishLeaderboards(this).then(() => {
      if (this.ui?.view === "ranks") {
        const sport = SPORTS.includes(this.ui.rf103RankSport) ? this.ui.rf103RankSport : "strength";
        loadLeaderboard(this, sport, { force:true, render:true }).catch(() => {});
      }
    }), 1_500);
    window.RANKFORGE_ACCOUNT?.onChange?.(status => {
      if (status.signedIn && status.hasProfile) window.setTimeout(() => publishLeaderboards(this), 500);
    });
    this.scheduleSave?.();
    return result;
  };

  window.EVORANK109 = Object.freeze({
    version:VERSION,
    build:BUILD,
    schema:SCHEMA,
    sports:SPORTS,
    stretchCount:STRETCH_LIBRARY.length,
    stretches:STRETCH_LIBRARY,
    categorySnapshot:(app = window.RANKFORGE_APP, sport = "strength") => categorySnapshot(app, sport),
    loadLeaderboard:(sport, app = window.RANKFORGE_APP) => loadLeaderboard(app, sport, { force:true }),
    renderLeaderboard:(sport, app = window.RANKFORGE_APP) => { if (!SPORTS.includes(sport) || !app) return ''; scheduleLeaderboardLoad(app,sport); return leaderboardSection(app,sport); },
    publishLeaderboards:(app = window.RANKFORGE_APP) => publishLeaderboards(app)
  });
  window.EVORANK = Object.freeze({ name:"EVORANK", version:VERSION, build:BUILD, legacyStorageCompatible:true });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
