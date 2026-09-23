/* X4.8: compact training week, reachable locker contents and endurance context. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype,model=window.EVORANK_ENDURANCE_X48;
  const old={renderHome:proto.renderHome,renderRanks:proto.renderRanks,renderModal:proto.renderModal,renderV7RewardShop:proto.renderV7RewardShop};
  const esc=value=>escapeHtml(String(value??''));
  const num=(value,digits=2)=>new Intl.NumberFormat('de',{maximumFractionDigits:digits}).format(value);
  function explanation(app,sport) {
    const metrics=window.RANKFORGE970.sportMetrics(sport,app),detail=metrics.comparison,ctx=detail?.context||model.context(app.state.profile,sport);
    const age=ctx.applied?`${Math.floor(ctx.age)} Jahre · Faktor × ${num(ctx.ageFactor,3)}`:'Geburtsdatum ergänzen für den Altersvergleich';
    const basis=detail?.basis==='power'?'Watt pro kg':'Tempo und Distanz';
    return `<details class="rfx48-endurance"><summary>Dein Ausdauerrang · ${esc(age)}</summary>${detail?`<p><strong>${basis}: ${detail.baseScore} Basispunkte → ${detail.score} Alterspunkte</strong><br>+ ${metrics.consistency} Punkte für aktive Tage = ${metrics.score} Rangpunkte.</p>`:'<p>Trage eine Einheit ein oder starte eine Aufnahme.</p>'}${detail?.basis==='power'?`<p>${num(detail.averagePowerWatts)} W ÷ ${num(detail.bodyweightKg)} kg = <strong>${num(detail.wattsPerKg)} W/kg</strong>. Verwendet wird dein gespeichertes Gewicht bei dieser Einheit. Die Durchschnittsleistung über mindestens 20 Minuten ist kein FTP-Test.</p>`:''}<p>Alter und Körperprofil werden mit einer eigenen Vergleichskurve für diese Sportart berücksichtigt. Grundlage: Alterszeiten über ${ctx.referenceDistance}. Die Übertragung auf andere Strecken und auf Leistungspunkte ist eine EvoRank-Schätzung.</p>${sport==='bike'?'<p>Mit gemessenen Durchschnittswatt, damaligem Körpergewicht und mindestens 20 Minuten wird W/kg bewertet. Ergänze diese Werte beim Speichern oder Eintragen einer Radeinheit. Bei fehlenden oder geschätzten Wattwerten zählt das Tempo; Wind, Steigung und Fahrrad können diesen Vergleich beeinflussen.</p>':'<p>Gewicht allein erlaubt keine verlässliche Korrektur von Lauf- oder Schwimmzeiten. Hier zählen Zeit, Distanz, Alter und Körperprofil. Strecke, Bedingungen und beim Schwimmen die Technik beeinflussen die Vergleichbarkeit.</p>'}<p>Deine tatsächlichen Zeiten bleiben unverändert. Der Rang vergleicht gespeicherte Leistungen mit deinem heutigen Alter. Unter 15 und über 90 Jahren bleibt der jeweilige Randfaktor konstant.</p><a href="${ctx.source}" target="_blank" rel="noopener noreferrer">Altersreferenzen und Datengrundlage</a></details>`;
  }
  window.EVORANK_ENDURANCE_UI_X48=Object.freeze({explanation});
  function foldWeek(app,root) {
    const week=root.querySelector('.rfx45-week');if(!week||week.querySelector('[data-x48-week]'))return;
    const header=week.querySelector('header'),copy=header?.querySelector('div');if(!copy)return;
    const details=document.createElement('details');details.className='rfx48-week-details';details.dataset.x48Week='true';
    details.open=app.state.settings?.x48WeekExpanded===true;
    const summary=document.createElement('summary');summary.className='rfx48-week-summary';summary.append(copy);
    const content=document.createElement('div');content.className='rfx48-week-content';
    const action=header.querySelector('button');if(action){const bar=document.createElement('div');bar.className='rfx48-week-actions';bar.append(action);content.append(bar);}
    header.remove();content.append(...week.childNodes);details.append(summary,content);week.append(details);
  }
  proto.renderHome=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderHome.apply(this,args);foldWeek(this,template.content);
    const sport=this.ui.rf970Sport;
    if(this.ui.view==='triathlon'&&['run','bike','swim'].includes(sport))template.content.querySelector('.rf970-hero')?.insertAdjacentHTML('afterend',explanation(this,sport));
    return template.innerHTML;
  };
  proto.renderRanks=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderRanks.apply(this,args);
    const hero=template.content.querySelector('.rf103-sport-rank-hero');
    if(hero){const active=template.content.querySelector('[data-action="rf103-rank-sport"].is-active');const sport=active?.dataset.sport||this.ui.rf103RankSport||this.ui.rf970Sport;
      if(['run','bike','swim'].includes(sport))hero.insertAdjacentHTML('afterend',explanation(this,sport));}
    return template.innerHTML;
  };
  proto.renderV7RewardShop=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderV7RewardShop.apply(this,args);
    template.content.querySelector('.modal-card-close')?.remove();
    // One scroll owner: the old card and its inner shop previously both scrolled.
    const scroll=template.content.querySelector('.v72-shop-scroll');
    if(scroll)scroll.replaceWith(...scroll.childNodes);
    return `${this.modalHeader('FORGE DROP','Looks & Sounds')}<div class="modal-scroll rfx48-locker-scroll">${template.innerHTML}</div>`;
  };
  proto.renderModal=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderModal.apply(this,args);
    const modal=template.content.querySelector('.modal:has(.rfx48-locker-scroll)');
    if(modal){modal.classList.remove('modal--card');modal.classList.add('rfx48-locker');}
    return template.innerHTML;
  };
  document.addEventListener('toggle',event=>{
    const el=event.target,app=window.RANKFORGE_APP;if(!el?.matches?.('[data-x48-week]')||!app?.state)return;
    app.state.settings||={};if(app.state.settings.x48WeekExpanded===el.open)return;
    app.state.settings.x48WeekExpanded=el.open;app.scheduleSave?.();
  },true);
  window.EVORANK_X48=Object.freeze({explanation,foldWeek});
})();
