import fs from 'node:fs';
import path from 'node:path';
const source = path.resolve('.sites-runtime/design-x5.1/EvoRank-Codex-Gesamtpaket/EvoRank-Designpaket');
const target = path.resolve('public/rankforge/assets/ranks-x5.1');
fs.mkdirSync(target,{recursive:true});
const hasHandoff = fs.existsSync(path.join(source,'design.json'));
const design = JSON.parse(fs.readFileSync(path.join(hasHandoff?source:target,'design.json'),'utf8'));
fs.writeFileSync(path.join(target,'design.json'),JSON.stringify(design,null,2)+'\n');
// Original sheets remain intact. SVG viewports select each supplied motif.
// An SVG luminance mask removes the near-black sheet background in both themes.
for (const [sport, data] of Object.entries(design.sports)) {
  if(hasHandoff) fs.copyFileSync(path.join(source,data.image),path.join(target,`${sport}.png`));
}
const metadata = Object.fromEntries(Object.entries(design.sports).map(([key,value]) => [key,{name:value.name,color:value.accent,ranks:value.ranks}]));
fs.writeFileSync('public/rankforge/assets/rank-art-x5.1.js',`/* Original artwork supplied in EvoRank-Codex-Gesamtpaket; no bodygraph changes. */
(() => {
  'use strict';
  const sports = ${JSON.stringify(metadata,null,2)};
  let serial = 0;
  function badge(sport, index, compact = false) {
    const data = sports[sport]; if (!data) return '';
    const i = Math.min(8,Math.max(0,Math.floor(Number(index)||0))), id = 'x51-art-' + (++serial);
    const rows = {strength:[[85,295],[430,320],[790,357]],run:[[78,306],[433,316],[790,358]],bike:[[86,309],[444,295],[790,321]],swim:[[107,250],[428,298],[788,335]]};
    const x = [22,433,833][i%3], [y,height] = rows[sport][Math.floor(i/3)];
    const src = './assets/ranks-x5.1/' + sport + '.png';
    return \`<svg class="x51-badge \${compact?'x51-badge--compact':''}" viewBox="\${x} \${y} 400 \${height}" role="img" aria-label="\${data.ranks[i]}" focusable="false"><defs><filter id="\${id}-cut" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .333 .333 .333 0 0"/><feComponentTransfer><feFuncA type="linear" slope="20" intercept="-1.2"/></feComponentTransfer></filter><mask id="\${id}" maskUnits="userSpaceOnUse" x="\${x}" y="\${y}" width="400" height="\${height}" style="mask-type:alpha"><image href="\${src}" width="1254" height="1254" filter="url(#\${id}-cut)"/></mask></defs><image href="\${src}" width="1254" height="1254" mask="url(#\${id})"/></svg>\`;
  }
  RANKS.forEach((rank,index) => { rank.name = sports.strength.ranks[index]; });
  const originalTitle = rankTitle;
  rankTitle = function(rank) { const index = RANKS.findIndex(item => item.key === rank?.key); return index < 0 ? originalTitle(rank) : sports.strength.ranks[index] + (rank.division ? ' ' + rank.division : ''); };
  rankMark = function(rank,compact=false) { const index = RANKS.findIndex(item => item.key === rank?.key); return badge('strength',index,compact); };
  // Keep the nine score tiers and their IDs. All translated displays use the approved proper names.
  for (const sport of ['run','bike','swim']) window.RANKFORGE970.animals[sport].forEach((entry,index) => {
    // Shared rank data stays writable for legacy startup migrations.
    // Renderers request fresh SVG IDs through RANKFORGE970.rankBadge instead.
    for (let language=1;language<entry.length;language++) entry[language]=sports[sport].ranks[index];
  });
  window.EVORANK_ART_X51 = Object.freeze({ sports, badge });
})();
`);
console.log('Prepared four unchanged sheets and metadata for 36 badges.');
