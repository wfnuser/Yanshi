import { execFileSync } from 'node:child_process';

export function configuredProxy(env = process.env, systemSettings = '') {
  if (env.AVATAR_HTTPS_PROXY === 'off') return null;
  const explicit = env.AVATAR_HTTPS_PROXY || env.HTTPS_PROXY || env.https_proxy;
  if (explicit) return new URL(explicit).href;
  const value = key => systemSettings.match(new RegExp(`^\\s*${key} : (.+)$`, 'm'))?.[1]?.trim();
  if (value('HTTPSEnable') !== '1') return null;
  const host = value('HTTPSProxy'), port = value('HTTPSPort');
  return host && /^\d+$/.test(port || '') ? `http://${host}:${port}` : null;
}

export function localProxy() {
  let settings = '';
  if (process.platform === 'darwin') {
    try { settings = execFileSync('scutil', ['--proxy'], { encoding: 'utf8', timeout: 2000 }); } catch {}
  }
  return configuredProxy(process.env, settings);
}

export function withProxy(BaseWebSocket, agent) {
  return class extends BaseWebSocket {
    constructor(address, options = {}) {
      const url = new URL(address);
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      super(address, { ...options, ...(!local && agent && !options.agent ? { agent } : {}) });
    }
  };
}
