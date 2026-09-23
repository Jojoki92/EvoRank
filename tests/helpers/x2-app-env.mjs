import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
export function appEnv({x2=true}={}) {
  const root=fileURLToPath(new URL('../../public/rankforge/',import.meta.url));
  const html=readFileSync(root+'index.html','utf8');
  const dom=new JSDOM('<!doctype html><html><head></head><body><div id="app"></div><input id="file-import" type="file" hidden></body></html>',{url:'http://localhost/',runScripts:'outside-only'});
  const w=dom.window;
  Object.defineProperty(w,'crypto',{value:webcrypto});
  Object.assign(w,{TextEncoder,TextDecoder,structuredClone,fetch:async()=>({ok:false,status:503,json:async()=>({})}),matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}),requestAnimationFrame:()=>0,setTimeout:()=>0,setInterval:()=>0,scrollTo(){},scrollBy(){}});
  const addListener=w.document.addEventListener.bind(w.document);
  w.document.addEventListener=(type,...args)=>{if(type!=='DOMContentLoaded')addListener(type,...args);};
  w.RANKFORGE_ACCOUNT={status:()=>({signedIn:false}),onChange(){}};
  const sources=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1].split('?')[0].replace(/^\.\//,''))
    .filter(s=>!/(bootstrap|account-sync|account-bridge|account-ui|cloud-config|garmin-connect-config)/.test(s)&& (x2||!s.includes('evorank-x2')));
  const source=sources.map(s=>readFileSync(root+s,'utf8')).join('\n;\n');
  new vm.Script(source+'\nwindow.X2_PROBE={EXERCISES,RANKS,LiftoffApp,initialState,normalizeState,normalizeSet,normalizeDraftExercise,normalizeRoutine,normalizeWorkout,instantiateExercise,instantiateRoutine,scoreLift,effectiveLoad,epleyOneRepMax,collectBestLifts,bestLiftsFromDraft,buildWorkoutSummary,workoutVolumeFromDraft,getMetrics,getMuscleStatuses,rankFromScore,bodyFigure,rankMark};').runInContext(dom.getInternalVMContext());
  return {dom,w,api:w.X2_PROBE};
}
