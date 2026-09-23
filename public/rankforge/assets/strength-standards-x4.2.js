/* Community benchmarks checked 2026-09-07. These are not clinical norms.
 * Sources and EvoRank's own score mapping: docs/EVORANK-X4.2-RANGPRUEFUNG.md.
 * Values: body mass followed by additional 1RM kg (assistance is negative).
 */
(() => {
  'use strict';
  const tables = {
    dip: {
      male: [[50,-5,11,31,54,78],[70,2,22,46,73,101],[75,3,25,49,77,106],[100,8,32,61,92,125],[140,8,37,69,105,141]],
      female: [[40,-15,-4,10,26,44],[70,-16,0,19,40,62],[75,-16,0,20,41,64],[100,-21,-2,20,44,69],[120,-27,-7,17,43,70]],
      source: 'https://strengthlevel.com/strength-standards/dips/kg'
    },
    pullup: {
      male: [[50,-5,7,22,39,56],[70,-2,13,31,50,71],[75,-2,14,32,52,73],[100,-3,15,36,59,82],[140,-10,12,38,62,86]],
      female: [[40,-14,-5,6,17,30],[70,-18,-5,9,24,40],[75,-19,-6,8,24,41],[100,-26,-12,5,22,40],[120,-34,-18,-1,18,37]],
      source: 'https://strengthlevel.com/strength-standards/pull-ups/kg'
    }
  };
  // Product mapping, not source percentiles: Beginner, Novice, Intermediate,
  // Advanced, Elite. Interpolation keeps adjacent bodyweights continuous.
  const scores = [100,220,350,500,650];
  function thresholds(family,bw,female=false) {
    const rows=tables[family]?.[female?'female':'male'];if(!rows)return null;
    const upper=rows.find(row=>row[0]>=bw)||rows.at(-1);
    const lower=[...rows].reverse().find(row=>row[0]<=bw)||rows[0];
    const fraction=upper[0]===lower[0]?0:(bw-lower[0])/(upper[0]-lower[0]);
    return scores.map((_,i)=>bw+lower[i+1]+fraction*(upper[i+1]-lower[i+1]));
  }
  function familyFor(e) {
    if(e?.isCustom||!['added','assisted'].includes(e?.bodyweightMode))return '';
    const family=window.EVORANK_X2_RANKS?.family(e);
    return tables[family]?family:'';
  }
  function score(e,oneRM,bw,female) {
    const family=familyFor(e);if(!family)return null;
    if(!(oneRM>0))return 0;
    const levels=thresholds(family,bw,female);
    if(oneRM<levels[0])return Math.max(0,Math.round(oneRM/levels[0]*scores[0]));
    let index=levels.findIndex((value,i)=>i>0&&oneRM<=value);
    if(index<0)index=levels.length-1;
    const result=scores[index-1]+(oneRM-levels[index-1])/(levels[index]-levels[index-1])*(scores[index]-scores[index-1]);
    // Values beyond Elite extrapolate an app rank; no percentile is claimed.
    return Math.min(899,Math.max(0,Math.round(result)));
  }
  window.EVORANK_STANDARDS_X42=Object.freeze({score,thresholds,familyFor,
    sourceFor:e=>tables[familyFor(e)]?.source||'',checkedAt:'2026-09-07'});
})();
