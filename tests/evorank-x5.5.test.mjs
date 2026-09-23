import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {appEnv} from './helpers/x2-app-env.mjs';

function setup(){
 const env=appEnv(),{w,api}=env,app=new api.LiftoffApp();
 app.accountKey='x55-synthetic';app.state=api.normalizeState(api.initialState(app.accountKey),app.accountKey);
 app.state.onboardingComplete=true;app.state.health={authorization:'unknown'};app.state.profile.bodyweightKg=70;app.state.profile.birthDate='2000-01-01';
 app.state.triathlon={activities:[]};app.scheduleSave=()=>{};w.RANKFORGE_APP=app;app.render();return {...env,app};
}
function click(app,w,el){return app.handleClick({target:el,preventDefault(){},stopPropagation(){}});}
async function close(dom){await new Promise(resolve=>setImmediate(resolve));dom.window.close();}

test('touch click on an actual SVG path selects and clears without replacing the figure or history',async()=>{
 const {dom,w,app}=setup();try{
  const history=JSON.stringify(app.state.workouts);
  for(const bodyProfile of ['male','female'])for(const surface of ['home','ranks']){
   app.state.profile.bodyProfile=bodyProfile;app.ui.view=surface;app.ui.rankTab='bodygraph';app.ui.x53RankSport='strength';app.ui.selectedMuscle=null;app.render();
   const region=w.document.querySelector('.muscle-region--core'),svg=region.ownerSVGElement,path=region.querySelector('[data-action="select-muscle"]')||region.querySelector('path');
   assert.ok(path);await click(app,w,path);assert.equal(app.ui[surface==='home'?'rf108HomeSelectedMuscle':'rf108RankSelectedMuscle'],'core');
   assert.equal(w.document.querySelector('.muscle-region--core').ownerSVGElement,svg);assert.equal(region.getAttribute('aria-pressed'),'true');
   await click(app,w,path);assert.equal(region.getAttribute('aria-pressed'),'false');
  }
  assert.equal(JSON.stringify(app.state.workouts),history);
 }finally{await close(dom);}
});

test('all sports share the Plus chooser and a prominent start directly after the Home figure',async()=>{
 const {dom,w,app}=setup();try{
  for(const sport of ['strength','run','bike','swim']){
   const s=w.EVORANK_X51.settings(app);s.sports=['strength','run','bike','swim'];s.active=sport;w.EVORANK_X51.saveSettings(app,s);app.ui.view='home';app.ui.modal=null;app.render();
   await click(app,w,w.document.querySelector('.nav-create'));assert.equal(w.document.querySelectorAll('.x55-training [data-sport]').length,3);app.closeModal();
   if(sport!=='strength')assert.ok(w.document.querySelector('.x53-profile + .x55-sport-start [data-action="x53-record"]'));
  }
 }finally{await close(dom);}
});

test('introduction is optional, dismissible, repeatable and never grants consent or reopens on every render',async()=>{
 const {dom,w,app}=setup();try{
  assert.equal(w.document.querySelector('.x55-tour'),null);
  const consent=JSON.stringify(app.state.productionV110||null);app.state.settings.introX55Pending=true;app.render();assert.ok(w.document.querySelector('.x55-tour'));
  for(let n=0;n<4;n++)await click(app,w,w.document.querySelector('[data-action="x55-tour-next"]'));
  assert.match(w.document.querySelector('.x55-tour').textContent,/Freigaben/);app.closeModal();app.render();assert.equal(w.document.querySelector('.x55-tour'),null);
  app.openModal('x55-tour');assert.ok(w.document.querySelector('.x55-tour'));app.closeModal();assert.equal(JSON.stringify(app.state.productionV110||null),consent);
 }finally{await close(dom);}
});

test('local initialization finishes even when online profile lookup never resolves', {timeout:8000},async()=>{
 const {dom,w,api}=appEnv();try{
  w.RANKFORGE_ACCOUNT.status=()=>({signedIn:true,email:'synthetic@example.invalid',hasProfile:true});
  w.RANKFORGE_ACCOUNT.getProfile=()=>new Promise(()=>{});w.RANKFORGE_ACCOUNT.getAccessToken=()=>new Promise(()=>{});
  const app=new api.LiftoffApp();app.accountKey='x55-offline';await app.init();assert.ok(app.state);assert.ok(w.document.querySelector('#app').children.length);
 }finally{await close(dom);}
});

test('GPS rejects inaccurate positions, keeps only distance/time in storage and ranking has no height/weight bonus for running',async()=>{
 const {dom,w,app}=setup();try{
  let onPosition;Object.defineProperty(w.navigator,'geolocation',{value:{watchPosition(success){onPosition=success;return 1;},clearWatch(){}}});
  Object.defineProperty(w.document,'hidden',{value:false,configurable:true});
  const tracker=w.EVORANK_TRACKER_X42;tracker.start(app,{sport:'run',mode:'gps'});
  onPosition({timestamp:Date.now(),coords:{latitude:48.2,longitude:16.3,accuracy:180}});assert.match(tracker.readTracker(app).gpsStatus,/ungenau/);assert.equal(tracker.readTracker(app).distanceMeters,0);
  onPosition({timestamp:Date.now(),coords:{latitude:48.2,longitude:16.3,accuracy:5}});
  assert.ok(tracker.readTracker(app).lastPoint);assert.equal(JSON.parse(w.localStorage.getItem('evorank-tracker-x42:x55-synthetic')).lastPoint,null);
  tracker.pause(app);
  const storageKey='evorank-tracker-x42:x55-synthetic',legacy=JSON.parse(w.localStorage.getItem(storageKey));
  legacy.lastPoint={latitude:48.2,longitude:16.3,accuracy:5,timestamp:Date.now()};w.localStorage.setItem(storageKey,JSON.stringify(legacy));
  app._x42TrackerKey=null;tracker.readTracker(app);assert.equal(JSON.parse(w.localStorage.getItem(storageKey)).lastPoint,null);
  const activity={sport:'run',date:'2026-09-16',distanceMeters:10000,durationSeconds:3000};
  const original=w.RANKFORGE970.performanceDetails(activity,app.state.profile,new Date('2026-09-17'));
  app.state.profile.bodyweightKg=120;app.state.profile.heightCm=205;
  assert.equal(w.RANKFORGE970.performanceDetails(activity,app.state.profile,new Date('2026-09-17')).score,original.score);
  app.state.profile.birthDate='1960-01-01';assert.ok(w.RANKFORGE970.performanceDetails(activity,app.state.profile,new Date('2026-09-17')).context.ageFactor>original.context.ageFactor);
 }finally{await close(dom);}
});

function worker(network,cached){
 const handlers={},writes=[],deleted=[];
 const cache={put:async(key,value)=>writes.push(key),addAll:async()=>{}};
 vm.runInNewContext(readFileSync(new URL('../public/rankforge/service-worker.js',import.meta.url),'utf8'),{
  self:{registration:{scope:'https://example.invalid/app/'},location:{origin:'https://example.invalid'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(type,fn)=>handlers[type]=fn},URL,Response,
  fetch:network,caches:{open:async()=>cache,match:async()=>cached,keys:async()=>['evorank-old','another-app-cache'],delete:async key=>deleted.push(key)},
  setTimeout:fn=>setTimeout(fn,10),clearTimeout
 });
 const get=(path,mode='cors')=>{let response,wait;handlers.fetch({request:{method:'GET',url:'https://example.invalid'+path,mode},respondWith:value=>response=value,waitUntil:value=>wait=value});return {response,wait};};
 return {get,writes,deleted,handlers};
}

test('service worker bounds stalled navigation and never serves or saves authenticated API responses',async()=>{
 const saved=new Response('saved app'),w=worker(()=>new Promise(()=>{}),saved);
 assert.equal(await (await w.get('/app/index.html','navigate').response).text(),'saved app');
 assert.equal(w.get('/app/.netlify/functions/profile').response,undefined);assert.equal(w.get('/app/api/user').response,undefined);
 assert.equal(w.get('/other-app/index.html','navigate').response,undefined);assert.equal(w.writes.length,0);
 let activation;w.handlers.activate({waitUntil:p=>activation=p});await activation;assert.deepEqual(w.deleted,['evorank-old']);
});

test('offline legal navigation uses its own page, not the app shell; failed online responses use the saved page',async()=>{
 const w=worker(async()=>new Response('unavailable',{status:503}),new Response('privacy page'));
 assert.equal(await (await w.get('/app/privacy.html?accent=ff0000','navigate').response).text(),'privacy page');assert.equal(w.writes.length,0);
});
