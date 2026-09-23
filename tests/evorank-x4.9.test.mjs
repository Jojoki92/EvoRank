import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv(); after(()=>dom.window.close());
const apple=w.EVORANK_APPLE_X49;
function app(){const x=new a.LiftoffApp();x.accountKey='test-x49';x.state=a.normalizeState(a.initialState(x.accountKey),x.accountKey);x.render=()=>{};x.scheduleSave=()=>{};x.showToast=()=>{};x.metrics=a.getMetrics(x.state);return x;}
const fragment=html=>{const t=w.document.createElement('template');t.innerHTML=html;return t.content;};
test('primary action text keeps at least 4.5 contrast for vivid and custom accents',()=>{
  for(const color of ['#2f7dff','#ff3762','#00b8f0','#8055ff','#e5b52b','#16b882','#eb55bd','#000000','#ffffff','#777777']){
    const a=apple.luminance(color),b=apple.luminance(apple.foreground(color));assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,color);
  }
});
test('spring keeps velocity and settles without overshooting across frame rates',()=>{
  for(const hz of [30,60,120]){
    let point={position:100,velocity:0};
    for(let i=0;i<hz;i++){point=apple.step(point.position,point.velocity,0,1/hz);assert.ok(point.position>=0&&Number.isFinite(point.velocity));}
    assert.ok(point.position<.001);
  }
  assert.ok(apple.project(100)>0);assert.ok(apple.project(-100)<0);
  assert.ok(Math.abs(apple.rubberband(-200,150))<200);
  const moving=apple.step(40,500,0,.001);assert.ok(moving.position>40);
});
test('X5.1 keeps Apple appearance without a design switch and preserves colors and training',async()=>{
  const x=app();x.ui.modal={type:'design'};const before=JSON.stringify(x.state.workouts),accent=x.state.settings.accentColor;
  const first=fragment(x.renderModal());assert.equal(first.querySelector('[data-action="x49-interface"]'),null);
  x.state.settings.interfaceX49='classic';
  x.state=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);apple.apply(x);
  assert.equal(w.document.documentElement.dataset.interface,'apple');assert.equal(x.state.settings.accentColor,accent);assert.equal(JSON.stringify(x.state.workouts),before);
  assert.equal(fragment(x.renderModal()).querySelector('[data-action="x49-interface"]'),null);
});
test('X5.1 migrates old classic profiles once and preserves account data',async()=>{
  const x=app();x.state.settings.interfaceX49='classic';x.state.settings.accentColor='#eb55bd';
  const history=JSON.stringify(x.state.workouts);let saves=0;x.scheduleSave=()=>saves++;
  apple.apply(x);assert.equal(x.state.settings.interfaceX49,'apple');assert.equal(saves,1);
  apple.apply(x);assert.equal(saves,1);
  x.state=a.normalizeState(JSON.parse(JSON.stringify(x.state)),x.accountKey);apple.apply(x);
  assert.equal(x.state.settings.interfaceX49,'apple');assert.equal(saves,1);assert.equal(x.state.settings.accentColor,'#eb55bd');assert.equal(JSON.stringify(x.state.workouts),history);
  const other=app();apple.apply(other);assert.equal(other.state.settings.interfaceX49,'apple');
});
test('legal navigation carries only appearance and preserves it between local pages',()=>{
  const x=app();x.state.settings.accentColor='#e5b52b';x.state.settings.appearance='light';
  const links=[...fragment(x.renderRf80Legal()).querySelectorAll('nav a')];assert.equal(links.length,7);
  const url=new URL(links[0].href,w.location.href);assert.equal(url.searchParams.get('accent'),'#e5b52b');assert.equal(url.searchParams.get('theme'),'light');assert.equal([...url.searchParams].length,2);
  for(const query of ['?accent=%23e5b52b&theme=light','?accent=red%3Bbackground%3Aurl(x)&theme=invalid']){
    const local=new JSDOM('<html><head></head><body><a id="internal" href="./terms.html">Nutzung</a><a id="external" href="https://example.com/terms.html">Extern</a></body></html>',{url:'http://localhost/privacy.html'+query,runScripts:'outside-only'});
    const v=local.window;v.matchMedia=()=>({matches:false});
    new vm.Script(readFileSync('public/rankforge/assets/legal-theme-x5.0.js','utf8')).runInContext(local.getInternalVMContext());
    v.document.dispatchEvent(new v.Event('DOMContentLoaded'));
    const expected=query.includes('invalid')?'#ff3762':'#e5b52b';
    assert.equal(v.document.documentElement.style.getPropertyValue('--accent'),expected);
    assert.equal(new URL(v.document.getElementById('internal').href).searchParams.get('accent'),expected);
    assert.equal(v.document.getElementById('external').href,'https://example.com/terms.html');local.window.close();
  }
});
test('dragging excludes forms and confirmations and reduced-motion retains closing',()=>{
  const x=app();x.ui.modal={type:'profile'};
  let root=fragment(x.renderModal());assert.equal(apple.eligible(x,root.querySelector('.modal')),false);
  x.ui.modal={type:'confirm',title:'Löschen?',confirmAction:'delete'};root=fragment(x.renderModal());assert.equal(apple.eligible(x,root.querySelector('.modal')),false);
  x.ui.modal={type:'design'};root=fragment(x.renderModal());assert.equal(apple.eligible(x,root.querySelector('.modal')),true);
  x.state.settings.reducedMotion='reduce';w.document.getElementById('app').replaceChildren(root);
  const sheet=w.document.querySelector('.modal');apple.bindSheet(x,sheet);
  assert.equal(sheet.style.transform,'translate3d(0,0px,0)');assert.equal(sheet.querySelector('.sheet-handle').getAttribute('role'),'button');
});
test('sheet can be grabbed during motion; pointer cancellation restores it without a close',()=>{
  const x=app();x.ui.modal={type:'design'};w.document.getElementById('app').innerHTML=x.renderModal();
  const sheet=w.document.querySelector('.modal');sheet.getBoundingClientRect=()=>({height:600});apple.bindSheet(x,sheet);
  const handle=sheet.querySelector('.sheet-handle');handle.setPointerCapture=()=>{};handle.releasePointerCapture=()=>{};
  function send(type,y,time){const event=new w.MouseEvent(type,{bubbles:true,clientX:10,clientY:y});Object.defineProperties(event,{pointerId:{value:1},isPrimary:{value:true},timeStamp:{value:time}});handle.dispatchEvent(event);}
  send('pointerdown',100,0);send('pointermove',140,20);assert.equal(sheet.style.transform,'translate3d(0,88px,0)');
  x.state.settings.reducedMotion='reduce';send('pointercancel',140,30);
  assert.equal(sheet.style.transform,'translate3d(0,0px,0)');assert.equal(x.ui.modal.type,'design');
});
test('dialog labels and keyboard focus wrap exclude hidden controls in collapsed details',()=>{
  const x=app();x.ui.modal={type:'design'};const html=x.renderModal();assert.match(html,/aria-labelledby="x49-dialog-title"/);
  w.document.getElementById('app').innerHTML='<section class="modal" role="dialog"><button id="first">Erste</button><details><summary>Mehr</summary><button id="hidden">Versteckt</button></details><button id="last">Letzte</button></section>';
  w.document.getElementById('last').focus();w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
  assert.equal(w.document.activeElement.id,'first');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));assert.equal(w.document.activeElement.id,'last');
});
test('cloud consent is per user, rejects the legacy global flag and honors revocation',()=>{
  const x=app();x.accountKey='local-a';w.RANKFORGE_APP=x;let user='a';
  w.RANKFORGE_ACCOUNT={status:()=>({signedIn:true,userId:user,email:user+'@example.com'})};
  w.EVORANK_LOCAL_ACCOUNTS={ensure:email=>'local-'+email[0]};const consent=w.EVORANK_CLOUD_CONSENT_X49;
  w.localStorage.setItem('evorank-health-cloud-consent-v1','accepted');assert.equal(consent.read(x.state),false);
  assert.equal(consent.set(true),true);assert.equal(consent.read(x.state),true);
  user='b';assert.equal(consent.read(x.state),false);x.accountKey='local-b';x.state.privacyV110={cloudHealthConsent:false};assert.equal(consent.read(x.state),false);
  consent.set(false);user='a';x.accountKey='local-a';assert.equal(consent.read(x.state),true);consent.set(false);x.state.privacyV110.cloudHealthConsent=true;assert.equal(consent.read(x.state),false);
  w.RANKFORGE_ACCOUNT={status:()=>({signedIn:false})};assert.equal(consent.set(true),false);delete w.RANKFORGE_APP;
});
test('login can submit without cloud consent; failed login cannot grant consent',async()=>{
  const local=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'http://localhost/',runScripts:'outside-only'});
  const v=local.window;Object.defineProperty(v.document,'readyState',{value:'complete'});
  let calls=0,grants=0;v.RANKFORGE_ACCOUNT={status:()=>({configured:true,signedIn:false}),onChange(){},signIn:async()=>{calls++;throw new Error('Invalid test login');}};
  v.RANKFORGE_BRIDGE={setCloudConsent:()=>grants++};
  new vm.Script(readFileSync('public/rankforge/assets/account-ui-v2.js','utf8')).runInContext(local.getInternalVMContext());
  const form=v.document.querySelector('[data-rf92-form="anmelden"]');assert.ok(form);assert.equal(form.querySelector('[name="cloudConsent"]').required,false);
  form.querySelector('[name="email"]').value='tester@example.com';form.querySelector('[name="password"]').value='not-a-real-password';
  form.dispatchEvent(new v.Event('submit',{bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(calls,1);assert.equal(grants,0);local.window.close();
});
test('feedback sends only an explicitly entered reply address and bounded optional diagnostics',async()=>{
  const x=app();x.state.profile.email='private@example.com';x.state.profile.name='Private name';x.ui.modal={type:'rf80-feedback'};
  const root=fragment(x.renderModal()),form=root.querySelector('form[data-form="rf80-feedback"]');assert.ok(form);
  form.querySelector('[name="rating"]').checked=true;form.querySelector('[name="feedbackConsent"]').checked=true;form.querySelector('[name="includeDiagnostics"]').checked=true;form.reportValidity=()=>true;
  let body;w.fetch=async(url,options)=>{body=new URLSearchParams(options.body);return {ok:true};};
  await x.handleSubmit({target:form,preventDefault(){}});
  assert.equal(body.get('email'),'');assert.equal(body.has('accountName'),false);assert.equal(body.has('accountEmail'),false);
  assert.doesNotMatch(body.toString(),/private|accountKey|userAgent/);
  x.ui.modal={type:'rf80-feedback'};form.querySelector('[name="replyEmail"]').value='reply@example.com';await x.handleSubmit({target:form,preventDefault(){}});assert.equal(body.get('email'),'reply@example.com');
});
test('legal pages exist offline, use confirmed operator contact, and do not claim completed purchases or full compliance',()=>{
  const pages=['privacy','terms','cookies','refunds','impressum','accessibility','privacy-choices','support'];
  for(const page of pages){const html=readFileSync(`public/rankforge/${page}.html`,'utf8');assert.match(html,/lang="de"/);assert.match(html,/Zum Inhalt/);assert.match(html,/Zur App/);assert.doesNotMatch(html,/<iframe|<script[^>]+src="https:/);}
  assert.match(readFileSync('public/rankforge/impressum.html','utf8'),/Johannes Gumplmayr/);
  assert.match(readFileSync('public/rankforge/refunds.html','utf8'),/keine In-App-Käufe mit echtem Geld/);
  assert.match(readFileSync('public/rankforge/accessibility.html','utf8'),/noch offen/);
});
