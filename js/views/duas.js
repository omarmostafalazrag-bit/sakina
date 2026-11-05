import { getState, update } from '../store.js';
import { DUAS, CATEGORIES, SYNONYMS } from '../data/duas.js';
import { esc, icon, norm, highlight, openSheet, toast, haptic } from '../ui.js';

let lastQuery = '';
let lastCat = 'all';

// Pre-built search index
const INDEX = DUAS.map((d) => ({ d, hay: norm([d.title, d.es, d.translit, d.src, d.note, ...d.tags, CATEGORIES.find((c) => c.id === d.cat)?.label].join(' ')) }));

function expand(word) {
  const out = new Set([word]);
  for (const [k, vals] of Object.entries(SYNONYMS)) {
    if (k.startsWith(word) || word.startsWith(k)) vals.forEach((v) => out.add(v));
  }
  return [...out];
}

export function search(query, cat) {
  const fav = new Set(getState().duas.fav);
  let list = INDEX;
  if (cat === 'fav') list = list.filter((x) => fav.has(x.d.id));
  else if (cat !== 'all') list = list.filter((x) => x.d.cat === cat || (cat === 'rizq' && x.d.tags.includes('dinero')));
  const words = norm(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return list.map((x) => x.d);
  return list
    .map((x) => {
      let score = 0;
      for (const w of words) {
        const alts = expand(w);
        const hit = alts.some((a) => x.hay.includes(a));
        if (!hit) return null;
        if (norm(x.d.title).includes(w)) score += 3;
        if (x.d.tags.some((t) => alts.includes(norm(t)))) score += 2;
        score += 1;
      }
      return { d: x.d, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);
}

export function mount(root) {
  root.innerHTML = `
    <header class="page-head"><div>
      <h1 class="page-title">Duas</h1>
      <p class="page-sub">Súplicas del Corán y la Sunnah, con su fuente. Busca por lo que necesitas.</p>
    </div></header>
    <label class="search"><span class="sr">Buscar duas</span>${icon('search')}
      <input class="input" type="search" placeholder="Dinero, ansiedad, examen, viaje…" value="${esc(lastQuery)}" data-q autocomplete="off" enterkeyhint="search" /></label>
    <div class="chips" role="group" aria-label="Categorías">
      ${CATEGORIES.map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === lastCat}">${c.label}</button>`).join('')}
    </div>
    <div data-list></div>`;

  const input = root.querySelector('[data-q]');
  const listEl = root.querySelector('[data-list]');

  const renderList = () => {
    const res = search(lastQuery, lastCat);
    const fav = new Set(getState().duas.fav);
    if (!res.length) {
      listEl.innerHTML = lastCat === 'fav' && !lastQuery
        ? `<div class="empty"><h3>Aún no has guardado ninguna</h3><p>Abre una dua y pulsa «Guardar» para tenerla aquí a mano.</p></div>`
        : `<div class="empty"><h3>Nada para «${esc(lastQuery)}»</h3><p>Prueba con otra palabra: «deudas», «trabajo», «tristeza», «padres»…</p></div>`;
      return;
    }
    listEl.innerHTML = `<p class="count-line">${res.length} ${res.length === 1 ? 'dua' : 'duas'}</p>` + res.map((d) => `
      <button class="dua-card" data-id="${d.id}">
        <h3><span>${highlight(d.title, lastQuery)}</span>${fav.has(d.id) ? icon('bookmark') : ''}</h3>
        <p class="ar" lang="ar">${esc(d.ar)}</p>
        <p class="tr" style="margin:0">${highlight(d.es, lastQuery)}</p>
      </button>`).join('');
  };

  renderList();

  input.addEventListener('input', () => { lastQuery = input.value; renderList(); });
  root.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-cat]');
    if (chip) {
      lastCat = chip.dataset.cat;
      root.querySelectorAll('[data-cat]').forEach((c) => c.setAttribute('aria-pressed', c === chip));
      renderList();
      return;
    }
    const card = e.target.closest('.dua-card');
    if (card) openDua(card.dataset.id, renderList);
  });
}

function openDua(id, onChange) {
  const d = DUAS.find((x) => x.id === id);
  const isFav = () => getState().duas.fav.includes(id);
  openSheet(d.title, `
    <div class="dua-full">
      <p class="ar" lang="ar">${esc(d.ar)}</p>
      <p class="translit">${esc(d.translit)}</p>
      <p class="es">${esc(d.es)}</p>
      <div class="src">Fuente: ${esc(d.src)}</div>
      ${d.note ? `<div class="note">${esc(d.note)}</div>` : ''}
      <div class="tags">${d.tags.slice(0, 5).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="grid-2" style="margin-top:20px">
        <button class="btn ${isFav() ? 'soft' : 'ghost'}" data-fav>${icon('bookmark')}<span>${isFav() ? 'Guardada' : 'Guardar'}</span></button>
        <button class="btn ghost" data-copy>${icon('copy')}Copiar</button>
      </div>
    </div>`, (root) => {
    root.querySelector('[data-fav]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      update((s) => {
        const f = s.duas.fav;
        const i = f.indexOf(id);
        if (i >= 0) f.splice(i, 1); else f.push(id);
      });
      haptic(8);
      btn.className = `btn ${isFav() ? 'soft' : 'ghost'}`;
      btn.querySelector('span').textContent = isFav() ? 'Guardada' : 'Guardar';
      onChange();
    });
    root.querySelector('[data-copy]').addEventListener('click', async () => {
      const text = `${d.title}\n\n${d.ar}\n\n${d.translit}\n\n${d.es}\n\n(${d.src})`;
      try { await navigator.clipboard.writeText(text); toast('Dua copiada'); }
      catch { toast('No se pudo copiar'); }
    });
  });
}
