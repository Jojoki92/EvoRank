import test from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';

test('complete initialization renders Home and survives reopening with saved local state', async () => {
  const {dom, w, api} = appEnv();
  let next;
  try {
    const first = new api.LiftoffApp();
    first.accountKey = 'startup-test';
    await first.init();
    assert.ok(w.document.querySelector('#app form[data-form="rf920-onboarding"]'));
    first.state.profile.name = 'Startup regression';
    first.state.onboardingComplete = true;
    first.state.workouts = [api.normalizeWorkout({
      id: 'saved-workout', name: 'Dips', endedAt: '2026-09-01T10:00:00Z',
      bodyweightKg: 70, xp: 123, eggs: 7,
      exercises: [{exerciseId:'dips', name:'Dips', sets:[{done:true, weightKg:40, reps:8}]}]
    })];
    first.state.profile.eggs = 17;
    const settings = w.EVORANK_X51.settings(first);
    settings.sports = ['strength', 'swim', 'run', 'bike'];
    w.EVORANK_X51.saveSettings(first, settings);
    await first.persist(false);
    const history = JSON.stringify(first.state.workouts);
    // Reload the scripts in a fresh document and restore only local persisted data.
    // Network and device APIs stay stubbed; init, render and persistence are real.
    next = appEnv();
    for(let i=0;i<w.localStorage.length;i++){
      const key=w.localStorage.key(i);
      next.w.localStorage.setItem(key,w.localStorage.getItem(key));
    }
    const reopened = new next.api.LiftoffApp();
    reopened.accountKey = 'startup-test';
    await reopened.init();
    assert.equal(reopened.state.profile.name, 'Startup regression');
    assert.equal(JSON.stringify(reopened.state.workouts), history);
    assert.equal(reopened.state.profile.eggs, 17);
    assert.ok(next.w.document.querySelector('#app .screen'));
    assert.ok(next.w.document.querySelector('#app .x51-badge'));
    for(const sport of ['swim', 'run', 'bike']){
      reopened.state.rankDisplayV108 = {homeOrder:[sport], rankOrder:[sport]};
      reopened.state.homeRanksV103 = {selected:[sport], order:[sport]};
      reopened.ui.rf103RankSport = sport;
      reopened.ui.x53RankSport = sport;
      const template=next.w.document.createElement('template');
      reopened.ui.rankTab='rank';
      template.innerHTML=reopened.renderRanks();
      assert.equal(template.content.querySelectorAll('.x51-badge').length,1,sport+' current rank');
      reopened.ui.rankTab='gallery';
      template.innerHTML=reopened.renderRanks();
      const badges=[...template.content.querySelectorAll('.x51-badge')];
      assert.equal(badges.length,9,sport+' all nine ranks in gallery');
      const ids=[...template.content.querySelectorAll('[id]')].map(el=>el.id);
      assert.equal(new Set(ids).size,ids.length,sport+' unique SVG IDs');
      assert.doesNotMatch(template.innerHTML,/EVORANK_SEAHORSE_V108/);
    }
  } finally {
    next?.dom.window.close();
    dom.window.close();
  }
});
