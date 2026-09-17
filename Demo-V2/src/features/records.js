import { esc, icon, button, link, badge, field, section, heading, table, empty, note, metric, download, csv } from '../ui.js';
import { id, now } from '../data.js';
import { clone } from '../model.js';
import * as store from '../store.js';
export function renderRecords(ctx) { if (ctx.path.startsWith('/admin/certificates'))
    return certificates(ctx); if (ctx.path.startsWith('/admin/topic-requests'))
    return requests(ctx); if (ctx.path.startsWith('/admin/broadcasts'))
    return broadcasts(ctx); return economy(ctx); }
function certificates(ctx) {
    const parts = ctx.path.split('/').filter(Boolean), view = parts[2];
    const row = ctx.db.certificates.find(c => c.id === view);
    const items = view === 'name-corrections' ? ctx.db.certificates.filter(c => c.proposalState === 'Pending') : view === 'parked-generations' ? ctx.db.certificates.filter(c => c.status === 'Generation failed') : ctx.db.certificates;
    function act(c, type) {
        const name = type === 'approve-name' ? 'Approve proposed name' : type === 'reject-name' ? 'Reject proposed name' : type === 'reissue' ? 'Reissue certificate' : type === 'retry' ? 'Retry generation' : 'Revoke certificate';
        const body = type === 'approve-name' ? `<p>Approve exactly <strong>${esc(c.proposal)}</strong>, as proposed by the learner. The already-issued document remains unchanged until a separate reissue.</p>` : type === 'reissue' ? `<p>Reissue with <strong>${esc(c.approvedName || c.name)}</strong>. The existing document remains usable if replacement fails.</p>` : type === 'retry' ? `<p>Retry the same earned credential. This cannot create another award.</p>` : type === 'revoke' ? field('Permitted ground', 'ground', 'Invalid award record', { options: ['Invalid award record', 'Confirmed payment reversal', 'Completed account erasure'] }) : '<p>Keep the existing approved name and supply a learner-safe reason.</p>';
        ctx.dialog(name, body, { typed: ['revoke', 'reissue'].includes(type) ? c.title : undefined, reason: ['reject-name', 'revoke'].includes(type), confirm: name, danger: type === 'revoke', onConfirm: values => { store.requireSuper(); if (['retry', 'reissue'].includes(type) && store.scenario === 'unavailable')
                throw Error('Simulated generation failure. The existing certificate is unchanged.'); store.update(db => { const r = db.certificates.find(x => x.id === c.id); if (type === 'approve-name') {
                if (r.proposalState !== 'Pending')
                    throw Error('This proposal was already decided.');
                r.approvedName = r.proposal;
                r.proposalState = 'Approved';
                r.history.push(`Approved proposed name: ${r.proposal}. Issued document unchanged.`);
            } if (type === 'reject-name') {
                r.proposalState = 'Rejected';
                r.history.push(`Name correction rejected: ${values.reason}`);
            } if (type === 'reissue') {
                if (r.status !== 'Issued')
                    throw Error('Only an issued valid certificate can be reissued.');
                r.name = r.approvedName || r.name;
                r.history.push('Document reissued in the demo. Award identity preserved.');
            } if (type === 'retry') {
                if (r.status !== 'Generation failed')
                    throw Error('This generation is not failed.');
                r.status = 'Issued';
                r.issued = new Date().toISOString().slice(0, 10);
                r.history.push('Generation retry simulated successfully.');
            } if (type === 'revoke') {
                if (r.status === 'Revoked')
                    throw Error('Already revoked.');
                r.status = 'Revoked';
                r.history.push(`${values.ground}: ${values.reason}`);
            } }, name, c.title, true); ctx.render(); ctx.toast(`${name} recorded in the local demo.`); } });
    }
    ctx.on('certificate-action', (value) => { const [rid, type] = value.split(':'); const c = ctx.db.certificates.find(x => x.id === rid); if (c)
        act(c, type); });
    const controls = c => `<div class="actions">${c.proposalState === 'Pending' ? button('Approve name', 'certificate-action', { id: `${c.id}:approve-name`, small: true, disabled: store.role !== 'Super Admin' }) + button('Reject', 'certificate-action', { id: `${c.id}:reject-name`, small: true, disabled: store.role !== 'Super Admin' }) : ''}${c.status === 'Generation failed' ? button('Retry generation', 'certificate-action', { id: `${c.id}:retry`, small: true, disabled: store.role !== 'Super Admin' }) : ''}${c.status === 'Issued' ? button('Reissue', 'certificate-action', { id: `${c.id}:reissue`, small: true, disabled: store.role !== 'Super Admin' }) + button('Revoke', 'certificate-action', { id: `${c.id}:revoke`, small: true, danger: true, disabled: store.role !== 'Super Admin' }) : ''}</div>`;
    if (row)
        return `${heading(row.title, 'A credential record, not a manual award or score editor.', link('Back to Certificates', '/admin/certificates', 'btn'), 'PERSONAL / CERTIFICATES')}${section('record', 'Certificate record', 'Fictional data for reviewing the administration workflow.', `<div class="grid-two"><div><div class="stat-line"><span>Learner</span><b>${esc(row.person)}</b></div><div class="stat-line"><span>Printed name</span><b>${esc(row.name)}</b></div><div class="stat-line"><span>Status</span>${badge(row.status)}</div><div class="stat-line"><span>Issued</span><b>${esc(row.issued || 'Not issued yet')}</b></div></div><div>${row.proposal ? note(`Name proposal: ${row.proposal} · ${row.proposalState}`) : ''}${controls(row)}</div></div>`)}${section('history', 'Status history', 'Original award identity is preserved.', `<div class="timeline">${row.history.map(h => `<div><strong>${esc(h)}</strong></div>`).join('')}</div>`)}`;
    return `${heading(view === 'name-corrections' ? 'Certificate name corrections' : view === 'parked-generations' ? 'Failed certificate generation' : 'Certificates', 'Preserve awards and issued information. Use separate, explicit correction actions.', '', 'PERSONAL / ADMIN')}<div class="subnav-links">${link('All certificates', '/admin/certificates')}${link('Name corrections', '/admin/certificates/name-corrections')}${link('Generation recovery', '/admin/certificates/parked-generations')}</div>${items.length ? table(['Credential', 'Learner', 'Status', ''], items.map(c => [link(c.title, `/admin/certificates/${c.id}`, 'row-title'), esc(c.person), badge(c.status), controls(c)])) : empty('Nothing waiting', 'There are no records in this view.')}${note('No PDF generation or public verification service is connected. These are local workflow records.')}`;
}
const SETTINGS = [['easyXP', 'Easy solve · XP', 0, 500, 'Future reward occasions'], ['mediumXP', 'Medium solve · XP', 0, 500, 'Future reward occasions'], ['hardXP', 'Hard solve · XP', 0, 500, 'Future reward occasions'], ['extremeXP', 'Extreme solve · XP', 0, 500, 'Future reward occasions'], ['dailyBonus', 'Default Daily bonus · XP', 0, 200, 'Future authored Dailies'], ['subjectXP', 'Written subject completion · XP', 0, 1000, 'Future subject completions'], ['baseCredits', 'Monthly base Credits', 0, 5000, 'Future membership-month cycles'], ['continuationCredits', 'Continuation Credits', 0, 5000, 'Future membership-month cycles'], ['errorPrice', 'Explain error · Credits', 50, 200, 'Future confirmed AI requests'], ['passagePrice', 'Explain passage · Credits', 100, 300, 'Future confirmed AI requests'], ['analysisPrice', 'Analyse code · Credits', 200, 500, 'Future confirmed AI requests'], ['activeMinutes', 'Active minutes / item / day', 15, 480, 'Analytics-owned measurement'], ['easyEvidence', 'Easy practice-evidence value', 0, 100, 'Analytics-owned evidence'], ['mediumEvidence', 'Medium practice-evidence value', 0, 100, 'Analytics-owned evidence'], ['hardEvidence', 'Hard practice-evidence value', 0, 100, 'Analytics-owned evidence'], ['extremeEvidence', 'Extreme practice-evidence value', 0, 100, 'Analytics-owned evidence']];
function economy(ctx) {
    const view = ctx.path.split('/').at(-1);
    if (view === 'failed-rewards')
        return ctx.globalFeature('jobs', 'Reward');
    if (view === 'operations')
        return `${heading('Economy operations', 'Illustrative aggregate delivery and usage—not provider billing or learner rankings.', '', 'PERSONAL / ECONOMY')}${note('Sample current-cycle data. Generated help is not connected.')}<div class="metrics">${metric('Credits granted', '40,000', 'Current member cycles')}${metric('Charged for AI', '12,500', 'Confirmed sample responses')}${metric('Released / refunded', '1,200', 'Failed sample requests')}${metric('Cleared unused', '8,700', 'Completed sample cycles')}</div>${table(['Figure', 'Sample value', 'Window'], [['Continuation grants', '3', 'Current cycles'], ['Failed allowance grants', '0', 'Current cycles'], ['Failed rewards', String(ctx.db.jobs.filter(j => j.kind === 'Reward' && j.state === 'Failed').length), 'Current backlog']])}`;
    if (view === 'correction') {
        ctx.on('review-correction', () => {
            const root = document.querySelector('[data-correction]'), person = ctx.db.people.find(p => p.id === root.querySelector('[name=person]').value), kind = root.querySelector('[name=kind]').value, amount = Number(root.querySelector('[name=amount]').value), incident = root.querySelector('[name=incident]').value.trim(), direction = root.querySelector('[name=direction]').value;
            const max = kind === 'xp' ? 100000 : 10000;
            if (!person || !Number.isInteger(amount) || amount <= 0 || amount > max || !incident)
                throw Error(`Enter a learner, incident and a whole amount from 1–${max.toLocaleString()}.`);
            const delta = direction === 'Deduct' ? -amount : amount, next = person[kind] + delta;
            if (next < 0)
                throw Error('This correction would take the balance below zero. Nothing was changed.');
            ctx.dialog('Confirm accounting repair', table(['Current', 'Adjustment', 'Result'], [[String(person[kind]), String(delta), String(next)]]) + note('This repairs a verified incident. It is not a discretionary gift or a learner-score adjustment.'), { typed: person.title, reason: true, confirm: 'Apply repair', onConfirm: v => { store.update(d => { d.corrections ||= []; if (d.corrections.some(c => c.incident === incident && c.personId === person.id && c.kind === kind))
                    throw Error('This incident correction was already applied. Use a new recorded correction to repair it.'); const r = d.people.find(p => p.id === person.id); if (r[kind] !== person[kind])
                    throw Error('The balance changed. Review it again.'); r[kind] = next; d.corrections.push({ id: id('repair'), incident, personId: r.id, kind, delta, reason: v.reason, at: now() }); return v.reason; }, 'Repaired accounting entry', `${person.title} / ${incident}`, true); ctx.render(); ctx.toast('Demo repair recorded once.'); } });
        });
        return `${heading('Accounting correction', 'Repair a missing, duplicated or mispriced entry with a clear incident reference.', '', 'PERSONAL / ECONOMY')}${section('correction', 'One person, one verified repair', 'Original entries remain intact.', `<div data-correction><div class="form-grid">${field('Learner', 'person', '', { options: ctx.db.people.filter(p => p.role === 'User').map(p => [p.id, p.title]) })}${field('Ledger', 'kind', 'xp', { options: [['xp', 'XP'], ['credits', 'Credits']] })}${field('Direction', 'direction', 'Grant', { options: ['Grant', 'Deduct'] })}${field('Amount', 'amount', 0, { type: 'number', min: 1 })}${field('Incident reference', 'incident', '', { required: true, wide: true })}</div><div class="mt">${button('Review correction', 'review-correction', { primary: true, disabled: store.role !== 'Super Admin' })}</div></div>`)}`;
    }
    const state = ctx.view;
    if (!state.settings) {
        state.settings = { activeMinutes: 120, easyEvidence: 55, mediumEvidence: 70, hardEvidence: 85, extremeEvidence: 100, ...clone(ctx.db.settings) };
        state.saved = JSON.stringify(ctx.db.settings);
    }
    ctx.fields(state.settings);
    ctx.on('settings-review', () => { for (const [k, label, min, max] of SETTINGS) {
        const v = Number(state.settings[k]);
        if (!Number.isInteger(v) || v < min || v > max)
            throw Error(`${label}: enter a whole number from ${min}–${max}.`);
    } const changes = SETTINGS.filter(([k]) => state.settings[k] !== ctx.db.settings[k]); if (!changes.length) {
        ctx.toast('No changes to apply.');
        return;
    } ctx.dialog('Review configuration changes', table(['Setting', 'Current', 'Proposed', 'Applies to'], changes.map(([k, l, min, max, scope]) => [l, String(ctx.db.settings[k] ?? 'Default'), String(state.settings[k]), scope])) + note('Recorded tests, earned awards, active Credit cycles and already-confirmed requests keep their original conditions.'), { large: true, typed: 'APPLY', confirm: 'Apply demo settings', onConfirm: () => { if (JSON.stringify(store.getDB().settings) !== state.saved)
            throw Error('Settings changed in another tab. Reload and review again.'); store.update(d => { for (const [k] of SETTINGS)
            d.settings[k] = Number(state.settings[k]); }, 'Changed bounded settings', 'Economy / Analytics', true); state.saved = JSON.stringify(store.getDB().settings); ctx.render(); ctx.toast('Settings saved. No live AI or measurement service is connected.'); } }); });
    return `${heading('Economy configuration', 'One bounded source for rewards, allowances and action prices.', button('Review changes', 'settings-review', { primary: true, icon: 'check', disabled: store.role !== 'Super Admin' }), 'PERSONAL / ADMIN')}${note('These values are stored in this prototype; no live rewards or AI services are affected. Fixed Mock awards and the level curve are not editable here.')}${section('rewards', 'Awards & allowances', 'Changes affect future occasions only.', `<div class="form-grid">${SETTINGS.slice(0, 11).map(([k, l, min, max, scope]) => field(l, k, state.settings[k], { type: 'number', min, max, help: `${min}–${max.toLocaleString()} · ${scope}` })).join('')}</div>`)}${section('measurement', 'Analytics-owned measurement', 'These are evidence values, not XP rewards.', `<div class="form-grid">${SETTINGS.slice(11).map(([k, l, min, max, scope]) => field(l, k, state.settings[k], { type: 'number', min, max, help: `${min}–${max} · ${scope}` })).join('')}</div>`)}`;
}
function publishedTargets(db) { return [...db.problems.filter(p => p.status === 'Published').map(p => ({ url: p.kind === 'track' ? `/tracks/${p.trackId}/problems/${p.id}` : `/${p.kind === 'daily' ? 'daily-challenges' : p.kind === 'debug' ? 'debug-detective' : 'challenges'}/${p.kind === 'daily' ? p.date : p.id}`, title: p.title })), ...db.templates.filter(t => t.status === 'Published').map(t => ({ url: `/projects?template=${t.id}`, title: t.title })), ...db.subjects.filter(s => s.status === 'Published').map(s => ({ url: `/courses/${s.id}`, title: s.title }))]; }
function requests(ctx) {
    const v = ctx.view;
    ctx.onChange('request-search', x => { v.search = x; ctx.renderWithFocus('request-search'); });
    ctx.onChange('request-status', x => { v.status = x; ctx.render(); });
    const items = ctx.db.requests.filter(r => (!v.search || `${r.title} ${r.description}`.toLowerCase().includes(v.search.toLowerCase())) && (v.status && v.status !== 'Open queue' ? r.status === v.status : r.status !== 'Archived'));
    ctx.on('request-open', key => { const r = ctx.db.requests.find(x => x.id === key); const next = { Pending: ['Pending', 'Approved', 'Rejected'], Approved: ['Approved', 'Pending', 'Implemented', 'Rejected'], Rejected: ['Rejected', 'Pending'], Implemented: ['Implemented', 'Approved'], Archived: ['Archived'] }[r.status]; const targets = publishedTargets(ctx.db); ctx.dialog(r.title, `<p>${esc(r.description)}</p>${badge(r.area)}<div class="mt">${field('Status', 'status', r.status, { options: next, disabled: r.status === 'Archived' })}${field('Private team note', 'note', r.note, { textarea: true, disabled: r.status === 'Archived' })}${field('Published fulfilment content', 'target', r.target, { options: [['', 'No fulfilment yet'], ...targets.map(t => [t.url, t.title])], disabled: r.status === 'Archived' })}${field('Reason for reversal / rejection', 'reason', '', { textarea: true, rows: 2 })}</div>`, { confirm: r.status === 'Archived' ? undefined : 'Save review', onConfirm: values => { if (values.status === 'Implemented' && !targets.some(t => t.url === values.target))
            throw Error('Select published, accessible fulfilment content before marking Implemented.'); if ((values.status === 'Rejected' || (['Approved', 'Rejected'].includes(r.status) && values.status === 'Pending') || (r.status === 'Implemented' && values.status === 'Approved')) && !values.reason.trim())
            throw Error('A reason is required for this status change.'); if (r.status === 'Implemented' && values.target !== r.target)
            store.requireSuper(); store.update(d => { const row = d.requests.find(x => x.id === key); row.status = values.status; row.note = values.note; row.target = values.target; return values.reason; }, 'Reviewed Topic Request', r.title); ctx.render(); ctx.toast('Request updated. No real notification was sent.'); } }); });
    return `${heading('Topic Requests', 'Review learning-content requests without rewriting the learner’s words.', '', 'PERSONAL / ADMIN')}<div class="filterbar"><div class="search-box">${icon('search')}<input aria-label="Search requests" data-change="request-search" value="${esc(v.search || '')}" placeholder="Search titles and descriptions…"/></div><select data-change="request-status" aria-label="Request status">${['Open queue', 'Pending', 'Approved', 'Implemented', 'Rejected', 'Archived'].map(x => `<option ${x === v.status ? 'selected' : ''}>${x}</option>`).join('')}</select></div>${table(['Request', 'Area', 'Status', 'Received', ''], items.map(r => [`<strong class="row-title">${esc(r.title)}</strong><small>${esc(r.description)}</small>`, esc(r.area), badge(r.status), esc(r.created), button('Review', 'request-open', { id: r.id, small: true })]))}${note('Admin and Super Admin can review. Only learners withdraw a pending request; this screen has no delete, merge or assignment control.')}`;
}
export function pumpBroadcasts() { const active = store.getDB().broadcasts.filter(b => b.status === 'Delivering'); if (!active.length)
    return; try {
    store.update(db => { for (const b of db.broadcasts.filter(b => b.status === 'Delivering')) {
        const elapsed = (Date.now() - new Date(b.created).getTime()) / 1000;
        b.delivered = Math.min(b.eligible, Math.floor(elapsed * 18));
        if (b.delivered >= b.eligible)
            b.status = 'Delivered';
    } }, null, '');
}
catch { /* Simulation pauses while saving is unavailable; no delivery is claimed. */ } }
function broadcasts(ctx) {
    const history = ctx.path.endsWith('/history'), v = ctx.view;
    v.form ||= { title: '', message: '', icon: 'bell' };
    ctx.fields(v.form);
    ctx.on('send-broadcast', () => { if (!v.form.title.trim() || !v.form.message.trim())
        throw Error('A title and message are required.'); if (v.form.title.length > 120 || v.form.message.length > 2000)
        throw Error('This prototype accepts a title up to 120 and message up to 2,000 characters.'); const audience = store.scenario === 'large-broadcast' ? 6000 : 128; const copy = clone(v.form); const send = () => { store.update(d => { d.broadcasts.unshift({ id: id('broadcast'), ...copy, created: now(), audience, eligible: audience - 8, skipped: 8, delivered: 0, failed: 0, stopped: 0, status: 'Delivering', actor: store.role }); }, 'Sent demo broadcast', copy.title, true); v.form = { title: '', message: '', icon: 'bell' }; ctx.navigate('/admin/broadcasts/history', true); ctx.toast('Local delivery simulation started. No message leaves this browser.'); }; ctx.dialog('Review announcement', `<p>This System notice targets all eligible active learners in the demo. The estimate is an upper bound; notification preferences apply at delivery.</p><div class="preview-article"><h3>${esc(copy.title)}</h3><p>${esc(copy.message)}</p></div><div class="stat-line"><span>Estimated audience</span><b>${audience.toLocaleString()}</b></div>`, { confirm: audience >= 5000 ? 'Continue to final confirmation' : 'Simulate send', onConfirm: () => { store.requireSuper(); if (audience >= 5000) {
            setTimeout(() => ctx.dialog('Large audience confirmation', note('This exceeds 5,000 estimated recipients. Already delivered notices cannot be recalled.', 'warning'), { typed: 'SEND', confirm: 'Simulate send', onConfirm: send }), 0);
        }
        else
            send(); } }); });
    ctx.on('stop-broadcast', key => ctx.dialog('Stop remaining delivery', `<p>Already delivered notices remain. This cannot recall or edit them.</p>`, { reason: true, confirm: 'Stop remaining', danger: true, onConfirm: v => { store.update(d => { const b = d.broadcasts.find(x => x.id === key); if (b.status !== 'Delivering')
            throw Error('Delivery is no longer running.'); b.status = 'Stopped'; b.stopped = Math.max(0, b.eligible - b.delivered); b.stopReason = v.reason; }, 'Stopped demo broadcast', key, true); ctx.render(); } }));
    if (history)
        return `${heading('Broadcast history', 'Recorded sends, not a list of learner reading activity.', link('Compose announcement', '/admin/broadcasts', 'btn primary'), 'PLATFORM / NOTIFICATIONS')}${note('Delivery is simulated from a saved local start time. Reloading resumes the same record, not another send.')}${ctx.db.broadcasts.length ? table(['Announcement', 'Status', 'Delivered', 'Skipped / stopped', ''], ctx.db.broadcasts.map(b => [`<strong class="row-title">${esc(b.title)}</strong><small>${esc(new Date(b.created).toLocaleString())}</small>`, badge(b.status), `${b.delivered} / ${b.eligible}`, `${b.skipped} / ${b.stopped}`, b.status === 'Delivering' ? button('Stop remaining', 'stop-broadcast', { id: b.id, small: true, disabled: store.role !== 'Super Admin' }) : '<span class="muted">Read only</span>'])) : empty('No announcements sent', 'Compose a demo notice to exercise the confirmation and delivery flow.')}`;
    return `${heading('Write an announcement', 'A System notice for eligible learners. No targeting or individual messaging.', link('View history', '/admin/broadcasts/history', 'btn'), 'PLATFORM / NOTIFICATIONS')}${section('compose', 'Broadcast composer', 'Preview before sending. Delivery continues when the composer closes.', `<div class="form-grid">${field('Title', 'title', v.form.title, { wide: true, required: true, maxlength: 120 })}${field('Message', 'message', v.form.message, { textarea: true, rows: 9, wide: true, required: true, maxlength: 2000 })}${field('Icon', 'icon', v.form.icon, { options: ['bell', 'book', 'spark', 'calendar'] })}</div><div class="stat-line"><span>Audience</span><b>All eligible active learners</b></div><div class="stat-line"><span>Category</span><b>System</b></div><div class="mt">${button('Preview announcement', 'send-broadcast', { primary: true, icon: 'eye', disabled: store.role !== 'Super Admin' })}</div>${note('No real delivery. All data and send history stay in this browser.')}`)}`;
}
