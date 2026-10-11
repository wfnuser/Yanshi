import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdirSync, openSync } from 'node:fs';
const root=resolve(import.meta.dirname,'..');
mkdirSync(resolve(root,'.runtime'),{recursive:true});
const log=openSync(resolve(root,'.runtime/gateway.log'),'a',0o600);
const gateway=spawn(process.execPath,['scripts/gateway.mjs'],{cwd:root,stdio:['ignore',log,log]});
const web=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8785','--strictPort'],{cwd:root,stdio:'inherit'});
let stopping=false;
function stop(){if(stopping)return;stopping=true;gateway.kill('SIGTERM');web.kill('SIGTERM');}
for(const s of ['SIGINT','SIGTERM']) process.on(s,stop);
gateway.on('exit',(code)=>{if(!stopping){console.error('Gateway exited:',code,'See .runtime/gateway.log');stop();process.exitCode=code||1;}});
web.on('exit',(code)=>{if(!stopping){stop();process.exitCode=code||1;}});
console.log('角色工作台 http://127.0.0.1:8785 · Gateway http://127.0.0.1:8786');
