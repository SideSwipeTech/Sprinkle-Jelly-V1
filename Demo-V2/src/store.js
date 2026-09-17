import { createSeed, now, id } from './data.js';
import { clone, fingerprint, contentOf, canPublish, checksFor } from './model.js';
const KEY = 'wizly.demo.v2.data';
const PREFERENCES = 'wizly.demo.v2.preferences';
export let storageIssue = '';
let db;
function initial() { const seed = createSeed(); for (const table of ['problems', 'tracks', 'papers', 'subjects', 'templates', 'kb'])
    for (const r of seed[table])
        if (r.status === 'Published')
            r.live = contentOf(r); return seed; }
try {
    const text = localStorage.getItem(KEY);
    db = text ? JSON.parse(text) : initial();
    if (db.version !== 1 || !Array.isArray(db.problems) || !Array.isArray(db.audit))
        throw Error('Unsupported local data format.');
    if (!text)
        localStorage.setItem(KEY, JSON.stringify(db));
}
catch (e) {
    storageIssue = 'Stored demo data could not be read. Your browser copy has not been overwritten. Reset the demo to start again.';
    db = initial();
}
export function getDB() { return db; }
let preferenceMemory;
export function getPreferences() {
    if (!preferenceMemory) {
        const defaults = { theme: 'atlas', mode: 'dark', role: 'Super Admin', reducedMotion: false };
        try { preferenceMemory = { ...defaults, ...JSON.parse(localStorage.getItem(PREFERENCES) || '{}') }; }
        catch { preferenceMemory = defaults; }
    }
    return { ...preferenceMemory };
}
export function preferences(values) {
    const next = { ...getPreferences(), ...values };
    preferenceMemory = next;
    try { localStorage.setItem(PREFERENCES, JSON.stringify(next)); }
    catch { storageIssue = 'Appearance applies for this visit, but browser storage is unavailable.'; }
    return next;
}
export let role = getPreferences().role;
export let scenario = 'normal';
export const setRole = v => { role = v; preferences({ role: v }); };
export const setScenario = v => { scenario = v; };
export function requireSuper() { if (role !== 'Super Admin')
    throw Error('Super Admin is required for this action. Admin can prepare drafts.'); if (scenario === 'verification')
    throw Error('Recent verification is required. Your unsaved work is kept. Use “Verify again” in the demo controls.'); }
export function update(mutator, action, target, privileged = false) {
    if (privileged)
        requireSuper();
    if (scenario === 'save-failure')
        throw Error('Simulated save failure. Nothing was committed; your edits are still here.');
    if (storageIssue)
        throw Error(storageIssue);
    let latest;
    try {
        latest = JSON.parse(localStorage.getItem(KEY) || 'null') || db;
    }
    catch {
        throw Error('Local data could not be read; no write was performed.');
    }
    const next = clone(latest);
    const result = mutator(next);
    if (action)
        next.audit.unshift({ id: id('audit'), action, target: String(target || ''), actor: role === 'Super Admin' ? 'Demo owner' : 'Demo author', at: now(), reason: typeof result === 'string' ? result : '' });
    next.savedAt = now();
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    }
    catch {
        throw Error('Browser storage is full or unavailable. This operation was not saved. Export a recovery copy before clearing anything.');
    }
    db = next;
    window.dispatchEvent(new Event('demo-data-change'));
    return result;
}
export function createRecord(table, record) { update(d => { d[table].push(clone(record)); }, 'Created draft', record.title || record.id); return record; }
export function saveRecord(table, record, expectedRevision) {
    const captured = clone(record);
    let saved;
    update(d => { const i = d[table].findIndex(x => x.id === captured.id); if (i < 0)
        throw Error('This item no longer exists. Your editor copy is retained.'); const current = d[table][i]; if (current.revision !== expectedRevision)
        throw Error('CONFLICT: A newer saved version exists. Keep your edits, reload the saved item, or explicitly replace that version.'); const changed = fingerprint(current) !== fingerprint(captured); const history = [...(current.history || [])]; if (changed)
        history.unshift({ at: now(), content: contentOf(current) }); saved = { ...captured, live: current.live, history: history.slice(0, 10), revision: current.revision + 1, updated: now() }; if (changed) {
        delete saved.validation;
        delete saved.submitted;
        if (saved.status === 'Submitted')
            saved.status = saved.live ? 'Published' : 'Draft';
    } d[table][i] = saved; }, 'Saved draft', captured.title || captured.id);
    return clone(saved);
}
export function publishRecord(table, record, validation) {
    requireSuper();
    if (record.kind === 'daily' && record.live && record.live.date <= new Date().toISOString().slice(0, 10)) {
        const locked = ['date', 'bonus', 'difficulty', 'languages', 'cases', 'comparison', 'timeMs', 'memoryMiB', 'sqlSchema', 'sqlDataset', 'rowOrder', 'tolerance'];
        if (locked.some(k => JSON.stringify(record[k]) !== JSON.stringify(record.live[k])))
            throw Error('This Daily date has begun. Its grading, language, date and reward conditions are locked. Use Void Daily for a critical defect.');
    }
    const checks = checksFor(table, record, getDB());
    if (!canPublish(record, validation, checks))
        throw Error('Validate the current draft before publishing. Old or incomplete checks cannot publish this content.');
    let saved;
    update(d => { const i = d[table].findIndex(r => r.id === record.id); if (i < 0)
        throw Error('Item not found.'); if (d[table][i].revision !== record.revision)
        throw Error('The stored draft changed. Save or reload before publishing.'); saved = { ...clone(record), status: 'Published', live: contentOf(record), validation: clone(validation), submitted: null, revision: record.revision + 1, updated: now() }; d[table][i] = saved; }, record.live ? 'Updated live content' : 'Published content', record.title, true);
    return clone(saved);
}
export function submitRecord(table, record, validation) {
    if (!canPublish(record, validation, checksFor(table, record, getDB())))
        throw Error('Validate the current draft before submitting it for approval.');
    let saved;
    update(d => { const i = d[table].findIndex(r => r.id === record.id); if (d[table][i]?.revision !== record.revision)
        throw Error('The saved draft changed; reload it before submitting.'); saved = { ...clone(record), status: 'Submitted', validation: clone(validation), submitted: { fingerprint: fingerprint(record), at: now() }, revision: record.revision + 1, updated: now() }; d[table][i] = saved; }, 'Submitted for approval', record.title);
    return clone(saved);
}
export function lifecycle(table, record, action, reason = '') {
    if (action !== 'Delete' || record.live || record.status !== 'Draft')
        requireSuper();
    if (record.kind === 'daily' && record.date <= new Date().toISOString().slice(0, 10) && record.live && action !== 'Void')
        throw Error('A begun Daily is protected. Use Void Daily for a critical defect; its date and earned records remain.');
    if (action === 'Unpublish' && (record.kind === 'daily' || !['problems', 'tracks', 'kb'].includes(table)))
        throw Error('This content type does not support Unpublish.');
    update(d => { const i = d[table].findIndex(x => x.id === record.id); if (i < 0)
        throw Error('This item no longer exists.'); if (d[table][i].revision !== record.revision)
        throw Error('This item changed after the action was opened. Review the current item first.'); if (action === 'Delete') {
        d[table].splice(i, 1);
        if (table === 'tracks')
            d.problems = d.problems.filter(p => p.trackId !== record.id);
    }
    else {
        d[table][i].status = action === 'Unpublish' ? 'Draft' : action === 'Void' ? 'Voided' : 'Archived';
        d[table][i].revision++;
        delete d[table][i].submitted;
    } return reason; }, action, record.title);
}
export function approve(table, record, accept, reason = '') {
    requireSuper();
    if (!record.submitted)
        throw Error('No submitted draft is waiting for review.');
    if (record.submitted.fingerprint !== fingerprint(record))
        throw Error('This draft changed after submission. Request renewed review.');
    if (accept)
        return publishRecord(table, record, record.validation);
    update(d => { const row = d[table].find(x => x.id === record.id); if (!row || row.revision !== record.revision || !row.submitted) throw Error('The submission changed before review. Reload the current draft.'); row.status = row.live ? 'Published' : 'Draft'; delete row.submitted; row.lastReason = reason; row.revision++; return reason; }, 'Rejected submission', record.title, true);
}
export function resetDemo() { const next = initial(); localStorage.setItem(KEY, JSON.stringify(next)); for (const key of Object.keys(localStorage))
    if (key.startsWith('wizly.demo.v2.draft.'))
        localStorage.removeItem(key); db = next; storageIssue = ''; scenario = 'normal'; window.dispatchEvent(new Event('demo-data-change')); }
export function recoverDraft(table, id, record) { try {
    localStorage.setItem(`wizly.demo.v2.draft.${table}.${id}`, JSON.stringify({ at: now(), record }));
    return true;
}
catch {
    return false;
} }
export function readRecovery(table, id) { try {
    return JSON.parse(localStorage.getItem(`wizly.demo.v2.draft.${table}.${id}`) || 'null');
}
catch {
    return null;
} }
export function clearRecovery(table, id) { try {
    localStorage.removeItem(`wizly.demo.v2.draft.${table}.${id}`);
}
catch { /* A retained recovery copy is harmless; its revision is checked on use. */ } }
window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) {
    try {
        const next = JSON.parse(e.newValue);
        if (next.version === 1) {
            db = next;
            window.dispatchEvent(new Event('demo-data-change'));
        }
    }
    catch {
        storageIssue = 'Another tab wrote unreadable demo data. No draft was replaced.';
    }
} });
