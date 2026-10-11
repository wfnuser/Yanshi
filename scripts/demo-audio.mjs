import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const directory = resolve(import.meta.dirname, '../public/audio');
mkdirSync(directory, { recursive: true });
execFileSync('say', ['-v', 'Tingting', '-r', '165', '-o', resolve(directory, 'demo.aiff'),
  '你好，我是你的语音搭档。我们来试一试嘴形。啊，衣，乌，诶，哦。泡泡，妈妈，苹果和葡萄。你可以随时打断我，我会停下来听你说。']);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', resolve(directory, 'demo.aiff'), '-ar', '24000', '-ac', '1', resolve(directory, 'demo.wav')]);
console.log('Local Mandarin demo audio:', resolve(directory, 'demo.wav'));
