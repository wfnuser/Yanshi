import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const manifest=[];
async function download(url, path) {
  const dest=resolve(root,'public',path);
  await mkdir(dirname(dest),{recursive:true});
  execFileSync('curl',['--fail','--location','--retry','2','--max-time','60',url,'--output',dest],{stdio:'pipe'});
  const data=await readFile(dest);
  manifest.push({url,path,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
  console.log(path, data.length);
  return data;
}
const sha=JSON.parse(execFileSync('curl',['-fsSL','--max-time','30','https://api.github.com/repos/Live2D/CubismWebSamples/commits/develop'],{encoding:'utf8'})).sha;
const base=`https://raw.githubusercontent.com/Live2D/CubismWebSamples/${sha}/Samples/Resources/Hiyori/`;
const model=JSON.parse(await download(base+'Hiyori.model3.json','models/Hiyori/Hiyori.model3.json'));
const refs=model.FileReferences;
const files=[refs.Moc,...refs.Textures,refs.Physics,refs.Pose,refs.UserData,refs.DisplayInfo,...Object.values(refs.Motions).flat().map(x=>x.File)].filter(Boolean);
for(const file of files) await download(base+file,'models/Hiyori/'+file);
await download('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js','vendor/live2dcubismcore.min.js');
await download('https://raw.githubusercontent.com/mrxz/wLipSync/main/example/profile.json','profile.json');
await download(`https://raw.githubusercontent.com/Live2D/CubismWebSamples/${sha}/LICENSE.md`,'vendor/Live2D-LICENSE.md');
await download('https://raw.githubusercontent.com/mrxz/wLipSync/main/LICENSE','vendor/wLipSync-LICENSE');
await mkdir(resolve(root,'artifacts'),{recursive:true});
await writeFile(resolve(root,'artifacts/assets.json'),JSON.stringify({date:new Date().toISOString(),live2dCommit:sha,assets:manifest},null,2));
await import('./demo-audio.mjs');
console.log('Assets and local Mandarin test audio ready.');
