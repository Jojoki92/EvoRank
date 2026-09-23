/* RankForge 10.4 r1 — optional colored Home rank frames */
((AppClass) => {
  "use strict";

  if (!AppClass || AppClass.prototype.__rf104Installed) return;

  const VERSION = "10.4";
  const BUILD = "1040-r1";
  const SCHEMA = 33;
  const COPY = Object.freeze({
    de:{ title:"Home-Design", question:"Rank-Karten auf der Startseite", hint:"Diese Auswahl ändert nur die Karten auf Home.", framed:"Mit Rahmen", plain:"Ohne Rahmen" },
    en:{ title:"Home design", question:"Rank cards on Home", hint:"This choice only changes the cards on Home.", framed:"With frame", plain:"Without frame" },
    zh:{ title:"首页设计", question:"首页等级卡片", hint:"此选项只会更改首页卡片。", framed:"有边框", plain:"无边框" },
    hi:{ title:"होम डिज़ाइन", question:"होम पर रैंक कार्ड", hint:"यह विकल्प केवल होम कार्ड बदलता है।", framed:"फ्रेम के साथ", plain:"बिना फ्रेम" },
    es:{ title:"Diseño de Inicio", question:"Tarjetas de rango en Inicio", hint:"Esta opción solo cambia las tarjetas de Inicio.", framed:"Con marco", plain:"Sin marco" },
    ar:{ title:"تصميم الرئيسية", question:"بطاقات الرتب في الرئيسية", hint:"هذا الخيار يغيّر بطاقات الصفحة الرئيسية فقط.", framed:"بإطار", plain:"بدون إطار" }
  });

  const language = () => window.RANKFORGE_I18N?.language || "de";
  const text = key => (COPY[language()] || COPY.de)[key] || COPY.de[key] || key;
  const esc = value => typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);

  function ensure(app) {
    if (!app?.state) return { framed:true };
    const current = app.state.homeRankDesignV104 && typeof app.state.homeRankDesignV104 === "object" ? app.state.homeRankDesignV104 : {};
    current.framed = false; // X4.7: Home uses neutral cards.
    app.state.homeRankDesignV104 = current;
    app.state.schemaVersion = Math.max(SCHEMA, Number(app.state.schemaVersion || 0));
    app.state.appVersion = VERSION;
    return current;
  }

  function draft(app) {
    if (typeof app.ui.rf104FrameDraft !== "boolean") app.ui.rf104FrameDraft = ensure(app).framed;
    return app.ui.rf104FrameDraft;
  }

  function controls() { return ""; }

  const proto = AppClass.prototype;
  proto.__rf104Installed = true;
  const previous = {
    renderHome:proto.renderHome,
    renderModal:proto.renderModal,
    handleClick:proto.handleClick,
    handleChange:proto.handleChange,
    handleSubmit:proto.handleSubmit,
    init:proto.init
  };

  proto.renderHome = function(...args) {
    const framed = ensure(this).framed;
    const html = previous.renderHome.apply(this, args);
    return html.replace(/class="rf103-home-ranks\s+([^"\n]*)"/u, `class="rf103-home-ranks rf104-home-ranks--${framed ? "framed" : "plain"} $1"`);
  };

  proto.renderModal = function(...args) {
    const html = previous.renderModal.apply(this, args);
    if (this.ui?.modal?.type !== "rf103-rank-settings") return html;
    return html.replace('<footer class="modal-footer modal-footer--row">', `${controls(this)}<footer class="modal-footer modal-footer--row">`);
  };

  proto.handleClick = async function(event) {
    const action = event.target?.closest?.("[data-action]")?.dataset?.action;
    if (["rf103-rank-settings", "rf102-rank-settings", "rf1004-home-settings"].includes(action)) this.ui.rf104FrameDraft = ensure(this).framed;
    return previous.handleClick.call(this, event);
  };

  proto.handleChange = async function(event) {
    if (event.target?.dataset?.action === "rf104-frame-style") {
      this.ui.rf104FrameDraft = event.target.value !== "plain";
      this.render();
      return;
    }
    return previous.handleChange?.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.('form[data-form="rf103-rank-settings"]');
    if (form && this.ui.rf103RankDraft?.order?.length) {
      this.state.homeRankDesignV104 = { framed:draft(this) };
      ensure(this);
    }
    const result = await previous.handleSubmit.call(this, event);
    if (form && !this.ui?.modal) this.ui.rf104FrameDraft = null;
    return result;
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    ensure(this);
    this.scheduleSave?.();
    return result;
  };

  window.RANKFORGE104 = Object.freeze({ version:VERSION, build:BUILD, schema:SCHEMA, ensure });
})(typeof LiftoffApp !== "undefined" ? LiftoffApp : window.LiftoffApp);
