import { defineConfig } from 'vite';
import { loadProjectEnv, resolveQwen } from './scripts/config.mjs';
loadProjectEnv(import.meta.dirname);
const qwen=resolveQwen(import.meta.dirname);
export default defineConfig({
  build:{target:'es2022'},
  optimizeDeps:{esbuildOptions:{target:'es2022'}},
  // SDK source can live outside this project without its own node_modules.
  resolve:{alias:{'@qwen':qwen},dedupe:['zod']},
  server:{fs:{allow:[import.meta.dirname,qwen]},proxy:{'/api':{target:'http://127.0.0.1:8786',ws:true,changeOrigin:false}}},
});
