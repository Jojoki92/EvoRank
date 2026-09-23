import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {appEnv} from './helpers/x2-app-env.mjs';

test('cloud bridge fails closed when the account-scoped consent module is absent',()=>{
 const dom=new JSDOM('<div id="app"></div>',{url:'http://localhost/',runScripts:'outside-only'}),w=dom.window;
 try{
  w.RANKFORGE_ACCOUNT={status:()=>({signedIn:false}),onChange(){}};
  w.localStorage.setItem('evorank-health-cloud-consent-v1','accepted');
  w.RANKFORGE_APP={state:{privacyV110:{cloudHealthConsent:true}},accountKey:'unverified'};
  new vm.Script(fs.readFileSync('public/rankforge/assets/account-bridge-v1.js','utf8')).runInContext(dom.getInternalVMContext());
  assert.equal(w.RANKFORGE_BRIDGE.cloudConsent(),false);
  assert.equal(w.RANKFORGE_BRIDGE.setCloudConsent(true),false);
  assert.equal(w.localStorage.getItem('evorank-health-cloud-consent-v1'),'accepted');
  w.EVORANK_CLOUD_CONSENT_X49={read:()=>true,set:enabled=>enabled};
  assert.equal(w.RANKFORGE_BRIDGE.cloudConsent(),true);
  assert.equal(w.RANKFORGE_BRIDGE.setCloudConsent(false),false);
 }finally{w.close();}
});

test('selected muscles change their actual SVG paint and deselection restores it without replacing the figure',async()=>{
 const {dom,w,api}=appEnv();try{
  const a=new api.LiftoffApp();a.accountKey='x57';a.state=api.normalizeState(api.initialState(a.accountKey),a.accountKey);a.state.onboardingComplete=true;a.state.health={authorization:'unknown'};a.state.triathlon={activities:[]};a.metrics=api.getMetrics(a.state);a.scheduleSave=()=>{};w.RANKFORGE_APP=a;
  for(const sex of ['male','female']){
   a.state.profile.bodyProfile=sex;a.ui.view='home';a.ui.rf108HomeSelectedMuscle=null;a.render();
   const figure=w.document.querySelector('.body-figure');assert.ok(figure);
   for(const muscle of ['core','forearms']){
    const region=figure.querySelector('[data-muscle="'+muscle+'"]');assert.ok(region,muscle);
    const shape=region.querySelector('.rf920-muscle-fill,path:not([class*="muscle-hit"]):not(.rf911-anatomy-lines)');assert.ok(shape);
    const before=shape.getAttribute('fill');assert.match(before,/^#[a-f0-9]{6}$/i);
    a.ui.rf108HomeSelectedMuscle=muscle;assert.equal(a.renderMuscleSelection('home'),true);
    const expected='#'+[1,3,5].map(i=>Math.round(parseInt(before.slice(i,i+2),16)*.62).toString(16).padStart(2,'0')).join('');
    assert.equal(shape.getAttribute('fill'),expected);assert.equal(region.getAttribute('aria-pressed'),'true');
    a.ui.rf108HomeSelectedMuscle=null;a.renderMuscleSelection('home');assert.equal(shape.getAttribute('fill'),before);assert.equal(w.document.querySelector('.body-figure'),figure);
   }
   assert.equal(w.document.querySelector('.next-workout-card__body .x51-badge,.next-workout-card__body .workout-glyph'),null);
  }
 }finally{await new Promise(r=>setImmediate(r));dom.window.close();}
});

test('all four rank families use individual RGBA files without browser background masks',()=>{
 const {dom,w}=appEnv();try{
  const files=new Set();for(const sport of ['strength','run','bike','swim'])for(let i=0;i<9;i++){
   const t=w.document.createElement('template');t.innerHTML=w.EVORANK_ART_X51.badge(sport,i);
   assert.equal(t.content.querySelectorAll('filter,mask').length,0);
   const src=t.content.querySelector('image').getAttribute('href');assert.equal(src,`./assets/ranks-x5.7/${sport}-${i}.png`);files.add(src);
   const png=fs.readFileSync('public/rankforge/'+src.slice(2));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png[25],6,'RGBA transparency channel');
  }assert.equal(files.size,36);
 }finally{dom.window.close();}
});
