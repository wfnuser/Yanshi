import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const qwen=resolve(import.meta.dirname,'../_vendor/voice-agents/qwen-audio-agent-upstream-f6dd0e3');
export default defineConfig({
  build:{target:'es2022'},
  optimizeDeps:{esbuildOptions:{target:'es2022'}},
  resolve:{alias:{'@qwen':qwen}},
  server:{fs:{allow:[import.meta.dirname,qwen]},proxy:{'/api':{target:'http://127.0.0.1:8786',ws:true,changeOrigin:false}}},
});
