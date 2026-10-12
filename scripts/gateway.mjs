import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire, registerHooks } from 'node:module';
import { localProxy } from './proxy.mjs';
import { loadProjectEnv, resolveQwen, gatewayEnvironment } from './config.mjs';

const root=resolve(import.meta.dirname,'..');
loadProjectEnv(root);
const qwen=resolveQwen(root);
// The reference checkout shares an older dependency directory. Resolve only
// these missing packages from this app, without mutating that shared install.
const requireHere = createRequire(import.meta.url);
const proxy = localProxy();
if (proxy) process.env.AVATAR_RESOLVED_PROXY = proxy;
registerHooks({ resolve(specifier, context, nextResolve) {
  if (proxy && specifier === 'ws' && context.parentURL === pathToFileURL(resolve(qwen, 'server/src/voice/realtime-provider.mjs')).href) {
    return { url: new URL('./gateway-websocket.mjs', import.meta.url).href, shortCircuit: true };
  }
  try { return nextResolve(specifier, context); }
  catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !['yaml', 'qrcode'].includes(specifier)) throw error;
    return { url: pathToFileURL(requireHere.resolve(specifier)).href, shortCircuit: true };
  }
} });
Object.assign(process.env, gatewayEnvironment(root, qwen));
await import(pathToFileURL(resolve(qwen,'server/src/index.mjs')));
