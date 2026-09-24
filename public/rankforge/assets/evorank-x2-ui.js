/* EvoRank X6.1 — workout ordering, equipment settings and model-aligned anatomy.
   X2 filenames/API names are retained for compatibility with existing patches. */
(() => {
  'use strict';
  const model=window.EVORANK_X2_RANKS;
  const proto=LiftoffApp.prototype;
  const old={render:proto.render,renderModal:proto.renderModal,renderExercisePickerModal:proto.renderExercisePickerModal,renderDesignModal:proto.renderDesignModal,renderWorkoutExercise:proto.renderWorkoutExercise,handleClick:proto.handleClick,addSet:proto.addSet,toggleSet:proto.toggleSet,saveDraftAsRoutine:proto.saveDraftAsRoutine};
  // Independently traced against female-bodygraph-v9.1.1.png, back view x=-512.
  // The illustration's spine is near x=242, not the SVG midpoint (256).
  // Do not mirror: that moves the right overlay onto the arm.
  const latLeft='M187 454 L184 453 L167 459 L153 460 L139 457 L126 447 L127 466 C129 481 134 495 140 503 L146 523 L154 535 L166 555 L179 575 L191 595 L205 617 L216 606 L223 592 L229 573 L233 547 L232 534 L210 490 Z';
  const latRight='M300 454 L303 453 L320 459 L334 460 L348 456 L357 447 L356 466 C354 481 349 495 343 505 L335 525 L326 541 L318 555 L305 575 L291 595 L278 617 L268 603 L260 587 L254 567 L252 546 L252 533 L275 487 Z';
  const oldFigure=bodyFigure;
  bodyFigure=function(view,statuses,selected,options={}) {
    let html=oldFigure(view,statuses,selected,options);
    if(view!=='back'||!html.includes('body-figure--female'))return html;
    const template=document.createElement('template');template.innerHTML=html;
    template.content.querySelectorAll('.rf912-female-lat-correction').forEach(el=>el.remove());
    const action=options.interactive===false?'aria-hidden="true"':'data-action="select-muscle" data-muscle="lats" tabindex="0" role="button" aria-label="Latissimus"';
    const paths=`<path class="rfx2-lat-shape" ${action} d="${latLeft}"/><path class="rfx2-lat-shape" ${action} d="${latRight}"/>`;
    const region=template.content.querySelector('.muscle-region--lats');if(region)region.innerHTML=paths;
    return template.innerHTML;
  };
  function accentHue(color) {
    if(!/^#[0-9a-f]{6}$/i.test(color||''))return 330;
    const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
    if(!delta)return 0;
    return ((max===r?(g-b)/delta:max===g?(b-r)/delta+2:(r-g)/delta+4)*60+360)%360;
  }
  function accentSaturation(color) {
    if(!/^#[0-9a-f]{6}$/i.test(color||''))return 1;
    const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb);
    return max===min?0:(max-min)/(1-Math.abs(max+min-1));
  }
  function replacePreviewLogo(html) {
    return html.replace(/<span class="rf872-design-preview-mark"[^>]*>[\s\S]*?<\/span>/g,
      '<span class="rf872-design-preview-mark rfx42-preview-mark" aria-hidden="true"><img src="./assets/brand-x4.1/evorank-er-flat-256.png" alt="" class="rfx41-logo-flat"></span>');
  }
  proto.render=function(...args){const out=old.render.apply(this,args);if(this.state)this.state.appVersion='X6.1';document.documentElement.style.setProperty('--rfx42-accent-hue',`${accentHue(this.state?.settings?.accentColor)}deg`);document.documentElement.style.setProperty('--rfx42-accent-saturation',String(accentSaturation(this.state?.settings?.accentColor)));document.querySelectorAll('.brand__mark,.rf75-auth__mark,.rf92-brand__mark').forEach(el=>{el.classList.add('rfx41-brand-mark');el.innerHTML='<img src="./assets/brand-x4.1/evorank-er-flat-256.png" alt="" class="rfx2-brand-icon rfx41-logo-flat">';});return out;};
  proto.renderDesignModal=function(...args){return replacePreviewLogo(old.renderDesignModal.apply(this,args));};
  proto.renderModal=function(...args) {
    let html=replacePreviewLogo(old.renderModal.apply(this,args));
    if(this.ui.modal?.type==='exercise-picker')html=html.replace('class="modal modal--sheet','class="modal rfx42-picker-sheet modal--sheet');
    return html;
  };
  proto.renderExercisePickerModal=function(...args) {
    const template=document.createElement('template');template.innerHTML=old.renderExercisePickerModal.apply(this,args);
    const root=template.content,list=root.querySelector('.rf77-picker-list');
    if(!list)return template.innerHTML;
    root.querySelectorAll('.v7-picker-row__star').forEach(el=>el.remove());
    list.classList.remove('modal-scroll');list.classList.add('rfx42-picker-results');
    const extra=document.createElement('details');extra.className='rfx42-library-extra';
    extra.innerHTML='<summary>Dehnen & Mobilität</summary>';
    root.querySelectorAll('.rf109-stretch-filter,.rf110-reviewed-filter').forEach(el=>extra.append(el));
    const scroll=document.createElement('div');scroll.className='modal-scroll rfx42-picker-scroll';
    for(const el of [...root.children])if(!el.matches('.sheet-handle,.modal-header'))scroll.append(el);
    const count=scroll.querySelector('.rf81-library-count');
    if(count)list.before(count);
    list.before(extra);
    root.append(scroll);
    return template.innerHTML;
  };
  function inputInfo(e) {
    if(e.bodyweightMode==='assisted')return 'Hilfe eintragen: Körpergewicht minus Unterstützung zählt für den Rang.';
    if(['added','bodyweight'].includes(e.bodyweightMode))return 'Zusatzgewicht eintragen. Dein Körpergewicht wird für den Rang automatisch ergänzt.';
    if(e.bodyweightMode==='bodyweight-fraction')return 'Zusatzgewicht eintragen. Der bewegte Körperanteil wird für den Rang geschätzt.';
    return '';
  }
  proto.renderWorkoutExercise=function(raw,position) {
    const e=model.canonical(raw);
    const template=document.createElement('template');template.innerHTML=old.renderWorkoutExercise.call(this,e,position);
    const card=template.content.querySelector('[data-exercise-instance]');if(!card)return template.innerHTML;
    card.classList.add('rfx41-workout-exercise');
    card.classList.toggle('rfx44-complete',e.sets.length>0&&e.sets.every(set=>set.done));
    card.querySelectorAll('.v72-set-card').forEach((setCard,index)=>{
      setCard.setAttribute('aria-label',`Satz ${index+1} · ${e.name}`);
      const toggle=setCard.querySelector('[data-action="set-toggle"]');
      if(toggle)toggle.setAttribute('aria-pressed',String(setCard.classList.contains('is-done')));
      const hint=setCard.querySelector('.v72-set-card__hint>span:first-child');
      if(hint&&hint.textContent==='Jeder Satz wird separat gespeichert.')hint.textContent=`Satz ${index+1} von ${e.sets.length}`;
    });
    const tools=document.createElement('div');tools.className='rfx2-workout-tools';
    tools.innerHTML=`<label class="rfx2-position"><span>Übung</span><select data-x2-order="${escapeAttr(e.id)}" aria-label="Position von ${escapeAttr(e.name)}">${(this.state.draft?.exercises||[]).map((_,i)=>`<option value="${i}" ${i===position?'selected':''}>${i+1} / ${this.state.draft.exercises.length}</option>`).join('')}</select></label><button type="button" class="rfx2-grip" data-x2-grip="${escapeAttr(e.id)}" aria-label="${escapeAttr(e.name)} verschieben" title="Ziehen oder mit den Pfeiltasten verschieben"><svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></svg></button>`;
    const header=card.querySelector('header');
    const heading=header.querySelector('h2')?.parentElement;
    if(heading){heading.classList.add('rfx41-exercise-heading');heading.prepend(tools);}else header.append(tools);
    if(model.isCable(e)) {
      const details=document.createElement('details');details.className='rfx2-cable';details.dataset.exerciseId=e.id;
      details.innerHTML=`<summary>Kabelturm · ${e.cableInputMode==='handle'?'Griffgewicht':`Stapelgewicht ÷ ${model.ratio(e)}`} · ${e.cableConfigured?'geprüft ✓':'bitte prüfen'}</summary><div class="rfx2-cable-panel"><p>${e.cableConfigured?"Deine gespeicherte Geräteübersetzung.":"Voreinstellung 1:1 (Teiler 1), noch nicht bestätigt. Bitte vor dem ersten Satz am Gerät prüfen."} Die Anzahl sichtbarer Rollen reicht nicht aus. Auch bei Technogym hängt die Übersetzung vom Modell ab.</p><label>Gerät / Modell (optional)<input data-x45-cable-name maxlength="80" value="${escapeAttr(e.cableName||'')}" placeholder="z. B. Technogym, genaue Modellbezeichnung"></label><label>Stapelgewicht geteilt durch<input data-x2-ratio type="number" min="0.25" max="10" step="0.25" value="${model.ratio(e)}" inputmode="decimal" aria-label="Teiler für die Kabelübersetzung"></label><label>Gewichtseingabe<select data-x2-cable-mode><option value="stack" ${e.cableInputMode!=='handle'?'selected':''}>Anzeige am Gewichtsstapel</option><option value="handle" ${e.cableInputMode==='handle'?'selected':''}>Bereits umgerechnetes Griffgewicht</option></select></label><p>40 kg ÷ 2 = ungefähr 20 kg am Griff. Bei einer 1:1-Übersetzung ist der Teiler 1, bei halber Last 2, bei Viertellast 4. Hersteller schreiben die Verhältnisse teils umgekehrt. Pro Seite eintragen; bei gekoppelten Griffen zählt die gesamte Geräteübersetzung.</p><label class="rfx45-cable-default"><input type="checkbox" data-x45-cable-default> Auch als Standard für neue Kabelübungen verwenden</label><button type="button" data-action="x2-save-cable" class="button button--primary">Für offene und neue Sätze speichern</button></div>`;
      header.after(details);
    }
    if(model.isMachine(e)&&!model.isCable(e)) {
      const details=document.createElement('details');details.className='rfx2-cable rfx42-machine';details.dataset.exerciseId=e.id;
      const sample=Number(e.sets.find(s=>!s.done)?.weightKg||e.sets[0]?.weightKg||0);
      details.innerHTML=`<summary>Maschine · ${escapeHtml(e.machineName||'Gerät einstellen')}${e.machineConfigured?' ✓':''}</summary><div class="rfx2-cable-panel"><label>Gerät / Modell (optional)<input data-machine-name maxlength="80" value="${escapeAttr(e.machineName||'')}" placeholder="z. B. Preacher-Curl-Maschine"></label><label>Gewichtseingabe<select data-machine-mode><option value="display" ${e.machineInputMode!=='resistance'?'selected':''}>Gewichtsstapel oder aufgelegte Scheiben</option><option value="resistance" ${e.machineInputMode==='resistance'?'selected':''}>Bereits umgerechnete Last am Griff</option></select></label><label>Gerätefaktor: Last ÷ eingegebenes Gewicht<input data-machine-factor type="number" min="0.05" max="10" step="0.05" value="${model.machineFactor(e)}" inputmode="decimal"></label><label>Zusätzlicher Startwiderstand am Griff (kg)<input data-machine-start type="number" min="0" max="200" step="0.1" value="${model.machineOffset(e)}" inputmode="decimal"></label><p>Beispiel: 40 kg × 0,5 + 5 kg Startwiderstand = 25 kg wirksame Last. Ist die Anzeige schon umgerechnet, „Last am Griff“ wählen – dann erfolgt keine zweite Umrechnung.</p><p>Aktuelle Eingabe: ${formatWeight(sample,this.unit)} → ${formatWeight(model.handleWeight(e,sample),this.unit)} geschätzte Last. Den Faktor und Startwiderstand aus Herstellerangaben oder einer Messung übernehmen. Ohne diese Angaben bleibt der Maschinenrang eine grobe Schätzung; Hebel und Kurvenscheiben unterscheiden sich.</p><button type="button" data-action="x42-save-machine" class="button button--primary">Für offene und neue Sätze speichern</button></div>`;
      header.after(details);
    }
    const info=inputInfo(e);
    if(info){const p=document.createElement('p');p.className='rfx2-load-info';p.textContent=info;header.after(p);
      card.querySelectorAll('input[data-field="weightKg"],input[data-rf93-field$="WeightKg"]').forEach(input=>{const label=e.bodyweightMode==='assisted'?'Unterstützung':'Zusatzgewicht';const caption=input.closest('label')?.querySelector('span');if(caption)caption.textContent=label;input.setAttribute('aria-label',label);});
    }
    return template.innerHTML;
  };
  proto.moveX2Exercise=function(id,target) {
    const list=this.state.draft?.exercises||[],index=list.findIndex(e=>e.id===id);
    target=Math.min(list.length-1,Math.max(0,Math.floor(Number(target)||0)));
    if(index<0||index===target)return;
    list.splice(target,0,list.splice(index,1)[0]);
    this.scheduleSave();this.render();this.showToast?.(`Übung auf Position ${target+1}`);
  };
  proto.setX2Cable=function(id,newRatio,mode,options={}) {
    const e=this.state.draft?.exercises.find(e=>e.id===id);if(!e||!model.isCable(e))return;
    const previous=equipmentSnapshot(e);
    const next={cableRatio:model.ratio({cableRatio:newRatio}),cableInputMode:mode==='handle'?'handle':'stack',cableConfigured:true,cableName:String(options.name??e.cableName??'').slice(0,80)};
    e.sets.forEach(s=>{if(s.done){if(s.cableRatio==null)Object.assign(s,previous);}else Object.assign(s,next);});
    if(options.useDefault)this.state.settings.x45CableDefault={...next};
    Object.assign(e,next);this.state.settings.x2CableSettings||={};this.state.settings.x2CableSettings[e.exerciseId]={...next};
    this.scheduleSave();this.render();this.showToast?.('Kabelturm gespeichert');
  };
  proto.handleClick=function(event) {
    const machine=event.target.closest?.('[data-action="x42-save-machine"]');
    if(machine){event.preventDefault();const panel=machine.closest('.rfx42-machine');const inputs=[...panel.querySelectorAll('input[type="number"]')];if(inputs.some(input=>!input.reportValidity()))return;return this.setX42Machine(panel.dataset.exerciseId,{machineLoadFactor:panel.querySelector('[data-machine-factor]').value,machineStartingKg:panel.querySelector('[data-machine-start]').value,machineInputMode:panel.querySelector('[data-machine-mode]').value,machineName:panel.querySelector('[data-machine-name]').value});}
    const el=event.target.closest?.('[data-action="x2-save-cable"]');
    if(el){event.preventDefault();const panel=el.closest('.rfx2-cable');const input=panel.querySelector('[data-x2-ratio]');if(!input.reportValidity())return;return this.setX2Cable(panel.dataset.exerciseId,input.value,panel.querySelector('[data-x2-cable-mode]').value,{name:panel.querySelector('[data-x45-cable-name]')?.value,useDefault:panel.querySelector('[data-x45-cable-default]')?.checked});}
    return old.handleClick.call(this,event);
  };
  function equipmentSnapshot(e) {return model.isCable(e)?{cableRatio:model.ratio(e),cableInputMode:e.cableInputMode||'stack',cableConfigured:Boolean(e.cableConfigured),cableName:e.cableName||''}:model.isMachine(e)?{machineLoadFactor:model.machineFactor(e),machineStartingKg:model.machineOffset(e),machineInputMode:e.machineInputMode||'display',machineName:e.machineName||'',machineConfigured:Boolean(e.machineConfigured)}:{};}
  proto.setX42Machine=function(id,settings) {
    const e=this.state.draft?.exercises.find(e=>e.id===id);if(!e||!model.isMachine(e))return;
    const previous=equipmentSnapshot(e),next=model.preserve({...settings,machineConfigured:true},{});
    e.sets.forEach(s=>{if(s.done){if(s.machineLoadFactor==null)Object.assign(s,previous);}else Object.assign(s,next);});
    Object.assign(e,next);this.state.settings.x42MachineSettings||={};this.state.settings.x42MachineSettings[e.exerciseId]={...next};
    this.scheduleSave();this.render();this.showToast?.('Maschineneinstellung gespeichert');
  };
  proto.toggleSet=function(id,setId){const {exercise:e,set:s}=this.findDraftSet(id,setId);if(e&&s&&!s.done)Object.assign(s,equipmentSnapshot(e));return old.toggleSet.call(this,id,setId);};
  proto.addSet=function(id){const out=old.addSet.call(this,id);const e=this.state.draft?.exercises.find(e=>e.id===id);if(e){const s=e.sets.at(-1);if(s&&!s.done){Object.assign(s,equipmentSnapshot(e));this.scheduleSave();}}return out;};
  proto.saveDraftAsRoutine=function(...args){const out=old.saveDraftAsRoutine.apply(this,args);const draft=this.state.draft,routine=this.state.routines.find(r=>r.id===draft?.routineId);routine?.exercises.forEach((e,i)=>model.preserve(draft.exercises[i],e));this.scheduleSave();return out;};
  const oldRankModal=proto.renderExerciseRankModal;
  const oldProfile=proto.renderProfile;
  proto.renderProfile=function(...args){
    return oldProfile.apply(this,args)

      .replace(/(<p class="data-note">)Version [^·<]+/,'$1EvoRank X6.1 ');
  };
  proto.renderExerciseRankModal=function(id){
    const html=oldRankModal.call(this,id),item=this.metrics?.exerciseRanks?.find(l=>l.exerciseId===id);if(!item)return html;
    const e=model.canonical(item.exercise||{id}),bw=Number(item.bodyweightKg)||this.state.profile.bodyweightKg;
    if(['time','distance'].includes(e.tracking))return html;
    const load=model.loadFor(e,item.weightKg,bw,item.assistanceKg),oneRM=epleyOneRepMax(load,item.reps);
    const t=document.createElement('template');t.innerHTML=html;
    t.content.querySelectorAll('.exercise-rank-stats>div').forEach(el=>{if(/1RM/i.test(el.querySelector('small')?.textContent||''))el.querySelector('strong').textContent=formatWeight(oneRM,this.unit);});
    const relative=t.content.querySelector('.rf890-relative-strength strong');if(relative)relative.textContent=`${formatNumber(oneRM/bw,2)} × Körpergewicht`;
    const note=document.createElement('p');note.className='rfx2-load-info';
    note.textContent=`Für diesen Rekord: ${formatWeight(load,this.unit)} geschätzte wirksame Last${model.isCable(e)?` · Stapelgewicht ÷ ${model.ratio(e)}`:model.isMachine(e)?` · ${e.machineName||'Maschine'}`:''}. Körpergewicht beim Training: ${formatWeight(bw,this.unit)}. ${e.rankCalibration==='estimated'?'Geräte- bzw. übungsabhängige Schätzung. ':''}Das 1RM ist eine Näherung; es misst keine direkte Muskelkraft.`;
    const source=window.EVORANK_STANDARDS_X42?.sourceFor(e);
    if(source){const link=document.createElement('a');link.href=source;link.target='_blank';link.rel='noopener noreferrer';link.textContent=' Community-Vergleich und Referenzwerte';note.append(link);}
    const button=t.content.querySelector('[data-action="start-exercise-workout"]');if(button)button.before(note);return t.innerHTML;
  };
  document.addEventListener('change',event=>{const el=event.target.closest?.('[data-x2-order]');if(el)window.RANKFORGE_APP?.moveX2Exercise(el.dataset.x2Order,el.value);});
  document.addEventListener('keydown',event=>{const el=event.target.closest?.('[data-x2-grip]');if(!el||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const app=window.RANKFORGE_APP;const i=app?.state.draft?.exercises.findIndex(e=>e.id===el.dataset.x2Grip);if(i>=0){app.moveX2Exercise(el.dataset.x2Grip,i+(event.key==='ArrowUp'?-1:1));document.querySelector(`[data-x2-grip="${CSS.escape(el.dataset.x2Grip)}"]`)?.focus();}});
  let drag=null;
  document.addEventListener('pointerdown',event=>{const grip=event.target.closest?.('[data-x2-grip]');if(!grip||event.button!==0)return;const card=grip.closest('[data-exercise-instance]');if(!card)return;drag={grip,card,parent:card.parentElement,id:grip.dataset.x2Grip,startY:event.clientY,pointer:event.pointerId,moved:false};grip.setPointerCapture?.(event.pointerId);});
  document.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;if(!drag.moved&&Math.abs(event.clientY-drag.startY)<8)return;event.preventDefault();drag.moved=true;drag.card.classList.add('rfx2-dragging');const others=[...drag.parent.children].filter(el=>el.matches('[data-exercise-instance]')&&el!==drag.card);const next=others.find(el=>event.clientY<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);if(next)drag.parent.insertBefore(drag.card,next);else if(others.length)others.at(-1).after(drag.card);
    let scroller=drag.parent;while(scroller&&scroller!==document.documentElement&&scroller.scrollHeight<=scroller.clientHeight+2)scroller=scroller.parentElement;const box=scroller?.getBoundingClientRect();const top=box?Math.max(0,box.top):0,bottom=box?Math.min(innerHeight,box.bottom):innerHeight;const delta=event.clientY<top+70?-18:event.clientY>bottom-70?18:0;if(delta){if(scroller)scroller.scrollTop+=delta;else window.scrollBy(0,delta);}
  },{passive:false});
  function finish(event){if(!drag||event.pointerId!==drag.pointer)return;const d=drag;drag=null;d.card.classList.remove('rfx2-dragging');if(event.type==='pointercancel'){window.RANKFORGE_APP?.render();return;}if(d.moved){const i=[...d.parent.children].filter(el=>el.matches('[data-exercise-instance]')).indexOf(d.card);window.RANKFORGE_APP?.moveX2Exercise(d.id,i);}}
  document.addEventListener('pointerup',finish);document.addEventListener('pointercancel',finish);
  window.EVORANK=Object.freeze({name:'EvoRank',version:'X6.1',build:'x6.1-r1',legacyStorageCompatible:true});
  window.EVORANK_X2=Object.freeze({version:'X6.1',femaleLatPath:latLeft});
  window.EVORANK_X3=Object.freeze({version:'X6.1',femaleLatPaths:Object.freeze([latLeft,latRight])});
})();
