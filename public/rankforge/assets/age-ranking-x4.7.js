/* EvoRank age points v1. A disclosed comparison model, not measured muscle force.
   Source (retrieved 2026-09-10): https://strengthlevel.com/strength-standards/bench-press/kg
   Intermediate age references, normalized to ages 25–40; interpolation is an
   EvoRank approximation. Extending this curve to other strength exercises is
   an estimate, especially for machines. See docs/EVORANK-X4.7-ALTER.md. */
(() => {
  'use strict';
  const ages=[15,20,25,40,45,50,55,60,65,70,75,80,85,90];
  const male=[82,94,96,96,91,85,79,72,65,59,52,47,42,38];
  const female=[43,49,51,51,48,45,41,38,34,31,28,25,22,20];
  const dayKey=(now=new Date())=>`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  function date(value) {
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
    const [y,m,d]=value.split('-').map(Number),result=new Date(Date.UTC(y,m-1,d));
    return result.getUTCFullYear()===y&&result.getUTCMonth()===m-1&&result.getUTCDate()===d?result:null;
  }
  function ageAt(profile={},now=new Date()) {
    const today=date(dayKey(now));if(!today)return null;
    if(profile.birthDate) {
      const birth=date(profile.birthDate);if(!birth||birth>today)return null;
      let years=today.getUTCFullYear()-birth.getUTCFullYear();
      const birthday=y=>new Date(Date.UTC(y,birth.getUTCMonth(),birth.getUTCDate()));
      if(today<birthday(today.getUTCFullYear()))years--;
      const last=birthday(birth.getUTCFullYear()+years),next=birthday(birth.getUTCFullYear()+years+1);
      const value=years+(today-last)/(next-last);
      return value>=0&&value<=120?value:null;
    }
    const age=Number(profile.ageReferenceValue??profile.age);
    if(profile.age==null||profile.age===''||!Number.isFinite(age)||age<13||age>120)return null;
    const reference=date(profile.ageReferenceDate);
    return Math.min(120,age+(reference?Math.max(0,today-reference)/(365.2425*86400000):0));
  }
  function info(profile={},now=new Date()) {
    const age=ageAt(profile,now);
    if(age==null||age<13)return {age,factor:1,applied:false,source:'missing'};
    const modelAge=Math.max(15,Math.min(90,age));
    const values=['female','weiblich','f'].includes(String(profile.bodyProfile||profile.sex||profile.gender).toLowerCase())?female:male;
    const upper=ages.findIndex(value=>value>=modelAge),lower=Math.max(0,upper-1);
    const fraction=upper===lower?0:(modelAge-ages[lower])/(ages[upper]-ages[lower]);
    const reference=values[lower]+fraction*(values[upper]-values[lower]);
    return {age,modelAge,factor:values[2]/reference,applied:true,bounded:age<15||age>90,source:profile.birthDate?'birthDate':'age-estimate'};
  }
  function adjust(baseScore,exercise,profile,now=new Date()) {
    const strength=exercise?.rankable!==false&&!['time','distance'].includes(exercise?.tracking);
    const context=info(profile,now),base=Math.max(0,Number(baseScore)||0);
    const adjusted=strength?Math.round(base*context.factor):base;
    // Preserve the existing confidence ceiling; age cannot certify a machine.
    const score=exercise?.rankCalibration==='estimated'?Math.min(699,adjusted):adjusted;
    return {baseScore:base,score,age:context,strength};
  }
  function ensureProfile(profile,now=new Date()) {
    if(!profile)return false;
    let changed=false;
    if(!profile.birthDate&&Number(profile.age)>=13&&Number(profile.age)<=120&&!date(profile.ageReferenceDate)) {
      profile.ageReferenceDate=dayKey(now);profile.ageReferenceValue=Number(profile.age);changed=true;
    }
    const value=ageAt(profile,now);
    if(value!=null&&profile.age!==Math.floor(value)){profile.age=Math.floor(value);changed=true;}
    return changed;
  }
  window.EVORANK_AGE_X47=Object.freeze({ageAt,info,adjust,ensureProfile,dayKey,model:'strength-age-v1',source:'https://strengthlevel.com/strength-standards/bench-press/kg'});
})();
