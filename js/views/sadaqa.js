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
const CURRENCIES = ['EUR', 'USD', 'GBP', 'MAD', 'DZD', 'TND', 'EGP', 'SAR', 'AED', 'TRY', 'MXN', 'ARS', 'CHF'];

export function mount(root) {
  const render = () => {
    const { sadaqa, settings } = getState();
    const cur = settings.currency;
    const now = new Date(todayKey());
    const y = now.getUTCFullYear(), m = now.getUTCMonth();
    const inCur = sadaqa.filter((d) => d.currency === cur);
    const sum = (arr) => arr.reduce((n, d) => n + d.amount, 0);
    const yearList = inCur.filter((d) => +d.date.slice(0, 4) === y);
    const monthList = yearList.filter((d) => +d.date.slice(5, 7) === m + 1);
    const byType = TYPES.map((t) => ({ ...t, v: sum(yearList.filter((d) => d.type === t.id)) })).filter((t) => t.v > 0).sort((a, b) => b.v - a.v);
    const max = byType[0]?.v || 1;
    const others = [...new Set(sadaqa.map((d) => d.currency))].filter((c) => c !== cur);

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
        <p class="page-sub">Lleva la cuenta de lo que das. Solo lo ves tú.</p>
      </div>
      <button class="icon-btn" data-zakat aria-label="Calculadora de zakat">${icon('calc')}</button></header>

      <section class="total-card" aria-label="Resumen">
        <div class="label">Dado en ${y}</div>
        <div class="amount">${money(sum(yearList), cur)}</div>
        <div class="split">
          <div><b>${money(sum(monthList), cur)}</b><span>${cap(new Intl.DateTimeFormat('es-ES', { month: 'long', timeZone: 'UTC' }).format(now))}</span></div>
          <div><b class="num">${yearList.length}</b><span>${yearList.length === 1 ? 'Donación este año' : 'Donaciones este año'}</span></div>
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
          <button class="list-row" data-edit="${d.id}">
            <div class="grow"><div>${esc(d.to || typeLabel(d.type))}</div>
              <div class="meta">${typeLabel(d.type)} · ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(d.date))}${d.note ? ' · ' + esc(d.note) : ''}</div></div>
            <span class="don-amount">${money(d.amount, d.currency)}</span>
          </button>`).join('')}</div>`).join('')
        + `<button class="btn ghost block" style="margin-top:16px" data-csv>${icon('download')}Exportar a hoja de cálculo (CSV)</button>`
      : `<div class="empty"><h3>Tu primera sadaqa</h3><p>«La caridad no disminuye la riqueza» (Muslim 2588). Apunta aquí cada donación: a quién, cuánto y de qué tipo.</p></div>`}

      <button class="fab" data-add>${icon('plus')}Añadir</button>`;
  };

  const monthTotals = (list) => {
    const by = {};
    for (const d of list) by[d.currency] = (by[d.currency] || 0) + d.amount;
    return Object.entries(by).map(([c, v]) => money(v, c)).join(' · ');
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
  const d = existing || { amount: '', currency: st.settings.currency, date: todayKey(), type: 'sadaqa', to: '', note: '' };
  const recent = [...new Set(st.sadaqa.map((x) => x.to).filter(Boolean))].slice(-12);

  openSheet(existing ? 'Editar donación' : 'Nueva donación', `
    <form data-form novalidate>
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
      <label class="field"><span>A quién o a qué</span>
        <input class="input" name="to" list="sadaqa-recent" placeholder="Mezquita, ONG, una persona…" value="${esc(d.to)}" autocomplete="off" />
        <datalist id="sadaqa-recent">${recent.map((r) => `<option value="${esc(r)}">`).join('')}</datalist></label>
      <div class="grid-2">
        <label class="field"><span>Fecha</span><input class="input" type="date" name="date" value="${d.date}" max="${todayKey()}" required /></label>
        <label class="field"><span>Nota (opcional)</span><input class="input" name="note" value="${esc(d.note)}" placeholder="Por mis padres…" /></label>
      </div>
      <button class="btn block" type="submit" style="margin-top:6px">${existing ? 'Guardar cambios' : 'Guardar donación'}</button>
      ${existing ? `<button class="btn danger block" type="button" data-del style="margin-top:10px">${icon('trash')}Eliminar</button>` : ''}
    </form>`, (root) => {
    const form = root.querySelector('[data-form]');
    let type = d.type;
    root.querySelectorAll('[data-type]').forEach((c) => c.addEventListener('click', () => {
      type = c.dataset.type;
      root.querySelectorAll('[data-type]').forEach((x) => { x.setAttribute('aria-pressed', x === c); x.setAttribute('aria-checked', x === c); });
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const amount = Math.round(parseFloat(String(f.get('amount')).replace(',', '.')) * 100) / 100;
      if (!(amount > 0)) { root.querySelector('[data-err]').hidden = false; form.amount.focus(); return; }
      const rec = { amount, currency: f.get('currency'), date: f.get('date') || todayKey(), type, to: String(f.get('to')).trim(), note: String(f.get('note')).trim() };
      update((s) => {
        s.settings.currency = rec.currency;
        if (existing) Object.assign(s.sadaqa.find((x) => x.id === id), rec);
        else s.sadaqa.push({ id: uid(), created: Date.now(), ...rec });
      });
      haptic(12);
      closeSheet(); onDone();
      toast(existing ? 'Donación actualizada' : 'Que Allah la acepte');
    });
    root.querySelector('[data-del]')?.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta donación del registro?')) return;
      update((s) => { s.sadaqa = s.sadaqa.filter((x) => x.id !== id); });
      closeSheet(); onDone();
      toast('Donación eliminada');
    });
    if (!existing) setTimeout(() => form.amount.focus({ preventScroll: true }), 380);
  });
}

function exportCsv() {
  const rows = [['Fecha', 'Tipo', 'Destinatario', 'Cantidad', 'Moneda', 'Nota']];
  for (const d of [...getState().sadaqa].sort((a, b) => a.date.localeCompare(b.date))) {
    rows.push([d.date, typeLabel(d.type), d.to, String(d.amount).replace('.', ','), d.currency, d.note]);
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
