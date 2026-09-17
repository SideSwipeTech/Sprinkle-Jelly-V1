import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed, newProblem, newTrack, newPaper, newQuestion, newTemplate, MESSAGE_KINDS, THEMES } from '../src/data.js';
import { clone, contentOf, fingerprint, setPath, validateProblem, validatePaper, validateQuestion, validateTemplate, validateSubject, validateImport, validPath, canPublish, checksFor, move } from '../src/model.js';
globalThis.window = new EventTarget();
const storage = {};
Object.defineProperties(storage, { getItem: { value: k => Object.hasOwn(storage, k) ? storage[k] : null }, setItem: { value: (k, v) => { storage[k] = String(v); } }, removeItem: { value: k => delete storage[k] } });
globalThis.localStorage = storage;
const store = await import('../src/store.js');
const { problemPreview } = await import('../src/authoring.js');
const reset = () => { store.setScenario('normal'); store.setRole('Super Admin'); store.resetDemo(); };
const sample = () => clone(createSeed().problems[0]);
const passed = r => ({ state: 'Passed', fingerprint: fingerprint(r), simulated: true });
const failures = c => c.filter(x => !x.ok);
test('seed offers six distinct themes and all 39 message kinds', () => { assert.equal(new Set(THEMES.map(t => t[0])).size, 6); assert.equal(new Set(MESSAGE_KINDS).size, 39); });
test('sample problem has complete structural checks', () => assert.equal(failures(validateProblem(sample())).length, 0));
test('visible and hidden case are both required', () => { const p = sample(); p.cases = p.cases.filter(c => c.visibility === 'Visible'); assert.ok(failures(validateProblem(p)).some(c => c.section === 'cases')); });
test('case visibility cannot mean both visible and hidden', () => { const p = sample(); p.cases[0].visibility = 'Both'; assert.ok(failures(validateProblem(p)).length); });
test('100-case cap is enforced', () => { const p = sample(); p.cases = Array.from({ length: 101 }, (_, i) => ({ ...p.cases[0], id: String(i), visibility: i ? 'Hidden' : 'Visible' })); assert.ok(failures(validateProblem(p)).length); });
test('empty expected output is a valid explicit string', () => { const p = sample(); p.cases[0].expected = ''; assert.equal(failures(validateProblem(p)).length, 0); });
test('each offered language needs a distinct reference', () => { const p = sample(); p.languages[1].reference = p.languages[1].starter; assert.ok(failures(validateProblem(p)).length); });
test('duplicate language entries are refused', () => { const p = sample(); p.languages.push(clone(p.languages[0])); assert.ok(failures(validateProblem(p)).length); });
test('hints are optional but nonempty when supplied', () => { const p = sample(); p.hints = []; assert.equal(failures(validateProblem(p)).length, 0); p.hints = [{ body: '' }]; assert.ok(failures(validateProblem(p)).length); });
test('Debug debrief is required for every language', () => { const p = clone(createSeed().problems.find(p => p.kind === 'debug')); p.languages[0].editorial = ''; assert.ok(failures(validateProblem(p)).some(x => x.section === 'explanation')); });
test('Daily rejects occupied and malformed dates', () => { const p = clone(createSeed().problems.find(p => p.kind === 'daily')); const other = { ...clone(p), id: 'other' }; assert.ok(failures(validateProblem(p, [other])).length); p.date = '2026-99-45'; assert.ok(failures(validateProblem(p)).length); });
test('Daily bonus cannot exceed 200', () => { const p = clone(createSeed().problems.find(p => p.kind === 'daily')); p.bonus = 201; assert.ok(failures(validateProblem(p)).length); });
test('SQL requires its schema, dataset and SQL-only environment', () => { const p = sample(); p.interface = 'sql'; assert.ok(failures(validateProblem(p)).length); p.languages = [{ language: 'sql', starter: 'SELECT 1;', reference: 'SELECT 2;' }]; assert.equal(failures(validateProblem(p)).length, 0); p.sqlSchema = ''; assert.ok(failures(validateProblem(p)).length); });
test('an edited test case invalidates an earlier validation', () => { const p = sample(), v = passed(p); assert.ok(canPublish(p, v, validateProblem(p))); p.cases[2].expected = 'changed'; assert.equal(canPublish(p, v, validateProblem(p)), false); });
test('revision bookkeeping does not stale an unchanged validation', () => { const p = sample(), v = passed(p); p.revision++; p.updated = 'later'; assert.ok(canPublish(p, v, validateProblem(p))); });
test('failed, unavailable and missing validation cannot publish', () => { const p = sample(); for (const state of ['Failed', 'Unavailable', 'Not checked'])
    assert.equal(canPublish(p, { state, fingerprint: fingerprint(p) }, validateProblem(p)), false); assert.equal(canPublish(p, null, validateProblem(p)), false); });
test('archived content cannot be republished', () => { const p = sample(); p.status = 'Archived'; assert.equal(canPublish(p, passed(p), validateProblem(p)), false); });
test('Preview omits private reference and hidden expected values', () => { const p = sample(); p.languages[0].reference = 'PRIVATE_REFERENCE_SENTINEL'; p.cases[2].expected = 'HIDDEN_OUTPUT_SENTINEL'; p.internalNote = 'PRIVATE_NOTE_SENTINEL'; const html = problemPreview(p); for (const text of ['PRIVATE_REFERENCE_SENTINEL', 'HIDDEN_OUTPUT_SENTINEL', 'PRIVATE_NOTE_SENTINEL'])
    assert.equal(html.includes(text), false); assert.ok(html.includes('hidden test cases')); });
test('Preview escapes executable markup', () => { const p = sample(); p.title = '<img src=x onerror=alert(1)>'; assert.equal(problemPreview(p).includes('<img src=x'), false); });
test('the same text in a Track is independent content', () => { const p = sample(), t = newTrack(), owned = newProblem('track', t); owned.title = p.title; owned.description = p.description; assert.notEqual(p.id, owned.id); owned.description = 'new'; assert.notEqual(p.description, owned.description); assert.equal(owned.languages.length, 1); });
test('closed question types and answer keys are validated', () => { const q = newQuestion('single'); q.title = 'Choose'; q.options = ['A', 'B']; q.correct = [3]; assert.ok(failures(validateQuestion(q)).length); q.correct = [1]; assert.equal(failures(validateQuestion(q)).length, 0); q.type = 'essay'; assert.ok(failures(validateQuestion(q)).length); });
test('numerical tolerance and whole marks are checked', () => { const q = newQuestion('numerical'); q.title = 'Number'; q.relative = true; q.tolerance = 11; assert.ok(failures(validateQuestion(q)).length); q.tolerance = 2; q.marks = 1.5; assert.ok(failures(validateQuestion(q)).length); });
test('boolean keys are not truthy strings', () => { const q = newQuestion('boolean'); q.title = 'True?'; q.boolean = 'false'; assert.ok(failures(validateQuestion(q)).length); q.boolean = false; assert.equal(failures(validateQuestion(q)).length, 0); });
test('both paper types have a structurally complete seeded paper', () => { const db = createSeed(); for (const p of db.papers)
    assert.equal(failures(validatePaper(p, db)).length, 0); });
test('Company Actual requires dated source and permission', () => { const db = createSeed(), p = db.papers[1]; p.provenance = 'Actual'; assert.ok(failures(validatePaper(p, db)).length); p.source = 'Approved source'; p.sourceDate = '2026-01-01'; p.permission = 'Recorded permission'; assert.equal(failures(validatePaper(p, db)).length, 0); });
test('Company job role must belong to the paper company', () => { const db = createSeed(); db.papers[1].role = 'Unrelated role'; assert.ok(failures(validatePaper(db.papers[1], db)).length); });
test('fresh recorded-test grants require the notice', () => { const db = createSeed(), p = db.papers[0]; p.freshTest = true; p.notify = false; assert.ok(failures(validatePaper(p, db)).length); });
test('safe project paths reject traversal and invalid names', () => { for (const p of ['../x', 'a/../../x', '/etc/file', 'a\\b', 'a//b', 'x\0y'])
    assert.equal(validPath(p), false); assert.equal(validPath('src/main.py'), true); });
test('template has runnable, runtime-specific entry names', () => { assert.equal(newTemplate('java').entry, 'Main.java'); assert.equal(newTemplate('cpp').entry, 'main.cpp'); assert.equal(newTemplate('javascript').entry, 'main.js'); });
test('template rejects duplicate paths and missing entry', () => { const t = clone(createSeed().templates[0]); t.files.push(clone(t.files[0])); assert.ok(failures(validateTemplate(t)).length); t.files.pop(); t.entry = 'missing.py'; assert.ok(failures(validateTemplate(t)).length); });
test('binary file quota uses original bytes rather than base64 characters', () => { const t = clone(createSeed().templates[0]); t.files.push({ path: 'asset.bin', content: 'AA==', binary: true, bytes: 10485761 }); assert.ok(failures(validateTemplate(t)).length); });
test('template task file pointers must resolve', () => { const t = clone(createSeed().templates[0]); t.tasks[0].file = 'missing'; assert.ok(failures(validateTemplate(t)).length); });
test('required video refuses missing transcript or processing state', () => { const db = createSeed(), s = db.subjects[1], l = s.chapters[0].lessons[0]; l.videoState = 'Processing'; assert.ok(failures(validateSubject(s, db)).length); l.videoState = 'Ready'; l.transcript = ''; assert.ok(failures(validateSubject(s, db)).length); });
test('response set has every current kind with complete copy', () => { const db = createSeed(), r = db.responseSets[0]; assert.equal(failures(checksFor('responseSets', r, db)).length, 0); r.items.pop(); assert.ok(failures(checksFor('responseSets', r, db)).length); });
test('imports reject invalid batch shape without partial rows', () => { assert.throws(() => validateImport({ kind: 'problems', items: [{ title: 'First' }, {}] }, 'problems')); assert.throws(() => validateImport({ kind: 'papers', items: [] }, 'problems')); });
test('prototype-polluting paths are refused', () => { assert.throws(() => setPath({}, '__proto__.polluted', true)); assert.equal({}.polluted, undefined); });
test('reordering outside bounds does not corrupt a list', () => assert.deepEqual(move(['a', 'b'], 0, -1), ['a', 'b']));
test('draft save leaves published copy unchanged', () => { reset(); const r = clone(store.getDB().problems[0]), live = r.live.description; r.description = 'Changed draft'; store.saveRecord('problems', r, r.revision); assert.equal(store.getDB().problems[0].live.description, live); });
test('stale save raises conflict instead of overwriting', () => { reset(); const a = clone(store.getDB().problems[0]), b = clone(a); a.title = 'First save'; store.saveRecord('problems', a, a.revision); b.title = 'Stale save'; assert.throws(() => store.saveRecord('problems', b, b.revision), /CONFLICT/); assert.equal(store.getDB().problems[0].title, 'First save'); });
test('simulated save outage writes nothing', () => { reset(); const r = clone(store.getDB().problems[0]); store.setScenario('save-failure'); r.title = 'Unsaved'; assert.throws(() => store.saveRecord('problems', r, r.revision)); assert.notEqual(store.getDB().problems[0].title, 'Unsaved'); store.setScenario('normal'); });
test('Admin cannot publish or change live lifecycle', () => { reset(); const r = clone(store.getDB().problems[0]); store.setRole('Admin'); assert.throws(() => store.publishRecord('problems', r, passed(r)), /Super Admin/); assert.throws(() => store.lifecycle('problems', r, 'Archive'), /Super Admin/); });
test('Admin submits, Super Admin approves the exact draft', () => { reset(); let r = clone(store.getDB().problems[0]); store.setRole('Admin'); r = store.submitRecord('problems', r, passed(r)); assert.equal(r.status, 'Submitted'); store.setRole('Super Admin'); r = store.approve('problems', r, true); assert.equal(r.status, 'Published'); assert.equal(r.submitted, null); });
test('editing a submitted draft removes stale approval', () => { reset(); let r = clone(store.getDB().problems[0]); store.setRole('Admin'); r = store.submitRecord('problems', r, passed(r)); r.title = 'New submitted content'; r = store.saveRecord('problems', r, r.revision); assert.equal(r.submitted, undefined); });
test('verification interruption preserves the saved draft', () => { reset(); const r = clone(store.getDB().problems[0]); store.setScenario('verification'); assert.throws(() => store.publishRecord('problems', r, passed(r)), /verification/); assert.equal(store.getDB().problems[0].revision, r.revision); store.setScenario('normal'); });
test('beginning a Daily locks grading edits', () => { reset(); let r = clone(store.getDB().problems.find(x => x.kind === 'daily')); r.date = '2020-01-01'; r.live = contentOf(r); r.cases[0].expected = 'A changed answer'; store.update(d => { d.problems[d.problems.findIndex(x => x.id === r.id)] = clone(r); }, null); assert.throws(() => store.publishRecord('problems', r, passed(r)), /locked/); });
test('generic Unpublish cannot bypass Daily scheduling', () => { reset(); const r = clone(store.getDB().problems.find(x => x.kind === 'daily')); assert.throws(() => store.lifecycle('problems', r, 'Unpublish'), /does not support/); });
test('deleting a Track removes only its independently owned problems', () => { reset(); const r = clone(store.getDB().tracks[0]); store.lifecycle('tracks', r, 'Delete'); assert.equal(store.getDB().problems.some(p => p.trackId === r.id), false); assert.ok(store.getDB().problems.some(p => p.id === 'challenge-parentheses')); });
test('an obsolete destructive confirmation is rejected', () => { reset(); const r = clone(store.getDB().problems[0]); store.saveRecord('problems', { ...r, title: 'Changed' }, r.revision); assert.throws(() => store.lifecycle('problems', r, 'Delete'), /changed/); });
test('core state operations record attributable demo history', () => { reset(); const r = clone(store.getDB().problems[0]); store.saveRecord('problems', r, r.revision); assert.equal(store.getDB().audit[0].actor, 'Demo owner'); assert.equal(store.getDB().audit[0].action, 'Saved draft'); });

test('an obsolete rejection cannot overwrite a changed submission', () => {
    reset(); let submitted = clone(store.getDB().problems[0]);
    submitted = store.submitRecord('problems', submitted, passed(submitted));
    const updated = clone(submitted); updated.title = 'Changed after review opened';
    store.saveRecord('problems', updated, updated.revision);
    assert.throws(() => store.approve('problems', submitted, false, 'Old review'), /changed/);
    assert.equal(store.getDB().problems[0].title, 'Changed after review opened');
});
test('appearance still applies for the visit when preference storage fails', () => {
    reset(); const original = globalThis.localStorage;
    globalThis.localStorage = { getItem: () => null, setItem: () => { throw Error('Storage blocked'); } };
    try { store.preferences({ theme: 'halo' }); assert.equal(store.getPreferences().theme, 'halo'); }
    finally { globalThis.localStorage = original; store.resetDemo(); }
});
