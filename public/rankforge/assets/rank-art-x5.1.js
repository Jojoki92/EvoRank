/* X5.7: individual transparent exports based on the supplied rank art. No bodygraph changes. */
(() => {
  'use strict';
  const sports = {
  "strength": {
    "name": "Krafttraining",
    "ranks": [
      "Holz",
      "Bronze",
      "Silber",
      "Gold",
      "Platin",
      "Diamant",
      "Meister",
      "Titan",
      "Olympier"
    ]
  },
  "run": {
    "name": "Laufen",
    "color": "#64df74",
    "ranks": [
      "Einsteiger",
      "Schrittmacher",
      "Tempomacher",
      "Sprinter",
      "Dauerläufer",
      "Zielbezwinger",
      "Marathonläufer",
      "Rekordbrecher",
      "Lauflegende"
    ]
  },
  "bike": {
    "name": "Radfahren",
    "color": "#e4bc4e",
    "ranks": [
      "Freiläufer",
      "Taktgeber",
      "Kettenmeister",
      "Windschatten",
      "Ausreißer",
      "Sprinter",
      "Bergbezwinger",
      "Rundfahrtsmeister",
      "Radsportlegende"
    ]
  },
  "swim": {
    "name": "Schwimmen",
    "color": "#48b9ec",
    "ranks": [
      "Wellenstarter",
      "Gleiter",
      "Stromgleiter",
      "Krauler",
      "Dauerschwimmer",
      "Wettkämpfer",
      "Wassermeister",
      "Rekordbrecher",
      "Meereslegende"
    ]
  }
};
  function badge(sport, index, compact = false) {
    const data = sports[sport]; if (!data) return '';
    const i = Math.min(8, Math.max(0, Math.floor(Number(index) || 0)));
    const src = './assets/ranks-x5.7/' + sport + '-' + i + '.png';
    return `<svg class="x51-badge ${compact?'x51-badge--compact':''}" viewBox="0 0 1254 1254" role="img" aria-label="${data.ranks[i]}" focusable="false"><image href="${src}" width="1254" height="1254"/></svg>`;
  }
  RANKS.forEach((rank,index) => { rank.name = sports.strength.ranks[index]; });
  const originalTitle = rankTitle;
  rankTitle = function(rank) { const index = RANKS.findIndex(item => item.key === rank?.key); return index < 0 ? originalTitle(rank) : sports.strength.ranks[index] + (rank.division ? ' ' + rank.division : ''); };
  rankMark = function(rank,compact=false) { const index = RANKS.findIndex(item => item.key === rank?.key); return badge('strength',index,compact); };
  // Keep the nine score tiers and their IDs. All translated displays use the approved proper names.
  for (const sport of ['run','bike','swim']) window.RANKFORGE970.animals[sport].forEach((entry,index) => {
    // Shared rank data stays writable for legacy startup migrations.
    // Renderers request individual transparent artwork through RANKFORGE970.rankBadge.
    for (let language=1;language<entry.length;language++) entry[language]=sports[sport].ranks[index];
  });
  window.EVORANK_ART_X51 = Object.freeze({ sports, badge });
})();
