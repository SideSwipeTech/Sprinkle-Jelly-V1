export const esc = (v = '') => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paths = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
    book: 'M4 3h7v17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM20 3h-7v17h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z',
    check: 'm5 12 4 4L19 6', plus: 'M12 5v14M5 12h14', x: 'm6 6 12 12M6 18 18 6',
    arrow: 'M5 12h14m-5-5 5 5-5 5', back: 'M19 12H5m5-5-5 5 5 5', down: 'm6 9 6 6 6-6',
    search: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 6 6',
    calendar: 'M4 5h16v16H4zM8 2v6m8-6v6M4 11h16', bug: 'M8 8h8v9a4 4 0 0 1-8 0Zm0 4H3m18 0h-5M8 17H3m18 0h-5M9 4l-2-2m8 2 2-2M9 8V5h6v3M12 8v12',
    track: 'M5 4v16m0-12h11V4m-11 12h14v4M3 4h4m10 16h4',
    folder: 'M3 6h7l2 3h9v12H3z', file: 'M5 2h9l5 5v15H5zM14 2v6h5',
    shield: 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6z',
    people: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m9-7a4 4 0 0 1 0 7m0 4a4 4 0 0 1 4 4v3',
    chart: 'M4 20V10m8 10V4m8 16v-7', bell: 'M4 17h16l-2-3V8a6 6 0 0 0-12 0v6Zm6 4h4',
    trophy: 'M7 3h10v8a5 5 0 0 1-10 0ZM7 5H3v4a4 4 0 0 0 4 4m10-8h4v4a4 4 0 0 1-4 4m-5 3v5m-4 0h8',
    spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
    moon: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    lock: 'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4m-4 4v3',
    save: 'M3 3h15l3 3v15H3ZM7 3v6h10V3M7 21v-8h10v8',
    play: 'm7 3 15 9-15 9Z', refresh: 'M20 7v-5m0 5h-5M4 17v5m0-5h5M20 7a9 9 0 0 0-16 3m0 7a9 9 0 0 0 16-3',
    trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
    copy: 'M8 8h13v13H8zM4 16H2V2h14v2',
    upload: 'M12 16V2m-5 5 5-5 5 5M3 15v7h18v-7', download: 'M12 2v14m-5-5 5 5 5-5M3 15v7h18v-7',
    expand: 'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM3 12h2m14 0h2M12 3v2m0 14v2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
    dots: 'M4 12h1m6 0h1m6 0h1', alert: 'm12 2 11 19H1Zm0 6v5m0 4v1',
    branch: 'M6 3v12a5 5 0 0 0 5 5h7m0-17v6a5 5 0 0 1-5 5H6',
    layers: 'm12 2 10 6-10 6L2 8Zm-10 11 10 6 10-6M2 18l10 6 10-6',
    inbox: 'M4 3h16l2 11v7H2v-7Zm-2 11h6l2 3h4l2-3h6',
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`; }
export function button(text, action = '', opts = {}) { return `<button type="button" class="btn ${opts.primary ? 'primary' : ''} ${opts.danger ? 'danger' : ''} ${opts.small ? 'small' : ''} ${opts.ghost ? 'ghost' : ''}" ${action ? `data-action="${esc(action)}"` : ''} ${opts.id ? `data-id="${esc(opts.id)}"` : ''} ${opts.disabled ? 'disabled' : ''} ${opts.title ? `title="${esc(opts.title)}"` : ''}>${opts.icon ? icon(opts.icon) : ''}${esc(text)}</button>`; }
export function link(text, url, cls = '') { return `<a class="${esc(cls)}" href="${esc(url)}" data-nav>${esc(text)}</a>`; }
export function badge(text, tone = '') { const key = tone || ({ Published: 'success', Draft: 'muted', Submitted: 'warning', Archived: 'muted', Failed: 'danger', Passed: 'success', Pending: 'warning', Active: 'success', Issued: 'success', Revoked: 'danger', Hidden: 'muted', Visible: 'accent' }[text] || 'muted'); return `<span class="badge ${key}">${esc(text)}</span>`; }
export function field(label, name, value = '', opts = {}) {
    const id = 'f-' + name.replace(/[^\w-]/g, '-');
    const common = `id="${id}" name="${esc(name)}" data-field="${esc(name)}" ${opts.readonly ? 'readonly' : ''} ${opts.disabled ? 'disabled' : ''} ${opts.required ? 'required' : ''} ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''} ${opts.min !== undefined ? `min="${opts.min}"` : ''} ${opts.max !== undefined ? `max="${opts.max}"` : ''} ${opts.step ? `step="${opts.step}"` : ''} ${opts.maxlength ? `maxlength="${opts.maxlength}"` : ''}`;
    let input;
    if (opts.options)
        input = `<select ${common}>${opts.options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    else if (opts.textarea)
        input = `<textarea ${common} rows="${opts.rows || 4}" class="${opts.mono ? 'mono' : ''}">${esc(value)}</textarea>`;
    else
        input = `<input ${common} type="${opts.type || 'text'}" value="${esc(value)}" class="${opts.mono ? 'mono' : ''}" autocomplete="off" />`;
    return `<div class="field ${opts.wide ? 'wide' : ''}"><label for="${id}">${esc(label)}${opts.required ? ' <span class="required">*</span>' : ''}</label>${input}${opts.help ? `<small>${esc(opts.help)}</small>` : ''}</div>`;
}
export function toggle(label, name, value, help = '') { return `<label class="toggle-row"><span><strong>${esc(label)}</strong>${help ? `<small>${esc(help)}</small>` : ''}</span><input type="checkbox" role="switch" data-field="${esc(name)}" ${value ? 'checked' : ''}/><span class="switch" aria-hidden="true"></span></label>`; }
export function section(id, title, description, body, extra = '') { return `<section class="card section" id="${esc(id)}"><div class="section-head"><div><h2>${esc(title)}</h2>${description ? `<p>${esc(description)}</p>` : ''}</div>${extra}</div>${body}</section>`; }
export function heading(title, description, actions = '', eyebrow = '') { return `<div class="page-heading"><div>${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h1>${esc(title)}</h1>${description ? `<p>${esc(description)}</p>` : ''}</div><div class="actions">${actions}</div></div>`; }
export function empty(title, detail, action = '') { return `<div class="empty"><span class="empty-icon">${icon('inbox')}</span><h3>${esc(title)}</h3><p>${esc(detail)}</p>${action}</div>`; }
export function note(text, tone = 'info') { return `<div class="note ${tone}">${icon(tone === 'warning' ? 'alert' : 'shield')}<span>${esc(text)}</span></div>`; }
export function tabs(items, selected, action = 'tab') { return `<div class="tabs" role="tablist">${items.map(i => { const [v, l] = Array.isArray(i) ? i : [i, i]; return `<button role="tab" aria-selected="${v === selected}" class="tab ${v === selected ? 'active' : ''}" data-action="${esc(action)}" data-id="${esc(v)}">${esc(l)}</button>`; }).join('')}</div>`; }
export function table(headers, rows, cls = '') { return `<div class="table-wrap ${cls}"><table><thead><tr>${headers.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
export function metric(label, value, hint = '', ico = 'chart') { return `<div class="metric"><span class="metric-icon">${icon(ico)}</span><div class="metric-label">${esc(label)}</div><strong>${esc(value)}</strong><small>${esc(hint)}</small></div>`; }
export function codeField(name, value, lang = 'python', label = 'Code', opts = {}) {
    return `<div class="code-host ${opts.large ? 'large' : ''}" data-code="${esc(name)}" data-language="${esc(lang)}" data-readonly="${!!opts.readonly}"><div class="code-bar"><span>${icon('code')}${esc(label)}</span><div>${opts.private ? badge('Private reference') : badge(lang)}<button type="button" class="icon-btn" data-editor-expand="${esc(name)}" aria-label="Expand ${esc(label)}">${icon('expand')}</button></div></div><div class="code-mount"><textarea spellcheck="false" aria-label="${esc(label)}" class="code-fallback" ${opts.readonly ? 'readonly' : ''}>${esc(value)}</textarea></div><div class="code-footer"><span data-editor-status>Loading editor…</span><span>UTF-8 · ${esc(lang)}</span></div><div class="height-handle" role="separator" aria-orientation="horizontal" aria-label="Resize ${esc(label)}" tabindex="0" aria-valuemin="220" aria-valuemax="900" aria-valuenow="320"></div></div>`;
}
export function markdown(text = '') {
    return esc(text).split('\n').map(line => line.startsWith('### ') ? `<h3>${line.slice(4)}</h3>` : line.startsWith('## ') ? `<h2>${line.slice(3)}</h2>` : line.startsWith('# ') ? `<h2>${line.slice(2)}</h2>` : `<p>${line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>') || '&nbsp;'}</p>`).join('');
}
export function download(name, content, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(headers, rows) { return (rows ? [headers, ...rows] : headers).map(r => r.map(v => '"' + String(v ?? '').replace(/^[=+\-@]/, "'$&").replaceAll('"', '""') + '"').join(',')).join('\r\n'); }
