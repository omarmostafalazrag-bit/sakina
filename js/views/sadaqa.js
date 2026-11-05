import { getState, update, uid } from '../store.js';
import { esc, icon, openSheet, closeSheet, toast, money, download, haptic } from '../ui.js';
import { todayKey, cap } from '../core.js';

export const TYPES = [
  { id: 'sadaqa', label: 'Sadaqa' },
  { id: 'zakat', label: 'Zakat' },
  { id: 'fitr', label: 'Zakat al-Fitr' },
  { id: 'fidya', label: 'Fidya / Kaffara' },
  { id: 'jariya', label: 'Sadaqa yariya' },
  { id: 'otro', label: 'Otro' },
];
const typeLabel = (id) => TYPES.find((t) => t.id === id)?.label || 'Otro';

// Non-monetary sadaqa: «Toda buena obra es sadaqa» (Al-Bujari 6021)
export const ACTS = [
  { id: 'tiempo', label: 'Voluntariado' },
  { id: 'comida', label: 'Dar de comer' },
  { id: 'objetos', label: 'Ropa u objetos' },
  { id: 'ayuda', label: 'Ayudar a alguien' },
  { id: 'visita', label: 'Visitar a un enfermo' },
  { id: 'ensenar', label: 'Enseñar o aconsejar' },
  { id: 'palabra', label: 'Sonrisa o buena palabra' },
  { id: 'sangre', label: 'Donar sangre' },
  { id: 'otro', label: 'Otra buena obra' },
];
const actLabel = (id) => ACTS.find((t) => t.id === id)?.label || 'Buena obra';
const isAct = (d) => d.kind === 'act';
const CURRENCIES = ['EUR', 'USD', 'GBP', 'MAD', 'DZD', 'TND', 'EGP', 'SAR', 'AED', 'TRY', 'MXN', 'ARS', 'CHF'];

export function mount(root) {
  const render = () => {
    const { sadaqa, settings } = getState();
    const cur = settings.currency;
    const now = new Date(todayKey());
    const y = now.getUTCFullYear(), m = now.getUTCMonth();
    const inCur = sadaqa.filter((d) => !isAct(d) && d.currency === cur);
    const actsYear = sadaqa.filter((d) => isAct(d) && +d.date.slice(0, 4) === y);
    const hours = actsYear.reduce((n, d) => n + (d.hours || 0), 0);
    const sum = (arr) => arr.reduce((n, d) => n + d.amount, 0);
    const yearList = inCur.filter((d) => +d.date.slice(0, 4) === y);
    const monthList = yearList.filter((d) => +d.date.slice(5, 7) === m + 1);
    const byType = TYPES.map((t) => ({ ...t, v: sum(yearList.filter((d) => d.type === t.id)) })).filter((t) => t.v > 0).sort((a, b) => b.v - a.v);
    const max = byType[0]?.v || 1;
    const others = [...new Set(sadaqa.filter((d) => !isAct(d)).map((d) => d.currency))].filter((c) => c !== cur);

    // Group history by month
    const sorted = [...sadaqa].sort((a, b) => b.date.localeCompare(a.date) || b.created - a.created);
    const groups = new Map();
    for (const d of sorted) {
      const k = d.date.slice(0, 7);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(d);
    }

    root.innerHTML = `
      <header class="page-head"><div>
        <h1 class="page-title">Sadaqa</h1>
        <p class="page-sub">Lo que das, en dinero o en buenas obras. Solo lo ves tú.</p>
      </div>
      <button class="icon-btn" data-zakat aria-label="Calculadora de zakat">${icon('calc')}</button></header>

      <section class="total-card" aria-label="Resumen">
        <div class="label">Dado en ${y} · ${yearList.length} ${yearList.length === 1 ? 'donación' : 'donaciones'}</div>
        <div class="amount">${money(sum(yearList), cur)}</div>
        <div class="split">
          <div><b>${money(sum(monthList), cur)}</b><span>${cap(new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(now))}</span></div>
          <div><b class="num">${actsYear.length}${hours ? ` · ${hours} h` : ''}</b><span>${actsYear.length === 1 ? 'Buena obra este año' : 'Buenas obras este año'}</span></div>
        </div>
      </section>
      ${others.length ? `<p class="small muted" style="margin:8px 4px 0">También tienes donaciones en ${others.join(', ')}. El resumen muestra ${cur}; cámbialo al añadir una nueva.</p>` : ''}

      ${byType.length ? `<h2 class="section">Por tipo en ${y}</h2>
      <div class="card bars">${byType.map((t) => `<div class="bar-row"><span>${t.label}</span><span class="track"><i style="transform:scaleX(${(t.v / max).toFixed(3)})"></i></span><span class="v">${money(t.v, cur)}</span></div>`).join('')}</div>` : ''}

      <h2 class="section">Historial</h2>
      ${sadaqa.length ? [...groups].map(([k, list]) => `
        <div class="month-head"><span>${cap(new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(new Date(k + '-01')))} ${k.slice(0, 4)}</span>
          <span class="num">${monthTotals(list)}</span></div>
        <div class="list">${list.map((d) => `
          <button class="list-row ${isAct(d) ? 'is-act' : ''}" data-edit="${d.id}">
            <div class="grow"><div>${esc(d.to || (isAct(d) ? actLabel(d.act) : typeLabel(d.type)))}</div>
              <div class="meta">${isAct(d) ? actLabel(d.act) : typeLabel(d.type)} · ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(d.date))}${d.note ? ' · ' + esc(d.note) : ''}</div></div>
            ${isAct(d) ? `<span class="act-badge">${d.hours ? `${d.hours} h` : icon('heart')}</span>` : `<span class="don-amount">${money(d.amount, d.currency)}</span>`}
          </button>`).join('')}</div>`).join('')
        + `<button class="btn ghost block" style="margin-top:16px" data-csv>${icon('download')}Exportar a hoja de cálculo (CSV)</button>`
      : `<div class="empty"><h3>Tu primera sadaqa</h3><p>«La caridad no disminuye la riqueza» (Muslim 2588). Apunta aquí cada donación y también tus buenas obras: «Toda buena obra es sadaqa» (Al-Bujari 6021).</p></div>`}

      <button class="fab" data-add>${icon('plus')}Añadir</button>`;
  };

  const monthTotals = (list) => {
    const by = {};
    let acts = 0;
    for (const d of list) { if (isAct(d)) acts++; else by[d.currency] = (by[d.currency] || 0) + d.amount; }
    return [...Object.entries(by).map(([c, v]) => money(v, c)), acts ? `${acts} ${acts === 1 ? 'obra' : 'obras'}` : ''].filter(Boolean).join(' · ');
  };

  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if ('add' in b.dataset) openForm(null, render);
    else if (b.dataset.edit) openForm(b.dataset.edit, render);
    else if ('csv' in b.dataset) exportCsv();
    else if ('zakat' in b.dataset) openZakat();
  };

  render();
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

function openForm(id, onDone) {
  const st = getState();
  const existing = id ? st.sadaqa.find((d) => d.id === id) : null;
  const d = existing || { kind: 'money', amount: '', currency: st.settings.currency, date: todayKey(), type: 'sadaqa', act: 'tiempo', to: '', note: '', hours: '' };
  let kind = d.kind === 'act' ? 'act' : 'money';
  const recent = [...new Set(st.sadaqa.map((x) => x.to).filter(Boolean))].slice(-12);

  openSheet(existing ? 'Editar sadaqa' : 'Nueva sadaqa', `
    <form data-form novalidate>
      <div class="seg" role="group" aria-label="Clase de sadaqa" style="margin-bottom:16px">
        <button type="button" data-kind="money" aria-pressed="${kind === 'money'}">Dinero</button>
        <button type="button" data-kind="act" aria-pressed="${kind === 'act'}">Buena obra</button>
      </div>
      <div data-money ${kind === 'act' ? 'hidden' : ''}>
      <div class="row" style="align-items:flex-end;gap:10px">
        <label class="field grow"><span>Cantidad</span>
          <input class="input num" name="amount" type="number" inputmode="decimal" min="0" step="0.01" required placeholder="0,00" value="${d.amount}" style="font-size:22px;font-weight:600" /></label>
        <label class="field" style="width:110px"><span>Moneda</span>
          <select class="input" name="currency">${CURRENCIES.map((c) => `<option ${c === d.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      </div>
      <p class="help" data-err hidden style="color:var(--danger);margin-top:-8px">Escribe una cantidad mayor que cero.</p>
      <div class="field"><span>Tipo</span>
        <div class="chips" role="radiogroup" aria-label="Tipo" style="margin-bottom:0">
          ${TYPES.map((t) => `<button type="button" class="chip" role="radio" data-type="${t.id}" aria-pressed="${t.id === d.type}" aria-checked="${t.id === d.type}">${t.label}</button>`).join('')}
        </div></div>
      </div>
      <div data-act ${kind === 'money' ? 'hidden' : ''}>
        <div class="field"><span>¿Qué hiciste?</span>
          <div class="chips" role="radiogroup" aria-label="Buena obra" style="margin-bottom:0;flex-wrap:wrap;overflow:visible">
            ${ACTS.map((t) => `<button type="button" class="chip" role="radio" data-actid="${t.id}" aria-pressed="${t.id === d.act}" aria-checked="${t.id === d.act}">${t.label}</button>`).join('')}
          </div></div>
        <label class="field"><span>Horas dedicadas (opcional)</span>
          <input class="input num" name="hours" type="number" inputmode="decimal" min="0" step="0.5" placeholder="0" value="${d.hours || ''}" /></label>
        <p class="help">«Toda buena obra es sadaqa» (Al-Bujari 6021): tu tiempo, tu comida, tu ayuda y hasta tu sonrisa cuentan.</p>
      </div>
      <label class="field"><span data-tolabel>${kind === 'act' ? 'Descripción o a quién' : 'A quién o a qué'}</span>
        <input class="input" name="to" list="sadaqa-recent" placeholder="Mezquita, ONG, una persona…" value="${esc(d.to)}" autocomplete="off" />
        <datalist id="sadaqa-recent">${recent.map((r) => `<option value="${esc(r)}">`).join('')}</datalist></label>
      <div class="grid-2">
        <label class="field"><span>Fecha</span><input class="input" type="date" name="date" value="${d.date}" max="${todayKey()}" required /></label>
        <label class="field"><span>Nota (opcional)</span><input class="input" name="note" value="${esc(d.note)}" placeholder="Por mis padres…" /></label>
      </div>
      <button class="btn block" type="submit" style="margin-top:6px">${existing ? 'Guardar cambios' : 'Guardar'}</button>
      ${existing ? `<button class="btn danger block" type="button" data-del style="margin-top:10px">${icon('trash')}Eliminar</button>` : ''}
    </form>`, (root) => {
    const form = root.querySelector('[data-form]');
    let type = d.type || 'sadaqa';
    let act = d.act || 'tiempo';
    root.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => {
      kind = b.dataset.kind;
      root.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      root.querySelector('[data-money]').hidden = kind !== 'money';
      root.querySelector('[data-act]').hidden = kind !== 'act';
      root.querySelector('[data-tolabel]').textContent = kind === 'act' ? 'Descripción o a quién' : 'A quién o a qué';
      form.to.placeholder = kind === 'act' ? 'Banco de alimentos, mi vecino, la mezquita…' : 'Mezquita, ONG, una persona…';
    }));
    root.querySelectorAll('[data-actid]').forEach((c) => c.addEventListener('click', () => {
      act = c.dataset.actid;
      root.querySelectorAll('[data-actid]').forEach((x) => { x.setAttribute('aria-pressed', x === c); x.setAttribute('aria-checked', x === c); });
    }));
    root.querySelectorAll('[data-type]').forEach((c) => c.addEventListener('click', () => {
      type = c.dataset.type;
      root.querySelectorAll('[data-type]').forEach((x) => { x.setAttribute('aria-pressed', x === c); x.setAttribute('aria-checked', x === c); });
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const base = { date: f.get('date') || todayKey(), to: String(f.get('to')).trim(), note: String(f.get('note')).trim() };
      let rec;
      if (kind === 'act') {
        const hours = Math.max(0, Math.round((parseFloat(String(f.get('hours')).replace(',', '.')) || 0) * 2) / 2);
        rec = { ...base, kind: 'act', act, hours, amount: 0, currency: null, type: null };
      } else {
        const amount = Math.round(parseFloat(String(f.get('amount')).replace(',', '.')) * 100) / 100;
        if (!(amount > 0)) { root.querySelector('[data-err]').hidden = false; form.amount.focus(); return; }
        rec = { ...base, kind: 'money', amount, currency: f.get('currency'), type, act: null, hours: null };
      }
      update((s) => {
        if (rec.currency) s.settings.currency = rec.currency;
        if (existing) Object.assign(s.sadaqa.find((x) => x.id === id), rec);
        else s.sadaqa.push({ id: uid(), created: Date.now(), ...rec });
      });
      haptic(12);
      closeSheet(); onDone();
      toast(existing ? 'Sadaqa actualizada' : 'Que Allah te lo acepte');
    });
    root.querySelector('[data-del]')?.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta sadaqa del registro?')) return;
      update((s) => { s.sadaqa = s.sadaqa.filter((x) => x.id !== id); });
      closeSheet(); onDone();
      toast('Eliminada del registro');
    });
    if (!existing && kind === 'money') setTimeout(() => form.amount.focus({ preventScroll: true }), 380);
  });
}

function exportCsv() {
  const rows = [['Fecha', 'Clase', 'Tipo', 'Destinatario o descripción', 'Cantidad', 'Moneda', 'Horas', 'Nota']];
  for (const d of [...getState().sadaqa].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push(isAct(d)
      ? [d.date, 'Buena obra', actLabel(d.act), d.to, '', '', d.hours ? String(d.hours).replace('.', ',') : '', d.note]
      : [d.date, 'Dinero', typeLabel(d.type), d.to, String(d.amount).replace('.', ','), d.currency, '', d.note]);
  }
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  download(`sadaqa-${todayKey()}.csv`, csv, 'text/csv;charset=utf-8');
}

function openZakat() {
  const cur = getState().settings.currency;
  openSheet('Calculadora de zakat', `
    <p class="help" style="margin:0 0 16px">Orientativa. El zakat es el 2,5 % de tu patrimonio si supera el nisab (85 g de oro) y lo has tenido un año lunar completo.</p>
    <form data-z>
      <label class="field"><span>Precio del oro hoy (${cur} por gramo)</span><input class="input num" name="gold" type="number" inputmode="decimal" step="0.01" min="0" placeholder="Búscalo en tu banco o joyería" /></label>
      <div class="grid-2">
        <label class="field"><span>Efectivo y cuentas</span><input class="input num" name="cash" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" /></label>
        <label class="field"><span>Oro y plata (valor)</span><input class="input num" name="metals" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" /></label>
        <label class="field"><span>Inversiones y mercancía</span><input class="input num" name="inv" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" /></label>
        <label class="field"><span>Deudas a pagar ya</span><input class="input num" name="debts" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0" /></label>
      </div>
    </form>
    <div class="card" data-out aria-live="polite"><p class="muted" style="margin:0">Rellena los campos para ver el resultado.</p></div>
    <p class="help" style="margin-top:12px">Para casos concretos (nómina, plan de pensiones, negocio) consulta a un imam o a un sabio de confianza.</p>`,
  (root) => {
    const form = root.querySelector('[data-z]');
    const out = root.querySelector('[data-out]');
    form.addEventListener('input', () => {
      const v = (n) => parseFloat(String(form[n].value).replace(',', '.')) || 0;
      const gold = v('gold');
      const wealth = v('cash') + v('metals') + v('inv') - v('debts');
      if (!gold) { out.innerHTML = `<p class="muted" style="margin:0">Necesito el precio del oro para calcular el nisab.</p>`; return; }
      const nisab = gold * 85;
      const due = wealth >= nisab ? wealth * 0.025 : 0;
      out.innerHTML = `
        <div class="row" style="justify-content:space-between"><span class="muted">Patrimonio neto</span><b class="num">${money(Math.max(0, wealth), cur)}</b></div>
        <div class="row" style="justify-content:space-between;margin-top:6px"><span class="muted">Nisab (85 g de oro)</span><b class="num">${money(nisab, cur)}</b></div>
        <div style="border-top:1px solid var(--line);margin:12px 0;padding-top:12px">
          ${due ? `<div class="muted small">Zakat a pagar</div><div style="font:500 34px/1.1 var(--font-display)" class="num">${money(due, cur)}</div>`
            : `<b>No llegas al nisab.</b> <span class="muted">No tienes obligación de zakat este año; la sadaqa voluntaria siempre está abierta.</span>`}
        </div>`;
    });
  });
}
