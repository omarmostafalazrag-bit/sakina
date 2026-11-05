import { getState, update } from '../store.js';
import { TASBIH, AFTER_PRAYER_SEQUENCE, ADHKAR_SETS } from '../data/adhkar.js';
import { esc, icon, haptic, toast, openSheet } from '../ui.js';
import { todayKey } from '../core.js';

// Session state survives tab switches (not reloads)
const session = { mode: 'tasbih', presetId: 'subhanallah', count: 0, seqIndex: -1, set: null };

const R = 46, C = 2 * Math.PI * R;

const FREE = { id: 'libre', ar: '', tr: 'Cuenta libre', es: 'Sin límite: cuenta tu dikr sin parar', target: Infinity };
const preset = (id) => (id === 'libre' ? FREE : TASBIH.find((x) => x.id === id));
const labelOf = (id) => (id === 'seq' ? 'Tras la oración 33·33·33' : id === 'libre' ? 'Cuenta libre' : TASBIH.find((x) => x.id === id)?.tr || id);
const fmt = (n) => Number(n || 0).toLocaleString('es-ES');

function rounds(id) {
  const r = getState().dhikr.rounds?.[id] || { total: 0, days: {} };
  return { today: r.days?.[todayKey()] || 0, total: r.total || 0 };
}
function freeStats() {
  const f = getState().dhikr.free || { total: 0, days: {} };
  return { today: f.days?.[todayKey()] || 0, total: f.total || 0 };
}
function addRounds(id, n) {
  if (n <= 0) return;
  update((s) => {
    s.dhikr.rounds ||= {};
    const r = (s.dhikr.rounds[id] ||= { total: 0, days: {} });
    r.total += n;
    r.days[todayKey()] = (r.days[todayKey()] || 0) + n;
  });
}

export function mount(root) {
  if (!session.set) {
    const h = new Date().getHours();
    session.set = h < 12 ? 'morning' : h >= 15 ? 'evening' : 'after';
  }

  const render = () => {
    root.innerHTML = `
      <header class="page-head"><div>
        <h1 class="page-title">Dikr</h1>
        <p class="page-sub">Hoy: <b class="num" data-day-total>${(getState().dhikr.days[todayKey()] || 0).toLocaleString('es-ES')}</b> · Total: <span class="num" data-all-total>${getState().dhikr.total.toLocaleString('es-ES')}</span></p>
      </div></header>
      <div class="seg" role="group" aria-label="Modo" style="margin-bottom:18px">
        <button data-mode="tasbih" aria-pressed="${session.mode === 'tasbih'}">Contador</button>
        <button data-mode="adhkar" aria-pressed="${session.mode === 'adhkar'}">Adhkar</button>
      </div>
      ${session.mode === 'tasbih' ? tasbihView() : adhkarView()}`;
  };

  function tasbihView() {
    const p = preset(session.presetId);
    const free = p.id === 'libre';
    const pct = free ? (session.count % 100) / 100 : Math.min(1, session.count / p.target);
    const inSeq = session.seqIndex >= 0;
    const r = inSeq ? rounds('seq') : free ? null : rounds(p.id);
    const fs = free ? freeStats() : null;
    return `
      <div class="chips" role="group" aria-label="Elige el dikr">
        <button class="chip" data-preset="libre" aria-pressed="${!inSeq && free}">∞ Libre</button>
        <button class="chip" data-seq aria-pressed="${inSeq}">Tras la oración 33·33·33</button>
        ${TASBIH.map((t) => `<button class="chip" data-preset="${t.id}" aria-pressed="${!inSeq && t.id === session.presetId}">${esc(t.tr)}</button>`).join('')}
      </div>
      ${inSeq ? `<div class="step-dots" aria-label="Paso ${session.seqIndex + 1} de 3">${AFTER_PRAYER_SEQUENCE.map((_, i) => `<i class="${i < session.seqIndex ? 'done' : i === session.seqIndex ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      <div class="dhikr-text">
        ${p.ar ? `<span class="ar" lang="ar">${esc(p.ar)}</span>` : ''}
        <div class="tr">${esc(p.tr)}</div>
        <div class="es">${esc(p.es)}</div>
      </div>
      <div class="counter-wrap">
        <button class="counter ${!free && session.count >= p.target ? 'complete' : ''}" data-tap aria-label="Contar. Llevas ${session.count}${free ? '' : ` de ${p.target}`}">
          <svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="${R}"/><circle class="bar" cx="50" cy="50" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
          <span class="c-inner"><span class="c-num num" data-num>${session.count}</span><span class="c-target">${free ? 'sin límite' : `de <span class="num">${p.target}</span>`}</span><span class="c-hint">Toca para contar</span></span>
        </button>
      </div>
      <div class="dhikr-controls">
        <button class="btn ghost" data-reset>${icon('reset')}Reiniciar</button>
        <button class="btn ghost" data-history>${icon('calendar')}Historial</button>
      </div>
      <p class="rounds" data-rounds>${roundsLine(p, inSeq, r, fs)}</p>`;
  }

  function roundsLine(p, inSeq, r, fs) {
    if (fs) return `Cuenta libre · hoy <b class="num">${fmt(fs.today)}</b> · total <b class="num">${fmt(fs.total)}</b>`;
    const what = inSeq ? 'Secuencias completas' : `Rondas de ${p.target}`;
    return `${what} · hoy <b class="num">${fmt(r.today)}</b> · total <b class="num">${fmt(r.total)}</b>`;
  }

  function adhkarView() {
    const set = ADHKAR_SETS[session.set];
    const pkey = `${todayKey()}:${session.set}`;
    const prog = getState().adhkarProgress[pkey] || {};
    const doneCount = set.items.filter((it, i) => (prog[i] || 0) >= it.count).length;
    return `
      <div class="chips" role="group" aria-label="Conjunto de adhkar">
        ${Object.entries(ADHKAR_SETS).map(([k, s]) => `<button class="chip" data-set="${k}" aria-pressed="${k === session.set}">${s.label}</button>`).join('')}
      </div>
      <p class="count-line">${doneCount} de ${set.items.length} completados hoy</p>
      <div class="list">
        ${set.items.map((it, i) => {
          const n = prog[i] || 0, done = n >= it.count;
          return `<div class="adhkar-item ${done ? 'done' : ''}">
            <p class="ar" lang="ar">${esc(it.ar)}</p>
            ${it.tr ? `<p class="tr-line">${esc(it.tr)}</p>` : ''}
            <p class="es">${esc(it.es)}</p>
            <div class="foot"><span class="src">${esc(it.src)}</span>
              <button class="tap-count ${done ? 'done' : ''}" data-item="${i}" aria-label="Contar ${i + 1}: ${n} de ${it.count}">${done ? icon('check') : `<span class="num">${n}/${it.count}</span>`}</button></div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function addToTotals(n = 1) {
    update((s) => {
      const k = todayKey();
      s.dhikr.days[k] = (s.dhikr.days[k] || 0) + n;
      s.dhikr.total += n;
    });
  }

  function tap() {
    const p = preset(session.presetId);
    session.count++;
    addToTotals();
    if (p.id === 'libre') {
      update((s) => {
        const f = (s.dhikr.free ||= { total: 0, days: {} });
        f.total++; f.days[todayKey()] = (f.days[todayKey()] || 0) + 1;
      });
    }
    const done = session.count === p.target;
    haptic(done ? [30, 60, 30] : 6);
    // Advance through the post-prayer sequence automatically
    if (done && session.seqIndex >= 0) {
      if (session.seqIndex < AFTER_PRAYER_SEQUENCE.length - 1) {
        setTimeout(() => {
          session.seqIndex++;
          session.presetId = AFTER_PRAYER_SEQUENCE[session.seqIndex];
          session.count = 0;
          render();
        }, 450);
      } else {
        addRounds('seq', 1);
        const r = rounds('seq');
        toast(`Secuencia completa (${r.today} hoy). Termina con «Lā ilāha illallāhu waḥdahu…»`);
        session.seqIndex = -1;
        session.count = 0;
        setTimeout(render, 600);
      }
    } else if (done) toast(`${p.target} completados. Pulsa Reiniciar para registrar la ronda`);
    // Light update without a full re-render, so the press animation stays smooth
    const num = root.querySelector('[data-num]');
    const bar = root.querySelector('.ring .bar');
    const btn = root.querySelector('[data-tap]');
    if (num && bar) {
      num.textContent = session.count;
      num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
      const free = p.id === 'libre';
      bar.setAttribute('stroke-dashoffset', C * (1 - (free ? (session.count % 100) / 100 : Math.min(1, session.count / p.target))));
      btn.classList.toggle('complete', !free && session.count >= p.target);
      btn.setAttribute('aria-label', `Contar. Llevas ${session.count}${free ? '' : ` de ${p.target}`}`);
      if (free) root.querySelector('[data-rounds]').innerHTML = roundsLine(p, false, null, freeStats());
      root.querySelector('[data-day-total]').textContent = (getState().dhikr.days[todayKey()] || 0).toLocaleString('es-ES');
      root.querySelector('[data-all-total]').textContent = getState().dhikr.total.toLocaleString('es-ES');
    }
  }

  // A finished round (count reached the target) is saved when the counter is reset or left
  function commitRound(quiet = false) {
    const p = preset(session.presetId);
    if (!p || p.id === 'libre' || session.seqIndex >= 0) return 0;
    const n = Math.floor(session.count / p.target);
    if (n > 0) {
      addRounds(p.id, n);
      if (!quiet) { const r = rounds(p.id); toast(`Ronda registrada: ${r.today} hoy · ${fmt(r.total)} en total`); }
    }
    return n;
  }

  function openHistory() {
    const all = getState().dhikr.rounds || {};
    const ids = Object.keys(all).sort((a, b) => (all[b].total || 0) - (all[a].total || 0));
    const fs = freeStats();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.parse(todayKey()) - i * 86400000);
      const k = d.toISOString().slice(0, 10);
      const n = Object.values(all).reduce((sum, r) => sum + (r.days?.[k] || 0), 0);
      days.push({ k, n, taps: getState().dhikr.days[k] || 0, label: i === 0 ? 'Hoy' : i === 1 ? 'Ayer' : new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', timeZone: 'UTC' }).format(d) });
    }
    openSheet('Historial de dikr', `
      <div class="stats" style="margin-top:0">
        <div class="stat"><b class="num">${fmt(getState().dhikr.days[todayKey()] || 0)}</b><span>Dikr hoy</span></div>
        <div class="stat"><b class="num">${fmt(Object.values(all).reduce((s2, r) => s2 + (r.days?.[todayKey()] || 0), 0))}</b><span>Rondas hoy</span></div>
        <div class="stat"><b class="num">${fmt(getState().dhikr.total)}</b><span>Dikr total</span></div>
      </div>
      <h3 class="group">Rondas por dikr</h3>
      ${ids.length || fs.total ? `<div class="list">
        ${ids.map((id) => `<div class="list-row"><div class="grow">${esc(labelOf(id))}</div><span class="meta num">hoy ${fmt(all[id].days?.[todayKey()] || 0)} · total ${fmt(all[id].total)}</span></div>`).join('')}
        ${fs.total ? `<div class="list-row"><div class="grow">Cuenta libre</div><span class="meta num">hoy ${fmt(fs.today)} · total ${fmt(fs.total)}</span></div>` : ''}
      </div>` : '<p class="muted">Completa una ronda (por ejemplo 33) y pulsa Reiniciar para que quede registrada.</p>'}
      <h3 class="group">Últimos 7 días</h3>
      <div class="list">${days.map((d) => `<div class="list-row"><div class="grow" style="text-transform:none">${d.label.charAt(0).toUpperCase() + d.label.slice(1)}</div><span class="meta num">${fmt(d.taps)} dikr · ${fmt(d.n)} rondas</span></div>`).join('')}</div>`);
  }

  const onClick = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.mode) { session.mode = t.dataset.mode; render(); }
    else if (t.dataset.preset) { commitRound(); session.presetId = t.dataset.preset; session.count = 0; session.seqIndex = -1; render(); }
    else if ('seq' in t.dataset) { commitRound(); session.seqIndex = 0; session.presetId = AFTER_PRAYER_SEQUENCE[0]; session.count = 0; render(); }
    else if ('tap' in t.dataset) tap();
    else if ('reset' in t.dataset) { commitRound(); session.count = 0; if (session.seqIndex > 0) { session.seqIndex = 0; session.presetId = AFTER_PRAYER_SEQUENCE[0]; } render(); }
    else if ('history' in t.dataset) openHistory();
    else if (t.dataset.set) { session.set = t.dataset.set; render(); }
    else if (t.dataset.item != null) {
      const i = +t.dataset.item;
      const it = ADHKAR_SETS[session.set].items[i];
      const pkey = `${todayKey()}:${session.set}`;
      let finished = false;
      update((s) => {
        const prog = (s.adhkarProgress[pkey] ||= {});
        if ((prog[i] || 0) >= it.count) { prog[i] = 0; return; } // tap again on a done item resets it
        prog[i] = (prog[i] || 0) + 1;
        finished = prog[i] >= it.count;
      });
      addToTotals();
      haptic(finished ? 20 : 6);
      render();
      if (finished) root.querySelector(`[data-item="${i}"]`)?.focus({ preventScroll: true });
    }
  };

  // Keyboard: Space/Enter on the counter works natively. Volume keys are not exposed to the web.
  render();
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
    if (commitRound(true)) session.count = 0; // don't lose a finished round when leaving the tab
  };
}
