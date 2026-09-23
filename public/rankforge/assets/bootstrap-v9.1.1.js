(() => {
  "use strict";
  const DEFAULT = { appearance: "dark", accentColor: "#2f7dff", uiStyle: "minimal" };
  const root = document.documentElement;
  const normalizeHex = value => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : DEFAULT.accentColor;
  try {
    const stored = JSON.parse(localStorage.getItem("rankforge-design-v1") || "null") || DEFAULT;
    const appearance = ["system", "dark", "light"].includes(stored.appearance) ? stored.appearance : DEFAULT.appearance;
    const theme = appearance === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : appearance;
    const accent = normalizeHex(stored.accentColor);
    const uiStyle = ["minimal", "classic"].includes(stored.uiStyle) ? stored.uiStyle : DEFAULT.uiStyle;
    const r = Number.parseInt(accent.slice(1, 3), 16);
    const g = Number.parseInt(accent.slice(3, 5), 16);
    const b = Number.parseInt(accent.slice(5, 7), 16);
    root.dataset.appearance = appearance;
    root.dataset.theme = theme;
    root.dataset.uiStyle = uiStyle;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  } catch {
    root.dataset.appearance = DEFAULT.appearance;
    root.dataset.theme = DEFAULT.appearance;
    root.dataset.uiStyle = DEFAULT.uiStyle;
  }
})();

(() => {
  "use strict";
  const start = () => {
    const node = document.getElementById("rf-splash");
    if (!node) return;
    const bar = node.querySelector("[data-rf-splash-bar]");
    const status = node.querySelector("[data-rf-splash-status]");
    const percent = node.querySelector("[data-rf-splash-percent]");
    const retry = node.querySelector("[data-rf-splash-retry]");
    let shownAt = performance.now();
    const minimumVisibleMs = 0;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const updateSteps = active => {
      const order = ["assets", "account", "storage", "library", "ready"];
      const activeIndex = Math.max(0, order.indexOf(active));
      node.querySelectorAll("[data-rf-splash-step]").forEach(item => {
        const index = order.indexOf(item.dataset.rfSplashStep);
        item.classList.toggle("is-active", index === activeIndex);
        item.classList.toggle("is-done", index < activeIndex);
      });
    };
    window.RANKFORGE_SPLASH = {
      visible: true,
      async pause(ms = 0) { if (ms > 0) await delay(ms); },
      show(message = "RANKFORGE starten") {
        this.visible = true;
        shownAt = performance.now();
        node.hidden = false;
        node.classList.remove("is-hidden", "is-error");
        node.setAttribute("aria-hidden", "false");
        if (retry) retry.hidden = true;
        this.set(8, message, "assets");
      },
      set(value, message, step = "assets") {
        const safe = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
        if (bar) bar.style.width = `${safe}%`;
        if (status && message) status.textContent = message;
        if (percent) percent.textContent = `${safe}%`;
        updateSteps(step);
      },
      async finish(message = "Training bereit") {
        this.set(100, message, "ready");
        const remaining = Math.max(0, minimumVisibleMs - (performance.now() - shownAt));
        await delay(remaining);
        node.classList.add("is-hidden");
        node.setAttribute("aria-hidden", "true");
        this.visible = false;
        await delay(420);
        node.hidden = true;
      },
      fail(message = "RANKFORGE konnte nicht starten") {
        this.visible = true;
        node.hidden = false;
        node.classList.remove("is-hidden");
        node.classList.add("is-error");
        this.set(100, message, "ready");
        if (retry) retry.hidden = false;
      }
    };
    retry?.addEventListener("click", () => location.reload());
    requestAnimationFrame(() => window.RANKFORGE_SPLASH?.set(6, "App-Dateien laden", "assets"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
