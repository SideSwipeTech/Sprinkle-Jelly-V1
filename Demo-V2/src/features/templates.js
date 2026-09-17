import { esc, icon, button, link, badge, field, section, heading, table, empty, note, codeField, download } from '../ui.js';
import { newTemplate, id, RUNTIMES } from '../data.js';
import { validPath, clone, move } from '../model.js';
import * as store from '../store.js';
import { editorHeader, sectionNav, validationPanel, wireAuthoring } from '../authoring.js';
const languageFor = path => ({ py: 'python', js: 'javascript', ts: 'typescript', html: 'html', css: 'css', java: 'java', c: 'c', cpp: 'cpp', json: 'json', sql: 'sql', md: 'markdown' }[path.split('.').at(-1)] || 'plaintext');
const fileBytes = f => f.binary ? f.bytes : new TextEncoder().encode(f.content).length;
export function renderTemplates(ctx) {
    const selected = ctx.query.get('template');
    const template = ctx.db.templates.find(t => t.id === selected);
    ctx.on('new-template', () => ctx.dialog('New starter template', `${field('Name', 'title', '', { required: true })}${field('Runtime', 'runtime', 'python', { options: RUNTIMES.filter(r => r[0] !== 'sql') })}`, { confirm: 'Create draft', onConfirm: v => { if (v.title.trim().length < 2)
            throw Error('Add a name.'); const t = { ...newTemplate(v.runtime), title: v.title }; if (!['python', 'html'].includes(t.runtime)) {
            const ext = { javascript: 'js', java: 'java', c: 'c', cpp: 'cpp', css: 'css', 'browser-js': 'js' }[t.runtime];
            t.entry = `main.${ext}`;
            t.files = [{ path: t.entry, content: `// Starter for ${t.runtime}\n` }];
        } store.createRecord('templates', t); ctx.navigate(`/admin/workspace/templates?template=${t.id}`, true); } }));
    if (!selected)
        return `${heading('Project templates', 'Small, useful starting points. Independent learner copies.', button('New template', 'new-template', { primary: true, icon: 'plus' }), 'BUILD / ADMIN')}<div class="content-grid">${ctx.db.templates.map(t => `<article class="card content-card"><div class="card-top"><span class="tile-icon">${icon('folder')}</span>${badge(t.status)}</div><h3>${link(t.title, `/admin/workspace/templates?template=${t.id}`)}</h3><p>${esc(t.description)}</p><div class="card-bottom"><span>${esc(t.runtime)} · ${t.files.length} files · ${t.tasks.length} tasks</span>${link('Open →', `/admin/workspace/templates?template=${t.id}`)}</div></article>`).join('')}</div>${note('Staff edit starter templates, never private learner projects. Template changes affect future copies only.')}`;
    if (!template)
        return ctx.notFound('Template not found.');
    const s = ctx.edit('templates', template.id), d = s.draft, current = s.section || 'files';
    wireAuthoring(ctx, s, { back: '/admin/workspace/templates', preview: () => preview(d) });
    const selectedPath = s.file || d.entry;
    const fi = Math.max(0, d.files.findIndex(f => f.path === selectedPath)), file = d.files[fi];
    ctx.on('file-select', path => { s.file = path; ctx.render(); });
    ctx.on('file-add', () => ctx.dialog('New file', field('Project-relative path', 'path', '', { placeholder: 'src/main.py', required: true, help: 'Folders are created implicitly by the path.' }), { confirm: 'Create file', onConfirm: v => { if (!validPath(v.path))
            throw Error('Use a safe relative path without .., empty segments or special characters.'); if (d.files.some(f => f.path === v.path))
            throw Error('A file already has that path.'); if (d.files.length >= 40)
            throw Error('The template has reached 40 files.'); d.files.push({ path: v.path, content: '' }); s.file = v.path; ctx.markDirty(s); ctx.render(); } }));
    ctx.on('folder-add', () => ctx.dialog('New folder', field('Relative folder path', 'path', '', { placeholder: 'src/components', required: true }), { confirm: 'Create folder', onConfirm: v => { if (!validPath(v.path))
            throw Error('Use a valid relative folder path.'); if (d.folders.includes(v.path) || d.files.some(f => f.path === v.path))
            throw Error('That path already exists.'); d.folders.push(v.path); ctx.markDirty(s); ctx.render(); } }));
    ctx.on('file-rename', () => { if (!file)
        return; ctx.dialog('Rename or move file', field('New relative path', 'path', file.path, { required: true }), { confirm: 'Apply path', onConfirm: v => { if (!validPath(v.path) || d.files.some(f => f !== file && f.path === v.path))
            throw Error('The path is invalid or already in use.'); const old = file.path; file.path = v.path; if (d.entry === old)
            d.entry = v.path; d.tasks.forEach(t => { if (t.file === old)
            t.file = v.path; }); s.file = v.path; ctx.markDirty(s); ctx.render(); } }); });
    ctx.on('file-delete', () => { if (!file)
        return; ctx.dialog('Delete template file', `<p>Delete <strong>${esc(file.path)}</strong> from this draft? Any entry-file or task link will need attention.</p>`, { typed: file.path, confirm: 'Delete file', danger: true, onConfirm: () => { d.files.splice(fi, 1); s.file = d.files[0]?.path; ctx.markDirty(s); ctx.render(); } }); });
    ctx.on('file-download', () => { if (file)
        download(file.path.split('/').at(-1), file.binary ? Uint8Array.from(atob(file.content), c => c.charCodeAt(0)) : file.content, file.binary ? 'application/octet-stream' : 'text/plain'); });
    ctx.on('template-task-add', () => { if (d.tasks.length >= 12)
        throw Error('At most 12 checklist tasks.'); d.tasks.push({ id: id('task'), title: '', instructions: '', file: '' }); ctx.markDirty(s); ctx.render(); });
    ctx.on('template-task-remove', v => { d.tasks.splice(Number(v), 1); ctx.markDirty(s); ctx.render(); });
    ctx.on('template-task-up', v => { d.tasks = move(d.tasks, Number(v), -1); ctx.markDirty(s); ctx.render(); });
    ctx.after.push(root => root.querySelector('[data-template-upload]')?.addEventListener('change', async (e) => { try {
        const files = [...e.target.files];
        if (d.files.length + files.length > 40)
            throw Error('This upload would exceed 40 files.');
        const staged = [];
        for (const f of files) {
            if (!validPath(f.name) || d.files.some(x => x.path === f.name) || staged.some(x => x.path === f.name))
                throw Error(`Invalid or duplicate path: ${f.name}. No files were added.`);
            const binary = !/\.(py|js|ts|html|css|java|c|cpp|h|json|md|txt|sql|csv|xml|yaml|yml)$/i.test(f.name);
            if (f.size > (binary ? 10485760 : 2097152))
                throw Error(`${f.name} exceeds its per-file limit.`);
            const buffer = new Uint8Array(await f.arrayBuffer());
            let content;
            if (binary) {
                let text = '';
                for (const b of buffer)
                    text += String.fromCharCode(b);
                content = btoa(text);
            }
            else
                content = new TextDecoder().decode(buffer);
            staged.push({ path: f.name, content, binary, bytes: f.size });
        }
        if (d.files.reduce((n, f) => n + fileBytes(f), 0) + staged.reduce((n, f) => n + fileBytes(f), 0) > 20000000)
            throw Error('This upload would exceed 20 MB.');
        d.files.push(...staged);
        s.file = staged[0]?.path;
        ctx.markDirty(s);
        ctx.render();
        ctx.toast('Files added to the draft. Save to retain them in this browser.');
    }
    catch (error) {
        ctx.toast(error.message, true);
    } }));
    const bytes = d.files.reduce((n, f) => n + fileBytes(f), 0);
    let body = '';
    if (current === 'files')
        body = section('files', 'Template workspace', 'Real file edits and paths. Running the template is simulated.', `<div class="subheading"><div class="actions">${badge(`${d.files.length}/40 files`)}${badge(`${(bytes / 1000000).toFixed(2)} / 20 MB`)}${badge(d.runtime)}</div><div class="actions">${button('File', 'file-add', { icon: 'plus', small: true })}${button('Folder', 'folder-add', { icon: 'folder', small: true })}<label class="btn small">${icon('upload')}Upload<input type="file" class="sr-only" multiple data-template-upload /></label></div></div><div class="split-workspace"><div class="split-side"><h3 style="padding:10px">Explorer</h3>${d.folders.map(f => `<div class="tree-row">${icon('folder')} ${esc(f)}/</div>`).join('')}${d.files.map(f => `<button class="tree-row ${f.path === file?.path ? 'active' : ''}" data-action="file-select" data-id="${esc(f.path)}"><span>${icon('file')} ${esc(f.path)}</span>${f.path === d.entry ? badge('Entry') : ''}</button>`).join('')}</div><div class="v-splitter" data-split="--left-width" role="separator" aria-label="Resize file explorer" aria-orientation="vertical" aria-valuenow="260" tabindex="0"></div><div class="split-content">${file ? `<div class="subheading"><span class="mono">${esc(file.path)}</span><div class="actions">${button('Rename / move', 'file-rename', { small: true })}${button('Download', 'file-download', { small: true, icon: 'download' })}${button('Delete', 'file-delete', { small: true, danger: true })}</div></div>${file.binary ? `${note('Binary asset: stored and downloadable, but not sent to terminal execution.')}<div class="empty"><h3>${esc(file.path)}</h3><p>${file.bytes.toLocaleString()} bytes</p></div>` : codeField(`files.${fi}.content`, file.content, languageFor(file.path), file.path, { large: true })}` : empty('No files yet', 'Create or upload a file to start editing.', button('New file', 'file-add', { icon: 'plus' }))}</div></div>`);
    if (current === 'checklist')
        body = section('checklist', 'Starter checklist', 'Useful guidance. A checked task is not an automatically graded result.', `${d.tasks.map((t, i) => `<div class="hint-card"><div class="subheading"><h3>Task ${i + 1}</h3><div class="actions">${button('↑', 'template-task-up', { id: String(i), small: true })}${button('Remove', 'template-task-remove', { id: String(i), small: true })}</div></div><div class="form-grid">${field('Task title', `tasks.${i}.title`, t.title, { required: true })}${field('Related file', `tasks.${i}.file`, t.file, { options: [['', 'No file pointer'], ...d.files.map(f => f.path)] })}${field('Instructions', `tasks.${i}.instructions`, t.instructions, { textarea: true, wide: true, rows: 3, maxlength: 500 })}</div></div>`).join('')}${button('Add task', 'template-task-add', { icon: 'plus', disabled: d.tasks.length >= 12 })}${note('Learners need at least one task, all checked, and explicit confirmation to complete a project. Templates may start without a checklist.')}`);
    if (current === 'details')
        body = section('details', 'Template details', 'The starter is copied into an independent learner project.', `<div class="form-grid">${field('Name', 'title', d.title, { required: true, wide: true })}${field('Description', 'description', d.description, { textarea: true, wide: true })}${field('Runtime', 'runtime', d.runtime, { readonly: true })}${field('Entry file', 'entry', d.entry, { options: d.files.filter(f => !f.binary).map(f => f.path) })}${field('Technology tags', 'tags', d.tags, { wide: true })}</div>${note('Runtime is fixed for the template’s intended project. Create a separate starter for another runtime.')}`);
    if (current === 'preview')
        body = section('preview', 'Template preview', 'No learner project is created.', preview(d));
    return `${editorHeader(s, '/admin/workspace/templates', 'BUILD / STARTER TEMPLATE')}${sectionNav([['files', 'Files'], ['checklist', 'Checklist'], ['details', 'Details'], ['preview', 'Preview']], current)}<div class="editor-layout"><div>${body}</div>${validationPanel(s)}</div>`;
}
function preview(d) { const html = d.files.find(f => f.path === d.entry && f.path.endsWith('.html')); if (!html)
    return `${note('Terminal execution is simulated. File contents and checklist can be reviewed below.')} ${table(['File', 'Bytes'], d.files.map(f => [esc(f.path), String(fileBytes(f))]))}`; const css = d.files.filter(f => f.path.endsWith('.css')).map(f => f.content).join('\n'); const content = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'none'"><style>${css.replaceAll('</style', '')}</style>${html.content}`; return `${note('Isolated HTML/CSS preview. Scripts and network requests are disabled; execution validation is a separate simulated action.')}<iframe title="Template learner preview" sandbox="" srcdoc="${esc(content)}" style="width:100%;height:450px;background:white;border:1px solid var(--line);border-radius:10px"></iframe>`; }
