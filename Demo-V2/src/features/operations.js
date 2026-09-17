import { esc, icon, button, link, badge, field, toggle, section, heading, table, empty, note, metric, download, csv, markdown } from '../ui.js';
import { id, now, dateAfter, newProblem } from '../data.js';
import { clone, fingerprint, checksFor, contentOf, validateImport } from '../model.js';
import * as store from '../store.js';
const RESET_SCOPES = ['Courses', 'Challenges and Tracks', 'Daily', 'Timed Debug', 'Mock Tests', 'Company Tests', 'Workspace completion', 'Skills', 'Learning preferences and Continue'];
const PUBLISH_TABLES = ['problems', 'tracks', 'papers', 'subjects', 'templates', 'kb', 'responseSets'];
export function globalFeature(ctx, name, param) { if (name === 'jobs')
    return jobs(ctx, param); if (name === 'approvals')
    return approvals(ctx, param); return renderOperations(ctx); }
export function renderOperations(ctx) {
    const p = ctx.path;
    if (p === '/admin')
        return hub(ctx);
    if (p.startsWith('/admin/people'))
        return people(ctx);
    if (p.startsWith('/admin/submissions'))
        return approvals(ctx);
    if (p === '/admin/reports')
        return reports(ctx);
    if (p === '/admin/vocabulary')
        return vocabulary(ctx);
    if (p === '/admin/lifecycle')
        return lifecycle(ctx);
    if (p === '/admin/audit')
        return audit(ctx);
    if (p === '/admin/identity-delivery')
        return jobs(ctx, 'Identity');
    if (p === '/admin/maintenance-windows')
        return maintenance(ctx);
    if (p.startsWith('/admin/analytics'))
        return analytics(ctx);
    if (p.startsWith('/admin/provenance'))
        return provenance(ctx);
    if (p.startsWith('/admin/import/'))
        return importer(ctx);
    if (p === '/admin/content-gaps')
        return gaps(ctx);
    if (p === '/admin/language-registry')
        return runtime(ctx);
    return ctx.notFound();
}
function hub(ctx) {
    const failed = ctx.db.jobs.filter(j => j.state === 'Failed'), tomorrow = dateAfter(1), next = ctx.db.problems.find(p => p.kind === 'daily' && p.date === tomorrow && p.status === 'Published');
    const health = [['Access verification', 'Healthy'], ['Database & local persistence', 'Healthy'], ['Interactive execution', 'Healthy'], ['Case execution', 'Healthy'], ['Video processing', 'Healthy'], ['Notification delivery', 'Healthy'], ['Backup monitoring', 'Healthy']];
    ctx.on('hub-refresh', () => { ctx.toast('Sample health refreshed. No external service was probed.'); ctx.render(); });
    return `${heading('Operations', 'A clear view of what needs attention. Everything here is a local simulation.', button('Refresh readings', 'hub-refresh', { icon: 'refresh' }), 'ADMINISTRATION')}<div class="demo-context">${icon('shield')}<span><b>Admin-only prototype</b> · Author content, validate the workflow and preview changes. No real learners, jobs or messages are affected.</span></div><div class="grid-two">${section('attention', 'Needs attention', 'Four defined operational conditions—not learner performance.', `<div class="action-list">${link(`Failed rewards · ${failed.filter(j => j.kind === 'Reward').length}`, '/admin/economy/failed-rewards')}${link(`Main-site changes · ${failed.filter(j => j.kind === 'Identity').length}`, '/admin/identity-delivery')}${link(`Erasure work · ${ctx.db.erasures.filter(x => x.state !== 'Complete').length}`, '/admin/lifecycle')}${link(`Tomorrow’s Daily · ${next ? 'Scheduled' : 'Not published'}`, '/admin/daily-challenges/schedule-health')}</div>`)}${section('health', 'Dependency health', 'Illustrative readings. Unknown is never shown as healthy.', health.map(([name, status]) => `<div class="stat-line"><span>${esc(name)}</span>${badge(store.scenario === 'unavailable' ? 'Unknown' : status, store.scenario === 'unavailable' ? 'warning' : 'success')}</div>`).join(''))}</div>${section('work', 'Background work', 'Owners decide recovery. A pending grade cannot be manually marked successful.', table(['Work', 'Owner', 'State', 'Age', ''], ctx.db.jobs.map(j => [esc(j.title), esc(j.kind), badge(j.state), esc(j.age), link('Open owner', j.target, 'text-link')])))}<div class="grid-three">${[['Code authoring', 'Starters, private references and visible/hidden cases.', '/admin/challenges', 'code'], ['Learning content', 'Subjects, chapters, lessons and video preparation.', '/admin/courses', 'book'], ['Project templates', 'Files, entry points and learner checklists.', '/admin/workspace/templates', 'folder']].map(([t, d, url, ico]) => `<a href="${url}" data-nav class="launch-card">${icon(ico)}<h3>${t}</h3><p>${d}</p><span>Open workspace ${icon('arrow')}</span></a>`).join('')}</div>`;
}
function jobs(ctx, kind) { ctx.on('retry-job', key => { store.requireSuper(); if (store.scenario === 'unavailable')
    throw Error('Simulated dependency outage. The job remains failed.'); store.update(d => { const j = d.jobs.find(x => x.id === key); if (!j || j.state !== 'Failed' || !['Reward', 'Identity'].includes(j.kind))
    throw Error('This job has no manual retry action.'); j.state = 'Completed'; j.tries++; j.reason = 'Retry simulated successfully; original operation identity retained.'; }, 'Retried original work', key, true); ctx.render(); ctx.toast('Local retry completed. No real reward or access decision changed.'); }); const rows = ctx.db.jobs.filter(j => !kind || j.kind === kind); return `${heading(kind === 'Reward' ? 'Failed reward recovery' : 'Main-site change recovery', 'Retry the original operation once, without creating a second effect.', link('Operations', '/admin', 'btn'), 'ADMINISTRATION / OPERATIONS')}${table(['Work', 'State', 'Last observation', 'Tries', ''], rows.map(j => [esc(j.title), badge(j.state), esc(j.reason), String(j.tries), button('Retry original', 'retry-job', { id: j.id, disabled: j.state !== 'Failed' || store.role !== 'Super Admin', small: true })]))}${note('Sample jobs only. Grading follows automatic owner-specific recovery and has no generic Release button.')}`; }
function people(ctx) {
    const segments = ctx.path.split('/').filter(Boolean);
    const person = ctx.db.people.find(p => p.id === segments[2]);
    const action = segments[3];
    const v = ctx.view;
    ctx.onChange('person-search', x => { v.search = x; ctx.renderWithFocus('person-search'); });
    ctx.onChange('person-role', x => { v.role = x; ctx.render(); });
    ctx.onChange('person-standing', x => { v.standing = x; ctx.render(); });
    if (!segments[2]) {
        const rows = ctx.db.people.filter(p => (!v.search || `${p.title} ${p.email}`.toLowerCase().includes(v.search.toLowerCase())) && (!v.role || v.role === 'All roles' || p.role === v.role) && (!v.standing || v.standing === 'All standing' || p.standing === v.standing));
        return `${heading('People', 'Permitted support facts only. WordPress owns identity, membership and roles.', '', 'ADMINISTRATION')}<div class="filterbar"><div class="search-box">${icon('search')}<input aria-label="Search people" data-change="person-search" value="${esc(v.search || '')}" placeholder="Search name or email…"/></div><select aria-label="Role filter" data-change="person-role">${['All roles', 'User', 'Admin', 'Super Admin'].map(x => `<option ${x === v.role ? 'selected' : ''}>${x}</option>`).join('')}</select><select aria-label="Standing filter" data-change="person-standing">${['All standing', 'In good standing', 'Suspended', 'Banned'].map(x => `<option ${x === v.standing ? 'selected' : ''}>${x}</option>`).join('')}</select></div>${table(['Person', 'Labs role', 'Access', 'Standing', ''], rows.map(p => [`<b class="row-title">${esc(p.title)}</b><small>${esc(p.email)}</small>`, badge(p.role), esc(p.membership), badge(p.standing), link('Support view', `/admin/people/${p.id}`, 'btn small')]))}${note('These fictional records use example.test addresses. There is no role editor, impersonation control or private-source viewer.')}`;
    }
    if (!person)
        return ctx.notFound('This demo person was not found.');
    ctx.on('person-action', type => personAction(ctx, person, type));
    const selected = action ? `<div class="callout">${icon('shield')}<div><b>${esc(action.split('-').join(' '))}</b><p>Review the person and open the explicit confirmation. Merely visiting this address changes nothing.</p>${button('Review action', 'person-action', { id: action, primary: true, disabled: store.role !== 'Super Admin' })}</div></div>` : '';
    return `${heading(person.title, person.email, link('Back to People', '/admin/people', 'btn'), 'ADMINISTRATION / SUPPORT')}${selected}<div class="grid-two">${section('identity', 'Identity & access', 'Read-only, fictional main-site projection.', `<div class="stat-line"><span>Labs role</span><b>${esc(person.role)}</b></div><div class="stat-line"><span>Membership</span><b>${esc(person.membership)}</b></div><div class="stat-line"><span>Standing</span>${badge(person.standing)}</div><div class="stat-line"><span>Member since</span><b>${esc(person.joined)}</b></div><div class="stat-line"><span>Access end</span><b>${esc(person.end || 'Staff access; no invented membership')}</b></div><div class="stat-line"><span>Recorded XP</span><b>${person.xp}</b></div>${note('Notes, accepted code, project files, terminal output and generated answers are not available to staff.')}`)}${section('actions', 'Protected actions', 'Super Admin only. Restoring access is separate from restricting it.', `<div class="stack">${button('Suspend access', 'person-action', { id: 'suspend', disabled: store.role !== 'Super Admin' })}${button('Lift suspension', 'person-action', { id: 'lift-suspension', disabled: store.role !== 'Super Admin' || person.standing !== 'Suspended' })}${button('Ban access', 'person-action', { id: 'ban', disabled: store.role !== 'Super Admin' || person.standing === 'Banned' })}${button('Unban', 'person-action', { id: 'unban', disabled: store.role !== 'Super Admin' || person.standing !== 'Banned' })}${button('Reset selected progress', 'person-action', { id: 'reset', disabled: store.role !== 'Super Admin' })}${button('Confirm payment reversal', 'person-action', { id: 'payment-reversal', disabled: store.role !== 'Super Admin' })}${link('Accounting repair', `/admin/economy/correction?person=${person.id}`, 'btn')}${button('Initiate account erasure', 'person-action', { id: 'erase', danger: true, disabled: store.role !== 'Super Admin' })}</div>`)}</div>${section('history', 'Administrative history', 'Local attributed actions; no editable audit rows.', table(['Action', 'Who', 'When', 'Reason'], ctx.db.audit.filter(a => a.target.includes(person.id) || a.target.includes(person.title)).map(a => [esc(a.action), esc(a.actor), esc(new Date(a.at).toLocaleString()), esc(a.reason || '—')])))}${note('Opening support data in production requires an audited read. This prototype contains no real account integration.')}`;
}
function personAction(ctx, p, type) {
    if (!['suspend', 'lift-suspension', 'ban', 'unban', 'reset', 'payment-reversal', 'erase'].includes(type))
        throw Error('This is not a supported person action.');
    store.requireSuper();
    const titles = { suspend: 'Suspend access', 'lift-suspension': 'Lift suspension', ban: 'Ban access', unban: 'Unban', reset: 'Reset selected progress', 'payment-reversal': 'Confirm main-site reversal', erase: 'Initiate account erasure' };
    const body = type === 'suspend' ? field('Duration in days', 'days', 7, { type: 'number', min: 1, max: 365, help: '1–365 days. This affects Labs access, not the purchase.' }) : type === 'reset' ? `<p>Select only the scopes you intend to reset. Counts below are explicit demo fixtures, not production impact estimates.</p>${RESET_SCOPES.map((s, i) => `<label class="check-row"><input name="scope-${i}" type="checkbox"/><span>${esc(s)}</span><small>${[5, 4, 2, 1, 1, 0, 2, 6, 1][i]} sample records</small></label>`).join('')}${note('Preserve XP, paid reward identities, achievements, certificates, Notes and project files.', 'warning')}` : type === 'payment-reversal' ? field('Main-site reversal reference', 'reference', '', { required: true, help: 'This records a reversal already performed elsewhere; it does not process a payment.' }) : type === 'erase' ? note('No seven-day cancellation window applies to staff-initiated erasure. The demo records an operation only; it deletes no real account.', 'warning') : `<p>${esc(titles[type])} for <strong>${esc(p.title)}</strong>. No private staff note is sent to a learner.</p>`;
    ctx.dialog(titles[type], body, { typed: p.title, reason: type !== 'unban', large: type === 'reset', danger: ['ban', 'erase', 'reset'].includes(type), confirm: 'Confirm demo action', onConfirm: v => { if (type === 'suspend' && (!Number.isInteger(Number(v.days)) || Number(v.days) < 1 || Number(v.days) > 365))
            throw Error('Choose a whole duration from 1–365 days.'); if (type === 'payment-reversal' && !v.reference.trim())
            throw Error('A main-site reversal reference is required.'); const scopes = RESET_SCOPES.filter((x, i) => v[`scope-${i}`]); if (type === 'reset' && !scopes.length)
            throw Error('Select at least one reset scope.'); store.update(d => { const row = d.people.find(x => x.id === p.id); if (type === 'suspend') {
            row.standing = 'Suspended';
            row.suspensionEnd = dateAfter(Number(v.days));
        } if (type === 'lift-suspension') {
            if (row.standing !== 'Suspended')
                throw Error('No active suspension remains.');
            row.standing = 'In good standing';
        } if (type === 'ban')
            row.standing = 'Banned'; if (type === 'unban') {
            if (row.standing !== 'Banned')
                throw Error('This account is not banned.');
            row.standing = 'In good standing';
        } if (type === 'reset') {
            d.resets ||= [];
            d.resets.push({ id: id('reset'), personId: p.id, scopes, state: 'Simulated complete', at: now(), reason: v.reason });
        } if (type === 'payment-reversal') {
            d.reversals ||= [];
            if (d.reversals.some(x => x.reference === v.reference && x.personId === p.id))
                throw Error('This reversal reference was already recorded.');
            d.reversals.push({ personId: p.id, reference: v.reference, reason: v.reason, at: now() });
            row.membership = 'Reversed entitlement';
            for (const c of d.certificates.filter(x => x.personId === p.id)) {
                c.status = 'Revoked';
                c.history.push('Simulated confirmed payment reversal.');
            }
        } if (type === 'erase') {
            if (d.erasures.some(e => e.personId === p.id && e.state !== 'Complete'))
                throw Error('An unfinished erasure already exists.');
            d.erasures.push({ id: id('erasure'), personId: p.id, title: p.title, source: 'Super Admin', state: d.holds.some(h => h.personId === p.id && !h.released) ? 'Held' : 'Pending', at: now(), reason: v.reason });
        } return v.reason; }, titles[type], p.id, true); ctx.render(); ctx.toast(type === 'erase' ? 'Erasure recorded as pending. Backend execution is not connected.' : 'Demo action recorded. Original private learner data is not present here.'); } });
}
function editorURL(t, r) { if (t === 'problems')
    return r.kind === 'track' ? `/admin/tracks/${r.trackId}?problem=${r.id}` : r.kind === 'daily' ? `/admin/daily-challenges?item=${r.id}` : `/admin/${r.kind === 'debug' ? 'debug-detective' : 'challenges'}/${r.id}`; return t === 'papers' ? `/admin/papers/${r.id}` : t === 'subjects' ? `/admin/courses/${r.id}` : t === 'tracks' ? `/admin/tracks/${r.id}` : t === 'templates' ? `/admin/workspace/templates?template=${r.id}` : t === 'kb' ? `/admin/wizbit/kb?entry=${r.id}` : '/admin/wizbit/responses'; }
function approvals(ctx, filter) {
    const rows = PUBLISH_TABLES.filter(t => !filter || t === filter).flatMap(t => (ctx.db[t] || []).filter(r => r.submitted).map(r => ({ t, r })));
    const chosen = ctx.path.split('/')[3];
    ctx.on('review-submission', key => { const [t, rid] = key.split(':'); const r = store.getDB()[t]?.find(x => x.id === rid); if (!r?.submitted)
        throw Error('This submission no longer awaits review.'); ctx.dialog('Review exact submitted draft', `<h3>${esc(r.title)}</h3><p>${esc(r.description || r.answer || 'Coordinated response set')}</p><div class="stat-line"><span>Submitted</span><b>${esc(new Date(r.submitted.at).toLocaleString())}</b></div><div class="stat-line"><span>Validation</span>${badge(r.validation?.state || 'Not checked')}</div>${note(r.submitted.fingerprint === fingerprint(r) ? 'The current saved content matches the submitted draft.' : 'The draft changed; renewed submission is required.', r.submitted.fingerprint === fingerprint(r) ? 'info' : 'warning')}${link('Inspect authoring content', editorURL(t, r), 'btn')}<div class="mt">${field('Decision', 'decision', 'Approve and publish', { options: ['Approve and publish', 'Reject'] })}${field('Reason (required for rejection)', 'reason', '', { textarea: true })}</div>`, { confirm: 'Apply decision', large: true, onConfirm: v => { if (v.decision === 'Reject' && !v.reason.trim())
            throw Error('A rejection requires a reason.'); const current = store.getDB()[t].find(x => x.id === rid); store.approve(t, current, v.decision === 'Approve and publish', v.reason); ctx.render(); ctx.toast(v.decision === 'Reject' ? 'Returned to editing with the reason.' : 'The reviewed draft is now published in the demo.'); } }); });
    const selected = chosen ? rows.filter(x => x.r.id === chosen) : rows;
    return `${heading('Publication approvals', 'Review one exact draft. Approval publishes in the same action.', '', 'ADMINISTRATION / CONTENT')}${note('Admin can inspect their preparation. Only Super Admin can approve or reject. Published content stays unchanged while a draft waits.')}${selected.length ? table(['Submitted content', 'Owner', 'Current check', ''], selected.map(({ t, r }) => [link(r.title, editorURL(t, r), 'row-title'), esc(t), badge(r.submitted.fingerprint === fingerprint(r) ? 'Current' : 'Changed'), button('Review submission', 'review-submission', { id: `${t}:${r.id}`, small: true, disabled: store.role !== 'Super Admin' })])) : empty('No drafts waiting', 'An Admin can validate a draft and submit it from its own authoring page.')}`;
}
function reports(ctx) {
    const v = ctx.view;
    ctx.onChange('report-status', value => { v.status = value; ctx.render(); });
    const rows = ctx.db.reports.filter(r => !v.status || v.status === 'All statuses' || r.status === v.status);
    ctx.on('report-review', key => { const r = ctx.db.reports.find(x => x.id === key); const options = { Open: ['Open', 'Investigating', 'Resolved', 'Dismissed'], Investigating: ['Investigating', 'Resolved', 'Dismissed'], Resolved: ['Resolved', 'Open'], Dismissed: ['Dismissed', 'Open'] }[r.status]; ctx.dialog('Review content report', `<h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>${badge(r.reason)}<div class="mt">${link('Open content owner', r.target, 'btn')}</div>${field('Status', 'status', r.status, { options })}${field('Resolution', 'outcome', r.outcome || 'Corrected', { options: ['Corrected', 'No action', 'Escalated', 'Duplicate'] })}${field('Review note / reason', 'reason', r.note, { textarea: true })}`, { confirm: 'Save review', onConfirm: x => { if (['Dismissed', 'Resolved'].includes(x.status) && !x.reason.trim())
            throw Error('Record a reason or outcome explanation.'); if (['Resolved', 'Dismissed'].includes(r.status) && x.status === 'Open' && !x.reason.trim())
            throw Error('Reopening requires a reason.'); store.update(d => { const row = d.reports.find(i => i.id === key); row.status = x.status; row.outcome = x.status === 'Resolved' ? x.outcome : ''; row.note = x.reason; return x.reason; }, 'Reviewed content report', r.id); ctx.render(); ctx.toast('Review saved. Content changes stay with its owner.'); } }); });
    return `${heading('Content reports', 'Review reported material without rewriting the original report.', '', 'ADMINISTRATION')}<div class="filterbar"><select data-change="report-status" aria-label="Report status">${['All statuses', 'Open', 'Investigating', 'Resolved', 'Dismissed'].map(x => `<option ${v.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select><span class="muted">${rows.length} local records</span></div>${table(['Report', 'Reason', 'Status', 'Received', ''], rows.map(r => [esc(r.title), esc(r.reason), badge(r.status), esc(r.created), button('Review', 'report-review', { id: r.id, small: true })]))}`;
}
function vocabulary(ctx) {
    ctx.on('vocab-add', () => ctx.dialog('Add classification', `${field('Type', 'type', 'Skill', { options: ['Skill', 'Topic'] })}${field('Label', 'title', '', { required: true })}${field('Parent skill (topics only)', 'parent', '', { options: [['', 'Choose a skill'], ...ctx.db.vocabulary.filter(v => v.type === 'Skill' && !v.archived).map(v => [v.id, v.title])] })}`, { confirm: 'Create classification', onConfirm: v => { if (!v.title.trim())
            throw Error('Enter a label.'); if (v.type === 'Topic' && !v.parent)
            throw Error('A topic needs a parent skill.'); store.update(d => { if (d.vocabulary.length >= 2000)
            throw Error('The lifetime classification allowance is full.'); if (d.vocabulary.some(x => x.title.toLowerCase() === v.title.trim().toLowerCase() && !x.archived))
            throw Error('An active label already exists.'); d.vocabulary.push({ id: id('vocab'), type: v.type, title: v.title.trim(), parent: v.type === 'Topic' ? v.parent : '', archived: false }); }, 'Created classification', v.title, true); ctx.render(); } }));
    ctx.on('vocab-action', value => { const [key, act] = value.split(':'); const r = ctx.db.vocabulary.find(x => x.id === key); const same = ctx.db.vocabulary.filter(x => x.type === r.type && x.id !== key && !x.archived); const body = act === 'rename' ? field('Corrected label', 'title', r.title, { help: 'Label correction only. Changing the meaning requires a new classification.' }) : act === 'merge' ? field('Merge into', 'target', '', { options: same.map(x => [x.id, x.title]) }) : `<p>Stop offering <b>${esc(r.title)}</b> for new classification. Existing content retains its history.</p>`; ctx.dialog(`${act === 'rename' ? 'Correct label' : act === 'merge' ? 'Merge classification' : 'Archive classification'}`, body + note('Dependent content is updated by its identity in the demo. Production evidence-history and impact checks remain server responsibilities.'), { confirm: 'Confirm change', reason: true, onConfirm: v => { if (act === 'rename' && !v.title.trim())
            throw Error('The label cannot be empty.'); if (act === 'merge' && !v.target)
            throw Error('Choose a compatible active destination.'); store.update(d => { const row = d.vocabulary.find(x => x.id === key); const old = row.title; if (act === 'rename') {
            row.title = v.title.trim();
            for (const p of d.problems) {
                const affected = p.primarySkill === old || p.topic === old;
                if (p.primarySkill === old)
                    p.primarySkill = row.title;
                if (p.topic === old)
                    p.topic = row.title;
                if (affected) {
                    p.revision++;
                    delete p.validation;
                    delete p.submitted;
                }
            }
        }
        else {
            row.archived = true;
            if (act === 'merge') {
                row.mergedInto = v.target;
                const target = d.vocabulary.find(x => x.id === v.target);
                for (const p of d.problems) {
                    const affected = p.primarySkill === old || p.topic === old;
                    if (p.primarySkill === old)
                        p.primarySkill = target.title;
                    if (p.topic === old)
                        p.topic = target.title;
                    if (affected) {
                        p.revision++;
                        delete p.validation;
                        delete p.submitted;
                    }
                }
                for (const v of d.vocabulary)
                    if (v.parent === key)
                        v.parent = target.id;
            }
        } return v.reason; }, act + ' classification', r.title, true); ctx.render(); } }); });
    return `${heading('Skills & topics', 'A shared classification vocabulary—not shared problem ownership.', button('Add classification', 'vocab-add', { icon: 'plus', primary: true, disabled: store.role !== 'Super Admin' }), 'ADMINISTRATION')}${table(['Label', 'Type', 'Parent', 'State', ''], ctx.db.vocabulary.map(v => [esc(v.title), esc(v.type), esc(ctx.db.vocabulary.find(x => x.id === v.parent)?.title || '—'), badge(v.archived ? 'Archived' : 'Active'), v.archived ? '<span class="muted">History retained</span>' : `<div class="actions">${button('Rename', 'vocab-action', { id: `${v.id}:rename`, small: true, disabled: store.role !== 'Super Admin' })}${button('Merge', 'vocab-action', { id: `${v.id}:merge`, small: true, disabled: store.role !== 'Super Admin' })}${button('Archive', 'vocab-action', { id: `${v.id}:archive`, small: true, disabled: store.role !== 'Super Admin' })}</div>`]))}${note('No arbitrary difficulty editor, Delete classification or Restore control. Runtime support is read-only in its own view.')}`;
}
function lifecycle(ctx) {
    ctx.on('hold-new', () => ctx.dialog('Place a scoped retention hold', `${field('Person', 'person', '', { options: ctx.db.people.map(p => [p.id, p.title]) })}${field('Covered data', 'scope', '', { required: true, help: 'Name the specific records, not an unrestricted keep-everything switch.' })}${field('Authorizer', 'authorizer', '', { required: true })}${field('Review date', 'review', dateAfter(30), { type: 'date' })}`, { confirm: 'Place hold', reason: true, onConfirm: v => { if (!v.scope.trim() || !v.authorizer.trim() || v.review < dateAfter(0) || v.review > dateAfter(90))
            throw Error('Name the scope and authorizer; review within 90 days.'); store.update(d => { d.holds.push({ id: id('hold'), personId: v.person, title: d.people.find(p => p.id === v.person).title, scope: v.scope, authorizer: v.authorizer, review: v.review, reason: v.reason, at: now(), released: false }); for (const e of d.erasures)
            if (e.personId === v.person && e.state !== 'Complete')
                e.state = 'Held'; return v.reason; }, 'Placed retention hold', v.person, true); ctx.render(); } }));
    ctx.on('hold-release', key => ctx.dialog('Release retention hold', `<p>Only affected unfinished erasure resumes after the last applicable hold ends. Already erased material cannot be restored.</p>`, { reason: true, confirm: 'Release hold', onConfirm: v => { store.update(d => { const h = d.holds.find(x => x.id === key); if (h.released)
            throw Error('This hold was already released.'); h.released = true; h.ended = now(); for (const e of d.erasures)
            if (e.personId === h.personId && e.state === 'Held' && !d.holds.some(x => x.personId === h.personId && !x.released))
                e.state = 'Pending'; return v.reason; }, 'Released retention hold', key, true); ctx.render(); } }));
    return `${heading('Erasure & retention', 'Read operation progress and manage explicitly scoped holds.', button('Place hold', 'hold-new', { icon: 'shield', disabled: store.role !== 'Super Admin' }), 'ADMINISTRATION / GOVERNANCE')}${section('erasure', 'Erasure queue', 'Learner requests do not require approval. Administrative erasure begins from the person’s support view.', ctx.db.erasures.length ? table(['Person', 'Source', 'State', 'Requested'], ctx.db.erasures.map(e => [esc(e.title), esc(e.source), badge(e.state), esc(new Date(e.at).toLocaleString())])) : empty('No erasure requests', 'Create a local administrative example from People to inspect its pending state.'))}${section('holds', 'Retention holds', 'Never an indefinite, unreviewed keep-everything setting.', ctx.db.holds.length ? table(['Person / scope', 'Review', 'State', ''], ctx.db.holds.map(h => [`<b>${esc(h.title)}</b><small>${esc(h.scope)}</small>`, esc(h.review), badge(h.released ? 'Released' : 'Active'), button('Release', 'hold-release', { id: h.id, small: true, disabled: h.released || store.role !== 'Super Admin' })])) : empty('No active holds', 'No demo data is currently held.'))}${note('Backend erasure, backup age-out, legal authorization and safe restore are not executed by this prototype. No Complete button is offered.')}`;
}
function maintenance(ctx) { ctx.on('maintenance-add', () => ctx.dialog('Declare maintenance', `${field('Starts', 'start', new Date().toISOString().slice(0, 16), { type: 'datetime-local' })}${field('Expected end', 'end', new Date(Date.now() + 3600000).toISOString().slice(0, 16), { type: 'datetime-local' })}${field('Affected capability', 'capability', 'Execution', { options: ['Execution', 'Video', 'Saving', 'Notifications', 'Access verification'] })}${field('Learner-safe explanation', 'message', '', { textarea: true, required: true })}`, { confirm: 'Declare demo window', onConfirm: v => { if (!v.message.trim() || !v.start || !v.end || v.end <= v.start)
        throw Error('Provide a message and an end after the start.'); store.update(d => { d.maintenance.unshift({ id: id('maintenance'), ...v, state: 'Declared', at: now() }); }, 'Declared maintenance', v.capability, true); ctx.render(); } })); return `${heading('Maintenance windows', 'Expected end times are not declarations of actual recovery.', button('Declare window', 'maintenance-add', { icon: 'plus', primary: true, disabled: store.role !== 'Super Admin' }), 'ADMINISTRATION / OPERATIONS')}${ctx.db.maintenance.length ? table(['Capability', 'Starts', 'Expected end', 'State / message'], ctx.db.maintenance.map(w => [esc(w.capability), esc(w.start), esc(w.end), `${badge(w.state)}<small>${esc(w.message)}</small>`])) : empty('No maintenance windows', 'Declare a local example to review the scheduling and messaging workflow.')}${note('Actual health monitoring ends production windows. This demo does not offer Force healthy or alter external services.')}`; }
function audit(ctx) { ctx.onChange('audit-search', x => { ctx.view.search = x; ctx.renderWithFocus('audit-search'); }); const rows = ctx.db.audit.filter(a => !ctx.view.search || `${a.action} ${a.target} ${a.actor} ${a.reason}`.toLowerCase().includes(ctx.view.search.toLowerCase())); ctx.on('audit-export', () => { download('demo-audit.csv', csv(['Action', 'Target', 'Actor', 'Time', 'Reason'], rows.slice(0, 5000).map(a => [a.action, a.target, a.actor, a.at, a.reason])), 'text/csv'); ctx.toast('Exported the local attributed history. No private source is included.'); }); return `${heading('Audit history', 'An append-only local record of administrative actions.', button('Export local history', 'audit-export', { icon: 'download' }), 'ADMINISTRATION / GOVERNANCE')}<div class="filterbar"><div class="search-box">${icon('search')}<input aria-label="Search audit" data-change="audit-search" placeholder="Search action, target or actor…" value="${esc(ctx.view.search || '')}"/></div><span class="muted">${rows.length} records</span></div>${rows.length ? table(['Action', 'Target', 'Actor', 'When', 'Reason'], rows.slice(0, 200).map(a => [esc(a.action), esc(a.target), esc(a.actor), esc(new Date(a.at).toLocaleString()), esc(a.reason || '—')])) : empty('No actions recorded', 'Create or edit demo content to see its attributed history.')}${rows.length > 200 ? note('Showing the latest 200 matching local entries. Export contains up to 5,000 and does not change stored history.') : ''}`; }
function analytics(ctx) {
    const view = ctx.path.split('/').at(-1), v = ctx.view;
    if (view === 'reporting') {
        ctx.on('reports-export', () => download('sample-participation.csv', csv(['Area', 'Started', 'Completed'], [['Challenges', 128, 76], ['Daily', 83, 61], ['Courses', 62, 28], ['Mock Tests', 47, 39]]), 'text/csv'));
        return `${heading('Participation & content review', 'Illustrative aggregate observations. Never a learner ranking.', button('Export sample counts', 'reports-export', { icon: 'download' }), 'OVERVIEW / ANALYTICS')}${note('Fixed fictional sample data, not derived from real learners or the draft catalogue.')}<div class="metrics">${metric('Active learners', '186', 'Sample 30-day period')}${metric('First-time participation', '42', 'First qualifying activity')}${metric('Open content flags', '1', 'Local review queue')}${metric('Median resolution', '1.4 days', 'Illustrative resolved sample')}</div>${table(['Area', 'Started', 'Completed', 'Review'], [['Challenges', '128', '76', link('Content review', '/admin/challenges-review')], ['Daily Challenges', '83', '61', link('Content review', '/admin/daily-challenges/review')], ['Courses', '62', '28', link('Manage courses', '/admin/courses')], ['Mock Tests', '47', '39', link('Papers', '/admin/papers?type=Mock')]])}`;
    }
    if (view === 'skill-evidence-reset') {
        ctx.on('skill-reset', () => { const p = ctx.db.people.find(p => p.id === document.querySelector('[name=person]').value); ctx.navigate(`/admin/people/${p.id}/reset`); });
        return `${heading('Skill-evidence reset', 'Use the same counted reset operation as People—not a second policy.', '', 'OVERVIEW / ANALYTICS')}${section('person', 'Choose a learner', 'The next view offers the nine existing scopes. Select Skills only for an evidence-only reset.', `${field('Learner', 'person', '', { options: ctx.db.people.map(p => [p.id, p.title]) })}${button('Review reset scopes', 'skill-reset', { primary: true, disabled: store.role !== 'Super Admin' })}`)}`;
    }
    const isHome = view === 'home-suggestion';
    v.draft ||= clone(ctx.db.settings);
    ctx.fields(v.draft);
    const choices = [['', 'No destination'], ...ctx.db.problems.filter(p => p.status === 'Published').map(p => [p.kind === 'track' ? `/tracks/${p.trackId}/problems/${p.id}` : p.kind === 'daily' ? `/daily-challenges/${p.date}` : p.kind === 'debug' ? `/debug-detective/${p.slug || p.id}` : `/challenges/${p.id}`, p.title]), ...ctx.db.subjects.filter(s => s.status === 'Published').map(s => [`/courses/${s.id}`, s.title]), ['/mock-tests', 'Mock Tests'], ['/projects', 'My Projects']];
    ctx.on('curation-save', () => ctx.dialog('Apply curated destinations', `<p>This changes only the authored destinations. It creates no learning plan, privilege or skill calculation.</p>`, { reason: true, confirm: 'Apply changes', onConfirm: x => { store.update(d => { const keys = isHome ? ['homeSuggestion', 'homeLine'] : ['nextLearn', 'nextPractice', 'nextAssess', 'nextApply']; for (const k of keys) {
            if (k !== 'homeLine' && v.draft[k] && !choices.some(([u]) => u === v.draft[k]))
                throw Error('A selected destination is no longer available.');
            d.settings[k] = v.draft[k];
        } return x.reason; }, isHome ? 'Changed Home suggestion' : 'Changed next-action mappings', 'Analytics', true); ctx.toast('Local curation saved. Learner screens are outside this build.'); ctx.render(); } }));
    return `${heading(isHome ? 'Home suggestion' : 'Next-action destinations', 'Curated links to approved content, without automatic recommendations.', button('Apply changes', 'curation-save', { primary: true, disabled: store.role !== 'Super Admin' }), 'OVERVIEW / ADMIN')}${section('curation', isHome ? 'One useful suggestion' : 'One destination per supported stage', 'Unavailable targets are not silently replaced by another item.', isHome ? field('Published destination', 'homeSuggestion', v.draft.homeSuggestion, { options: choices }) + field('Optional explanatory line', 'homeLine', v.draft.homeLine, { textarea: true, rows: 3 }) : ['Learn', 'Practice', 'Assess', 'Apply'].map((label, i) => field(label, ['nextLearn', 'nextPractice', 'nextAssess', 'nextApply'][i], v.draft[['nextLearn', 'nextPractice', 'nextAssess', 'nextApply'][i]], { options: choices })).join(''))}`;
}
function provenance(ctx) { const [, , kind, rid] = ctx.path.split('/').filter(Boolean); const tables = { challenge: 'problems', daily: 'problems', debug: 'problems', track: 'tracks', paper: 'papers', subject: 'subjects', template: 'templates' }; const t = tables[kind]; const row = t ? ctx.db[t].find(r => r.id === rid) : null; const v = ctx.view; if (kind && !row)
    return ctx.notFound('The requested content source record is not available.'); v.source ||= { source: row?.source || ctx.db.settings.provenance, sourceDate: row?.sourceDate || '', permission: row?.permission || '' }; ctx.fields(v.source); ctx.on('source-save', () => { if (!v.source.source.trim())
    throw Error('State who authored or owns this content.'); store.update(d => { if (t) {
    const r = d[t].find(x => x.id === rid);
    Object.assign(r, v.source);
    r.revision++;
    delete r.validation;
    delete r.submitted;
}
else
    d.settings.provenance = v.source.source; }, 'Updated source record', row?.title || 'Container defaults', true); ctx.toast('Source information saved. Changed content must be revalidated before publishing.'); ctx.render(); }); return `${heading(row ? `Sources · ${row.title}` : 'Content source defaults', 'Authorship and permission information. Never learner source code.', button('Save source record', 'source-save', { primary: true, disabled: store.role !== 'Super Admin' }), 'ADMINISTRATION / CONTENT')}${section('sources', 'Authorship & rights', 'An Actual Company paper still needs its own dated reproduction permission.', `${field('Authorship / source', 'source', v.source.source, { textarea: true })}${field('Source date', 'sourceDate', v.source.sourceDate, { type: 'date' })}${field('Permission or license basis', 'permission', v.source.permission, { textarea: true })}`)}`; }
function importer(ctx) {
    const parts = ctx.path.split('/').filter(Boolean), kind = parts[2], rid = parts[3], map = { challenge: 'challenge', challenges: 'challenge', daily: 'daily', debug: 'debug', track: 'track', tracks: 'track' };
    const target = map[kind];
    if (!target)
        return `${heading('Contextual import', 'Import through the owning authoring workspace.', '', 'ADMINISTRATION / SHARED CONTROLS')}${note('Paper questions and course structures have specialized schemas. Open their own import view rather than forcing them into a practice-problem format.')}<div class="actions">${link('Paper import', `/admin/papers/${encodeURIComponent(rid)}/import`, 'btn')}${link('Course import', '/admin/courses/transfer', 'btn')}</div>`;
    const v = ctx.view;
    ctx.on('import-example', () => { const p = ctx.db.problems.find(p => p.kind === target) || newProblem(target, ctx.db.tracks.find(t => t.id === rid)); download('problem-import-template.json', JSON.stringify({ kind: 'problems', items: [contentOf(p)] }, null, 2)); });
    ctx.on('import-review', () => {
        const text = document.querySelector('[name=batch]').value;
        let items;
        try {
            items = validateImport(JSON.parse(text), 'problems');
        }
        catch (e) {
            throw Error(`Import not accepted: ${e.message}`);
        }
        if (target === 'track' && !ctx.db.tracks.some(t => t.id === rid))
            throw Error('Select an existing track before importing its problems.');
        for (const [i, r] of items.entries()) {
            if (r.kind !== target)
                throw Error(`Row ${i + 1}: this destination accepts only ${target} content.`);
            if (target === 'track') {
                const track = ctx.db.tracks.find(t => t.id === rid);
                if (r.languages.some(l => l.language !== track.language))
                    throw Error(`Row ${i + 1}: every language must match ${track.language}.`);
            }
        }
        ctx.dialog('Review independent imported drafts', `<p>${items.length} new drafts will be created in <b>${esc(target)}</b>. No problem links or learner records are copied.</p><ul>${items.map(x => `<li>${esc(x.title)}</li>`).join('')}</ul>`, { confirm: 'Import all drafts', onConfirm: () => { store.update(d => { for (const r of items) {
                const base = newProblem(target, target === 'track' ? d.tracks.find(t => t.id === rid) : undefined);
                const allowed = Object.keys(contentOf(base));
                const safe = Object.fromEntries(allowed.filter(k => k in r).map(k => [k, clone(r[k])]));
                const p = { ...base, ...safe, id: id('problem'), kind: target, trackId: target === 'track' ? rid : '', status: 'Draft', revision: 1, updated: now() };
                p.cases = p.cases.map(c => ({ ...c, id: id('case') }));
                p.hints = p.hints.map(h => ({ ...h, id: id('hint') }));
                d.problems.push(p);
                if (target === 'track')
                    d.tracks.find(t => t.id === rid).order.push(p.id);
            } }, 'Imported independent drafts', target); ctx.toast('All imported as local drafts. Nothing was published.'); ctx.navigate(target === 'track' ? `/admin/tracks/${rid}` : target === 'daily' ? '/admin/daily-challenges' : target === 'debug' ? '/admin/debug-detective' : '/admin/challenges', true); } });
    });
    return `${heading('Import practice content', 'Independent destination-owned drafts. JSON is the prototype interchange format.', button('Download example', 'import-example', { icon: 'download' }), 'CONTEXTUAL AUTHORING')}${section('batch', 'Paste an exported batch', 'At most 100 records / 10 MiB. A malformed batch writes nothing.', `${field('JSON content', 'batch', v.text || '', { textarea: true, mono: true, rows: 16 })}${button('Review entire batch', 'import-review', { primary: true })}`)}`;
}
function gaps(ctx) { return `${heading('Content Gaps', 'Two different demand sources. Do not merge their counts.', '', 'ADMINISTRATION / CONTENT')}<div class="grid-two">${section('asked', 'Asked for', 'Explicit Topic Requests, grouped by their area.', table(['Area', 'All requests', 'Open'], ['Challenges', 'Workspace'].map(a => [a, String(ctx.db.requests.filter(r => r.area === a && r.status !== 'Archived').length), String(ctx.db.requests.filter(r => r.area === a && ['Pending', 'Approved'].includes(r.status)).length)])) + link('Review requests', '/admin/topic-requests', 'btn'))}${section('unanswered', 'Searched for, not found', 'Fictional safe phrases above the five-occurrence threshold; no learner transcript.', table(['Safe phrase', '90-day sample count'], [['Changing a runtime', '7'], ['Course prerequisite', '5']]) + link('Author product help', '/admin/wizbit/kb', 'btn'))}</div>${note('No raw question, identity, code or unique search value is retained for this sample report. Search outages are not content gaps.')}`; }
function runtime(ctx) { const rows = [['Python', '3.x', 'Yes', 'Yes', 'No'], ['Server JavaScript', 'Node.js', 'Yes', 'Yes', 'No'], ['Java', 'Configured JVM', 'Yes', 'Yes', 'No'], ['C++', 'Configured compiler', 'Yes', 'Yes', 'No'], ['C', 'Configured compiler', 'Yes', 'Yes', 'No'], ['SQLite', 'SQLite', 'Yes', 'No', 'No'], ['HTML / CSS / browser JavaScript', 'Browser', 'No', 'No', 'Yes']]; return `${heading('Runtime availability', 'One shared read, used by every coding-authoring area.', '', 'PLATFORM / RUNTIMES')}${note('These are intended demo capabilities. No configured runtime has been probed or certified in this prototype. Versions require production configuration.', 'warning')}${table(['Environment', 'Version context', 'Case execution', 'Interactive', 'Preview'], rows.map(r => r.map(esc)))}${section('bounds', 'Sample validation envelope', 'These limits configure the simulated checker, not a real executor.', `<div class="stat-line"><span>Sample maximum run time</span><b>10,000 ms</b></div><div class="stat-line"><span>Sample maximum memory</span><b>256 MiB</b></div><p>The production profile may be stricter. No registry editor or provider credential field appears here.</p>`)}`; }
