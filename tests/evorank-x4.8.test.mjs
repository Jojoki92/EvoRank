import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();after(()=>dom.window.close());
w.HTMLMediaElement.prototype.play=async()=>{};w.HTMLMediaElement.prototype.pause=()=>{};
const model=w.EVORANK_ENDURANCE_X48,runtime=w.RANKFORGE970,tracker=w.EVORANK_TRACKER_X42;
function app(){const x=new a.LiftoffApp();x.accountKey='x48';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.render=()=>{};x.scheduleSave=()=>{};x.showToast=()=>{};x.persist=async()=>{};x.metrics=a.getMetrics(x.state);runtime.ensure(x);return x;}
const sample=sport=>({id:sport,sport,date:'2026-09-01T12:00:00Z',distanceMeters:{swim:1000,run:5000,bike:20000}[sport],durationSeconds:{swim:1500,run:1500,bike:2700}[sport]});
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};
async function click(x,action){const el=w.document.createElement('button');el.dataset.action=action;return x.handleClick({target:el,preventDefault(){},stopPropagation(){}});}

test('all endurance sports use their own smooth age curves and the current comparison profile',()=>{
  for(const sport of ['run','bike','swim']){
    const activity={...sample(sport),bodyProfile:'female'},before=JSON.stringify(activity);
    const scores=[17,20,60].map(age=>runtime.activityPerformance(activity,{age,bodyProfile:'male'}));
    assert.ok(scores[0]>scores[1],sport+' teen');assert.ok(scores[2]>scores[1],sport+' masters');
    assert.equal(runtime.activityPerformance(activity,{age:20,bodyProfile:'male'}),runtime.activityPerformance({...activity,bodyProfile:'male'},{age:20,bodyProfile:'male'}));
    assert.ok(runtime.activityPerformance(activity,{age:60,bodyProfile:'female'})>scores[2]);
    assert.equal(JSON.stringify(activity),before);
    const birthday={birthDate:'2009-09-10',bodyProfile:'male'};
    const first=model.context(birthday,sport,new Date(2026,8,9)),next=model.context(birthday,sport,new Date(2026,8,10));
    assert.ok(Math.abs(first.ageFactor-next.ageFactor)<.001);
  }
  assert.notEqual(model.context({age:60},'swim').ageFactor,model.context({age:60},'bike').ageFactor);
  assert.notEqual(model.context({age:60},'run').ageFactor,w.EVORANK_AGE_X47.info({age:60}).factor);
});
test('endurance ranks handle missing/invalid ages, extreme ages and invalid performance without NaN',()=>{
  for(const sport of ['run','bike','swim']){
    assert.equal(model.context({},sport).ageFactor,1);
    assert.equal(model.context({birthDate:'bad',age:60},sport).ageFactor,1);
    assert.equal(model.context({age:120},sport).ageFactor,model.context({age:90},sport).ageFactor);
    for(const age of [13,17,20,45,60,90,120,NaN]){
      const score=runtime.activityPerformance(sample(sport),{age});assert.ok(Number.isFinite(score)&&score>=0&&score<=800);
    }
    for(const durationSeconds of [0,-1,Infinity,NaN])assert.equal(runtime.activityPerformance({...sample(sport),durationSeconds},{age:60}),0);
    assert.ok(runtime.activityPerformance({...sample(sport),durationSeconds:sample(sport).durationSeconds*.9},{age:60})>=runtime.activityPerformance(sample(sport),{age:60}));
  }
});
test('cycling watts per kg use saved bodyweight; missing, estimated or too-short power uses pace',()=>{
  const x=app();x.state.profile.age=25;
  const base={...sample('bike'),averagePowerWatts:210,bodyweightKg:70,powerSource:'measured'};
  const score=item=>{x.state.triathlon.activities=[item];return runtime.sportMetrics('bike',x).comparison;};
  const a=score(base);assert.equal(a.basis,'power');assert.equal(a.wattsPerKg,3);
  assert.ok(score({...base,bodyweightKg:80}).score<a.score);
  assert.equal(score({...base,bodyweightKg:80,averagePowerWatts:240}).score,a.score);
  x.state.profile.bodyweightKg=120;assert.equal(score(base).score,a.score);
  assert.equal(score({...base,bodyweightKg:null}).basis,'pace');
  assert.equal(score({...base,powerSource:'estimated'}).basis,'pace');
  assert.equal(score({...base,durationSeconds:1199}).basis,'pace');
  assert.equal(score({...base,averagePowerWatts:999999}).basis,'pace');
  for(const sport of ['run','swim'])assert.equal(runtime.activityPerformance({...sample(sport),bodyweightKg:50},{age:60,bodyweightKg:50}),runtime.activityPerformance({...sample(sport),bodyweightKg:120},{age:60,bodyweightKg:120}));
});
test('age recalculation preserves all endurance history and the consistency bonus',()=>{
  const x=app();x.state.triathlon.activities=['run','bike','swim'].map(sample);
  x.state.profile.age=20;const before=JSON.stringify(x.state.triathlon.activities);
  const now=new Date('2026-09-10T12:00:00Z');
  const first=runtime.sportMetrics('run',x,now);x.state.profile.age=60;const next=runtime.sportMetrics('run',x,now);
  assert.ok(next.score>first.score);assert.equal(first.consistency,next.consistency);assert.equal(first.consistency,13);
  assert.equal(JSON.stringify(x.state.triathlon.activities),before);
  x.state.stravaV45={activities:[{...sample('run'),id:'strava-only',durationSeconds:900}]};
  assert.equal(runtime.sportMetrics('run',x,now).list.some(item=>item.id==='strava-only'),false);
});
test('power and weight survive manual entry, Garmin JSON and state normalization',async()=>{
  const x=app();x.ui.rf970Sport='bike';x.ui.modal={type:'rf970-activity'};
  const root=fragment(x.renderModal()),form=root.querySelector('form');
  form.querySelector('[name="averagePowerWatts"]').value='210';form.querySelector('[name="enduranceBodyweightKg"]').value='70';
  await x.handleSubmit({target:form,preventDefault(){}});
  let restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);
  assert.equal(restored.triathlon.activities.at(-1).averagePowerWatts,210);assert.equal(restored.triathlon.activities.at(-1).bodyweightKg,70);
  const imported=runtime.parseGarminActivities([{sport:'cycling',activityId:99,date:'2026-09-01',distance:20000,duration:2700,avgPower:200,bodyweightKg:80},{sport:'cycling',activityId:100,date:'2026-09-01',distance:20000,duration:2700,avgPower:400,deviceWatts:false}], 'bike');
  assert.equal(imported[0].averagePowerWatts,200);assert.equal(imported[1].powerSource,'estimated');
  runtime.storeGarminActivities(x,imported);restored=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);
  assert.equal(restored.triathlon.activities.find(item=>item.id===imported[0].id).bodyweightKg,80);
});
test('live recording snapshots weight, accepts power, and clears it on a corrected failed-save retry',async()=>{
  const x=app();x.state.profile.bodyweightKg=70;tracker.start(x,{sport:'bike',mode:'timer'},Date.now()-1800000);tracker.pause(x);
  x.state.profile.bodyweightKg=90;x.ui.modal={type:'x42-tracker-finish'};
  assert.equal(fragment(x.renderModal()).querySelector('[name="enduranceBodyweightKg"]').value,'70');
  x.persist=async()=>false;assert.equal(await tracker.save(x,{distanceMeters:15000,durationSeconds:1800,averagePowerWatts:210,bodyweightKg:70}),false);
  assert.equal(x.state.triathlon.activities.at(-1).averagePowerWatts,210);
  x.persist=async()=>true;assert.equal(await tracker.save(x,{distanceMeters:15000,durationSeconds:1800,averagePowerWatts:null,bodyweightKg:null}),true);
  assert.equal(x.state.triathlon.activities.length,1);assert.equal(x.state.triathlon.activities[0].averagePowerWatts,undefined);
  assert.equal(x.state.triathlon.activities[0].bodyweightKg,undefined);
});
test('the complete training week collapses by default and persists the user toggle without hiding actions permanently',()=>{
  const x=app();x.ui.view='home';x.state.settings.homeX51={modules:{week:true}};const html=x.renderHome(),root=fragment(html),fold=root.querySelector('[data-x48-week]');
  assert.equal(fold.open,false);assert.equal(fold.querySelectorAll('.rfx45-week-days>article').length,7);
  assert.ok(fold.querySelector('[data-action="rf1000-plan-edit"]'));assert.ok(fold.querySelector('[data-action="x45-connections"]'));
  w.RANKFORGE_APP=x;w.document.getElementById('app').innerHTML=html;
  const live=w.document.querySelector('[data-x48-week]');live.open=true;live.dispatchEvent(new w.Event('toggle'));
  x.state=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);assert.equal(fragment(x.renderHome()).querySelector('[data-x48-week]').open,true);
  live.open=false;live.dispatchEvent(new w.Event('toggle'));assert.equal(x.state.settings.x48WeekExpanded,false);delete w.RANKFORGE_APP;
});
test('the challenge displays separate capped goals and still awards its existing reward only once',async()=>{
  const x=app();x.state.challenges.history=[];x.metrics.weeklyWorkouts=Array.from({length:4},()=>({setsCount:3,xp:10}));
  let root=fragment(x.renderV7Challenge(true));assert.equal(root.querySelectorAll('progress').length,2);
  assert.deepEqual([...root.querySelectorAll('progress')].map(item=>[item.value,item.max]),[[3,3],[12,36]]);
  assert.match(root.textContent,/12 \/ 36/);assert.doesNotMatch(root.textContent,/67%|4\/3|Deine zwei Wochenziele|insgesamt aufgezeichnet/);
  const coins=Number(x.state.profile.eggs||0);await click(x,'v7-claim-challenge');assert.equal(Number(x.state.profile.eggs||0),coins);
  x.metrics.weeklyWorkouts=Array.from({length:3},()=>({setsCount:12,xp:10}));
  root=fragment(x.renderV7Challenge());assert.ok(root.querySelector('[data-action="v7-claim-challenge"]'));
  await click(x,'v7-claim-challenge');await click(x,'v7-claim-challenge');assert.equal(x.state.profile.eggs,coins+75);
});
test('locker has one scroll owner containing the final reward and close action; profile design link is removed',()=>{
  const x=app();x.ui.modal={type:'eggs'};const root=fragment(x.renderModal());
  const modal=root.querySelector('.modal.rfx48-locker'),scroll=modal.querySelector('.rfx48-locker-scroll');
  assert.ok(modal);assert.equal(modal.querySelectorAll('.modal-scroll').length,1);
  assert.match(scroll.textContent,/Carbon Edge/);assert.ok(scroll.querySelector('.rf893-locker-footer [data-action="rf893-close-locker"]'));
  assert.ok(modal.querySelector('.modal-header [data-action="close-modal"]'));
  x.state.health={authorization:'unknown'};assert.equal(fragment(x.renderProfile()).querySelector('.rfx3-design-link'),null);
});
test('each sport exposes its own ranking explanation on the sport page and Ranks tab',()=>{
  const x=app();x.state.trainingPlanV10={activeSports:['strength','swim','run','bike']};x.state.homeRanksV103={order:['strength','swim','run','bike']};
  for(const sport of ['run','bike','swim']){
    x.ui.view='triathlon';x.ui.rf970Sport=sport;
    assert.ok(fragment(x.renderHome()).querySelector('[data-action="x53-component"]'));
    x.ui.x53RankSport=sport;x.ui.rf103RankSport=sport;assert.ok(fragment(x.renderRanks()).querySelector('[data-action="x53-rank-help"]'));
    x.openModal('x53-rank-help',{sport});assert.ok(fragment(x.renderModal()).querySelector('.rfx48-endurance a').href.includes({run:'runninglevel',swim:'swimminglevel',bike:'cyclinglevel'}[sport]));
  }
});
