import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
const root = resolve(import.meta.dirname, '..');
let child;
let base;
before(async () => {
    child = spawn(process.execPath, ['server.mjs'], {
        cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const [message] = await once(child.stdout, 'data');
    base = String(message).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    assert.ok(base, 'The local server reports its actual listening port.');
});
after(async () => {
    if (child && child.exitCode === null) {
        child.kill('SIGTERM');
        await once(child, 'exit');
    }
});
test('every documented admin path serves the app entry, including direct deep links', async () => {
    const routes = JSON.parse(await readFile(new URL('routes.json', import.meta.url), 'utf8'));
    assert.equal(routes.length, 83);
    for (const route of routes) {
        const response = await fetch(base + route.path);
        assert.equal(response.status, 200, route.pattern);
        assert.match(response.headers.get('content-type'), /text\/html/);
        assert.match(await response.text(), /src\/app\.js/);
    }
});
test('JavaScript modules use a JavaScript MIME type', async () => {
    const response = await fetch(base + '/src/app.js');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /javascript/);
});
test('a missing static asset is not disguised as the application', async () => {
    const response = await fetch(base + '/src/no-such-file.js');
    assert.equal(response.status, 404);
});
test('missing Monaco gives a real 404 rather than successful HTML', async () => {
    const response = await fetch(base + '/vendor/monaco/vs/no-such-file.js');
    assert.equal(response.status, 404);
});
test('hidden configuration files are refused', async () => {
    assert.equal((await fetch(base + '/.env')).status, 403);
    assert.equal((await fetch(base + '/.git/config')).status, 403);
});
test('the static server accepts no write requests', async () => {
    assert.equal((await fetch(base + '/admin', { method: 'POST' })).status, 405);
});
test('HEAD returns headers without an application body', async () => {
    const response = await fetch(base + '/admin', { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
});
test('safe resource headers are present', async () => {
    const response = await fetch(base + '/icon.svg');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
});
