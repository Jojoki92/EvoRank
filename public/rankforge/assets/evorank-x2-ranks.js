/* EvoRank X4.2: canonical calibration, bodyweight, cables and machines.
   Stored training, earned XP/coins and technical storage keys are retained. */
(() => {
  'use strict';
  const old = {scoreLift, normalizeSet, normalizeDraftExercise, normalizeRoutine,
    normalizeWorkout, instantiateExercise, instantiateRoutine, getMetrics, buildWorkoutSummary};
  let profile = null;
  const n = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const isMachine=e=>/maschine|machine/i.test(String(e?.equipment||''));
  const preacherBase=EXERCISES.find(e=>e.id==='RF77-096');
  if(preacherBase&&!exerciseIndex.has('PREACHER_CURL_MACHINE')) {
    const preacher={...preacherBase,id:'PREACHER_CURL_MACHINE',name:'Preacher Curl (Maschine)',
      aliases:['Scott Curl Maschine','Machine Preacher Curl','Bizepsmaschine'],
      description:'Oberarme auf dem Polster ablegen. Griffe ohne Schwung beugen und kontrolliert absenken. Sitz und Drehachse passend einstellen.',
      rankCalibration:'estimated',rankModel:'x42-machine-estimate',tracking:'weight-reps'};
    preacher.searchText=[preacher.name,preacher.muscle,preacher.equipment,...preacher.aliases].join(' ').toLowerCase();
    EXERCISES.push(preacher);exerciseIndex.set(preacher.id,preacher);
  }
  const family = e => {
    const name = String(e?.name || '').toLowerCase();
    if (/klimmzug|pull.?up|chin.?up/.test(name) && !/scapul|muscle.?up|einarm|one.arm/.test(name)) return 'pullup';
    if (/\bdips?\b/.test(name) && !/bench|bank|seated|sitzend|maschine|station/.test(name)) return 'dip';
    if (/liegestütz|push.?up/.test(name) && !/archer|einarm|one.arm|handstand|pike/.test(name)) return 'pushup';
    return '';
  };
  const audited = new Map();
  EXERCISES.forEach(e => {
    if (e.rankable === false) return;
    // Legacy 'weight' entries are ordinary strength exercises with repetitions.
    if(!e.tracking||e.tracking==='weight')e.tracking='weight-reps';
    const f=family(e), name=e.name.toLowerCase();
    // Final catalog pass: earlier releases inferred arm muscles from equipment
    // names (Dip-Station) and the word curl in leg curls.
    const excluded=/leg.?curl|beinbeug/.test(name)?['Bizeps','Unterarme']:
      /beinheben|leg.?raise/.test(name)&&/dip.station/i.test(e.equipment)?['Bizeps','Trizeps','Brust','Schultern']:[];
    e.secondaryMuscles=[...new Set(e.secondaryMuscles||[])].filter(m=>m!==e.muscle&&!excluded.includes(m));
    if (f) {
      e.bodyweightMode=f==='pushup'?'bodyweight-fraction':/assist|unterstützt|maschine|widerstandsband/.test(name)?'assisted':'added';
      if(f==='pushup') e.bodyweightFraction=0.65;
      e.reference1RMKg={pullup:110,dip:125,pushup:65}[f];
      e.bodyweightExponent=f==='pushup'?0.4:0.5;
      e.rankCalibration=/widerstandsband/.test(name)?'estimated':'calibrated';
      e.rankModel='x2-bodyweight';
    } else if (['added','bodyweight','bodyweight-fraction'].includes(e.bodyweightMode)) {
      let fraction=0;
      if(/reverse.?crunch|beinheben|leg.?raise/.test(name)) fraction=0.2;
      else if(/crunch/.test(name)) fraction=0.35;
      else if(/rückenstreck|back.?extension/.test(name)) fraction=0.5;
      else if(/glute.?bridge|beckenheben/.test(name)) fraction=0.65;
      else if(/wadenheben|calf.?raise/.test(name)) fraction=/einbein|single/.test(name)?0.9:0.45;
      else if(/bench.?dip|bank.?dip/.test(name)) fraction=0.65;
      if(fraction) {
        e.bodyweightMode='bodyweight-fraction'; e.bodyweightFraction=fraction;
        e.reference1RMKg=Math.max(n(e.reference1RMKg),75*fraction*1.4);
        e.rankCalibration='estimated';e.rankModel='x2-segment-estimate';
      }
    }
    // A Dip-Station is support equipment, not a machine that lifts leg raises.
    if(/beinheben|leg.?raise/.test(name)&&e.equipment==='Dip-Station') {
      e.bodyweightMode='bodyweight-fraction';e.bodyweightFraction=.2;
      e.reference1RMKg=21;e.rankCalibration='estimated';e.rankModel='x42-segment-estimate';
    }
    if(isMachine(e)) {
      e.rankCalibration='estimated';e.rankModel='x42-machine-estimate';
    }
    audited.set(e.id,e);
  });
  const calibrationKeys=['rankable','tracking','bodyweightMode','bodyweightFraction','bodyweightExponent','reference1RMKg','rankCalibration','rankModel','secondaryMuscles'];
  function canonical(raw={}) {
    const base=audited.get(raw.exerciseId||raw.id)||exerciseIndex.get(raw.exerciseId||raw.id);
    if(!base) return {...raw};
    const out={...base,...raw};
    if(!raw.isCustom) calibrationKeys.forEach(k=>{if(base[k]!==undefined)out[k]=base[k];});
    return out;
  }
  const isCable=e=>/kabel|cable/.test(String(e?.equipment||'').toLowerCase())||/kabel|cable/.test(String(e?.name||'').toLowerCase());
  const ratio=e=>Math.min(10,Math.max(.25,Number(e?.cableRatio)||1));
  const machineFactor=e=>Math.min(10,Math.max(.05,Number(e?.machineLoadFactor)||1));
  const machineOffset=e=>Math.min(200,n(e?.machineStartingKg));
  const handleWeight=(e,w)=>{
    if(isCable(e))return n(w)/(e.cableInputMode!=='handle'?ratio(e):1);
    if(isMachine(e)&&e.machineInputMode!=='resistance')return n(w)*machineFactor(e)+machineOffset(e);
    return n(w);
  };
  function loadFor(raw,w,bw,assistance=0) {
    const e=canonical(raw), weight=handleWeight(e,w), body=n(bw);
    if(e.bodyweightMode==='assisted')return Math.max(0,body-(n(assistance)?handleWeight(e,assistance):weight));
    if(['added','bodyweight'].includes(e.bodyweightMode))return body+weight;
    if(e.bodyweightMode==='bodyweight-fraction')return body*(Number(e.bodyweightFraction)||0.65)+weight;
    return weight;
  }
  epleyOneRepMax=function(w,r){w=n(w);r=n(r);return w&&r?w*(r===1?1:1+Math.min(r,30)/30):0;};
  effectiveLoad=(e,w,bw)=>loadFor(e,w,bw);
  const getProfile=()=>profile||window.RANKFORGE_APP?.state?.profile||{};
  const sex=p=>typeof p==='string'?p:p?.bodyProfile||p?.gender||p?.sex||'male';
  function scoreDetails(lift={},bodyweightKg,comparisonProfile) {
    const e=canonical(lift.exercise||{...lift,id:lift.exerciseId});
    if(e.rankable===false)return {score:0,baseScore:0};
    // Current account profile controls present-day comparisons. A workout's
    // recorded profile remains history, not a permanent ranking override.
    // Outside an app/metrics context an explicit lift profile is still useful.
    const p=comparisonProfile||profile||window.RANKFORGE_APP?.state?.profile||lift.bodyProfile||getProfile();
    const finish=base=>window.EVORANK_AGE_X47.adjust(base,e,typeof p==='object'?p:{});
    if(['time','distance'].includes(e.tracking))return finish(Math.max(0,old.scoreLift({...lift,exercise:e,bodyProfile:sex(p)},bodyweightKg)||0));
    const bw=Math.min(250,Math.max(30,Number(bodyweightKg)||75));
    const oneRM=epleyOneRepMax(loadFor(e,lift.weightKg??lift.weight,bw,lift.assistanceKg),e.tracking==='weight'?1:lift.reps);
    const female=['female','weiblich','f'].includes(String(sex(p)).toLowerCase());
    const community=window.EVORANK_STANDARDS_X42?.score?.(e,oneRM,bw,female);
    if(community!=null)return finish(e.rankCalibration==='estimated'?Math.min(699,community):community);
    const factor=female?(window.RANKFORGE892?.femaleCalibration?.(e)?.factor||0.65):1;
    const ref=Math.max(1,Number(e.reference1RMKg)||25)*factor;
    const result=Math.max(0,Math.round(oneRM/ref*350*(75/bw)**Number(e.bodyweightExponent ?? 0.3)));
    return finish(e.rankCalibration==='estimated'?Math.min(699,result):result);
  }
  scoreLift=function(lift={},bodyweightKg){return scoreDetails(lift,bodyweightKg).score;};
  function preserve(raw,out) {
    if(raw?.cableRatio!=null)out.cableRatio=ratio(raw);
    if(raw?.cableInputMode)out.cableInputMode=raw.cableInputMode==='handle'?'handle':'stack';
    if(raw?.cableConfigured!=null)out.cableConfigured=Boolean(raw.cableConfigured);
    if(raw?.cableName!=null)out.cableName=String(raw.cableName).slice(0,80);
    if(raw?.bodyweightFraction!=null)out.bodyweightFraction=Math.min(1,Math.max(0.01,Number(raw.bodyweightFraction)||0.65));
    if(raw?.rankModel)out.rankModel=String(raw.rankModel);
    if(raw?.machineLoadFactor!=null)out.machineLoadFactor=machineFactor(raw);
    if(raw?.machineStartingKg!=null)out.machineStartingKg=machineOffset(raw);
    if(raw?.machineInputMode)out.machineInputMode=raw.machineInputMode==='resistance'?'resistance':'display';
    if(raw?.machineConfigured!=null)out.machineConfigured=Boolean(raw.machineConfigured);
    if(raw?.machineName!=null)out.machineName=String(raw.machineName).slice(0,80);
    return out;
  }
  normalizeSet=(s={},i)=>preserve(s,old.normalizeSet(s,i));
  normalizeDraftExercise=(e={},i)=>preserve(canonical(e),old.normalizeDraftExercise(canonical(e),i));
  normalizeRoutine=function(r={},i){const out=old.normalizeRoutine(r,i);out.exercises.forEach((e,j)=>{preserve(r.exercises?.[j],e);e.sets.forEach((s,k)=>preserve(r.exercises?.[j]?.sets?.[k],s));});return out;};
  normalizeWorkout=function(w={},i){const out=old.normalizeWorkout(w,i);if(w.bodyProfile)out.bodyProfile=sex(w.bodyProfile);out.bestLifts.forEach((l,j)=>{preserve(w.bestLifts?.[j],l);l.assistanceKg=n(w.bestLifts?.[j]?.assistanceKg);if(w.bestLifts?.[j]?.bodyProfile)l.bodyProfile=sex(w.bestLifts[j].bodyProfile);});return out;};
  instantiateExercise=function(state,id){const e=old.instantiateExercise(state,id);if(e){if(isCable(e))preserve(state.settings?.x45CableDefault,e);preserve(state.settings?.x2CableSettings?.[id],e);preserve(state.settings?.x42MachineSettings?.[id],e);}return e;};
  instantiateRoutine=function(state,r,...args){const d=old.instantiateRoutine(state,r,...args);d.exercises.forEach((e,i)=>{if(isCable(e))preserve(state.settings?.x45CableDefault,e);preserve(r.exercises?.[i],e);preserve(state.settings?.x2CableSettings?.[e.exerciseId],e);preserve(state.settings?.x42MachineSettings?.[e.exerciseId],e);});return d;};
  function candidates(draft,endedAt,bw,bodyProfile=getProfile()) {
    const lifts=[];
    for(const raw of draft.exercises||[]) {
      const e=canonical(raw);let best=null;
      for(const s of e.sets||[]) {
        if(!s.done||s.type==='warmup')continue;
        const snapshot=preserve(s,{...e});delete snapshot.sets;
        const lift={exerciseId:e.exerciseId||e.id,name:e.name,muscle:e.muscle,weightKg:n(s.weightKg),reps:n(s.reps),durationSeconds:n(s.durationSeconds),distanceMeters:n(s.distanceMeters),assistanceKg:n(s.assistanceKg),achievedAt:endedAt,exercise:snapshot,bodyProfile:sex(bodyProfile),reference1RMKg:e.reference1RMKg,bodyweightMode:e.bodyweightMode,bodyweightExponent:e.bodyweightExponent};
        const score=scoreLift(lift,bw);
        if(score>0&&(!best||score>best.score))best={...lift,score};
      }
      if(best)lifts.push(best);
    }
    return lifts;
  }
  bestLiftsFromDraft=(draft,endedAt)=>candidates(draft,endedAt,Number(getProfile().bodyweightKg)||75);
  collectBestLifts=function(workouts=[],bodyweightKg) {
    const best=new Map();
    for(const w of workouts) {
      const bw=w.bodyweightKg||bodyweightKg;
      const rebuilt=candidates(w,w.endedAt||w.date,bw,w.bodyProfile||getProfile());
      const ids=new Set((w.exercises||[]).filter(e=>e.sets?.some(s=>s.done)).map(e=>e.exerciseId||e.id));
      const lifts=[...rebuilt,...(w.bestLifts||[]).filter(l=>!ids.has(l.exerciseId))];
      for(const raw of lifts){const l={...raw,exercise:canonical(raw.exercise||{...raw,id:raw.exerciseId}),bodyProfile:raw.bodyProfile||w.bodyProfile||getProfile(),bodyweightKg:bw,workoutId:w.id};const score=scoreLift(l,bw);if(score>0&&(!best.has(l.exerciseId)||score>best.get(l.exerciseId).score))best.set(l.exerciseId,{...l,score,rank:rankFromScore(score)});}
    }
    return [...best.values()].sort((a,b)=>b.score-a.score);
  };
  getMetrics=function(state){const previous=profile;profile=state.profile;try{return old.getMetrics(state);}finally{profile=previous;}};
  buildWorkoutSummary=function(state,draft){const previous=profile;profile=state.profile;try{const out=old.buildWorkoutSummary(state,draft);out.bodyProfile=sex(state.profile);return out;}finally{profile=previous;}};
  workoutVolumeFromDraft=function(draft){return (draft?.exercises||[]).reduce((total,raw)=>{const e=canonical(raw);return total+(e.sets||[]).filter(s=>s.done).reduce((v,s)=>{const equipment=preserve(s,{...e});if(e.bodyweightMode==='assisted')return v;const sides=s.unilateral?[s.left,s.right]:[s];return v+sides.reduce((sum,side)=>sum+handleWeight(equipment,side?.weightKg)*n(side?.reps),0);},0);},0);};
  window.EVORANK_X2_RANKS=Object.freeze({canonical,family,isCable,isMachine,ratio,machineFactor,machineOffset,handleWeight,loadFor,preserve,candidates,scoreDetails,auditedCount:audited.size,comparisonProfile:'current-account'});
})();
