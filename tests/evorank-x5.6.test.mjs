import test from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
function setup(){const e=appEnv(),{w,api}=e,app=new api.LiftoffApp();app.accountKey='x56-test';app.state=api.normalizeState(api.initialState(app.accountKey),app.accountKey);app.state.onboardingComplete=true;app.state.health={authorization:'unknown'};app.state.triathlon={activities:[]};app.metrics=api.getMetrics(app.state);app.scheduleSave=()=>{};app.showToast=()=>{};w.RANKFORGE_APP=app;return {...e,app};}
function fragment(w,html){const t=w.document.createElement('template');t.innerHTML=html;return t.content;}
async function close(dom){await new Promise(r=>setImmediate(r));dom.window.close();}

test('sport labels stay outside the SVG, expose all three competencies and select the corresponding region',async()=>{
 const {dom,w,app}=setup();try{
  for(const sport of ['run','bike','swim']){
   const s=w.EVORANK_X51.settings(app);s.active=sport;s.sports=['strength','run','bike','swim'];w.EVORANK_X51.saveSettings(app,s);app.ui.view='home';app.render();
   assert.equal(w.document.querySelectorAll('.x56-sport-map svg text').length,0);
   assert.equal(w.document.querySelectorAll('.x56-map-label').length,3);
   for(const key of ['tempo','distance','consistency']){
    app.handleClick({target:w.document.querySelector('.x56-map-label--'+key),preventDefault(){}});
    assert.equal(app.ui.x53Areas[sport],key);
    assert.equal(w.document.querySelector('.x56-map-label--'+key).getAttribute('aria-pressed'),'true');
    assert.equal(w.document.querySelector('.x53-region.is-selected').dataset.area,key);
   }
  }
 }finally{await close(dom);}
});

test('training chooser uses custom artwork for all four sports and opens the matching recorder',async()=>{
 const {dom,w,app}=setup();try{
  app.openModal('x55-training');const rows=w.document.querySelectorAll('.x55-training .x51-list-row');assert.equal(rows.length,4);
  for(const [i,sport] of ['strength','run','bike','swim'].entries())assert.match(rows[i].querySelector('svg image').getAttribute('href'),new RegExp(sport+'-0\\.png$'));
  const s=w.EVORANK_X51.settings(app);s.active='strength';w.EVORANK_X51.saveSettings(app,s);
  for(const sport of ['run','bike','swim']){
   const control=fragment(w,`<button data-action="x51-start-sport" data-sport="${sport}"></button>`).firstChild;
   app.handleClick({target:control,preventDefault(){}});
   assert.equal(app.ui.view,'triathlon');assert.equal(app.ui.rf970Sport,sport);
   assert.equal(w.document.querySelector('[data-form="x42-tracker-start"]').dataset.sport,sport);
  }
 }finally{await close(dom);}
});

test('profile exposes weight first, saves only through its form and retains historical workout bodyweight',async()=>{
 const {dom,w,app}=setup();try{
  app.state.profile.bodyweightKg=70;app.state.profile.birthDate='2000-01-01';app.state.workouts=[{id:'old',bodyweightKg:65,endedAt:'2026-09-01',exercises:[]}];
  const history=JSON.stringify(app.state.workouts),root=fragment(w,app.renderProfileEditModal()),form=root.querySelector('form');
  assert.ok(form.firstElementChild.classList.contains('x51-body-fields'));assert.equal(form.querySelector('.v7-field-grid input').name,'x51Weight');
  assert.equal(form.querySelectorAll('[name="x51Weight"]').length,1);assert.ok(form.querySelector('.x56-profile-details [name="name"]'));
  assert.equal(form.elements.x51Age.closest('label').hidden,true);form.elements.x51Birth.value='';app.handleChange({target:form.elements.x51Birth});assert.equal(form.elements.x51Age.closest('label').hidden,false);
  form.elements.x51Weight.value='74.5';app.render=()=>{};await app.handleSubmit({target:form,preventDefault(){}});
  assert.equal(app.state.profile.bodyweightKg,74.5);assert.equal(JSON.stringify(app.state.workouts),history);
  const profile=fragment(w,app.renderProfile());assert.equal(profile.querySelector('.bodyweight-card input'),null);assert.equal(profile.querySelector('.bodyweight-card'),null);assert.ok(profile.querySelector('[data-action="open-profile-edit"]'));
 }finally{await close(dom);}
});
