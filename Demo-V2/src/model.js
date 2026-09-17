import { DIFFICULTIES, LANGUAGES, MESSAGE_KINDS, TONES, EXPRESSIONS } from './data.js';
export const clone = v => structuredClone(v);
const META = new Set(['revision', 'updated', 'status', 'live', 'validation', 'submitted', 'history', 'sampleStats', 'lastReason']);
export function contentOf(v) { const o = {}; for (const k of Object.keys(v).sort())
    if (!META.has(k))
        o[k] = clone(v[k]); return o; }
export function fingerprint(v) { return JSON.stringify(contentOf(v)); }
export function setPath(o, path, value) {
    const keys = path.split('.');
    if (keys.some(k => ['__proto__', 'constructor', 'prototype'].includes(k)))
        throw Error('Invalid field');
    let cur = o;
    for (const k of keys.slice(0, -1)) {
        if (cur[k] === undefined)
            throw Error('Unknown field');
        cur = cur[k];
    }
    cur[keys.at(-1)] = value;
}
export function getPath(o, path) { return path.split('.').reduce((v, k) => v?.[k], o); }
export function slugify(s) { return s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100); }
const check = (a, section, label, ok) => a.push({ section, label, ok: !!ok });
export function validateProblem(p, all = [], today = new Date().toISOString().slice(0, 10)) {
    const c = [];
    const add = (s, l, ok) => check(c, s, l, ok);
    add('overview', 'A title of 2–120 characters', p.title?.trim().length >= 2 && p.title.length <= 120);
    add('overview', 'Valid difficulty and primary classification', DIFFICULTIES.includes(p.difficulty) && !!p.primarySkill && !!p.topic);
    add('statement', 'Statement, input, output and constraints supplied', [p.description, p.inputDescription, p.outputDescription, p.constraints].every(v => !!v?.trim()));
    add('code', 'At least one supported, unique language', p.languages?.length > 0 && new Set(p.languages.map(x => x.language)).size === p.languages.length && p.languages.every(x => LANGUAGES.some(l => l[0] === x.language)));
    for (const l of p.languages || []) {
        add('code', `${l.language}: starter and private reference supplied`, !!l.starter?.trim() && !!l.reference?.trim());
        add('code', `${l.language}: starter differs from reference`, l.starter?.trim() !== l.reference?.trim());
        if (p.kind === 'debug')
            add('explanation', `${l.language}: debrief supplied`, !!l.editorial?.trim());
    }
    add('cases', 'At least one visible and one hidden case', p.cases?.some(x => x.visibility === 'Visible') && p.cases?.some(x => x.visibility === 'Hidden'));
    add('cases', 'At most 100 unique, valid test cases', p.cases?.length <= 100 && new Set(p.cases.map(x => x.id)).size === p.cases.length && p.cases.every(x => ['Visible', 'Hidden'].includes(x.visibility) && typeof x.input === 'string' && typeof x.expected === 'string'));
    add('settings', 'Time and memory stay within the demo runtime profile', Number(p.timeMs) > 0 && Number(p.timeMs) <= 10000 && Number(p.memoryMiB) > 0 && Number(p.memoryMiB) <= 256);
    add('hints', 'No more than ten nonempty hints', p.hints?.length <= 10 && p.hints.every(h => !!h.body?.trim()));
    if (p.interface === 'sql')
        add('code', 'SQLite schema, dataset and SQL-only language provided', !!p.sqlSchema?.trim() && !!p.sqlDataset?.trim() && p.languages.length === 1 && p.languages[0].language === 'sql');
    if (p.kind === 'daily') {
        add('settings', 'A valid Daily date and bonus from 0–200', /^\d{4}-\d{2}-\d{2}$/.test(p.date) && !Number.isNaN(Date.parse(p.date)) && new Date(p.date).toISOString().slice(0, 10) === p.date && Number(p.bonus) >= 0 && Number(p.bonus) <= 200);
        add('settings', 'The date is not used by another Daily', !all.some(x => x.kind === 'daily' && x.id !== p.id && x.date === p.date && x.status !== 'Archived'));
        if (!p.live)
            add('settings', 'A new Daily uses an untouched future date', p.date > today);
    }
    if (p.kind === 'debug') {
        add('settings', 'Valid bug metadata', Number(p.bugCount) >= 1 && Number(p.bugCount) <= 10 && !!p.bugTypes?.trim());
        add('settings', 'Timed duration and allowance in range', p.mode === 'Practice only' || (Number(p.duration) >= 5 && Number(p.duration) <= 120 && Number(p.windows) >= 1 && Number(p.windows) <= 10));
    }
    return c;
}
export function validateQuestion(q) {
    const c = [];
    const add = (l, ok) => check(c, 'questions', l, ok);
    add('Supported question type', ['single', 'multiple', 'numerical', 'boolean', 'coding'].includes(q.type));
    add('Question text supplied', !!q.title?.trim());
    add('Marks positive; penalty nonnegative', Number.isInteger(Number(q.marks)) && Number(q.marks) > 0 && Number.isInteger(Number(q.penalty)) && Number(q.penalty) >= 0);
    add('Skill and difficulty supplied', !!q.skill && DIFFICULTIES.includes(q.difficulty));
    if (['single', 'multiple'].includes(q.type)) {
        add('Options are complete and distinct', q.options.length >= 2 && q.options.every(v => !!v.trim()) && new Set(q.options.map(x => x.trim().toLowerCase())).size === q.options.length);
        add('Answer key matches options', q.correct.length > 0 && (q.type !== 'single' || q.correct.length === 1) && q.correct.every(i => Number.isInteger(i) && i >= 0 && i < q.options.length));
    }
    if (q.type === 'numerical')
        add('Numerical answer and tolerance are valid', q.number !== '' && Number.isFinite(Number(q.number)) && Number(q.tolerance) >= 0 && (!q.relative || Number(q.tolerance) <= 10));
    if (q.type === 'boolean')
        add('Boolean key is true or false', typeof q.boolean === 'boolean');
    if (q.type === 'coding') {
        if (!q.code)
            add('Coding material supplied', false);
        else
            c.push(...validateProblem({ ...q.code, title: q.title, description: q.title, primarySkill: q.skill, topic: q.topic, difficulty: q.difficulty }).map(x => ({ ...x, section: 'questions' })));
    }
    return c;
}
export function validatePaper(p, db) {
    const c = [];
    const add = (s, l, ok) => check(c, s, l, ok);
    add('details', 'Title and instructions provided', p.title.trim().length >= 2 && !!p.description.trim());
    add('settings', 'Duration 5–240 minutes; grace 0–300 seconds', p.duration >= 5 && p.duration <= 240 && p.grace >= 0 && p.grace <= 300);
    add('settings', 'Availability closes after opening', !p.opens || !p.closes || p.closes > p.opens);
    add('settings', 'Valid proctoring settings', ['Off', 'Standard', 'Strict'].includes(p.proctoring) && p.eventLimit >= 1 && p.eventLimit <= 10);
    add('settings', 'A fresh-test grant requires a change notice', !p.freshTest || p.notify);
    const sections = p.sections.filter(x => x.included);
    add('questions', 'Included sections contain questions', sections.length > 0 && sections.every(s => s.title.trim() && s.questions.length));
    for (const s of sections)
        for (const q of s.questions)
            c.push(...validateQuestion(q).map(x => ({ ...x, label: `${s.title} / ${q.title || 'Untitled'}: ${x.label}` })));
    if (p.type === 'Mock')
        add('settings', 'Mock passing percentage is 1–100', p.passPercent >= 1 && p.passPercent <= 100);
    else {
        const company = db.companies.find(x => x.id === p.companyId);
        add('details', 'Company and matching job role', company?.active && company.roles.includes(p.role));
        if (p.provenance === 'Actual')
            add('details', 'Actual paper has dated source and reproduction permission', !!p.source?.trim() && !!p.sourceDate && !!p.permission?.trim());
    }
    return c;
}
export function validPath(path) { return typeof path === 'string' && path.length > 0 && path.length <= 240 && !path.startsWith('/') && !path.includes('\\') && !path.split('/').some(s => !s || s === '.' || s === '..') && !/[\x00-\x1f<>:"|?*]/.test(path); }
export function validateTemplate(t) {
    const c = [];
    const add = (l, ok) => check(c, 'files', l, ok);
    const bytes = t.files.reduce((s, f) => s + (f.binary ? f.bytes : new TextEncoder().encode(f.content).length), 0);
    add('Template name and description provided', t.title.trim().length >= 2 && !!t.description.trim());
    add('At most 40 files and 20 MB of current content', t.files.length <= 40 && bytes <= 20000000);
    add('Safe unique paths; text up to 2 MiB, assets up to 10 MiB', new Set(t.files.map(f => f.path)).size === t.files.length && t.files.every(f => validPath(f.path) && (f.binary ? f.bytes <= 10485760 : new TextEncoder().encode(f.content).length <= 2097152)));
    add('Entry file exists', t.files.some(f => f.path === t.entry));
    add('At most 12 complete checklist tasks', t.tasks.length <= 12 && t.tasks.every(x => !!x.title.trim() && (!x.file || t.files.some(f => f.path === x.file))));
    return c;
}
export function validateSubject(s, db) {
    const c = [];
    const add = (section, label, ok) => check(c, section, label, ok);
    add('details', 'Subject title, audience and outcomes supplied', s.title.trim().length >= 2 && !!s.audience.trim() && !!s.outcomes.trim());
    add('curriculum', 'Chapters have titles and lessons', s.chapters.length > 0 && s.chapters.every(c => c.title.trim() && c.lessons.length));
    const lessons = s.chapters.flatMap(c => c.lessons);
    if (s.format === 'Video Courses')
        add('curriculum', 'Video subject includes required work', lessons.some(l => l.required));
    for (const l of lessons) {
        add('curriculum', `${l.title || 'Untitled lesson'}: title and outcomes`, !!l.title.trim() && !!l.outcomes.trim());
        if (l.type === 'reading')
            add('curriculum', `${l.title}: readable content`, !!l.body.trim() || l.blocks.length > 0);
        if (l.type === 'video')
            add('curriculum', `${l.title}: prepared video, captions and transcript`, l.videoState === 'Ready' && !!l.videoName && (!l.required || !!l.captions.trim() && !!l.transcript.trim()));
        if (l.type === 'quiz') {
            add('curriculum', `${l.title}: quiz has questions`, l.questions.length > 0);
            for (const q of l.questions)
                c.push(...validateQuestion({ ...q, penalty: 0 }).map(x => ({ ...x, section: 'curriculum', label: `${l.title}: ${x.label}` })));
        }
        if (l.type === 'project')
            add('curriculum', `${l.title}: published template`, db.templates.some(t => t.id === l.templateId && t.status === 'Published'));
        if (l.type === 'activity')
            add('curriculum', `${l.title}: internal activity reference`, /^\/(challenges|tracks|daily-challenges|debug-detective)\//.test(l.activity));
        for (const b of l.blocks || [])
            if (b.type === 'executable')
                add('curriculum', `${l.title}: executable example has source`, !!b.content.trim());
    }
    return c;
}
export function checksFor(kind, record, db) {
    if (kind === 'problems')
        return validateProblem(record, db.problems);
    if (kind === 'papers')
        return validatePaper(record, db);
    if (kind === 'templates')
        return validateTemplate(record);
    if (kind === 'subjects')
        return validateSubject(record, db);
    if (kind === 'tracks')
        return [{ section: 'overview', label: 'Track name, description and fixed language', ok: record.title.trim().length >= 2 && !!record.description.trim() && LANGUAGES.some(l => l[0] === record.language) }, { section: 'problems', label: 'At least one published, independently owned problem', ok: db.problems.some(p => p.trackId === record.id && p.kind === 'track' && p.status === 'Published') }];
    if (kind === 'kb')
        return [{ section: 'content', label: 'Question, answer and product-rule reference provided', ok: record.title.trim().length >= 2 && !!record.answer?.trim() && !!record.source?.trim() }];
    if (kind === 'responseSets')
        return [{ section: 'content', label: 'All 39 message kinds appear exactly once', ok: record.items?.length === 39 && new Set(record.items.map(i => i.title)).size === 39 && record.items.every(i => MESSAGE_KINDS.includes(i.title)) }, ...record.items.map(i => ({ section: 'content', label: `${i.title}: valid standalone fact, flourish, tone and expression`, ok: !!i.fact?.trim() && i.fact.length <= 500 && i.flourish.length <= 240 && TONES.includes(i.tone) && EXPRESSIONS.includes(i.expression) }))];
    if (kind === 'responses')
        return [{ section: 'content', label: 'A standalone fact (up to 500 characters) and optional flourish (up to 240)', ok: !!record.fact?.trim() && record.fact.length <= 500 && record.flourish.length <= 240 && MESSAGE_KINDS.includes(record.title) }];
    return [];
}
export function canPublish(record, validation, checks) { return !['Archived', 'Voided'].includes(record.status) && checks.length > 0 && checks.every(x => x.ok) && validation?.state === 'Passed' && validation?.fingerprint === fingerprint(record); }
export function move(list, index, delta) { const target = index + delta; if (target < 0 || target >= list.length)
    return list; const next = [...list]; [next[index], next[target]] = [next[target], next[index]]; return next; }
export function validateImport(input, kind) {
    if (!input || typeof input !== 'object' || !Array.isArray(input.items) || input.kind !== kind)
        throw Error(`Use a ${kind} export with an items array.`);
    if (input.items.length > 100)
        throw Error('The demo importer accepts at most 100 records per batch.');
    if (new TextEncoder().encode(JSON.stringify(input)).length > 10485760)
        throw Error('Import exceeds 10 MiB.');
    input.items.forEach((r, i) => { if (!r || typeof r !== 'object' || typeof r.title !== 'string' || !r.title.trim())
        throw Error(`Row ${i + 1}: title is required.`); if (kind === 'problems' && (!Array.isArray(r.languages) || !Array.isArray(r.cases) || !Array.isArray(r.hints)))
        throw Error(`Row ${i + 1}: code, cases and hints arrays are required.`); });
    return clone(input.items);
}
