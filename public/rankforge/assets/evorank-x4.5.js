/* EvoRank X4.5: one personal training week, adjustable alarm and setup guidance. */
(() => {
  'use strict';
  const proto = LiftoffApp.prototype;
  const old = {renderHome:proto.renderHome,renderProfile:proto.renderProfile,renderModal:proto.renderModal,
    renderRestSettingsModal:proto.renderRestSettingsModal,renderV73RestSetup:proto.renderV73RestSetup,
    handleClick:proto.handleClick,handleInput:proto.handleInput,handleSubmit:proto.handleSubmit,
    saveRestSettings:proto.saveRestSettings,finishRestTimer:proto.finishRestTimer};
  const esc = escapeHtml;
  const sports = {strength:'Kraft',run:'Laufen',bike:'Radfahren',swim:'Schwimmen'};
  const volume = value => Number.isFinite(Number(value)) ? Math.min(1,Math.max(0,Number(value))) : .8;
  const localDay = value => { const d = new Date(value); return Number.isFinite(+d) ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : ''; };
  const nativeAlarm = () => window.EVORANK_NATIVE_CAPABILITIES?.alarm === true;

  function alarmControls(app) {
    const percent = Math.round(volume(app.state.settings.alarmVolume ?? .8)*100);
    return `<section class="rfx45-alarm"><label for="rfx45-volume">Signal-Lautstärke <output data-x45-volume-output>${percent} %</output></label><input id="rfx45-volume" name="alarmVolume" data-x45-volume type="range" min="0" max="100" step="5" value="${percent}"><div class="rfx45-range-labels"><span>Stumm</span><span>Kräftig</span></div><p>Die Medienlautstärke deines Handys bestimmt die maximale Lautstärke.</p><button type="button" class="button button--secondary" data-action="x45-alarm-test">${icon("volume",18)} Ton testen</button><details><summary>Ton im Hintergrund</summary><p>Für Mitteilungstöne bei gesperrtem iPhone gilt die iOS-Lautstärke.</p><p>In Safari und der Home-Bildschirm-Web-App kann der Timer im Hintergrund angehalten werden. TikTok oder Musik lassen sich damit nicht zuverlässig unterbrechen. Die native iPhone-App kann die Musik für das Signal unterbrechen und danach zur Fortsetzung freigeben. Ob sie weiterläuft, entscheidet die Musik-App.</p><p>Native App: Mitteilungen und Töne für EvoRank erlauben, Fokus/Stummmodus prüfen. Eine laufende Satzpause wird im Voraus als lokale Mitteilung geplant. Dafür muss EvoRank nicht im Vordergrund bleiben.</p></details></section>`;
  }
  function injectAlarm(html, app) {
    const template=document.createElement('template');template.innerHTML=html;
    const target=template.content.querySelector('.v73-signal-card,.modal-scroll,.modal-form');
    if(target&&!target.querySelector('.rfx45-alarm'))target.insertAdjacentHTML('beforeend',alarmControls(app));
    template.content.querySelector('[data-action="v73-test-alarm"]')?.remove();
    return template.innerHTML;
  }
  proto.renderRestSettingsModal=function(...args){return injectAlarm(old.renderRestSettingsModal.apply(this,args),this);};
  proto.renderV73RestSetup=function(...args){return injectAlarm(old.renderV73RestSetup.apply(this,args),this);};
  function saveVolume(app,form){const input=form?.querySelector('[data-x45-volume]');if(input)app.state.settings.alarmVolume=volume(Number(input.value)/100);}
  proto.saveRestSettings=function(form,...args){saveVolume(this,form);return old.saveRestSettings.call(this,form,...args);};
  proto.handleSubmit=function(event){const form=event.target?.closest?.('form[data-form="v73-workout-rest-setup"]');if(form)saveVolume(this,form);return old.handleSubmit.call(this,event);};
  proto.handleInput=function(event){if(event.target?.matches?.('[data-x45-volume]')){event.target.closest('.rfx45-alarm').querySelector('[data-x45-volume-output]').textContent=`${event.target.value} %`;return;}return old.handleInput.call(this,event);};

  proto.playTimerAlarm=async function(options={}) {
    const level=volume(options.volume ?? this.state.settings.alarmVolume ?? .8);
    const sound=options.sound ?? this.state.settings.sound;
    if(!sound||level===0)return false;
    if(nativeAlarm()&&this.postNativeTimer?.('alarm',{timerId:options.test?'':this.ui.x45FinishedTimerId||this.ui.restTimer?.id||'',sound:true,alarmVolume:level,interruptOtherAudio:this.state.settings.interruptMusicOnAlarm!==false}))return true;
    // One playback path, with a bounded fallback. Muting never calls older alarms.
    try {
      this.ensureTimerAudio();
      const context=this.audioContext;
      if(!context)throw new Error('web_audio_unavailable');
      if(context.state==='suspended')await context.resume();
      if(context.state!=='running')throw new Error('web_audio_suspended');
      this.ui.x45AlarmNodes?.forEach(node=>{try{node.stop();}catch{}});
      const master=context.createGain();master.gain.value=level*.7;master.connect(context.destination);
      const now=context.currentTime+.02,nodes=[];
      [[880,0,.22],[1175,.25,.25],[1480,.55,.4],[1175,1,.45]].forEach(([frequency,offset,duration])=>{
        const oscillator=context.createOscillator(),gain=context.createGain();
        oscillator.type='sine';oscillator.frequency.value=frequency;
        gain.gain.setValueAtTime(.0001,now+offset);gain.gain.exponentialRampToValueAtTime(.65,now+offset+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+offset+duration);
        oscillator.connect(gain).connect(master);oscillator.start(now+offset);oscillator.stop(now+offset+duration+.02);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};nodes.push(oscillator);
      });
      this.ui.x45AlarmNodes=nodes;
      setTimeout(()=>{master.disconnect();if(this.ui.x45AlarmNodes===nodes)this.ui.x45AlarmNodes=null;},1800);
      return true;
    } catch {
      try {
        this.ui.x45AlarmAudio?.pause();
        const audio=new Audio('./assets/evorank-alarm-x4.5.wav');audio.volume=level;
        this.ui.x45AlarmAudio=audio;await audio.play();return true;
      } catch {return false;}
    }
  };
  proto.finishRestTimer=function(...args){this.ui.x45FinishedTimerId=this.ui.restTimer?.id||'';return old.finishRestTimer.apply(this,args);};

  function week(app, now=new Date()) {
    const monday=new Date(now);monday.setHours(12,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
    const entries=window.RANKFORGE1000?.calendarEntries(app)||[];
    const plan=app.state.trainingPlanV10?.enabled?app.state.trainingPlanV10.generatedPlan||[]:[];
    return Array.from({length:7},(_,index)=>{
      const date=new Date(monday);date.setDate(date.getDate()+index);const key=localDay(date);
      const done=entries.filter(entry=>entry.date===key);
      const used=new Set();
      const planned=plan.filter(item=>item.day===date.getDay()).map(item=>{
        const match=done.findIndex((entry,i)=>!used.has(i)&&entry.sport===item.sport);
        if(match>=0)used.add(match);
        return {...item,matched:match>=0};
      });
      return {date,key,today:key===localDay(now),done,planned,extra:done.filter((_,i)=>!used.has(i))};
    });
  }
  function renderWeek(app) {
    const days=week(app),done=days.reduce((n,day)=>n+day.done.length,0),planned=days.reduce((n,day)=>n+day.planned.length,0),matched=days.reduce((n,day)=>n+day.planned.filter(item=>item.matched).length,0);
    const minutes=Math.round(days.reduce((n,day)=>n+day.done.reduce((sum,item)=>sum+Math.max(0,item.durationSeconds||0),0),0)/60);
    return `<section class="rfx45-week"><header class="section-heading"><div><small>DEIN PERSÖNLICHES TRAINING</small><h2>Deine Trainingswoche</h2><p>${planned?`${matched} von ${planned} geplanten Einheiten erfüllt · `:''}${done} aufgezeichnet · ${minutes} Min.</p></div><button class="button button--secondary rfx45-compact" data-action="rf1000-plan-edit">${icon("settings",16)} ${planned?'Plan verwalten':'Plan erstellen'}</button></header><div class="rfx45-week-days">${days.map(day=>`<article class="${day.today?'is-today':''} ${!day.planned.length&&!day.done.length?'is-free':''}"><button class="rfx45-day" data-action="rf1000-calendar-day" data-day="${day.key}"><strong>${new Intl.DateTimeFormat('de',{weekday:'short'}).format(day.date)}</strong><span>${day.date.getDate()}.${day.date.getMonth()+1}.</span></button><div>${day.planned.map(item=>`<div class="rfx45-plan-item"><span class="rfx45-session-icon ${item.matched?'is-done':''}" aria-hidden="true">${icon(item.matched?"check":"timer",16)}</span><div><strong>${esc(item.title)}</strong><small>${item.matched?'Aufgezeichnet':`${item.durationMinutes} Min. geplant`}</small></div>${!item.matched?`<button class="button button--primary rfx45-compact" data-action="x45-plan-start" data-sport="${item.sport}" data-title="${escapeAttr(item.title)}">Starten</button>`:''}</div>`).join('')}${day.extra.map(item=>`<div class="rfx45-plan-item"><span class="rfx45-session-icon is-done" aria-hidden="true">${icon("check",16)}</span><div><strong>${esc(item.title)}</strong><small>${Math.round((item.durationSeconds||0)/60)} Min. · ${esc(item.source==='strava'?'Strava':item.source==='garmin'?'Garmin':'aufgezeichnet')}</small></div></div>`).join('')}${!day.planned.length&&!day.done.length?'<span class="rfx45-free-day">Erholung / frei</span>':''}</div></article>`).join('')}</div><footer><button class="button button--secondary rfx45-compact" data-action="rf1000-calendar">${icon("calendar",16)} Kalender</button><button class="button button--secondary rfx45-compact" data-action="x45-connections">${icon("refresh",16)} Strava & Garmin</button></footer><details><summary>So wird dein Plan abgehakt</summary><p>Eine aufgezeichnete Aktivität derselben Sportart am selben Tag erfüllt einen Planpunkt. Dauer und Intensität werden nicht als gleichwertig vorausgesetzt. Zusätzliche Aktivitäten bleiben sichtbar.</p></details></section>`;
  }
  proto.renderHome=function(...args){
    const html=old.renderHome.apply(this,args);
    if(['calendar','sports','triathlon'].includes(this.ui.view))return html;
    const template=document.createElement('template');template.innerHTML=html;
    const marker=template.content.querySelector('.rf1000-plan-card,.rf1000-plan-empty,.week-section');
    if(marker){marker.insertAdjacentHTML('beforebegin',renderWeek(this));template.content.querySelectorAll('.rf1000-plan-card,.rf1000-plan-empty,.week-section').forEach(node=>node.remove());}
    return template.innerHTML;
  };

  function help(app){return `${app.modalHeader('SO FUNKTIONIERT EVORANK','Punkte, Freunde & iPhone')}<div class="modal-scroll rfx45-help"><details open><summary>Muskelpunkte</summary><p>Dein bester Muskelbeitrag zählt zu 70 %, die bis zu drei weiteren besten Beiträge zusammen zu 30 %. Gibt es nur einen, zählt er vollständig. Ein Nebenmuskel erhält vorher wie bisher 58 % des Übungsscores. Das sind App-Gewichte, keine Messung der Muskelkraft.</p><p>Beispiel mit bereits berechneten Übungspunkten: Dips 480 Punkte + Kabelübung 300 Punkte ergeben 426 statt 398 Muskelpunkte. Die Dips bleiben selbst bei 480 Punkten. Alte Workouts, XP und Belohnungen bleiben erhalten.</p></details><details><summary>Freunde und Aktualisierung</summary><p>Ihr meldet euch beide an derselben EvoRank-Website an und vergebt je einen Spitznamen. Unter „Freunde suchen und verwalten“ suchst du Felix’ Spitznamen und sendest eine Anfrage. Felix nimmt sie unter „Anfragen“ an.</p><p>Die Liste lädt beim Öffnen und Zurückkehren sowie alle 30 Sekunden, solange EvoRank sichtbar und online ist. Der Stand eines Freundes ändert sich erst, wenn dessen App seine neuen Daten synchronisiert hat.</p><button class="button button--secondary" data-action="rf93-friends-open">Freunde öffnen</button></details><details><summary>Bestenlisten</summary><p>Die Freundesliste zeigt bestätigte Freunde. Die öffentliche Bestenliste ist eine separate Freigabe unter „Sicherheit, Cloud & Support“. Ohne Anmeldung, eingerichteten Server und Freigabe wird dein Profil dort nicht veröffentlicht.</p><p>Kraft und Ausdauersportarten haben eigene Rangmodelle. Die Werte beruhen auf eingetragenen Leistungen und sind keine verifizierten Wettkampfergebnisse. Strava-Importe dieser Version bleiben in deiner persönlichen Trainingswoche.</p><button class="button button--secondary" data-action="rf110-open-production">Freigaben öffnen</button></details><details><summary>Dynamic Island & Widget</summary><p>Die Home-Bildschirm-Web-App ist noch kein iOS-Widget. Dafür liegt der native Swift-Code im Projekt bei. Er muss mit Xcode auf einem Mac gebaut, signiert und auf deinem iPhone installiert werden.</p><p>Danach: Home-Bildschirm lange drücken → Bearbeiten → Widget hinzufügen → EvoRank. Live-Aktivitäten für EvoRank in den iPhone-Einstellungen erlauben. Eine gestartete Satzpause erscheint auf Sperrbildschirm und unterstützter Dynamic Island.</p></details><p><a href="./hilfe-x4.5.html" target="_blank" rel="noopener">Ausführliche Einrichtung und Grenzen</a></p></div>`;}
  function connections(app){const connection=app.state.stravaV45?.connection||{};return `${app.modalHeader('DEINE TRAININGSWOCHE','Strava & Garmin')}<div class="modal-scroll rfx45-help"><section><h3>Strava</h3><p>${connection.connected?'Verbunden. Importierte Aktivitäten erscheinen in deiner persönlichen Woche.':'Verbinde dein Konto, um die letzten 90 Tage in deine persönliche Woche zu übernehmen.'}</p><button class="button button--primary" data-action="${connection.connected?'x45-strava-sync':'x45-strava-connect'}">${connection.connected?'Jetzt aktualisieren':'Mit Strava verbinden'}</button>${connection.connected?'<button class="button button--secondary" data-action="x45-strava-disconnect">Verbindung trennen</button>':''}<p data-x45-connection-status role="status">${esc(app.ui.x45ConnectionMessage||'Die Online-Verbindung benötigt eine eingerichtete Strava-App auf deinem EvoRank-Server.')}</p></section><section><h3>Garmin</h3><p>Die bestehende Garmin-Anbindung übernimmt freigegebene Aktivitäten. Ohne API-Freigabe kannst du TCX-, GPX- oder JSON-Dateien lokal importieren.</p><div class="rfx45-actions">${['run','bike','swim'].map(sport=>`<button class="button button--secondary rfx45-compact" data-action="rf970-open-garmin" data-sport="${sport}">${sports[sport]}</button>`).join('')}</div></section><p>Für dieselbe Aktivität nur eine Quelle verwenden, wenn Garmin sie auch an Strava weitergibt. Der Strava-Abruf benötigt deine Freigabe; es werden nur Aktivitäten gelesen.</p></div>`;}
  proto.renderProfile=function(...args){
    const template=document.createElement('template');template.innerHTML=old.renderProfile.apply(this,args);
    const groups=[...template.content.querySelectorAll('.rf880-profile-group__body')];
    const insert=(anchor,action,title,description,glyph)=>{
      const target=template.content.querySelector(`[data-action="${anchor}"]`)?.closest('.rf880-profile-group__body')||template.content.querySelector('.settings-list')||groups.at(-1);
      target?.insertAdjacentHTML('afterbegin',`<button data-action="${action}"><span>${icon(glyph,20)}</span><div><strong>${title}</strong><small>${description}</small></div>${icon("chevronRight",18)}</button>`);
      const count=target?.parentElement.querySelector('summary>b');
      if(count)count.textContent=target.children.length;
    };
    insert('rf80-open-support','x45-help','Punkte, Freunde & iPhone','Einrichtung, Musik, Widgets und Bestenlisten','info');
    insert('v7-open-health','x45-connections','Strava & Garmin','Mit deiner Trainingswoche verbinden','refresh');
    return template.innerHTML;
  };
  proto.renderModal=function(...args){const type=this.ui.modal?.type;if(['x45-help','x45-connections'].includes(type))return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${type==='x45-help'?help(this):connections(this)}</section></div>`;return old.renderModal.apply(this,args);};
  proto.handleClick=async function(event){
    const element=event.target?.closest?.('[data-action]'),action=element?.dataset.action;
    if(action==='x45-alarm-test'){
      event.preventDefault();const form=element.closest('form');const selected=Number(form?.querySelector('[data-x45-volume]')?.value??80)/100;
      const sound=form?.querySelector('[name="sound"]')?.checked??this.state.settings.sound;
      const played=await this.playTimerAlarm({volume:selected,sound,test:true});
      this.showToast(!sound||selected===0?'Ton ist ausgeschaltet':played?'Testton gestartet':'Ton blockiert: Medienlautstärke und Browserfreigabe prüfen');return;
    }
    if(action==='x45-help'||action==='x45-connections'){event.preventDefault();this.openModal(action);if(action==='x45-connections')window.EVORANK_STRAVA_X45?.status(this);return;}
    if(action?.startsWith('x45-strava-')){event.preventDefault();return window.EVORANK_STRAVA_X45?.action(this,action.slice(11));}
    if(action==='x45-plan-start'){
      event.preventDefault();const sport=element.dataset.sport;
      if(sport==='strength'){
        this.ui.modal=null;const name=element.dataset.title.toLocaleLowerCase();const routine=this.state.routines.find(item=>item.name?.toLocaleLowerCase()===name);
        if(routine)this.startRoutine(routine.id);else{this.openModal('routine-picker');this.showToast('Wähle deine passende Vorlage oder starte ein leeres Workout');}
      }else if(sports[sport]){this.ui.rf970Sport=sport;this.ui.view='triathlon';this.ui.modal=null;this.render();}
      return;
    }
    if(action==='rf970-open-garmin'&&sports[element.dataset.sport])this.ui.rf970Sport=element.dataset.sport;
    return old.handleClick.call(this,event);
  };
  window.EVORANK_X45=Object.freeze({week,volume,localDay,renderWeek});
})();
