import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const release=fs.readFileSync('public/rankforge/version.txt','utf8').split(/\r?\n/)[0].replace('EvoRank ','').trim();
if(!/^X\d+\.\d+$/.test(release))throw new Error('Invalid release label');
const rows=[];const notices=[];
for(const [relative,entry] of Object.entries(lock.packages||{})){
  if(!relative)continue;
  const root=path.resolve(relative);let installed={};
  try{installed=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));}catch{}
  const name=installed.name||relative.split('node_modules/').at(-1);
  const license=installed.license||entry.license||'UNKNOWN';
  const files=[];
  if(fs.existsSync(root))for(const filename of fs.readdirSync(root)){
    if(!/^(licen[sc]e|copying|notice)(\.|$)/i.test(filename))continue;
    const file=path.join(root,filename);if(!fs.statSync(file).isFile()||fs.statSync(file).size>300000)continue;
    const content=fs.readFileSync(file,'utf8');files.push({file:filename,sha256:createHash('sha256').update(content).digest('hex')});
    notices.push(`\n===== ${name}@${entry.version} / ${filename} =====\n${content}\n`);
  }
  rows.push({name,version:entry.version,license,development:entry.dev===true,optional:entry.optional===true,installed:!!installed.name,files,path:relative});
}
const counts={};for(const row of rows)counts[row.license]=(counts[row.license]||0)+1;
const report={date:new Date().toISOString().slice(0,10),release,scope:'Locked npm dependency metadata and locally installed top-level license/NOTICE files. Not a legal clearance of images, datasets, services or all bundled internal components.',packages:rows.length,counts,review:rows.filter(row=>/UNKNOWN|GPL|MPL|CC-BY|SEE LICENSE|UNLICENSED/i.test(row.license)),entries:rows};
fs.writeFileSync(`docs/EVORANK-${release}-LICENSE-AUDIT.json`,JSON.stringify(report,null,2)+'\n');
fs.mkdirSync('public/rankforge/licenses',{recursive:true});
fs.writeFileSync('public/rankforge/licenses/DEPENDENCY-NOTICES.txt',`EvoRank ${release} dependency notices\nIncludes development dependencies for transparency; not every package runs in the static PWA.\n`+notices.join(''));
console.log(JSON.stringify({packages:rows.length,counts,review:report.review.map(({name,version,license,development,installed})=>({name,version,license,development,installed})),noticeFiles:notices.length}));
