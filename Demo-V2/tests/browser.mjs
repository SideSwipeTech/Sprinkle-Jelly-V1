/** Local end-to-end checks. Install Playwright's Chromium before running this file. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const allowRecovery = process.argv.includes('--allow-recovery-editor');
const server = spawn(process.execPath, ['server.mjs'], {
    cwd: root, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'inherit'],
});
const [line] = await once(server.stdout, 'data');
const base = String(line).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
if (!base)
    throw Error('The local server did not start.');
let browser;
const results = [];
const contexts = [];
async function fresh(path = '/admin') {
    const context = await browser.newContext({ viewport: { width: 1536, height: 1080 } });
    contexts.push(context);
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + path);
    await page.locator('main h1').first().waitFor();
    return { page, errors };
}
async function state(page, expression) {
    return page.evaluate(async (code) => {
        const store = await import('/src/store.js');
        // Only this fixed, local test file calls this helper; no UI input reaches it.
        const [operation, ...args] = code;
        return store[operation](...args);
    }, expression);
}
const action = (page, name) => page.locator(`[data-action="${name}"]`).first().click();
const tab = (page, name) => page.locator(`[data-action="author-tab"][data-id="${name}"]`).first().click();
const close = page => page.locator('dialog[open] [data-close]').first().click();
async function code(page, field, value) {
    const host = page.locator(`[data-code="${field}"]`).first();
    await host.waitFor();
    if (allowRecovery)
        await page.waitForTimeout(300);
    else
        await host.locator('[data-editor-status]').filter({ hasText: /^Monaco/ }).waitFor();
    return host.evaluate((element, incoming) => {
        const area = element.querySelector('textarea');
        const uri = element.dataset.modelUri;
        const model = uri && window.monaco?.editor.getModel(window.monaco.Uri.parse(uri));
        if (incoming !== undefined) {
            if (model)
                model.pushEditOperations([], [{ range: model.getFullModelRange(), text: incoming }], () => null);
            else if (area) {
                area.value = incoming;
                area.dispatchEvent(new Event('input', { bubbles: true }));
            }
            else
                throw Error('No functioning editor is available.');
        }
        return model ? model.getValue() : area?.value;
    }, value);
}
async function go(page, path) {
    // Real full navigation also exercises the server's SPA fallback and persisted demo state.
    await page.goto(base + path);
    await page.locator('main h1').first().waitFor();
}
async function check(name, work) {
    try {
        await work();
        results.push({ name, passed: true });
        console.log('PASS', name);
    }
    catch (error) {
        results.push({ name, passed: false, error: error.message });
        console.error('FAIL', name, error.message);
    }
}
try {
    browser = await chromium.launch({ headless: true });
    await check('all 83 canonical admin route patterns open without page errors', async () => {
        const { page, errors } = await fresh();
        const routes = JSON.parse(await readFile(new URL('routes.json', import.meta.url), 'utf8'));
        assert.equal(routes.length, 83);
        for (const { path } of routes) {
            await go(page, path);
            const title = await page.locator('main h1').first().innerText();
            assert.ok(!['This view could not open', 'Page not found'].includes(title), path);
        }
        assert.deepEqual(errors, []);
    });
    await check('language drafts stay independent; draft save does not change live content', async () => {
        const { page, errors } = await fresh('/admin/challenges/challenge-parentheses');
        await tab(page, 'code');
        await code(page, 'languages.0.starter', 'PYTHON EDIT\n');
        await page.locator('[data-action=language-select][data-id="1"]').click();
        assert.match(await code(page, 'languages.1.starter'), /const fs/);
        await code(page, 'languages.1.starter', 'JS EDIT\n');
        await page.locator('[data-action=language-select][data-id="0"]').click();
        assert.equal(await code(page, 'languages.0.starter'), 'PYTHON EDIT\n');
        await action(page, 'author-save');
        await page.waitForTimeout(350);
        const record = (await state(page, ['getDB'])).problems[0];
        assert.equal(record.languages[0].starter, 'PYTHON EDIT\n');
        assert.equal(record.languages[1].starter, 'JS EDIT\n');
        assert.notEqual(record.live.languages[0].starter, 'PYTHON EDIT\n');
        assert.deepEqual(errors, []);
    });
    await check('preview excludes hidden results; changed cases invalidate the current validation', async () => {
        const { page, errors } = await fresh('/admin/challenges/challenge-parentheses');
        await tab(page, 'cases');
        await page.locator('[data-action=case-select][data-id="2"]').click();
        await page.locator('[data-field="cases.2.expected"]').fill('HIDDEN_SENTINEL');
        await action(page, 'author-preview');
        assert.ok(!(await page.locator('dialog').innerText()).includes('HIDDEN_SENTINEL'));
        await close(page);
        await action(page, 'author-validate');
        await page.waitForTimeout(850);
        assert.equal(await page.locator('[data-action=author-publish]').isDisabled(), false);
        await page.locator('[data-field="cases.2.expected"]').fill('CHANGED_HIDDEN');
        assert.equal(await page.locator('[data-action=author-publish]').isDisabled(), true);
        assert.match(await page.locator('.inspector').innerText(), /Needs recheck/);
        assert.deepEqual(errors, []);
    });
    await check('publish updates only the exact validated draft', async () => {
        const { page, errors } = await fresh('/admin/challenges/challenge-parentheses');
        await page.locator('[data-field=title]').fill('Updated challenge');
        await action(page, 'author-validate');
        await page.waitForTimeout(850);
        await action(page, 'author-publish');
        await page.locator('dialog [data-confirm]').click();
        await page.waitForTimeout(350);
        assert.equal((await state(page, ['getDB'])).problems[0].live.title, 'Updated challenge');
        assert.deepEqual(errors, []);
    });
    await check('save failure preserves unsaved inputs', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await page.locator('[data-field=title]').fill('Must survive');
        await state(page, ['setScenario', 'save-failure']);
        await action(page, 'author-save');
        await page.waitForTimeout(350);
        assert.equal(await page.locator('[data-field=title]').inputValue(), 'Must survive');
        assert.equal((await state(page, ['getDB'])).problems[0].title, 'Generate Parentheses');
    });
    await check('late save response does not mark later typing saved', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await page.locator('[data-field=title]').fill('First version');
        await state(page, ['setScenario', 'slow-save']);
        await action(page, 'author-save');
        await page.locator('[data-field=title]').fill('Newer typing');
        await page.waitForTimeout(1500);
        assert.equal((await state(page, ['getDB'])).problems[0].title, 'First version');
        assert.equal(await page.locator('[data-field=title]').inputValue(), 'Newer typing');
        assert.match(await page.locator('[data-save-state]').innerText(), /Unsaved/);
    });
    await check('verification recovery does not publish or discard the draft', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await page.locator('[data-field=title]').fill('Verification draft');
        await state(page, ['setScenario', 'verification']);
        await action(page, 'author-save');
        await page.waitForTimeout(350);
        await action(page, 'verify-again');
        assert.equal(await page.locator('[data-field=title]').inputValue(), 'Verification draft');
        assert.equal((await state(page, ['getDB'])).problems[0].title, 'Generate Parentheses');
    });
    await check('Track creation inherits language and does not create a Challenge', async () => {
        const { page } = await fresh('/admin/tracks/track-python');
        await action(page, 'create-track-problem');
        await page.locator('dialog [name=title]').fill('Independent track item');
        await page.locator('dialog [data-confirm]').click();
        await tab(page, 'code');
        assert.equal(await page.locator('[aria-label="Add language"]').count(), 0);
        const problems = (await state(page, ['getDB'])).problems;
        const created = problems.find(p => p.title === 'Independent track item');
        assert.equal(created.trackId, 'track-python');
        assert.equal(created.languages.length, 1);
        assert.equal(problems.filter(p => p.kind === 'challenge').length, 1);
    });
    await check('Admin submits; Super Admin approves and publishes', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await state(page, ['setRole', 'Admin']);
        await go(page, '/admin/challenges/challenge-parentheses');
        await action(page, 'author-validate');
        await page.waitForTimeout(850);
        assert.equal(await page.locator('[data-action=author-publish]').innerText(), 'Submit for approval');
        await action(page, 'author-publish');
        await page.locator('dialog [data-confirm]').click();
        await page.waitForTimeout(150);
        assert.equal((await state(page, ['getDB'])).problems[0].status, 'Submitted');
        await state(page, ['setRole', 'Super Admin']);
        await go(page, '/admin/submissions');
        await action(page, 'review-submission');
        await page.locator('dialog [data-confirm]').click();
        await page.waitForTimeout(150);
        assert.equal((await state(page, ['getDB'])).problems[0].status, 'Published');
    });
    await check('width/height splitters and expand/restore are keyboard-operable', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await tab(page, 'cases');
        const before = (await page.locator('.split-side').boundingBox()).width;
        await page.locator('[data-split]').first().focus();
        await page.keyboard.press('ArrowRight');
        assert.ok((await page.locator('.split-side').boundingBox()).width > before);
        await tab(page, 'code');
        const height = (await page.locator('.code-mount').first().boundingBox()).height;
        await page.locator('.height-handle').first().focus();
        await page.keyboard.press('ArrowDown');
        assert.ok((await page.locator('.code-mount').first().boundingBox()).height > height);
        await page.locator('[data-editor-expand]').first().click();
        assert.equal(await page.locator('.code-host.expanded').count(), 1);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.code-host.expanded').count(), 0);
    });
    await check('all twelve theme/mode combinations preserve editing', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await tab(page, 'code');
        await code(page, 'languages.0.starter', 'KEEP THIS DRAFT');
        for (const theme of ['atlas', 'halo', 'voyage', 'forge', 'meridian', 'atelier']) {
            await action(page, 'appearance');
            await page.locator(`[data-theme-choice="${theme}"]`).click();
            await close(page);
            for (const mode of ['light', 'dark']) {
                if (await page.locator('html').getAttribute('data-mode') !== mode)
                    await action(page, 'mode');
                assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
                assert.equal(await code(page, 'languages.0.starter'), 'KEEP THIS DRAFT');
            }
        }
    });
    await check('case visibility is a single stored choice', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await tab(page, 'cases');
        await action(page, 'case-add');
        await page.locator('[data-field="cases.3.visibility"]').selectOption('Visible');
        await page.locator('[data-field="cases.3.input"]').fill('4');
        await page.locator('[data-field="cases.3.expected"]').fill('example');
        await action(page, 'author-save');
        await page.waitForTimeout(350);
        assert.equal((await state(page, ['getDB'])).problems[0].cases[3].visibility, 'Visible');
    });
    await check('Assessment coding authoring has starter/reference and case controls', async () => {
        const { page } = await fresh('/admin/papers/paper-foundations/questions');
        await page.locator('[data-action=section-select][data-id=section-coding]').click();
        await page.locator('[data-action=question-tab][data-id=code]').click();
        assert.equal(await page.locator('.code-host').count(), 2);
        await page.locator('[data-action=question-tab][data-id=cases]').click();
        assert.equal(await page.locator('[data-field$=".visibility"]').count(), 1);
    });
    await check('course authoring presents quiz, video, assignment and executable blocks', async () => {
        const { page } = await fresh('/admin/courses/subject-networks');
        await tab(page, 'curriculum');
        await page.locator('[data-action=lesson-select][data-id=lesson-quiz]').click();
        assert.equal(await page.locator('[data-answer]').count(), 4);
        await page.locator('[data-action=lesson-select][data-id=lesson-packets]').click();
        assert.equal(await page.locator('[data-video-file]').count(), 1);
        await page.locator('[data-action=lesson-select][data-id=lesson-project]').click();
        assert.equal(await page.locator('[data-field$=".templateId"]').count(), 1);
        await page.locator('[data-action=lesson-select][data-id=lesson-internet]').click();
        assert.equal(await page.locator('.code-host').count(), 1);
    });
    await check('template files are editable and stored', async () => {
        const { page } = await fresh('/admin/workspace/templates?template=template-web');
        await tab(page, 'files');
        await action(page, 'file-add');
        await page.locator('dialog [name=path]').fill('src/notes.txt');
        await page.locator('dialog [data-confirm]').click();
        const field = await page.locator('.code-host').first().getAttribute('data-code');
        await code(page, field, 'A real editable file');
        await action(page, 'author-save');
        await page.waitForTimeout(350);
        assert.ok((await state(page, ['getDB'])).templates[0].files.some(f => f.path === 'src/notes.txt' && f.content === 'A real editable file'));
    });
    await check('the coordinated response set includes all 39 message kinds', async () => {
        const { page } = await fresh('/admin/wizbit/responses');
        assert.equal(await page.locator('[data-action=response-select]').count(), 39);
        await page.locator('[data-field="items.0.fact"]').fill('Your current file is saved.');
        await action(page, 'author-preview');
        assert.equal((await page.locator('dialog').innerText()).split('Your current file is saved.').length - 1, 2);
    });
    await check('narrow layout keeps authoring controls without horizontal overflow', async () => {
        const { page } = await fresh('/admin/challenges/challenge-parentheses');
        await page.setViewportSize({ width: 820, height: 1000 });
        await tab(page, 'code');
        assert.equal(await page.locator('[data-action=author-save]').isVisible(), true);
        assert.equal(await page.evaluate(() => document.querySelector('main').scrollWidth <= document.querySelector('main').clientWidth + 2), true);
    });
}
finally {
    for (const context of contexts)
        await context.close().catch(() => { });
    await browser?.close();
    server.kill('SIGTERM');
    await mkdir(resolve(root, 'test-results'), { recursive: true });
    await writeFile(resolve(root, 'test-results/browser.json'), JSON.stringify(results, null, 2) + '\n');
}
console.log(`${results.filter(r => r.passed).length}/${results.length} browser checks passed.`);
if (results.some(r => !r.passed))
    process.exitCode = 1;
