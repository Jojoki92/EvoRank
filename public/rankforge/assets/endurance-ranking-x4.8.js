/* X4.8 endurance comparisons. Intermediate time references, retrieved 2026-09-10.
   Sources and estimation limits: docs/EVORANK-X4.8-AUSDAUER.md.
   Arrays are seconds at each age. No strength-age curve is reused. */
(() => {
  'use strict';
  const ages=[15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90];
  const seconds=text=>text.split(' ').map(value=>value.split(':').reduce((n,part)=>n*60+Number(part),0));
  const references={
    run:{male:seconds('23:19 22:31 22:31 22:32 22:53 23:43 24:38 25:36 26:40 27:49 29:05 30:34 32:51 36:22 41:50 50:54'),female:seconds('27:26 26:07 26:07 26:07 26:17 26:49 27:47 29:13 30:54 32:47 34:54 37:20 40:07 43:25 48:54 58:55'),url:'https://runninglevel.com/running-times/5k-times',distance:'5 km'},
    swim:{male:seconds('19:52 19:12 19:12 19:13 19:32 20:12 20:58 21:47 22:41 23:38 24:41 25:56 27:51 30:50 35:30 43:15'),female:seconds('21:44 20:41 20:41 20:41 20:50 21:15 22:01 23:09 24:29 25:58 27:40 29:35 31:47 34:25 38:45 46:42'),url:'https://swimminglevel.com/swimming-times/1000m-times',distance:'1.000 m'},
    bike:{male:seconds('43:01 41:32 41:32 41:32 41:46 42:51 44:37 46:34 48:41 51:00 53:33 56:22 1:00:14 1:06:26 1:16:23 1:33:16'),female:seconds('54:42 50:32 50:12 50:13 50:42 51:53 53:52 56:49 1:00:21 1:04:23 1:08:57 1:14:14 1:20:25 1:28:46 1:43:01 2:09:04'),url:'https://cyclinglevel.com/cycling-times/20k-times',distance:'20 km'}
  };
  const bounded=(value,min,max)=>Math.max(min,Math.min(max,value));
  const valid=(value,min,max)=>Number.isFinite(Number(value))&&Number(value)>=min&&Number(value)<=max;
  function context(profile={},sport,now=new Date()) {
    if(typeof profile==='string')profile={bodyProfile:profile};
    const table=references[sport];if(!table)return {ageFactor:1,sexFactor:1,applied:false};
    const female=['female','weiblich','f'].includes(String(profile.bodyProfile||profile.sex||profile.gender).toLowerCase());
    const curve=female?table.female:table.male,age=window.EVORANK_AGE_X47?.ageAt(profile,now);
    const applied=age!=null&&age>=13,modelAge=applied?bounded(age,15,90):25;
    const upper=ages.findIndex(value=>value>=modelAge),lower=Math.max(0,upper-1);
    const part=upper===lower?0:(modelAge-ages[lower])/(ages[upper]-ages[lower]);
    const time=curve[lower]+part*(curve[upper]-curve[lower]);
    return {age,modelAge,applied,ageFactor:time/curve[2],sexFactor:curve[2]/table.male[2],bodyProfile:female?'female':'male',bounded:applied&&(age<15||age>90),source:table.url,referenceDistance:table.distance};
  }
  function fields(item={}) {
    const power=item.averagePowerWatts??item.avgPowerWatts??item.averagePower??item.avgPower;
    return {
      ...(valid(item.bodyweightKg,30,250)?{bodyweightKg:Number(item.bodyweightKg)}:{}),
      ...(valid(power,1,2500)?{averagePowerWatts:Number(power),powerSource:item.powerSource==='estimated'||item.deviceWatts===false?'estimated':'measured'}:{})
    };
  }
  function powerFields(weight,power) {
    // Blank means absent, never guess watts or a past bodyweight.
    const data=fields({bodyweightKg:weight,averagePowerWatts:power,powerSource:'measured'});
    return {bodyweightKg:data.bodyweightKg??null,averagePowerWatts:data.averagePowerWatts??null,powerSource:data.powerSource??null};
  }
  function performance(item,profile,config,now=new Date()) {
    const ctx=context(profile,item?.sport,now),d=Number(item?.distanceMeters),t=Number(item?.durationSeconds);
    if(!config||!valid(d,1,2000000)||!valid(t,1,604800))return {score:0,baseScore:0,context:ctx,basis:'none'};
    const distance=item.sport==='swim'?d:d/1000;
    const speed=item.sport==='swim'?d/t:d/t*3.6;
    const data=fields(item),wattsPerKg=data.averagePowerWatts&&data.bodyweightKg?data.averagePowerWatts/data.bodyweightKg:null;
    const power=item.sport==='bike'&&t>=1200&&wattsPerKg!=null&&data.powerSource==='measured';
    const norm=factor=>power?bounded((wattsPerKg*factor-1)/5,0,1):bounded((speed*factor-config.speedFloor)/(config.speedElite-config.speedFloor),0,1);
    const distancePart=Math.sqrt(bounded((distance-config.baseDistance)/(config.eliteDistance-config.baseDistance),0,1));
    const qualifier=bounded(distance/config.qualifyDistance,.25,1);
    const points=factor=>Math.round(800*(.72*norm(factor)+.28*distancePart)*qualifier);
    const tempoPoints=Math.round(800*norm(ctx.sexFactor*ctx.ageFactor)*qualifier);
    const distancePoints=Math.round(800*distancePart*qualifier);
    return {score:points(ctx.sexFactor*ctx.ageFactor),baseScore:points(ctx.sexFactor),context:ctx,basis:power?'power':'pace',wattsPerKg,averagePowerWatts:data.averagePowerWatts||null,bodyweightKg:data.bodyweightKg||null,distancePart,qualifier,tempoPoints,distancePoints};
  }
  function input(app,weight=app.state.profile?.bodyweightKg) {
    const safe=valid(weight,30,250)?Number(weight):'';
    return `<details class="advanced-exercise-settings rfx48-power-input"><summary>Leistung & Körpergewicht ergänzen</summary><p>Optional: Durchschnittswatt vom Powermeter oder Smarttrainer. Ab 20 Minuten zählt die Leistung pro kg für den Rad-Rang. Ohne vollständige Messwerte wird das Tempo bewertet.</p><div class="v7-field-grid"><label class="modal-field"><span>Durchschnittsleistung (W)</span><input name="averagePowerWatts" type="number" min="1" max="2500" step="1" inputmode="numeric" placeholder="Optional"></label><label class="modal-field"><span>Körpergewicht bei dieser Einheit (kg)</span><input name="enduranceBodyweightKg" type="number" min="30" max="250" step="0.1" inputmode="decimal" value="${safe}"><small>Bei älteren Einheiten das damalige Gewicht eintragen.</small></label></div></details>`;
  }
  window.EVORANK_ENDURANCE_X48=Object.freeze({context,performance,fields,powerFields,input,model:'endurance-age-v1'});
})();
