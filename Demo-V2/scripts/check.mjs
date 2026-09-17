import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
async function walk(dir) { const list = []; for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory())
        list.push(...await walk(p));
    else if (/\.(m?js)$/.test(e.name))
        list.push(p);
} return list; }
const files = [...await walk(join(root, 'src')), ...await walk(join(root, 'scripts')), ...await walk(join(root, 'tests')), join(root, 'server.mjs')];
for (const file of files) {
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (r.status !== 0) {
        process.stderr.write(r.stderr);
        process.exit(1);
    }
}
for (const file of files.filter(f => f.replaceAll('\\', '/').includes('/src/'))) {
    const s = await readFile(file, 'utf8');
    for (const m of s.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        if (m[1].startsWith('.'))
            await readFile(resolve(file, '..', m[1]));
    }
    if (/fetch\s*\(/.test(s))
        throw Error(`${file}: prototype must not acquire a production API silently.`);
}
const css = await readFile(join(root, 'src/styles.css'), 'utf8');
for (const theme of ['atlas', 'halo', 'voyage', 'forge', 'meridian', 'atelier'])
    if (!css.includes(theme))
        throw Error(`Missing theme ${theme}`);
console.log(`PASS: syntax and local imports for ${files.length} JavaScript files; six theme definitions; no production fetch calls.`);
