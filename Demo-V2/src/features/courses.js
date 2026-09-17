import { esc, icon, button, link, badge, field, toggle, section, heading, table, empty, note, codeField, tabs, download, markdown } from '../ui.js';
import { newSubject, newLesson, newQuestion, id, LANGUAGES, DIFFICULTIES } from '../data.js';
import { clone, move, contentOf } from '../model.js';
import * as store from '../store.js';
import { editorHeader, sectionNav, validationPanel, wireAuthoring } from '../authoring.js';
import { questionFields, bindQuestion, QUESTION_TYPES } from '../questions.js';
const LESSON_TYPES = [['reading', 'Reading'], ['video', 'Video'], ['quiz', 'Quiz'], ['project', 'Assigned project'], ['activity', 'Linked activity']];
export function renderCourses(ctx) {
    const parts = ctx.path.split('/').filter(Boolean);
    if (parts[2] === 'approvals')
        return ctx.globalFeature('approvals', 'subjects');
    if (parts[2] === 'transfer')
        return transfer(ctx);
    if (!parts[2])
        return catalogue(ctx);
    let source, lessonId;
    if (parts[2] === 'lessons') {
        lessonId = parts[3];
        source = ctx.db.subjects.find(s => s.chapters.some(c => c.lessons.some(l => l.id === lessonId)));
    }
    else
        source = ctx.db.subjects.find(s => s.id === parts[2]);
    if (!source)
        return ctx.notFound('Subject or lesson not found.');
    return editor(ctx, source, lessonId, parts);
}
function catalogue(ctx) {
    const format = ctx.query.get('format') || ctx.view.format || 'All';
    ctx.on('course-format', v => { ctx.view.format = v; ctx.render(); });
    ctx.on('new-subject', () => ctx.dialog('Create a subject', `${field('Title', 'title', '', { required: true })}${field('Learning format', 'format', format === 'Video Courses' ? format : 'Lessons', { options: ['Lessons', 'Video Courses'] })}`, { confirm: 'Create draft', onConfirm: v => { if (v.title.trim().length < 2)
            throw Error('Add a title.'); const s = { ...newSubject(v.format), title: v.title.trim() }; store.createRecord('subjects', s); ctx.navigate(`/admin/courses/${s.id}`, true); } }));
    const items = ctx.db.subjects.filter(s => format === 'All' || s.format === format);
    return `${heading('Courses', 'Written and video learning. One subject → chapter → lesson hierarchy.', button('New subject', 'new-subject', { primary: true, icon: 'plus' }), 'LEARNING / ADMIN')}${tabs(['All', 'Lessons', 'Video Courses'], format, 'course-format')}<div class="subnav-links">${link('Publication approvals', '/admin/courses/approvals')}${link('Import / export', '/admin/courses/transfer')}</div><div class="content-grid">${items.map(s => `<article class="card content-card"><div class="card-top"><span class="tile-icon">${icon(s.format === 'Lessons' ? 'book' : 'play')}</span>${badge(s.status)}</div><h3>${link(s.title, `/admin/courses/${s.id}`)}</h3><p>${esc(s.description || 'An unfinished subject draft.')}</p><div class="card-bottom"><span>${s.chapters.length} chapters · ${s.chapters.reduce((n, c) => n + c.lessons.length, 0)} lessons</span>${badge(s.format)}</div></article>`).join('')}</div>`;
}
function editor(ctx, source, lessonId, parts) {
    const s = ctx.edit('subjects', source.id), d = s.draft;
    const view = parts.at(-1);
    const mapping = { 'order-preview': 'preview', publish: 'checks', settings: 'settings', retirement: 'lifecycle', review: 'review' };
    if (s.route !== ctx.path) {
        if (lessonId) {
            s.section = 'curriculum';
            s.lessonId = lessonId;
        }
        else if (parts.includes('chapters')) {
            s.section = 'curriculum';
            s.chapterId = parts.at(-1);
        }
        else if (mapping[view])
            s.section = mapping[view];
        s.route = ctx.path;
    }
    wireAuthoring(ctx, s, { back: '/admin/courses', preview: () => previewSubject(d), onField: path => { if (path.endsWith('.type'))
            ctx.render(); } });
    ctx.on('chapter-select', key => { s.chapterId = key; s.lessonId = null; ctx.render(); });
    ctx.on('lesson-select', key => { s.lessonId = key; ctx.render(); });
    ctx.on('chapter-add', () => { d.chapters.push({ id: id('chapter'), title: `Chapter ${d.chapters.length + 1}`, lessons: [] }); s.chapterId = d.chapters.at(-1).id; s.lessonId = null; ctx.markDirty(s); ctx.render(); });
    ctx.on('chapter-up', key => { d.chapters = move(d.chapters, d.chapters.findIndex(c => c.id === key), -1); ctx.markDirty(s); ctx.render(); });
    ctx.on('chapter-remove', key => ctx.dialog('Remove chapter', `<p>The chapter and its lessons will leave this draft. Earned completion and certificates are not reset.</p>`, { confirm: 'Remove chapter', danger: true, onConfirm: () => { d.chapters = d.chapters.filter(c => c.id !== key); s.chapterId = null; s.lessonId = null; ctx.markDirty(s); ctx.render(); } }));
    let ci = s.lessonId ? d.chapters.findIndex(c => c.lessons.some(l => l.id === s.lessonId)) : d.chapters.findIndex(c => c.id === s.chapterId);
    ci = Math.max(0, ci);
    const chapter = d.chapters[ci];
    let li = Math.max(0, chapter?.lessons.findIndex(l => l.id === s.lessonId) ?? 0);
    const lesson = chapter?.lessons[li];
    const prefix = `chapters.${ci}.lessons.${li}`;
    ctx.on('lesson-add', () => { if (!chapter)
        throw Error('Create a chapter first.'); ctx.dialog('Add a lesson', `${field('Title', 'title', '', { required: true })}${field('Lesson type', 'type', 'reading', { options: LESSON_TYPES })}`, { confirm: 'Add lesson', onConfirm: v => { if (!v.title.trim())
            throw Error('Add a title.'); const l = { ...newLesson(v.type), title: v.title }; chapter.lessons.push(l); s.lessonId = l.id; ctx.markDirty(s); ctx.render(); } }); });
    ctx.on('lesson-type', () => { if (!lesson)
        return; ctx.dialog('Change lesson type', `${field('New lesson type', 'type', lesson.type, { options: LESSON_TYPES })}${note('Changing type removes its current type-specific content from this draft. Recorded learner completion and awards are not reset.', 'warning')}`, { confirm: 'Change type in draft', onConfirm: v => { if (v.type === lesson.type)
            return; const replacement = { ...newLesson(v.type), id: lesson.id, title: lesson.title, outcomes: lesson.outcomes, required: lesson.required }; Object.keys(lesson).forEach(k => delete lesson[k]); Object.assign(lesson, replacement); ctx.markDirty(s); ctx.render(); } }); });
    ctx.on('lesson-remove', key => ctx.dialog('Remove lesson', `<p>Remove this lesson from the draft. Existing completed-course recognition is preserved.</p>`, { confirm: 'Remove lesson', danger: true, onConfirm: () => { chapter.lessons = chapter.lessons.filter(l => l.id !== key); s.lessonId = null; ctx.markDirty(s); ctx.render(); } }));
    ctx.on('lesson-duplicate', key => { const l = clone(chapter.lessons.find(l => l.id === key)); l.id = id('lesson'); l.title += ' · copy'; chapter.lessons.push(l); s.lessonId = l.id; ctx.markDirty(s); ctx.render(); });
    ctx.on('lesson-up', key => { chapter.lessons = move(chapter.lessons, chapter.lessons.findIndex(l => l.id === key), -1); ctx.markDirty(s); ctx.render(); });
    ctx.on('lesson-move', key => ctx.dialog('Move lesson', field('Destination chapter', 'target', '', { options: d.chapters.filter(c => c.id !== chapter.id).map(c => [c.id, c.title]) }), { confirm: 'Move lesson', onConfirm: v => { const target = d.chapters.find(c => c.id === v.target); if (!target)
            throw Error('Select a different chapter.'); const l = chapter.lessons.find(x => x.id === key); chapter.lessons = chapter.lessons.filter(x => x.id !== key); target.lessons.push(l); s.chapterId = target.id; s.lessonId = l.id; ctx.markDirty(s); ctx.render(); } }));
    if (lesson) {
        ctx.on('block-add', () => ctx.dialog('Add content section', field('Section type', 'type', 'text', { options: [['heading', 'Heading'], ['text', 'Markdown text'], ['callout', 'Callout'], ['image', 'Image'], ['code', 'Display code'], ['executable', 'Executable example']] }), { confirm: 'Add section', onConfirm: v => { lesson.blocks.push({ id: id('block'), type: v.type, content: '', language: 'python', alt: '', caption: '', tone: 'Note' }); ctx.markDirty(s); ctx.render(); } }));
        ctx.on('block-remove', v => { lesson.blocks.splice(Number(v), 1); ctx.markDirty(s); ctx.render(); });
        ctx.on('block-up', v => { lesson.blocks = move(lesson.blocks, Number(v), -1); ctx.markDirty(s); ctx.render(); });
        ctx.on('course-question-add', () => ctx.dialog('Add quiz question', field('Question type', 'type', 'single', { options: QUESTION_TYPES.filter(t => t[0] !== 'coding') }), { confirm: 'Add question', onConfirm: v => { lesson.questions.push(newQuestion(v.type)); s.quizIndex = lesson.questions.length - 1; ctx.markDirty(s); ctx.render(); } }));
        ctx.on('course-question-select', v => { s.quizIndex = Number(v); ctx.render(); });
        ctx.on('course-question-remove', v => { lesson.questions.splice(Number(v), 1); s.quizIndex = 0; ctx.markDirty(s); ctx.render(); });
        ctx.on('video-process', async () => { if (!lesson.videoName)
            throw Error('Select a local file or give the mock video a filename.'); lesson.videoState = 'Processing'; ctx.markDirty(s); ctx.render(); await new Promise(r => setTimeout(r, 900)); lesson.videoState = store.scenario === 'unavailable' ? 'Failed' : 'Ready'; ctx.markDirty(s); ctx.render(); ctx.toast('Video-processing state simulated. No upload or transcoding occurred.'); });
        ctx.after.push(root => { const upload = root.querySelector('[data-video-file]'); upload?.addEventListener('change', () => { const file = upload.files[0]; if (file) {
            lesson.videoName = file.name;
            lesson.videoState = 'Selected';
            ctx.markDirty(s);
            ctx.render();
        } }); });
    }
    const current = s.section || 'curriculum';
    let body = '';
    if (current === 'details')
        body = section('details', 'About this subject', 'These fields also supply its learner overview. No duplicate introduction to maintain.', `<div class="form-grid">${field('Title', 'title', d.title, { wide: true, required: true })}${field('Format', 'format', d.format, { readonly: true })}${field('Difficulty', 'difficulty', d.difficulty, { options: DIFFICULTIES })}${field('Description', 'description', d.description, { textarea: true, wide: true })}${field('Audience', 'audience', d.audience, { required: true })}${field('Prior knowledge', 'priorKnowledge', d.priorKnowledge)}${field('Learning outcomes · one per line', 'outcomes', d.outcomes, { textarea: true, wide: true, required: true })}${field('Estimated minutes', 'estimatedMinutes', d.estimatedMinutes, { type: 'number', min: 1 })}${field('Languages & tools', 'tools', d.tools)}${field('Skill', 'skill', d.skill)}${field('Tags', 'tags', d.tags)}${field('Authorship / source', 'source', d.source, { wide: true })}</div>`);
    if (current === 'curriculum') {
        let lessonForm = '';
        if (lesson) {
            lessonForm = `<div class="subheading"><h3>${esc(lesson.title || 'Untitled lesson')}</h3><div class="actions">${button('↑', 'lesson-up', { id: lesson.id, small: true })}${button('Change type', 'lesson-type', { small: true })}${button('Move', 'lesson-move', { id: lesson.id, small: true, disabled: d.chapters.length < 2 })}${button('Duplicate', 'lesson-duplicate', { id: lesson.id, small: true })}${button('Remove', 'lesson-remove', { id: lesson.id, small: true, danger: true })}</div></div><div class="form-grid mb">${field('Lesson title', `${prefix}.title`, lesson.title, { required: true, wide: true })}${field('Learning outcomes', `${prefix}.outcomes`, lesson.outcomes, { textarea: true, rows: 2, wide: true, required: true })}</div>${badge(LESSON_TYPES.find(t => t[0] === lesson.type)?.[1] || lesson.type)}${toggle('Required lesson', `${prefix}.required`, lesson.required)}`;
            if (lesson.type === 'reading')
                lessonForm += `<div class="mt">${field('Markdown lesson body', `${prefix}.body`, lesson.body, { textarea: true, rows: 12 })}</div><div class="mt">${lesson.blocks.map((b, i) => `<div class="hint-card"><div class="subheading"><h3>${esc(b.type)} section</h3><div class="actions">${button('↑', 'block-up', { id: String(i), small: true })}${button('Remove', 'block-remove', { id: String(i), small: true })}</div></div>${['code', 'executable'].includes(b.type) ? `${field('Language', `${prefix}.blocks.${i}.language`, b.language, { options: LANGUAGES })}<div class="mt">${codeField(`${prefix}.blocks.${i}.content`, b.content, b.language, b.type === 'code' ? 'Display-only code' : 'Executable example')}</div>` : b.type === 'image' ? `${field('Image URL / local asset reference', `${prefix}.blocks.${i}.content`, b.content)}${field('Alternative text', `${prefix}.blocks.${i}.alt`, b.alt)}${field('Caption', `${prefix}.blocks.${i}.caption`, b.caption)}` : `${b.type === 'callout' ? field('Callout type', `${prefix}.blocks.${i}.tone`, b.tone, { options: ['Note', 'Tip', 'Warning'] }) : ''}${field('Content', `${prefix}.blocks.${i}.content`, b.content, { textarea: b.type !== 'heading', rows: 4 })}`}</div>`).join('')}${button('Add content section', 'block-add', { icon: 'plus' })}</div>`;
            if (lesson.type === 'video')
                lessonForm += `<div class="mt">${note('Local workflow simulation: the filename and processing state are retained, not the uploaded video bytes.')}<div class="field mb"><label for="video-file">Select a local video</label><input id="video-file" type="file" accept="video/mp4,video/webm" data-video-file /></div>${field('Video filename', '' + prefix + '.videoName', lesson.videoName)}<div class="actions mt">${badge(lesson.videoState)}${button('Simulate processing', 'video-process', { icon: 'play' })}</div><div class="form-grid mt">${field('Captions (WebVTT text)', `${prefix}.captions`, lesson.captions, { textarea: true, rows: 7, mono: true })}${field('Transcript', `${prefix}.transcript`, lesson.transcript, { textarea: true, rows: 7 })}</div></div>`;
            if (lesson.type === 'project')
                lessonForm += `<div class="mt">${field('Assigned template', `${prefix}.templateId`, lesson.templateId, { options: [['', 'Select a published template'], ...ctx.db.templates.filter(t => t.status === 'Published').map(t => [t.id, t.title])] })}${note('Workspace owns the learner’s files. A nonempty checked checklist plus explicit learner confirmation completes the assigned work. No project grader is introduced.')}</div>`;
            if (lesson.type === 'activity')
                lessonForm += `<div class="mt">${field('Existing activity destination', `${prefix}.activity`, lesson.activity, { placeholder: '/challenges/challenge-parentheses' })}${note('Completion is supplied by the activity’s owner. Courses does not create another solve.')}</div>`;
            if (lesson.type === 'quiz') {
                const qindex = Math.min(s.quizIndex || 0, Math.max(0, lesson.questions.length - 1)), q = lesson.questions[qindex];
                if (q)
                    bindQuestion(ctx, q, s);
                lessonForm += `<div class="form-grid mt">${field('Optional timer (minutes; 0 = none)', `${prefix}.timer`, lesson.timer, { type: 'number', min: 0 })}${field('Optional pass % (0 = complete on submission)', `${prefix}.passPercent`, lesson.passPercent, { type: 'number', min: 0, max: 100 })}</div>${toggle('Shuffle questions', `${prefix}.shuffleQuestions`, lesson.shuffleQuestions)}${toggle('Shuffle options', `${prefix}.shuffleOptions`, lesson.shuffleOptions)}<div class="language-strip mt">${lesson.questions.map((q, i) => `<button class="language-button ${i === qindex ? 'active' : ''}" data-action="course-question-select" data-id="${i}">Question ${i + 1}</button>`).join('')}${button('Add question', 'course-question-add', { small: true, icon: 'plus' })}</div>${q ? `${questionFields(q, `${prefix}.questions.${qindex}`, true)}<div class="mt">${button('Remove question', 'course-question-remove', { id: String(qindex), small: true, danger: true })}</div>` : empty('No quiz questions', 'Add a supported question type.')}`;
            }
        }
        body = section('curriculum', 'Chapters & lessons', 'Stay in one authoring workspace. Select a lesson to edit its content.', `<div class="split-workspace"><div class="split-side"><div class="subheading"><h3>Subject outline</h3>${button('Add', 'chapter-add', { small: true, icon: 'plus' })}</div>${d.chapters.map(c => `<div class="mb"><button class="tree-row ${c.id === chapter?.id ? 'active' : ''}" data-action="chapter-select" data-id="${c.id}"><strong>${icon('folder')} ${esc(c.title)}</strong><small>${c.lessons.length}</small></button>${c.lessons.map(l => `<button class="tree-row ${l.id === lesson?.id ? 'active' : ''}" style="padding-left:23px" data-action="lesson-select" data-id="${l.id}"><span>${icon(l.type === 'video' ? 'play' : l.type === 'quiz' ? 'shield' : 'file')} ${esc(l.title || 'Untitled')}</span></button>`).join('')}</div>`).join('')}${button('Add lesson', 'lesson-add', { small: true, icon: 'plus', disabled: !chapter })}</div><div class="v-splitter" data-split="--left-width" role="separator" aria-label="Resize course outline" aria-orientation="vertical" aria-valuenow="260" tabindex="0"></div><div class="split-content">${chapter ? `<details class="mb"><summary>Chapter details</summary><div class="mt">${field('Chapter title', `chapters.${ci}.title`, chapter.title)}</div><div class="actions mt">${button('Move chapter up', 'chapter-up', { id: chapter.id, small: true })}${button('Remove chapter', 'chapter-remove', { id: chapter.id, small: true, danger: true })}</div></details>` : ''}${lesson ? lessonForm : empty('This chapter is ready for a lesson', 'Add reading, video, quiz, assigned project or a linked activity.', button('Add lesson', 'lesson-add', { primary: true, icon: 'plus', disabled: !chapter }))}</div></div>`);
    }
    if (current === 'settings')
        body = section('settings', 'Learning & recognition', 'Changing published content does not revoke earned completion.', `<div class="form-grid">${field('Navigation', 'navigation', d.navigation, { options: d.format === 'Video Courses' ? ['Open', 'Sequential'] : ['Open'] })}${field('Certificate presentation', 'presentation', d.presentation, { options: ['Platform style', 'Course specific'] })}${field('Explicit prerequisite', 'prerequisite', d.prerequisite, { wide: true })}${field('Next learning destination', 'next', d.next, { wide: true })}</div>${d.format === 'Lessons' ? toggle('Issue a certificate on completion', 'certificate', d.certificate, 'Off by default. Enabling later does not back-issue past awards.') : note('Every completed video subject issues a certificate. No course XP is awarded.')}${note('Published changes trigger the mandatory course-change notice. Existing completed progress and issued certificates stay unchanged.')}`);
    if (current === 'preview')
        body = section('preview', 'Learner order preview', 'Read-only; no enrollment, executable run, completion or award.', previewSubject(d));
    if (current === 'checks')
        body = section('checks', 'Before publication', 'Validate this exact draft from the side panel.', note('Required media, outcomes, structure and applicable executable examples must be ready. Missing checks are not passes.'));
    if (current === 'lifecycle')
        body = section('lifecycle', 'Archive or Delete', 'Use More to review the specific consequences.', note('Archive retires new discovery while protecting existing enrolled work. Delete removes authored content, not earned completion or certificate award information.', 'warning'));
    if (current === 'review')
        body = section('review', 'Content review', 'Demo sample counts, not a live report.', table(['Lesson', 'Sample reach', 'Sample completions'], d.chapters.flatMap(c => c.lessons).map((l, i) => [esc(l.title), String(50 - i * 5), String(38 - i * 4)])));
    if (parts.at(-1) === 'revisions')
        body += section('revisions', 'Retained authoring revisions', 'Restore a prior draft from More → Restore earlier draft.', table(['Saved at', 'Subject'], (d.history || []).map(h => [esc(new Date(h.at).toLocaleString()), esc(h.content.title)])));
    return `${editorHeader(s, '/admin/courses', 'LEARNING / ' + d.format.toUpperCase())}${sectionNav([['curriculum', 'Curriculum'], ['details', 'Details'], ['settings', 'Settings'], ['preview', 'Preview'], ['checks', 'Checks'], ['review', 'Review']], current)}<div class="editor-layout"><div>${body}</div>${validationPanel(s)}</div>`;
}
function previewSubject(s) { return `<article class="preview-article">${badge(s.format)}<h2>${esc(s.title)}</h2>${markdown(s.description)}<p>${esc(s.outcomes)}</p>${s.chapters.map(c => `<h3 class="mt">${esc(c.title)}</h3>${c.lessons.map(l => `<div class="stat-line"><span>${esc(l.title)}</span>${badge(`${l.type} · ${l.required ? 'Required' : 'Optional'}`)}</div>`).join('')}`).join('')}</article>`; }
function transfer(ctx) { ctx.on('export-subjects', () => download('subject-drafts.json', JSON.stringify({ kind: 'subjects', items: ctx.db.subjects.map(contentOf) }, null, 2))); ctx.on('import-subjects', () => { let parsed; try {
    parsed = JSON.parse(document.querySelector('[data-subject-import]').value);
}
catch {
    throw Error('Invalid JSON. Nothing was imported.');
} if (parsed.kind !== 'subjects' || !Array.isArray(parsed.items) || !parsed.items.length)
    throw Error('Use the subject-drafts export format.'); if (JSON.stringify(parsed).length > 10485760)
    throw Error('Import exceeds 10 MiB.'); for (const [i, s] of parsed.items.entries()) {
    if (!s.title || !Array.isArray(s.chapters) || s.chapters.some(c => !Array.isArray(c.lessons)))
        throw Error(`Subject ${i + 1}: a valid title and chapter/lesson structure are required.`);
    if (s.chapters.reduce((n, c) => n + c.lessons.length, 0) > 500)
        throw Error(`Subject ${i + 1}: more than 500 lessons.`);
} store.update(db => { for (const item of parsed.items) {
    const s = { ...newSubject(item.format), ...clone(item), id: id('subject'), status: 'Draft', live: undefined, revision: 1 };
    s.chapters = s.chapters.map(c => ({ ...c, id: id('chapter'), lessons: c.lessons.map(l => ({ ...l, id: id('lesson') })) }));
    db.subjects.push(s);
} }, 'Imported subject drafts', `${parsed.items.length} subjects`); ctx.toast('Independent subject drafts imported. Nothing published.'); ctx.navigate('/admin/courses', true); }); return `${heading('Subject import / export', 'Move authored drafts—not learner progress or private files.', link('Back to Courses', '/admin/courses', 'btn'), 'LEARNING / ADMIN')}${section('transfer', 'Whole-subject transfer', 'JSON is the explicit format of this prototype.', `${button('Export authored drafts', 'export-subjects', { icon: 'download' })}<div class="field mt"><label for="subject-import">Paste subject-drafts JSON</label><textarea id="subject-import" rows="16" class="mono" data-subject-import></textarea></div><div class="mt">${button('Validate & import', 'import-subjects', { primary: true, icon: 'upload' })}</div>${note('Media references are included. Video/image bytes and learner records are not exported.')}`)}`; }
