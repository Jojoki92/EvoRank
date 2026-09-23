import {writeFileSync} from 'node:fs';
import {appEnv} from '../tests/helpers/x2-app-env.mjs';

// Every catalog entry is exercised, including variants without direct norms.
// Passing these checks establishes consistency, not scientific validation.
const {api:a,w,dom}=appEnv();
const model=w.EVORANK_X2_RANKS,standards=w.EVORANK_STANDARDS_X42;
const failures=[],rows=[],ids=new Set();let comparisons=0;
const check=(ok,e,message)=>{if(!ok)failures.push({id:e.id,name:e.name,message});};
for(const e of a.EXERCISES) {
  check(!ids.has(e.id),e,'Duplicate ID');ids.add(e.id);
  check(Boolean(e.name&&e.muscle&&e.equipment),e,'Missing catalog identity');
  const rankable=e.rankable!==false,source=standards.sourceFor(e);
  if(rankable) {
    check(['weight-reps','reps','time','distance'].includes(e.tracking),e,'Unsupported tracking mode');
    if(!['time','distance'].includes(e.tracking))check(Number(e.reference1RMKg)>0,e,'Missing positive strength reference');
  }
  for(const bodyProfile of ['male','female'])for(const bw of [45,70,100,140]) {
    const make=(weightKg,reps=8)=>({exercise:e,weightKg,reps,durationSeconds:60,distanceMeters:100,bodyProfile});
    const scores=[0,10,30,60,100].map(weight=>a.scoreLift(make(weight),bw));comparisons+=scores.length;
    check(scores.every(s=>Number.isFinite(s)&&s>=0),e,'Non-finite or negative score');
    if(!rankable)check(scores.every(s=>s===0),e,'Mobility awarded strength rank');
    else if(!['time','distance'].includes(e.tracking)) {
      check(scores.every((s,i)=>!i||(e.bodyweightMode==='assisted'?s<=scores[i-1]:s>=scores[i-1])),e,'Load monotonicity');
      const reps=[1,5,8,12].map(r=>a.scoreLift(make(20,r),bw));comparisons+=reps.length;
      check(reps.every((s,i)=>!i||s>=reps[i-1]),e,'Repetition monotonicity');
      if(e.rankCalibration==='estimated')check(scores.every(s=>s<=699),e,'Estimate exceeds rank cap');
    }
  }
  if(model.isCable(e)) {
    check(model.handleWeight({...e,cableRatio:2,cableInputMode:'stack'},40)===20,e,'Cable ratio');
    check(model.handleWeight({...e,cableRatio:2,cableInputMode:'handle'},40)===40,e,'Cable double conversion');
  }else if(model.isMachine(e)) {
    check(model.handleWeight({...e,machineLoadFactor:.5,machineStartingKg:5},40)===25,e,'Machine conversion');
    check(model.handleWeight({...e,machineLoadFactor:.5,machineStartingKg:5,machineInputMode:'resistance'},40)===40,e,'Machine double conversion');
  }
  rows.push({id:e.id,name:e.name,muscle:e.muscle,secondaryMuscles:e.secondaryMuscles||[],equipment:e.equipment,tracking:e.tracking,rankable,reference1RMKg:e.reference1RMKg,bodyweightMode:e.bodyweightMode,calibration:e.rankCalibration||'legacy',model:e.rankModel||'legacy-reference',evidence:!rankable?'mobility-no-strength-rank':source?'community-bodyweight-table':'transferred-reference-estimate',source:source||null});
}
const counts={entries:rows.length,rankable:rows.filter(e=>e.rankable).length,mobility:rows.filter(e=>!e.rankable).length,directCommunityComparisons:rows.filter(e=>e.source).length,transferredReferences:rows.filter(e=>e.rankable&&!e.source).length,scoreComparisons:comparisons,failures:failures.length};
const report={release:'X4.2',checkedAt:'2026-09-08',scope:'Automatic consistency audit of every catalog entry. Only linked community tables provide direct norms; other variant references remain estimates.',counts,failures,exercises:rows};
writeFileSync('docs/EVORANK-X4.2-EXERCISE-AUDIT.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(counts));if(failures.length)console.error(JSON.stringify(failures.slice(0,30),null,2));
dom.window.close();if(failures.length)process.exitCode=1;
