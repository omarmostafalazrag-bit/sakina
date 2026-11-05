// Aprender hub: reading feed, new-Muslim path, Arabic course and the personal guide.
import * as feed from './feed.js';
import * as path from './path.js';
import * as arabic from './arabic.js';
import * as guide from './guide.js';

const SUBS = [
  { id: '', label: 'Lecturas', mod: feed },
  { id: 'empezar', label: 'Empezar', mod: path },
  { id: 'arabe', label: 'Árabe', mod: arabic },
  { id: 'guia', label: 'Mi guía', mod: guide },
];

export function mount(root) {
  const sub = location.hash.replace(/^#\/?aprender\/?/, '').split('/')[0];
  const cur = SUBS.find((s) => s.id === sub) || SUBS[0];
  root.innerHTML = `
    <header class="page-head" style="margin-bottom:14px"><div><h1 class="page-title">Aprender</h1></div></header>
    <nav class="seg subnav" aria-label="Apartados de Aprender">
      ${SUBS.map((s) => `<a href="#/aprender${s.id ? '/' + s.id : ''}" ${s === cur ? 'aria-current="page"' : ''}>${s.label}</a>`).join('')}
    </nav>
    <div data-sub></div>`;
  return cur.mod.mount(root.querySelector('[data-sub]'));
}
