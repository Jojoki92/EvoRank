/* X5.3: measured sport competencies and the same rank views for all sports. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype;
  const old=Object.fromEntries(['renderHome','renderRanks','renderAnalysis','renderProfile','renderFriends','renderModal','handleClick','handleChange'].map(k=>[k,proto[k]]));
  const sports=['strength','run','bike','swim'];
  const names={strength:'Gym',run:'Laufen',bike:'Radfahren',swim:'Schwimmen'};
  const headings={run:'Dein Laufprofil',bike:'Dein Radprofil',swim:'Dein Schwimmprofil'};
  const labels={tempo:'Tempo',distance:'Langstrecke',consistency:'Konstanz'};
  const esc=v=>escapeHtml(String(v??''));
  const num=(v,d=1)=>new Intl.NumberFormat('de-AT',{maximumFractionDigits:d}).format(v);
  const parse=html=>{const t=document.createElement('template');t.innerHTML=html;return t;};
  const btn=(action,label,attrs='',primary=false)=>`<button type="button" class="button button--${primary?'primary':'secondary'}" data-action="${action}" ${attrs}>${label}</button>`;
  const nowDate=now=>now instanceof Date?now:new Date(now??Date.now());
  let serial=0;
  function tier(score,sport) {
    const ranks=window.EVORANK_ART_X51.sports[sport]?.ranks;
    if(score==null)return {index:null,name:ranks?.[0]||RANKS[0].name,color:RANKS[0].color,score:null};
    const value=Math.max(0,Math.min(800,Math.round(Number(score)||0))),index=Math.min(8,Math.floor(value/100));
    return {index,name:ranks?.[index]||RANKS[index].name,color:RANKS[index].color,score:value};
  }
  function profile(app,sport,now=new Date()) {
    const date=nowDate(now),metrics=window.RANKFORGE970.sportMetrics(sport,app,date);
    const rows=metrics.list.filter(a=>a.distanceMeters>0&&a.durationSeconds>0&&Number.isFinite(Date.parse(a.date))&&Date.parse(a.date)<=date.getTime())
      .map(activity=>({activity,detail:window.RANKFORGE970.performanceDetails(activity,app.state.profile,date)}))
      .filter(r=>r.detail.basis!=='none');
    const best=key=>rows.reduce((b,r)=>!b||r.detail[key]>b.detail[key]||(key==='distancePoints'&&r.detail[key]===b.detail[key]&&r.activity.distanceMeters>b.activity.distanceMeters)?r:b,null);
    const t=best('tempoPoints'),d=best('distancePoints');
    const cutoff=date.getTime()-28*86400000;
    const days=new Set(rows.filter(r=>Date.parse(r.activity.date)>=cutoff).map(r=>r.activity.date.slice(0,10))).size;
    // Visualize the existing 0–99 consistency bonus. This adds no points to the overall rank.
    const bonus=Math.min(99,days*13);
    return {sport,metrics,rows,components:{
      tempo:{...tier(t?.detail.tempoPoints,sport),label:t?.detail.basis==='power'?'Leistung':labels.tempo,best:t},
      distance:{...tier(d?.detail.distancePoints,sport),label:labels.distance,best:d},
      consistency:{...tier(rows.length?800*bonus/99:null,sport),label:labels.consistency,days,bonus}
    }};
  }
  function currentSport(app) {
    const selected=app.ui.x53RankSport||app.ui.rf103RankSport||window.EVORANK_X51.settings(app).active;
    return sports.includes(selected)?selected:'strength';
  }
  function tabs(app,sport,action='x53-rank-sport') {
    return `<div class="x53-sport-tabs" aria-label="Sportart">${sports.map(s=>`<button type="button" data-action="${action}" data-sport="${s}" aria-pressed="${sport===s}" class="${sport===s?'is-active':''}">${names[s]}</button>`).join('')}</div>`;
  }
  function measure(component,sport) {
    if(component.score==null)return 'Einstiegsfarbe · noch keine Messwerte';
    if(component.days!=null)return `${component.days} aktive Tage · letzte 28 Tage`;
    const a=component.best.activity;
    if(component.label==='Langstrecke')return `${num(a.distanceMeters/(sport==='swim'?1:1000),2)} ${sport==='swim'?'m':'km'} · ${formatDuration(a.durationSeconds)}`;
    if(component.best.detail.basis==='power')return `${num(component.best.detail.wattsPerKg,2)} W/kg · ${num(component.best.detail.averagePowerWatts,0)} W`;
    if(sport==='bike')return `${num(a.distanceMeters/a.durationSeconds*3.6)} km/h`;
    return `${formatDuration(Math.round(a.durationSeconds/a.distanceMeters*(sport==='swim'?100:1000)))} /${sport==='swim'?'100 m':'km'}`;
  }
  function figure(data,chosen='distance') {
    const id='x53-sport-'+(++serial),{sport,components:c}=data;
    const defs=Object.keys(c).map(key=>`<linearGradient id="${id}-${key}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${c[key].color}"/><stop offset=".6" stop-color="${c[key].color}"/><stop offset="1" stop-color="${c[key].color}" stop-opacity=".76"/></linearGradient>`).join('');
    const material=`<radialGradient id="${id}-light" cx=".35" cy=".25" r=".85"><stop stop-color="#fff" stop-opacity=".24"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><linearGradient id="${id}-metal" x2=".5" y2="1"><stop stop-color="#465261"/><stop offset=".12" stop-color="#edf4ff"/><stop offset=".25" stop-color="#69747f"/><stop offset=".5" stop-color="#e4eaf0"/><stop offset=".8" stop-color="#576473"/><stop offset="1" stop-color="#b9c5d0"/></linearGradient><filter id="${id}-water" x="0" y="0" width="100%" height="100%"><feTurbulence baseFrequency=".035 .042" numOctaves="1" seed="8"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 4 -2.2"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
    const region=(key,shape)=>`<g class="x53-region ${chosen===key?'is-selected':''}" role="button" tabindex="0" aria-pressed="${chosen===key}" aria-label="${esc(c[key].label+' · '+c[key].name)}" data-action="x53-area" data-sport="${sport}" data-area="${key}" style="--tier:${c[key].color}">${shape}</g>`;
    let art,extra='';
    if(sport==='run') {
      const ring='M155 30H365A130 130 0 0 1 365 290H155A130 130 0 0 1 155 30Z M160 112H360A48 48 0 0 1 360 208H160A48 48 0 0 1 160 112Z';
      extra=`<clipPath id="${id}-track"><path d="${ring}" clip-rule="evenodd"/></clipPath>`;
      art=`<path d="${ring}" fill="#161b24" fill-rule="evenodd" stroke="#929ba8" stroke-width="4"/>`;
      const shapes={tempo:'M0 0H382L365 160H0Z',distance:'M0 160H365L382 330H0Z',consistency:'M382 0H520V330H382L365 160Z'};
      for(const key of Object.keys(c)){
        extra+=`<clipPath id="${id}-edge-${key}"><path d="${shapes[key]}"/></clipPath>`;
        art+=region(key,`<g clip-path="url(#${id}-track)"><path class="x53-fill" d="${shapes[key]}" fill="url(#${id}-${key})"/><path class="x53-selection" d="${shapes[key]}"/><path class="x53-selection" d="${ring}" clip-path="url(#${id}-edge-${key})"/></g>`);
      }
      art+=`<path class="x53-art-light" d="${ring}" fill="url(#${id}-light)" fill-rule="evenodd"/><path class="x53-art-rim" d="${ring}" fill="none" stroke="url(#${id}-metal)" stroke-width="2" fill-rule="evenodd"/>`;
      art+=`<g class="x53-track-lines">${[0,1,2,3,4].map(i=>`<rect x="${36+i*14}" y="${41+i*14}" width="${448-i*28}" height="${238-i*28}" rx="${119-i*14}"/>`).join('')}</g>`;
    } else if(sport==='bike') {
      art=`<circle cx="260" cy="164" r="141" fill="#161b23" stroke="#404751" stroke-width="4"/><circle cx="260" cy="164" r="138" fill="none" stroke="#87909a" stroke-width="2" stroke-dasharray="2 4"/><circle cx="260" cy="164" r="132" fill="none" stroke="url(#${id}-metal)" stroke-width="7"/>`;
      const shapes={tempo:'M260 164L260 36A128 128 0 0 0 149.15 228Z',distance:'M260 164L149.15 228A128 128 0 0 0 370.85 228Z',consistency:'M260 164L370.85 228A128 128 0 0 0 260 36Z'};
      for(const key of Object.keys(c))art+=region(key,`<path class="x53-fill" d="${shapes[key]}" fill="url(#${id}-${key})"/><path class="x53-selection" d="${shapes[key]}"/>`);
      art+=`<circle class="x53-art-light" cx="260" cy="164" r="128" fill="url(#${id}-light)"/>`;
      art+=`<g class="x53-spokes">${Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return `<path d="M${260+11*Math.cos(a+.25)} ${164+11*Math.sin(a+.25)}L${260+126*Math.cos(a)} ${164+126*Math.sin(a)}"/>`;}).join('')}</g><circle cx="260" cy="164" r="16" fill="#4d5666" stroke="#e1e5ed" stroke-width="3"/><circle cx="260" cy="164" r="9" fill="#171c25"/>`;
    } else {
      art='<rect x="19" y="32" width="482" height="258" rx="28" fill="#173e55" stroke="#d2e8f0" stroke-width="2"/><rect x="28" y="41" width="464" height="240" rx="21" fill="#072332" stroke="#5999bb"/>';
      for(const [i,key] of Object.keys(c).entries()){
        const x=42+i*148;
        art+=region(key,`<rect class="x53-fill" x="${x}" y="53" width="140" height="216" rx="5" fill="url(#${id}-${key})"/><rect class="x53-selection" x="${x+2}" y="55" width="136" height="212" rx="5"/>`);
        art+=`<g class="x53-art-light"><rect x="${x+3}" y="56" width="134" height="210" fill="url(#${id}-light)"/><rect x="${x+5}" y="58" width="130" height="206" fill="white" opacity=".42" filter="url(#${id}-water)"/></g>`;
        art+=`<g class="x53-water">${[0,1,2,3,4].map(n=>`<path d="M${x+9} ${77+n*32}q16 -13 32 0t32 0t32 0t24 0"/>`).join('')}</g>`;
      }
      art+=`<g>${[185,333].map(x=>Array.from({length:22},(_,i)=>`<rect x="${x}" y="${55+i*9.5}" width="7" height="8" fill="${[0,1,20,21].includes(i)?'#ff665c':'#d2e9f0'}"/>`).join('')).join('')}</g><path class="x53-pool-rim" d="M19 85H9V119H29M19 213H9V247H29M501 85H511V119H491M501 213H511V247H491"/>`;
      art+=`<g class="x53-pool-tiles">${Array.from({length:32},(_,i)=>`<path d="M${32+i*14.3} 33V41M${32+i*14.3} 281V289"/>`).join('')}${Array.from({length:14},(_,i)=>`<path d="M20 ${51+i*16}H28M492 ${51+i*16}H500"/>`).join('')}</g>`;
    }
    const label=key=>`<button class="x56-map-label x56-map-label--${key}" data-action="x53-area" data-sport="${sport}" data-area="${key}" aria-pressed="${chosen===key}" style="--tier:${c[key].color}"><strong><i></i>${esc(c[key].label)}</strong><span>${esc(c[key].name)}</span></button>`;
    return `<div class="x56-sport-map"><div class="x56-map-labels">${label('tempo')}${label('consistency')}</div><svg class="x53-figure x53-figure--${sport}" viewBox="0 0 520 ${sport==='bike'?385:330}" role="group" aria-label="${names[sport]} · farbige Kompetenzbereiche"><defs>${defs}${material}${extra}</defs>${sport==='bike'?`<g transform="translate(-52,-3) scale(1.2)">${art}</g>`:art}</svg>${label('distance')}</div>`;
  }
  function legend(sport) {
    return `<details class="x53-legend"><summary>Rangfarben</summary><div>${RANKS.map(r=>`<span><i style="background:${r.color}"></i>${esc(window.EVORANK_ART_X51.sports[sport]?.ranks[RANKS.indexOf(r)]||r.name)}</span>`).join('')}<span>Einstiegsfarbe ohne Messwerte: noch keine Wertung</span></div></details>`;
  }
  function renderProfile(app,sport,{actions=true}={}) {
    const data=profile(app,sport),chosen=app.ui.x53Areas?.[sport]||'distance',c=data.components[chosen];
    const scored=Object.values(data.components).filter(v=>v.score!=null),max=Math.max(...scored.map(v=>v.score));
    const strongest=scored.filter(v=>v.score===max);
    const note=c.score==null?'Zeichne eine passende Einheit auf.':strongest.length===1&&strongest[0]===c?'Aktuell dein stärkster Bereich':strongest.length===1?`${strongest[0].label} liegt auf ${strongest[0].name}`:'Mehrere Bereiche liegen auf demselben Niveau';
    return `<section class="x53-profile x51-sport-profile"><header><h2>${headings[sport]}</h2><p>Deine Stärken auf einen Blick</p></header>${figure(data,chosen)}<p class="x53-figure-hint">Farbe = Bereichsrang · Antippen für Details</p><button class="x53-competency-card" style="--tier:${c.color}" data-action="x53-component" data-sport="${sport}" data-area="${chosen}"><small>${c.label.toLocaleUpperCase('de')}</small><strong><i></i>${esc(c.name)}${icon('chevronRight',18)}</strong><span>${esc(note)}</span><em>${esc(measure(c,sport))}</em></button>${btn('x53-analysis','Verlauf ansehen '+icon('chevronRight',16),`data-sport="${sport}"`)}${legend(sport)}</section>${actions?`<article class="next-workout-card x55-sport-start"><div class="next-workout-card__top"><span>DEINE NÄCHSTE EINHEIT</span></div><div class="next-workout-card__body"><div><h2>${names[sport]}</h2><p>${sport==='swim'?'Zeit aufzeichnen und Bahnen zählen.':'Zeit und Strecke aufzeichnen – mit GPS oder manuell.'}</p></div></div><div class="next-workout-card__actions">${btn('x53-record',icon('play',17)+' Einheit starten',`data-sport="${sport}"`,true)}</div><button class="x55-manual" data-action="x53-manual" data-sport="${sport}">Vergangene Einheit eintragen</button></article>`:''}`;
  }
  function componentDetails(app,sport,key) {
    const data=profile(app,sport),c=data.components[key];
    const copy=key==='consistency'?'Konstanz zeigt den ausgeschöpften Anteil des bestehenden 28-Tage-Bonus: 13 Punkte je aktivem Tag, höchstens 99. Dieser Anteil wird für die Farben auf 0–800 skaliert. Ab acht aktiven Tagen ist die oberste Farbe erreicht. Das beschreibt Regelmäßigkeit, keine sportliche Höchstleistung.':key==='distance'?'Die Streckenkomponente verwendet dieselben Distanzschwellen und dieselbe Wurzelkurve wie dein bisheriger Ausdauerrang, separat auf 0–800 skaliert. Bewertet wird die längste geeignete gespeicherte Einheit. Das sind EvoRank-Spielstufen; Pausen und Bedingungen können die Vergleichbarkeit beeinflussen.':'Die Tempokomponente verwendet dieselbe Alters- und Körperprofilkorrektur und dieselben Tempo- beziehungsweise Watt/kg-Schwellen wie der bisherige Ausdauerrang, separat auf 0–800 skaliert. Sehr kurze Strecken werden weiterhin geringer gewichtet. Gemessene Radleistung benötigt mindestens 20 Minuten und das damals gespeicherte Körpergewicht.';
    return `${app.modalHeader(names[sport],c.label+' · '+c.name)}<div class="modal-scroll x53-detail"><p class="x53-value">${esc(measure(c,sport))}</p>${c.score!=null?`<p>${c.score} Bereichspunkte${c.index<8?` · ${100-c.score%100} bis ${window.EVORANK_ART_X51.sports[sport].ranks[c.index+1]}`:' · höchste Stufe'}</p>`:''}<p>${copy}</p><p>Die Teilfarben ergänzen die Übersicht. Dein Gesamtrang wird weiterhin unverändert berechnet; die drei Farben werden nicht nochmals addiert.</p>${c.best?`<p>Grundlage: ${new Date(c.best.activity.date).toLocaleDateString('de-AT')} · ${num(c.best.activity.distanceMeters/1000,2)} km · ${formatDuration(c.best.activity.durationSeconds)}</p>`:''}${window.EVORANK_X51.profileContext(app)}</div>`;
  }
  function rankCard(app,sport) {
    const m=window.RANKFORGE970.sportMetrics(sport,app),name=m.current[1];
    return `<article class="rank-hero x53-rank-hero"><small>DEIN ${names[sport].toUpperCase()}-RANG</small>${window.RANKFORGE970.rankBadge(sport,m.index)}<h2>${esc(name)}</h2><p>${m.score} Punkte</p><div class="x53-rank-progress" role="progressbar" aria-label="Fortschritt zum nächsten Rang" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.index===8?100:m.score%100}"><i style="width:${m.index===8?100:m.score%100}%"></i></div><p>${m.next?`Noch ${100-m.score%100} Punkte bis ${esc(m.next[1])}`:'Höchste Rangstufe'}</p>${btn('x53-rank-help','So wird dein Rang berechnet',`data-sport="${sport}"`)}</article>`;
  }
  function gallery(app,sport) {
    const m=window.RANKFORGE970.sportMetrics(sport,app),ranks=window.EVORANK_ART_X51.sports[sport].ranks;
    return `<div class="gallery-view"><div class="gallery-intro"><small>${names[sport].toUpperCase()}</small><h2>Deine Abzeichen</h2><p>Alle neun Rangstufen</p></div><div class="rank-gallery">${ranks.map((r,i)=>`<article class="rank-gallery-card ${m.list.length&&i<=m.index?'is-unlocked':'is-locked'}" style="--rank:${RANKS[i].color}">${window.RANKFORGE970.rankBadge(sport,i)}<div class="rank-gallery-card__copy"><h3>${esc(r)}</h3><strong>${i===8?'800+':i*100+'–'+(i*100+99)} Punkte</strong><span>${m.list.length&&i===m.index?'Aktueller Rang':m.list.length&&i<m.index?'Freigeschaltet':'Noch nicht erreicht'}</span></div>${icon(m.list.length&&i<=m.index?'check':'lock',18)}</article>`).join('')}</div></div>`;
  }
  function publicRanks(app) {
    return Object.fromEntries(sports.slice(1).map(s=>{const m=window.RANKFORGE970.sportMetrics(s,app);return [s,{score:m.score,recorded:!!m.list.length,model:'endurance-age-v1'}];}));
  }
  function friends(app,sport) {
    const own=publicRanks(app)[sport],live=app.state.liveFriends||{};
    const rows=[{id:'self',name:'Du',...own}];
    for(const id of live.friendIds||[]){const f=live.snapshots?.[id],r=f?.sportRanks?.[sport];if(r?.model==='endurance-age-v1'&&r.recorded===true&&Number.isFinite(r.score)&&r.score>=0&&r.score<=899)rows.push({id,name:f.name||'Freund',score:r.score,recorded:true});}
    rows.sort((a,b)=>b.score-a.score);
    return `<section class="x53-friends"><div class="section-heading"><h2>Freunde · ${names[sport]}</h2></div>${rows.map((r,i)=>`<article class="x53-friend-row"><span>${r.recorded?i+1:'—'}</span><strong>${esc(r.name)}</strong>${r.recorded?window.RANKFORGE970.rankBadge(sport,Math.floor(r.score/100)):'—'}<div>${r.recorded?`${num(r.score,0)} Punkte`:'Noch keine Wertung'}</div></article>`).join('')}<p class="x53-muted">${rows.length===1?'Für diese Sportart liegen noch keine geteilten Freundeswerte vor.':'Verglichen werden zuletzt geteilte Sportwerte. Ältere App-Versionen teilen möglicherweise nur den Gym-Rang.'}</p>${btn('rf93-friends-open',icon('users',18)+' Freunde suchen und verwalten')}</section>`;
  }
  function analysis(app,sport) {
    const metric=app.ui.x53Metric||'distance',days=app.ui.x53Days??90,now=Date.now(),report=analysisReport(app,sport,now),list=report.all.filter(a=>!days||Date.parse(a.date)>=now-days*86400000);
    const options={distance:['Strecke',sport==='swim'?'m':'km'],duration:['Dauer','Min.'],tempo:[sport==='bike'?'Geschwindigkeit':'Pace',sport==='bike'?'km/h':sport==='swim'?'Min./100 m':'Min./km']};
    const [label,unit]=options[metric]||options.distance;
    const value=a=>metric==='duration'?a.durationSeconds/60:metric==='tempo'?(sport==='bike'?a.distanceMeters/a.durationSeconds*3.6:a.durationSeconds/60/a.distanceMeters*(sport==='swim'?100:1000)):a.distanceMeters/(sport==='swim'?1:1000);
    const points=list.map(a=>({time:Date.parse(a.date),value:value(a)})).sort((a,b)=>a.time-b.time);
    const stat=(label,value,detail='')=>`<article><small>${label}</small><strong>${value}</strong>${detail?`<span>${detail}</span>`:''}</article>`;
    const delta=(key,unit='',divisor=1)=>{const a=report.month[key]/divisor,b=report.previous[key]/divisor;return `${a-b>0?'+':''}${num(a-b)}${unit} · Vormonat ${num(b)}${unit}`;};
    const date=a=>a?new Date(a.date).toLocaleDateString('de-AT'):'Noch keine Einheit';
    const pace=a=>!a?'—':sport==='bike'?`${num(a.distanceMeters/a.durationSeconds*3.6)} km/h`:`${formatDuration(Math.round(a.durationSeconds/a.distanceMeters*(sport==='swim'?100:1000)))} ${sport==='swim'?'/100 m':'/km'}`;
    return `<div class="x54-endurance-analysis"><section class="x51-card x53-analysis"><header><div><small>${names[sport].toUpperCase()}</small><h2>Deine Entwicklung</h2></div></header><div class="x51-chart-controls"><label>Messwert<select data-x53-metric>${Object.entries(options).map(([k,v])=>`<option value="${k}" ${k===metric?'selected':''}>${v[0]}</option>`).join('')}</select></label><label>Zeitraum<select data-x53-days>${[[30,'30 Tage'],[90,'90 Tage'],[365,'1 Jahr'],[0,'Gesamt']].map(([n,label])=>`<option value="${n}" ${n===days?'selected':''}>${label}</option>`).join('')}</select></label></div>${window.EVORANK_X51.chart(points,label,unit)}<p>${list.length} Einheiten · ${num(list.reduce((n,a)=>n+a.distanceMeters,0)/1000,2)} km · ${num(list.reduce((n,a)=>n+a.durationSeconds,0)/60,0)} Min.</p><p class="x53-muted">Jeder Punkt ist eine gespeicherte Einheit.${metric==='tempo'&&sport!=='bike'?' Bei Pace ist ein kleinerer Wert schneller.':''}</p><details class="x51-explanation"><summary>Alle Messwerte</summary>${list.length?`<div class="x51-table-wrap"><table><thead><tr><th>Datum</th><th>${label}</th><th>Dauer</th></tr></thead><tbody>${list.slice().sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).map(a=>`<tr><td>${date(a)}</td><td>${num(value(a),2)} ${unit}</td><td>${formatDuration(a.durationSeconds)}</td></tr>`).join('')}</tbody></table></div>`:'<p>Noch keine passenden Einheiten.</p>'}</details></section>
    <section class="x51-card x54-stat-section"><header><h2>Dieser Monat</h2><small>gegen den gesamten Vormonat</small></header><div class="x54-stats">${stat('Einheiten',report.month.count,delta('count'))}${stat('Strecke',num(report.month.distance/1000,2)+' km',delta('distance',' km',1000))}${stat('Trainingszeit',num(report.month.duration/60,0)+' Min.',delta('duration',' Min.',60))}${stat('Aktive Tage',report.month.days,delta('days'))}</div><p class="x53-muted">Der aktuelle Monat läuft noch. Die Differenz ist kein Leistungsurteil.</p></section>
    <section class="x51-card x54-stat-section"><header><h2>Gesamt & Bestwerte</h2><small>alle gespeicherten Einheiten</small></header><div class="x54-stats">${stat('Einheiten gesamt',report.total.count)}${stat('Gesamtstrecke',num(report.total.distance/1000,2)+' km')}${stat('Trainingszeit',num(report.total.duration/3600,1)+' Std.')}${stat('Längste Strecke',report.longest?num(report.longest.distanceMeters/1000,2)+' km':'—',date(report.longest))}${stat(sport==='bike'?'Höchste Ø Geschwindigkeit':'Schnellste Ø Pace',pace(report.fastest),date(report.fastest))}${stat('Längste Einheit',report.longestTime?formatDuration(report.longestTime.durationSeconds):'—',date(report.longestTime))}</div><p class="x53-muted">Tempo ist der Durchschnitt einer ganzen Einheit, kein Sprintwert. Strecke, Pausen, Höhenmeter und Bedingungen beeinflussen den Vergleich. Strava-Importe bleiben im persönlichen Kalender.</p></section>
    <section class="x51-card x54-stat-section"><header><h2>Dein Trainingsrhythmus</h2><small>letzte 12 Wochen · Einheiten je Woche</small></header>${report.total.count?window.EVORANK_X51.chart(report.weeks,'Einheiten je Woche','Einheiten',{integerAxis:true}):'<p class="x51-empty">Zeichne deine erste Einheit auf, um deinen Rhythmus zu sehen.</p>'}</section></div>`;
  }
  function analysisReport(app,sport,now=Date.now()) {
    const all=window.RANKFORGE970.sportMetrics(sport,app,new Date(now)).list.filter(a=>Number.isFinite(a.distanceMeters)&&a.distanceMeters>0&&Number.isFinite(a.durationSeconds)&&a.durationSeconds>0&&Number.isFinite(Date.parse(a.date))&&Date.parse(a.date)<=now);
    const localDay=a=>new Date(a.date).toLocaleDateString('en-CA');
    const summarize=list=>({count:list.length,distance:list.reduce((n,a)=>n+a.distanceMeters,0),duration:list.reduce((n,a)=>n+a.durationSeconds,0),days:new Set(list.map(localDay)).size});
    const date=new Date(now),start=new Date(date.getFullYear(),date.getMonth(),1).getTime(),previous=new Date(date.getFullYear(),date.getMonth()-1,1).getTime();
    const best=fn=>all.reduce((b,a)=>!b||fn(a)>fn(b)?a:b,null);
    const monday=new Date(date.getFullYear(),date.getMonth(),date.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
    const weeks=Array.from({length:12},(_,i)=>{const from=new Date(monday);from.setDate(from.getDate()-(11-i)*7);
      // Calendar arithmetic keeps local week boundaries correct across DST and month changes.
      const end=new Date(from);end.setDate(end.getDate()+7);
      return {time:from.getTime(),value:all.filter(a=>Date.parse(a.date)>=from.getTime()&&Date.parse(a.date)<end.getTime()).length,name:'Woche ab '+from.toLocaleDateString('de-AT')};});
    return {all,total:summarize(all),month:summarize(all.filter(a=>Date.parse(a.date)>=start)),previous:summarize(all.filter(a=>Date.parse(a.date)>=previous&&Date.parse(a.date)<start)),longest:best(a=>a.distanceMeters),longestTime:best(a=>a.durationSeconds),fastest:best(a=>a.distanceMeters/a.durationSeconds),weeks};
  }
  function rankScreen(app,sport) {
    const tab=['rank','bodygraph','leagues','gallery','analysis'].includes(app.ui.rankTab)?app.ui.rankTab:'rank';
    const tabNames=[['rank','Dein Rang'],['bodygraph','Sportprofil'],['leagues','Freunde'],['gallery','Galerie'],['analysis','Analyse']];
    const content=tab==='bodygraph'?renderProfile(app,sport):tab==='leagues'?friends(app,sport):tab==='gallery'?gallery(app,sport):tab==='analysis'?analysis(app,sport):rankCard(app,sport)+(window.EVORANK109?.renderLeaderboard(sport,app)||'');
    return `<section class="screen ranks-screen x53-ranks"><div class="screen-title"><div><p>${names[sport].toUpperCase()}</p><h1>Ranks</h1></div><button class="circle-button" data-action="x51-home-settings" aria-label="Sportarten und Startseite anpassen">${icon('settings',20)}</button></div>${tabs(app,sport)}<div class="rank-tabs x53-rank-tabs" role="tablist">${tabNames.map(([k,label])=>`<button role="tab" aria-selected="${tab===k}" data-action="rank-tab" data-tab="${k}" class="${tab===k?'is-active':''}">${label}</button>`).join('')}</div>${content}</section>`;
  }
  proto.renderRanks=function(...args) {
    const sport=currentSport(this);
    if(sport!=='strength')return rankScreen(this,sport);
    this.state.rankDisplayV108={...this.state.rankDisplayV108,rankOrder:[...new Set(['strength',...(this.state.rankDisplayV108?.rankOrder||[])])]};
    this.ui.rf103RankSport='strength';
    const t=parse(old.renderRanks.apply(this,args)),root=t.content.querySelector('.screen');
    t.content.querySelector('.rf103-rank-switcher')?.remove();
    t.content.querySelector('.rfx47-age')?.remove();
    if(root){root.querySelector(':scope > .x51-explanation')?.remove();const target=root.querySelector('.rank-tabs');target?.classList.add('x53-rank-tabs');target?.insertAdjacentHTML('beforebegin',tabs(this,sport));root.insertAdjacentHTML('beforeend',`<div class="x53-rank-help">${btn('x53-rank-help','Einordnung & Vergleichsdaten','data-sport="strength"')}</div>`);}
    return t.innerHTML;
  };
  proto.renderHome=function(...args) {
    const t=parse(old.renderHome.apply(this,args));
    const figureRoot=t.content.querySelector('.x53-profile'),start=t.content.querySelector('.x55-sport-start');
    if(figureRoot&&start)figureRoot.after(start);
    if(this.ui.view==='triathlon'){
      const sport=this.ui.rf970Sport,root=t.content.querySelector('.rf970-screen');
      if(root&&sports.includes(sport)){
        root.querySelector('.rf970-title>span')?.remove();
        const intro=root.querySelector('.rf970-title p');if(intro)intro.textContent='Zeit und Strecke aufzeichnen – live oder nachträglich.';
        root.querySelectorAll('.rf970-hero,.rf970-metrics,.rfx48-endurance').forEach(e=>e.remove());
        root.querySelector('.rf970-ladder')?.closest('.rf970-section')?.remove();
        root.querySelector('.rf970-title')?.insertAdjacentHTML('afterend',renderProfile(this,sport,{actions:false}));
        // Existing tracker, manual form, imports and coach actions remain intact.
        for(const sel of ['.rf970-garmin-card','.rf970-coach']){
          const block=root.querySelector(sel);if(block){const d=document.createElement('details');d.className='x53-fold';d.innerHTML=`<summary>${sel.includes('garmin')?'Garmin & Import':'Trainingsplan'}</summary>`;block.replaceWith(d);d.append(block);}
        }
      }
    }
    return t.innerHTML;
  };
  proto.renderProfile=function(...args) {
    const t=parse(old.renderProfile.apply(this,args));
    t.content.querySelector('.rf880-profile-quick [data-action="open-profile-edit"]')?.remove();
    t.content.querySelectorAll('.x51-profile-tools').forEach(e=>e.remove());
    const first=t.content.querySelector('.rf880-profile-group__body, .settings-list');
    if(first&&!t.content.querySelector('[data-action="x51-progress-library"]'))first.insertAdjacentHTML('beforeend',`<button class="x53-setting-link" data-action="x51-progress-library"><span>${icon('chart',20)}</span><div><strong>Fortschrittsgrafiken</strong><small>Verlauf jeder Übung und deines Trainings</small></div>${icon('chevronRight',18)}</button>`);
    const groups=[...t.content.querySelectorAll('.rf880-profile-group')];
    const dataGroup=groups.find(g=>g.querySelector('summary')?.textContent.includes('Daten & Hilfe'))||groups.at(-1);
    if(dataGroup&&!t.content.querySelector('[data-action="rf110-open-production"]'))dataGroup.querySelector('.rf880-profile-group__body')?.insertAdjacentHTML('beforeend',`<button class="x53-setting-link" data-action="rf110-open-production"><span>${icon('shield',20)}</span><div><strong>Sicherheit, Cloud & Support</strong><small>Bestenlisten-Freigabe, Sicherung und Verbindungen</small></div>${icon('chevronRight',18)}</button>`);
    for(const group of groups){const count=group.querySelector('summary b');if(count)count.textContent=String(group.querySelector('.rf880-profile-group__body')?.children.length||0);}
    return t.innerHTML;
  };
  proto.renderAnalysis=function(...args){
    const t=parse(old.renderAnalysis.apply(this,args)),progress=t.content.querySelector('.v7-exercise-progress');
    if(progress){const fold=document.createElement('details');fold.className='x53-fold x54-exercise-fold';const heading=progress.querySelector('.section-heading');fold.innerHTML='<summary>'+esc(heading?.textContent||'Übungsverlauf')+'</summary>';heading?.remove();progress.replaceWith(fold);fold.append(progress);}
    const balance=t.content.querySelector('.rf84-balance-card');
    if(balance){balance.classList.add('x54-balance');balance.querySelector('.rf84-balance-preview')?.remove();}
    return t.innerHTML;
  };
  proto.renderFriends=function(...args) {
    const t=parse(old.renderFriends.apply(this,args)),manage=t.content.querySelector('.rf94-open'),root=t.content.querySelector('.screen');
    if(manage&&root){manage.innerHTML=icon('users',18)+' Freunde verwalten';manage.classList.add('x53-manage-friends');root.querySelector('.screen-title')?.insertAdjacentElement('afterend',manage);}
    return t.innerHTML;
  };
  proto.renderModal=function(...args) {
    const m=this.ui.modal;
    if(m?.type==='x53-component'||m?.type==='x53-rank-help'){
      const sport=sports.includes(m.sport)?m.sport:currentSport(this);
      let body;
      if(m.type==='x53-component'&&sport!=='strength'&&labels[m.area])body=componentDetails(this,sport,m.area);
      else {
        body=this.modalHeader(names[sport],'Einordnung & Vergleichsdaten')+'<div class="modal-scroll x53-detail">';
        if(sport==='strength'){
          const original=parse(old.renderRanks.call(this));body+=original.content.querySelector('.rfx47-age')?.outerHTML||'';
        }else {const m=window.RANKFORGE970.sportMetrics(sport,this);body+=`<p>${m.score} Rangpunkte = ${m.score-m.consistency} Punkte aus der besten bewerteten Einheit + ${m.consistency} Punkte für Konstanz.</p><p>Die Tempo- und Streckenkomponenten werden wie bisher zu 72 % und 28 % gewichtet. Alter und Körperprofil beeinflussen die Tempokomponente; geeignete gemessene Radleistung wird mit dem gespeicherten Gewicht als W/kg bewertet.</p><p>Konstanz zählt die letzten 28 Tage, die beste Leistung alle gespeicherten Einheiten. Die drei Teilfarben ändern deinen Gesamtrang nicht.</p>`;}
        if(sport!=='strength')body+=window.EVORANK_ENDURANCE_UI_X48.explanation(this,sport);
        body+=window.EVORANK_X51.profileContext(this)+'</div>';
      }
      if(m.type==='x53-component'&&sport!=='strength'){const t=parse(body);t.content.querySelector('.modal-scroll')?.insertAdjacentHTML('beforeend',window.EVORANK_ENDURANCE_UI_X48.explanation(this,sport));body=t.innerHTML;}
      return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true" aria-label="Rangdetails">${body}</section></div>`;
    }
    const t=parse(old.renderModal.apply(this,args));
    const form=t.content.querySelector('[data-form="x51-home"]');if(form){form.closest('.modal')?.classList.add('x53-home-config');form.querySelectorAll('label').forEach(l=>l.classList.add('x53-toggle-row'));}
    return t.innerHTML;
  };
  proto.handleClick=function(event) {
    const el=event.target.closest?.('[data-action]'),action=el?.dataset.action,sport=el?.dataset.sport;
    if(action==='rf103-open-sport'||action==='rf103-rank-sport'){
      if(!sports.includes(sport))return;event.preventDefault();this.ui.x53RankSport=sport;this.ui.rf103RankSport=sport;this.ui.view='ranks';this.ui.rankTab='rank';this.render();return;
    }
    if(action==='x51-home-sport')this.ui.x53RankSport=sport;
    if(!action?.startsWith('x53-'))return old.handleClick.call(this,event);
    event.preventDefault();
    if(action==='x53-rank-sport'&&sports.includes(sport)){this.ui.x53RankSport=sport;this.ui.rf103RankSport=sport;}
    if(action==='x53-area'&&sports.slice(1).includes(sport)&&labels[el.dataset.area]){this.ui.x53Areas||={};this.ui.x53Areas[sport]=el.dataset.area;}
    if(action==='x53-component'&&sports.slice(1).includes(sport)&&labels[el.dataset.area]){this.openModal('x53-component',{sport,area:el.dataset.area});return;}
    if(action==='x53-rank-help'){this.openModal('x53-rank-help',{sport:sports.includes(sport)?sport:currentSport(this)});return;}
    if(action==='x53-analysis'&&sports.slice(1).includes(sport)){this.ui.x53RankSport=sport;this.ui.rf103RankSport=sport;this.ui.view='ranks';this.ui.rankTab='analysis';}
    if(['x53-record','x53-manual'].includes(action)&&sports.slice(1).includes(sport)){
      this.ui.rf970Sport=sport;this.ui.view='triathlon';
      if(action==='x53-manual'){this.openModal('rf970-activity');return;}
      this.ui.modal=null;this.render();document.querySelector('.rfx42-tracker')?.scrollIntoView({block:'center',behavior:'auto'});return;
    }
    this.render();
  };
  proto.handleChange=function(event,...args){
    if(event.target.matches?.('[data-x53-metric]')){if(['distance','duration','tempo'].includes(event.target.value))this.ui.x53Metric=event.target.value;this.render();return;}
    if(event.target.matches?.('[data-x53-days]')){const n=Number(event.target.value);if([0,30,90,365].includes(n))this.ui.x53Days=n;this.render();return;}
    return old.handleChange.call(this,event,...args);
  };
  document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches?.('.x53-region')){event.preventDefault();const {sport,area}=event.target.dataset;window.RANKFORGE_APP?.handleClick({target:event.target,preventDefault(){}});if(sports.includes(sport)&&labels[area])document.querySelector(`.x53-region[data-sport="${sport}"][data-area="${area}"]`)?.focus();}});
  window.EVORANK_SPORTS_X53=Object.freeze({profile,tier,figure,renderProfile,analysis,analysisReport,gallery,friends,publicRanks});
})();
