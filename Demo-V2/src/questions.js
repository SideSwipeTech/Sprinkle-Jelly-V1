import { field, note, button, esc, badge } from './ui.js';
import { DIFFICULTIES } from './data.js';
export const QUESTION_TYPES = [['single', 'Single choice'], ['multiple', 'Multiple select'], ['numerical', 'Numerical'], ['boolean', 'True / false'], ['coding', 'Coding']];
export function questionFields(q, prefix, course = false) {
    const n = k => `${prefix}.${k}`;
    let body = `<div class="form-grid">${field('Question', '' + n('title'), q.title, { textarea: true, rows: 4, wide: true, required: true })}${field('Marks', n('marks'), q.marks, { type: 'number', min: 1 })}${course ? '' : field('Fixed negative marks', n('penalty'), q.penalty, { type: 'number', min: 0, help: 'Unanswered questions have no penalty.' })}${field('Difficulty', n('difficulty'), q.difficulty, { options: DIFFICULTIES })}${field('Primary skill', n('skill'), q.skill, { options: undefined, required: true })}${field('Topic', n('topic'), q.topic)}${field('Optional explanation', n('explanation'), q.explanation, { textarea: true, rows: 3, wide: true })}</div>`;
    if (['single', 'multiple'].includes(q.type))
        body += `<div class="mt"><div class="subheading"><h3>Options & answer key</h3>${badge(q.type === 'single' ? 'Exactly one answer' : 'One or more answers')}</div>${q.options.map((opt, i) => `<div class="option-row"><label class="answer-choice"><input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="answer-key" data-answer="${i}" ${q.correct.includes(i) ? 'checked' : ''} aria-label="Option ${i + 1} is correct"/><span>${String.fromCharCode(65 + i)}</span></label>${field(`Option ${i + 1}`, n(`options.${i}`), opt)}${button('Remove', 'question-remove-option', { id: String(i), small: true, disabled: q.options.length <= 2 })}</div>`).join('')}${button('Add option', 'question-add-option', { small: true, icon: 'plus', disabled: q.options.length >= 8 })}</div>${course && q.type === 'multiple' ? note('Course-quiz multi-select is all-or-nothing, with no negative marking.') : q.type === 'multiple' ? note('Recorded Assessment multi-select uses the approved partial-credit and wrong-only penalty rules.') : ''}`;
    if (q.type === 'numerical')
        body += `<div class="form-grid mt">${field('Correct numerical answer', n('number'), q.number, { type: 'number', step: 'any' })}${field('Tolerance', n('tolerance'), q.tolerance, { type: 'number', min: 0, step: 'any' })}${course ? '' : field('Tolerance type', n('relative'), String(q.relative), { options: [['false', 'Absolute'], ['true', 'Relative percent · at most 10%']] })}</div>`;
    if (q.type === 'boolean')
        body += `<div class="mt">${field('Correct answer', n('boolean'), String(q.boolean), { options: [['true', 'True'], ['false', 'False']] })}</div>`;
    return body;
}
export function bindQuestion(ctx, q, s) {
    ctx.on('question-add-option', () => { q.options.push(''); ctx.markDirty(s); ctx.render(); });
    ctx.on('question-remove-option', v => { const i = Number(v); q.options.splice(i, 1); q.correct = q.correct.filter(x => x !== i).map(x => x > i ? x - 1 : x); ctx.markDirty(s); ctx.render(); });
    ctx.after.push(root => root.querySelectorAll('[data-answer]').forEach(input => input.addEventListener('change', () => { const i = Number(input.dataset.answer); q.correct = q.type === 'single' ? [i] : input.checked ? [...new Set([...q.correct, i])] : q.correct.filter(x => x !== i); ctx.markDirty(s); })));
}
