import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv(),families=w.EVORANK_FAMILIES_X43;
w.HTMLMediaElement.prototype.play=async()=>{};
w.HTMLMediaElement.prototype.pause=()=>{};
after(()=>dom.window.close());
function app() {
  const x=new a.LiftoffApp();x.accountKey='x43-test';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);
  x.state.exercisePreferences||={favorites:[],recent:[],unavailable:[]};x.state.draft={id:'draft',exercises:[]};
  x.ui.modal={type:'exercise-picker',context:'workout'};x.ui.exerciseMuscle='Alle';x.ui.exerciseEquipment='Alle';
  x.scheduleSave=()=>{};x.render=()=>{};x.showToast=()=>{};return x;
}
function render(x) {const t=w.document.createElement('template');t.innerHTML=x.renderExercisePickerModal(x.ui.modal);return t.content;}
test('all catalog entries retain their IDs, fields and distinct references when grouped',()=>{
  const before=JSON.stringify(a.EXERCISES),groups=families.groupExercises(a.EXERCISES),entries=groups.flatMap(g=>g.exercises);
  assert.equal(entries.length,1501);assert.equal(new Set(entries.map(e=>e.id)).size,1501);assert.equal(JSON.stringify(a.EXERCISES),before);
  const bench=groups.find(g=>g.title==='Bankdrücken');assert.ok(bench.exercises.length>30);
  for(const angle of ['15°','30°','45°'])assert.ok(bench.exercises.some(e=>e.name.includes(angle)));
  for(const equipment of ['Langhantel','Kurzhantel','Smith Machine'])assert.ok(bench.exercises.some(e=>e.equipment===equipment));
  assert.ok(groups.length<500,'substantially fewer main-list rows');
});
test('custom exercises and unrelated movements do not merge into catalog families',()=>{
  const custom={id:'custom-bench',name:'Bankdrücken',isCustom:true,muscle:'Brust'};
  const groups=families.groupExercises([...a.EXERCISES,custom]);assert.equal(groups.find(g=>g.key==='custom:custom-bench').exercises.length,1);
  for(const [first,second] of [['Dips','Bench Dips (Gewichtet)'],['Preacher Curl (Maschine)','Beinbeuger – sitzend (Maschine)']]) {
    const aa=a.EXERCISES.find(e=>e.name===first),bb=a.EXERCISES.find(e=>e.name===second);assert.ok(aa&&bb);
    assert.notEqual(families.familyOf(aa).key,families.familyOf(bb).key);
  }
});
test('search finds angles and equipment before grouping and never hides the matching variant',()=>{
  const x=app();x.ui.exerciseSearch='bankdrücken 30';x.ui.exerciseEquipment='Langhantel';
  const matched=families.matches(x,x.ui.modal);assert.equal(matched.length,1);assert.ok(matched[0].name.includes('30°'));
  const fragment=render(x);assert.ok(fragment.querySelector(`[data-exercise-id="${matched[0].id}"]`));
  x.ui.exerciseSearch='bankdrücken';x.ui.exerciseEquipment='Alle';const full=render(x);
  assert.equal(full.querySelectorAll('.rfx43-family').length,1);assert.equal(full.querySelector('.rfx43-family').open,false);
  assert.equal(full.querySelectorAll('.rf77-picker-row').length,0,'variants are populated only on expansion');
});
test('favorites, recents, unavailable and existing workout/routine exclusions apply to each variant',()=>{
  const x=app(),flat='79D0BB3A',incline='BENCH_BB_INCLINE';x.ui.exerciseSearch='bankdrücken';
  x.state.exercisePreferences.favorites=[incline];x.ui.exercisePickerTab='favorites';assert.deepEqual(Array.from(families.matches(x,x.ui.modal),e=>e.id),[incline]);
  x.state.exercisePreferences.recent=[flat];x.ui.exercisePickerTab='recent';assert.deepEqual(Array.from(families.matches(x,x.ui.modal),e=>e.id),[flat]);
  x.state.exercisePreferences.unavailable=[flat];x.ui.exercisePickerTab='all';assert.ok(!families.matches(x,x.ui.modal).some(e=>e.id===flat));
  x.ui.exercisePickerTab='unavailable';assert.deepEqual(Array.from(families.matches(x,x.ui.modal),e=>e.id),[flat]);
  x.ui.exercisePickerTab='all';const e=a.instantiateExercise(x.state,incline);x.state.draft.exercises=[e];assert.ok(!families.matches(x,x.ui.modal).some(e=>e.id===incline));
  x.ui.modal.replaceExerciseId=e.id;assert.ok(families.matches(x,x.ui.modal).some(e=>e.id===incline));
  x.state.routines=[{id:'routine',exercises:[e]}];assert.ok(!families.matches(x,{context:'routine',routineId:'routine'}).some(e=>e.id===incline));
});
test('opening a group loads all variants and detail navigation retains the exact exercise and replacement context',async()=>{
  const x=app();x.ui.exerciseSearch='bankdrücken';x.ui.modal={type:'exercise-picker',context:'routine',routineId:'routine',replaceExerciseId:'old-instance'};w.RANKFORGE_APP=x;
  w.document.getElementById('app').replaceChildren(render(x));const details=w.document.querySelector('.rfx43-family');
  details.open=true;details.dispatchEvent(new w.Event('toggle'));
  assert.equal(details.querySelectorAll('.rf77-picker-row').length,families.matches(x,x.ui.modal).length);
  const button=details.querySelector('[data-exercise-id="RF81-8FC7DC62EF"]');assert.ok(button);
  await x.handleClick({target:button,preventDefault(){}});assert.equal(x.ui.modal.type,'v7-exercise-info');assert.equal(x.ui.modal.exerciseId,'RF81-8FC7DC62EF');
  assert.equal(x.ui.modal.returnToPicker.routineId,'routine');assert.equal(x.ui.modal.returnToPicker.replaceExerciseId,'old-instance');
  x.ui.modal={type:'exercise-picker',...x.ui.modal.returnToPicker};assert.equal(render(x).querySelector('.rfx43-family').open,true);
  w.RANKFORGE_APP=null;
});
test('pagination counts complete families and keeps the create-exercise action',()=>{
  const x=app(),groups=families.groupExercises(families.matches(x,x.ui.modal));assert.ok(groups.length>60);
  const fragment=render(x),list=fragment.querySelector('.rf77-picker-list');
  assert.equal(list.querySelectorAll(':scope>.rfx43-family,:scope>.rf77-picker-row').length,60);
  assert.ok(list.querySelector('[data-action="v7-picker-more"]'));assert.ok(list.querySelector('[data-action="custom-exercise"]'));
  x.ui.exerciseLimit=120;const expanded=render(x).querySelector('.rf77-picker-list');
  assert.equal(expanded.querySelectorAll(':scope>.rfx43-family,:scope>.rf77-picker-row').length,Math.min(groups.length,120));
});
test('muscle status distinguishes direct exercise score, secondary transfer and X4.5 support weighting',()=>{
  const getStatuses=new vm.Script('getMuscleStatuses').runInContext(dom.getInternalVMContext());
  const dip=a.EXERCISES.find(e=>e.id==='DIP_BW'),score=a.scoreLift({exercise:dip,weightKg:40,reps:8},70);
  assert.equal(score,480);assert.equal(a.rankFromScore(score).key,'platinum');
  const statuses=getStatuses([{exerciseId:dip.id,muscle:dip.muscle,score}]);
  const primary=Object.values(statuses).find(s=>s.exercises[0]?.contribution==='primary');assert.equal(primary.score,480);
  const secondary=Object.values(statuses).find(s=>s.exercises[0]?.contribution==='secondary');assert.equal(secondary.score,278);
  const other=a.EXERCISES.filter(e=>e.muscle===dip.muscle&&e.id!==dip.id).slice(0,4);
  const lifts=[{exerciseId:dip.id,muscle:dip.muscle,score},...other.map((e,i)=>({exerciseId:e.id,muscle:e.muscle,score:[320,200,100,1][i]}))];
  const result=getStatuses(lifts)[primary.group.key],weights=[1,2**-.25,3**-.25];
  const expected=Math.round(480*.7+[320,200,100].reduce((sum,value,i)=>sum+value*weights[i],0)/weights.reduce((sum,n)=>sum+n,0)*.3);
  assert.equal(result.score,expected);assert.notEqual(result.score,score);
});
