import { esc, icon, badge, button, field, note, markdown, download } from './ui.js';
import { clone, fingerprint, checksFor, canPublish, contentOf } from './model.js';
import * as store from './store.js';
import { now } from './data.js';
export function editorHeader(s, back, subtitle = '') {
    const d = s.draft;
    const valid = canPublish(d, s.validation, checksFor(s.table, d, store.getDB()));
    return `<div class="editor-heading"><div class="editor-title"><a class="icon-btn" href="${esc(back)}" data-nav aria-label="Back to list">${icon('back')}</a><div><div class="eyebrow">${esc(subtitle || 'Content authoring')}</div><h1 data-editor-title>${esc(d.title || 'Untitled draft')}</h1></div>${badge(d.status)}</div><div class="actions"><span class="save-state" data-save-state>${icon(s.dirty ? 'clock' : 'check')}${s.saving ? 'Saving…' : s.dirty ? 'Unsaved changes' : 'Saved in this browser'}</span>${button('Preview', 'author-preview', { icon: 'eye' })}${button(s.saving ? 'Saving…' : 'Save draft', 'author-save', { icon: 'save', disabled: s.saving })}${button(store.role === 'Super Admin' ? (d.live ? 'Update demo' : 'Publish demo') : 'Submit for approval', 'author-publish', { primary: true, icon: 'upload', disabled: !valid || s.saving })}${button('More', 'author-more', { icon: 'dots' })}</div></div>`;
}
export function sectionNav(items, selected) { return `<nav class="section-nav" aria-label="Authoring sections">${items.map(([key, label]) => `<button data-action="author-tab" data-id="${key}" class="${selected === key ? 'active' : ''}">${esc(label)}</button>`).join('')}</nav>`; }
export function validationPanel(s) {
    const checks = checksFor(s.table, s.draft, store.getDB());
    const good = checks.filter(c => c.ok).length;
    const current = s.validation?.fingerprint === fingerprint(s.draft);
    let state = s.validating ? 'Checking' : s.validation ? (current ? s.validation.state : 'Needs recheck') : 'Not checked';
    return `<aside class="inspector"><section class="card"><div class="section-head"><h3>Ready to publish?</h3>${badge(`${good}/${checks.length}`)}</div><div class="progress"><i style="--progress:${checks.length ? good / checks.length * 100 : 0}%"></i></div><ul class="check-list">${checks.filter(c => !c.ok).slice(0, 5).map(c => `<li><span class="fail">${icon('alert')}</span><a href="#${esc(c.section)}" data-action="author-tab" data-id="${esc(c.section)}">${esc(c.label)}</a></li>`).join('')}${good === checks.length ? `<li><span class="pass">${icon('check')}</span>Required content is complete.</li>` : ''}</ul><div class="validation-status">${badge(state, state === 'Passed' ? 'success' : state === 'Failed' ? 'danger' : state === 'Not checked' ? 'muted' : 'warning')}<small>${s.validating ? 'Checking the captured draft…' : state === 'Needs recheck' ? 'The draft changed after the last check. Validate these changes.' : state === 'Passed' ? 'Current content checks passed. Execution outcomes below are simulated.' : 'Validate every offered language and its test cases before publication.'}</small></div>${button(s.validating ? 'Checking…' : 'Validate demo', 'author-validate', { icon: 'play', disabled: s.validating })}<p class="mt">Runtime checks are simulated. No compiler, real test runner or production service is connected.</p>${s.validation ? button('View check details', 'author-checks', { ghost: true, small: true, icon: 'arrow' }) : ''}</section><section class="card"><h3>Draft & live content</h3><p>Saving protects your draft. Only an authorized Publish or Update changes the demo’s live copy.</p><div class="stat-line"><span>Draft revision</span><b>${s.baseRevision}</b></div><div class="stat-line"><span>Live copy</span><b>${s.draft.live ? 'Available' : 'Not published'}</b></div><div class="stat-line"><span>Editing as</span><b>${esc(store.role)}</b></div>${s.draft.lastReason ? note(s.draft.lastReason, 'warning') : ''}</section></aside>`;
}
export function problemPreview(p) {
    return `<article class="preview-article">${badge(p.difficulty, 'accent')}<h2>${esc(p.title || 'Untitled problem')}</h2>${markdown(p.description)}<h3>Input</h3><p>${esc(p.inputDescription)}</p><h3>Output</h3><p>${esc(p.outputDescription)}</p><h3>Constraints</h3><p>${esc(p.constraints)}</p>${(p.cases || []).filter(c => c.visibility === 'Visible').map((c, i) => `<div class="example"><h3>Example ${i + 1}</h3><small>Input</small><pre>${esc(c.input)}</pre><small>Expected output</small><pre>${esc(c.expected)}</pre><p>${esc(c.explanation)}</p></div>`).join('')}<p class="mt">${(p.cases || []).filter(c => c.visibility === 'Hidden').length} hidden test cases. Hidden data and private reference code are not included in this preview.</p></article>`;
}
export function wireAuthoring(ctx, s, options = {}) {
    ctx.editing = s;
    ctx.fields(s.draft, (path) => { ctx.markDirty(s); options.onField?.(path); });
    ctx.codeScope = `${s.table}/${s.draft.id}`;
    ctx.on('author-tab', key => { s.section = key; ctx.render(); });
    ctx.on('author-save', async () => { await save(ctx, s); });
    ctx.on('author-preview', () => ctx.dialog('Learner preview', options.preview ? options.preview() : s.table === 'problems' ? problemPreview(s.draft) : `<article class="preview-article"><h2>${esc(s.draft.title)}</h2>${markdown(s.draft.description || s.draft.answer || s.draft.fact || '')}</article>`, { large: true, closeLabel: 'Return to editing' }));
    ctx.on('author-validate', async () => {
        const captured = clone(s.draft), capturedFP = fingerprint(captured), checks = checksFor(s.table, captured, store.getDB());
        s.validating = true;
        ctx.render();
        await new Promise(r => setTimeout(r, 650));
        const state = store.scenario === 'unavailable' ? 'Unavailable' : checks.some(c => !c.ok) || store.scenario === 'validation-failure' ? 'Failed' : 'Passed';
        const langs = s.table === 'problems' ? captured.languages.map(l => l.language) : s.table === 'papers' ? captured.sections.flatMap(x => x.questions).filter(x => x.type === 'coding').flatMap(x => x.code.languages.map(l => l.language)) : s.table === 'templates' ? [captured.runtime] : [];
        s.validation = { fingerprint: capturedFP, state, at: now(), simulated: true, checks, execution: langs.map((language, i) => ({ language, reference: state === 'Passed' ? (s.table === 'templates' ? 'Simulated run / preview pass' : 'Simulated reference pass') : state === 'Unavailable' ? 'Not run' : i === 0 ? 'Simulated failure' : 'Not run', starter: state === 'Passed' ? (s.table === 'templates' ? 'Simulated starter ready' : 'Simulated expected failure') : 'Not established' })) };
        s.validating = false;
        ctx.render();
        ctx.toast(state === 'Passed' ? 'Demo checks passed for that draft. No real code was executed.' : state === 'Unavailable' ? 'Simulation: validation service unavailable. Draft preserved.' : 'Checks need attention. The draft is preserved.', state !== 'Passed');
    });
    ctx.on('author-checks', () => ctx.dialog('Validation details', `${note('These are a workflow simulation, not proof of execution.')}<div class="validation-status">${badge(s.validation?.state || 'Not checked')}<small>${esc(s.validation?.at)}</small></div><ul class="check-list">${(s.validation?.checks || []).map(c => `<li>${icon(c.ok ? 'check' : 'alert')}<span>${esc(c.label)}</span></li>`).join('')}</ul>${(s.validation?.execution || []).map(r => `<div class="stat-line"><b>${esc(r.language)}</b><span>${esc(r.reference)} · ${esc(r.starter)}</span></div>`).join('')}`, { large: true, closeLabel: 'Back to editor' }));
    ctx.on('author-publish', async () => {
        if (s.dirty)
            await save(ctx, s, false);
        if (s.dirty)
            throw Error('New edits were made while saving. Save and validate the current draft.');
        const superAdmin = store.role === 'Super Admin';
        ctx.dialog(superAdmin ? (s.draft.live ? 'Update published content' : 'Publish demo content') : 'Submit for approval', `<p>${superAdmin ? 'The current validated draft becomes the live copy in this browser only. Existing learner history would remain protected in the real product.' : 'Submit this exact draft for Super Admin review. It will not replace published content yet.'}</p>${s.table === 'subjects' ? note('Published course changes notify learners in the real product. This prototype records the event locally; nothing is sent.') : ''}`, { confirm: superAdmin ? (s.draft.live ? 'Update demo' : 'Publish demo') : 'Submit draft', onConfirm: () => { const saved = superAdmin ? store.publishRecord(s.table, s.draft, s.validation) : store.submitRecord(s.table, s.draft, s.validation); s.draft = saved; s.baseRevision = saved.revision; s.dirty = false; store.clearRecovery(s.table, saved.id); ctx.render(); ctx.toast(superAdmin ? 'Published in the local demo.' : 'The exact draft is waiting for review.'); } });
    });
    ctx.on('author-more', () => {
        const allowUnpublish = ['problems', 'tracks', 'kb'].includes(s.table) && s.draft.status === 'Published' && s.draft.kind !== 'daily';
        ctx.dialog('More actions', `<div class="stack">${note('These actions affect demo data in this browser only.')}<div class="actions">${button('Export draft', 'dialog-export', { icon: 'download' })}${button('Restore earlier draft', 'dialog-revisions', { icon: 'refresh', disabled: !(s.draft.history?.length) })}</div>${allowUnpublish ? button('Unpublish', 'dialog-unpublish', { disabled: store.role !== 'Super Admin' }) : ''}${s.draft.status !== 'Archived' ? button(s.draft.kind === 'daily' && s.draft.date <= new Date().toISOString().slice(0, 10) ? 'Void Daily' : 'Archive', 'dialog-archive', { disabled: store.role !== 'Super Admin' }) : ''}${button('Delete permanently', 'dialog-delete', { danger: true, disabled: store.role !== 'Super Admin' && (!!s.draft.live || s.draft.status !== 'Draft') })}</div>`, { onMount: dlg => {
                dlg.querySelector('[data-action="dialog-export"]').onclick = () => download(`${s.draft.title || 'draft'}.json`, JSON.stringify({ kind: s.table, items: [contentOf(s.draft)] }, null, 2));
                dlg.querySelector('[data-action="dialog-revisions"]').onclick = () => { dlg.close(); ctx.dialog('Earlier drafts', `${(s.draft.history || []).map((h, i) => `<div class="stat-line"><span>${esc(new Date(h.at).toLocaleString())}</span>${button('Restore to editor', 'restore-history', { id: String(i), small: true })}</div>`).join('')}`, { onMount: d => d.querySelectorAll('[data-action="restore-history"]').forEach(b => b.onclick = () => { Object.assign(s.draft, clone(s.draft.history[Number(b.dataset.id)].content)); ctx.markDirty(s); d.close(); ctx.render(); ctx.toast('Earlier content restored into the editor, not published.'); }) }); };
                for (const [action, op] of [['dialog-unpublish', 'Unpublish'], ['dialog-archive', s.draft.kind === 'daily' && s.draft.date <= new Date().toISOString().slice(0, 10) ? 'Void' : 'Archive'], ['dialog-delete', 'Delete']]) {
                    const btn = dlg.querySelector(`[data-action="${action}"]`);
                    if (btn)
                        btn.onclick = () => { dlg.close(); ctx.dialog(`${op} ${s.draft.title || 'draft'}`, `<p>${op === 'Delete' ? 'This permanently removes the authored demo item. There is no Trash.' : 'This changes availability without discarding earned history.'} ${s.table === 'tracks' ? 'Its independently owned child problems are included. Other domains are untouched.' : ''}</p>${note('Learner records are not loaded in this admin-only prototype. Production dependency and active-work checks still need backend verification.', 'warning')}`, { confirm: op, typed: op === 'Delete' ? s.draft.title || 'DELETE' : undefined, reason: op === 'Void', danger: true, onConfirm: values => { store.lifecycle(s.table, s.draft, op, values.reason); ctx.dropSession(s); ctx.navigate(options.back || '/admin', true); ctx.toast(`${op} completed in the demo.`); } }); };
                }
            } });
    });
    ctx.on('author-reload', () => { const fresh = store.getDB()[s.table].find(x => x.id === s.draft.id); if (!fresh)
        throw Error('The saved item no longer exists.'); s.draft = clone(fresh); s.baseRevision = fresh.revision; s.dirty = false; s.validation = fresh.validation; store.clearRecovery(s.table, fresh.id); ctx.render(); });
}
export async function save(ctx, s, showToast = true) {
    const captured = clone(s.draft), atStart = fingerprint(captured);
    s.saving = true;
    ctx.render();
    await new Promise(r => setTimeout(r, store.scenario === 'slow-save' ? 1100 : 120));
    try {
        if (store.role === 'Super Admin' && store.scenario === 'verification')
            store.requireSuper();
        const saved = store.saveRecord(s.table, captured, s.baseRevision);
        const unchanged = fingerprint(s.draft) === atStart;
        if (unchanged)
            s.draft = saved;
        else {
            s.draft.revision = saved.revision;
            s.draft.live = saved.live;
            s.draft.status = saved.status;
        }
        s.baseRevision = saved.revision;
        s.dirty = !unchanged;
        if (unchanged)
            store.clearRecovery(s.table, saved.id);
        s.saving = false;
        ctx.render();
        if (showToast)
            ctx.toast(unchanged ? 'Draft saved in this browser.' : 'Earlier edits saved. Your newer typing still needs saving.');
        return saved;
    }
    catch (e) {
        s.saving = false;
        ctx.render();
        if (String(e.message).startsWith('CONFLICT'))
            ctx.dialog('A newer draft was saved', `<p>Your edits are still in this editor. Another tab changed the saved draft.</p>${note('Reload discards this editor’s changes. Download preserves a separate recovery file.', 'warning')}`, { confirm: 'Keep my edits & replace', onConfirm: async () => { s.baseRevision = store.getDB()[s.table].find(r => r.id === s.draft.id)?.revision; await save(ctx, s); }, onMount: dlg => { const box = document.createElement('div'); box.className = 'actions'; box.innerHTML = `${button('Download my draft', 'recovery-download', { icon: 'download' })}${button('Load saved version', 'recovery-reload')}`; dlg.querySelector('.dialog-body').append(box); box.querySelector('[data-action="recovery-download"]').onclick = () => download('draft-recovery.json', JSON.stringify(s.draft, null, 2)); box.querySelector('[data-action="recovery-reload"]').onclick = () => { s.draft = clone(store.getDB()[s.table].find(r => r.id === s.draft.id)); s.baseRevision = s.draft.revision; s.dirty = false; dlg.close(); ctx.render(); }; } });
        else
            ctx.toast(e.message, true);
        throw e;
    }
}
