import WebSocket from '../../_vendor/voice-agents/qwen-audio-agent/node_modules/ws/wrapper.mjs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { withProxy } from './proxy.mjs';

// Only the frozen realtime provider imports this adapter. Local browser sockets
// and other backend transports keep their original implementation.
export default withProxy(WebSocket, new HttpsProxyAgent(process.env.AVATAR_RESOLVED_PROXY));
