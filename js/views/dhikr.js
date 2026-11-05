import { getState, update } from '../store.js';
import { TASBIH, AFTER_PRAYER_SEQUENCE, ADHKAR_SETS } from '../data/adhkar.js';
import { esc, icon, haptic, toast } from '../ui.js';
import { todayKey } from '../core.js';

// Session state survives tab switches (not reloads)
const session = { mode: 'tasbih', presetId: 'subhanallah', count: 0, seqIndex: -1, set: null };

const R = 46, C = 2 * Math.PI * R;

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
    const p = TASBIH.find((x) => x.id === session.presetId);
    const pct = Math.min(1, session.count / p.target);
    const inSeq = session.seqIndex >= 0;
    return `
      <div class="chips" role="group" aria-label="Elige el dikr">
        <button class="chip" data-seq aria-pressed="${inSeq}">Tras la oración 33·33·33</button>
        ${TASBIH.map((t) => `<button class="chip" data-preset="${t.id}" aria-pressed="${!inSeq && t.id === session.presetId}">${esc(t.tr)}</button>`).join('')}
      </div>
      ${inSeq ? `<div class="step-dots" aria-label="Paso ${session.seqIndex + 1} de 3">${AFTER_PRAYER_SEQUENCE.map((_, i) => `<i class="${i < session.seqIndex ? 'done' : i === session.seqIndex ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      <div class="dhikr-text">
        <span class="ar" lang="ar">${esc(p.ar)}</span>
        <div class="tr">${esc(p.tr)}</div>
        <div class="es">${esc(p.es)}</div>
      </div>
      <div class="counter-wrap">
        <button class="counter ${session.count >= p.target ? 'complete' : ''}" data-tap aria-label="Contar. Llevas ${session.count} de ${p.target}">
          <svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="${R}"/><circle class="bar" cx="50" cy="50" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg>
          <span class="c-inner"><span class="c-num num" data-num>${session.count}</span><span class="c-target">de <span class="num">${p.target}</span></span><span class="c-hint">Toca para contar</span></span>
        </button>
      </div>
      <div class="dhikr-controls">
        <button class="btn ghost" data-reset>${icon('reset')}Reiniciar</button>
      </div>`;
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
    const p = TASBIH.find((x) => x.id === session.presetId);
    session.count++;
    addToTotals();
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
        toast('Completado. Termina con «Lā ilāha illallāhu waḥdahu…»');
        session.seqIndex = -1;
      }
    } else if (done) toast(`${p.target} completados`);
    // Light update without a full re-render, so the press animation stays smooth
    const num = root.querySelector('[data-num]');
    const bar = root.querySelector('.ring .bar');
    const btn = root.querySelector('[data-tap]');
    if (num && bar) {
      num.textContent = session.count;
      num.classList.remove('bump'); void num.offsetWidth; num.classList.add('bump');
      bar.setAttribute('stroke-dashoffset', C * (1 - Math.min(1, session.count / p.target)));
      btn.classList.toggle('complete', session.count >= p.target);
      btn.setAttribute('aria-label', `Contar. Llevas ${session.count} de ${p.target}`);
      root.querySelector('[data-day-total]').textContent = (getState().dhikr.days[todayKey()] || 0).toLocaleString('es-ES');
      root.querySelector('[data-all-total]').textContent = getState().dhikr.total.toLocaleString('es-ES');
    }
  }

  const onClick = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.mode) { session.mode = t.dataset.mode; render(); }
    else if (t.dataset.preset) { session.presetId = t.dataset.preset; session.count = 0; session.seqIndex = -1; render(); }
    else if ('seq' in t.dataset) { session.seqIndex = 0; session.presetId = AFTER_PRAYER_SEQUENCE[0]; session.count = 0; render(); }
    else if ('tap' in t.dataset) tap();
    else if ('reset' in t.dataset) { session.count = 0; if (session.seqIndex > 0) { session.seqIndex = 0; session.presetId = AFTER_PRAYER_SEQUENCE[0]; } render(); }
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
  return () => root.removeEventListener('click', onClick);
}
