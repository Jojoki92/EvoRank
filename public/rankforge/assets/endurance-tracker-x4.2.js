/* Local endurance recorder. Coordinates stay only in active working memory;
 * only the completed duration/distance enter the existing training history. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype;
  const old={renderHome:proto.renderHome,render:proto.render,renderModal:proto.renderModal,handleClick:proto.handleClick,handleSubmit:proto.handleSubmit};
  const names={run:'Laufen',bike:'Radfahren',swim:'Schwimmen'};
  const finite=value=>Number.isFinite(Number(value))?Number(value):0;
  const positive=value=>Math.max(0,finite(value));
  const keyFor=app=>'evorank-tracker-x42:'+String(app.accountKey||'rankforge-local');
  const elapsed=(record,now=Date.now())=>Math.max(0,positive(record?.elapsedMs)+(record?.status==='running'?Math.max(0,now-positive(record.segmentStartedAt)):0));
  function clock(ms) {const seconds=Math.floor(ms/1000);return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');}
  function readTracker(app) {
    const key=keyFor(app);
    if(app._x42TrackerKey===key)return app._x42Tracker||null;
    stopSensors(app);app._x42TrackerKey=key;app._x42Tracker=null;
    try {
      const record=JSON.parse(localStorage.getItem(key)||'null');
      if(record&&names[record.sport]&&record.id&&['running','paused'].includes(record.status)) {
        if(record.status==='running'){record.elapsedMs=elapsed(record);record.status='paused';record.segmentStartedAt=null;record.recovered=true;record.gpsGap=record.mode==='gps';}
        record.lastPoint=null;record.distanceMeters=positive(record.distanceMeters);
        app._x42Tracker=record;
        // Also remove a coordinate left in an older-version draft on recovery.
        try { localStorage.setItem(key,JSON.stringify(record)); }
        catch { record.storageError=true; }
      }
    } catch { /* An unreadable active draft does not affect saved workouts. */ }
    return app._x42Tracker;
  }
  function persistTracker(app) {
    const record=readTracker(app);if(!record)return;
    // The live coordinate is needed only in memory; drafts retain distance/time.
    try { localStorage.setItem(keyFor(app),JSON.stringify({...record,lastPoint:null}));record.storageError=false; }
    catch { record.storageError=true; }
  }
  function haversine(a,b) {
    const rad=Math.PI/180,dLat=(b.latitude-a.latitude)*rad,dLon=(b.longitude-a.longitude)*rad;
    const q=Math.sin(dLat/2)**2+Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin(dLon/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(Math.min(1,q)),Math.sqrt(Math.max(0,1-q)));
  }
  function acceptPosition(record,position,now=Date.now()) {
    if(record?.status!=='running'||record.mode!=='gps')return false;
    const c=position?.coords||{},point={latitude:Number(c.latitude),longitude:Number(c.longitude),accuracy:Number(c.accuracy),timestamp:Number(position?.timestamp)};
    if(Number.isFinite(point.accuracy)&&point.accuracy>50){record.gpsStatus='GPS noch zu ungenau (±'+Math.round(point.accuracy)+' m). Bitte im Freien warten.';return false;}
    if(!Object.values(point).every(Number.isFinite)||Math.abs(point.latitude)>90||Math.abs(point.longitude)>180||point.accuracy<0||point.accuracy>50||Math.abs(now-point.timestamp)>15000)return false;
    const previous=record.lastPoint;
    record.gpsStatus=`GPS ±${Math.round(point.accuracy)} m`;
    if(!previous){record.lastPoint=point;return true;}
    const seconds=(point.timestamp-previous.timestamp)/1000;
    if(seconds<=0)return false;
    if(seconds>30){record.lastPoint=point;record.gpsGap=true;return true;}
    const meters=haversine(previous,point);
    if(meters/seconds>(record.sport==='run'?12:45)){record.gpsStatus='GPS-Sprung verworfen';return false;}
    // Do not add stationary GPS jitter; accumulate movement from the last
    // accepted anchor, rather than repeatedly rounding every small step away.
    if(meters<Math.max(3,Math.min(12,(previous.accuracy+point.accuracy)/2)))return false;
    record.distanceMeters=positive(record.distanceMeters)+meters;record.lastPoint=point;
    return true;
  }
  function stopSensors(app) {
    if(app._x42Watch!=null){navigator.geolocation?.clearWatch(app._x42Watch);app._x42Watch=null;}
    if(app._x42Tick!=null){clearInterval(app._x42Tick);app._x42Tick=null;}
    app._x42Wake?.release?.().catch?.(()=>{});app._x42Wake=null;
  }
  async function wake(app,record) {
    if(!navigator.wakeLock||document.hidden)return;
    try {const lock=await navigator.wakeLock.request('screen');if(readTracker(app)!==record||record.status!=='running'){await lock.release();return;}app._x42Wake=lock;}catch { /* Timer remains usable without a wake lock. */ }
  }
  function updateNumbers(app) {
    const record=readTracker(app);if(!record)return;
    document.querySelectorAll('[data-x42-elapsed]').forEach(el=>{el.textContent=clock(elapsed(record));});
    document.querySelectorAll('[data-x42-distance]').forEach(el=>{el.textContent=record.sport==='swim'?`${Math.round(record.distanceMeters)} m`:`${(record.distanceMeters/1000).toLocaleString('de',{maximumFractionDigits:2})} km`;});
    document.querySelectorAll('[data-x42-gps-status]').forEach(el=>{el.textContent=record.gpsStatus||'';});
  }
  function startSensors(app) {
    const record=readTracker(app);if(!record||record.status!=='running')return;
    stopSensors(app);wake(app,record);
    let savedAt=Date.now();
    app._x42Tick=setInterval(()=>{if(readTracker(app)!==record||record.status!=='running'){stopSensors(app);return;}updateNumbers(app);if(Date.now()-savedAt>=10000){persistTracker(app);savedAt=Date.now();}},1000);
    if(record.mode!=='gps')return;
    if(!navigator.geolocation||window.isSecureContext===false){record.gpsStatus='GPS nicht verfügbar. Distanz beim Speichern ergänzen.';return;}
    record.gpsStatus='GPS-Position wird gesucht …';
    const accountKey=keyFor(app);
    try {
      app._x42Watch=navigator.geolocation.watchPosition(position=>{
        if(keyFor(app)!==accountKey||readTracker(app)!==record||record.status!=='running')return;
        if(document.hidden){record.lastPoint=null;record.gpsGap=true;return;}
        if(acceptPosition(record,position))persistTracker(app);
        updateNumbers(app);
      },error=>{
        if(readTracker(app)!==record)return;
        record.gpsGap=true;record.lastPoint=null;
        record.gpsStatus=error.code===1?'Standort nicht freigegeben. Timer läuft; Distanz später ergänzen.':'GPS unterbrochen. Timer läuft; Distanz vor dem Speichern prüfen.';
        persistTracker(app);updateNumbers(app);
      },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
    } catch {record.gpsGap=true;record.gpsStatus='GPS konnte nicht starten. Distanz später ergänzen.';}
  }
  function start(app,{sport,mode,poolLength=25},now=Date.now()) {
    if(readTracker(app)||!names[sport])return false;
    mode=sport==='swim'?'pool':mode==='gps'?'gps':'timer';
    const record={id:'tri-live-'+(window.crypto?.randomUUID?.()||`${now}-${Math.random().toString(36).slice(2)}`),sport,mode,status:'running',startedAt:new Date(now).toISOString(),segmentStartedAt:now,elapsedMs:0,distanceMeters:0,laps:0,poolLength:Math.min(100,Math.max(5,finite(poolLength)||25)),bodyProfile:app.state.profile?.bodyProfile||'male',...window.EVORANK_ENDURANCE_X48?.fields({bodyweightKg:app.state.profile?.bodyweightKg}),lastPoint:null};
    app._x42Tracker=record;app._x42TrackerKey=keyFor(app);persistTracker(app);startSensors(app);
    app.ui.view='triathlon';app.ui.rf970Sport=sport;app.render();return true;
  }
  function pause(app,now=Date.now()) {
    const record=readTracker(app);if(!record||record.status!=='running')return false;
    record.elapsedMs=elapsed(record,now);record.segmentStartedAt=null;record.status='paused';record.lastPoint=null;
    stopSensors(app);persistTracker(app);return true;
  }
  function resume(app,now=Date.now()) {
    const record=readTracker(app);if(!record||record.status!=='paused')return false;
    record.status='running';record.segmentStartedAt=now;record.lastPoint=null;
    persistTracker(app);startSensors(app);return true;
  }
  async function save(app,fields) {
    const record=readTracker(app);if(!record||app._x42Saving)return false;
    const distanceMeters=Math.round(positive(fields.distanceMeters)),durationSeconds=Math.round(positive(fields.durationSeconds));
    if(!(distanceMeters>0&&durationSeconds>0&&durationSeconds<=259200))return false;
    pause(app);window.RANKFORGE970.ensure(app);const key=keyFor(app);
    const performanceFields=window.EVORANK_ENDURANCE_X48.fields({bodyweightKg:record.bodyweightKg,...fields});
    const previous=app.state.triathlon.activities.find(item=>item.id===record.id);
    if(!previous) {
      app.state.triathlon.activities.push({id:record.id,sport:record.sport,date:record.startedAt,endedAt:new Date().toISOString(),distanceMeters:Math.round(distanceMeters),durationSeconds:Math.round(durationSeconds),effort:Math.min(10,Math.max(1,finite(fields.effort)||6)),bodyProfile:record.bodyProfile,...performanceFields,source:record.mode==='gps'?'gps':record.mode==='pool'?'pool':'timer',gpsGap:Boolean(record.gpsGap),recordedDistanceMeters:Math.round(record.distanceMeters),distanceEdited:Math.abs(distanceMeters-record.distanceMeters)>1,poolLength:record.mode==='pool'?record.poolLength:undefined,laps:record.mode==='pool'?record.laps:undefined});
    } else {
      // This ID still belongs to the unsaved recording. A corrected retry may
      // clear previously entered power/weight as well as replace it.
      delete previous.averagePowerWatts;delete previous.powerSource;delete previous.bodyweightKg;
      Object.assign(previous,{distanceMeters,durationSeconds,...performanceFields,effort:Math.min(10,Math.max(1,finite(fields.effort)||6)),distanceEdited:Math.abs(distanceMeters-record.distanceMeters)>1});
    }
    app._x42Saving=true;
    try {
      if(typeof app.persist!=='function')throw new Error('Storage unavailable');
      const result=await app.persist();
      if(result===false)throw new Error('Storage failed');
      if(key!==keyFor(app))return false;
      try {localStorage.removeItem(key);}catch { /* ID-based insertion prevents duplicate activities after a retry. */ }
      app._x42Tracker=null;stopSensors(app);app.ui.modal=null;app.render();app.showToast?.('Einheit gespeichert');return true;
    } catch {app._x42SaveFailed=true;app.showToast?.('Speichern fehlgeschlagen. Die Aufnahme bleibt erhalten.');return false;}
    finally {app._x42Saving=false;}
  }
  function card(app) {
    const record=readTracker(app),sport=app.ui.rf970Sport||'swim';
    if(record&&record.sport!==sport)return `<section class="rfx42-tracker"><strong>${names[record.sport]} ${record.status==='running'?'läuft':'pausiert'}</strong><button class="button button--primary" data-action="x42-tracker-open">Zur Aufnahme</button></section>`;
    if(!record)return `<section class="rfx42-tracker"><header><div><small>DEINE EINHEIT</small><h2>Jetzt aufnehmen</h2></div>${icon('timer',24)}</header><form data-form="x42-tracker-start" data-sport="${sport}">${sport==='swim'?'<label>Beckenlänge (m)<input name="poolLength" type="number" min="5" max="100" step="0.5" value="25" required inputmode="decimal"></label><p>Eine Bahn zählt von einem Beckenende zum anderen. Bahnen antippen oder die Distanz am Ende ergänzen.</p>':'<label>Aufzeichnung<select name="mode"><option value="gps">Timer + GPS-Distanz</option><option value="timer">Nur Timer · Distanz später eintragen</option></select></label><p>Beim Start Standortzugriff erlauben und im Freien auf die GPS-Anzeige warten. Die App geöffnet und den Bildschirm an lassen; beim Sperren oder Wechseln zu einer anderen App können Strecken fehlen.</p>'}<button class="button button--primary button--wide" type="submit">${icon('play',18)} ${names[sport]} starten</button></form><button class="button button--secondary button--wide" data-action="rf970-add">Vergangene Einheit eintragen</button></section>`;
    return `<section class="rfx42-tracker is-recording"><header><div><small>${record.status==='running'?'AUFNAHME LÄUFT':'PAUSIERT'}</small><h2>${names[record.sport]}</h2></div><span class="rfx42-record-dot ${record.status==='paused'?'is-paused':''}"></span></header><div class="rfx42-tracker-values"><strong data-x42-elapsed aria-live="off">${clock(elapsed(record))}</strong><span data-x42-distance>${sport==='swim'?Math.round(record.distanceMeters)+' m':(record.distanceMeters/1000).toLocaleString('de',{maximumFractionDigits:2})+' km'}</span></div>${record.mode==='gps'?`<p data-x42-gps-status role="status">${escapeHtml(record.gpsStatus||'')}</p>`:''}${record.gpsGap?'<p>Die GPS-Strecke hat eine Unterbrechung. Distanz beim Speichern prüfen.</p>':''}${record.recovered?'<p>Aufnahme nach dem Neuladen wiederhergestellt und pausiert. Zeit und Distanz vor dem Speichern prüfen.</p>':''}${record.storageError?'<p>Der Browser konnte die Aufnahme noch nicht sichern. Diese Seite bis zum Speichern geöffnet lassen.</p>':''}${sport==='swim'?`<div class="rfx42-laps"><button data-action="x42-lap-minus" aria-label="Eine Bahn abziehen" ${!record.laps?'disabled':''}>−</button><strong>${record.laps} Bahnen · ${record.poolLength} m</strong><button data-action="x42-lap-plus" aria-label="Eine Bahn hinzufügen">+</button></div>`:''}<div class="rfx42-tracker-actions"><button class="button button--secondary" data-action="${record.status==='running'?'x42-tracker-pause':'x42-tracker-resume'}">${record.status==='running'?'Pause':'Fortsetzen'}</button><button class="button button--primary" data-action="x42-tracker-finish">Beenden & speichern</button></div><button class="rfx42-discard" data-action="x42-tracker-discard">Aufnahme verwerfen</button></section>`;
  }
  function finishModal(app) {
    const record=readTracker(app);if(!record)return '';
    const seconds=Math.floor(elapsed(record)/1000),unit=record.sport==='swim'?'m':'km';
    return `${app.modalHeader('AUFNAHME',names[record.sport]+' speichern')}<form class="modal-form" data-form="x42-tracker-save"><div class="modal-scroll rfx42-tracker-summary"><p>Zeit und Distanz prüfen. Du kannst unvollständige GPS-Daten oder fehlende Bahnen hier korrigieren.</p><label>Distanz (${unit})<input name="distance" type="number" min="${unit==='m'?1:.001}" step="${unit==='m'?1:.001}" value="${unit==='m'?Math.round(record.distanceMeters):(record.distanceMeters/1000).toFixed(3)}" required inputmode="decimal"></label><div class="rfx42-tracker-actions"><label>Minuten<input name="minutes" type="number" min="0" max="4320" step="1" value="${Math.floor(seconds/60)}" required inputmode="numeric"></label><label>Sekunden<input name="seconds" type="number" min="0" max="59" step="1" value="${seconds%60}" required inputmode="numeric"></label></div>${record.sport==='bike'?window.EVORANK_ENDURANCE_X48.input(app,record.bodyweightKg??null):''}<label>Belastung · 1 locker bis 10 maximal<input name="effort" type="range" min="1" max="10" value="6"></label></div><footer class="modal-footer"><button class="button button--secondary" type="button" data-action="close-modal">Zurück</button><button class="button button--primary" type="submit">Einheit speichern</button></footer></form>`;
  }
  proto.renderHome=function(...args){const html=old.renderHome.apply(this,args);return this.ui.view==='triathlon'?html.replace('<section class="rf970-hero">',card(this)+'<section class="rf970-hero">'):html;};
  proto.render=function(...args){const result=old.render.apply(this,args),record=readTracker(this);if(record&&(this.ui.view!=='triathlon'||this.ui.rf970Sport!==record.sport)){document.getElementById('app')?.insertAdjacentHTML('beforeend',`<button class="rfx42-tracker-return" data-action="x42-tracker-open">${names[record.sport]} · <span data-x42-elapsed>${clock(elapsed(record))}</span> · ${record.status==='running'?'läuft':'pausiert'}</button>`);}return result;};
  proto.renderModal=function(...args){if(this.ui.modal?.type==='x42-tracker-finish')return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${finishModal(this)}</section></div>`;return old.renderModal.apply(this,args);};
  proto.handleClick=function(event) {
    const el=event.target.closest?.('[data-action]'),action=el?.dataset.action;
    if(!action?.startsWith('x42-tracker-')&&!action?.startsWith('x42-lap-'))return old.handleClick.call(this,event);
    event.preventDefault();const record=readTracker(this);if(!record)return;
    if(action==='x42-tracker-open'){this.ui.view='triathlon';this.ui.rf970Sport=record.sport;this.ui.modal=null;}
    if(action==='x42-tracker-pause')pause(this);
    if(action==='x42-tracker-resume')resume(this);
    if(action==='x42-lap-plus'&&record.mode==='pool'){record.laps++;record.distanceMeters=record.laps*record.poolLength;persistTracker(this);}
    if(action==='x42-lap-minus'&&record.mode==='pool'){record.laps=Math.max(0,record.laps-1);record.distanceMeters=record.laps*record.poolLength;persistTracker(this);}
    if(action==='x42-tracker-finish'){pause(this);this.openModal('x42-tracker-finish');return;}
    if(action==='x42-tracker-discard'){
      if(!window.confirm('Diese noch nicht gespeicherte Aufnahme verwerfen?'))return;
      stopSensors(this);try {localStorage.removeItem(keyFor(this));}catch{}this._x42Tracker=null;
    }
    this.render();
  };
  proto.handleSubmit=async function(event) {
    const form=event.target.closest?.('form[data-form]'),type=form?.dataset.form;
    if(!['x42-tracker-start','x42-tracker-save'].includes(type))return old.handleSubmit.call(this,event);
    event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);
    if(type==='x42-tracker-start'){start(this,{sport:form.dataset.sport,mode:data.get('mode'),poolLength:data.get('poolLength')});return;}
    const record=readTracker(this);if(!record)return;
    this._x42SaveFailed=false;
    const ok=await save(this,{distanceMeters:finite(data.get('distance'))*(record.sport==='swim'?1:1000),durationSeconds:finite(data.get('minutes'))*60+finite(data.get('seconds')),effort:data.get('effort'),...(record.sport==='bike'?window.EVORANK_ENDURANCE_X48.powerFields(data.get('enduranceBodyweightKg'),data.get('averagePowerWatts')):{})});
    if(!ok&&!this._x42Saving&&!this._x42SaveFailed)this.showToast?.('Bitte eine gültige Distanz und Dauer eingeben.');
  };
  document.addEventListener('visibilitychange',()=>{const app=window.RANKFORGE_APP;if(!app)return;const record=readTracker(app);if(record?.status!=='running')return;if(document.hidden){record.lastPoint=null;if(record.mode==='gps')record.gpsGap=true;persistTracker(app);}else{wake(app,record);updateNumbers(app);}});
  window.addEventListener('pagehide',()=>{const app=window.RANKFORGE_APP;if(app)persistTracker(app);});
  window.EVORANK_TRACKER_X42=Object.freeze({elapsed,haversine,acceptPosition,readTracker,start,pause,resume,save});
})();
