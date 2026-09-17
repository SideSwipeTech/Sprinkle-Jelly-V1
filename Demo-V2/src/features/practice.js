import { esc, icon, button, link, badge, field, toggle, section, heading, table, empty, note, metric, codeField, tabs, download, csv } from '../ui.js';
import { LANGUAGES, DIFFICULTIES, XP, KINDS, starter, newProblem, newTrack, id, dateAfter } from '../data.js';
import { clone, move, slugify } from '../model.js';
import * as store from '../store.js';
import { editorHeader, sectionNav, validationPanel, wireAuthoring, problemPreview } from '../authoring.js';
const roots = { challenge: '/admin/challenges', daily: '/admin/daily-challenges', debug: '/admin/debug-detective', track: '/admin/tracks' };
export function problemURL(p) { return p.kind === 'daily' ? `${roots.daily}?item=${p.id}` : p.kind === 'track' ? `${roots.track}/${p.trackId}?problem=${p.id}` : `${roots[p.kind]}/${p.id}`; }
function actionButtons(index, collection) { return `<div class="actions">${button('↑', `${collection}-move-up`, { id: String(index), small: true, title: 'Move up' })}${button('↓', `${collection}-move-down`, { id: String(index), small: true, title: 'Move down' })}${button('Remove', `${collection}-remove`, { id: String(index), small: true, danger: true })}</div>`; }
export function renderPractice(ctx) {
    const path = ctx.path;
    const parts = path.split('/').filter(Boolean);
    if (path.includes('bug-types'))
        return bugTypes(ctx);
    if (path.endsWith('-review') || path.endsWith('/review'))
        return review(ctx, path.includes('daily') ? 'daily' : path.includes('debug') ? 'debug' : 'challenge');
    if (path.endsWith('/schedule') || path.endsWith('/schedule-health'))
        return schedule(ctx, path.endsWith('schedule-health'));
    if (parts[1] === 'tracks')
        return tracks(ctx, parts[2]);
    const kind = parts[1] === 'daily-challenges' ? 'daily' : parts[1] === 'debug-detective' ? 'debug' : 'challenge';
    const pid = kind === 'daily' ? ctx.query.get('item') : parts[2];
    if (pid) {
        const p = ctx.db.problems.find(p => p.id === pid && p.kind === kind);
        if (!p)
            return ctx.notFound('That problem is not in this collection.');
        return problemEditor(ctx, p, parts[3] === 'editorial' ? 'explanation' : undefined);
    }
    return library(ctx, kind);
}
function create(ctx, kind, track = null, date = '') {
    const p = newProblem(kind, track);
    if (date)
        p.date = date;
    ctx.dialog(`New ${kind === 'debug' ? 'Debug case' : kind === 'daily' ? 'Daily problem' : kind === 'track' ? 'Track problem' : 'Challenge'}`, `${track ? note(`${track.title} · ${LANGUAGES.find(x => x[0] === track.language)?.[1]}. Ownership and language are already set.`) : ''}${field('Title', 'title', '', { required: true, placeholder: 'Give this problem a clear name', maxlength: 120 })}${kind === 'daily' ? field('Schedule date', 'date', p.date, { type: 'date', help: 'New Dailies are scheduled on an untouched future date.' }) : ''}`, { confirm: 'Create draft', onConfirm: values => { if (values.title.trim().length < 2)
            throw Error('Use a title of at least two characters.'); p.title = values.title.trim(); p.slug = slugify(p.title); if (values.date)
            p.date = values.date; store.createRecord('problems', p); if (track)
            store.update(d => { const parent = d.tracks.find(t => t.id === track.id); parent.order.push(p.id); parent.revision++; }, 'Added Track problem', track.title); ctx.navigate(problemURL(p), true); ctx.toast('Independent draft created.'); } });
}
function library(ctx, kind) {
    const title = KINDS[kind], view = ctx.view;
    const all = ctx.db.problems.filter(p => p.kind === kind);
    const rows = all.filter(p => (!view.search || `${p.title} ${p.tags}`.toLowerCase().includes(view.search.toLowerCase())) && (!view.status || view.status === 'All statuses' || p.status === view.status) && (!view.difficulty || view.difficulty === 'All levels' || p.difficulty === view.difficulty));
    ctx.on('create-problem', () => create(ctx, kind));
    ctx.on('library-search', () => { });
    ctx.onChange('search', value => { view.search = value; ctx.renderWithFocus('search'); });
    ctx.onChange('status', value => { view.status = value; ctx.render(); });
    ctx.onChange('difficulty', value => { view.difficulty = value; ctx.render(); });
    ctx.on('library-export', () => download(`${kind}-drafts.json`, JSON.stringify({ kind: 'problems', items: all }, null, 2)));
    return `${heading(title, kind === 'daily' ? 'Author independent daily problems, then schedule them with confidence.' : kind === 'debug' ? 'Create broken programs with a clear learning outcome and a verifiable repair.' : 'Thoughtful problems. Reliable test cases. One straightforward authoring flow.', button('New ' + (kind === 'debug' ? 'case' : 'problem'), 'create-problem', { primary: true, icon: 'plus' }), 'PRACTICE / ADMIN')}
 <div class="metrics">${metric('In this collection', all.length, 'Independent authored items', 'code')}${metric('Published', all.filter(p => p.status === 'Published').length, 'Visible in the demo’s live copy', 'check')}${metric('Drafts', all.filter(p => p.status === 'Draft').length, 'Work you can keep refining', 'file')}${metric('In review', all.filter(p => p.status === 'Submitted').length, 'Awaiting owner approval', 'clock')}</div>
 <div class="subnav-links">${kind === 'daily' ? link('Scheduling calendar', '/admin/daily-challenges/schedule') + link('Schedule health', '/admin/daily-challenges/schedule-health') : ''}${kind === 'debug' ? link('Bug types', '/admin/debug-detective-bug-types') : ''}${link('Content review', kind === 'daily' ? roots.daily + '/review' : kind === 'debug' ? '/admin/debug-detective-review' : '/admin/challenges-review')}</div>
 <div class="filterbar"><div class="search-box">${icon('search')}<input aria-label="Search problems" data-change="search" value="${esc(view.search || '')}" placeholder="Search ${title.toLowerCase()}…" /></div><select aria-label="Filter status" data-change="status">${['All statuses', 'Draft', 'Published', 'Submitted', 'Archived'].map(x => `<option ${x === view.status ? 'selected' : ''}>${x}</option>`).join('')}</select><select aria-label="Filter difficulty" data-change="difficulty">${['All levels', ...DIFFICULTIES].map(x => `<option ${x === view.difficulty ? 'selected' : ''}>${x}</option>`).join('')}</select><div style="margin-left:auto">${button('Export drafts', 'library-export', { icon: 'download', small: true })}</div></div>
 ${rows.length ? table(['Problem', 'Status', 'Languages', kind === 'daily' ? 'Scheduled' : 'Difficulty', 'Updated', ''], rows.map(p => [`<div class="row-icon"><span class="tile-icon">${icon(kind === 'debug' ? 'bug' : kind === 'daily' ? 'calendar' : 'code')}</span><div>${link(p.title, problemURL(p), 'row-title')}<small>${esc(p.topic || 'No topic yet')}</small></div></div>`, badge(p.status), p.languages.map(l => badge(LANGUAGES.find(x => x[0] === l.language)?.[1] || l.language)).join(' '), kind === 'daily' ? esc(p.date) : badge(p.difficulty), `<span class="muted">${new Date(p.updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`, link('Open editor →', problemURL(p))])) : `<div class="card">${empty(all.length ? 'No matching problems' : 'Start your collection', all.length ? 'Try a different search or filter.' : 'Create a draft. Add code and cases at your own pace.', button('Create draft', 'create-problem', { primary: true, icon: 'plus' }))}</div>`}
 <div class="table-footer"><span>${rows.length} of ${all.length} items</span><span>Sample data · stored only in this browser</span></div>`;
}
export function problemCodeFields(p, s) {
    const index = Math.min(s.language || 0, Math.max(0, p.languages.length - 1));
    const language = p.languages[index];
    return `<div class="language-strip">${p.languages.map((l, i) => `<button class="language-button ${i === index ? 'active' : ''}" data-action="language-select" data-id="${i}">${icon('code')}${esc(LANGUAGES.find(x => x[0] === l.language)?.[1] || l.language)}</button>`).join('')}${p.kind !== 'track' ? `<select aria-label="Add language" data-change="add-language"><option value="">+ Add language</option>${LANGUAGES.filter(([v]) => !p.languages.some(x => x.language === v) && (p.interface === 'sql' ? v === 'sql' : v !== 'sql')).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>` : badge('Track language · fixed')}${language && p.kind !== 'track' ? button('Remove language', 'language-remove', { id: String(index), small: true, ghost: true }) : ''}</div>${language ? `<div class="code-pair">${codeField(`languages.${index}.starter`, language.starter, language.language, p.kind === 'debug' ? 'Broken starter' : 'Learner starter')}${codeField(`languages.${index}.reference`, language.reference, language.language, p.kind === 'debug' ? 'Reference fix' : 'Reference solution', { private: true })}</div>` : empty('Choose a language', 'The supported runtime catalogue supplies these choices.')}${p.interface === 'sql' ? `<div class="grid-two mt">${codeField('sqlSchema', p.sqlSchema, 'sql', 'SQLite schema')}${codeField('sqlDataset', p.sqlDataset, 'sql', 'Default dataset')}</div>${note('SQL runs against the exercise dataset, never the Labs database. Execution is simulated here.')}` : ''}`;
}
export function casesFields(p, s) {
    const selected = p.cases[s.case || 0];
    const at = s.case || 0;
    return `<div class="split-workspace"><div class="split-side"><div class="subheading"><h3>${p.cases.length} test cases</h3>${button('Add', 'case-add', { icon: 'plus', small: true, disabled: p.cases.length >= 100 })}</div>${p.cases.map((c, i) => `<button class="case-row ${i === at ? 'active' : ''}" data-action="case-select" data-id="${i}"><span><span class="case-index">${String(i + 1).padStart(2, '0')}</span>${esc(c.visibility)} case</span>${icon(c.visibility === 'Hidden' ? 'lock' : 'eye')}</button>`).join('')}${!p.cases.length ? '<p class="muted" style="padding:12px;font-size:12px">Add a visible example and a hidden grading case.</p>' : ''}</div><div class="v-splitter" data-split="--left-width" role="separator" aria-label="Resize test-case list" aria-orientation="vertical" aria-valuenow="260" aria-valuemin="220" aria-valuemax="620" tabindex="0"></div><div class="split-content">${selected ? `<div class="subheading"><h3>Test case ${at + 1}</h3>${actionButtons(at, 'case')}</div><div class="form-grid">${field('Visibility', `cases.${at}.visibility`, selected.visibility, { options: ['Visible', 'Hidden'], help: 'Visible examples appear to learners. Hidden data stays private.' })}<div class="note" style="margin:0">${icon('shield')}<span>One visibility state. Private cases are not errors.</span></div>${field(p.interface === 'sql' ? 'Case dataset / query input' : 'Input (stdin)', `cases.${at}.input`, selected.input, { textarea: true, rows: 7, mono: true })}${field(p.interface === 'sql' ? 'Expected result table' : 'Expected output', `cases.${at}.expected`, selected.expected, { textarea: true, rows: 7, mono: true, help: 'Whitespace is significant under the selected comparison rule.' })}${selected.visibility === 'Visible' ? field('Example explanation', `cases.${at}.explanation`, selected.explanation, { textarea: true, wide: true, rows: 3, help: 'Shown with this visible example.' }) : note('This case and its expected result are excluded from learner preview.')}</div>` : empty('Select a test case', 'Edit inputs and expected results here without scrolling through every case.')}</div></div>`;
}
export function bindCodeAndCases(ctx, p, s) {
    ctx.on('language-select', v => { s.language = Number(v); ctx.render(); });
    ctx.onChange('add-language', v => { if (!v)
        return; p.languages.push({ language: v, starter: starter[v] || '', reference: '', editorial: '' }); s.language = p.languages.length - 1; ctx.markDirty(s); ctx.render(); });
    ctx.on('language-remove', v => { const i = Number(v); ctx.dialog('Remove language', `<p>The starter, private reference and explanation for ${esc(p.languages[i].language)} will be removed from this draft.</p>`, { confirm: 'Remove language', danger: true, onConfirm: () => { p.languages.splice(i, 1); s.language = 0; ctx.markDirty(s); ctx.render(); } }); });
    ctx.on('case-select', v => { s.case = Number(v); ctx.render(); });
    ctx.on('case-add', () => { if (p.cases.length >= 100)
        throw Error('A problem can have at most 100 cases.'); p.cases.push({ id: id('case'), visibility: p.cases.some(x => x.visibility === 'Visible') ? 'Hidden' : 'Visible', input: '', expected: '', explanation: '' }); s.case = p.cases.length - 1; ctx.markDirty(s); ctx.render(); });
    for (const [action, delta] of [['case-move-up', -1], ['case-move-down', 1]])
        ctx.on(action, v => { const i = Number(v); const target = i + delta; if (target < 0 || target >= p.cases.length)
            return; p.cases = move(p.cases, i, delta); s.case = target; ctx.markDirty(s); ctx.render(); });
    ctx.on('case-remove', v => { const i = Number(v); ctx.dialog('Remove test case', `<p>Remove case ${i + 1} from this draft? Previous validation will no longer apply.</p>`, { confirm: 'Remove case', danger: true, onConfirm: () => { p.cases.splice(i, 1); s.case = Math.max(0, Math.min(i, p.cases.length - 1)); ctx.markDirty(s); ctx.render(); } }); });
}
function problemEditor(ctx, p, initialSection) {
    const s = ctx.edit('problems', p.id);
    if (initialSection && !s.initialized) {
        s.section = initialSection;
        s.initialized = true;
    }
    const d = s.draft;
    const current = s.section || 'overview';
    const track = d.trackId ? ctx.db.tracks.find(x => x.id === d.trackId) : null;
    const back = track ? `/admin/tracks/${track.id}` : roots[d.kind];
    wireAuthoring(ctx, s, { back, preview: () => problemPreview(d), onField: path => { if (path === 'title' && !d.slug) {
            d.slug = slugify(d.title);
        } if (path === 'interface') {
            ctx.render();
        } if (path.endsWith('.visibility'))
            ctx.render(); } });
    bindCodeAndCases(ctx, d, s);
    ctx.on('hint-add', () => { if (d.hints.length >= 10)
        throw Error('At most ten hints.'); d.hints.push({ id: id('hint'), title: '', body: '' }); ctx.markDirty(s); ctx.render(); });
    for (const [action, delta] of [['hint-move-up', -1], ['hint-move-down', 1]])
        ctx.on(action, v => { d.hints = move(d.hints, Number(v), delta); ctx.markDirty(s); ctx.render(); });
    ctx.on('hint-remove', v => { d.hints.splice(Number(v), 1); ctx.markDirty(s); ctx.render(); });
    let body = '';
    if (current === 'overview')
        body = section('overview', 'The essentials', 'Identify the problem and the learning it supports.', `<div class="form-grid">${field('Title', 'title', d.title, { wide: true, required: true, maxlength: 120 })}${field('Difficulty', 'difficulty', d.difficulty, { options: DIFFICULTIES, help: `Base reward uses the shared difficulty table. Currently ${XP[d.difficulty]} XP.` })}${field('Primary skill', 'primarySkill', d.primarySkill, { options: ctx.db.vocabulary.filter(v => v.type === 'Skill' && !v.archived).map(v => v.title) })}${field('Primary topic', 'topic', d.topic, { required: true })}${field('Tags', 'tags', d.tags, { placeholder: 'recursion, strings' })}${field('Readable address', 'slug', d.slug, { help: 'Generated from the initial title; edit deliberately.' })}${field('Content source / rights', 'source', d.source, { help: 'Record original authorship or a permitted source.' })}</div>${track ? note(`Owned by ${track.title}. Language: ${track.language}. This is not a shared Challenge.`) : ''}`);
    if (current === 'statement')
        body = section('statement', 'Write the problem', 'Make the input, expected behavior and constraints clear.', `<div class="form-grid">${field('Problem statement · Markdown', 'description', d.description, { textarea: true, rows: 9, wide: true, required: true })}${field('Input description', 'inputDescription', d.inputDescription, { textarea: true, rows: 3, required: true })}${field('Output description', 'outputDescription', d.outputDescription, { textarea: true, rows: 3, required: true })}${field('Constraints', 'constraints', d.constraints, { textarea: true, rows: 3, wide: true, required: true })}</div>`);
    if (current === 'code')
        body = section('code', 'Languages & code', 'Write a useful starting point and keep the reference solution private.', `${field('Execution interface', 'interface', d.interface, { options: [['console', 'Console program'], ['sql', 'SQL query · SQLite']], help: 'Changing interface does not silently translate existing code.' })}<div class="mt">${problemCodeFields(d, s)}</div>`);
    if (current === 'cases')
        body = section('cases', 'Test cases', 'Visible examples teach. Hidden cases check the complete solution.', casesFields(d, s));
    if (current === 'hints')
        body = section('hints', 'A little help, in the right order', 'Hints are optional, authored and free. Reveal order follows the list.', `${d.hints.map((h, i) => `<div class="hint-card"><div class="subheading"><h3>Hint ${i + 1}</h3>${actionButtons(i, 'hint')}</div><div class="form-grid">${field('Optional title', `hints.${i}.title`, h.title, { wide: true })}${field('Hint text', `hints.${i}.body`, h.body, { textarea: true, wide: true, rows: 3 })}</div></div>`).join('')}${!d.hints.length ? empty('No hints yet', 'This is optional. Add a useful nudge, not the complete answer.') : ''}${button('Add hint', 'hint-add', { icon: 'plus', disabled: d.hints.length >= 10 })}`);
    if (current === 'explanation')
        body = section('explanation', d.kind === 'debug' ? 'Post-fix debrief' : 'After the solve', 'Learner-facing teaching material. Never automatically expose the private reference.', d.languages.map((l, i) => `<div class="mb">${field(`${LANGUAGES.find(x => x[0] === l.language)?.[1] || l.language} · ${d.kind === 'debug' ? 'required debrief' : 'worked explanation'}`, `languages.${i}.editorial`, l.editorial, { textarea: true, rows: 9, required: d.kind === 'debug' })}</div>`).join(''));
    if (current === 'settings')
        body = section('settings', 'Execution & availability', 'Domain-specific settings stay with this problem.', `<div class="form-grid">${field('Time limit (milliseconds)', 'timeMs', d.timeMs, { type: 'number', min: 1, max: 10000 })}${field('Memory limit (MiB)', 'memoryMiB', d.memoryMiB, { type: 'number', min: 1, max: 256 })}${field('Output comparison', 'comparison', d.comparison, { options: ['Exact (normalize line endings and one final newline)', 'Numerical tolerance'], wide: true })}${field('Numerical tolerance', 'tolerance', d.tolerance, { type: 'number', min: 0, step: 'any' })}${field('Explicit prerequisite (optional internal destination)', 'prerequisite', d.prerequisite, { placeholder: 'No prerequisite' })}${d.kind === 'daily' ? field('Product date', 'date', d.date, { type: 'date' }) + field('Bonus XP', 'bonus', d.bonus, { type: 'number', min: 0, max: 200 }) : ''}${d.kind === 'debug' ? field('Mode', 'mode', d.mode, { options: ['Practice only', 'Timed then practice'] }) + field('Timed duration (minutes)', 'duration', d.duration, { type: 'number', min: 5, max: 120 }) + field('Timed windows', 'windows', d.windows, { type: 'number', min: 1, max: 10 }) + field('Planted bugs', 'bugCount', d.bugCount, { type: 'number', min: 1, max: 10 }) + field('Bug types', 'bugTypes', d.bugTypes, { help: 'Use the curated bug-type vocabulary.' }) + field('Private author note', 'internalNote', d.internalNote, { textarea: true, wide: true }) : ''}</div>${d.interface === 'sql' ? toggle('Row order matters', 'rowOrder', d.rowOrder, 'The learner’s comparison rules state this choice.') : ''}${note(d.kind === 'daily' ? 'A begun Daily keeps its grading conditions. Void is the explicit exceptional path.' : d.kind === 'debug' ? 'Material changes protect active timed windows. The prototype demonstrates the confirmation; no live learners are connected.' : 'Changing this problem never updates a similar problem in another collection.')}`);
    if (!body) {
        s.section = 'overview';
        return problemEditor(ctx, p);
    }
    return `${editorHeader(s, back, track ? `TRACK / ${track.title}` : `PRACTICE / ${KINDS[d.kind]}`)}${sectionNav([['overview', 'Overview'], ['statement', 'Statement'], ['code', 'Code'], ['cases', `Test cases (${d.cases.length})`], ['hints', `Hints (${d.hints.length})`], ['explanation', d.kind === 'debug' ? 'Debrief' : 'Explanation'], ['settings', 'Settings']], current)}<div class="editor-layout"><div class="editor-main">${body}</div>${validationPanel(s)}</div>`;
}
function tracks(ctx, trackId) {
    if (!trackId) {
        ctx.on('create-track', () => ctx.dialog('New Track', `${field('Track name', 'title', '', { required: true })}${field('Description', 'description', '', { textarea: true })}${field('Language', 'language', 'python', { options: LANGUAGES })}`, { confirm: 'Create Track', onConfirm: v => { if (v.title.trim().length < 2)
                throw Error('Add a Track name.'); const t = { ...newTrack(), ...v }; store.createRecord('tracks', t); ctx.navigate(`/admin/tracks/${t.id}`, true); } }));
        return `${heading('Tracks', 'One language. Independently owned problems. A clear learning sequence.', button('New Track', 'create-track', { primary: true, icon: 'plus' }), 'PRACTICE / ADMIN')}<div class="content-grid">${ctx.db.tracks.map(t => `<article class="card content-card"><div class="card-top"><span class="tile-icon">${icon('track')}</span>${badge(t.status)}</div><h3>${link(t.title || 'Untitled Track', `/admin/tracks/${t.id}`)}</h3><p>${esc(t.description)}</p><div class="card-bottom"><span>${esc(t.language)} · ${ctx.db.problems.filter(p => p.trackId === t.id).length} owned problems</span>${link('Open →', `/admin/tracks/${t.id}`)}</div></article>`).join('')}</div>`;
    }
    const t = ctx.db.tracks.find(t => t.id === trackId);
    if (!t)
        return ctx.notFound('Track not found.');
    const selected = ctx.query.get('problem');
    if (selected) {
        const p = ctx.db.problems.find(x => x.id === selected && x.trackId === t.id && x.kind === 'track');
        return p ? problemEditor(ctx, p) : ctx.notFound('That problem does not belong to this Track.');
    }
    const s = ctx.edit('tracks', t.id), d = s.draft;
    wireAuthoring(ctx, s, { back: '/admin/tracks' });
    ctx.on('create-track-problem', () => create(ctx, 'track', d));
    const problems = ctx.db.problems.filter(p => p.trackId === d.id).sort((a, b) => d.order.indexOf(a.id) - d.order.indexOf(b.id));
    ctx.on('track-up', pid => { const i = d.order.indexOf(pid); d.order = move(d.order, i, -1); ctx.markDirty(s); ctx.render(); });
    ctx.on('track-down', pid => { const i = d.order.indexOf(pid); d.order = move(d.order, i, 1); ctx.markDirty(s); ctx.render(); });
    return `${editorHeader(s, '/admin/tracks', 'PRACTICE / TRACK')}<div class="editor-layout"><div>${section('overview', 'Track details', 'Choose context once. Every new problem inherits this language.', `<div class="form-grid">${field('Name', 'title', d.title, { required: true })}${field('Language', 'language', d.language, { options: LANGUAGES, disabled: problems.length > 0, help: problems.length ? 'Fixed because this Track contains problems.' : '' })}${field('Description', 'description', d.description, { textarea: true, wide: true })}${field('Explicit prerequisite', 'prerequisite', d.prerequisite, { wide: true })}</div>`)}${section('problems', 'Owned problems', 'No shared Challenge references. Reordering changes order, not identity.', problems.length ? table(['Problem', 'State', 'Order', ''], problems.map((p, i) => [link(p.title, problemURL(p), 'row-title'), badge(p.status), `${i + 1}`, `<div class="actions">${button('↑', 'track-up', { id: p.id, small: true })}${button('↓', 'track-down', { id: p.id, small: true })}${link('Edit →', problemURL(p))}</div>`])) : empty('Add the first problem', 'Create it here; do not link a standalone Challenge.'), button('Add problem', 'create-track-problem', { icon: 'plus', primary: true }))}</div>${validationPanel(s)}</div>`;
}
function schedule(ctx, health) { ctx.on('day-create', date => create(ctx, 'daily', null, date)); const days = Array.from({ length: 21 }, (_, i) => dateAfter(i + 1)); return `${heading(health ? 'Schedule health' : 'Daily schedule', health ? 'See gaps early. Checks do not publish or replace content.' : 'An independent problem for each product date.', link('Back to Daily authoring', roots.daily, 'btn'), 'PRACTICE / DAILY CHALLENGES')}${note('Dates use the prototype’s displayed local calendar. Live product timezone enforcement is a backend integration check.')}<div class="schedule">${days.map(date => { const p = ctx.db.problems.find(p => p.kind === 'daily' && p.date === date && p.status !== 'Archived'); return `<article class="day ${p ? 'occupied' : ''}"><strong>${new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</strong><small>${esc(date)}</small>${p ? `<small>${link(p.title, problemURL(p))}</small>${badge(p.status)}` : `<small>Nothing scheduled</small>${button('Fill date', 'day-create', { id: date, small: true, icon: 'plus' })}`}</article>`; }).join('')}</div>`; }
function review(ctx, kind) {
    const rows = ctx.db.problems.filter(p => p.kind === kind);
    ctx.on('review-export', () => download('content-review.csv', csv([['Problem', 'Attempted', 'Solved', 'Rate'], ...rows.map(p => [p.title, p.sampleStats?.attempted || 0, p.sampleStats?.solved || 0, p.sampleStats?.attempted >= 20 ? Math.round(p.sampleStats.solved / p.sampleStats.attempted * 100) + '%' : 'Not enough data'])]), 'text/csv'));
    return `${heading(`${KINDS[kind]} · content review`, 'Illustrative aggregate figures. Low rates invite review; they are not learner judgments.', button('Export sample report', 'review-export', { icon: 'download' }), 'PRACTICE / REVIEW')}${note('All figures are labelled seed data, not live learner analytics.')}${table(['Problem', 'Attempted learners', 'Solved learners', kind === 'debug' ? 'Fix rate' : 'Solve rate', ''], rows.map(p => [link(p.title, problemURL(p), 'row-title'), String(p.sampleStats?.attempted || 0), String(p.sampleStats?.solved || 0), p.sampleStats?.attempted >= 20 ? badge(Math.round(p.sampleStats.solved / p.sampleStats.attempted * 100) + '%', 'accent') : badge('Not enough data'), link('Inspect content →', problemURL(p))]))}${kind === 'debug' ? note('This sample represents practice-mode fixes only. Timed and practice populations must not be combined.') : ''}`;
}
function bugTypes(ctx) { ctx.on('add-bugtype', () => ctx.dialog('Add bug type', field('Name', 'title', '', { required: true }), { confirm: 'Add type', onConfirm: v => { store.requireSuper(); const name = v.title.trim(); if (!name || ctx.db.bugTypes.includes(name))
        throw Error('Use a new, nonempty bug type.'); store.update(d => d.bugTypes.push(name), 'Added bug type', name, true); ctx.render(); } })); return `${heading('Bug types', 'Curated metadata for debugging cases—not measured learner bug counts.', button('Add type', 'add-bugtype', { primary: true, icon: 'plus', disabled: store.role !== 'Super Admin' }), 'PRACTICE / DEBUG DETECTIVE')}${table(['Bug type', 'Used for'], ctx.db.bugTypes.map(t => [esc(t), 'Case authoring and catalogue filters']))}`; }
