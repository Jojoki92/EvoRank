import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {appEnv} from './helpers/x2-app-env.mjs';
const {w,api:a}=appEnv(),m=w.EVORANK_SPORTS_X53,now=new Date('2026-09-15T12:00:00Z');
function app(){const x=new a.LiftoffApp();x.accountKey='x53-test';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.state.health={authorization:'unknown'};x.state.profile.birthDate='2000-01-01';x.state.profile.bodyweightKg=70;x.metrics=a.getMetrics(x.state);x.scheduleSave=()=>{};x.render=()=>{};x.showToast=()=>{};x.state.triathlon={activities:[]};const s=w.EVORANK_X51.settings(x);s.sports=['strength','run','bike','swim'];s.active='run';w.EVORANK_X51.saveSettings(x,s);return x;}
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};
function click(x,action,attrs=''){x.handleClick({target:fragment(`<button data-action="${action}" ${attrs}></button>`).firstElementChild,preventDefault(){}});}
function activity(sport='run',patch={}){return {id:'a',sport,date:'2026-09-14T12:00:00Z',distanceMeters:10000,durationSeconds:3600,source:'manual',...patch};}

test('competency colors decompose the same recorded performance and never change the total or history',()=>{
 const x=app();x.state.triathlon.activities=[activity(),activity('run',{id:'b',date:'2026-09-10',distanceMeters:5000,durationSeconds:1100})];
 const before=w.RANKFORGE970.sportMetrics('run',x,now).score,history=JSON.stringify(x.state.triathlon.activities),p=m.profile(x,'run',now);
 assert.equal(p.components.tempo.best.activity.id,'b');assert.equal(p.components.distance.best.activity.id,'a');assert.equal(p.components.consistency.days,2);
 assert.equal(p.components.tempo.score,w.RANKFORGE970.performanceDetails(p.components.tempo.best.activity,x.state.profile,now).tempoPoints);
 assert.equal(p.components.consistency.score,Math.round(800*26/99));assert.equal(w.RANKFORGE970.sportMetrics('run',x,now).score,before);assert.equal(JSON.stringify(x.state.triathlon.activities),history);
 assert.match(m.renderProfile(x,'run'),/Bereichsrang/);
 x.state.triathlon.activities=[activity('run',{distanceMeters:500}),activity('run',{id:'longer',distanceMeters:800})];assert.equal(m.profile(x,'run',now).components.distance.best.activity.id,'longer');
});
test('empty and future data remain unscored with the beginner color; consistency has a separate 28-day window',()=>{
 const x=app();x.state.triathlon.activities=[activity('run',{date:'2027-09-15'})];assert.equal(m.profile(x,'run',now).components.tempo.score,null);
 x.state.triathlon.activities=[activity('run',{date:'2026-01-01'})];const p=m.profile(x,'run',now);assert.ok(p.components.tempo.score>0);assert.equal(p.components.consistency.days,0);assert.equal(p.components.consistency.score,0);
 const empty=m.profile(x,'swim',now);assert.ok(Object.values(empty.components).every(c=>c.name===w.EVORANK_ART_X51.sports.swim.ranks[0]&&c.score===null&&c.index===null));assert.equal(m.tier(null).color,a.RANKS[0].color);
});
test('cycling power uses saved weight, current comparison profile, and the 20-minute qualification',()=>{
 const x=app();x.state.triathlon.activities=[activity('bike',{averagePowerWatts:210,bodyweightKg:70,powerSource:'measured',durationSeconds:1200,distanceMeters:10000})];
 const p=m.profile(x,'bike',now);assert.equal(p.components.tempo.label,'Leistung');assert.equal(p.components.tempo.best.detail.wattsPerKg,3);x.state.profile.bodyweightKg=120;assert.equal(m.profile(x,'bike',now).components.tempo.score,p.components.tempo.score);
 x.state.triathlon.activities[0].durationSeconds=1199;assert.equal(m.profile(x,'bike',now).components.tempo.best.detail.basis,'pace');
});
test('selection preserves all three rank colors and SVG IDs are unique across repeated figures',()=>{
 const x=app();x.state.triathlon.activities=[activity()];const p=m.profile(x,'run',now);
 const first=fragment(m.figure(p,'tempo')),second=fragment(m.figure(p,'distance'));
 assert.deepEqual([...first.querySelectorAll('.x53-region')].map(e=>e.getAttribute('style')),[...second.querySelectorAll('.x53-region')].map(e=>e.getAttribute('style')));
 assert.equal(first.querySelector('.is-selected').dataset.area,'tempo');assert.equal(second.querySelector('.is-selected').dataset.area,'distance');
 const both=fragment(m.figure(p)+m.figure(p));const ids=[...both.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);
 for(const sport of ['run','bike','swim'])assert.equal(fragment(m.figure(m.profile(x,sport,now))).querySelectorAll('[role="button"][tabindex="0"]').length,3);
});
test('Home rank follows sport; endurance has the same five sections and keeps recording reachable',()=>{
 const x=app();x.state.triathlon.activities=[activity()];
 for(const sport of ['run','bike','swim']){
  click(x,'x51-home-sport',`data-sport="${sport}"`);const home=fragment(x.renderHome());assert.ok(home.querySelector(`.x53-figure--${sport}`));assert.equal(home.querySelector('.x51-home-actions'),null);assert.ok(home.querySelector(`.rf103-rank-card[data-sport="${sport}"]`));
  x.ui.x53RankSport=sport;
  for(const [tab,selector] of [['rank','.x53-rank-hero'],['bodygraph','.x53-profile'],['gallery','.rank-gallery'],['analysis','.x53-analysis'],['leagues','.x53-friends']]){x.ui.rankTab=tab;const view=fragment(x.renderRanks());assert.equal(view.querySelectorAll('[data-action="rank-tab"]').length,5);assert.ok(view.querySelector(selector));if(tab==='gallery')assert.equal(view.querySelectorAll('.rank-gallery-card').length,9);}
 }
 click(x,'x53-record','data-sport="run"');assert.equal(x.ui.view,'triathlon');assert.equal(x.ui.modal,null);const tracker=fragment(x.renderHome());assert.ok(tracker.querySelector('[data-form="x42-tracker-start"][data-sport="run"]'));assert.equal(tracker.querySelector('.x51-home-tools'),null);
 click(x,'x53-manual','data-sport="bike"');assert.equal(x.ui.modal.type,'rf970-activity');assert.ok(fragment(x.renderModal()).querySelector('[name="averagePowerWatts"]'));
});
test('profile controls stay grouped, detail panels disclose the model, and friends never reuse Gym scores',()=>{
 const x=app();const profile=fragment(x.renderProfile());assert.equal(profile.querySelector('.x51-profile-tools'),null);assert.ok(profile.querySelector('.rf880-profile-group__body [data-action="x51-progress-library"]'));
 click(x,'x53-rank-help','data-sport="run"');assert.match(x.renderModal(),/72 % und 28 %/);click(x,'x53-component','data-sport="run" data-area="consistency"');
 // X6.3: Bereichsdetails zeigen nur Kennzahlen; das Modell steht weiter in „Einordnung & Vergleichsdaten“ (oben geprüft).
 assert.match(x.renderModal(),/x53-value/);assert.doesNotMatch(x.renderModal(),/keine sportliche Höchstleistung/);
 x.state.liveFriends={friendIds:['one','two','three'],snapshots:{one:{name:'Gym only',score:899},two:{name:'Runner',sportRanks:{run:{score:410,recorded:true,model:'endurance-age-v1'}}},three:{name:'Invalid',sportRanks:{run:{score:999999,recorded:true,model:'endurance-age-v1'}}}}};
 const html=m.friends(x,'run');assert.match(html,/Runner/);assert.doesNotMatch(html,/Gym only|Invalid/);assert.equal(m.publicRanks(x).run.recorded,false);
 assert.ok(readFileSync('public/rankforge/service-worker.js','utf8').includes('sports-profile-x5.3.js'));
});
test('keyboard selection retains focus and accent updates keep the always-detailed interface (X5.9)',()=>{
 const x=app();w.RANKFORGE_APP=x;x.render=()=>{w.document.getElementById('app').innerHTML=x.renderHome();};x.render();const region=w.document.querySelector('.x53-region[data-area="tempo"]');region.focus();region.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));assert.equal(w.document.activeElement.dataset.area,'tempo');assert.equal(x.ui.x53Areas.run,'tempo');
 x.state.settings.uiStyle='minimal';x.updateDesign({accentColor:'#ff3762'});assert.equal(x.state.settings.uiStyle,'classic');assert.equal(x.state.settings.accentColor,'#ff3762');
});
