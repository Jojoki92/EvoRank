/* X5.9: calmer, more natural labels. Small all-caps "eyebrow" texts are shown in
   normal German spelling and a quieter style. Text only; layout and design stay. */
(() => {
  'use strict';

  // Written the way a person would label it, not as a slogan.
  const WORDS = {
    'YOUR RANK': 'Dein Rang', 'YOUR GYM RANK': 'Dein Gym-Rang', 'CURRENT RANK': 'Aktueller Rang',
    'HIGHEST RANK': 'Höchster Rang', 'CURRENT LEAGUE': 'Aktuelle Liga', 'STANDING': 'Platzierung',
    'NEW PR': 'Neuer Bestwert', 'NEUER PR': 'Neuer Bestwert', 'WORKOUT COMPLETE': 'Workout geschafft',
    'REWARDS': 'Belohnungen', 'RANK COLLECTION': 'Alle Ränge', 'PRIVATE LEAGUE': 'Private Liga',
    'NEXT SESSION': 'Nächste Einheit', 'QUICK WORKOUT': 'Schnelles Workout', 'TODAY': 'Heute',
    'WEEKLY XP': 'XP diese Woche', 'WÖCHENTLICHES XP': 'XP diese Woche', 'WOCHEN-XP': 'XP diese Woche',
    'BODY VIEW': 'Körperansicht', 'EXERCISE RANK': 'Übungs-Rang', 'STRENGTH RANKING': 'Kraft-Rang',
    'MULTI-SPORT RANKING': 'Alle Sportarten', 'TRAINING OVERVIEW': 'Trainingsübersicht',
    'FORGE SHOP': 'Shop', 'FORGE LOCKER': 'Sammlung', 'FORGE DROP': 'Belohnung', 'SAFETY CHECK': 'Sicherheitscheck',
    'IPHONE LIVE': 'iPhone live', 'LIVE WORKOUT': 'Live-Workout', 'WORKOUT BUILDER': 'Workout erstellen',
    'DEIN GYM CIRCLE': 'Deine Gym-Freunde', 'WORKOUT IMPORT': 'Workout importieren', 'SETUP': 'Einrichtung',
    'TRACKING': 'Aufzeichnung', 'FOUR TRAINING AREAS': 'Vier Trainingsbereiche', 'NO SELECTION': 'Keine Auswahl',
    'GYM-RANK': 'Gym-Rang', 'DEIN GYM-RANK': 'Dein Gym-Rang', 'HÖCHSTER RANK': 'Höchster Rang',
    'GYM-RANK NACH DEM WORKOUT': 'Gym-Rang nach dem Workout', 'SO FUNKTIONIEREN RANKS': 'So funktionieren die Ränge',
    'KÖRPERANSICHT': 'Körper', 'SPONTAN TRAINIEREN': 'Spontan trainieren', 'DEINE RÄNGE': 'Deine Ränge',
    'COACHING-TIPP': 'Tipp', 'DEIN LOOK': 'Aussehen', 'LIVE-VORSCHAU': 'Vorschau', 'DEIN ACCOUNT': 'Dein Konto',
    'LOKALER ACCOUNT': 'Lokales Konto', 'ACCOUNT': 'Konto', 'WARM-UP': 'Aufwärmen', 'WDH': 'Wdh.',
    'LIVE · VORNE & HINTEN': 'Live · vorne & hinten', 'LIVE · FRONT & BACK': 'Live · vorne & hinten'
  };
  // Stay as they are: units, abbreviations, roman numerals of the ranks, brand.
  const KEEP = new Set(['XP', 'LP', 'PR', '1RM', 'RPE', 'RIR', 'GPS', 'SWOLF', 'KG', 'KM', 'ID', 'HF', 'BPM', 'TRX',
    'PWA', 'CSV', 'JSON', 'PDF', 'GHD', 'OHP', 'EZ', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XL', 'UTC',
    'EVORANK', 'SMS', 'PIN', 'AI', 'KI', 'FAQ', 'USA', 'EU', 'DSGVO', 'AGB', 'WLAN', 'WDS', 'MIN', 'SEK', 'MAX']);
  // Words that stay small inside a label (German grammar).
  const SMALL = new Set(('und oder für nach dem der die das den des am im in an auf pro bis zu zum zur mit von vom '
    + 'vs bei ohne je aus über unter vor als wie noch nicht nur mehr alle diese dieser dieses meine deine '
    + 'nächste nächster nächstes letzte letzter letztes aktuelle aktueller aktuelles persönliche persönlicher '
    + 'persönliches private privater privates eigene eigener eigenes lokale lokaler lokales neue neuer neues '
    + 'aktive aktiver aktives beste bester bestes größte größter größtes höchste höchster schwerstes schwerste '
    + 'meiste relative relativer geschätztes geschätzte wöchentliches heutiges heutige gesamte vier zwei drei '
    + 'dauerhaft sofort spontan läuft beendet pausiert empfohlen gespeichert eingerichtet eingeladen '
    + 'trainieren funktionieren funktioniert speichern starten öffnen prüfen hinzufügen ersetzen bearbeiten '
    + 'teilen bestätigen entschlüsseln einrichten entdecken sichern verwalten ändern löschen wählen '
    + 'vorne hinten live').split(' '));
  const LETTERS = /[A-Za-zÄÖÜäöüß]/;
  const ALL_CAPS = /^[^a-zäöüß]*[A-ZÄÖÜ][^a-zäöüß]*[A-ZÄÖÜ][^a-zäöüß]*$/;

  function word(part, first) {
    if (!LETTERS.test(part) || KEEP.has(part) || /\d/.test(part)) return part;
    const lower = part.toLocaleLowerCase('de-DE');
    if (!first && SMALL.has(lower)) return lower;
    return lower.charAt(0).toLocaleUpperCase('de-DE') + lower.slice(1);
  }

  function natural(text) {
    const trimmed = text.trim();
    if (WORDS[trimmed]) return text.replace(trimmed, WORDS[trimmed]);
    let first = true;
    return text.replace(/[^\s·&/|:,()]+|[·&/|:,()]/g, token => {
      if (/^[·|:(]$/.test(token)) { first = true; return token; }
      if (/^[&/,)]$/.test(token)) return token;
      const out = token.split('-').map((part, index) => word(part, first && index === 0)).join('-');
      if (LETTERS.test(token)) first = false;
      return out;
    });
  }

  function skip(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (el.matches('script,style,textarea,input,select,option,code,svg,.brand,[data-x59-keep]')) return true;
      if (el.id === 'app' || el === document.body) return false;
    }
    return false;
  }

  function humanize(root = document.body) {
    if (!root || !/^de/i.test(document.documentElement.lang || 'de')) return 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let changed = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue;
      if (!text || text.length > 60 || !ALL_CAPS.test(text)) continue;
      const trimmed = text.trim();
      if (trimmed.length < 3 || KEEP.has(trimmed) || !/[A-ZÄÖÜ]{3}/.test(trimmed) || skip(node)) continue;
      const next = natural(text);
      if (next !== text) {
        node.nodeValue = next;
        node.parentElement?.classList.add('x59-label');
        changed++;
      }
    }
    return changed;
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(() => { queued = false; humanize(); });
  };
  if (typeof MutationObserver === 'function' && document.body) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
  }
  window.EVORANK_X59 = Object.freeze({ natural, humanize });
})();
