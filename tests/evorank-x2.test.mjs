import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();
const model=w.EVORANK_X2_RANKS;
const ex=id=>a.EXERCISES.find(e=>e.id===id);
const score=(id,kg,reps=8,extra={})=>a.scoreLift({exercise:ex(id),exerciseId:id,weightKg:kg,reps,...extra},75);
function app(){const app=new a.LiftoffApp();app.state=a.initialState('x2-test');Object.assign(app.state.profile,{bodyweightKg:75,bodyProfile:'male'});app.state.draft={id:'draft',startedAt:new Date().toISOString(),name:'Test',exercises:['729237D1','10347BAC',a.EXERCISES.find(model.isCable).id].map(id=>a.instantiateExercise(app.state,id))};app.scheduleSave=()=>{};app.render=()=>{};app.showToast=()=>{};return app;}
after(()=>dom.window.close());
test('bodyweight variants and old snapshots use the same current calibration',()=>{
 // X4.2 uses bodyweight-specific community anchors rather than one fixed ratio.
 assert.equal(score('729237D1',10),355);assert.equal(score('PULLUP_BW',10),355);
 assert.equal(score('10347BAC',40),466);assert.equal(score('DIP_BW',40),466);
 assert.equal(a.rankFromScore(355).key,'gold');assert.equal(a.rankFromScore(466).key,'platinum');
 assert.equal(a.scoreLift({exerciseId:'729237D1',exercise:{id:'729237D1',name:'Klimmzug',bodyweightMode:'none',reference1RMKg:900},weightKg:10,reps:8},75),355);
 assert.equal(a.epleyOneRepMax(100,1),100);assert.equal(a.epleyOneRepMax(100,0),0);
});
test('all 1501 exercises produce finite ranks and respect non-rankable mobility',()=>{
 assert.equal(a.EXERCISES.length,1501);
 for(const e of a.EXERCISES)for(const bw of [45,75,120]){
  const lift={exercise:e,exerciseId:e.id,weightKg:20,reps:8,durationSeconds:60,distanceMeters:30};
  const low=a.scoreLift(lift,bw),high=a.scoreLift({...lift,weightKg:40,reps:10,durationSeconds:90,distanceMeters:40},bw);
  assert.ok(Number.isFinite(low)&&low>=0,e.name);assert.ok(Number.isFinite(high)&&high>=0,e.name);
  if(e.rankable===false)assert.equal(high,0,e.name);
  else if(e.bodyweightMode!=='assisted')assert.ok(high>=low,e.name);
 }
});
test('assistance subtracts bodyweight and female calibration is retained',()=>{
 const assisted=a.EXERCISES.find(e=>e.bodyweightMode==='assisted');
 assert.equal(model.loadFor(assisted,20,75),55);
 assert.ok(score(assisted.id,20)>score(assisted.id,40));assert.equal(score(assisted.id,100),0);
 assert.ok(score('729237D1',10,8,{bodyProfile:'female'})>score('729237D1',10));
 const female=app();female.state.profile.bodyProfile='female';female.state.draft.exercises[0].sets=[a.normalizeSet({weightKg:10,reps:8,done:true})];
 const summary=a.buildWorkoutSummary(female.state,female.state.draft);assert.equal(summary.bodyProfile,'female');
 assert.equal(a.scoreLift(summary.bestLifts[0],75),score('729237D1',10,8,{bodyProfile:'female'}));
});
test('cable weight is normalized exactly once; settings survive save and reload',()=>{
 const x=app(),c=x.state.draft.exercises[2];c.sets=[a.normalizeSet({weightKg:40,reps:8,done:true}),a.normalizeSet({weightKg:40,reps:8,done:false})];
 x.setX2Cable(c.id,2,'stack');assert.equal(c.sets[0].cableRatio,1);assert.equal(c.sets[1].cableRatio,2);
 assert.equal(model.handleWeight(c,40),20);assert.equal(model.handleWeight({...c,cableInputMode:'handle'},20),20);
 const normalized=a.normalizeState(JSON.parse(JSON.stringify(x.state)),'x2-test');const restored=normalized.draft.exercises[2];
 assert.equal(restored.cableRatio,2);assert.equal(restored.sets[0].cableRatio,1);assert.equal(restored.sets[1].cableRatio,2);
 const fresh=a.instantiateExercise(normalized,c.exerciseId);assert.equal(fresh.cableRatio,2);
 c.sets[1].done=true;const lifts=model.candidates({exercises:[c]},new Date().toISOString(),75);
 assert.equal(lifts[0].exercise.cableRatio,1);
 assert.equal(a.workoutVolumeFromDraft({exercises:[c]}),480);
 const work=a.normalizeWorkout({bodyweightKg:75,bodyProfile:'male',exercises:[c],bestLifts:lifts});assert.equal(work.exercises[0].sets[1].cableRatio,2);
});
test('rank records are rebuilt from completed sets and ignore warmups',()=>{
 const x=app(),e=x.state.draft.exercises[0];e.sets=[a.normalizeSet({weightKg:10,reps:8,done:true}),a.normalizeSet({weightKg:200,reps:30,type:'warmup',done:true})];
 const work={id:'saved',bodyweightKg:75,exercises:[e],bestLifts:[{exerciseId:e.exerciseId,weightKg:200,reps:30,exercise:ex(e.exerciseId)}],xp:123,eggs:16};
 const before=JSON.stringify(work);const best=a.collectBestLifts([work],75);assert.equal(best[0].score,355);assert.equal(JSON.stringify(work),before);
});
test('best set selection uses actual bodyweight instead of a fixed 75 kg',()=>{
 const x=app();x.state.profile.bodyweightKg=45;const e=x.state.draft.exercises[0];
 e.sets=[a.normalizeSet({weightKg:0,reps:20,done:true}),a.normalizeSet({weightKg:30,reps:5,done:true})];
 assert.equal(a.buildWorkoutSummary(x.state,x.state.draft).bestLifts[0].weightKg,30);
 x.state.profile.bodyweightKg=120;assert.equal(a.buildWorkoutSummary(x.state,x.state.draft).bestLifts[0].weightKg,0);
});
test('earned XP and rewards survive recalculation and reload',()=>{
 const x=app(),e=x.state.draft.exercises[0];e.sets=[a.normalizeSet({weightKg:10,reps:8,done:true})];
 x.state.workouts=[a.normalizeWorkout({id:'past',bodyweightKg:75,xp:456,eggs:19,exercises:[e]})];
 x.state.profile.legacyXp=123;const before=JSON.stringify(x.state.workouts);
 a.getMetrics(x.state);assert.equal(JSON.stringify(x.state.workouts),before);
 const normalized=a.normalizeState(JSON.parse(JSON.stringify(x.state)),'x2-test');assert.equal(normalized.workouts[0].xp,456);assert.equal(normalized.workouts[0].eggs,19);
});
test('routine save and instantiation preserve cable settings and order',()=>{
 const x=app(),e=x.state.draft.exercises[2];x.setX2Cable(e.id,3,'stack');x.moveX2Exercise(e.id,0);
 const form=w.document.createElement('form'),data=new w.FormData();data.set('title','Saved order');
 x.closeModal=()=>{};x.saveDraftAsRoutine(form,data);
 const routine=x.state.routines.find(r=>r.id===x.state.draft.routineId);
 assert.equal(routine.exercises[0].exerciseId,e.exerciseId);assert.equal(routine.exercises[0].cableRatio,3);
 const normalized=a.normalizeRoutine(JSON.parse(JSON.stringify(routine)));const next=a.instantiateRoutine(x.state,normalized);
 assert.equal(next.exercises[0].cableRatio,3);assert.equal(next.exercises[0].exerciseId,e.exerciseId);
});
test('moving exercises to arbitrary positions keeps all IDs, sets, notes and persists order',()=>{
 const x=app(),initial=x.state.draft.exercises.map(e=>e.id);x.state.draft.exercises[0].notes='keep';const original=JSON.stringify(x.state.draft.exercises[0]);
 x.moveX2Exercise(initial[0],2);assert.equal(x.state.draft.exercises[2].id,initial[0]);assert.equal(JSON.stringify(x.state.draft.exercises[2]),original);
 const loaded=a.normalizeState(JSON.parse(JSON.stringify(x.state)),'x2-test');assert.deepEqual(Array.from(loaded.draft.exercises,e=>e.id),[initial[1],initial[2],initial[0]]);
 x.moveX2Exercise(initial[0],0);assert.deepEqual(Array.from(x.state.draft.exercises,e=>e.id),initial);
});
test('position control and cable save work via DOM events',()=>{
 const x=app();w.RANKFORGE_APP=x;const first=x.state.draft.exercises[0];
 w.document.getElementById('app').innerHTML=x.state.draft.exercises.map((e,i)=>x.renderWorkoutExercise(e,i)).join('');
 const select=w.document.querySelector('[data-x2-order]');assert.equal(select.options.length,3);select.value='2';select.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(x.state.draft.exercises[2].id,first.id);
 const panel=w.document.querySelector('.rfx2-cable');panel.querySelector('[data-x2-ratio]').value='3';const button=panel.querySelector('button');x.handleClick({target:button,preventDefault(){}});
 assert.equal(x.state.draft.exercises.find(e=>e.id===panel.dataset.exerciseId).cableRatio,3);w.RANKFORGE_APP=null;
});
test('female lats use only symmetric torso shapes and preserve the full SVG',()=>{
 const html=a.bodyFigure('back',{},'lats',{bodyProfile:'female'});const t=w.document.createElement('template');t.innerHTML=html;
 assert.equal(t.content.querySelectorAll('.rfx2-lat-shape').length,2);assert.equal(t.content.querySelectorAll('.rf912-female-lat-correction').length,0);
 assert.ok(t.content.querySelectorAll('svg .muscle-region').length===9);assert.equal(t.content.querySelectorAll('svg').length,1);
 const staticHtml=a.bodyFigure('back',{},'lats',{bodyProfile:'female',interactive:false});assert.ok(!staticHtml.match(/class="rfx2-lat-shape"[^>]+data-action/));
});
test('PWA name, identity, versioned assets and all precache resources exist',()=>{
 const root='public/rankforge/';const manifest=JSON.parse(readFileSync(root+'manifest.webmanifest','utf8'));
 assert.equal(manifest.name,'EvoRank');assert.equal(manifest.short_name,'EvoRank');assert.equal(manifest.id,'./');assert.equal(manifest.start_url,'./index.html');
 const index=readFileSync(root+'index.html','utf8');assert.match(index,/evorank-x2-ranks.js/);assert.match(index,/apple-touch-icon" href=".\/icons\/evorank-x4-180.png/);
 const sw=readFileSync(root+'service-worker.js','utf8');const files=sw.split('const CORE = [')[1].split('];')[0];
 for(const match of files.matchAll(/"\.\/([^"?]*)(?:\?[^\"]*)?"/g))assert.ok(existsSync(root+(match[1]||'index.html')),match[1]);
 for(const match of index.matchAll(/(?:src|href)="\.\/([^"?]+)(?:\?[^\"]*)?"/g))assert.ok(existsSync(root+match[1]),match[1]);
});
