/* EvoRank 10.11.2 — fitted female lats and immediate pointer feedback. */
(() => {
  "use strict";

  const LAT_LEFT = "M183 430 C170 445 161 468 156 497 C154 526 158 553 168 579 C178 604 191 626 208 644 C215 632 220 614 224 591 C228 565 228 537 222 510 C216 482 205 455 191 437 Z";
  const LAT_LINE_LEFT = "M169 478 C176 516 189 570 210 623";
  const LAT_HIT_LEFT = "M169 414 C148 439 137 477 135 520 C135 573 153 620 196 665 C212 672 229 654 238 623 L242 566 C239 510 220 457 194 422 Z";
  const LAT_MIRROR = "translate(512 0) scale(-1 1)";

  if (typeof bodyFigure === "function") {
    const previousBodyFigure = bodyFigure;
    bodyFigure = function(view, statuses, selected, options = {}) {
      let markup = previousBodyFigure(view, statuses, selected, options);
      if (view !== "back" || !markup.includes("body-figure--female")) return markup;
      const action = options.interactive === false ? "" : ' data-action="select-muscle" data-muscle="lats"';
      const region = /(<g class="muscle-region muscle-region--lats\b[^>]*>)[\s\S]*?(<\/g>)/u;
      const fitted = `$1<path${action} data-lat-side="left" d="${LAT_LEFT}" fill-rule="evenodd" clip-rule="evenodd"/><path${action} data-lat-side="right" d="${LAT_LEFT}" transform="${LAT_MIRROR}" fill-rule="evenodd" clip-rule="evenodd"/><path class="rf911-anatomy-lines" data-lat-side="left" d="${LAT_LINE_LEFT}"/><path class="rf911-anatomy-lines" data-lat-side="right" d="${LAT_LINE_LEFT}" transform="${LAT_MIRROR}"/><path class="rf911-muscle-hit"${action} data-lat-side="left" d="${LAT_HIT_LEFT}"/><path class="rf911-muscle-hit"${action} data-lat-side="right" d="${LAT_HIT_LEFT}" transform="${LAT_MIRROR}"/>$2`;
      return markup.replace(region, fitted);
    };
  }

  const clearPressed = () => document.querySelectorAll(".muscle-region.is-pressed").forEach(region => region.classList.remove("is-pressed"));
  document.addEventListener("pointerdown", event => {
    const region = event.target?.closest?.(".muscle-region");
    if (!region || !region.querySelector("[data-action='select-muscle']") && region.dataset.action !== "select-muscle") return;
    clearPressed();
    region.classList.add("is-pressed");
  }, { passive:true });
  document.addEventListener("pointerup", clearPressed, { passive:true });
  document.addEventListener("pointercancel", clearPressed, { passive:true });
})();
