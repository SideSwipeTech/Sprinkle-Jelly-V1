import { cp, mkdir, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const check = spawnSync(process.execPath, [join(root, 'scripts/check.mjs')], { stdio: 'inherit' });
if (check.status !== 0)
    process.exit(check.status || 1);
const out = join(root, 'dist');
await mkdir(out, { recursive: true });
for (const p of ['index.html', 'icon.svg', 'src'])
    await cp(join(root, p), join(out, p), { recursive: true });
try {
    await access(join(root, 'node_modules/monaco-editor/min/vs'));
    await mkdir(join(out, 'vendor/monaco'), { recursive: true });
    await cp(join(root, 'node_modules/monaco-editor/min/vs'), join(out, 'vendor/monaco/vs'), { recursive: true });
    console.log('Monaco bundled for local static delivery.');
}
catch {
    console.warn('Monaco is not installed: this build uses the explicitly labelled plain-text recovery editor. Run pnpm install, then rebuild for Monaco.');
}
console.log('Static prototype built in dist/. No backend or execution service is included.');
