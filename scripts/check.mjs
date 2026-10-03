import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const python = process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python';
if (!existsSync(python)) throw new Error('Create the project Python 3.12 .venv and install requirements.txt first.');
const env = { ...process.env, PYTHONUTF8: '1', GENVM_VERSION: 'v0.6.0-rc8', GENVM_SOURCE_MODE: 'release' };
delete env.GENVM_PREBUILT_DIR;
delete env.GENVMROOT;
const checks = [
  [python, ['scripts/genvm_lint.py', 'check', 'contracts/consent_delta.py']],
  [python, ['-m', 'pytest', 'tests/direct', '-q', '--tb=short']],
  [process.execPath, ['--check', 'scripts/check.mjs']],
  [process.execPath, ['--test', 'scripts/receipt.test.mjs', 'scripts/rpc-proxy.test.mjs', 'scripts/write-quote.test.mjs', 'scripts/fee-observation.test.mjs', 'scripts/native-transfer.test.mjs', 'scripts/hosted-proxy.test.mjs']],
  [process.execPath, [path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), '--workspace', 'frontend', 'run', 'check']],
];
// npm_execpath is the actual CLI used by npm (including bundled runtimes).
if (process.env.npm_execpath) checks[4][1][0] = process.env.npm_execpath;
for (const script of readdirSync('scripts').filter(file => file.endsWith('.mjs'))) checks.unshift([process.execPath, ['--check', `scripts/${script}`]]);
for (const [command, args] of checks) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
