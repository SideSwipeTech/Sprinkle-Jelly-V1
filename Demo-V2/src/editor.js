let loaderPromise;
const models = new Map();
const views = new Map();
const heights = new Map();
let active = [];
export function destroyEditors() { for (const x of active) {
    x.observer?.disconnect();
    if (x.editor && x.key)
        views.set(x.key, x.editor.saveViewState());
    for (const d of x.disposables || [])
        d.dispose();
    x.editor?.dispose();
} active = []; }
export function clearModels() { destroyEditors(); for (const v of models.values())
    v.dispose(); models.clear(); views.clear(); heights.clear(); }
async function loadMonaco() {
    if (loaderPromise)
        return loaderPromise;
    loaderPromise = new Promise((resolve, reject) => {
        if (window.monaco) {
            resolve(window.monaco);
            return;
        }
        const script = document.createElement('script');
        script.src = '/vendor/monaco/vs/loader.js';
        script.onerror = () => reject(Error('Monaco is not installed.'));
        script.onload = () => { window.require.config({ paths: { vs: '/vendor/monaco/vs' } }); window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject); };
        document.head.append(script);
    });
    return loaderPromise;
}
export function editorTheme() {
    if (!window.monaco)
        return;
    const c = getComputedStyle(document.documentElement);
    const color = k => c.getPropertyValue(k).trim();
    window.monaco.editor.defineTheme('wizly-local', { base: document.documentElement.dataset.mode === 'light' ? 'vs' : 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': color('--code-bg'), 'editor.foreground': color('--text'), 'editorLineNumber.foreground': color('--muted'), 'editor.selectionBackground': color('--selection'), 'editor.lineHighlightBackground': color('--raised'), 'editorCursor.foreground': color('--accent'), 'editorWidget.background': color('--panel'), 'editorWidget.border': color('--line') } });
    window.monaco.editor.setTheme('wizly-local');
}
export async function mountEditors(container, scope, onChange, identity = name => name) {
    const hosts = [...container.querySelectorAll('[data-code]')];
    for (const host of hosts) {
        const area = host.querySelector('textarea');
        area.addEventListener('input', () => onChange(host.dataset.code, area.value));
        area.addEventListener('keydown', e => { if (e.key === 'Tab' && !area.readOnly) {
            e.preventDefault();
            area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end');
            area.dispatchEvent(new Event('input', { bubbles: true }));
        } });
        const hKey = `${scope}/${identity(host.dataset.code)}/${host.dataset.language}`;
        setupHeight(host, hKey);
        host.querySelector('[data-editor-expand]').addEventListener('click', () => { host.classList.toggle('expanded'); host.querySelector('[data-editor-expand]').setAttribute('aria-label', host.classList.contains('expanded') ? 'Restore editor' : 'Expand editor'); host.querySelector('.code-mount')?.dispatchEvent(new Event('resize')); });
    }
    if (!hosts.length)
        return;
    try {
        const monaco = await loadMonaco();
        editorTheme();
        for (const host of hosts) {
            if (!host.isConnected)
                continue;
            const mount = host.querySelector('.code-mount');
            const old = host.querySelector('textarea');
            const value = old.value;
            const language = host.dataset.language === 'browser-js' ? 'javascript' : host.dataset.language;
            const key = `inmemory://wizly/${encodeURIComponent(scope)}/${encodeURIComponent(identity(host.dataset.code))}/${language}`;
            host.dataset.modelUri = key;
            let model = models.get(key);
            if (!model) {
                model = monaco.editor.createModel(value, language, monaco.Uri.parse(key));
                models.set(key, model);
            }
            else if (model.getValue() !== value) {
                model.pushEditOperations([], [{ range: model.getFullModelRange(), text: value }], () => null);
            }
            monaco.editor.setModelLanguage(model, language);
            mount.replaceChildren();
            const editor = monaco.editor.create(mount, { model, theme: 'wizly-local', readOnly: host.dataset.readonly === 'true', fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace', fontSize: 14, lineHeight: 23, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true, padding: { top: 16, bottom: 16 }, fontLigatures: false, ariaLabel: host.querySelector('.code-bar span').textContent.trim(), renderWhitespace: 'selection', tabSize: 4 });
            if (views.has(key))
                editor.restoreViewState(views.get(key));
            const disposables = [];
            disposables.push(editor.onDidChangeModelContent(() => onChange(host.dataset.code, model.getValue())));
            disposables.push(editor.onDidChangeCursorPosition(e => { host.querySelector('[data-editor-status]').textContent = `Monaco · Ln ${e.position.lineNumber}, Col ${e.position.column}`; }));
            host.querySelector('[data-editor-status]').textContent = 'Monaco · Ln 1, Col 1';
            const observer = new ResizeObserver(() => editor.layout());
            observer.observe(mount);
            active.push({ editor, observer, key, disposables });
        }
    }
    catch {
        for (const host of hosts) {
            if (!host.isConnected)
                continue;
            host.querySelector('[data-editor-status]').textContent = 'Plain-text recovery editor · install Monaco with pnpm install';
            host.classList.add('editor-unavailable');
        }
    }
}
function setupHeight(host, key) {
    const handle = host.querySelector('.height-handle');
    if (!handle)
        return;
    const set = h => { const height = Math.max(220, Math.min(900, h)); host.style.setProperty('--editor-height', `${height}px`); heights.set(key, height); handle.setAttribute('aria-valuenow', String(Math.round(height))); };
    if (heights.has(key))
        set(heights.get(key));
    handle.addEventListener('pointerdown', e => { e.preventDefault(); const y = e.clientY, h = host.querySelector('.code-mount').getBoundingClientRect().height; handle.setPointerCapture(e.pointerId); const move = ev => set(h + ev.clientY - y); const end = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end); }; handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end); });
    handle.addEventListener('keydown', e => { const current = host.querySelector('.code-mount').getBoundingClientRect().height; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        set(current + (e.key === 'ArrowDown' ? 30 : -30));
    } if (e.key === 'Home') {
        e.preventDefault();
        set(320);
    } });
}
export function mountSplitters(root) {
    for (const handle of root.querySelectorAll('[data-split]')) {
        const parent = handle.parentElement;
        const variable = handle.dataset.split;
        const min = Number(handle.dataset.min || 220), max = Number(handle.dataset.max || 620);
        const set = v => { const width = Math.max(min, Math.min(max, v)); parent.style.setProperty(variable, `${width}px`); handle.setAttribute('aria-valuenow', String(Math.round(width))); };
        const width = () => Number.parseFloat(getComputedStyle(parent).getPropertyValue(variable)) || 280;
        handle.addEventListener('pointerdown', e => { e.preventDefault(); const x = e.clientX, w = width(); handle.setPointerCapture(e.pointerId); const move = ev => set(w + ev.clientX - x); const end = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); handle.removeEventListener('pointercancel', end); }; handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end); });
        handle.addEventListener('keydown', e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            set(width() + (e.key === 'ArrowRight' ? 24 : -24));
        } if (e.key === 'Home') {
            e.preventDefault();
            set(280);
        } });
    }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape')
    document.querySelectorAll('.code-host.expanded').forEach(x => x.classList.remove('expanded')); });
