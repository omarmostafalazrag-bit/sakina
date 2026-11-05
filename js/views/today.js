import { getState, update } from '../store.js';
import { PRAYERS, addDays, dateKey, parseKey } from '../prayer-times.js';
import { esc, icon, haptic, toast } from '../ui.js';
import { timesFor, todayDate, todayKey, fmtTime, nextPrayer, currentPrayerId, countdown, hijri, gregorian, dayScore, streak, scheduleReminders } from '../core.js';
import { openLocation, openSettings, openQibla } from './settings.js';
import { POSTS } from '../data/learn.js';

export function mount(root) {
  const render = () => {
    const { location } = getState();
    root.innerHTML = location ? view() : onboarding();
  };

  render();

  root.addEventListener('click', onClick);
  const tick = setInterval(() => {
    // Re-render when a prayer time passes or the day changes; otherwise only refresh the countdown
    const np = nextPrayer();
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
  }

  function togglePrayer(id) {
    const key = todayKey();
    let nowDone;
    update((s) => {
      const day = (s.prayers[key] ||= {});
      const rec = (day[id] ||= {});
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

  const unsub = () => {};
  return () => { clearInterval(tick); root.removeEventListener('click', onClick); unsub(); };
}

function elapsed(np) {
  const total = np.time - np.prevTime;
  return Math.min(1, Math.max(0, (Date.now() - np.prevTime) / total)).toFixed(3);
}

function onboarding() {
  return `
    <header class="page-head"><div>
      <h1 class="page-title">As-salamu alaykum</h1>
      <p class="page-sub">Para calcular tus horarios de rezo necesito saber dónde estás. Se calculan en tu móvil, sin conexión.</p>
    </div></header>
    <div class="card" style="display:grid;gap:10px">
      <button class="btn block" data-act="location">${icon('pin')}Elegir ubicación</button>
      <p class="small muted" style="margin:0">Puedes usar el GPS o buscar tu ciudad. Tus datos (rezos, sadaqa, dikr) se quedan en este dispositivo.</p>
    </div>`;
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

  const rows = [];
  for (const p of PRAYERS) {
    if (p.id === 'dhuhr') {
      rows.push(`<div class="prayer sunrise"><div class="p-name">Amanecer <span class="ar">الشروق</span></div><div class="p-time">${fmtTime(t.sunrise)}</div><span class="slot"></span></div>`);
    }
    const r = rec[p.id] || {};
    const isNext = !np.tomorrow && np.id === p.id;
    const isPast = t[p.id] <= now;
    const isCurrent = current === p.id && !r.done;
    const cls = ['prayer', isNext && 'is-next', isPast && 'is-past', r.done && 'is-done'].filter(Boolean).join(' ');
    const sub = r.done
      ? `<button class="jamaah" data-act="jamaah" data-id="${p.id}" aria-pressed="${!!r.jamaah}">${icon('users')}${r.jamaah ? 'En congregación' : 'Marcar en congregación'}</button>`
      : isCurrent ? `<div class="p-sub">Tiempo actual</div>` : isNext ? `<div class="p-sub">Próxima · en <span class="num">${countdown(t[p.id] - now)}</span></div>` : '';
    rows.push(`
      <div class="${cls}">
        <div><div class="p-name">${p.es} <span class="ar" lang="ar">${p.ar}</span></div>${sub}</div>
        <div class="p-time">${fmtTime(t[p.id])}</div>
        <button class="check" data-act="toggle" data-id="${p.id}" aria-pressed="${!!r.done}" aria-label="${r.done ? 'Desmarcar' : 'Marcar'} ${p.es} como rezado">${icon('check')}</button>
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
      <div class="countdown"><strong class="num" data-countdown data-for="${np.id + np.time.getTime()}">${countdown(np.time - now)}</strong><span class="muted">· a las <span class="num">${fmtTime(np.time)}</span></span></div>
      <div class="progress-line" aria-hidden="true"><i data-elapsed style="transform:scaleX(${elapsed(np)})"></i></div>
    </section>

    <div class="prayers" role="list" aria-label="Oraciones de hoy">${rows.join('')}</div>

    <div class="stats">
      <div class="stat"><b class="num">${done}/5</b><span>Hoy</span></div>
      <div class="stat ${st > 0 ? 'gold' : ''}"><b class="num">${st}</b><span>${st === 1 ? 'Día seguido' : 'Días seguidos'}</span></div>
      <div class="stat"><b class="num">${monthPct()}%</b><span>Este mes</span></div>
    </div>

    <h2 class="section">Últimas cinco semanas</h2>
    ${historyGrid()}

    <h2 class="section">Para hoy</h2>
    ${dailyVerse()}
  `;
}

function monthPct() {
  const today = todayDate();
  let total = 0, done = 0;
  for (let d = 1; d <= today.d; d++) {
    const k = dateKey({ y: today.y, m: today.m, d });
    total += 5; done += dayScore(k);
  }
  return total ? Math.round((done / total) * 100) : 0;
}

function historyGrid() {
  const today = todayDate();
  // Monday-based weeks, 5 rows
  const js = new Date(Date.UTC(today.y, today.m - 1, today.d)).getUTCDay(); // 0=Sun
  const mondayOffset = (js + 6) % 7;
  const start = addDays(today, -mondayOffset - 28);
  const cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span class="dow" aria-hidden="true">${d}</span>`);
  const todayK = dateKey(today);
  for (let i = 0; i < 35; i++) {
    const d = addDays(start, i);
    const k = dateKey(d);
    const future = k > todayK;
    const n = future ? 0 : dayScore(k);
    const label = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(d.y, d.m - 1, d.d)));
    cells.push(`<span class="day ${future ? 'future' : ''} ${k === todayK ? 'today' : ''}" data-l="${n}" role="img" aria-label="${label}: ${future ? 'sin empezar' : n + ' de 5'}"></span>`);
  }
  return `<div class="card"><div class="history">${cells.join('')}</div>
    <div class="legend">0 <i style="background:var(--surface-2)"></i><i style="background:color-mix(in oklab,var(--accent) 42%,var(--surface-2))"></i><i style="background:color-mix(in oklab,var(--accent) 80%,var(--surface-2))"></i><i style="background:var(--accent)"></i> 5</div></div>`;
}

function dailyVerse() {
  const verses = POSTS.filter((p) => p.kind === 'quran' && p.ar);
  const k = todayKey();
  const dayIndex = Math.floor(Date.UTC(...Object.values(parseKey(k)).map((v, i) => (i === 1 ? v - 1 : v))) / 86400000);
  const v = verses[dayIndex % verses.length];
  return `<article class="verse">
    <p class="ar" lang="ar">${esc(v.ar)}</p>
    <p>${esc(v.body[0])}</p>
    <div class="src">${esc(v.src)} · <a href="#/aprender">Leer más en Aprender</a></div>
  </article>`;
}

export { scheduleReminders };
