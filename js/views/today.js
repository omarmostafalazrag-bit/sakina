import { getState, update } from '../store.js';
import { PRAYERS, dateKey } from '../prayer-times.js';
import { esc, icon, haptic, toast, openSheet, closeSheet } from '../ui.js';
import { timesFor, todayDate, todayKey, fmtTime, nextPrayer, currentPrayerId, countdown, hijri, gregorian, dayScore, streak, isPeriod, isFemale, materializePeriod, periodStats, monthPct, fastSuggestion, fastLabel, toggleFast, FAST_TYPES, scheduleReminders } from '../core.js';
import { openLocation, openSettings, openQibla } from './settings.js';
import { renderCalendar, bindCalendar } from './calendar.js';
import { POSTS } from '../data/learn.js';
import { LESSONS } from '../data/newmuslim.js';

export function mount(root) {
  const render = () => {
    const { location, profile } = getState();
    root.innerHTML = !profile.onboarded ? welcome() : location ? view() : askLocation();
  };

  render();

  root.addEventListener('click', onClick);
  bindCalendar(root, render);
  const tick = setInterval(() => {
    const np = getState().location && nextPrayer();
    if (!np) return;
    const el = root.querySelector('[data-countdown]');
    if (el && el.dataset.for === np.id + np.time.getTime()) {
      el.textContent = countdown(np.time - Date.now());
      const bar = root.querySelector('[data-elapsed]');
      if (bar) bar.style.transform = `scaleX(${elapsed(np)})`;
    } else render();
  }, 20000);

  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'toggle') togglePrayer(b.dataset.id);
    else if (act === 'jamaah') toggleJamaah(b.dataset.id);
    else if (act === 'location') openLocation();
    else if (act === 'settings') openSettings();
    else if (act === 'qibla') openQibla();
    else if (act === 'gender') {
      root.querySelectorAll('[data-act=gender]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      root.querySelector('[data-start]').disabled = false;
    } else if (act === 'start') {
      const g = root.querySelector('[data-act=gender][aria-pressed=true]')?.dataset.g || null;
      const nm = root.querySelector('[data-newmuslim]')?.checked || false;
      update((s) => { s.profile.gender = g; s.profile.newMuslim = nm; s.profile.onboarded = true; });
      render();
      if (!getState().location) openLocation();
    } else if (act === 'fast') {
      let on;
      update((s) => { on = toggleFast(s, todayKey()); });
      haptic(on ? 12 : 6); render();
      if (on) toast('Ayuno registrado. Que Allah te lo acepte.');
    } else if (act === 'fast-more') {
      openFastSheet(render);
    } else if (act === 'period-start') {
      update((s) => { s.period.ongoing = todayKey(); });
      haptic(10); render();
      toast('Periodo registrado. Las oraciones quedan en pausa.');
    } else if (act === 'period-end') {
      update((s) => { materializePeriod(s, todayKey()); });
      haptic(10); render();
      toast('Periodo terminado. Haz el ghusl antes de volver a rezar.');
    }
  }

  function togglePrayer(id) {
    const key = todayKey();
    let nowDone;
    update((s) => {
      const rec = ((s.prayers[key] ||= {})[id] ||= {});
      rec.done = !rec.done;
      rec.at = rec.done ? Date.now() : undefined;
      if (!rec.done) rec.jamaah = false;
      nowDone = rec.done;
    });
    haptic(nowDone ? 12 : 6);
    render();
    if (nowDone && dayScore(key) === 5) toast('Las cinco oraciones de hoy, completas. Alhamdulillah.');
  }

  function toggleJamaah(id) {
    update((s) => {
      const rec = ((s.prayers[todayKey()] ||= {})[id] ||= {});
      rec.jamaah = !rec.jamaah;
      if (rec.jamaah) { rec.done = true; rec.at ||= Date.now(); }
    });
    haptic(8);
    render();
  }

  return () => { clearInterval(tick); root.removeEventListener('click', onClick); };
}

function elapsed(np) {
  const total = np.time - np.prevTime;
  return Math.min(1, Math.max(0, (Date.now() - np.prevTime) / total)).toFixed(3);
}

function welcome() {
  return `
    <header class="page-head"><div>
      <h1 class="page-title">As-salamu alaykum</h1>
      <p class="page-sub">«La paz sea contigo». Dos preguntas para adaptar la app a ti; puedes cambiarlas cuando quieras en Ajustes.</p>
    </div></header>
    <div class="card" style="display:grid;gap:16px">
      <div class="field" style="margin:0"><span>¿Eres hombre o mujer?</span>
        <div class="grid-2">
          <button class="btn ghost" data-act="gender" data-g="m" aria-pressed="false">Hombre</button>
          <button class="btn ghost" data-act="gender" data-g="f" aria-pressed="false">Mujer</button>
        </div>
        <p class="help" style="margin:6px 0 0">Sirve para mostrarte tu guía de obligaciones y derechos y, si eres mujer, el seguimiento de la regla.</p>
      </div>
      <label class="row" style="cursor:pointer"><div class="grow"><div style="font-weight:600">Soy nuevo o nueva en el islam</div>
        <div class="small muted">Te enseñaremos lo básico paso a paso</div></div>
        <span class="switch"><input type="checkbox" data-newmuslim aria-label="Soy nuevo en el islam" /><span></span></span></label>
      <button class="btn block" data-act="start" data-start disabled>Continuar</button>
    </div>`;
}

function askLocation() {
  return `
    <header class="page-head"><div>
      <h1 class="page-title">¿Dónde estás?</h1>
      <p class="page-sub">Para calcular tus horarios de rezo. Se calculan en tu móvil, sin conexión.</p>
    </div></header>
    <div class="card" style="display:grid;gap:10px">
      <button class="btn block" data-act="location">${icon('pin')}Elegir ubicación</button>
      <p class="small muted" style="margin:0">Puedes usar el GPS o buscar tu ciudad. Tus datos se quedan en este dispositivo.</p>
    </div>`;
}

function periodCard(excused) {
  const st = periodStats();
  if (excused) {
    const len = st.last?.ongoing ? st.last.length : null;
    return `<section class="period-card" aria-label="Periodo">
      <div><b>Periodo${len ? ` · día ${len}` : ''}</b>
      <p>Estás exenta de rezar estos días y no tendrás que recuperar esas oraciones. El ayuno de Ramadán sí se recupera después. Puedes seguir haciendo dikr y duas.</p></div>
      ${len ? `<button class="btn" data-act="period-end">Ha terminado</button>` : '<p class="small" style="margin:0">Marcado en el calendario.</p>'}
    </section>`;
  }
  const hint = st.next ? `Próximo periodo previsto hacia el ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(st.next))}.` : 'Regístralo para pausar las oraciones y conocer tu ciclo.';
  return `<div class="period-row"><span class="small muted">${hint}</span>
    <button class="btn ghost" data-act="period-start">Empezó mi periodo</button></div>`;
}

function view() {
  const s = getState();
  const today = todayDate();
  const key = dateKey(today);
  const t = timesFor(today);
  const np = nextPrayer();
  const current = currentPrayerId();
  const rec = s.prayers[key] || {};
  const now = Date.now();
  const h = hijri();
  const done = dayScore(key);
  const st = streak();
  const excused = isPeriod(key);

  const rows = [];
  for (const p of PRAYERS) {
    if (p.id === 'dhuhr') {
      rows.push(`<div class="prayer sunrise"><div class="p-name">Amanecer <span class="ar" lang="ar">الشروق</span></div><div class="p-time">${fmtTime(t.sunrise)}</div><span class="slot"></span></div>`);
    }
    const r = rec[p.id] || {};
    const isNext = !np.tomorrow && np.id === p.id;
    const isPast = t[p.id] <= now;
    const isCurrent = current === p.id && !r.done;
    const cls = ['prayer', isNext && 'is-next', isPast && 'is-past', r.done && 'is-done', excused && 'is-excused'].filter(Boolean).join(' ');
    const sub = excused ? `<div class="p-sub">${p.mean} · exenta</div>`
      : r.done
        ? `<button class="jamaah" data-act="jamaah" data-id="${p.id}" aria-pressed="${!!r.jamaah}">${icon('users')}${r.jamaah ? 'En congregación' : 'Marcar en congregación'}</button>`
        : isCurrent ? `<div class="p-sub">${p.mean} · tiempo actual</div>`
          : isNext ? `<div class="p-sub">${p.mean} · en <span class="num">${countdown(t[p.id] - now)}</span></div>`
            : `<div class="p-sub">${p.mean} · ${p.rakaat} rakaat</div>`;
    rows.push(`
      <div class="${cls}">
        <div><div class="p-name">${p.es} <span class="ar" lang="ar">${p.ar}</span></div>${sub}</div>
        <div class="p-time">${fmtTime(t[p.id])}</div>
        ${excused ? '<span class="slot"></span>' : `<button class="check" data-act="toggle" data-id="${p.id}" aria-pressed="${!!r.done}" aria-label="${r.done ? 'Desmarcar' : 'Marcar'} ${p.es} como rezado">${icon('check')}</button>`}
      </div>`);
  }

  return `
    <div class="today-top">
      <button class="loc-btn" data-act="location" aria-label="Cambiar ubicación: ${esc(s.location.name)}">${icon('pin')}<span>${esc(s.location.name)}</span></button>
      <div class="top-actions">
        <button class="icon-btn" data-act="qibla" aria-label="Dirección de la qibla">${icon('compass')}</button>
        <button class="icon-btn" data-act="settings" aria-label="Ajustes">${icon('sliders')}</button>
      </div>
    </div>

    <section class="hero" aria-label="Próxima oración">
      <div class="dates"><span>${esc(gregorian())}</span><span class="hijri">${esc(h.es)}</span></div>
      <p class="next-label">${np.tomorrow ? 'Mañana, la primera oración' : 'Próxima oración'}</p>
      <h1 class="next-name">${np.es} <span class="ar" lang="ar">${np.ar}</span></h1>
      <div class="countdown"><strong class="num" data-countdown data-for="${np.id + np.time.getTime()}">${countdown(np.time - now)}</strong><span class="muted">· a las <span class="num">${fmtTime(np.time)}</span> · ${np.mean.toLowerCase()}</span></div>
      <div class="progress-line" aria-hidden="true"><i data-elapsed style="transform:scaleX(${elapsed(np)})"></i></div>
    </section>

    ${isFemale() ? periodCard(excused) : ''}

    <div class="prayers" role="list" aria-label="Oraciones de hoy">${rows.join('')}</div>

    <div class="stats">
      <div class="stat"><b class="num">${excused ? '—' : `${done}/5`}</b><span>Hoy</span></div>
      <div class="stat ${st > 0 ? 'gold' : ''}"><b class="num">${st}</b><span>${st === 1 ? 'Día seguido' : 'Días seguidos'}</span></div>
      <div class="stat"><b class="num">${monthPct(today.y, today.m)}%</b><span>Este mes</span></div>
    </div>

    ${fastCard(key, excused)}

    ${s.profile.newMuslim ? pathCard() : ''}

    <h2 class="section">Calendario</h2>
    ${renderCalendar()}

    <h2 class="section">Para hoy</h2>
    ${dailyVerse()}
  `;
}

function fastCard(key, excused) {
  const s = getState();
  const f = s.fasts[key];
  const sug = fastSuggestion(key);
  const forbidden = sug.type === null;
  let sub = f ? `${fastLabel(f.type)} · registrado` : sug.text;
  if (!f && excused) sub = sug.type === 'ramadan' ? 'Con la regla no se ayuna; recupera este día después' : 'Con la regla no se ayuna';
  const qada = s.qada ? ` · <b class="num">${s.qada}</b> por recuperar` : '';
  return `<section class="fast-card ${f ? 'on' : ''}" aria-label="Ayuno de hoy">
    <div class="grow"><div style="font-weight:600">${f ? 'He ayunado hoy' : '¿Ayunas hoy?'}</div><div class="small muted">${esc(sub)}${qada}</div></div>
    <button class="icon-btn" data-act="fast-more" aria-label="Tipo de ayuno y días por recuperar">${icon('sliders')}</button>
    <button class="check" data-act="fast" aria-pressed="${!!f}" ${(forbidden || excused) && !f ? 'disabled' : ''} aria-label="${f ? 'Quitar ayuno de hoy' : 'Marcar hoy como ayunado'}">${icon('check')}</button>
  </section>`;
}

function openFastSheet(rerender) {
  const key = todayKey();
  const body = () => {
    const s = getState();
    const f = s.fasts[key];
    return `
      <p class="muted" style="margin:-4px 0 14px">${esc(fastSuggestion(key).text)}</p>
      <div class="list">${FAST_TYPES.map((t) => `<button class="list-row" data-type="${t.id}"><div class="grow">${t.label}</div>${f?.type === t.id ? icon('check') : ''}</button>`).join('')}</div>
      <p class="help" style="margin-top:8px">Elige el tipo para marcar hoy como ayunado. Si eliges «Recuperación», se descuenta un día de los pendientes.</p>
      <h3 class="group">Días de Ramadán por recuperar</h3>
      <div class="card row" style="justify-content:space-between">
        <button class="icon-btn" data-qada="-1" aria-label="Uno menos">−</button>
        <b class="num" style="font:500 34px/1 var(--font-display)">${s.qada || 0}</b>
        <button class="icon-btn" data-qada="1" aria-label="Uno más">${icon('plus')}</button>
      </div>
      <p class="help" style="margin-top:10px">Los días que no ayunaste en Ramadán por enfermedad, viaje, regla o embarazo se recuperan antes del siguiente Ramadán (Corán 2:184).</p>
      ${f ? '<button class="btn danger block" data-unfast style="margin-top:6px">Quitar el ayuno de hoy</button>' : ''}`;
  };
  openSheet('Ayuno', body(), (root) => {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.type) update((s) => { if (s.fasts[key]?.type !== b.dataset.type) toggleFast(s, key, b.dataset.type); });
      else if (b.dataset.qada) update((s) => { s.qada = Math.max(0, (s.qada || 0) + Number(b.dataset.qada)); });
      else if ('unfast' in b.dataset) update((s) => { toggleFast(s, key); });
      else return;
      haptic(8);
      root.innerHTML = body();
      rerender();
    });
  });
}

function pathCard() {
  const done = new Set(getState().path.done);
  const next = LESSONS.find((l) => !done.has(l.id));
  const pct = Math.round((done.size / LESSONS.length) * 100);
  return `<a class="path-card" href="#/aprender/empezar">
    <div class="grow"><div class="small" style="font-weight:700;color:var(--accent)">Tu camino en el islam · ${pct}%</div>
      <div style="font-weight:600;margin-top:2px">${next ? `Siguiente: ${esc(next.title)}` : 'Has completado todas las lecciones'}</div></div>
    ${icon('chev')}</a>`;
}

function dailyVerse() {
  const verses = POSTS.filter((p) => p.kind === 'quran' && p.ar);
  const dayIndex = Math.floor(Date.parse(todayKey()) / 86400000);
  const v = verses[dayIndex % verses.length];
  return `<article class="verse">
    <p class="ar" lang="ar">${esc(v.ar)}</p>
    <p>${esc(v.body[0])}</p>
    <div class="src">${esc(v.src)} · <a href="#/aprender">Leer más en Aprender</a></div>
  </article>`;
}

export { scheduleReminders };
