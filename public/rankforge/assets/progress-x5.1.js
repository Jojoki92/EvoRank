/* Recorded performance only: dates and completed-set equipment snapshots are authoritative. */
(() => {
  'use strict';
  const load = window.EVORANK_X2_RANKS;
  const number = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const timestamp = value => { const t = new Date(value).getTime(); return Number.isFinite(t) ? t : null; };
  function series(state, exerciseId = 'total', metric = 'load', days = 90, now = Date.now()) {
    const points = [];
    const cutoff = days ? now - days * 86400000 : -Infinity;
    for (const workout of state.workouts || []) {
      const time = timestamp(workout.endedAt || workout.date);
      if (time == null || time < cutoff || time > now) continue;
      const values = [];
      for (const raw of workout.exercises || []) {
        if (exerciseId !== 'total' && (raw.exerciseId || raw.id) !== exerciseId) continue;
        const exercise = load.canonical(raw);
        for (const set of raw.sets || []) {
          if (!set.done || set.type === 'warmup') continue;
          const equipment = load.preserve(set, { ...exercise });
          for (const side of set.unilateral ? [set.left, set.right] : [set]) {
            if (!side) continue;
            const weight = load.handleWeight(equipment, side.weightKg), reps = number(side.reps);
            let value = null;
            if (metric === 'duration') value = number(side.durationSeconds);
            else if (metric === 'distance') value = number(side.distanceMeters);
            else if (metric === 'reps') value = reps;
            else if (metric === 'volume') {
              if (exercise.bodyweightMode !== 'assisted' && reps > 0) value = weight * reps;
            } else if (metric === 'e1rm') {
              // A bodyweight exercise cannot be reconstructed using today's weight.
              const needsBody = ['added','bodyweight','bodyweight-fraction','assisted'].includes(exercise.bodyweightMode);
              if (reps > 0 && reps <= 12 && (!needsBody || number(workout.bodyweightKg) > 0)) {
                const resistance = load.loadFor(equipment, side.weightKg, workout.bodyweightKg, side.assistanceKg ?? set.assistanceKg);
                value = resistance * (reps === 1 ? 1 : 1 + reps / 30);
              }
            } else if (reps > 0) value = weight;
            if (value != null && Number.isFinite(value)) values.push(value);
          }
        }
      }
      if (!values.length) continue;
      points.push({ time, value: metric === 'volume' ? values.reduce((sum,v) => sum + v,0) : Math.max(...values), workoutId: workout.id, name: workout.name || 'Training' });
    }
    return points.sort((a,b) => a.time - b.time);
  }
  function sportSummary(items, now = Date.now()) {
    const valid = items.filter(item => timestamp(item.date) != null && timestamp(item.date) <= now && number(item.distanceMeters) > 0 && number(item.durationSeconds) > 0);
    function period(start,end) {
      const list = valid.filter(item => timestamp(item.date) >= start && timestamp(item.date) < end);
      const times = new Set(list.map(item => { const d = new Date(item.date); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }));
      return { count: list.length, days: times.size, longest: list.length ? Math.max(...list.map(item => number(item.distanceMeters))) : null,
        // Pooled speed, not a mean of paces that overweights short activities.
        speed: list.length ? list.reduce((n,i) => n + number(i.distanceMeters),0) / list.reduce((n,i) => n + number(i.durationSeconds),0) : null };
    }
    return { current: period(now - 28*86400000, now+1), previous: period(now-56*86400000, now-28*86400000), valid };
  }
  window.EVORANK_PROGRESS_X51 = Object.freeze({ series, sportSummary, timestamp });
})();
