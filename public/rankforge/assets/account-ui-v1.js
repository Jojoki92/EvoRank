/* =============================================================================
 * RANKFORGE 9.2 — Anmelde-Oberfläche
 *
 * Zeigt einen Anmeldebildschirm, solange niemand angemeldet ist, und blendet
 * sich aus, sobald es losgehen kann. Zusätzlich ein Konto-Fenster mit Status,
 * Abmelden und Kontolöschung.
 *
 * Bringt sein eigenes CSS mit und übernimmt die Gestaltung des vorhandenen
 * rf75-Anmeldebildschirms (gleiche Farben, Radien, Schriftgrößen), damit es
 * sich nicht wie ein Fremdkörper anfühlt.
 *
 * Greift NICHT in rankforge-v9.1.1.js ein.
 * ========================================================================== */
(function () {
  "use strict";

  const SESSION_KEY = "rankforge-device-session-v1";
  const ACTIVE_ACCOUNT_KEY = "uprank-active-account";

  // Dieselben Adress-Hashes wie die App. Damit weiß die Oberfläche, welches der
  // vorhandenen Konten zu einer Adresse gehört, ohne Klartextadressen zu speichern.
  const KONTEN = [
    { key: "johannes", hash: "e7bf8f26186df9752cdd375325b2908e7bb6bfd7e5b3a0923d199eeddb950a67" },
    { key: "stefan",   hash: "21e84e6d2126f3f255a5f27c247a14eefb5d9ec822ff005242a0d8cbae091205" },
    { key: "felix",    hash: "1c8c5753363689a63e91e3ac9a7a8636cee98152b7b9b9cbdd120d3caac5afc4" }
  ];

  let wurzel = null;
  let panel = null;
  let zustand = "laden";
  let meldung = "";
  let letzteMail = "";
  let profilTimer = null;

  const konto = () => window.RANKFORGE_ACCOUNT;

  // ------------------------------------------------------------------ Werkzeug
  async function sha256(text) {
    const puffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(puffer)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function kontoSchluessel(email) {
    const hash = await sha256(String(email || "").trim().toLowerCase());
    return KONTEN.find(k => k.hash === hash)?.key || "";
  }

  function schreibe(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* ignorieren */ }
  }

  function escape(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, zeichen => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[zeichen]);
  }

  // ------------------------------------------------------------------ Styling
  const CSS = `
.rf92{position:fixed;inset:0;z-index:9000;min-height:100dvh;
  padding:calc(24px + env(safe-area-inset-top,0px)) 18px calc(24px + env(safe-area-inset-bottom,0px));
  display:grid;place-items:center;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:radial-gradient(circle at 50% -10%,rgba(47,125,255,.22),transparent 38%),linear-gradient(180deg,#070a10,#030509);
  color:#f6f8fc;font-family:inherit}
.rf92[hidden]{display:none!important}
.rf92__card{width:min(100%,430px);padding:22px;border:1px solid rgba(142,160,194,.18);border-radius:28px;
  background:rgba(14,18,27,.94);box-shadow:0 28px 80px rgba(0,0,0,.48);
  backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
.rf92__brand{display:flex;align-items:center;gap:11px}
.rf92__brand img{width:48px;height:48px;border-radius:14px;box-shadow:0 12px 28px rgba(47,125,255,.25)}
.rf92__brand strong{font-size:.8rem;letter-spacing:.15em;font-weight:900}
.rf92__copy{margin:24px 0 18px}
.rf92__copy small{display:block;color:#2f7dff;font-size:.5rem;font-weight:950;letter-spacing:.13em;text-transform:uppercase}
.rf92__copy h1{margin:7px 0 0;font-size:1.55rem;line-height:1.08;font-weight:900}
.rf92__copy p{margin:9px 0 0;color:#98a4b9;font-size:.7rem;line-height:1.55}
.rf92__form{display:grid;gap:11px}
.rf92__field{display:grid;gap:6px}
.rf92__field span{color:#98a4b9;font-size:.56rem;font-weight:850;letter-spacing:.06em;text-transform:uppercase}
.rf92__field input{width:100%;height:52px;padding:0 14px;border:1px solid rgba(142,160,194,.18);
  border-radius:14px;outline:0;background:#0b1019;color:#fff;
  /* 16px verhindert, dass iOS beim Antippen hineinzoomt */
  font-size:16px;font-weight:600;-webkit-appearance:none;appearance:none}
.rf92__field input:focus{border-color:#2f7dff;box-shadow:0 0 0 3px rgba(47,125,255,.11)}
.rf92__submit{min-height:52px;border:0;border-radius:14px;cursor:pointer;
  background:linear-gradient(135deg,#3f8cff,#1d64e8);color:#fff;font-size:.72rem;font-weight:950;
  letter-spacing:.04em;box-shadow:0 12px 28px rgba(47,125,255,.22);font-family:inherit}
.rf92__submit:active{transform:scale(.985)}
.rf92__submit[disabled]{opacity:.55;cursor:default;transform:none}
.rf92__ghost{min-height:46px;border:1px solid rgba(142,160,194,.18);border-radius:14px;cursor:pointer;
  background:transparent;color:#9aa7bd;font-size:.65rem;font-weight:850;font-family:inherit;width:100%}
.rf92__ghost:active{transform:scale(.985)}
.rf92__danger{color:#ff7e86;border-color:rgba(255,126,134,.28)}
.rf92__error{min-height:18px;color:#ff7e86;font-size:.62rem;line-height:1.4}
.rf92__ok{min-height:18px;color:#42d993;font-size:.62rem;line-height:1.4}
.rf92__note{margin-top:15px;padding:11px 12px;border:1px solid rgba(47,125,255,.16);border-radius:13px;
  background:rgba(47,125,255,.06);color:#9aa7bd;font-size:.62rem;line-height:1.5}
.rf92__sent{display:grid;gap:14px;text-align:center}
.rf92__sent .rf92__ring{width:64px;height:64px;margin:4px auto 0;border-radius:50%;display:grid;place-items:center;
  background:rgba(47,125,255,.12);color:#70a9ff;font-size:1.6rem}
.rf92__mail{color:#f6f8fc;font-weight:850;word-break:break-all;font-size:.72rem}
.rf92__rows{display:grid;gap:9px;margin:18px 0}
.rf92__row{padding:12px;display:flex;justify-content:space-between;gap:10px;align-items:center;
  border:1px solid rgba(142,160,194,.15);border-radius:14px;background:#111722}
.rf92__row span{color:#8e9aaf;font-size:.6rem;font-weight:800}
.rf92__row strong{font-size:.65rem;text-align:right;word-break:break-word;font-weight:850}
.rf92__actions{display:grid;gap:9px}
@media (prefers-reduced-motion:reduce){.rf92__submit:active,.rf92__ghost:active{transform:none}}
`;

  function stylesEinbinden() {
    if (document.getElementById("rf92-styles")) return;
    const knoten = document.createElement("style");
    knoten.id = "rf92-styles";
    knoten.textContent = CSS;
    document.head.append(knoten);
  }

  // ------------------------------------------------------------------ Anmeldung
  function anmeldeMarkup() {
    if (zustand === "gesendet") {
      return `
      <div class="rf92__card">
        <div class="rf92__brand"><img src="./icons/evorank-icon-192.png" alt=""><strong>RANKFORGE</strong></div>
        <div class="rf92__sent">
          <div class="rf92__ring">✉</div>
          <div class="rf92__copy" style="margin:0">
            <small>Fast geschafft</small>
            <h1>Link ist unterwegs</h1>
            <p>Wir haben eine E-Mail geschickt an</p>
          </div>
          <div class="rf92__mail">${escape(letzteMail)}</div>
          <p style="color:#98a4b9;font-size:.66rem;line-height:1.55;margin:0">
            Öffne den Link <strong>auf diesem Gerät</strong>. Danach bist du angemeldet
            und deine Trainingsdaten werden gesichert.
          </p>
          <div class="rf92__actions">
            <button type="button" class="rf92__ghost" data-rf92="nochmal">Andere Adresse verwenden</button>
          </div>
          <p style="color:#6f7788;font-size:.58rem;margin:0">
            Keine E-Mail? Schau im Spam-Ordner. Der Link gilt eine Stunde.
          </p>
        </div>
      </div>`;
    }

    const laeuft = zustand === "sendet";
    return `
      <form class="rf92__card" data-rf92="form" novalidate>
        <div class="rf92__brand"><img src="./icons/evorank-icon-192.png" alt=""><strong>RANKFORGE</strong></div>
        <div class="rf92__copy">
          <small>Dein Konto</small>
          <h1>Anmelden</h1>
          <p>Gib deine E-Mail-Adresse ein. Du bekommst einen Link zum Anmelden —
             ganz ohne Passwort.</p>
        </div>
        <div class="rf92__form">
          <label class="rf92__field">
            <span>E-Mail-Adresse</span>
            <input type="email" name="email" inputmode="email" autocomplete="email"
                   enterkeyhint="go" autocapitalize="off" autocorrect="off" spellcheck="false"
                   placeholder="name@beispiel.com" value="${escape(letzteMail)}" ${laeuft ? "disabled" : ""}>
          </label>
          <p class="rf92__error" data-rf92="fehler">${escape(meldung)}</p>
          <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
            ${laeuft ? "Wird gesendet …" : "Link senden"}
          </button>
        </div>
        <div class="rf92__note">
          ${navigator.onLine === false
            ? "Gerade keine Internetverbindung. Für die erste Anmeldung wird sie gebraucht — danach funktioniert RANKFORGE auch offline."
            : "Deine Trainingsdaten bleiben auf dem Gerät und werden zusätzlich gesichert. So sind sie auch auf einem neuen Handy wieder da."}
        </div>
      </form>`;
  }

  async function absenden(formular) {
    const eingabe = formular.querySelector("input[name=email]");
    const email = String(eingabe?.value || "").trim();

    meldung = "";
    zustand = "sendet";
    zeichne();

    try {
      await konto().signIn(email);
      letzteMail = email.toLowerCase();
      zustand = "gesendet";
    } catch (fehler) {
      meldung = fehler?.message || "Das hat nicht geklappt. Bitte nochmal versuchen.";
      letzteMail = email;
      zustand = "abgemeldet";
    }
    zeichne();
  }

  // ------------------------------------------------------------------ Konto-Fenster
  function panelMarkup() {
    const s = konto().status();
    const gesichert = s.revision > 0 ? "Ja" : "Noch nicht";
    return `
      <div class="rf92__card">
        <div class="rf92__brand"><img src="./icons/evorank-icon-192.png" alt=""><strong>RANKFORGE</strong></div>
        <div class="rf92__copy">
          <small>Konto</small>
          <h1>Dein Zugang</h1>
        </div>
        <div class="rf92__rows">
          <div class="rf92__row"><span>Angemeldet als</span><strong>${escape(s.email || "—")}</strong></div>
          <div class="rf92__row"><span>In der Cloud gesichert</span><strong>${gesichert}</strong></div>
          <div class="rf92__row"><span>Verbindung</span><strong>${s.online ? "Online" : "Offline"}</strong></div>
        </div>
        <p class="rf92__ok" data-rf92="panelinfo">${escape(meldung)}</p>
        <div class="rf92__actions">
          <button type="button" class="rf92__submit" data-rf92="sichern">Jetzt sichern</button>
          <button type="button" class="rf92__ghost" data-rf92="zurueck">Zurück zum Training</button>
          <button type="button" class="rf92__ghost" data-rf92="abmelden">Abmelden</button>
          <button type="button" class="rf92__ghost rf92__danger" data-rf92="loeschen">Konto und Cloud-Daten löschen</button>
        </div>
        <div class="rf92__note">
          Beim Abmelden bleiben die Trainingsdaten auf diesem Gerät erhalten.
          Beim Löschen werden die Daten in der Cloud unwiderruflich entfernt.
        </div>
      </div>`;
  }

  async function panelAktion(aktion) {
    if (aktion === "zurueck") { panelSchliessen(); return; }

    if (aktion === "sichern") {
      meldung = "Wird gesichert …"; zeichnePanel();
      try {
        await window.RANKFORGE_BRIDGE?.pushNow();
        meldung = "Gesichert.";
      } catch { meldung = "Sichern hat nicht geklappt."; }
      zeichnePanel();
      return;
    }

    if (aktion === "abmelden") {
      if (!window.confirm("Wirklich abmelden?\n\nDeine Trainingsdaten auf diesem Gerät bleiben erhalten.")) return;
      konto().signOut();
      panelSchliessen();
      return;
    }

    if (aktion === "loeschen") {
      const sicher = window.confirm(
        "Konto und alle Daten in der Cloud löschen?\n\n" +
        "Das lässt sich nicht rückgängig machen. Die Daten auf diesem Gerät bleiben erhalten."
      );
      if (!sicher) return;
      if (!window.confirm("Wirklich endgültig löschen?")) return;
      meldung = "Wird gelöscht …"; zeichnePanel();
      try {
        await konto().deleteAccount();
        panelSchliessen();
      } catch (fehler) {
        meldung = fehler?.message || "Löschen hat nicht geklappt.";
        zeichnePanel();
      }
    }
  }

  function panelOeffnen() {
    if (!konto()?.status().signedIn) return;
    stylesEinbinden();
    meldung = "";
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "rf92";
      panel.addEventListener("click", ereignis => {
        const aktion = ereignis.target.closest("[data-rf92]")?.dataset.rf92;
        if (aktion) panelAktion(aktion);
      });
      document.body.append(panel);
    }
    panel.hidden = false;
    zeichnePanel();
  }

  function panelSchliessen() {
    if (panel) panel.hidden = true;
    if (location.hash === "#konto") history.replaceState(null, "", location.pathname + location.search);
  }

  function zeichnePanel() {
    if (panel && !panel.hidden) panel.innerHTML = panelMarkup();
  }

  // ------------------------------------------------------------------ Zeichnen
  function zeichne() {
    if (!wurzel) return;
    if (zustand === "angemeldet" || zustand === "laden") { wurzel.hidden = true; return; }
    wurzel.hidden = false;
    wurzel.innerHTML = anmeldeMarkup();
    const feld = wurzel.querySelector("input[name=email]");
    if (feld && zustand === "abgemeldet") {
      // Auf dem Handy nicht automatisch fokussieren — sonst springt die Tastatur
      // sofort hoch und verdeckt die Erklärung.
      if (!/iPhone|iPad|Android/i.test(navigator.userAgent)) feld.focus();
    }
  }

  /** Nach erfolgreicher Anmeldung: das passende lokale Konto öffnen. */
  async function nachAnmeldung(email) {
    const key = await kontoSchluessel(email);
    if (!key) {
      // Adresse gehört zu keinem der vorhandenen Konten.
      meldung = "Diese Adresse ist für RANKFORGE noch nicht freigeschaltet.";
      try { konto().signOut(); } catch { /* egal */ }
      zustand = "abgemeldet";
      zeichne();
      return;
    }
    const vorher = (() => { try { return window.localStorage.getItem(SESSION_KEY); } catch { return null; } })();
    schreibe(SESSION_KEY, key);
    schreibe(ACTIVE_ACCOUNT_KEY, key);
    zustand = "angemeldet";
    zeichne();
    // Nur neu laden, wenn die App noch nicht mit diesem Konto gestartet ist.
    if (vorher !== key) window.setTimeout(() => location.reload(), 400);
  }

  // ------------------------------------------------------------------ Start
  function start() {
    if (!konto()) {
      console.warn("[RANKFORGE] account-sync-v1.js fehlt — Anmeldung nicht verfügbar.");
      return;
    }
    if (!konto().status().configured) {
      // Ohne Supabase-Werte bleibt alles wie bisher: lokal, ohne Konto.
      console.info("[RANKFORGE] Cloud nicht konfiguriert — Anmeldung wird übersprungen.");
      return;
    }

    stylesEinbinden();
    wurzel = document.createElement("div");
    wurzel.className = "rf92";
    wurzel.hidden = true;
    document.body.append(wurzel);

    wurzel.addEventListener("submit", ereignis => {
      const formular = ereignis.target.closest("[data-rf92=form]");
      if (!formular) return;
      ereignis.preventDefault();
      absenden(formular);
    });
    wurzel.addEventListener("click", ereignis => {
      if (ereignis.target.closest('[data-rf92="nochmal"]')) {
        zustand = "abgemeldet"; meldung = ""; zeichne();
        return;
      }
    });

    konto().onChange(status => {
      if (status.signedIn) {
        if (!status.email) {
          window.clearTimeout(profilTimer);
          profilTimer = window.setTimeout(() => {
            const aktuell = konto().status();
            if (aktuell.signedIn && aktuell.email && zustand !== "angemeldet") nachAnmeldung(aktuell.email);
          }, 300);
          return;
        }
        if (zustand !== "angemeldet") nachAnmeldung(status.email);
      } else if (zustand === "angemeldet" || zustand === "laden") {
        zustand = "abgemeldet";
        zeichne();
      }
    });

    if (!konto().status().signedIn) { zustand = "abgemeldet"; zeichne(); }

    // Konto-Fenster über die Adresse erreichbar machen, solange es dafür noch
    // keinen Knopf in der App gibt: einfach #konto anhängen.
    const pruefeHash = () => { if (location.hash === "#konto") panelOeffnen(); };
    window.addEventListener("hashchange", pruefeHash);
    pruefeHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.RANKFORGE_ACCOUNT_UI = Object.freeze({
    version: "1.0.0",
    open: panelOeffnen,
    close: panelSchliessen
  });
})();
