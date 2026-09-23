/* EvoRank 10.11.3 — artwork-fitted female lats and reliable shoulder targets. */
(() => {
  "use strict";

  /* This contour follows the muscle plate already drawn into the female art:
     broad below the armpit, narrowing naturally toward the waist. */
  const LAT_LEFT = "M187 454 C169 456 151 456 139 451 L127 446 C130 472 136 494 143 516 C151 542 162 566 178 589 L207 618 C218 604 225 581 230 555 C234 532 226 507 211 485 Z";
  const LAT_HIT_LEFT = "M178 433 C157 436 137 438 118 432 C116 468 123 506 136 542 C148 576 168 609 201 641 C222 635 239 601 244 559 C247 525 235 486 215 452 Z";
  const MIRROR = "translate(512 0) scale(-1 1)";

  function replaceFemaleLat(markup, interactive) {
    const action = interactive ? ' data-action="select-muscle" data-muscle="lats"' : "";
    const region = /(<g class="muscle-region muscle-region--lats\b[^>]*>)[\s\S]*?(<\/g>)/u;
    const paths = `$1<path${action} data-lat-side="left" d="${LAT_LEFT}" fill-rule="evenodd" clip-rule="evenodd"/><path${action} data-lat-side="right" d="${LAT_LEFT}" transform="${MIRROR}" fill-rule="evenodd" clip-rule="evenodd"/><path class="rf113-muscle-hit"${action} data-lat-side="left" d="${LAT_HIT_LEFT}"/><path class="rf113-muscle-hit"${action} data-lat-side="right" d="${LAT_HIT_LEFT}" transform="${MIRROR}"/>$2`;
    return markup.replace(region, paths);
  }

  function addFemaleShoulderTargets(markup, view, interactive) {
    if (!interactive || markup.includes("rf113-shoulder-overlay")) return markup;
    const y = view === "front" ? 360 : 365;
    const overlay = `<g class="rf113-shoulder-overlay" aria-label="Schultern"><ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="Linke Schulter" cx="113" cy="${y}" rx="63" ry="58"/><ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="Rechte Schulter" cx="399" cy="${y}" rx="63" ry="58"/></g>`;
    return markup.replace("</svg>", `${overlay}</svg>`);
  }

  function addMaleShoulderTargets(markup, view, interactive) {
    if (!interactive || markup.includes("rf113-shoulder-overlay")) return markup;
    const y = view === "front" ? 420 : 405;
    const overlay = `<g class="rf113-shoulder-overlay" aria-label="Schultern"><ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="Linke Schulter" cx="260" cy="${y}" rx="142" ry="132"/><ellipse data-action="select-muscle" data-muscle="shoulders" role="button" tabindex="0" aria-label="Rechte Schulter" cx="740" cy="${y}" rx="142" ry="132"/></g>`;
    return markup.replace("</svg>", `${overlay}</svg>`);
  }

  if (typeof bodyFigure === "function") {
    const previousBodyFigure = bodyFigure;
    bodyFigure = function(view, statuses, selected, options = {}) {
      let markup = previousBodyFigure(view, statuses, selected, options);
      const interactive = options.interactive !== false;
      if (markup.includes("body-figure--female")) {
        if (view === "back") markup = replaceFemaleLat(markup, interactive);
        return addFemaleShoulderTargets(markup, view, interactive);
      }
      if (markup.includes("body-figure--male")) return addMaleShoulderTargets(markup, view, interactive);
      return markup;
    };
  }
})();
