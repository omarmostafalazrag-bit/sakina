// Daily journal (diario) with an Islamic frame. Saved only on the device, included in backups.
import { getState, update } from '../store.js';
import { JOURNAL_INTRO, MOODS, SECTIONS, PROMPTS } from '../data/journal.js';
import { esc, icon } from '../ui.js';
import { todayKey, dayScore, isPeriod, cap } from '../core.js';

const fmtDate = (k, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => cap(new Intl.DateTimeFormat('es-ES', { ...opts, timeZone: 'UTC' }).format(new Date(k + 'T12:00:00Z')));
const promptFor = (k) => PROMPTS[Math.floor(Date.parse(k) / 86400000) % PROMPTS.length];
const isEmpty = (e) => !e || (!e.mood && !Object.entries(e).some(([key, v]) => key !== 'updated' && key !== 'mood' && (Array.isArray(v) ? v.some((x) => x && x.trim()) : typeof v === 'string' && v.trim())));

export function mount(root) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  let day = params.get('d') || todayKey();
  if (day > todayKey()) day = todayKey();
  let saveTimer = null;

  const summary = (k) => {
    const s = getState();
    const bits = [];
    if (isPeriod(k)) bits.push('periodo');
    else bits.push(`${dayScore(k)}/5 oraciones`);
    if (s.fasts?.[k]) bits.push('ayuno');
    const dk = s.dhikr.days?.[k];
    if (dk) bits.push(`${dk.toLocaleString('es-ES')} dikr`);
    const sq = (s.sadaqa || []).filter((x) => x.date === k).length;
    if (sq) bits.push(`${sq} sadaqa`);
    const q = (s.quran?.days?.[k] || []).length;
    if (q) bits.push(`${q} ${q === 1 ? 'aleya' : 'aleyas'} de Corán`);
    return bits;
  };

  const render = () => {
    const e = getState().journal?.[day] || {};
    const p = promptFor(day);
    const isToday = day === todayKey();
    root.innerHTML = `
      <div class="q-top">
        <div class="q-title"><b>Diario</b><span>${esc(fmtDate(day))}${isToday ? ' · hoy' : ''}</span></div>
        <button class="icon-btn" data-prevday aria-label="Día anterior">${icon('back')}</button>
        <button class="icon-btn" data-nextday aria-label="Día siguiente" ${isToday ? 'disabled' : ''}>${icon('chev')}</button>
      </div>

      <div class="lar" style="margin:6px 0 14px">
        <div class="lar-top"><p class="ar" lang="ar">${esc(JOURNAL_INTRO.ar)}</p></div>
        <p class="lar-tr">${esc(JOURNAL_INTRO.tr)}</p><p class="lar-es">${esc(JOURNAL_INTRO.es)}</p>
      </div>

      <div class="j-day small">${summary(day).map((b) => `<span class="tag">${esc(b)}</span>`).join('')}</div>

      <section class="j-block">
        <h3>¿Cómo ha sido tu día?</h3>
        <div class="mood" role="radiogroup" aria-label="Estado de ánimo">
          ${MOODS.map((m) => `<button role="radio" aria-checked="${e.mood === m.id}" aria-pressed="${e.mood === m.id}" data-mood="${m.id}"><i data-m="${m.id}"></i><span>${m.label}</span></button>`).join('')}
        </div>
      </section>

      <section class="j-block j-prompt">
        <h3>Para reflexionar</h3>
        <p class="j-q">${esc(p.q)}</p>
        <p class="src">${esc(p.ref)}</p>
        <textarea class="input" data-f="reflection" rows="3" placeholder="Escribe tu reflexión…">${esc(e.reflection || '')}</textarea>
      </section>

      ${SECTIONS.map((s) => `
        <section class="j-block">
          <h3>${esc(s.title)}</h3>
          <p class="help" style="margin:0 0 8px">${esc(s.hint)}</p>
          ${s.multi
            ? Array.from({ length: s.multi }, (_, i) => `<div class="j-line"><span class="num">${i + 1}</span><input class="input" data-f="${s.id}" data-i="${i}" value="${esc((e[s.id] || [])[i] || '')}" placeholder="…" /></div>`).join('')
            : `<textarea class="input" data-f="${s.id}" rows="${s.id === 'free' ? 5 : 2}" placeholder="…">${esc(e[s.id] || '')}</textarea>`}
          ${s.ref ? `<p class="src">${esc(s.ref)}</p>` : ''}
        </section>`).join('')}

      <p class="j-saved small muted" data-saved>${e.updated ? 'Guardado' : 'Se guarda solo mientras escribes, en este móvil.'}</p>

      <h2 class="section">Días anteriores</h2>
      ${history()}`;
  };

  const history = () => {
    const j = getState().journal || {};
    const keys = Object.keys(j).filter((k) => k !== day && !isEmpty(j[k])).sort().reverse().slice(0, 60);
    if (!keys.length) return '<div class="empty" style="padding:16px"><p>Aquí aparecerán tus días escritos. Escribir unos minutos cada noche es una forma de muhasaba: rendirte cuentas a ti mismo con calma.</p></div>';
    return `<div class="list">${keys.map((k) => {
      const e = j[k];
      const first = (e.gratitude || []).find((x) => x && x.trim()) || e.reflection || e.good || e.free || e.dua || '';
      return `<button class="list-row" data-open="${k}"><div class="grow"><div>${esc(fmtDate(k, { weekday: 'short', day: 'numeric', month: 'short' }))}${e.mood ? ` · ${esc(MOODS.find((m) => m.id === e.mood)?.label || '')}` : ''}</div>
        <div class="meta j-snip">${esc(first.slice(0, 90))}</div></div>${icon('chev')}</button>`;
    }).join('')}</div>`;
  };

  const persist = () => {
    clearTimeout(saveTimer);
    const saved = root.querySelector('[data-saved]');
    if (saved) saved.textContent = 'Guardando…';
    saveTimer = setTimeout(() => {
      saveTimer = null;
      persistNow();
      if (saved) saved.textContent = 'Guardado';
    }, 500);
  };

  const shift = (n) => {
    const d = new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);
    if (d > todayKey()) return;
    flush(); day = d; render(); window.scrollTo({ top: 0 });
  };
  const flush = () => { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; persistNow(); } };
  const persistNow = () => {
    update((s) => {
      s.journal ||= {};
      const e = (s.journal[day] ||= {});
      root.querySelectorAll('[data-f]').forEach((el) => {
        const f = el.dataset.f;
        if (el.dataset.i != null) { (e[f] ||= []); e[f][Number(el.dataset.i)] = el.value; } else e[f] = el.value;
      });
      e.updated = Date.now();
      if (isEmpty(e)) delete s.journal[day];
    });
  };

  const onClick = (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.mood) {
      const m = Number(b.dataset.mood);
      update((s) => { s.journal ||= {}; const e = (s.journal[day] ||= {}); e.mood = e.mood === m ? null : m; e.updated = Date.now(); });
      root.querySelectorAll('[data-mood]').forEach((x) => { const on = getState().journal?.[day]?.mood === Number(x.dataset.mood); x.setAttribute('aria-pressed', on); x.setAttribute('aria-checked', on); });
    } else if ('prevday' in b.dataset) shift(-1);
    else if ('nextday' in b.dataset) shift(1);
    else if (b.dataset.open) { flush(); day = b.dataset.open; render(); window.scrollTo({ top: 0 }); }
  };
  const onInput = (ev) => { if (ev.target.matches('[data-f]')) persist(); };

  render();
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  return () => { flush(); root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); };
}

