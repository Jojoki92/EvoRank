import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {appEnv} from './helpers/x2-app-env.mjs';
const {api:a,w,dom}=appEnv();after(()=>dom.window.close());

test('switching appearance preserves every chosen accent and training data',()=>{
  const app=new a.LiftoffApp();app.accountKey='x46-theme';
  app.state=a.normalizeState(a.initialState(app.accountKey),app.accountKey);
  app.state.workouts=[{id:'keep-workout',xp:72}];
  app.state.draft={id:'keep-draft',exercises:[]};
  const before=JSON.stringify({workouts:app.state.workouts,draft:app.state.draft});
  const palette=()=>['--accent','--accent-2','--accent-soft','--accent-faint','--accent-on'].map(key=>w.document.documentElement.style.getPropertyValue(key));
  for(const accent of ['#2f7dff','#00b5ec','#ff5e40','#ff375f','#8657ff','#19b981','#e7ae28','#e953b6','#459572']){
    app.state.settings.accentColor=accent;app.state.settings.appearance='dark';app.applyDesignSettings();
    const dark=palette();app.state.settings.appearance='light';app.applyDesignSettings();
    assert.deepEqual(palette(),dark);assert.equal(app.state.settings.accentColor,accent);
    assert.equal(w.document.documentElement.dataset.theme,'light');
  }
  assert.equal(JSON.stringify({workouts:app.state.workouts,draft:app.state.draft}),before);
});
