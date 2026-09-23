import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();after(()=>dom.window.close());
w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
function app(){const x=new a.LiftoffApp();x.accountKey='x45';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.render=()=>{};x.scheduleSave=()=>{};x.showToast=()=>{};return x;}
test('muscle aggregation gives the best contribution 70 percent without inflating the exercise record',()=>{
  const lifts=[{exerciseId:'DIP_BW',muscle:'Trizeps',score:480},{exerciseId:'test-cable',muscle:'Trizeps',score:300}];
  const before=JSON.stringify(lifts),triceps=a.getMuscleStatuses(lifts).triceps;
  assert.equal(triceps.score,426);assert.equal(triceps.best.score,480);assert.equal(JSON.stringify(lifts),before);
  assert.equal(a.getMuscleStatuses(lifts.slice(0,1)).triceps.score,480);
  assert.equal(a.getMuscleStatuses([]).triceps.score,0);
  assert.equal(a.getMuscleStatuses([...lifts,{exerciseId:'low',muscle:'Trizeps',score:50}]).triceps.bestWeight,.7);
});
test('cable defaults, completed-set snapshots and handle input remain consistent across normalization',()=>{
  const x=app(),m=w.EVORANK_X2_RANKS;
  const ids=a.EXERCISES.filter(e=>m.isCable(e)&&e.tracking==='weight-reps').slice(0,2).map(e=>e.id);
  const e=a.instantiateExercise(x.state,ids[0]);e.sets=[a.normalizeSet({weightKg:40,reps:8,done:true}),a.normalizeSet({weightKg:40,reps:8})];x.state.draft={id:'d',exercises:[e]};
  x.setX2Cable(e.id,2,'stack',{name:'Geprüftes Gerät',useDefault:true});
  assert.equal(e.sets[0].cableRatio,1);assert.equal(e.sets[1].cableRatio,2);
  const other=a.instantiateExercise(x.state,ids[1]);assert.equal(other.cableRatio,2);assert.equal(other.cableName,'Geprüftes Gerät');
  assert.equal(m.handleWeight(other,40),20);assert.equal(m.handleWeight({...other,cableInputMode:'handle'},40),40);
  const restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);assert.equal(restored.draft.exercises[0].sets[0].cableRatio,1);assert.equal(restored.settings.x45CableDefault.cableRatio,2);
  const oldScore=a.scoreLift({exercise:m.preserve(e.sets[0],{...e}),weightKg:40,reps:8},70);
  const newScore=a.scoreLift({exercise:m.preserve(e.sets[1],{...e}),weightKg:40,reps:8},70);
  assert.ok(oldScore>newScore,'stack correction changes effective load before ranking');
});
test('weekly plan combines strength and personal Strava entries without matching a session twice',()=>{
  const x=app();w.RANKFORGE1000.ensure(x);
  x.state.trainingPlanV10.enabled=true;x.state.trainingPlanV10.generatedPlan=[{day:1,sport:'run',title:'Lauf A'},{day:1,sport:'run',title:'Lauf B'},{day:2,sport:'strength',title:'Kraft'}];
  x.state.workouts=[{id:'gym',name:'Kraft',startedAt:'2026-09-08T10:00:00',endedAt:'2026-09-08T11:00:00',durationSeconds:3600}];
  x.state.stravaV45={activities:[{id:'strava-123',sport:'run',date:'2026-09-07T12:00:00',distanceMeters:5000,durationSeconds:1500,source:'strava'}]};
  const days=w.EVORANK_X45.week(x,new Date('2026-09-09T12:00:00'));
  assert.equal(days.length,7);assert.equal(days[0].key,'2026-09-07');assert.equal(days[0].planned.filter(p=>p.matched).length,1);assert.equal(days[0].extra.length,0);assert.equal(days[1].planned[0].matched,true);
  assert.equal(w.RANKFORGE970.sportMetrics('run',x).list.some(item=>item.id==='strava-123'),false,'personal Strava import is not a public performance record');
});
test('alarm volume is persisted, bounded and a zero volume cannot fall back to a loud old alarm',async()=>{
  const x=app();x.state.settings.sound=true;x.state.settings.alarmVolume=0;
  let touched=false;x.ensureTimerAudio=()=>{touched=true;};
  assert.equal(await x.playTimerAlarm(),false);assert.equal(touched,false);
  const restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);assert.equal(restored.settings.alarmVolume,0);
  assert.equal(w.EVORANK_X45.volume(9),1);assert.equal(w.EVORANK_X45.volume(-1),0);assert.equal(w.EVORANK_X45.volume(NaN),.8);
});
test('native bridge keeps audio settings and set progress but excludes arbitrary private payloads',()=>{
  const x=app(),sent=[];x.state.settings.alarmVolume=.35;
  x.state.draft={exercises:[{sets:[{done:true},{done:false}]}]};
  w.webkit={messageHandlers:{evorankLiveActivity:{postMessage:body=>sent.push(body)}}};
  x.postNativeTimer('start',{id:'timer-1',endTimestamp:Date.now()+60000,sound:true,notifications:true,secret:'must not cross'});
  assert.equal(sent.at(-1).alarmVolume,.35);assert.equal(sent.at(-1).timerId,'timer-1');assert.equal(sent.at(-1).currentSet,1);assert.equal(sent.at(-1).totalSets,2);assert.equal(sent.at(-1).secret,undefined);
  delete w.webkit;
});
test('friend responses from an older account cannot overwrite the new account',async()=>{
  const x=app();w.RANKFORGE_APP=x;let id='account-a',resolve;
  w.RANKFORGE_ACCOUNT={status:()=>({configured:true,signedIn:true,userId:id}),listFriends:()=>new Promise(r=>resolve=r)};
  const pending=w.RANKFORGE93_FRIENDS.refresh();id='account-b';resolve({friends:[{id:'wrong-account-friend'}],incoming:[],outgoing:[]});
  assert.equal(await pending,false);assert.equal(w.RANKFORGE93_FRIENDS.data().friends.length,0);delete w.RANKFORGE_APP;
});
test('bodygraph outline uses the male image mask and leaves hit geometry invisible',()=>{
  const template=w.document.createElement('template');template.innerHTML=a.bodyFigure('front',{},null,{bodyProfile:'male'});
  assert.ok(template.content.querySelector('.rfx45-anatomy-outline .rf920-muscle-fill[mask]'));
  assert.ok(template.content.querySelector('filter[id$="-outline"] [flood-color="#000"]'));
  assert.ok(template.content.querySelector('.rf920-muscle-hit'));
});
test('home renders one combined week and rest setup exposes a saved volume setting',()=>{
  const x=app();x.ui.view='home';x.state.settings.alarmVolume=.35;x.metrics=a.getMetrics(x.state);
  x.state.settings.homeX51={modules:{week:true}};
  const template=w.document.createElement('template');template.innerHTML=x.renderHome();
  assert.equal(template.content.querySelectorAll('.rfx45-week').length,1);assert.equal(template.content.querySelectorAll('.week-section,.rf1000-plan-card').length,0);
  template.innerHTML=x.renderV73RestSetup({seconds:90});assert.equal(template.content.querySelector('[data-x45-volume]').value,'35');assert.ok(template.content.querySelector('[data-action="x45-alarm-test"]'));
  x.state.health={authorization:'unknown'};template.innerHTML=x.renderProfile();
  assert.equal(template.content.querySelectorAll('.rf880-profile-group__body [data-action="x45-help"]').length,1);
  assert.ok(template.content.querySelector('.rf880-profile-group__body [data-action="x45-connections"] .icon'));
});
