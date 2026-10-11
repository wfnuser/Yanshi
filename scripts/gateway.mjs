import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root=resolve(import.meta.dirname,'..');
const qwen=resolve(root,'../_vendor/voice-agents/qwen-audio-agent-upstream-f6dd0e3');
// Reuse only the credentials/config already configured for this Qwen service.
const configured=parseEnv(readFileSync(resolve(root,'../_vendor/voice-agents/qwen-audio-agent/.env'),'utf8'));
for(const key of ['DASHSCOPE_API_KEY','QWEN_AUDIO_REALTIME_PROVIDER','QWEN_AUDIO_REALTIME_MODEL','QWEN_AUDIO_REALTIME_URL','QWEN_AUDIO_REALTIME_VOICE']) {
  if(!process.env[key] && configured[key]) process.env[key]=configured[key];
}
Object.assign(process.env,{
  PORT:'8786', HOST:'127.0.0.1', AGENT_PROTOCOL:'none',
  QWAUDIO_CONFIG_DIR:resolve(root,'.runtime/config'),
  QWAUDIO_DATA_DIR:resolve(root,'.runtime/data'),
  QWAUDIO_STATE_DIR:resolve(root,'.runtime/state'),
  QWAUDIO_CACHE_DIR:resolve(root,'.runtime/cache'),
  QWEN_AUDIO_AGENT_ALLOWED_ORIGINS:'http://127.0.0.1:8785,http://localhost:8785',
});
await import(pathToFileURL(resolve(qwen,'server/src/index.mjs')));
