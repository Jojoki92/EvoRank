import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();after(()=>dom.window.close());
w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
const age=w.EVORANK_AGE_X47,model=w.EVORANK_X2_RANKS,ui=w.EVORANK_X47;
function app(){const x=new a.LiftoffApp();x.accountKey='x47';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.render=()=>{};x.scheduleSave=()=>{};x.showToast=()=>{};x.metrics=a.getMetrics(x.state);return x;}
const lift={exercise:a.EXERCISES.find(e=>e.id==='DIP_BW'),exerciseId:'DIP_BW',weightKg:40,reps:8};
async function click(x,action){const el=w.document.createElement('button');el.dataset.action=action;await x.handleClick({target:el,preventDefault(){}});}
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};

test('age changes the dip comparison while effective kilograms and base points stay fixed',()=>{
  const scores=[17,20,60].map(years=>model.scoreDetails(lift,70,{age:years,bodyProfile:'male'}));
  assert.deepEqual(scores.map(s=>s.baseScore),[480,480,480]);
  assert.deepEqual(scores.map(s=>s.score),[531,490,640]);
  assert.ok(scores[0].score>scores[1].score);assert.ok(scores[2].score>scores[1].score);
  assert.equal(model.loadFor(lift.exercise,40,70),110);
  assert.equal(a.epleyOneRepMax(110,8),139.33333333333331);
  assert.equal(model.scoreDetails(lift,70,{}).score,480);
});
test('birth dates interpolate smoothly, override stale ages, and reject invalid or future dates',()=>{
  const date=new Date(2026,8,10,12),p={birthDate:'2009-09-10',age:60};
  assert.equal(age.ageAt(p,date),17);
  assert.ok(age.ageAt(p,new Date(2027,8,10,12))===18);
  assert.equal(age.ageAt({birthDate:'2008-02-29'},new Date(2026,2,1,12)),18);
  const before=age.info(p,new Date(2026,8,9,12)),after=age.info(p,date);
  assert.ok(Math.abs(before.factor-after.factor)<.001,'no birthday rank jump');
  for(const birthDate of ['2027-01-01','2009-02-30','not-a-date'])assert.equal(age.info({birthDate,age:17},date).applied,false);
  assert.equal(age.info({}).factor,1);assert.equal(age.info({age:NaN}).factor,1);
  assert.equal(age.info({age:13}).factor,age.info({age:15}).factor);
  assert.equal(age.info({age:100}).factor,age.info({age:90}).factor);
  assert.notEqual(age.info({age:60,bodyProfile:'female'}).factor,age.info({age:60,bodyProfile:'male'}).factor);
});
test('legacy ages get a persisted reference and continue advancing across reloads',()=>{
  const x=app();x.state.profile.age=17;
  age.ensureProfile(x.state.profile,new Date(2026,8,10,12));
  const restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);
  assert.equal(restored.profile.ageReferenceDate,'2026-09-10');
  assert.ok(age.ageAt(restored.profile,new Date(2028,8,10,12))>18.99);
  const original=restored.profile.ageReferenceDate;age.ensureProfile(restored.profile,new Date(2028,8,10,12));
  assert.equal(restored.profile.ageReferenceDate,original);assert.equal(restored.profile.ageReferenceValue,17);
});
test('age refresh uses the account profile and preserves workout history, rewards and active draft',()=>{
  const x=app(),e=a.instantiateExercise(x.state,'DIP_BW');
  e.sets=[a.normalizeSet({weightKg:40,reps:8,done:true})];
  x.state.workouts=[a.normalizeWorkout({id:'record',name:'Dips',endedAt:new Date().toISOString(),bodyweightKg:70,bodyProfile:'female',exercises:[e],xp:123,coins:7})];
  x.state.draft={id:'keep-draft',exercises:[e]};
  Object.assign(x.state.profile,{age:17,bodyProfile:'male',bodyweightKg:90});
  const before=JSON.stringify({workouts:x.state.workouts,draft:x.state.draft,game:x.state.game});
  let saves=0;x.scheduleSave=()=>saves++;
  ui.refreshAge(x);const first=x.metrics.exerciseRanks.find(l=>l.exerciseId==='DIP_BW');
  assert.equal(first.score,531);assert.equal(first.bodyweightKg,70);
  assert.equal(ui.refreshAge(x),false);assert.equal(saves,1);
  x.state.profile.birthDate=age.dayKey(new Date(new Date().getFullYear()-60,new Date().getMonth(),new Date().getDate()));
  ui.refreshAge(x);assert.equal(x.metrics.exerciseRanks.find(l=>l.exerciseId==='DIP_BW').score,640);
  assert.equal(JSON.stringify({workouts:x.state.workouts,draft:x.state.draft,game:x.state.game}),before);
  const detail=fragment(x.renderExerciseRankModal('DIP_BW'));
  assert.match(detail.querySelector('.rfx47-age').textContent,/480 Basispunkte → 640 Alterspunkte/);
});
test('cable ratios and machine resistance are applied once before age, with estimated-rank ceilings',()=>{
  const cable=a.EXERCISES.find(e=>model.isCable(e)&&e.tracking==='weight-reps'),p={age:17,bodyProfile:'male'};
  const first=model.scoreDetails({exercise:{...cable,cableRatio:2,cableInputMode:'stack'},weightKg:40,reps:8},70,p);
  const handle=model.scoreDetails({exercise:{...cable,cableRatio:2,cableInputMode:'handle'},weightKg:20,reps:8},70,p);
  assert.equal(first.score,handle.score);assert.equal(first.baseScore,handle.baseScore);
  const machine=a.EXERCISES.find(e=>e.id==='PREACHER_CURL_MACHINE');
  const displayed=model.scoreDetails({exercise:{...machine,machineLoadFactor:.5,machineStartingKg:5},weightKg:40,reps:8},70,p);
  const resistance=model.scoreDetails({exercise:{...machine,machineInputMode:'resistance'},weightKg:25,reps:8},70,p);
  assert.equal(displayed.score,resistance.score);
  assert.equal(model.scoreDetails({exercise:machine,weightKg:500,reps:8},70,{age:90}).score,699);
  for(const exercise of a.EXERCISES){const detail=model.scoreDetails({exercise,weightKg:40,reps:8,durationSeconds:60,distanceMeters:1000},70,p);assert.ok(Number.isFinite(detail.score)&&detail.score>=0,exercise.id);}
});
test('time and distance rankings are unaffected by the strength age model',()=>{
  for(const exercise of a.EXERCISES.filter(e=>['time','distance'].includes(e.tracking))){
    const sample={exercise,weightKg:0,reps:0,durationSeconds:60,distanceMeters:1000};
    assert.equal(model.scoreDetails(sample,70,{age:17}).score,model.scoreDetails(sample,70,{age:60}).score,exercise.id);
  }
});
test('weekly plan deletion requires confirmation, survives normalization and does not delete training',async()=>{
  const x=app();w.RANKFORGE1000.ensure(x);w.RANKFORGE1000.generatePlan(x);
  const workouts=JSON.stringify(x.state.workouts),routines=JSON.stringify(x.state.routines);
  await click(x,'rf1000-plan-edit');assert.equal(x.ui.modal.type,'x47-plans');
  assert.ok(fragment(x.renderModal()).querySelector('[data-action="x47-delete-week-plan"]'));
  await click(x,'x47-delete-week-plan');assert.equal(x.state.trainingPlanV10.enabled,true);
  await click(x,'close-modal');assert.equal(x.state.trainingPlanV10.enabled,true);
  await click(x,'x47-delete-week-plan');await click(x,'x47-delete-plan-confirm');
  x.state=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);x.renderHome();
  assert.equal(x.state.trainingPlanV10.enabled,false);assert.equal(x.state.trainingPlanV10.generatedPlan.length,0);
  assert.equal(JSON.stringify(x.state.workouts),workouts);assert.equal(JSON.stringify(x.state.routines),routines);
  await click(x,'x47-plan-edit');assert.ok(x.ui.rf1000Wizard);
  await click(x,'x47-plan-cancel');assert.equal(x.ui.rf1000Wizard,null);assert.equal(x.state.trainingPlanV10.enabled,false);
  w.RANKFORGE1000.generatePlan(x);assert.ok(x.state.trainingPlanV10.generatedPlan.length);
});
test('swim deletion stays deleted during recalculation until explicitly regenerated',async()=>{
  const x=app();x.state.garmin={activities:[{id:'swim',date:new Date().toISOString(),distanceMeters:1000,durationSeconds:1800,poolLengthMeters:25}]};
  x.state.garmin.nextPlan=w.RANKFORGE83.buildSwimPlan(x);assert.ok(x.state.garmin.nextPlan);
  const activities=JSON.stringify(x.state.garmin.activities);
  await click(x,'x47-delete-swim-plan');await click(x,'x47-delete-plan-confirm');
  x.state=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);
  assert.equal(w.RANKFORGE83.buildSwimPlan(x),null);assert.equal(x.state.garmin.nextPlan,null);
  await x.handleChange({target:{dataset:{action:'rf83-plan-focus'},value:'speed'}});
  assert.equal(x.state.garmin.nextPlan,null);assert.equal(JSON.stringify(x.state.garmin.activities),activities);
  await click(x,'rf82-open-garmin');
  assert.ok(fragment(x.renderModal()).querySelector('[data-action="rf83-rebuild-swim-plan"]'));
  await click(x,'rf83-rebuild-swim-plan');assert.ok(x.state.garmin.nextPlan);assert.equal(x.state.garmin.planDismissed,false);
  const modal=fragment(x.renderModal());
  assert.ok(modal.querySelector('[data-action="x47-delete-swim-plan"]'));
  assert.equal(modal.querySelector('.rfx47-plan-details').open,false);
});
test('a stale deletion confirmation cannot remove a changed plan or another account plan',async()=>{
  const x=app();w.RANKFORGE1000.generatePlan(x);await click(x,'x47-delete-week-plan');
  x.state.trainingPlanV10.goal='changed';await click(x,'x47-delete-plan-confirm');assert.equal(x.state.trainingPlanV10.enabled,true);
  await click(x,'x47-delete-week-plan');x.accountKey='different';await click(x,'x47-delete-plan-confirm');assert.equal(x.state.trainingPlanV10.enabled,true);
});
test('home migrates coloured frames to plain cards and profile exposes one plan manager',()=>{
  const x=app();x.state.homeRankDesignV104={framed:true};x.ui.view='home';
  const home=fragment(x.renderHome());assert.ok(home.querySelector('.rf104-home-ranks--plain'));assert.equal(home.querySelector('.rf104-home-ranks--framed'),null);
  x.state.health={authorization:'unknown'};const profile=fragment(x.renderProfile());
  assert.equal(profile.querySelectorAll('[data-action="rf1000-plan-edit"]').length,1);
  assert.ok(profile.querySelector('.rf880-profile-group__body [data-action="rf1000-plan-edit"]'));
  const ranks=fragment(x.renderRanks());assert.ok(ranks.querySelector('[data-action="x53-rank-help"]'));assert.ok(ranks.querySelector('.x53-sport-tabs'));
  x.openModal('x53-rank-help',{sport:'strength'});assert.ok(fragment(x.renderModal()).querySelector('.rfx47-age'));
});
