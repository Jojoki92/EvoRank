/* =============================================================================
 * RANKFORGE 9.3 — Anmelde-Oberfläche (E-Mail + Passwort)
 *
 * Ersetzt account-ui-v1.js. Unterschiede:
 *   - Registrieren, Anmelden und Passwort-Zurücksetzen statt Magic Link.
 *   - Nach der ersten Anmeldung wird ein Spitzname vergeben. Über ihn finden
 *     sich Freunde; die E-Mail-Adresse wird niemandem angezeigt.
 *   - Die feste Liste der drei erlaubten Adressen fällt weg. Sie bleibt nur
 *     noch als Zuordnung bestehen, damit Johannes, Stefan und Felix ihre schon
 *     vorhandenen lokalen Datenbereiche behalten. Alle anderen bekommen über
 *     rf85EnsureLocalAccount einen eigenen.
 *
 * Greift nicht in rankforge-v9.2.0.js ein.
 * ========================================================================== */
(function () {
  "use strict";

  const SESSION_KEY = "rankforge-device-session-v1";
  const ACTIVE_ACCOUNT_KEY = "uprank-active-account";

  // Bestandsschutz: dieselben Adress-Hashes wie bisher, damit die drei
  // vorhandenen lokalen Datenbereiche weiter gefunden werden. Neue Konten
  // laufen über den regulären Weg und brauchen hier keinen Eintrag.
  const LEGACY_ACCOUNTS = [
    { key: "johannes", hash: "e7bf8f26186df9752cdd375325b2908e7bb6bfd7e5b3a0923d199eeddb950a67" },
    { key: "stefan",   hash: "21e84e6d2126f3f255a5f27c247a14eefb5d9ec822ff005242a0d8cbae091205" },
    { key: "felix",    hash: "1c8c5753363689a63e91e3ac9a7a8636cee98152b7b9b9cbdd120d3caac5afc4" }
  ];

  let wurzel = null;
  let panel = null;
  let zustand = "laden";
  let meldung = "";
  let erfolg = "";
  let letzteMail = "";
  let laeuft = false;
  let profilTimer = null;

  const konto = () => window.RANKFORGE_ACCOUNT;

  // ------------------------------------------------------------------ Werkzeug
  async function sha256(text) {
    const puffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(puffer)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function kontoSchluessel(email) {
    const adresse = String(email || "").trim().toLowerCase();
    const hash = await sha256(adresse);
    const legacy = LEGACY_ACCOUNTS.find(k => k.hash === hash)?.key;
    if (legacy) return legacy;
    // Regulärer Weg für alle übrigen: deterministischer lokaler Datenbereich.
    if (typeof rf85EnsureLocalAccount === "function") {
      const key = rf85EnsureLocalAccount(adresse);
      if (key) return key;
    }
    return "";
  }

  function schreibe(key, value) {
    try { window.localStorage.setItem(key, value); } catch { /* ignorieren */ }
  }

  function lies(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }

  function escape(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, zeichen => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[zeichen]);
  }

  // ------------------------------------------------------------------ Styling
  const CSS = `
html[data-rf92-auth="true"],html[data-rf92-auth="true"] body{
  min-height:100lvh;background:#030509!important;overflow:hidden}
html[data-rf92-auth="true"] #app{visibility:hidden!important}
.rf92{position:fixed;inset:0;z-index:9000;width:100%;height:100lvh;min-height:100lvh;
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
.rf92__field--prefixed{position:relative}
.rf92__field--prefixed input{padding-left:30px}
.rf92__prefix{position:absolute;left:14px;bottom:0;height:52px;display:grid;place-items:center;
  color:#6f7788;font-size:16px;font-weight:700;pointer-events:none}
.rf92__field--password{position:relative}
.rf92__field--password input{padding-right:92px}
.rf92__reveal{position:absolute;right:12px;bottom:0;height:52px;display:grid;place-items:center;
  background:none;border:0;color:#8fbaff;font-size:.58rem;font-weight:900;
  cursor:pointer;font-family:inherit;padding:0 3px;touch-action:manipulation}
.rf92__reveal:focus-visible{outline:2px solid #70a9ff;outline-offset:-4px;border-radius:8px}
.rf92__submit{min-height:52px;border:0;border-radius:14px;cursor:pointer;
  background:linear-gradient(135deg,#3f8cff,#1d64e8);color:#fff;font-size:.72rem;font-weight:950;
  letter-spacing:.04em;box-shadow:0 12px 28px rgba(47,125,255,.22);font-family:inherit}
.rf92__submit:active{transform:scale(.985)}
.rf92__submit[disabled]{opacity:.55;cursor:default;transform:none}
.rf92__ghost{min-height:46px;border:1px solid rgba(142,160,194,.18);border-radius:14px;cursor:pointer;
  background:transparent;color:#9aa7bd;font-size:.65rem;font-weight:850;font-family:inherit;width:100%}
.rf92__ghost:active{transform:scale(.985)}
.rf92__danger{color:#ff7e86;border-color:rgba(255,126,134,.28)}
.rf92__link{background:none;border:0;color:#70a9ff;font-size:.63rem;font-weight:850;
  cursor:pointer;font-family:inherit;padding:4px 0}
.rf92__switch{margin-top:14px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.rf92__error{min-height:18px;color:#ff7e86;font-size:.62rem;line-height:1.4}
.rf92__ok{min-height:18px;color:#42d993;font-size:.62rem;line-height:1.4}
.rf92__hint{color:#6f7788;font-size:.58rem;line-height:1.5;margin:0}
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
.rf92__consent{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;align-items:start;padding:11px 12px;
  border:1px solid rgba(47,125,255,.2);border-radius:14px;background:rgba(47,125,255,.055);cursor:pointer}
.rf92__consent>input{position:absolute;opacity:0;pointer-events:none}
.rf92__consent>span{width:20px;height:20px;margin-top:1px;border:1px solid rgba(142,160,194,.36);border-radius:6px;background:#0b1019}
.rf92__consent>input:checked+span{display:grid;place-items:center;border-color:#2f7dff;background:#2f7dff}
.rf92__consent>input:checked+span:after{content:"✓";color:#fff;font-size:.72rem;font-weight:950}
.rf92__consent strong{display:block;font-size:.61rem;font-weight:900}
.rf92__consent small{display:block;margin-top:4px;color:#8f9bb0;font-size:.53rem;line-height:1.45}
@media (prefers-reduced-motion:reduce){.rf92__submit:active,.rf92__ghost:active{transform:none}}
`;

  function stylesEinbinden() {
    if (document.getElementById("rf92-styles")) return;
    const knoten = document.createElement("style");
    knoten.id = "rf92-styles";
    knoten.textContent = CSS;
    document.head.append(knoten);
  }

  // ------------------------------------------------------------------ Bausteine
  const marke = `<div class="rf92__brand"><img src="./icons/evorank-x2-192.png" alt=""><strong>EvoRank</strong></div>`;

  function meldungen() {
    return `<p class="rf92__error" data-rf92="fehler">${escape(meldung)}</p>` +
      (erfolg ? `<p class="rf92__ok">${escape(erfolg)}</p>` : "");
  }

  function mailFeld(autofocus = false) {
    return `<label class="rf92__field">
      <span>E-Mail-Adresse</span>
      <input type="email" name="email" inputmode="email" autocomplete="email"
             enterkeyhint="next" autocapitalize="off" autocorrect="off" spellcheck="false"
             placeholder="name@beispiel.com" value="${escape(letzteMail)}"
             ${laeuft ? "disabled" : ""} ${autofocus ? "autofocus" : ""}>
    </label>`;
  }

  function passwortFeld(name, label, autocomplete, enterkeyhint = "go") {
    return `<label class="rf92__field rf92__field--password">
      <span>${escape(label)}</span>
      <input type="password" name="${escape(name)}" autocomplete="${escape(autocomplete)}"
             enterkeyhint="${escape(enterkeyhint)}" autocapitalize="off" autocorrect="off"
             spellcheck="false" ${laeuft ? "disabled" : ""}>
      <button type="button" class="rf92__reveal" data-rf92="passwort-sichtbar"
              aria-label="Passwort anzeigen" aria-pressed="false">Anzeigen</button>
    </label>`;
  }

  function cloudConsentField() {
    return `<label class="rf92__consent"><input type="checkbox" name="cloudConsent" ${laeuft ? "disabled" : ""}><span></span><div><strong>Cloud-Sicherung aktivieren · optional</strong><small>Ich willige ausdrücklich ein, dass meine Trainings- und Körperdaten zur Sicherung an Supabase übertragen werden. Du kannst das jederzeit im Profil unter „Sicherheit, Cloud & Support“ widerrufen. Ohne Freigabe ist die Anmeldung möglich.</small></div></label><p class="rf92__legal">Für das Konto werden E-Mail und Anmeldedaten verarbeitet. <a href="./privacy.html" target="_blank" rel="noopener">Datenschutz</a> · <a href="./terms.html" target="_blank" rel="noopener">Nutzungsbedingungen</a></p>`;
  }

  function bestaetigeCloudConsent(formular) {
    if (formular.querySelector('[name="cloudConsent"]')?.checked && konto().status().signedIn) {
      window.RANKFORGE_BRIDGE?.setCloudConsent?.(true);
      window.RANKFORGE_BRIDGE?.reconcile?.();
    }
  }

  // ------------------------------------------------------------------ Ansichten
  function anmeldenMarkup() {
    return `<form class="rf92__card" data-rf92-form="anmelden" novalidate>
      ${marke}
      <div class="rf92__copy">
        <small>Dein Konto</small>
        <h1>Anmelden</h1>
        <p>Melde dich mit E-Mail und Passwort an. Deine Trainingsdaten bleiben
           auf dem Gerät; eine Cloud-Sicherung ist freiwillig.</p>
      </div>
      <div class="rf92__form">
        ${mailFeld(true)}
        ${passwortFeld("password", "Passwort", "current-password")}
        ${cloudConsentField()}
        ${meldungen()}
        <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
          ${laeuft ? "Wird geprüft …" : "Anmelden"}
        </button>
      </div>
      <div class="rf92__switch">
        <button type="button" class="rf92__link" data-rf92="zu-registrieren">Neues Konto anlegen</button>
        <button type="button" class="rf92__link" data-rf92="zu-reset">Passwort vergessen?</button>
      </div>
      ${navigator.onLine === false
        ? `<div class="rf92__note">Gerade keine Internetverbindung. Für die Anmeldung wird sie gebraucht — danach funktioniert EVORANK auch offline.</div>`
        : ""}
    </form>`;
  }

  function registrierenMarkup() {
    const minimum = konto()?.minPasswordLength || 10;
    return `<form class="rf92__card" data-rf92-form="registrieren" novalidate>
      ${marke}
      <div class="rf92__copy">
        <small>Neu hier</small>
        <h1>Konto anlegen</h1>
        <p>Verbinde dich mit Freunden. Mit optionaler Cloud-Sicherung kannst du
           deine freigegebenen Trainingsdaten auf einem neuen Gerät wiederherstellen.</p>
      </div>
      <div class="rf92__form">
        ${mailFeld(true)}
        ${passwortFeld("password", "Passwort", "new-password", "next")}
        ${passwortFeld("password2", "Passwort wiederholen", "new-password")}
        ${cloudConsentField()}
        <p class="rf92__hint">Mindestens ${minimum} Zeichen. Ein Satz, den nur du kennst,
           ist besser als ein kurzes Kunstwort.</p>
        ${meldungen()}
        <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
          ${laeuft ? "Wird angelegt …" : "Konto anlegen"}
        </button>
      </div>
      <div class="rf92__switch">
        <button type="button" class="rf92__link" data-rf92="zu-anmelden">Ich habe schon ein Konto</button>
      </div>
    </form>`;
  }

  function resetMarkup() {
    return `<form class="rf92__card" data-rf92-form="reset" novalidate>
      ${marke}
      <div class="rf92__copy">
        <small>Passwort</small>
        <h1>Zurücksetzen</h1>
        <p>Wir schicken dir einen Link, mit dem du ein neues Passwort setzen kannst.</p>
      </div>
      <div class="rf92__form">
        ${mailFeld(true)}
        ${meldungen()}
        <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
          ${laeuft ? "Wird gesendet …" : "Link senden"}
        </button>
      </div>
      <div class="rf92__switch">
        <button type="button" class="rf92__link" data-rf92="zu-anmelden">Zurück zur Anmeldung</button>
      </div>
    </form>`;
  }

  function gesendetMarkup(titel, beschreibung, fussnote, erneutSenden = false) {
    return `<div class="rf92__card">
      ${marke}
      <div class="rf92__sent">
        <div class="rf92__ring">✉</div>
        <div class="rf92__copy" style="margin:0">
          <small>Fast geschafft</small>
          <h1>${escape(titel)}</h1>
          <p>${escape(beschreibung)}</p>
        </div>
        <div class="rf92__mail">${escape(letzteMail)}</div>
        <div class="rf92__actions">
          ${erneutSenden ? `<button type="button" class="rf92__submit" data-rf92="bestaetigung-neu-senden" ${laeuft ? "disabled" : ""}>
            ${laeuft ? "Wird gesendet …" : "Bestätigungs-E-Mail erneut senden"}
          </button>` : ""}
          <button type="button" class="rf92__ghost" data-rf92="zu-anmelden">Zurück zur Anmeldung</button>
        </div>
        ${meldungen()}
        <p class="rf92__hint">${escape(fussnote)}</p>
      </div>
    </div>`;
  }

  function kontoExistiertMarkup() {
    return `<div class="rf92__card">
      ${marke}
      <div class="rf92__sent">
        <div class="rf92__ring">i</div>
        <div class="rf92__copy" style="margin:0">
          <small>Schon dabei</small>
          <h1>Konto schon vorhanden</h1>
          <p>Für diese Adresse gibt es bereits ein Konto:</p>
        </div>
        <div class="rf92__mail">${escape(letzteMail)}</div>
        <div class="rf92__actions">
          <button type="button" class="rf92__submit" data-rf92="zu-anmelden">Zur Anmeldung</button>
          <button type="button" class="rf92__ghost" data-rf92="zu-reset">Passwort vergessen?</button>
        </div>
        ${meldungen()}
        <p class="rf92__hint">Falls du die Adresse damals nie bestätigt hast, ist gerade
           eine neue Bestätigungs-E-Mail rausgegangen — schau auch in Spam/Junk.</p>
      </div>
    </div>`;
  }

  function neuesPasswortMarkup() {
    const minimum = konto()?.minPasswordLength || 10;
    return `<form class="rf92__card" data-rf92-form="neues-passwort" novalidate>
      ${marke}
      <div class="rf92__copy">
        <small>Passwort</small>
        <h1>Neues Passwort</h1>
        <p>Wähle ein neues Passwort für dein Konto.</p>
      </div>
      <div class="rf92__form">
        ${passwortFeld("password", "Neues Passwort", "new-password", "next")}
        ${passwortFeld("password2", "Wiederholen", "new-password")}
        <p class="rf92__hint">Mindestens ${minimum} Zeichen.</p>
        ${meldungen()}
        <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
          ${laeuft ? "Wird gespeichert …" : "Passwort speichern"}
        </button>
      </div>
      <div class="rf92__switch">
        <button type="button" class="rf92__link" data-rf92="recovery-abbrechen">Abbrechen und zur Anmeldung</button>
      </div>
    </form>`;
  }

  function spitznameMarkup() {
    return `<form class="rf92__card" data-rf92-form="spitzname" novalidate>
      ${marke}
      <div class="rf92__copy">
        <small>Letzter Schritt</small>
        <h1>Dein Spitzname</h1>
        <p>Unter diesem Namen finden dich Freunde. Deine E-Mail-Adresse
           sieht niemand — nur den Spitznamen und deinen Rang.</p>
      </div>
      <div class="rf92__form">
        <label class="rf92__field rf92__field--prefixed">
          <span>Spitzname</span>
          <em class="rf92__prefix">@</em>
          <input type="text" name="nickname" inputmode="text" autocomplete="username"
                 enterkeyhint="go" autocapitalize="off" autocorrect="off" spellcheck="false"
                 maxlength="20" placeholder="ironbear" ${laeuft ? "disabled" : ""} autofocus>
        </label>
        <label class="rf92__field">
          <span>Anzeigename (optional)</span>
          <input type="text" name="displayName" maxlength="40" autocomplete="name"
                 placeholder="Wie dich Freunde kennen" ${laeuft ? "disabled" : ""}>
        </label>
        <p class="rf92__hint">3–20 Zeichen, Kleinbuchstaben, Ziffern, Punkt und Unterstrich.
           Der Spitzname lässt sich später im Konto ändern.</p>
        ${meldungen()}
        <button type="submit" class="rf92__submit" ${laeuft ? "disabled" : ""}>
          ${laeuft ? "Wird gespeichert …" : "Weiter"}
        </button>
      </div>
    </form>`;
  }

  function anmeldeMarkup() {
    if (zustand === "registrieren") return registrierenMarkup();
    if (zustand === "reset") return resetMarkup();
    if (zustand === "bestaetigung-gesendet") {
      return gesendetMarkup(
        "Konto angelegt",
        "Bitte bestätige noch die Adresse. Wir haben eine E-Mail geschickt an",
        "Keine E-Mail? Schau auch in Spam/Junk. Warte kurz, bevor du sie erneut sendest.",
        true
      );
    }
    if (zustand === "konto-existiert") return kontoExistiertMarkup();
    if (zustand === "reset-gesendet") {
      return gesendetMarkup(
        "Link ist unterwegs",
        "Falls es zu dieser Adresse ein Konto gibt, ist jetzt eine E-Mail unterwegs an",
        "Öffne den Link auf diesem Gerät. Er gilt eine Stunde."
      );
    }
    if (zustand === "neues-passwort") return neuesPasswortMarkup();
    if (zustand === "spitzname") return spitznameMarkup();
    return anmeldenMarkup();
  }

  // ------------------------------------------------------------------ Absenden
  function feld(formular, name) {
    return String(formular.querySelector(`[name="${name}"]`)?.value || "");
  }

  async function absenden(formular) {
    const art = formular.dataset.rf92Form;
    meldung = "";
    erfolg = "";
    laeuft = true;
    zeichne();

    try {
      if (art === "anmelden") {
        const email = feld(formular, "email").trim();
        letzteMail = email.toLowerCase();
        await konto().signIn(email, feld(formular, "password"));
        bestaetigeCloudConsent(formular);
        // Der Rest passiert über onChange -> nachAnmeldung.
      }

      else if (art === "registrieren") {
        const email = feld(formular, "email").trim();
        const passwort = feld(formular, "password");
        if (passwort !== feld(formular, "password2")) {
          throw new Error("Die beiden Passwörter stimmen nicht überein");
        }
        letzteMail = email.toLowerCase();
        const result = await konto().signUp(email, passwort);
        if (!result.confirmationRequired && !result.alreadyRegistered) bestaetigeCloudConsent(formular);
        if (result.alreadyRegistered) {
          zustand = "konto-existiert";
        } else if (result.confirmationRequired) {
          zustand = "bestaetigung-gesendet";
        }
        // Ohne Bestätigungspflicht meldet signUp direkt an; onChange übernimmt.
      }

      else if (art === "reset") {
        const email = feld(formular, "email").trim();
        letzteMail = email.toLowerCase();
        await konto().requestPasswordReset(email);
        zustand = "reset-gesendet";
      }

      else if (art === "neues-passwort") {
        const passwort = feld(formular, "password");
        if (passwort !== feld(formular, "password2")) {
          throw new Error("Die beiden Passwörter stimmen nicht überein");
        }
        await konto().updatePassword(passwort);
        erfolg = "Passwort gespeichert.";
        await weiterNachAnmeldung();
      }

      else if (art === "spitzname") {
        await konto().saveProfile({
          nickname: feld(formular, "nickname"),
          displayName: feld(formular, "displayName")
        });
        await weiterNachAnmeldung();
      }
    } catch (fehler) {
      const bestaetigungFehlt = art === "anmelden" && (
        fehler?.code === "email_not_confirmed" ||
        /e-mail-adresse bestätigen|email not confirmed/i.test(String(fehler?.message || ""))
      );
      const kontoExistiert = art === "registrieren" && (
        fehler?.alreadyRegistered === true ||
        /schon ein konto|already registered|already exists/i.test(String(fehler?.message || ""))
      );
      if (kontoExistiert) {
        zustand = "konto-existiert";
      } else if (bestaetigungFehlt) {
        zustand = "bestaetigung-gesendet";
        meldung = "Deine Adresse ist noch nicht bestätigt. Fordere die E-Mail hier bei Bedarf erneut an.";
      } else {
        meldung = fehler?.message || "Das hat nicht geklappt. Bitte nochmal versuchen.";
      }
    } finally {
      laeuft = false;
      zeichne();
    }
  }

  // ------------------------------------------------------------------ Konto-Fenster
  function panelMarkup() {
    const s = konto().status();
    const cloudFreigabe = window.RANKFORGE_BRIDGE?.cloudConsent?.() === true;
    const gesichert = cloudFreigabe ? (s.revision > 0 ? "Ja" : "Noch nicht") : "Pausiert";
    return `<div class="rf92__card">
      ${marke}
      <div class="rf92__copy">
        <small>Konto</small>
        <h1>Dein Zugang</h1>
      </div>
      <div class="rf92__rows">
        <div class="rf92__row"><span>Angemeldet als</span><strong>${escape(s.email || "—")}</strong></div>
        <div class="rf92__row"><span>Spitzname</span><strong>${s.nickname ? "@" + escape(s.nickname) : "—"}</strong></div>
        <div class="rf92__row"><span>In der Cloud gesichert</span><strong>${gesichert}</strong></div>
        <div class="rf92__row"><span>Verbindung</span><strong>${s.online ? "Online" : "Offline"}</strong></div>
      </div>
      <p class="rf92__ok" data-rf92="panelinfo">${escape(meldung)}</p>
      <div class="rf92__actions">
        <button type="button" class="rf92__submit" data-rf92="sichern">Jetzt sichern</button>
        <button type="button" class="rf92__ghost" data-rf92="cloud-freigabe">${cloudFreigabe ? "Cloud-Sicherung pausieren" : "Cloud-Sicherung aktivieren"}</button>
        <button type="button" class="rf92__ghost" data-rf92="spitzname-aendern">Spitzname ändern</button>
        <button type="button" class="rf92__ghost" data-rf92="passwort-aendern">Passwort ändern</button>
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

    if (aktion === "cloud-freigabe") {
      const aktiv = window.RANKFORGE_BRIDGE?.cloudConsent?.() === true;
      if (aktiv && !window.confirm("Cloud-Sicherung pausieren?\n\nNeue Änderungen bleiben dann nur auf diesem Gerät. Bereits gespeicherte Cloud-Daten werden dadurch nicht gelöscht.")) return;
      window.RANKFORGE_BRIDGE?.setCloudConsent?.(!aktiv);
      if ((window.RANKFORGE_BRIDGE?.cloudConsent?.() === true) !== !aktiv) {
        meldung = "Die Freigabe konnte nicht gespeichert werden. Bitte neu laden und erneut versuchen.";
        zeichnePanel();
        return;
      }
      meldung = aktiv ? "Cloud-Sicherung pausiert." : "Cloud-Sicherung aktiviert.";
      if (!aktiv) await window.RANKFORGE_BRIDGE?.reconcile?.();
      zeichnePanel();
      return;
    }

    if (aktion === "sichern") {
      meldung = "Wird gesichert …"; zeichnePanel();
      try {
        await window.RANKFORGE_BRIDGE?.pushNow();
        meldung = "Gesichert.";
      } catch { meldung = "Sichern hat nicht geklappt."; }
      zeichnePanel();
      return;
    }

    if (aktion === "spitzname-aendern") {
      panelSchliessen();
      meldung = ""; erfolg = "";
      zustand = "spitzname";
      zeichne();
      return;
    }

    if (aktion === "passwort-aendern") {
      panelSchliessen();
      meldung = ""; erfolg = "";
      zustand = "neues-passwort";
      zeichne();
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
    const offen = zustand !== "angemeldet" && zustand !== "laden";
    document.documentElement.dataset.rf92Auth = offen ? "true" : "false";
    if (!offen) { wurzel.hidden = true; return; }
    wurzel.hidden = false;
    wurzel.innerHTML = anmeldeMarkup();
    const feldElement = wurzel.querySelector("input[autofocus]");
    // Auf dem Handy nicht automatisch fokussieren — sonst springt die Tastatur
    // sofort hoch und verdeckt die Erklärung.
    if (feldElement && !/iPhone|iPad|Android/i.test(navigator.userAgent)) {
      try { feldElement.focus(); } catch { /* ignorieren */ }
    }
  }

  // ------------------------------------------------------------------ Ablauf

  /** Nach erfolgreicher Anmeldung: lokalen Datenbereich öffnen und Profil prüfen. */
  async function nachAnmeldung(email) {
    const key = await kontoSchluessel(email);
    if (!key) {
      meldung = "Für diese Adresse konnte kein lokaler Datenbereich angelegt werden.";
      try { konto().signOut(); } catch { /* egal */ }
      zustand = "anmelden";
      zeichne();
      return;
    }
    const vorher = lies(SESSION_KEY);
    schreibe(SESSION_KEY, key);
    schreibe(ACTIVE_ACCOUNT_KEY, key);

    // A slow profile service must not hide already saved local training. Only
    // a confirmed missing profile triggers setup; timeout/offline is unknown.
    const account = konto();
    let timer;
    const lookup = Promise.resolve().then(() => account.getProfile()).then(profile => ({ confirmed:true, profile }), () => ({ confirmed:false }));
    const pending = new Promise(resolve => { timer=window.setTimeout(() => resolve({ confirmed:false }),1500); });
    const result = await Promise.race([lookup,pending]);window.clearTimeout(timer);
    if (!account.status().signedIn || account.status().email !== email) return;
    if (result.confirmed && !result.profile?.nickname && navigator.onLine !== false) {
      zustand = "spitzname";
      zeichne();
      return;
    }

    zustand = "angemeldet";
    zeichne();
    if (vorher !== key) window.setTimeout(() => location.reload(), 400);
  }

  /** Nach Spitzname oder Passwortwechsel zurück in die App. */
  async function weiterNachAnmeldung() {
    const vorher = lies(SESSION_KEY);
    const s = konto().status();
    const key = s.email ? await kontoSchluessel(s.email) : "";
    if (key) {
      schreibe(SESSION_KEY, key);
      schreibe(ACTIVE_ACCOUNT_KEY, key);
    }
    zustand = "angemeldet";
    zeichne();
    if (key && vorher !== key) window.setTimeout(() => location.reload(), 400);
    else window.RANKFORGE93_FRIENDS?.refresh?.();
  }

  // ------------------------------------------------------------------ Start
  function start() {
    if (!konto()) {
      console.warn("[RANKFORGE] account-sync-v2.js fehlt — Anmeldung nicht verfügbar.");
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
      const formular = ereignis.target.closest("[data-rf92-form]");
      if (!formular) return;
      ereignis.preventDefault();
      absenden(formular);
    });

    wurzel.addEventListener("click", ereignis => {
      const ausloeser = ereignis.target.closest("[data-rf92]");
      const aktion = ausloeser?.dataset.rf92;
      if (!aktion) return;
      if (aktion === "passwort-sichtbar") {
        const eingabe = ausloeser.closest(".rf92__field--password")?.querySelector('input[name]');
        if (!eingabe) return;
        const sichtbar = eingabe.type === "password";
        eingabe.type = sichtbar ? "text" : "password";
        ausloeser.textContent = sichtbar ? "Verbergen" : "Anzeigen";
        ausloeser.setAttribute("aria-label", sichtbar ? "Passwort verbergen" : "Passwort anzeigen");
        ausloeser.setAttribute("aria-pressed", String(sichtbar));
      }
      else if (aktion === "zu-registrieren") { zustand = "registrieren"; meldung = ""; erfolg = ""; zeichne(); }
      else if (aktion === "zu-anmelden") { zustand = "anmelden"; meldung = ""; erfolg = ""; zeichne(); }
      else if (aktion === "zu-reset") { zustand = "reset"; meldung = ""; erfolg = ""; zeichne(); }
      else if (aktion === "bestaetigung-neu-senden") {
        if (laeuft || !letzteMail) return;
        laeuft = true; meldung = ""; erfolg = ""; zeichne();
        konto().resendSignupConfirmation(letzteMail)
          .then(() => { erfolg = "Bestätigungs-E-Mail erneut angefordert. Bitte auch Spam/Junk prüfen."; })
          .catch(fehler => { meldung = fehler?.message || "Die E-Mail konnte nicht erneut gesendet werden."; })
          .finally(() => { laeuft = false; zeichne(); });
      }
      else if (aktion === "recovery-abbrechen") {
        konto().cancelPasswordRecovery?.();
        zustand = "anmelden"; meldung = ""; erfolg = ""; zeichne();
      }
    });

    // Nach einem Zurücksetzen-Link direkt das Formular für das neue Passwort.
    window.addEventListener("rankforge:password-recovery", () => {
      zustand = "neues-passwort";
      meldung = ""; erfolg = "";
      zeichne();
    });

    konto().onChange(status => {
      if (status.passwordRecovery) {
        zustand = "neues-passwort";
        meldung = ""; erfolg = "";
        zeichne();
        return;
      }
      if (status.signedIn) {
        if (zustand === "neues-passwort" || zustand === "spitzname") return;
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
        zustand = "anmelden";
        zeichne();
      }
    });

    if (!konto().status().signedIn) { zustand = "anmelden"; zeichne(); }

    // Konto-Fenster über die Adresse erreichbar: #konto anhängen.
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
    version: "2.1.1",
    open: panelOeffnen,
    close: panelSchliessen
  });
})();
