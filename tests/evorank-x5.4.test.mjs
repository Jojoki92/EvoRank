import test from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
const {w,api:a}=appEnv(),home=w.EVORANK_X51,sportModel=w.EVORANK_SPORTS_X53;
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};
function app(){const x=new a.LiftoffApp();x.accountKey='x54-test';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.state.health={authorization:'unknown'};x.metrics=a.getMetrics(x.state);x.scheduleSave=()=>{};x.render=()=>{};x.showToast=()=>{};x.closeModal=()=>{x.ui.modal=null;};x.state.triathlon={activities:[]};return x;}
const click=(x,target)=>x.handleClick({target,preventDefault(){}});
test('Home upgrades hidden core panels and persists an ordered optional layout for all four sports',()=>{
 const x=app();x.state.settings.homeX51={sports:['strength','run','bike','swim'],modules:{ranks:false,figure:false,friends:true,progress:true,recent:true},moduleOrder:['friends','friends','bad','recent','progress']};
 const settings=home.settings(x);assert.equal(settings.modules.ranks,true);assert.equal(settings.modules.figure,true);assert.deepEqual(Array.from(settings.moduleOrder).slice(0,3),['friends','recent','progress']);
 let heading;
 for(const sport of settings.sports){settings.active=sport;home.saveSettings(x,settings);const root=fragment(x.renderHome());assert.ok(root.querySelector('.rf103-home-ranks'));assert.ok(root.querySelector('.home-bodygraph-section,.x51-sport-profile'));const text=root.querySelector('.home-title h1').textContent;heading??=text;assert.equal(text,heading);const ordered=[...root.querySelectorAll('.x54-home-sections>[data-home-module]')].map(n=>n.dataset.homeModule);assert.ok(ordered.indexOf('friends')<ordered.indexOf('progress'));}
 const saved=a.normalizeState(x.state,x.accountKey);assert.deepEqual(Array.from(saved.settings.homeX51.moduleOrder),Array.from(settings.moduleOrder));
});
test('reordering preserves unsaved checkboxes, saves only on submit, and core panels have no switches',async()=>{
 const x=app();x.ui.modal={type:'x51-home'};const form=fragment(x.renderModal()).querySelector('form');
 assert.equal(form.querySelector('[name="module"][value="ranks"]'),null);assert.equal(form.querySelector('[name="module"][value="figure"]'),null);
 const row=form.querySelector('[data-module="friends"]'),check=row.querySelector('input');check.checked=true;const before=JSON.stringify(x.state.settings.homeX51);
 // X6.2: Pfeile entfernt; Ordnen per Halten und Ziehen verschiebt die Zeile im Formular.
 assert.equal(row.querySelector('[data-action="x51-module-up"]'),null);row.parentElement.prepend(row);
 assert.equal(check.checked,true);assert.equal(JSON.stringify(x.state.settings.homeX51),before,'Cancel leaves settings unchanged');
 await x.handleSubmit({target:form,preventDefault(){}});assert.equal(home.settings(x).moduleOrder[0],'friends');assert.equal(home.settings(x).modules.friends,true);assert.equal(x.ui.modal,null);
});
test('endurance analysis uses actual calendar months, distinct days, and totals without changing ranks or records',()=>{
 const x=app(),now=new Date(2026,8,15,12).getTime();
 const entry=(id,date,distance=5000)=>({id,sport:'run',date:new Date(date).toISOString(),distanceMeters:distance,durationSeconds:1800,source:'manual'});
 x.state.triathlon.activities=[entry('old',new Date(2026,7,31,12),3000),entry('a',new Date(2026,8,1,12)),entry('b',new Date(2026,8,1,15)),entry('future',new Date(2026,8,16,12))];
 const before=JSON.stringify(x.state.triathlon.activities),score=w.RANKFORGE970.sportMetrics('run',x,new Date(now)).score,r=sportModel.analysisReport(x,'run',now);
 assert.equal(r.total.count,3);assert.equal(r.total.distance,13000);assert.equal(r.month.count,2);assert.equal(r.month.days,1);assert.equal(r.previous.count,1);assert.equal(r.previous.distance,3000);assert.equal(r.weeks.length,12);assert.equal(r.weeks.reduce((n,p)=>n+p.value,0),3);
 assert.equal(w.RANKFORGE970.sportMetrics('run',x,new Date(now)).score,score);assert.equal(JSON.stringify(x.state.triathlon.activities),before);assert.equal(sportModel.analysisReport(x,'swim',now).fastest,null);
 for(const sport of ['run','bike','swim']){const html=sportModel.analysis(x,sport);for(const heading of ['Dieser Monat','Gesamt & Bestwerte','Dein Trainingsrhythmus'])assert.ok(html.includes(heading));assert.doesNotMatch(html,/NaN|Infinity/);}
});
test('Gym exercise history folds, muscle balance retains every group, and profile keeps its edit pencil',()=>{
 const x=app(),analysis=fragment(x.renderAnalysis()),fold=analysis.querySelector('details.x54-exercise-fold');assert.ok(fold);assert.equal(fold.open,false);assert.ok(fold.querySelector('.v7-exercise-progress'));assert.equal(analysis.querySelectorAll('.x54-balance details .rf84-balance-row').length,14);assert.equal(analysis.querySelector('.rf84-balance-preview'),null);
 const profile=fragment(x.renderProfile());assert.ok(profile.querySelector('.screen-title [data-action="open-profile-edit"]'));assert.equal(profile.querySelector('.rf880-profile-quick [data-action="open-profile-edit"]'),null);const consent=profile.querySelector('.rf880-profile-group__body [data-action="rf110-open-production"]');assert.ok(consent);click(x,consent);assert.equal(x.ui.modal.type,'rf110-production');assert.match(x.renderModal(),/Öffentliche Bestenlisten/);
});
test('every sport has its own authenticated community leaderboard and survives a missing backend',async()=>{
 const x=app(),requests=[];w.RANKFORGE_CLOUD={supabaseUrl:'https://example.invalid',supabasePublishableKey:'public-test'};w.RANKFORGE_ACCOUNT={status:()=>({signedIn:true,hasProfile:true}),getAccessToken:async()=>'test-token'};
 w.fetch=async(url,init)=>{requests.push({url,init,args:JSON.parse(init.body)});return {ok:true,json:async()=>[{id:'person',displayName:'Athlet',score:450,rankLabel:'Test'}]};};
 for(const sport of ['strength','run','bike','swim']){await w.EVORANK109.loadLeaderboard(sport,x);x.ui.x53RankSport=sport;x.ui.rankTab='rank';
  // X6.3: Die Bestenliste steht im Freunde-Tab, nicht mehr in Ranks.
  assert.equal(fragment(x.renderRanks()).querySelector('.rf109-leaderboard'),null);const board=fragment(w.EVORANK109.renderLeaderboard(sport,x)).querySelector('.rf109-leaderboard');assert.ok(board);assert.equal(board.querySelector('[data-action="rf109-leader-profile"]').dataset.sport,sport);assert.match(board.textContent,/Athlet/);assert.equal(requests.at(-1).args.p_sport,sport);assert.equal(requests.at(-1).init.headers.authorization,'Bearer test-token');}
 const length=requests.length;x.state.privacyV110={leaderboardConsent:false};await w.EVORANK109.publishLeaderboards(x);assert.equal(requests.length,length,'Viewing never opts into publication');
 w.fetch=async()=>({ok:false,status:404,json:async()=>({code:'PGRST202'})});await w.EVORANK109.loadLeaderboard('run',x);assert.match(w.EVORANK109.renderLeaderboard('run',x),/noch nicht eingerichtet/);
});
