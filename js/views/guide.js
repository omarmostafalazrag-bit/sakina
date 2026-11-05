// "Mi guía": obligations, rights, prohibited and permitted — filtered by gender.
import { getState, update } from '../store.js';
import { GUIDE, GUIDE_SECTIONS, GUIDE_NOTE, PERIOD_INFO } from '../data/guide.js';
import { esc } from '../ui.js';
import { periodStats } from '../core.js';

let section = 'obligaciones';

export function mount(root) {
  const render = () => {
    const g = getState().profile.gender;
    if (!g) {
      root.innerHTML = `<p class="page-sub" style="margin:0 0 14px">Tu guía cambia según seas hombre o mujer. ¿Cuál es tu caso?</p>
        <div class="grid-2"><button class="btn ghost" data-g="m">Hombre</button><button class="btn ghost" data-g="f">Mujer</button></div>`;
      return;
    }
    const sec = GUIDE_SECTIONS.find((s) => s.id === section);
    const items = GUIDE.filter((x) => x.sec === section && (x.for === 'all' || x.for === g));
    const mine = items.filter((x) => x.for === g), common = items.filter((x) => x.for === 'all');
    const who = g === 'f' ? 'mujer' : 'hombre';
    root.innerHTML = `
      <p class="page-sub" style="margin:0 0 12px">Para ti como ${who}. <button class="link-btn" data-switch>Cambiar</button></p>
      <div class="chips" role="group" aria-label="Apartados">
        ${GUIDE_SECTIONS.map((s) => `<button class="chip" data-sec="${s.id}" aria-pressed="${s.id === section}">${s.label}</button>`).join('')}
        ${g === 'f' ? `<button class="chip" data-sec="regla" aria-pressed="${section === 'regla'}">La regla</button>` : ''}
      </div>
      ${section === 'regla' ? periodView() : `
      <p class="muted" style="margin:6px 2px 14px">${esc(sec.intro)}</p>
      ${mine.length ? `<h2 class="section" style="margin-top:8px">Como ${who}</h2>${list(mine)}` : ''}
      <h2 class="section">Para todo musulmán</h2>${list(common)}`}
      <p class="help" style="margin-top:18px">${esc(GUIDE_NOTE)}</p>`;
  };

  const list = (arr) => `<div class="list">${arr.map((x) => `<div class="guide-item"><b>${esc(x.title)}</b><p>${esc(x.text)}</p><span class="src">${esc(x.src)}</span></div>`).join('')}</div>`;

  const periodView = () => {
    const st = periodStats();
    const fmt = (k) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(k));
    const recent = st.runs.slice(-6).reverse();
    return `
      <div class="stats" style="margin-top:6px">
        <div class="stat"><b class="num">${st.avgLen ?? '—'}</b><span>Días de media</span></div>
        <div class="stat"><b class="num">${st.cycle ?? '—'}</b><span>Días de ciclo</span></div>
        <div class="stat"><b class="num" style="font-size:20px">${st.next ? fmt(st.next) : '—'}</b><span>Próxima</span></div>
      </div>
      <h2 class="section">Tus últimos periodos</h2>
      ${recent.length ? `<div class="list">${recent.map((r) => `<div class="list-row"><div class="grow">${fmt(r.start)} – ${r.ongoing ? 'en curso' : fmt(r.end)}</div><span class="meta num">${r.length} ${r.length === 1 ? 'día' : 'días'}</span></div>`).join('')}</div>`
        : '<div class="empty" style="padding:20px"><p>Aún no hay registros. Pulsa «Empezó mi periodo» en Hoy o marca los días en el calendario.</p></div>'}
      <h2 class="section">Lo que dice el fiqh</h2>
      <div class="list">${PERIOD_INFO.map((t) => `<div class="guide-item"><p style="margin:0">${esc(t)}</p></div>`).join('')}</div>`;
  };

  render();
  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.sec) { section = b.dataset.sec; render(); }
    else if (b.dataset.g) { update((s) => { s.profile.gender = b.dataset.g; s.profile.onboarded = true; }); render(); }
    else if ('switch' in b.dataset) { update((s) => { s.profile.gender = s.profile.gender === 'f' ? 'm' : 'f'; }); if (section === 'regla') section = 'obligaciones'; render(); }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
