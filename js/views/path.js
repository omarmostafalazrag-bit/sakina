// "Empezar": step-by-step lessons for new Muslims, with progress.
import { getState, update } from '../store.js';
import { LESSONS } from '../data/newmuslim.js';
import { esc, icon, openSheet, closeSheet, haptic, toast } from '../ui.js';
import { renderBlocks, bindSay } from './blocks.js';

export function mount(root) {
  const render = () => {
    const done = new Set(getState().path.done);
    const nextIdx = LESSONS.findIndex((l) => !done.has(l.id));
    const pct = Math.round((done.size / LESSONS.length) * 100);
    root.innerHTML = `
      <p class="page-sub" style="margin:0 0 14px">Lo esencial del islam en ${LESSONS.length} lecciones cortas, en orden. Para quien acaba de llegar o quiere repasar lo básico.</p>
      <div class="card" style="margin-bottom:12px">
        <div class="row" style="justify-content:space-between"><b>Tu progreso</b><span class="num muted">${done.size}/${LESSONS.length}</span></div>
        <div class="progress-line" style="margin-top:10px"><i style="transform:scaleX(${pct / 100})"></i></div>
      </div>
      <ol class="lesson-list">
        ${LESSONS.map((l, i) => `<li><button class="lesson ${done.has(l.id) ? 'done' : ''} ${i === nextIdx ? 'next' : ''}" data-l="${l.id}">
          <span class="lnum" aria-hidden="true">${done.has(l.id) ? icon('check') : i + 1}</span>
          <span class="grow"><span class="ltitle">${esc(l.title)}</span><span class="meta">${l.min} min${i === nextIdx ? ' · siguiente' : ''}</span></span>
          ${icon('chev')}</button></li>`).join('')}
      </ol>`;
  };

  const open = (id) => {
    const i = LESSONS.findIndex((l) => l.id === id);
    const l = LESSONS[i];
    const next = LESSONS[i + 1];
    const isDone = getState().path.done.includes(id);
    openSheet(`${i + 1}. ${l.title}`, `
      <div class="lesson-body">${renderBlocks(l.blocks)}</div>
      <button class="btn block" data-done style="margin-top:18px">${icon('check')}${isDone ? (next ? 'Siguiente lección' : 'Cerrar') : 'Hecho, he terminado'}</button>`,
    (body) => {
      bindSay(body);
      body.querySelector('[data-done]').addEventListener('click', () => {
        if (!getState().path.done.includes(id)) {
          update((s) => { s.path.done.push(id); });
          haptic(14);
          if (!next) toast('¡Has completado el camino básico! MashaAllah.');
        }
        render();
        if (next) open(next.id); else closeSheet();
      });
    });
  };

  render();
  bindSay(root);
  const onClick = (e) => { const b = e.target.closest('[data-l]'); if (b) open(b.dataset.l); };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
