import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();
const model=w.EVORANK_X2_RANKS,tracker=w.EVORANK_TRACKER_X42;
after(()=>dom.window.close());
function app(key='x42-test') {
  const x=new a.LiftoffApp();x.accountKey=key;x.state=a.normalizeState(a.initialState(key),key);
  x.state.exercisePreferences||={favorites:[],unavailable:[],recent:[]};
  Object.assign(x.state.profile,{bodyweightKg:70,bodyProfile:'male'});
  x.scheduleSave=()=>{};x.render=()=>{};x.showToast=()=>{};x.persist=async()=>{};
  x.state.draft={id:'draft',startedAt:new Date().toISOString(),name:'Test',exercises:[]};
  return x;
}
const exercise=id=>a.EXERCISES.find(e=>e.id===id);
test('weighted dip example uses total moving mass and current community anchors',()=>{
  const e=exercise('DIP_BW'),score=a.scoreLift({exercise:e,weightKg:40,reps:8},70);
  assert.equal(model.loadFor(e,40,70),110);assert.equal(score,480);assert.equal(a.rankFromScore(score).key,'platinum');
  assert.equal(a.scoreLift({exercise:exercise('10347BAC'),weightKg:40,reps:8},70),score);
  assert.ok(a.scoreLift({exercise:e,weightKg:40,reps:8,bodyProfile:'female'},70)>score);
});
test('machine settings affect open sets while completed sets and history keep their configuration',()=>{
  const x=app(),e=a.instantiateExercise(x.state,'PREACHER_CURL_MACHINE');x.state.draft.exercises=[e];
  e.sets=[a.normalizeSet({weightKg:40,reps:8,done:true}),a.normalizeSet({weightKg:40,reps:8,done:false})];
  x.setX42Machine(e.id,{machineLoadFactor:.5,machineStartingKg:5,machineInputMode:'display',machineName:'Testgerät'});
  assert.equal(e.sets[0].machineLoadFactor,1);assert.equal(e.sets[0].machineStartingKg,0);
  assert.equal(e.sets[1].machineLoadFactor,.5);assert.equal(model.handleWeight(e,40),25);
  assert.equal(model.handleWeight({...e,machineInputMode:'resistance'},40),40);
  e.sets[1].done=true;
  const lifts=model.candidates(x.state.draft,new Date().toISOString(),70);
  assert.equal(lifts[0].exercise.machineLoadFactor,1,'old set still beats the newly adjusted lighter set');
  const saved=a.normalizeWorkout({bodyweightKg:70,xp:123,eggs:7,exercises:[e],bestLifts:lifts});
  const before=JSON.stringify(saved);a.collectBestLifts([saved],70);assert.equal(JSON.stringify(saved),before);
  const reloaded=a.normalizeState(JSON.parse(JSON.stringify(x.state)),'x42-test');
  assert.equal(reloaded.draft.exercises[0].sets[1].machineLoadFactor,.5);
  assert.equal(reloaded.draft.exercises[0].sets[0].machineLoadFactor,1);
  assert.equal(a.instantiateExercise(reloaded,'PREACHER_CURL_MACHINE').machineName,'Testgerät');
});
test('machine routine roundtrip keeps device configuration and new sets inherit it',()=>{
  const x=app(),e=a.instantiateExercise(x.state,'PREACHER_CURL_MACHINE');x.state.draft.exercises=[e];
  x.setX42Machine(e.id,{machineLoadFactor:.4,machineStartingKg:3,machineInputMode:'display'});
  x.addSet(e.id);assert.equal(e.sets.at(-1).machineLoadFactor,.4);
  const form=w.document.createElement('form'),data=new w.FormData();data.set('title','Machine routine');x.closeModal=()=>{};
  x.saveDraftAsRoutine(form,data);
  const routine=x.state.routines.find(r=>r.id===x.state.draft.routineId);
  const next=a.instantiateRoutine(x.state,a.normalizeRoutine(JSON.parse(JSON.stringify(routine))));
  assert.equal(next.exercises[0].machineStartingKg,3);assert.equal(next.exercises[0].machineLoadFactor,.4);
});
test('leg curls and leg raises do not award biceps or triceps through name matching',()=>{
  const legs=a.EXERCISES.filter(e=>e.rankable!==false&&(/leg.?curl|beinbeug/i.test(e.name)||(/beinheben/i.test(e.name)&&e.equipment==='Dip-Station')));
  assert.ok(legs.length>5);
  for(const e of legs)assert.ok(!e.secondaryMuscles?.some(m=>['Bizeps','Trizeps'].includes(m)),e.name);
});
test('picker keeps filters in the same scroll area and favorites in exercise details',()=>{
  const x=app();x.ui.modal={type:'exercise-picker',context:'workout'};
  const t=w.document.createElement('template');t.innerHTML=x.renderExercisePickerModal(x.ui.modal);
  assert.equal(t.content.querySelectorAll('.modal-scroll').length,1);
  assert.ok(t.content.querySelector('.modal-scroll .exercise-filter-chips'));
  assert.ok(t.content.querySelector('.modal-scroll .rf77-picker-list'));
  assert.equal(t.content.querySelectorAll('.v7-picker-row__star').length,0);
  assert.equal(t.content.querySelector('details.rfx42-library-extra').open,false);
  assert.ok(t.content.querySelector('[data-tab="favorites"]'));
  assert.match(x.renderModal(),/class="modal rfx42-picker-sheet modal--sheet/);
  const details=x.renderV7ExerciseInfo({exerciseId:'DIP_BW',context:'workout'});
  assert.match(details,/data-action="v7-exercise-favorite"/);
});
test('male core selection outlines masked segments without changing female anatomy',()=>{
  const t=w.document.createElement('template');t.innerHTML=a.bodyFigure('front',{},'core',{bodyProfile:'male'});
  const paint=t.content.querySelector('.muscle-region--core .rfx42-core-paint');assert.ok(paint?.hasAttribute('filter'));
  assert.ok(paint.querySelector('rect[mask]'));assert.equal(t.content.querySelectorAll('.rf920-muscle-region').length,8);
  assert.ok(!a.bodyFigure('front',{},'core',{bodyProfile:'female'}).includes('rfx42-core-paint'));
});
test('design modal shows the approved ER instead of the old bolt',()=>{
  const x=app();x.ui.modal={type:'design'};
  const t=w.document.createElement('template');t.innerHTML=x.renderModal();
  assert.ok(t.content.querySelector('.rf872-design-preview-mark img[src*="evorank-er-flat"]'));
  assert.equal(t.content.querySelectorAll('.rf872-design-preview-mark svg').length,0);
});
test('timer uses timestamps and excludes pauses for run, bike and swim',()=>{
  for(const sport of ['run','bike','swim']) {
    const x=app('timer-'+sport),now=Date.now();
    assert.equal(tracker.start(x,{sport,mode:'timer',poolLength:25},now),true);
    const record=tracker.readTracker(x);assert.equal(tracker.elapsed(record,now+60000),60000);
    tracker.pause(x,now+60000);assert.equal(tracker.elapsed(record,now+120000),60000);
    tracker.resume(x,now+120000);assert.equal(tracker.elapsed(record,now+150000),90000);tracker.pause(x,now+150000);
    assert.equal(tracker.start(x,{sport,mode:'timer'}),false,'one active recording at a time');
  }
});
test('GPS rejects poor accuracy, jumps, stale fixes and does not bridge pauses or gaps',()=>{
  const now=Date.now(),record={status:'running',mode:'gps',sport:'run',distanceMeters:0,lastPoint:null};
  const fix=(latitude,seconds,accuracy=3)=>({coords:{latitude,longitude:16,accuracy},timestamp:now+seconds*1000});
  assert.equal(tracker.acceptPosition(record,fix(48,0)),true);
  assert.equal(tracker.acceptPosition(record,fix(48.0002,10),now+10000),true);
  assert.ok(record.distanceMeters>21&&record.distanceMeters<23);
  const before=record.distanceMeters;
  assert.equal(tracker.acceptPosition(record,fix(49,11),now+11000),false);
  assert.equal(tracker.acceptPosition(record,fix(48.0003,12,100),now+12000),false);
  assert.equal(tracker.acceptPosition(record,fix(48.0003,12),now+60000),false);
  assert.equal(record.distanceMeters,before);
  tracker.acceptPosition(record,fix(48.001,60),now+60000);assert.equal(record.distanceMeters,before);assert.equal(record.gpsGap,true);
  record.status='paused';assert.equal(tracker.acceptPosition(record,fix(48.0012,70),now+70000),false);
});
test('pool counting, saving and state reload preserve one completed activity',async()=>{
  const x=app('pool-save'),now=Date.now();tracker.start(x,{sport:'swim',poolLength:50},now);
  const button=w.document.createElement('button');button.dataset.action='x42-lap-plus';
  for(let i=0;i<4;i++)await x.handleClick({target:button,preventDefault(){}});
  assert.equal(tracker.readTracker(x).distanceMeters,200);
  tracker.pause(x,now+180000);
  const snapshot=w.localStorage.getItem('evorank-tracker-x42:pool-save');
  assert.equal(await tracker.save(x,{distanceMeters:200,durationSeconds:180,effort:6}),true);
  assert.equal(x.state.triathlon.activities.length,1);assert.equal(x.state.triathlon.activities[0].laps,4);
  const restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),'pool-save');
  assert.equal(restored.triathlon.activities[0].distanceMeters,200);
  assert.equal(restored.triathlon.activities[0].laps,4);
  assert.equal(restored.triathlon.activities[0].source,'pool');
  assert.equal(w.localStorage.getItem('evorank-tracker-x42:pool-save'),null);
  // Simulate storage deletion failing after a completed save: no duplicate.
  w.localStorage.setItem('evorank-tracker-x42:pool-save',snapshot);delete x._x42TrackerKey;
  assert.equal(await tracker.save(x,{distanceMeters:200,durationSeconds:180}),true);assert.equal(x.state.triathlon.activities.length,1);
});
test('active recorder survives reload under its own account without exposing it to another account',()=>{
  const x=app('resume-a'),now=Date.now();tracker.start(x,{sport:'bike',mode:'timer'},now-30000);
  const restored=app('resume-a'),record=tracker.readTracker(restored);
  assert.equal(record.status,'paused');assert.ok(record.elapsedMs>=30000);assert.equal(record.recovered,true);
  assert.equal(tracker.readTracker(app('resume-b')),null);tracker.pause(x);
});

test('GPS watch is explicit, cleared on pause and resilient to denied permission',()=>{
  const x=app('gps-permission'),watches=[],cleared=[];
  Object.defineProperty(w.navigator,'geolocation',{configurable:true,value:{watchPosition(success,error,options){watches.push({success,error,options});return watches.length;},clearWatch(id){cleared.push(id);}}});
  tracker.start(x,{sport:'run',mode:'gps'});assert.equal(watches.length,1);
  watches[0].error({code:1});assert.match(tracker.readTracker(x).gpsStatus,/nicht freigegeben/);
  assert.equal(tracker.readTracker(x).status,'running');assert.equal(watches[0].options.enableHighAccuracy,true);
  tracker.pause(x);assert.deepEqual(cleared,[1]);
  tracker.resume(x);assert.equal(watches.length,2);
  const record=tracker.readTracker(x);tracker.pause(x);
  watches[1].success({coords:{latitude:48,longitude:16,accuracy:3},timestamp:Date.now()});assert.equal(record.lastPoint,null);
  assert.deepEqual(cleared,[1,2]);delete w.navigator.geolocation;
});

test('failed durable save retains recording and corrected retry saves exactly once',async()=>{
  const x=app('save-failure');tracker.start(x,{sport:'bike',mode:'timer'});tracker.pause(x);
  x.persist=async()=>{throw new Error('disk full');};
  assert.equal(await tracker.save(x,{distanceMeters:1000,durationSeconds:120}),false);
  assert.ok(tracker.readTracker(x));assert.ok(w.localStorage.getItem('evorank-tracker-x42:save-failure'));
  x.persist=async()=>true;
  assert.equal(await tracker.save(x,{distanceMeters:1200,durationSeconds:140}),true);
  assert.equal(x.state.triathlon.activities.length,1);assert.equal(x.state.triathlon.activities[0].distanceMeters,1200);
  assert.equal(x.state.triathlon.activities[0].durationSeconds,140);assert.equal(tracker.readTracker(x),null);
});

test('all sport pages expose the live recorder and the completion form',()=>{
  for(const sport of ['run','bike','swim']) {
    const x=app('ui-'+sport);x.ui.view='triathlon';x.ui.rf970Sport=sport;x.metrics=a.getMetrics(x.state);
    assert.match(x.renderHome(),/data-form="x42-tracker-start"/);
    tracker.start(x,{sport,mode:'timer'});x.ui.modal={type:'x42-tracker-finish'};
    assert.match(x.renderModal(),/data-form="x42-tracker-save"/);tracker.pause(x);
  }
});

test('cloud merge adopts new history without reloading or replacing the active draft',async()=>{
  const local={workouts:[{id:'local'}],profile:{name:'Local'},draft:{id:'active',exercises:[]},privacyV110:{cloudHealthConsent:true}};
  w.localStorage.setItem('uprank-active-account','cloud-test');
  const x={accountKey:'cloud-test',state:local,scheduleSave(){},render(){throw new Error('background render');}};w.RANKFORGE_APP=x;
  let releasePull;const remote=new Promise(resolve=>{releasePull=resolve;});const pushed=[];
  w.RANKFORGE_ACCOUNT={status:()=>({signedIn:true,configured:false,userId:'cloud-test-user',email:'cloud-test@example.com'}),pull:()=>remote,push:async state=>{pushed.push(state);return {ok:true};}};
  w.EVORANK_LOCAL_ACCOUNTS={ensure:()=> 'cloud-test'};
  // Normalization/metrics require a full state. Give the live app one while
  // preserving a focused draft reference before the network response arrives.
  x.state=a.normalizeState({...a.initialState('cloud-test'),...local},'cloud-test');const draft=x.state.draft;
  new vm.Script(readFileSync('public/rankforge/assets/account-bridge-v1.js','utf8')).runInContext(dom.getInternalVMContext());
  const reconcile=w.RANKFORGE_BRIDGE.reconcile();
  x.state.workouts.push(a.normalizeWorkout({id:'during-network',exercises:[],xp:3}));
  releasePull({payload:{workouts:[{id:'remote',exercises:[],xp:2}]}});await reconcile;
  assert.equal(x.state.draft,draft);assert.ok(x.state.workouts.some(item=>item.id==='during-network'));assert.ok(x.state.workouts.some(item=>item.id==='remote'));
  assert.equal(pushed.length,1);assert.ok(!readFileSync('public/rankforge/assets/account-bridge-v1.js','utf8').includes('location.reload'));
  w.RANKFORGE_APP=null;
});
