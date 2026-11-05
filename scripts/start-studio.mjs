import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const web = fileURLToPath(new URL('../web/', import.meta.url));
const args = new Set(process.argv.slice(2));
const supported = new Set(['--prepare', '--no-open']);
if ([...args].some(arg => !supported.has(arg))) {
  console.error('Usage: Start-Studio.bat [--prepare] [--no-open]');
  process.exit(1);
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error('[ERROR] Node.js >=22.12 is required; Node.js 24 LTS is recommended.');
  process.exit(1);
}
function npm(...command) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', command, {
    cwd: web, stdio: 'inherit', shell: process.platform === 'win32',
  });
  if (result.error || result.status !== 0) {
    console.error(`[ERROR] npm ${command.join(' ')} failed. ${result.error?.message ?? ''}`);
    process.exit(result.status || 1);
  }
}
const stampPath = resolve(web, 'node_modules/.studio-install');
const fingerprint = createHash('sha256')
  .update(readFileSync(resolve(web, 'package.json')))
  .update(readFileSync(resolve(web, 'package-lock.json')))
  .update(`${process.platform}:${process.arch}:${major}`)
  .digest('hex');
const installed = existsSync(resolve(web, 'node_modules/vite/bin/vite.js')) &&
  existsSync(stampPath) && readFileSync(stampPath, 'utf8') === fingerprint;
if (!installed) {
  console.log('[1/3] Preparing dependencies (first run or dependency update; network required).');
  npm('ci', '--include=dev');
  writeFileSync(stampPath, fingerprint);
} else console.log('[1/3] Dependencies ready.');
console.log('[2/3] Building current source...');
npm('run', 'build');
if (args.has('--prepare')) process.exit(0);
console.log('[3/3] Starting Studio. Keep this window open. Ctrl+C stops the server.');
console.log('Local preview only. If port 5173 is occupied, close the previous Studio window first.');
// A fixed host/port keeps browser-local reviews on the same origin between runs.
// strictPort prevents silently opening a new origin and appearing to lose reviews.
const preview = ['run', 'preview', '--', '--host', 'localhost', '--port', '5173', '--strictPort'];
if (!args.has('--no-open')) preview.push('--open');
npm(...preview);
