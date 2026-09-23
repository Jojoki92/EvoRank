// Local HTTP verification, no browser UI or external service calls.
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const release=/^EvoRank (X\d+\.\d+)/.exec(fs.readFileSync('public/rankforge/version.txt','utf8'))?.[1];
if(!release)throw new Error('Unknown release');
const child=spawn(process.execPath,['packaging/windows/EVORANK-NODE-SERVER.mjs'],{env:{...process.env,EVORANK_PORT:'18051',EVORANK_NO_OPEN:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{output+=chunk;});
try {
  for(let i=0;i<100&&!output.includes('ist bereit');i++){
    if(child.exitCode!=null)throw new Error(output);
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!output.includes('ist bereit'))throw new Error('Local test server did not start');
  const sw=fs.readFileSync('public/rankforge/service-worker.js','utf8');
  const paths=[...sw.slice(sw.indexOf('const CORE = ['),sw.indexOf('];',sw.indexOf('const CORE = ['))).matchAll(/"(\.\/[^"\n]+)"/g)].map(match=>match[1]);
  let bytes=0;
  for(const file of paths){const response=await fetch(new URL(file,'http://127.0.0.1:18051/'));if(!response.ok)throw new Error(`${file}: ${response.status}`);bytes+=(await response.arrayBuffer()).byteLength;}
  const version=await (await fetch('http://127.0.0.1:18051/version.txt')).text();if(version.split(/\r?\n/)[0] !== 'EvoRank '+release)throw new Error('Wrong version');
  const report={release,at:new Date().toISOString(),httpResources:paths.length,bytes,browserOpened:false,externalServicesTested:false};
  fs.writeFileSync(`docs/EVORANK-${release}-HTTP-CHECK.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
} finally {child.kill('SIGTERM');if(child.exitCode==null)await once(child,'exit');}
