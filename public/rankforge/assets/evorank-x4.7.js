/* X4.7: current-age comparisons and a single entry point for personal plans. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype,ageModel=window.EVORANK_AGE_X47;
  const old={render:proto.render,renderRanks:proto.renderRanks,renderExerciseRankModal:proto.renderExerciseRankModal,
    renderProfile:proto.renderProfile,renderModal:proto.renderModal,handleClick:proto.handleClick,init:proto.init};
  const esc=value=>escapeHtml(String(value??''));
  const days=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const number=value=>new Intl.NumberFormat('de',{maximumFractionDigits:3}).format(value);
  function ageCopy(profile) {
    const info=ageModel.info(profile);
    return info.applied?`${Math.floor(info.age)} Jahre · Altersfaktor × ${number(info.factor)}${info.source==='age-estimate'?' · Alter geschätzt':''}${info.bounded?' · Randwert des Modells':''}`:'Kein gültiges Alter · ohne Alterskorrektur';
  }
  function ageHelp(app,detail) {
    return `<details class="rfx47-age"><summary>Kraftrang nach Alter · ${esc(ageCopy(app.state.profile))}</summary>${detail?`<p><strong>${number(detail.baseScore)} Basispunkte → ${number(detail.score)} Alterspunkte</strong></p>`:''}<p>Die Alterskorrektur folgt einer interpolierten Vergleichskurve für Frauen bzw. Männer. Sie ist eine EvoRank-Schätzung für Kraftübungen, keine exakte Norm für jede Übung. Körpergewicht und Geräteübersetzung fließen vorher in die Basispunkte ein. Geräte-Schätzungen behalten ihre Rangobergrenze.</p><p>Dein Geburtsdatum aktualisiert das Vergleichsalter täglich. Ohne Geburtsdatum verwenden wir dein zuletzt eingetragenes Alter mit einem gespeicherten Bezugsdatum als Näherung. Unter 15 und über 90 Jahren bleibt der jeweilige Randfaktor konstant.</p><p>Ein Rang kann sich durch das Alter verändern. Deinen Kraftfortschritt erkennst du an Gewicht, Wiederholungen und geschätztem 1RM. Historische Sätze, XP und Belohnungen werden nicht verändert. Ausdauerränge verwenden eigene Alterskurven für Schwimmen, Laufen und Radfahren.</p><a href="${ageModel.source}" target="_blank" rel="noopener noreferrer">Datengrundlage: Strength Level, Alterswerte Bankdrücken</a><button class="button button--secondary" data-action="open-profile-edit">Geburtsdatum bearbeiten</button></details>`;
  }
  function refreshAge(app,now=new Date()) {
    if(!app?.state?.profile)return false;
    const changed=ageModel.ensureProfile(app.state.profile,now);
    const key=[app.accountKey,ageModel.dayKey(now),app.state.profile.birthDate,app.state.profile.age,app.state.profile.bodyProfile].join('|');
    if(app.ui.x47AgeKey===key&&!changed)return false;
    app.ui.x47AgeKey=key;app.metrics=getMetrics(app.state);
    // Save the current public snapshot at most once per comparison day/change.
    app.scheduleSave?.();return true;
  }
  proto.render=function(...args){refreshAge(this);return old.render.apply(this,args);};
  proto.renderRanks=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderRanks.apply(this,args);
    template.content.querySelector('.rank-tabs')?.insertAdjacentHTML('beforebegin',ageHelp(this));return template.innerHTML;
  };
  proto.renderExerciseRankModal=function(id){
    const template=document.createElement('template');template.innerHTML=old.renderExerciseRankModal.call(this,id);
    const item=this.metrics?.exerciseRanks?.find(lift=>lift.exerciseId===id);
    if(item){const detail=window.EVORANK_X2_RANKS.scoreDetails(item,item.bodyweightKg||this.state.profile.bodyweightKg,this.state.profile);
      if(detail.strength)template.content.querySelector('.rfx2-load-info')?.insertAdjacentHTML('afterend',ageHelp(this,detail));}
    return template.innerHTML;
  };
  function plans(app) {
    window.RANKFORGE1000.ensure(app);const plan=app.state.trainingPlanV10;
    const rows=plan.enabled?plan.generatedPlan||[]:[],swim=app.state.garmin?.nextPlan;
    return `${app.modalHeader('DEIN PERSÖNLICHES TRAINING','Meine Pläne')}<div class="modal-scroll rfx47-plans"><section><h3>Wochenplan</h3><p>${rows.length?`${rows.length} Einheiten · ${rows.reduce((n,item)=>n+(Number(item.durationMinutes)||0),0)} Min. pro Woche`:'Noch kein aktiver Wochenplan.'}</p>${rows.length?`<ol class="rfx47-plan-list">${[...rows].sort((a,b)=>(a.day+6)%7-(b.day+6)%7).map(item=>`<li><details><summary><span>${esc(days[item.day])}</span><strong>${esc(item.title)}</strong><small>${Number(item.durationMinutes)||0} Min.</small></summary><p>${esc(item.detail)}</p></details></li>`).join('')}</ol>`:''}<div class="rfx47-actions"><button class="button button--primary" data-action="x47-plan-edit">${icon('settings',16)} ${rows.length?'Plan bearbeiten':'Plan erstellen'}</button>${rows.length?`<button class="button button--danger" data-action="x47-delete-week-plan">${icon('trash',16)} Plan löschen</button>`:''}</div></section><section><h3>Schwimmplan</h3><p>${swim?`${Math.round(swim.targetDistanceMeters||0)} m · ${esc(swim.focusLabel||'Nächste Einheit')}`:'Kein Schwimmplan gespeichert.'}</p><div class="rfx47-actions"><button class="button button--secondary" data-action="rf82-open-garmin">${swim?'Plan öffnen':'Schwimmen planen'}</button>${swim?`<button class="button button--danger" data-action="x47-delete-swim-plan">${icon('trash',16)} Plan löschen</button>`:''}</div></section><p>Aufgezeichnete Trainings bleiben beim Löschen eines Plans erhalten.</p></div>`;
  }
  function deletePlan(app,kind) {
    if(kind==='week'){
      window.RANKFORGE1000.ensure(app);
      Object.assign(app.state.trainingPlanV10,{enabled:false,setupComplete:true,generatedPlan:[],generatedAt:'',deletedAt:new Date().toISOString()});
      app.ui.rf1000Wizard=null;
    }else if(kind==='swim'){
      app.state.garmin||={activities:[]};
      Object.assign(app.state.garmin,{nextPlan:null,planDismissed:true,planDeletedAt:new Date().toISOString()});
    }else return false;
    app.scheduleSave();return true;
  }
  const fingerprint=(app,kind)=>JSON.stringify(kind==='week'?app.state.trainingPlanV10:app.state.garmin?.nextPlan);
  proto.renderModal=function(...args){
    if(this.ui.modal?.type==='x47-plans')return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${plans(this)}</section></div>`;
    return old.renderModal.apply(this,args);
  };
  proto.renderProfile=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderProfile.apply(this,args);
    const entries=[...template.content.querySelectorAll('[data-action="rf1000-plan-edit"]')],entry=entries.shift();
    entries.forEach(node=>node.remove());
    if(entry){entry.querySelector('strong').textContent='Meine Pläne';entry.querySelector('small').textContent='Wochenplan und Schwimmplan verwalten';
      const target=template.content.querySelector('[data-action="x45-connections"]')?.closest('.rf880-profile-group__body');
      if(target){target.append(entry);const count=target.parentElement.querySelector('summary>b');if(count)count.textContent=target.children.length;}}
    return template.innerHTML;
  };
  proto.handleClick=async function(event){
    const element=event.target?.closest?.('[data-action]'),action=element?.dataset.action;
    if(action==='rf1000-plan-edit'){event.preventDefault();this.openModal('x47-plans');return;}
    if(action==='x47-plan-edit'){
      event.preventDefault();this.ui.modal=null;
      const proxy=document.createElement('button');proxy.dataset.action='rf1000-plan-edit';
      return old.handleClick.call(this,{target:proxy,preventDefault(){}});
    }
    if(action==='x47-plan-cancel'){
      event.preventDefault();const origin=this.ui.rf1000Wizard?.origin;
      this.ui.rf1000Wizard=null;this.ui.view=origin&&origin!=='onboarding'?origin:'home';this.render();return;
    }
    if(['x47-delete-week-plan','x47-delete-swim-plan'].includes(action)){
      event.preventDefault();const kind=action==='x47-delete-week-plan'?'week':'swim';
      this.openModal('confirm',{title:kind==='week'?'Wochenplan löschen?':'Schwimmplan löschen?',message:'Der Plan wird entfernt. Deine aufgezeichneten Trainings bleiben erhalten. Du kannst später einen neuen Plan erstellen.',confirmLabel:'Plan löschen',confirmAction:'x47-delete-plan-confirm',x47Kind:kind,x47Account:this.accountKey,x47Fingerprint:fingerprint(this,kind)});return;
    }
    if(action==='x47-delete-plan-confirm'){
      event.preventDefault();const modal=this.ui.modal;
      if(modal?.confirmAction!=='x47-delete-plan-confirm'||modal.x47Account!==this.accountKey||modal.x47Fingerprint!==fingerprint(this,modal.x47Kind)){
        this.showToast('Der Plan wurde inzwischen geändert. Bitte erneut öffnen.');this.openModal('x47-plans');return;
      }
      deletePlan(this,modal.x47Kind);this.openModal('x47-plans');this.showToast('Plan gelöscht');return;
    }
    return old.handleClick.call(this,event);
  };
  function resume(){
    const app=window.RANKFORGE_APP;if(document.hidden||!app)return;
    if(refreshAge(app)&&!app.state.draft&&!app.ui.modal&&!app.ui.rf1000Wizard&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName||''))app.render();
  }
  proto.init=async function(...args){const result=await old.init.apply(this,args);refreshAge(this);return result;};
  document.addEventListener('visibilitychange',resume);window.addEventListener('focus',resume);window.addEventListener('pageshow',resume);
  window.setInterval(resume,60000);
  window.EVORANK_X47=Object.freeze({deletePlan,refreshAge,plans,ageCopy});
})();
