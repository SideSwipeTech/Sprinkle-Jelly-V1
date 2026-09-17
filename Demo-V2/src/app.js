import { THEMES } from './data.js';
import { esc, icon, button, field, toggle, note, empty, heading, download } from './ui.js';
import { clone, fingerprint, setPath, getPath, checksFor, canPublish } from './model.js';
import * as store from './store.js';
import { mountEditors, destroyEditors, clearModels, editorTheme, mountSplitters } from './editor.js';
import { renderPractice } from './features/practice.js';
import { renderAssessments } from './features/assessments.js';
import { renderCourses } from './features/courses.js';
import { renderTemplates } from './features/templates.js';
import { renderRecords, pumpBroadcasts } from './features/records.js';
import { renderOperations, globalFeature } from './features/operations.js';
import { renderWizbit } from './features/wizbit.js';
// A standalone admin prototype. No request here reaches a production API.
const GROUPS = [
    ['Overview', [['Home suggestion', '/admin/analytics/home-suggestion', 'grid'], ['Next-action destinations', '/admin/analytics/next-action-mappings', 'branch'], ['Participation reports', '/admin/analytics/reporting', 'chart']]],
    ['Learning', [['Courses', '/admin/courses', 'book']]],
    ['Practice', [['Challenges', '/admin/challenges', 'code'], ['Daily Challenges', '/admin/daily-challenges', 'calendar'], ['Debug Detective', '/admin/debug-detective', 'bug'], ['Tracks', '/admin/tracks', 'track']]],
    ['Build', [['Workspace templates', '/admin/workspace/templates', 'folder']]],
    ['Assessments', [['Mock Tests', '/admin/papers?type=Mock', 'shield'], ['Company Tests', '/admin/papers?type=Company', 'layers'], ['Companies & job roles', '/admin/companies', 'people']]],
    ['Personal', [['Certificates', '/admin/certificates', 'trophy'], ['Topic Requests', '/admin/topic-requests', 'inbox'], ['Economy', '/admin/economy/configuration', 'chart']]],
    ['Platform', [['WizBit knowledge', '/admin/wizbit/kb', 'spark'], ['Response wording', '/admin/wizbit/responses', 'code'], ['Character presentation', '/admin/wizbit/identity', 'eye'], ['Guidance controls', '/admin/wizbit/nudges', 'settings'], ['Knowledge matching', '/admin/wizbit/kb-administration', 'search'], ['Broadcasts', '/admin/broadcasts', 'bell'], ['Runtime availability', '/admin/language-registry', 'code']]],
    ['Administration', [['Operations', '/admin', 'grid'], ['People', '/admin/people', 'people'], ['Publication approvals', '/admin/submissions', 'check'], ['Content reports', '/admin/reports', 'alert'], ['Skills & topics', '/admin/vocabulary', 'branch'], ['Content Gaps', '/admin/content-gaps', 'search'], ['Content sources', '/admin/provenance', 'book'], ['Erasure & holds', '/admin/lifecycle', 'shield'], ['Maintenance', '/admin/maintenance-windows', 'clock'], ['Audit history', '/admin/audit', 'file']]]
];
const sessions = new Map(), views = new Map();
let current = null, locationKey = '', lastPath = '', applying = false;
const $app = document.querySelector('#app');
function appearance() { const p = store.getPreferences(); document.documentElement.dataset.theme = THEMES.some(t => t[0] === p.theme) ? p.theme : 'atlas'; document.documentElement.dataset.mode = p.mode === 'light' ? 'light' : 'dark'; document.documentElement.dataset.reducedMotion = String(p.reducedMotion); editorTheme(); }
appearance();
function toast(text, error = false) { const box = document.createElement('div'); box.className = 'toast' + (error ? ' error' : ''); box.setAttribute('role', error ? 'alert' : 'status'); box.innerHTML = `${icon(error ? 'alert' : 'check')}<span>${esc(text)}</span><button class="icon-btn" aria-label="Dismiss notification">${icon('x')}</button>`; document.querySelector('#toasts').append(box); box.querySelector('button').onclick = () => box.remove(); if (!error)
    setTimeout(() => box.remove(), 6500); }
function dialog(title, body, options = {}) {
    const root = document.querySelector('#dialog-root'), previous = document.activeElement;
    root.querySelectorAll('dialog').forEach(d => d.close());
    root.replaceChildren();
    const dlg = document.createElement('dialog');
    if (options.large)
        dlg.classList.add('large');
    dlg.setAttribute('aria-labelledby', 'dialog-title');
    dlg.innerHTML = `<form><div class="dialog-head"><h2 id="dialog-title">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close dialog">${icon('x')}</button></div><div class="dialog-body">${body}${options.reason ? field('Required reason', 'reason', '', { textarea: true, rows: 3, required: true }) : ''}${options.typed ? field(`Type ${options.typed} to confirm`, 'typed', '', { required: true, help: 'This confirms the exact item or action.' }) : ''}<div class="dialog-error" role="alert"></div></div><div class="dialog-foot"><button type="button" class="btn" data-close>${esc(options.closeLabel || (options.confirm ? 'Cancel' : 'Close'))}</button>${options.confirm ? `<button type="submit" class="btn ${options.danger ? 'danger' : 'primary'}" data-confirm>${esc(options.confirm)}</button>` : ''}</div></form>`;
    root.append(dlg);
    const confirm = dlg.querySelector('[data-confirm]');
    const check = () => { if (confirm)
        confirm.disabled = !!options.typed && dlg.querySelector('[name=typed]').value !== options.typed; };
    dlg.addEventListener('input', check);
    check();
    dlg.querySelectorAll('[data-close]').forEach(b => b.onclick = () => dlg.close());
    dlg.addEventListener('click', e => { const a = e.target.closest('a[data-nav]'); if (a) {
        e.preventDefault();
        dlg.close();
        navigate(a.getAttribute('href'));
    } });
    dlg.addEventListener('close', () => { if (previous?.isConnected)
        previous.focus(); setTimeout(() => { if (!dlg.open)
        dlg.remove(); }, 0); });
    dlg.querySelector('form').addEventListener('submit', async (e) => { e.preventDefault(); if (!options.confirm || confirm.disabled || !dlg.querySelector('form').reportValidity())
        return; const values = {}; for (const el of dlg.querySelectorAll('input[name],textarea[name],select[name]'))
        values[el.name] = el.type === 'checkbox' ? el.checked : el.value; const error = dlg.querySelector('.dialog-error'); error.textContent = ''; confirm.disabled = true; try {
        await options.onConfirm?.(values);
        dlg.close();
    }
    catch (err) {
        error.textContent = err.message || String(err);
        confirm.disabled = false;
        check();
    } });
    dlg.showModal();
    options.onMount?.(dlg);
    return dlg;
}
function safeURL(url) { const u = new URL(url, location.href); if (u.origin !== location.origin || !u.pathname.startsWith('/admin'))
    throw Error('Learner and external pages are not part of this admin-only prototype. Use the learner preview in the editor.'); return u.pathname + u.search + u.hash; }
function navigate(url, force = false) { let next; try {
    next = safeURL(url);
}
catch (e) {
    toast(e.message, true);
    return;
} const proceed = () => { history.pushState({}, '', next); render(); document.querySelector('main')?.scrollTo(0, 0); }; if (!force && current?.editing?.dirty) {
    const s = current.editing;
    dialog('Keep your unsaved changes?', note('Your changes are preserved as a browser recovery draft. Leave without replacing the last confirmed saved content, or stay and save.'), { confirm: 'Leave with recovery copy', onConfirm: () => { store.recoverDraft(s.table, s.draft.id, s.draft); proceed(); } });
}
else
    proceed(); }
function edit(table, id) { const key = `${table}/${id}`, record = store.getDB()[table]?.find(x => x.id === id); if (!record)
    return null; let s = sessions.get(key); if (!s) {
    s = { key, table, draft: clone(record), baseRevision: record.revision || 1, dirty: false, saving: false, validation: record.validation, section: '', selected: 0 };
    const recovery = store.readRecovery(table, id);
    if (recovery?.record && fingerprint(recovery.record) !== fingerprint(record)) {
        s.draft = clone(recovery.record);
        s.baseRevision = recovery.record.revision || record.revision;
        s.dirty = true;
        s.recovered = true;
    }
    sessions.set(key, s);
}
else if (!s.dirty && !s.saving && s.baseRevision !== record.revision) {
    s.draft = clone(record);
    s.baseRevision = record.revision;
    s.validation = record.validation;
} return s; }
function markDirty(s) { s.dirty = true; s.recovered = false; const protectedCopy = store.recoverDraft(s.table, s.draft.id, s.draft); const state = document.querySelector('[data-save-state]'); if (state)
    state.innerHTML = `${icon('clock')}${protectedCopy ? 'Unsaved changes · recovery kept' : 'Unsaved changes · recovery unavailable'}`; const title = document.querySelector('[data-editor-title]'); if (title)
    title.textContent = s.draft.title || 'Untitled draft'; document.querySelectorAll('[data-action=author-publish]').forEach(b => b.disabled = !canPublish(s.draft, s.validation, checksFor(s.table, s.draft, store.getDB()))); if (s.validation && s.validation.fingerprint !== fingerprint(s.draft)) {
    const el = document.querySelector('.inspector .validation-status');
    if (el)
        el.innerHTML = '<span class="badge warning">Needs recheck</span><small>The draft changed after validation. Validate before publication.</small>';
} }
function makeContext() {
    const path = decodeURI(location.pathname).replace(/\/$/, '') || '/admin', query = new URLSearchParams(location.search);
    const key = path + '?' + location.search;
    let view = views.get(key);
    if (!view) {
        view = {};
        views.set(key, view);
    }
    const handlers = new Map(), changes = new Map();
    const ctx = { path, query, view, db: store.getDB(), handlers, changes, after: [], editing: null, target: null, fieldChanged: null, codeScope: path,
        edit, on: (a, f) => handlers.set(a, f), onChange: (a, f) => changes.set(a, f), fields: (object, fn) => { ctx.target = object; ctx.fieldChanged = fn; }, markDirty,
        render: () => render(), renderWithFocus: key => { const old = document.querySelector(`[data-change="${CSS.escape(key)}"]`), position = old?.selectionStart; render(); const next = document.querySelector(`[data-change="${CSS.escape(key)}"]`); next?.focus(); if (typeof position === 'number')
            try {
                next.setSelectionRange(position, position);
            }
            catch { } },
        navigate, dialog, toast, dropSession: s => { sessions.delete(s.key); store.clearRecovery(s.table, s.draft.id); },
        notFound: (message = 'This admin destination is not available.') => `${heading('Page not found', message, '', 'WIZLY STUDIO')}${empty('Nothing to open here', 'Use the grouped navigation to open an admin workspace.', `<a data-nav class="btn" href="/admin">Back to Operations</a>`)}`,
        globalFeature: (name, param) => globalFeature(ctx, name, param)
    };
    return ctx;
}
function page(ctx) { const p = ctx.path; if (p.startsWith('/admin/wizbit'))
    return renderWizbit(ctx); if (p.startsWith('/admin/challenges') || p.startsWith('/admin/daily-challenges') || p.startsWith('/admin/debug-detective') || p.startsWith('/admin/tracks'))
    return renderPractice(ctx); if (p.startsWith('/admin/papers') || p.startsWith('/admin/companies') || p.startsWith('/admin/tests'))
    return renderAssessments(ctx); if (p.startsWith('/admin/courses'))
    return renderCourses(ctx); if (p === '/admin/workspace/templates')
    return renderTemplates(ctx); if (['/admin/economy', '/admin/certificates', '/admin/topic-requests', '/admin/broadcasts'].some(r => p.startsWith(r)))
    return renderRecords(ctx); return renderOperations(ctx); }
function isActive(url, ctx) { const u = new URL(url, location.origin); if (u.pathname === '/admin')
    return ctx.path === '/admin'; if (u.search)
    return ctx.path === u.pathname && ctx.query.get('type') === u.searchParams.get('type'); return ctx.path === u.pathname || ctx.path.startsWith(u.pathname + '/'); }
function nav(ctx) { return GROUPS.map(([group, items]) => `<div class="nav-group"><div class="nav-label">${group}</div>${items.map(([name, url, ico]) => `<a href="${url}" data-nav title="${name}" class="${isActive(url, ctx) ? 'active' : ''}" ${isActive(url, ctx) ? 'aria-current="page"' : ''}>${icon(ico)}<span>${name}</span></a>`).join('')}</div>`).join(''); }
function registerGlobal(ctx) {
    ctx.on('appearance', () => { const p = store.getPreferences(); dialog('Six themes. One workspace.', `<p>Change the presentation without changing your draft or workflow.</p><div class="theme-choices">${THEMES.map(([key, name, description]) => `<button type="button" class="theme-choice ${p.theme === key ? 'active' : ''}" data-theme-choice="${key}"><span class="theme-dot ${key}"></span><strong>${name}</strong><small>${description}</small></button>`).join('')}</div><div class="mt">${toggle('Reduced motion', 'reduce', p.reducedMotion, 'Keep transitions quiet without hiding feedback.')}</div>`, { onMount: d => { d.querySelectorAll('[data-theme-choice]').forEach(b => b.onclick = () => { store.preferences({ theme: b.dataset.themeChoice }); appearance(); d.querySelectorAll('[data-theme-choice]').forEach(x => x.classList.toggle('active', x === b)); document.querySelector('[data-theme-name]').textContent = THEMES.find(t => t[0] === b.dataset.themeChoice)[1]; }); d.querySelector('[data-field=reduce]').onchange = e => { store.preferences({ reducedMotion: e.target.checked }); appearance(); }; } }); });
    ctx.on('mode', () => { const currentMode = document.documentElement.dataset.mode; store.preferences({ mode: currentMode === 'dark' ? 'light' : 'dark' }); appearance(); const b = document.querySelector('[data-action=mode]'); b.innerHTML = icon(currentMode === 'dark' ? 'moon' : 'sun'); b.setAttribute('aria-label', currentMode === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'); });
    ctx.on('collapse', () => { document.body.dataset.sidebarCollapsed = String(document.body.dataset.sidebarCollapsed !== 'true'); });
    ctx.on('demo-controls', () => dialog('Prototype controls', `${note('These switches affect only this browser’s demo. They are not WordPress role management, production permissions or a service-health console.')}${field('Simulated role', 'role', store.role, { options: ['Super Admin', 'Admin'] })}${field('Scenario', 'scenario', store.scenario, { options: [['normal', 'Normal'], ['slow-save', 'Slow save'], ['save-failure', 'Save failure'], ['validation-failure', 'Validation failure'], ['unavailable', 'Service unavailable'], ['verification', 'Recent verification required'], ['large-broadcast', 'Large broadcast audience']] })}<div class="actions mt">${button('Export demo data', 'demo-export', { icon: 'download' })}${button('Reset demo data', 'demo-reset', { danger: true, icon: 'refresh' })}</div>`, { confirm: 'Apply simulation', onConfirm: v => { store.setRole(v.role); store.setScenario(v.scenario); render(); toast('Demo controls changed. No real authority or service was modified.'); }, onMount: d => { d.querySelector('[data-action=demo-export]').onclick = () => download('wizly-admin-demo-data.json', JSON.stringify(store.getDB(), null, 2)); d.querySelector('[data-action=demo-reset]').onclick = () => { d.close(); dialog('Reset this prototype', note('This removes only Demo-V2’s local data and recovery drafts. The original Demo and every remote repository file remain unchanged.', 'warning'), { typed: 'RESET', confirm: 'Reset local data', danger: true, onConfirm: () => { store.resetDemo(); sessions.clear(); views.clear(); clearModels(); navigate('/admin', true); toast('Local demo reset to its sample content.'); } }); }; } }));
    ctx.on('verify-again', () => { store.setScenario('normal'); render(); toast('Verification refreshed in the demo. Your draft is preserved; no publication was triggered.'); });
    ctx.on('recovery-download', () => { if (ctx.editing)
        download('recovered-draft.json', JSON.stringify(ctx.editing.draft, null, 2)); });
}
function render() {
    if (applying)
        return;
    applying = true;
    const oldScroll = document.querySelector('main')?.scrollTop || 0, oldNavScroll = document.querySelector('.nav')?.scrollTop || 0;
    destroyEditors();
    current = makeContext();
    registerGlobal(current);
    let body;
    try {
        body = page(current);
    }
    catch (e) {
        console.error('Page render failed', e);
        body = `${heading('This view could not open', 'Your stored demo data has not been discarded.', '', 'WIZLY STUDIO')}${note(e.message, 'warning')}${button('Prototype controls', 'demo-controls')}`;
    }
    const prefs = store.getPreferences();
    const n = GROUPS.flatMap(x => x[1]).find(x => isActive(x[1], current));
    const title = n?.[0] || 'Authoring workspace';
    const recovered = current.editing?.recovered ? note('A browser recovery draft was restored. The saved record is unchanged until you save.', 'warning') : '';
    $app.innerHTML = `<a class="focus-only" href="#main-content">Skip to content</a><div class="app"><aside class="sidebar"><a class="brand" href="/admin" data-nav><img src="/icon.svg" alt=""/><div><strong>Wizly<span class="muted"> Studio</span></strong><small>ADMIN WORKSPACE</small></div></a><nav class="nav" aria-label="Grouped administration">${nav(current)}</nav><div class="sidebar-foot"><span class="avatar">${store.role === 'Super Admin' ? 'VK' : 'DA'}</span><div><strong>${store.role === 'Super Admin' ? 'Demo owner' : 'Demo author'}</strong><small>${esc(store.role)} · local only</small></div></div></aside><div class="body"><header class="topbar"><div class="crumb"><button class="icon-btn" data-action="collapse" aria-label="Collapse navigation">${icon('grid')}</button><span>Administration</span>${icon('arrow')}<strong>${esc(title)}</strong></div><div class="top-actions"><span class="prototype-tag">Frontend prototype</span><button class="btn small" data-action="appearance">${icon('layers')}<span data-theme-name>${THEMES.find(t => t[0] === prefs.theme)?.[1] || 'Atlas'}</span></button><button class="icon-btn" data-action="mode" aria-label="Switch to ${prefs.mode === 'dark' ? 'light' : 'dark'} mode">${icon(prefs.mode === 'dark' ? 'sun' : 'moon')}</button><button class="btn small" data-action="demo-controls">${icon('settings')}Demo controls</button><span class="avatar" title="${esc(store.role)}">${store.role === 'Super Admin' ? 'VK' : 'DA'}</span></div></header><main id="main-content" tabindex="-1"><div class="page">${store.storageIssue ? note(store.storageIssue, 'warning') : ''}${store.scenario === 'verification' ? `<div class="scenario-banner">${icon('lock')}Recent verification required. Your editing remains here.${button('Verify again', 'verify-again', { small: true })}</div>` : store.scenario !== 'normal' ? `<div class="scenario-banner">${icon('alert')}Simulation active: ${esc(store.scenario)}. Change it in Demo controls.</div>` : ''}${recovered}${body}<footer class="page-footnote">${icon('shield')} Local prototype · no production changes · groups are navigation labels, not URL prefixes.</footer></div></main></div></div>`;
    document.querySelector('main').scrollTop = lastPath === current.path ? oldScroll : 0;
    document.querySelector('.nav').scrollTop = oldNavScroll;
    lastPath = current.path;
    locationKey = location.pathname + location.search;
    for (const fn of current.after)
        try {
            fn(document.querySelector('main'));
        }
        catch (e) {
            console.error(e);
            toast('A control could not initialize: ' + e.message, true);
        }
    const bound = current;
    mountSplitters(document.querySelector('main'));
    mountEditors(document.querySelector('main'), bound.codeScope, (name, value) => { if (bound.target) {
        setPath(bound.target, name, value);
        bound.fieldChanged?.(name);
    } }, name => { let value = bound.target; return name.split('.').map(part => { value = value?.[part]; return /^\d+$/.test(part) && value && typeof value === 'object' ? (value.id || value.path || value.language || part) : part; }).join('/'); });
    document.title = `${document.querySelector('main h1')?.textContent || title} · Wizly Studio`;
    applying = false;
}
async function dispatch(action, id) { const fn = current?.handlers.get(action); if (!fn)
    return; try {
    await fn(id);
}
catch (e) {
    if (!String(e.message).startsWith('CONFLICT'))
        toast(e.message || String(e), true);
} }
$app.addEventListener('click', e => { const a = e.target.closest('a[data-nav]'); if (a && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    e.preventDefault();
    navigate(a.getAttribute('href'));
    return;
} const b = e.target.closest('[data-action]'); if (b && !b.disabled) {
    e.preventDefault();
    dispatch(b.dataset.action, b.dataset.id);
} });
function fieldValue(el, old) { if (el.type === 'checkbox')
    return el.checked; if (typeof old === 'boolean')
    return el.value === 'true'; if (el.type === 'number' && typeof old === 'number')
    return el.value === '' ? '' : Number(el.value); return el.value; }
function updateField(el) { if (!current?.target)
    return; const path = el.dataset.field; if (!path)
    return; try {
    const old = getPath(current.target, path);
    setPath(current.target, path, fieldValue(el, old));
    current.fieldChanged?.(path);
}
catch (e) {
    toast(e.message, true);
} }
$app.addEventListener('input', e => { const el = e.target; if (el.matches('[data-field]') && !['checkbox', 'radio'].includes(el.type) && el.tagName !== 'SELECT')
    updateField(el); if (el.matches('input[data-change]') && el.type !== 'file')
    current?.changes.get(el.dataset.change)?.(el.value); });
$app.addEventListener('change', e => { const el = e.target; if (el.matches('[data-field]') && (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio'))
    updateField(el); if (el.matches('[data-change]') && !(el.tagName === 'INPUT' && el.type !== 'file'))
    current?.changes.get(el.dataset.change)?.(el.value, el); });
window.addEventListener('popstate', () => { render(); });
window.addEventListener('beforeunload', e => { if (current?.editing?.dirty) {
    store.recoverDraft(current.editing.table, current.editing.draft.id, current.editing.draft);
    e.preventDefault();
    e.returnValue = '';
} });
window.addEventListener('storage', () => { if (current?.editing?.dirty) {
    toast('Another tab changed saved demo data. Your current editing has not been overwritten.', true);
}
else
    render(); });
window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !document.querySelector('dialog[open]')) {
    e.preventDefault();
    dispatch('author-save');
} });
setInterval(() => { if (store.getDB().broadcasts.some(b => b.status === 'Delivering')) {
    pumpBroadcasts();
    if (location.pathname === '/admin/broadcasts/history' && !document.querySelector('dialog[open]'))
        render();
} }, 1200);
if (location.pathname === '/' || !location.pathname.startsWith('/admin'))
    history.replaceState({}, '', '/admin');
render();
