/* X5.7: local interaction, safe mobile sheets and explicit muscle paint. */
(() => {
  'use strict';
  const proto = LiftoffApp.prototype;
  const old = Object.fromEntries(['render','renderHome','renderModal','renderProfile','renderV7RewardShop','handleClick','closeModal'].map(k => [k,proto[k]]));
  const parse = html => { const t=document.createElement('template'); t.innerHTML=html; return t; };
  // Set the actual SVG fill, rather than relying on CSS filters being repainted
  // inside a raster mask on iOS. All three channels scale equally: same hue.
  function paintSelection(root=document) {
    root.querySelectorAll('.body-figure .muscle-region').forEach(region=>{
      const color=region.style.getPropertyValue('--muscle-color').trim();
      const hex=/^#([\da-f]{6}|[\da-f]{3})$/i.exec(color);
      let paint=color;
      if(hex&&region.classList.contains('is-selected')){
        const digits=hex[1].length===3?[...hex[1]].map(c=>c+c).join(''):hex[1];
        paint='#'+[0,2,4].map(i=>Math.round(parseInt(digits.slice(i,i+2),16)*.62).toString(16).padStart(2,'0')).join('');
      }
      region.style.setProperty('--muscle-paint',paint);
      region.querySelectorAll('.rf920-muscle-fill,path:not([class*="muscle-hit"]):not(.rf911-anatomy-lines)').forEach(shape=>{
        shape.setAttribute('fill',paint);
        shape.style.setProperty('fill',paint,'important');
      });
    });
  }
  const pages = [
    ['home','Dein Sport. Deine Startseite.','Gym, Laufen, Radfahren oder Schwimmen: Unter „Startseite gestalten“ wählst du deine Sportarten und blendest Kalender, Trainingswoche und Fortschritt nach Bedarf ein.'],
    ['play','Ein Tipp bis zum Training','Das Plus unten öffnet alle vier Sportarten. Direkt unter deiner Grafik startest du dein nächstes Training. Im Gym werden fertige Sätze grün; bei Ausdauer kannst du starten, pausieren und speichern.'],
    ['ranks','Farben zeigen deine Stärken','Tippe am Körper einen Muskel an. Laufbahn, Rad und Becken zeigen Tempo, Langstrecke und Konstanz. Braun ist die Einstiegsfarbe; ohne Messwerte entsteht noch keine Leistungswertung. Die Rangdetails erklären den Vergleich.'],
    ['chart','Dein Fortschritt bleibt sichtbar','Unter Ränge → Analyse findest du deinen Verlauf. Übungsgrafiken kannst du auf der Startseite anheften. Alter, Körperprofil und Gewicht bearbeitest du im Profil; tatsächliche Trainingswerte bleiben erhalten.'],
    ['shield','Du bestimmst die Freigaben','GPS fragt erst beim Start einer Standortaufnahme nach Erlaubnis. Für eine zuverlässige Web-Aufnahme bleibt die App sichtbar. Cloud, Freunde und öffentliche Bestenlisten haben eigene Freigaben. Diese Einführung findest du wieder unter Profil → Daten & Hilfe.']
  ];
  function finishTour(app) {
    if(app.state?.settings){ app.state.settings.introX55Pending=false; app.state.settings.introX55Seen=true; app.scheduleSave?.(); }
  }
  function training(app) {
    const names={run:'Laufen',bike:'Radfahren',swim:'Schwimmen'};
    return `${app.modalHeader('DEIN TRAINING','Was möchtest du starten?')}<div class="modal-scroll x55-training"><button class="x51-list-row" data-action="open-routine-picker"><span>${window.EVORANK_ART_X51.badge('strength',0,true)}</span><span><strong>Gym</strong><small>Gespeichertes Workout auswählen</small></span>${icon('chevronRight',18)}</button><button class="button button--secondary" data-action="start-blank-workout">${icon('plus',18)} Leeres Gym-Workout</button>${Object.entries(names).map(([s,n])=>`<button class="x51-list-row" data-action="x51-start-sport" data-sport="${s}"><span>${window.EVORANK_ART_X51.badge(s,0,true)}</span><span><strong>${n}</strong><small>${s==='swim'?'Zeit und Bahnen zählen':'Zeit und Strecke · GPS oder manuell'}</small></span>${icon('chevronRight',18)}</button>`).join('')}</div>`;
  }
  function tour(app) {
    const i=Math.max(0,Math.min(pages.length-1,app.ui.x55TourStep||0)),[glyph,title,copy]=pages[i];
    return `${app.modalHeader('EVORANK ENTDECKEN',title)}<div class="modal-scroll x55-tour"><span class="x55-tour-icon">${icon(glyph,38)}</span><p>${copy}</p><div class="x55-tour-dots" aria-label="Schritt ${i+1} von ${pages.length}">${pages.map((_,n)=>`<i class="${n===i?'is-current':''}"></i>`).join('')}</div><small>${i+1} / ${pages.length}</small></div><div class="modal-footer x55-tour-actions">${i?'<button class="button button--secondary" data-action="x55-tour-back">Zurück</button>':'<button class="button button--secondary" data-action="close-modal">Später</button>'}<button class="button button--primary" data-action="${i===pages.length-1?'close-modal':'x55-tour-next'}">${i===pages.length-1?'Los geht’s':'Weiter'}</button></div>`;
  }
  proto.renderModal=function(...args){
    const type=this.ui.modal?.type;
    if(type==='x55-training'||type==='x55-tour')return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true" aria-label="${type==='x55-tour'?'EvoRank entdecken':'Training starten'}">${type==='x55-tour'?tour(this):training(this)}</section></div>`;
    return old.renderModal.apply(this,args);
  };
  proto.renderProfile=function(...args){
    const t=parse(old.renderProfile.apply(this,args));
    t.content.querySelectorAll('.bodyweight-card').forEach(card=>card.remove());
    const group=[...t.content.querySelectorAll('.rf880-profile-group')].find(g=>g.querySelector('summary')?.textContent.includes('Daten & Hilfe'));
    const body=group?.querySelector('.rf880-profile-group__body');
    if(body){body.insertAdjacentHTML('afterbegin',`<button data-action="x55-tour"><span>${icon('info',20)}</span><div><strong>EvoRank entdecken</strong><small>Die kurze Einführung noch einmal ansehen</small></div>${icon('chevronRight',18)}</button>`);const count=group.querySelector('summary b');if(count)count.textContent=body.children.length;}
    return t.innerHTML;
  };
  proto.renderHome=function(...args){
    const t=parse(old.renderHome.apply(this,args));
    t.content.querySelectorAll('.next-workout-card__body .workout-glyph').forEach(glyph=>glyph.remove());
    return t.innerHTML;
  };
  proto.renderV7RewardShop=function(...args){const t=parse(old.renderV7RewardShop.apply(this,args));t.content.querySelectorAll('.v72-shop-fair').forEach(e=>e.remove());return t.innerHTML;};
  proto.render=function(...args){
    if(this.state?.onboardingComplete&&this.state.settings?.introX55Pending&&!this.ui.modal&&!this.state.draft){this.ui.x55TourStep=0;this.ui.modal={type:'x55-tour'};}
    const result=old.render.apply(this,args);
    paintSelection();
    return result;
  };
  proto.closeModal=function(...args){if(this.ui.modal?.type==='x55-tour')finishTour(this);return old.closeModal.apply(this,args);};
  proto.handleClick=function(event){
    const el=event.target?.closest?.('[data-action]'),action=el?.dataset.action;
    if(action==='x55-training'||action==='x55-tour'){event.preventDefault();this.ui.x55TourStep=0;this.openModal(action);return;}
    if(action==='x55-tour-next'||action==='x55-tour-back'){event.preventDefault();this.ui.x55TourStep=Math.max(0,Math.min(pages.length-1,(this.ui.x55TourStep||0)+(action.endsWith('next')?1:-1)));this.render();return;}
    return old.handleClick.call(this,event);
  };
  // Selection changes only the selected class and its small explanation. Keeping
  // the actual SVG nodes avoids repeated image decoding/filter repaint on iOS.
  proto.renderMuscleSelection=function(surface){
    if(this.ui.modal)return false;
    const root=document.querySelector(surface==='home'?'.home-screen':'.ranks-screen,.rank-screen');
    if(!root?.querySelector('.muscle-region'))return false;
    const key=this.ui[surface==='home'?'rf108HomeSelectedMuscle':'rf108RankSelectedMuscle'];
    const t=parse(surface==='home'?this.renderHome():this.renderRanks());
    for(const selector of ['.bodygraph-home-summary','.muscle-detail-card','.muscle-chip-list','.rf80-muscle-key']){
      const existing=root.querySelectorAll(selector),fresh=t.content.querySelectorAll(selector);
      existing.forEach((node,i)=>{if(fresh[i]){fresh[i].setAttribute('aria-live','polite');node.replaceWith(fresh[i]);}});
    }
    root.querySelectorAll('.muscle-region').forEach(region=>{
      const selected=region.dataset.muscle===key;
      region.classList.toggle('is-selected',selected);region.classList.remove('is-pressed');
      region.setAttribute('aria-pressed',String(selected));
    });
    paintSelection(root);
    return true;
  };
})();
