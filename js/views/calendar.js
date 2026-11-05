// Month calendar of prayers (and period days for women). Tap a day to fill it in.
import { getState, update } from '../store.js';
import { PRAYERS, dateKey, parseKey } from '../prayer-times.js';
import { icon, openSheet, haptic } from '../ui.js';
import { todayDate, todayKey, dayScore, isPeriod, isFemale, materializePeriod, monthPct, hijriSpan, hijri, cap, monthFasts, toggleFast, fastLabel, FAST_TYPES } from '../core.js';

let cal = null; // { y, m } currently shown

const monthName = (y, m) => cap(new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1))));

export function renderCalendar() {
  const t = todayDate();
  if (!cal) cal = { y: t.y, m: t.m };
  const { y, m } = cal;
  const tk = todayKey();
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const isCurrent = y === t.y && m === t.m;
  const female = isFemale();

  const cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span class="dow" aria-hidden="true">${d}</span>`);
  for (let i = 0; i < lead; i++) cells.push('<span aria-hidden="true"></span>');
  let full = 0, periodDays = 0;
  for (let d = 1; d <= daysIn; d++) {
    const k = dateKey({ y, m, d });
    const future = k > tk;
    const per = isPeriod(k);
    const n = future ? 0 : dayScore(k);
    if (n === 5) full++;
    if (per) periodDays++;
    const label = `${d} de ${monthName(y, m).toLowerCase()}: ${future ? 'aún no ha llegado' : per ? 'periodo' : `${n} de 5 oraciones`}`;
    const fasted = !!getState().fasts[k];
    cells.push(`<button class="cday ${future ? 'future' : ''} ${k === tk ? 'today' : ''} ${per ? 'period' : ''} ${fasted ? 'fasted' : ''}" data-l="${per ? 0 : n}" data-day="${k}" ${future ? 'disabled' : ''} aria-label="${label}${fasted ? ', ayunado' : ''}"><span>${d}</span></button>`);
  }

  return `<div class="card cal">
    <div class="cal-head">
      <button class="icon-btn" data-cal="-1" aria-label="Mes anterior">${icon('back')}</button>
      <div class="cal-title"><b>${monthName(y, m)} ${y}</b><span>${hijriSpan(y, m)}</span></div>
      <button class="icon-btn" data-cal="1" aria-label="Mes siguiente" ${isCurrent ? 'disabled' : ''}>${icon('chev')}</button>
    </div>
    <div class="cal-grid">${cells.join('')}</div>
    <div class="cal-foot">
      <span><b class="num">${monthPct(y, m)}%</b> de oraciones · <b class="num">${full}</b> ${full === 1 ? 'día completo' : 'días completos'}${female && periodDays ? ` · <b class="num">${periodDays}</b> de periodo` : ''} · <b class="num">${monthFasts(y, m)}</b> de ayuno</span>
    </div>
    <div class="legend">0 <i style="background:var(--surface-2)"></i><i style="background:color-mix(in oklab,var(--accent) 42%,var(--surface-2))"></i><i style="background:color-mix(in oklab,var(--accent) 80%,var(--surface-2))"></i><i style="background:var(--accent)"></i> 5${female ? ' <i class="lg-period"></i> periodo' : ''} <i class="lg-fast"></i> ayuno</div>
    <p class="help" style="margin:10px 0 0">Toca un día para marcar las oraciones que rezaste${female ? ' o los días de periodo' : ''}.</p>
  </div>`;
}

export function bindCalendar(root, rerender) {
  root.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-cal]');
    if (nav && !nav.disabled) {
      const t = todayDate();
      let { y, m } = cal || { y: t.y, m: t.m };
      m += Number(nav.dataset.cal);
      if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
      cal = { y, m };
      const card = root.querySelector('.cal');
      card.outerHTML = renderCalendar();
      return;
    }
    const day = e.target.closest('[data-day]');
    if (day && !day.disabled) openDay(day.dataset.day, rerender);
  });
}

function openDay(key, rerender) {
  const d = parseKey(key);
  const dt = new Date(Date.UTC(d.y, d.m - 1, d.d, 12));
  const title = cap(new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(dt));
  const female = isFemale();

  const body = () => {
    const rec = getState().prayers[key] || {};
    const per = isPeriod(key);
    return `
      <p class="muted" style="margin:-4px 0 14px">${hijri(dt).es}</p>
      ${female ? `<div class="list" style="margin-bottom:14px"><label class="list-row"><div class="grow"><div>Día de periodo</div><div class="meta">Estás exenta de rezar este día</div></div>
        <span class="switch"><input type="checkbox" data-period ${per ? 'checked' : ''} aria-label="Día de periodo" /><span></span></span></label></div>` : ''}
      <div class="list" style="margin-bottom:14px"><label class="list-row"><div class="grow"><div>Ayuné este día</div><div class="meta">${getState().fasts[key] ? fastLabel(getState().fasts[key].type) : 'Ramadán, voluntario, recuperación…'}</div></div>
        <span class="switch"><input type="checkbox" data-fast ${getState().fasts[key] ? 'checked' : ''} aria-label="Ayuné este día" /><span></span></span></label>
        ${getState().fasts[key] ? `<div class="list-row"><div class="grow">Tipo</div><select class="input" style="width:auto;min-height:40px" data-fasttype>${FAST_TYPES.map((t) => `<option value="${t.id}" ${getState().fasts[key].type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>` : ''}</div>
      <div class="list" ${per ? 'style="opacity:.45;pointer-events:none"' : ''}>
        ${PRAYERS.map((p) => {
          const r = rec[p.id] || {};
          return `<div class="list-row">
            <div class="grow"><div style="font-weight:600">${p.es} <span class="ar muted" lang="ar">${p.ar}</span></div><div class="meta">${p.mean}${r.jamaah ? ' · en congregación' : ''}</div></div>
            <button class="check" data-p="${p.id}" aria-pressed="${!!r.done}" aria-label="${p.es} rezado">${icon('check')}</button>
          </div>`;
        }).join('')}
      </div>
      <p class="help" style="margin-top:12px">${key === todayKey() ? 'Es hoy: también puedes marcarlo desde la lista de arriba.' : 'Si te saltaste alguna, la recomendación es recuperarla (qada) cuanto antes.'}</p>`;
  };

  openSheet(title, body(), (root) => {
    const refresh = () => { root.innerHTML = body(); };
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-p]');
      if (!b) return;
      update((s) => {
        const r = ((s.prayers[key] ||= {})[b.dataset.p] ||= {});
        r.done = !r.done;
        if (!r.done) r.jamaah = false;
        r.at = r.done ? Date.now() : undefined;
      });
      haptic(8); refresh(); rerender();
    });
    root.addEventListener('change', (e) => {
      if (e.target.matches('[data-fast]')) {
        update((s) => { toggleFast(s, key); });
        haptic(8); refresh(); rerender(); return;
      }
      if (e.target.matches('[data-fasttype]')) {
        update((s) => { toggleFast(s, key, e.target.value); });
        refresh(); rerender(); return;
      }
      if (!e.target.matches('[data-period]')) return;
      const on = e.target.checked;
      update((s) => {
        if (s.period.ongoing && key >= s.period.ongoing) {
          // Editing inside an ongoing period: freeze it first so single days can be changed
          materializePeriod(s, todayKey());
          if (!on && key !== todayKey()) s.period.ongoing = null;
        }
        if (on) s.period.days[key] = true; else delete s.period.days[key];
      });
      haptic(8); refresh(); rerender();
    });
  });
}
