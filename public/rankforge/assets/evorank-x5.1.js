/* X5.1: configurable sports home and recorded progress, sharing the existing app. */
(() => {
  'use strict';
  const proto = LiftoffApp.prototype, model = window.EVORANK_PROGRESS_X51, art = window.EVORANK_ART_X51;
  const old = Object.fromEntries(['renderHome','renderBottomNav','renderModal','renderProfile','renderProfileEditModal','renderV7ExerciseInfo','renderExerciseRankModal','renderRanks','handleClick','handleChange','handleSubmit'].map(key => [key,proto[key]]));
  const esc = value => escapeHtml(String(value ?? ''));
  const num = (value,digits=1) => new Intl.NumberFormat('de-AT',{maximumFractionDigits:digits}).format(value);
  const sports = ['strength','run','bike','swim'];
  const modules = { ranks:'Rangübersicht', figure:'Körper / Sportgrafik', progress:'Fortschrittsgrafiken', calendar:'Trainingskalender', week:'Persönliche Trainingswoche', recent:'Letzte Trainings', challenge:'Wochen-Challenge', summary:'Trainingszahlen', friends:'Freundesliga', tips:'Tipps & Neuigkeiten' };
  const defaults = {ranks:true,figure:true,progress:true,calendar:false,week:false,recent:true,challenge:false,summary:false,friends:false,tips:false};
  const optionalModules = Object.keys(modules).filter(key=>!['ranks','figure'].includes(key));
  const moduleOrder = value => [...new Set([...(Array.isArray(value)?value:[]),...optionalModules])].filter(key=>optionalModules.includes(key));
  const metrics = {load:['Gewicht am Griff','kg'],e1rm:['Geschätztes 1RM','kg'],volume:['Bewegtes Zusatzgewicht','kg · Wdh.'],reps:['Wiederholungen','Wdh.'],duration:['Dauer','s'],distance:['Distanz','m']};
  function settings(app) {
    const saved = app.state.settings?.homeX51 || {};
    const selected = [...new Set((saved.sports || app.state.homeRanksV103?.order || ['strength']).filter(sport => sports.includes(sport)))];
    if (!selected.length) selected.push('strength');
    return {sports:selected,active:selected.includes(saved.active)?saved.active:selected[0],modules:{...defaults,...saved.modules,ranks:true,figure:true},moduleOrder:moduleOrder(saved.moduleOrder),pins:[...new Set((saved.pins || (selected.includes('strength')?['total']:[])).filter(id => typeof id === 'string'))].slice(0,6)};
  }
  function saveSettings(app,next) {
    next.modules={...next.modules,ranks:true,figure:true};next.moduleOrder=moduleOrder(next.moduleOrder);
    app.state.settings ||= {}; app.state.settings.homeX51 = next;
    app.state.homeRanksV103 = {order:[...next.sports],selected:[...next.sports]};
    app.state.rankDisplayV108 = {homeOrder:[next.active],rankOrder:[...next.sports]};
    app.state.homeModulesV10 = {...app.state.homeModulesV10,selected:[...next.sports],primary:next.active};
    app.scheduleSave();
  }
  const template = html => { const t = document.createElement('template'); t.innerHTML = html; return t; };
  const button = (action,label,attrs='') => `<button type="button" class="button button--secondary" data-action="${action}" ${attrs}>${label}</button>`;
  function chart(points,label,unit,{integerAxis=false}={}) {
    if (!points.length) return `<p class="x51-empty">Noch keine passenden Aufzeichnungen in diesem Zeitraum.</p>`;
    const left=62, right=536, top=18, bottom=186, first=points[0].time, last=points.at(-1).time;
    const rawMaximum = Math.max(1,...points.map(p=>p.value))*1.12;
    const maximum = integerAxis?Math.ceil(rawMaximum):rawMaximum;
    const ticks=integerAxis?[...new Set([0,Math.ceil(maximum/2),maximum])].map(v=>v/maximum):[0,.5,1];
    const x = p => first===last ? (left+right)/2 : left+(p.time-first)/(last-first)*(right-left);
    const y = p => bottom-p.value/maximum*(bottom-top);
    const date = t => new Date(t).toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit',year:'2-digit'});
    return `<svg class="x51-chart" viewBox="0 0 560 226" role="img" aria-label="${esc(label)}; Zeitachse von ${date(first)} bis ${date(last)}; ${esc(unit)}"><title>${esc(label)} · einzelne Aufzeichnungen nach Datum</title>${ticks.map(n=>`<path class="x51-grid" d="M${left} ${bottom-n*(bottom-top)}H${right}"/><text x="54" y="${bottom-n*(bottom-top)+4}" text-anchor="end">${num(n*maximum)}</text>`).join('')}<text x="${left}" y="12">${esc(unit)}</text>${points.length>1?`<path class="x51-line" d="${points.map((p,i)=>`${i?'L':'M'}${x(p).toFixed(2)} ${y(p).toFixed(2)}`).join(' ')}"/>`:''}${points.map(p=>`<circle class="x51-point" cx="${x(p)}" cy="${y(p)}" r="3.5"><title>${date(p.time)} · ${num(p.value)} ${esc(unit)} · ${esc(p.name)}</title></circle>`).join('')}<text x="${left}" y="211">${date(first)}</text>${first!==last?`<text x="${right}" y="211" text-anchor="end">${date(last)}</text>`:''}</svg>`;
  }
  function chartMetric(app,id) {
    const tracking = lookupExercise(app.state,id)?.tracking;
    const allowed = id==='total'?['volume']:tracking==='time'?['duration']:tracking==='distance'?['distance','duration']:['load','e1rm','volume','reps'];
    const chosen = app.ui.x51Metric?.[id] || app.state.settings.progressX51?.metrics?.[id];
    return {allowed,chosen:allowed.includes(chosen)?chosen:allowed[0]};
  }
  function progressCard(app,id='total',full=false) {
    const label = id==='total'?'Trainingsvolumen':lookupExercise(app.state,id)?.name || 'Übung';
    const {allowed,chosen} = chartMetric(app,id), days=app.ui.x51Days ?? app.state.settings.progressX51?.days ?? 90;
    const points = model.series(app.state,id,chosen,days), [metric,unit] = metrics[chosen];
    const pinned = settings(app).pins.includes(id);
    return `<article class="x51-card x51-progress"><header><div><small>${esc(metric)}</small><h3>${esc(label)}</h3></div>${button('x51-pin',icon(pinned?'check':'plus',18),`data-id="${esc(id)}" aria-label="${pinned?'Von Startseite entfernen':'Auf Startseite merken'}" aria-pressed="${pinned}"`)}</header><div class="x51-chart-controls"><label>Messwert<select data-x51-metric="${esc(id)}">${allowed.map(key=>`<option value="${key}" ${key===chosen?'selected':''}>${metrics[key][0]}</option>`).join('')}</select></label><label>Zeitraum<select data-x51-days>${[[30,'30 Tage'],[90,'90 Tage'],[365,'1 Jahr'],[0,'Gesamt']].map(([value,text])=>`<option value="${value}" ${value===days?'selected':''}>${text}</option>`).join('')}</select></label></div>${points.length?`<div class="x51-chart-value"><strong>${num(points.at(-1).value)} <small>${unit}</small></strong><span>zuletzt · ${points.length} Aufzeichnungen</span></div>`:''}${chart(points,label,unit)}${full?`<details class="x51-explanation"><summary>Messwerte & Berechnung</summary><p>${chosen==='volume'?'Summe aus effektivem Zusatzgewicht × Wiederholungen aller abgeschlossenen Arbeitssätze. Aufwärmsätze, Körpergewicht und unterstützte Sätze zählen hier nicht als Zusatzvolumen.':chosen==='e1rm'?'Epley-Schätzung aus 1–12 Wiederholungen, einschließlich des damals gespeicherten Körpergewichts, falls nötig. Fehlendes historisches Körpergewicht wird nicht ersetzt.':chosen==='load'?'Höchstes Gewicht am Griff je Training. Bei Dips ist dies das Zusatzgewicht; bei unterstützten Übungen die Unterstützung, bei der weniger stärker ist.':'Bester abgeschlossener Arbeitssatz je Training.'} Gespeicherte Kabel- und Maschinenwerte bleiben maßgeblich. Unbestätigte Gerätewerte sind Schätzungen. Verbindungslinien dienen der Orientierung; dazwischen gibt es keine Messung.</p>${points.length?`<div class="x51-table-wrap"><table><caption>${esc(label)} · ${esc(metric)}</caption><thead><tr><th>Datum</th><th>Messwert</th><th>Training</th></tr></thead><tbody>${points.slice().reverse().map(p=>`<tr><td>${new Date(p.time).toLocaleDateString('de-AT')}</td><td>${num(p.value)} ${unit}</td><td><button class="x51-text-button" data-action="workout-detail" data-workout-id="${esc(p.workoutId)}">${esc(p.name)}</button></td></tr>`).join('')}</tbody></table></div>`:''}</details>`:button('v7-exercise-history','Verlauf öffnen',`data-exercise-id="${esc(id)}"`)}</article>`;
  }
  function profileContext(app) {
    const profile=app.state.profile, age=window.EVORANK_AGE_X47.ageAt(profile);
    return `<details class="x51-explanation"><summary>Deine Vergleichsdaten</summary><p>${age!=null?Math.floor(age)+' Jahre':'Alter nicht eingetragen'} · ${num(profile.bodyweightKg||0)} kg · ${profile.heightCm?num(profile.heightCm)+' cm':'Größe nicht eingetragen'}</p><p>Alter und Körperprofil beeinflussen die sportabhängige Rangschätzung. Kraftleistungen werden mit Körpergewicht und Geräteübersetzung bewertet; beim Radfahren zählt bei geeigneten Leistungsmessungen Watt/kg. Lauf- und Schwimmzeiten bekommen keinen pauschalen Gewichtsbonus. Körpergröße ist eine Zusatzinformation, kein Punktefaktor: Für alle Sportarten und Übungen fehlt eine gemeinsame, belastbare Größenkorrektur.</p>${button('open-profile-edit','Körperdaten ändern')}</details>`;
  }
  function sportFigure(app,sport) {
    if(window.EVORANK_SPORTS_X53)return window.EVORANK_SPORTS_X53.renderProfile(app,sport);
    const m=window.RANKFORGE970.sportMetrics(sport,app), report=model.sportSummary(m.list);
    const chosen=['tempo','distance','consistency'].includes(app.ui.x51Area)?app.ui.x51Area:'tempo';
    const labels={tempo:'Tempo',distance:'Langstrecke',consistency:'Konstanz'};
    const value = (period,key) => key==='distance'?(period.longest==null?'—':num(period.longest/1000,2)+' km'):key==='consistency'?period.days+' aktive Tage':period.speed==null?'—':sport==='bike'?num(period.speed*3.6)+' km/h':formatDuration(Math.round((sport==='swim'?100:1000)/period.speed))+(sport==='swim'?' /100 m':' /km');
    const hit = (key,shape) => `<a href="#" data-action="x51-area" data-area="${key}" aria-label="${labels[key]} anzeigen" class="${key===chosen?'is-selected':''}">${shape}</a>`;
    let drawing;
    if(sport==='run') drawing=`<rect x="55" y="28" width="250" height="264" rx="125" class="x51-track"/>${[0,1,2].map(i=>`<rect x="${67+i*14}" y="${40+i*14}" width="${226-i*28}" height="${240-i*28}" rx="${113-i*14}" class="x51-lane"/>`).join('')}${hit('tempo','<path d="M70 118A114 114 0 0 1 290 118"/>')}${hit('distance','<path d="M70 202A114 114 0 0 0 290 202"/>')}${hit('consistency','<path d="M292 125V195"/>')}`;
    else if(sport==='bike') drawing=`<circle cx="180" cy="160" r="123" class="x51-track"/>${Array.from({length:18},(_,i)=>{const t=i*Math.PI/9;return `<path d="M180 160L${180+112*Math.cos(t)} ${160+112*Math.sin(t)}" class="x51-lane"/>`;}).join('')}<circle cx="180" cy="160" r="14" class="x51-hub"/>${hit('tempo','<path d="M78 103A118 118 0 0 1 282 103"/>')}${hit('distance','<path d="M282 217A118 118 0 0 1 78 217"/>')}${hit('consistency','<path d="M295 125A118 118 0 0 1 295 195"/>')}`;
    else drawing=`<rect x="57" y="34" width="246" height="252" rx="18" class="x51-track"/>${['tempo','distance','consistency'].map((key,i)=>hit(key,`<rect x="${69+i*78}" y="48" width="66" height="224" rx="8"/><path class="x51-pool-line" d="M${102+i*78} 70V250m-17 0h34"/>`)).join('')}`;
    return `<section class="x51-card x51-sport-profile" style="--sport:${art.sports[sport].color}"><header><div><small>DEIN SPORTPROFIL</small><h2>${art.sports[sport].name}</h2></div>${art.badge(sport,m.index,true)}</header><svg class="x51-sport-figure x51-sport-figure--${sport}" viewBox="0 0 360 320" aria-label="${art.sports[sport].name}: Tempo, Langstrecke und Konstanz">${drawing}</svg><div class="x51-segments" aria-label="Bereich wählen">${Object.entries(labels).map(([key,label])=>button('x51-area',label,`data-area="${key}" aria-pressed="${key===chosen}"`)).join('')}</div><div class="x51-sport-value"><small>${labels[chosen]} · letzte 28 Tage</small><strong>${value(report.current,chosen)}</strong><span>${chosen==='distance'?'Längste aufgezeichnete Einheit':chosen==='consistency'?'Kalendertage mit mindestens einer Einheit':'Durchschnitt aus Gesamtstrecke und Gesamtzeit'}</span><p>Vorherige 28 Tage: ${value(report.previous,chosen)}</p></div>${button('x51-start-sport','Einheit aufnehmen',`data-sport="${sport}"`)} ${button('rf970-add','Manuell eintragen',`data-sport="${sport}"`)}<details class="x51-explanation"><summary>Einordnung & Rang</summary><p>${art.sports[sport].ranks[m.index]} · ${m.score} Rangpunkte. Die Grafik zeigt gemessene Leistungen, keine Technik- oder Kraftbewertung. Gesamtzeiten können Pausen enthalten. Strecken, Höhenmeter und Beckenlängen beeinflussen die Vergleichbarkeit.</p>${profileContext(app)}</details></section>`;
  }
  function homeConfig(app) {
    const s=settings(app);
    return `${app.modalHeader('DEINE APP','Startseite gestalten')}<form class="modal-form" data-form="x51-home"><div class="modal-scroll"><fieldset class="x51-options"><legend>Deine Sportarten</legend>${sports.map(sport=>`<label><input type="checkbox" name="sport" value="${sport}" ${s.sports.includes(sport)?'checked':''}><span>${art.sports[sport].name}</span></label>`).join('')}</fieldset><p class="x51-help">Rangübersicht und Körper / Sportgrafik bleiben immer sichtbar.</p><fieldset class="x51-options x54-module-options"><legend>Zusätzliche Bereiche anpassen</legend><p class="x51-help">Mit den Pfeilen ordnen. Die eingeblendeten Bereiche folgen unter deiner Grafik und dem Trainingsstart.</p><div class="x54-module-order">${s.moduleOrder.map((key,i)=>`<div class="x54-module-row" data-module="${key}"><label><input type="checkbox" name="module" value="${key}" ${s.modules[key]?'checked':''}><span>${modules[key]}</span></label><div class="x54-order-buttons">${button('x51-module-up',icon('chevronUp',16),`aria-label="${modules[key]} nach oben" ${i===0?'disabled':''}`)}${button('x51-module-down',icon('chevronDown',16),`aria-label="${modules[key]} nach unten" ${i===s.moduleOrder.length-1?'disabled':''}`)}</div></div>`).join('')}</div></fieldset><p class="x51-help">Ausgeblendete Bereiche bleiben über Profil und Ränge erreichbar. Änderungen gelten erst nach Übernehmen.</p><p class="sr-only" role="status" data-x54-order-status></p></div><div class="modal-footer"><button class="button button--primary button--wide" type="submit">Übernehmen</button></div></form>`;
  }
  proto.renderBottomNav=function(...args){
    const t=template(old.renderBottomNav.apply(this,args)),s=settings(this),create=t.content.querySelector('.nav-create');
    if(create){create.dataset.action='x55-training';delete create.dataset.sport;create.setAttribute('aria-label','Training starten: Gym, Laufen, Radfahren oder Schwimmen');}
    return t.innerHTML;
  };
  function exerciseList(app,query='') {
    const all=[...EXERCISES,...(app.state.customExercises||[])], unique=[...new Map(all.map(e=>[e.id,e])).values()];
    const found=unique.filter(e=>`${e.name} ${e.muscle}`.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de')));
    return `<p class="x51-help">${found.length} Übungen${found.length>60?' · Suche verfeinern':''}</p>${found.slice(0,60).map(e=>`<button class="x51-list-row" data-action="v7-exercise-history" data-exercise-id="${esc(e.id)}"><span>${esc(e.name)}<small>${esc(e.muscle)}</small></span>${icon('chevronRight',18)}</button>`).join('')}`;
  }
  proto.renderHome=function(...args) {
    if(this.ui.view && this.ui.view!=='home')return old.renderHome.apply(this,args);
    const s=settings(this); this.state.rankDisplayV108={homeOrder:[s.active],rankOrder:[...s.sports]};
    const t=template(old.renderHome.apply(this,args)), root=t.content.querySelector('.screen'); if(!root)return t.innerHTML;
    const targets={ranks:'.rf103-home-ranks',calendar:'.rf1000-home-calendar',week:'.rfx45-week',recent:'.feed-section',challenge:'.v7-challenge',summary:'.home-metrics',friends:'.rf87-home-friends',tips:'.rf77-focus-card,.rf80-release-card'};
    for(const [key,selector] of Object.entries(targets)) if(!s.modules[key]) root.querySelectorAll(selector).forEach(el=>el.remove());
    const body=root.querySelector('.home-bodygraph-section');
    if(!s.modules.figure)body?.remove(); else if(s.active!=='strength')body?.replaceWith(template(sportFigure(this,s.active)).content);
    if(s.active!=='strength')root.querySelectorAll('.next-workout-card:not(.x55-sport-start),.home-quick-workout,.v7-challenge,.home-metrics,.feed-section').forEach(el=>el.remove());
    const tools=`<section class="x51-home-tools"><div class="x51-segments" aria-label="Sport auf Startseite">${s.sports.map(sport=>button('x51-home-sport',(sport==='strength'?'Gym':art.sports[sport].name),`data-sport="${sport}" aria-pressed="${s.active===sport}"`)).join('')}</div>${!s.modules.ranks?button('x51-home-settings',icon('settings',18),'aria-label="Startseite gestalten"'):''}</section>`;
    const title=root.querySelector('.home-title'); if(title)title.insertAdjacentHTML('afterend',tools);else root.insertAdjacentHTML('afterbegin',tools);
    if(s.active!=='strength'&&!s.modules.figure)root.insertAdjacentHTML('beforeend',button('x51-start-sport',`${art.sports[s.active].name} aufnehmen`,`data-sport="${s.active}"`));
    if(s.active!=='strength'&&s.modules.recent){
      const latest=model.sportSummary(window.RANKFORGE970.sportMetrics(s.active,this).list).valid.slice().sort((a,b)=>model.timestamp(b.date)-model.timestamp(a.date)).slice(0,3);
      root.insertAdjacentHTML('beforeend',`<section class="x51-card x54-sport-recent"><header><h3>Letzte Einheiten</h3>${button('x51-start-sport','Alle',`data-sport="${s.active}"`)}</header>${latest.length?latest.map(item=>`<div class="x51-list-row"><span>${new Date(item.date).toLocaleDateString('de-AT')}<small>${art.sports[s.active].name}</small></span><strong>${num(item.distanceMeters/1000,2)} km · ${formatDuration(item.durationSeconds)}</strong></div>`).join(''):'<p class="x51-empty">Noch keine Einheit aufgezeichnet.</p>'}</section>`);
    }
    if(s.modules.progress){
      const pins=s.pins;
      let html=s.active==='strength'?pins.map(id=>progressCard(this,id)).join(''):'';
      if(s.active!=='strength'){
        const list=window.RANKFORGE970.sportMetrics(s.active,this).list;
        const points=model.sportSummary(list).valid.map(i=>({time:model.timestamp(i.date),value:i.distanceMeters/1000,name:art.sports[s.active].name})).sort((a,b)=>a.time-b.time).filter(p=>p.time>=Date.now()-90*86400000);
        html=`<article class="x51-card"><header><h3>Deine Strecken</h3><small>90 Tage · km je Einheit</small></header>${chart(points,'Strecke je Einheit','km')}</article>`+html;
      }
      const block=`<section class="x51-home-progress" aria-label="Dein Fortschritt">${html}</section>`;
      const figure=root.querySelector('.home-bodygraph-section,.x51-sport-profile'); if(figure)figure.insertAdjacentHTML('afterend',block);else root.insertAdjacentHTML('beforeend',block);
    }
    const fixedFigure=root.querySelector('.home-bodygraph-section,.x51-sport-profile');
    if(fixedFigure){
      const optional=document.createElement('div');optional.className='x54-home-sections';
      for(const key of s.moduleOrder){
        const selector=key==='progress'?'.x51-home-progress':key==='recent'?'.feed-section,.x54-sport-recent':targets[key];
        if(!selector)continue;
        for(const node of root.querySelectorAll(selector)){node.dataset.homeModule=key;optional.append(node);}
      }
      fixedFigure.insertAdjacentElement('afterend',optional);
      // Start training immediately after the figure, before optional information.
      if(s.active==='strength'){
        const start=document.createElement('div');start.className='x55-home-start';
        for(const node of root.querySelectorAll('.next-workout-card,.home-quick-workout'))start.append(node);
        const quick=start.querySelector('.home-quick-workout');
        if(quick){quick.dataset.action='x55-training';const text=quick.querySelector('p');if(text)text.textContent='Gym, Laufen, Radfahren oder Schwimmen auswählen.';}
        if(start.children.length)fixedFigure.insertAdjacentElement('afterend',start);
      }
    }
    return t.innerHTML;
  };
  proto.renderV7ExerciseHistory=function(id){return `${this.modalHeader('DEIN FORTSCHRITT',id==='total'?'Trainingsvolumen':lookupExercise(this.state,id)?.name||'Übung')}<div class="modal-scroll">${progressCard(this,id,true)}</div>`;};
  proto.renderV7ExerciseInfo=function(modal){const t=template(old.renderV7ExerciseInfo.call(this,modal));const root=t.content.querySelector('.modal-scroll');if(root&&!root.querySelector('[data-action="v7-exercise-history"]'))root.insertAdjacentHTML('afterbegin',button('v7-exercise-history','Fortschritt ansehen',`data-exercise-id="${esc(modal.exerciseId)}"`));return t.innerHTML;};
  proto.renderProfile=function(...args){return old.renderProfile.apply(this,args);};
  proto.renderProfileEditModal=function(...args){
    const t=template(old.renderProfileEditModal.apply(this,args)),form=t.content.querySelector('form[data-form="profile"]');if(!form)return t.innerHTML;
    const p=this.state.profile, age=window.EVORANK_AGE_X47.ageAt(p);
    const fields=`<fieldset class="x51-body-fields"><legend>Körperdaten</legend><div class="v7-field-grid"><label class="modal-field"><span>Körpergröße (cm, optional)</span><input name="x51Height" type="number" min="80" max="250" step="0.1" inputmode="decimal" value="${p.heightCm||''}"></label><label class="modal-field"><span>Körpergewicht (kg)</span><input name="x51Weight" type="number" min="30" max="250" step="0.1" inputmode="decimal" required value="${p.bodyweightKg||''}"></label></div><label class="modal-field"><span>Geburtsdatum (optional)</span><input name="x51Birth" type="date" max="${window.EVORANK_AGE_X47.dayKey(new Date())}" value="${esc(p.birthDate||'')}"><small>Das Vergleichsalter aktualisiert sich automatisch.</small></label><label class="modal-field"><span>Alter in Jahren (ohne Geburtsdatum)</span><input name="x51Age" type="number" min="13" max="120" step="1" inputmode="numeric" value="${age!=null?Math.floor(age):''}" ${p.birthDate?'disabled':''}><small>Mit Geburtsdatum gilt das berechnete Alter. Ohne Datum bleibt es eine Näherung.</small></label><p class="x51-help">Körpergröße wird angezeigt, aber nicht als unbelegter Rangbonus verrechnet. Gespeicherte Trainingsgewichte bleiben unverändert.</p></fieldset>`;
    form.querySelector('.modal-footer')?.insertAdjacentHTML('beforebegin',fields);
    form.classList.add('x56-profile-form');
    const body=form.querySelector('.x51-body-fields'),chooser=form.querySelector('.rf890-body-profile');
    const weight=body.querySelector('[name="x51Weight"]').closest('label');weight.parentElement.prepend(weight);
    if(chooser){chooser.querySelector('p')?.remove();chooser.querySelector('.rf890-body-profile__note')?.remove();body.querySelector('.v7-field-grid').after(chooser);}
    const details=document.createElement('details');details.className='x56-profile-details';details.innerHTML='<summary>Profilbild, Name & Training</summary><div class="x56-profile-details-body"></div>';
    const extra=details.lastElementChild;
    for(const child of [...form.children])if(child!==body&&!child.classList.contains('modal-footer'))extra.append(child);
    body.querySelector('[name="x51Age"]').closest('label').hidden=!!p.birthDate;
    const note=body.querySelector('.x51-help');if(note)note.textContent='Dein heutiger Vergleich passt sich an. Gespeicherte Trainingswerte bleiben erhalten.';
    form.prepend(body);body.after(details);return t.innerHTML;
  };
  proto.renderExerciseRankModal=function(...args){return old.renderExerciseRankModal.apply(this,args)+profileContext(this);};
  proto.renderRanks=function(...args){const t=template(old.renderRanks.apply(this,args));t.content.querySelector('.screen')?.insertAdjacentHTML('beforeend',profileContext(this));return t.innerHTML;};
  proto.renderModal=function(...args){
    const type=this.ui.modal?.type;
    if(type==='x51-home'||type==='x51-progress-library'){
      const body=type==='x51-home'?homeConfig(this):`${this.modalHeader('FORTSCHRITT','Alle Übungen')}<div class="modal-scroll">${button('v7-exercise-history','Gesamtes Trainingsvolumen', 'data-exercise-id="total"')}<label class="modal-field"><span>Übung suchen</span><input type="search" data-x51-search placeholder="Name oder Muskel" aria-controls="x51-exercise-list"></label><div id="x51-exercise-list">${exerciseList(this)}</div></div>`;
      return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true" aria-label="${type==='x51-home'?'Startseite gestalten':'Fortschrittsgrafiken'}">${body}</section></div>`;
    }
    return old.renderModal.apply(this,args);
  };
  proto.handleClick=function(event){
    const el=event.target.closest?.('[data-action]'), action=el?.dataset.action;
    if(['x51-module-up','x51-module-down'].includes(action)){
      event.preventDefault();const row=el.closest('.x54-module-row'),list=row?.parentElement;
      if(!row||!list)return;
      const sibling=action==='x51-module-up'?row.previousElementSibling:row.nextElementSibling;
      if(!sibling)return;
      if(action==='x51-module-up')list.insertBefore(row,sibling);else list.insertBefore(sibling,row);
      [...list.children].forEach((item,i)=>{item.querySelector('[data-action="x51-module-up"]').disabled=i===0;item.querySelector('[data-action="x51-module-down"]').disabled=i===list.children.length-1;});
      // Reorder only the form DOM: checked fields and Cancel remain untouched.
      (el.disabled?row.querySelector('button:not(:disabled)'):el)?.focus();
      const status=list.closest('form').querySelector('[data-x54-order-status]');
      if(status)status.textContent=`${modules[row.dataset.module]} auf Position ${[...list.children].indexOf(row)+1}`;
      return;
    }
    if(['rf1004-home-settings','rf103-rank-settings','rf108-rank-settings','x51-home-settings'].includes(action)){event.preventDefault();this.openModal('x51-home');return;}
    if(action==='x51-progress-library'){event.preventDefault();this.openModal('x51-progress-library');return;}
    if(action==='v7-exercise-history'&&el.dataset.exerciseId==='total'){event.preventDefault();this.openModal('v7-exercise-history',{exerciseId:'total'});return;}
    if(!action?.startsWith('x51-'))return old.handleClick.call(this,event);
    event.preventDefault();const s=settings(this);
    if(action==='x51-home-sport'&&s.sports.includes(el.dataset.sport)){s.active=el.dataset.sport;saveSettings(this,s);}
    if(action==='x51-area')this.ui.x51Area=el.dataset.area;
    if(action==='x51-start-sport'&&sports.slice(1).includes(el.dataset.sport)){this.ui.view='triathlon';this.ui.rf970Sport=el.dataset.sport;this.ui.modal=null;}
    if(action==='x51-pin'){
      const id=el.dataset.id;if(id!=='total'&&!lookupExercise(this.state,id))return;
      if(s.pins.includes(id))s.pins=s.pins.filter(key=>key!==id);else{if(s.pins.length>=6){this.showToast('Bis zu sechs Grafiken. Entferne zuerst eine andere.');return;}s.pins.push(id);s.modules.progress=true;}
      saveSettings(this,s);this.showToast(s.pins.includes(id)?'Grafik auf der Startseite gemerkt':'Grafik von der Startseite entfernt');
    }
    this.render();
  };
  proto.handleChange=function(event,...args){
    const el=event.target;
    if(el.matches?.('[data-x51-metric]')){this.ui.x51Metric||={};this.ui.x51Metric[el.dataset.x51Metric]=el.value;this.state.settings.progressX51||={};this.state.settings.progressX51.metrics={...this.state.settings.progressX51.metrics,[el.dataset.x51Metric]:el.value};this.scheduleSave();this.render();return;}
    if(el.matches?.('[data-x51-days]')){this.ui.x51Days=[0,30,90,365].includes(Number(el.value))?Number(el.value):90;this.state.settings.progressX51={...this.state.settings.progressX51,days:this.ui.x51Days};this.scheduleSave();this.render();return;}
    if(el.name==='x51Birth'){const field=el.form?.elements.x51Age;if(field){field.disabled=!!el.value;field.closest('label').hidden=!!el.value;const age=window.EVORANK_AGE_X47.ageAt({birthDate:el.value});if(age!=null)field.value=Math.floor(age);}return;}
    return old.handleChange.call(this,event,...args);
  };
  proto.handleSubmit=async function(event,...args){
    const form=event.target.closest?.('form[data-form]');
    if(form?.dataset.form==='x51-home'){
      event.preventDefault();const data=new FormData(form), selected=sports.filter(s=>data.getAll('sport').includes(s));
      if(!selected.length){this.showToast('Wähle mindestens eine Sportart.');return;}
      const s=settings(this);s.sports=selected;if(!selected.includes(s.active))s.active=selected[0];
      s.modules=Object.fromEntries(Object.keys(modules).map(key=>[key,['ranks','figure'].includes(key)||data.getAll('module').includes(key)]));s.moduleOrder=moduleOrder([...form.querySelectorAll('.x54-module-row')].map(row=>row.dataset.module));saveSettings(this,s);this.closeModal();return;
    }
    if(form?.dataset.form==='profile'&&form.elements.x51Weight){
      event.preventDefault();if(!form.checkValidity()){form.reportValidity();return;}
      const data=new FormData(form), height=String(data.get('x51Height')||'').trim(), weight=Number(data.get('x51Weight')), birth=String(data.get('x51Birth')||'');
      const enteredAge=String(data.get('x51Age')||'').trim(), age=birth?window.EVORANK_AGE_X47.ageAt({birthDate:birth}):enteredAge?Number(enteredAge):null;
      if(weight<30||weight>250||!Number.isFinite(weight)||(height&&(!Number.isFinite(Number(height))||Number(height)<80||Number(height)>250))||(birth&&age==null)||(age!=null&&(!Number.isFinite(age)||age<13||age>120))){this.showToast('Bitte gültige Körperdaten eintragen (Alter 13–120).');return;}
      Object.assign(this.state.profile,{heightCm:height?Number(height):null,bodyweightKg:weight,birthDate:birth,age:age==null?null:Math.floor(age),ageReferenceDate:birth||age==null?'':window.EVORANK_AGE_X47.dayKey(new Date()),ageReferenceValue:birth||age==null?null:Math.floor(age)});
      this.metrics=getMetrics(this.state);
    }
    return old.handleSubmit.call(this,event,...args);
  };
  document.addEventListener('input',event=>{
    const el=event.target, app=window.RANKFORGE_APP;
    if(el.matches?.('[data-x51-search]')&&app){const target=document.getElementById('x51-exercise-list');if(target)target.innerHTML=exerciseList(app,el.value);}
  });
  window.EVORANK_X51=Object.freeze({settings,saveSettings,chart,progressCard,sportFigure,profileContext,exerciseList});
})();
