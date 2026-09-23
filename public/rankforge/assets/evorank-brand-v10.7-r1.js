/* EVORANK 10.7 — visible product-name migration and release identity.
   Legacy technical keys remain untouched so existing accounts, workouts,
   installed PWAs and cloud callbacks continue to work without data loss. */
(function installEvoRankBrand() {
  "use strict";

  const replaceBrand = value => String(value || "")
    .replace(/RANKFORGE/g, "EVORANK")
    .replace(/RankForge/g, "EvoRank");

  function brandText(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (parent?.closest("script,style,textarea,code,pre")) return;
    const next = replaceBrand(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function brandElement(element) {
    if (!(element instanceof Element)) return;
    ["aria-label", "title", "alt", "placeholder"].forEach(name => {
      const value = element.getAttribute(name);
      const next = replaceBrand(value);
      if (value && value !== next) element.setAttribute(name, next);
    });
    if (element instanceof HTMLAnchorElement && element.download) {
      const next = element.download
        .replace(/rankforge/gi, match => match === match.toUpperCase() ? "EVORANK" : "evorank");
      if (next !== element.download) element.download = next;
    }
  }

  function brandRoot(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      brandText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) brandElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) brandText(node);
      else brandElement(node);
    }
  }

  document.title = replaceBrand(document.title) || "EVORANK Training";
  brandRoot(document.body);

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === "characterData") brandText(record.target);
      if (record.type === "attributes") brandElement(record.target);
      record.addedNodes.forEach(brandRoot);
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-label", "title", "alt", "placeholder", "download"]
  });

  window.EVORANK = Object.freeze({
    name: "EVORANK",
    version: "10.7",
    build: "1070-r2",
    legacyStorageCompatible: true
  });
})();
