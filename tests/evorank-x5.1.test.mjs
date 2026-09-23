import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w}=appEnv();
const model=w.EVORANK_PROGRESS_X51;
function app(key='x51') {const x=new a.LiftoffApp();x.accountKey=key;x.state=a.normalizeState(a.initialState(key),key);x.state.health={authorization:'unknown'};x.metrics=a.getMetrics(x.state);x.scheduleSave=()=>{};x.render=()=>{};x.showToast=()=>{};x.closeModal=()=>{x.ui.modal=null;};return x;}
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};
const click=(x,html)=>x.handleClick({target:fragment(html).firstElementChild,preventDefault(){}});
test('progress retains irregular real dates, completed cable snapshots and excludes warmups',()=>{
  const state={workouts:[{id:'a',name:'A',endedAt:'2026-09-01T10:00:00Z',exercises:[{exerciseId:'cable-test',name:'Kabel Curl',equipment:'Kabelzug',cableRatio:1,sets:[{done:true,weightKg:40,reps:8,cableRatio:2},{done:false,weightKg:90,reps:10},{done:true,type:'warmup',weightKg:90,reps:10}]}]}, {id:'b',name:'B',endedAt:'2026-09-11T10:00:00Z',exercises:[{exerciseId:'cable-test',name:'Kabel Curl',equipment:'Kabelzug',sets:[{done:true,weightKg:30,reps:8,cableRatio:1}]}]}]};
  const points=model.series(state,'cable-test','load',0,Date.parse('2026-09-13'));assert.deepEqual(Array.from(points,p=>p.value),[20,30]);assert.equal(points[1].time-points[0].time,10*86400000);
  assert.deepEqual(Array.from(model.series(state,'total','volume',0,Date.parse('2026-09-13')),p=>p.value),[160,240]);
  const before=JSON.stringify(state);model.series(state,'cable-test','e1rm',0);assert.equal(JSON.stringify(state),before);
});
test('bodyweight estimates require historical weight and do not use current profile; unilateral volume sums both sides',()=>{
  const workout={id:'d',endedAt:'2026-09-01',exercises:[{exerciseId:'dips-test',name:'Dips',bodyweightMode:'added',sets:[{done:true,weightKg:40,reps:8}]}]};
  const state={profile:{bodyweightKg:110},workouts:[workout]};assert.equal(model.series(state,'dips-test','e1rm',0).length,0);
  workout.bodyweightKg=70;assert.ok(Math.abs(model.series(state,'dips-test','e1rm',0)[0].value-139.3333)<.01);
  workout.exercises=[{exerciseId:'custom',name:'Curl',sets:[{done:true,unilateral:true,left:{weightKg:10,reps:8},right:{weightKg:12,reps:7}}]}];
  assert.equal(model.series(state,'total','volume',0)[0].value,164);
});
test('sport statistics compare equal windows using measured distances and distinct days',()=>{
  const now=Date.parse('2026-09-13T12:00:00Z'),r=model.sportSummary([{date:'2026-09-12T10:00:00Z',distanceMeters:1000,durationSeconds:300},{date:'2026-09-12T15:00:00Z',distanceMeters:3000,durationSeconds:1200},{date:'2026-08-01',distanceMeters:2000,durationSeconds:800}],now);
  assert.equal(r.current.days,1);assert.equal(r.current.longest,3000);assert.equal(r.current.speed,4000/1500);assert.equal(r.previous.longest,2000);
});
test('home settings and chart pins survive normalization and stay account scoped',()=>{
  const x=app(),s=w.EVORANK_X51.settings(x);s.sports=['bike'];s.active='bike';s.pins=['bench-press'];s.modules.calendar=true;w.EVORANK_X51.saveSettings(x,s);
  x.state=a.normalizeState(x.state,x.accountKey);const saved=w.EVORANK_X51.settings(x);assert.deepEqual(Array.from(saved.sports),['bike']);assert.equal(saved.pins[0],'bench-press');assert.equal(saved.modules.calendar,true);
  assert.deepEqual(Array.from(w.EVORANK_X51.settings(app('other')).pins),['total']);
  const home=fragment(x.renderHome());assert.ok(home.querySelector('.x53-figure--bike'));assert.equal(home.querySelector('.home-bodygraph-section'),null);assert.equal(home.querySelector('.next-workout-card:not(.x55-sport-start)'),null);assert.equal(home.querySelector('.x55-sport-start [data-action="x53-record"]').dataset.sport,'bike');assert.ok(home.querySelector('.rf1000-home-calendar'));
  assert.equal(fragment(x.renderBottomNav()).querySelector('.nav-create').dataset.action,'x55-training');
});
test('all exercises including untrained entries have a history entry and truthful empty chart',()=>{
  const x=app(),id=a.EXERCISES[0].id;
  x.state.exercisePreferences={favorites:[],unavailable:[]};
  assert.ok(fragment(x.renderV7ExerciseInfo({exerciseId:id})).querySelector('[data-action="v7-exercise-history"]'));
  const html=x.renderV7ExerciseHistory(id);assert.match(html,/Noch keine passenden Aufzeichnungen/);assert.doesNotMatch(html,/x51-line/);
  assert.match(w.EVORANK_X51.exerciseList(x,'nicht-existent-zzzz'),/0 Übungen/);
});
test('body data saves in profile, invalid dates and weights cannot change history or profile',async()=>{
  const x=app();const history=JSON.stringify(x.state.workouts),form=fragment(x.renderProfileEditModal()).querySelector('form');
  form.elements.x51Height.value='184';form.elements.x51Weight.value='70';form.elements.x51Birth.value='2009-08-02';
  await x.handleSubmit({target:form,preventDefault(){}});assert.equal(x.state.profile.heightCm,184);assert.equal(x.state.profile.bodyweightKg,70);assert.equal(x.state.profile.birthDate,'2009-08-02');assert.equal(JSON.stringify(x.state.workouts),history);
  const roundtrip=a.normalizeState(x.state,x.accountKey);assert.equal(roundtrip.profile.heightCm,184);
  const before=JSON.stringify(x.state.profile);form.elements.x51Weight.value='-10';await x.handleSubmit({target:form,preventDefault(){}});assert.equal(JSON.stringify(x.state.profile),before);
});
test('36 rank badges retain their supplied names and nine numeric tiers',()=>{
  const original=JSON.parse(readFileSync('public/rankforge/assets/ranks-x5.1/design.json'));
  for(const sport of ['strength','run','bike','swim'])for(let index=0;index<9;index++){
    const badge=fragment(w.EVORANK_ART_X51.badge(sport,index));assert.equal(badge.querySelector('svg').getAttribute('aria-label'),original.sports[sport].ranks[index]);
    assert.equal(badge.querySelector('image').getAttribute('href'),`./assets/ranks-x5.7/${sport}-${index}.png`);
  }
  const icons=fragment(w.RANKFORGE970.rankBadge('run',0)+w.RANKFORGE970.rankBadge('run',0));const ids=[...icons.querySelectorAll('[id]')].map(el=>el.id);assert.equal(new Set(ids).size,ids.length);
  for(let i=0;i<9;i++)assert.equal(a.rankFromScore(i*100).index,i);
});
test('Apple is the only appearance and height never changes ranking score',()=>{
  const x=app();x.state.settings.interfaceX49='classic';w.EVORANK_APPLE_X49.apply(x);assert.equal(x.state.settings.interfaceX49,'apple');x.ui.modal={type:'design'};assert.doesNotMatch(x.renderModal(),/EvoRank klassisch|data-action="x49-interface"/);
  const before=a.getMetrics(x.state).rank.score;x.state.profile.heightCm=201;assert.equal(a.getMetrics(x.state).rank.score,before);
});
test('Netlify allows same-origin GPS only and all new assets are available offline',()=>{
  assert.match(readFileSync('public/rankforge/_headers','utf8'),/geolocation=\(self\)/);
  const sw=readFileSync('public/rankforge/service-worker.js','utf8');
  for(const file of ['progress-x5.1.js','rank-art-x5.1.js','evorank-x5.1.js','evorank-x5.1-ui.css'])assert.ok(sw.includes(file),file);
  for(const sport of ['strength','run','bike','swim'])for(let index=0;index<9;index++)assert.ok(sw.includes(`ranks-x5.7/${sport}-${index}.png`));
});
