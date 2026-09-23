/* Group the picker, never the stored exercises or their ranking references. */
(() => {
  'use strict';
  const proto=LiftoffApp.prototype;
  const oldPicker=proto.renderExercisePickerModal;
  const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('de').replace(/[–—()°]/g,' ').replace(/\s+/g,' ').trim();
  function familyOf(exercise) {
    // Custom exercises may have deliberately distinct equipment or calibration.
    if(exercise.isCustom)return {key:'custom:'+exercise.id,title:exercise.name};
    let title=String(exercise.name||'').split(/\s+[–—·]\s+/)[0].replace(/\s*\([^)]*\)\s*/g,' ').replace(/\s+/g,' ').trim();
    if(/bankdrücken|bench press/i.test(title))title='Bankdrücken';
    else if(/^schulterdrücken|^schulterpresse/i.test(title))title='Schulterdrücken';
    else if(/^seitheben/i.test(title))title='Seitheben';
    else if(/^frontheben/i.test(title))title='Frontheben';
    else if(/^preacher curl|^scott.?curl/i.test(title))title='Preacher Curl';
    else if(/^hammer.?curl/i.test(title))title='Hammer Curl';
    else if(/^bizeps.?curl/i.test(title))title='Bizeps Curl';
    else if(/^latziehen/i.test(title))title='Latziehen';
    else if(/^(?:liegendes|sitzendes) beinbeugen|^beinbeuger$|^leg curl$/i.test(title))title='Beinbeuger';
    else if(/^wadenheben/i.test(title))title='Wadenheben';
    else if(/^beinpresse/i.test(title))title='Beinpresse';
    else if(/^beinheben/i.test(title))title='Beinheben';
    else if(/^trizeps dips$|^dips$/i.test(title))title='Dips';
    return {key:(exercise.rankable===false?'mobility:':'strength:')+normalize(title),title};
  }
  function groupExercises(exercises) {
    const groups=new Map();
    for(const exercise of exercises) {
      const family=familyOf(exercise);
      if(!groups.has(family.key))groups.set(family.key,{...family,exercises:[]});
      groups.get(family.key).exercises.push(exercise);
    }
    return [...groups.values()];
  }
  function matches(app,modal={}) {
    const {state,ui}=app,context=modal.context||'workout',tab=ui.exercisePickerTab||'all';
    const routine=context==='routine'?state.routines.find(r=>r.id===modal.routineId):null;
    const existing=new Set((context==='routine'?routine?.exercises||[]:(state.draft?.exercises||[]).filter(e=>e.id!==modal.replaceExerciseId)).map(e=>e.exerciseId));
    const favorites=new Set(state.exercisePreferences?.favorites||[]),unavailable=new Set(state.exercisePreferences?.unavailable||[]),recent=new Map((state.exercisePreferences?.recent||[]).map((id,i)=>[id,i])),custom=new Set((state.customExercises||[]).map(e=>e.id));
    const tokens=normalize(ui.exerciseSearch).split(' ').filter(Boolean),equipment=ui.exerciseEquipment||'Alle',muscle=ui.exerciseMuscle||'Alle';
    return allExercises(state).filter(e=>!existing.has(e.id))
      .filter(e=>tab==='favorites'?favorites.has(e.id):tab==='recent'?recent.has(e.id):tab==='custom'?custom.has(e.id):tab==='unavailable'?unavailable.has(e.id):!unavailable.has(e.id))
      .filter(e=>muscle==='Alle'||e.muscle===muscle).filter(e=>equipment==='Alle'||e.equipment===equipment)
      .filter(e=>{const haystack=normalize([e.searchText,e.name,e.muscle,e.equipment,...(e.aliases||[]),familyOf(e).title].join(' '));return tokens.every(token=>haystack.includes(token));})
      .sort((a,b)=>Number(favorites.has(b.id))-Number(favorites.has(a.id))||(recent.get(a.id)??9999)-(recent.get(b.id)??9999)||a.name.localeCompare(b.name,'de'));
  }
  function row(app,e,modal) {
    const photo=app.state.exercisePhotos?.[e.id],color=e.color||app.state.settings.accentColor;
    const image=photo?`<img src="${escapeAttr(photo)}" alt="">`:exercisePictogram(e,25);
    const unavailable=app.state.exercisePreferences?.unavailable?.includes(e.id);
    return `<article class="v7-picker-row rf77-picker-row ${unavailable?'is-unavailable':''}"><button class="v7-picker-row__main" data-action="v77-exercise-open" data-exercise-id="${escapeAttr(e.id)}" data-context="${escapeAttr(modal.context||'workout')}" data-routine-id="${escapeAttr(modal.routineId||'')}" data-replace-exercise-id="${escapeAttr(modal.replaceExerciseId||'')}"><span class="rf77-exercise-preview" style="--exercise:${escapeAttr(color)}">${image}</span><span class="v7-picker-row__copy"><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.muscle)} · ${escapeHtml(e.equipment)}${e.isCustom?' · EIGEN':''}</small><em>Ausführung & Beschreibung ansehen</em></span>${icon('chevronRight',18)}</button></article>`;
  }
  function groupHtml(app,group,modal) {
    if(group.exercises.length===1)return row(app,group.exercises[0],modal);
    const open=app.ui.x43OpenFamilies?.has(group.key),devices=[...new Set(group.exercises.map(e=>e.equipment))];
    return `<details class="rfx43-family" data-family-key="${escapeAttr(group.key)}" ${open?'open':''}><summary><span class="rfx43-family-glyph" aria-hidden="true">${exercisePictogram(group.exercises[0],25)}</span><span><strong>${escapeHtml(group.title)}</strong><small>${group.exercises.length} Varianten · ${escapeHtml(devices.slice(0,3).join(', '))}${devices.length>3?' …':''}</small></span>${icon('chevronRight',18)}</summary><div class="rfx43-family-variants">${open?group.exercises.map(e=>row(app,e,modal)).join(''):''}</div></details>`;
  }
  proto.renderExercisePickerModal=function(modal={}) {
    // Keep the existing search, tabs, equipment filters, photo and custom flows.
    const template=document.createElement('template');template.innerHTML=oldPicker.call(this,modal);
    const list=template.content.querySelector('.rf77-picker-list');if(!list)return template.innerHTML;
    const exercises=matches(this,modal),groups=groupExercises(exercises),limit=Math.max(60,Number(this.ui.exerciseLimit)||60),visible=groups.slice(0,limit);
    const create=list.querySelector('[data-action="custom-exercise"]')?.outerHTML||'';
    this._x43Picker={modal:{...modal},groups:new Map(groups.map(g=>[g.key,g]))};
    list.innerHTML=(groups.length?visible.map(g=>groupHtml(this,g,modal)).join(''):emptyState('search','Keine Übung gefunden','Passe Filter oder Suche an oder erstelle eine eigene Übung.'))
      +(groups.length>visible.length?`<button class="button button--secondary button--wide" data-action="v7-picker-more">Weitere ${Math.min(60,groups.length-visible.length)} Übungen laden</button>`:'')+create;
    const count=template.content.querySelector('.rf81-library-count');if(count)count.textContent=`${groups.length.toLocaleString('de')} Übungen · ${exercises.length.toLocaleString('de')} passende Ausführungen`;
    const search=template.content.querySelector('[data-action="exercise-search"]');if(search)search.placeholder='Übung, Variante oder Gerät suchen';
    return template.innerHTML;
  };
  // Load variants only when opened. Pagination applies to whole families,
  // so an angle cannot disappear behind the old per-variant page boundary.
  document.addEventListener('toggle',event=>{
    const details=event.target;if(!details.matches?.('.rfx43-family'))return;
    const app=window.RANKFORGE_APP,picker=app?._x43Picker,group=picker?.groups.get(details.dataset.familyKey);if(!group)return;
    app.ui.x43OpenFamilies||=new Set();
    if(details.open){app.ui.x43OpenFamilies.add(group.key);details.querySelector('.rfx43-family-variants').innerHTML=group.exercises.map(e=>row(app,e,picker.modal)).join('');}
    else app.ui.x43OpenFamilies.delete(group.key);
  },true);
  window.EVORANK_FAMILIES_X43=Object.freeze({familyOf,groupExercises,matches});
})();
