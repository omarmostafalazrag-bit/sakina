// "Árabe desde cero": lessons, alphabet explorer and two quizzes.
import { getState, update } from '../store.js';
import { LETTERS, LESSONS_AR, VOCAB, forms } from '../data/arabic.js';
import { esc, icon, openSheet, closeSheet, haptic, toast } from '../ui.js';
import { renderBlocks, bindSay, say } from './blocks.js';

const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function mount(root) {
  const render = () => {
    const done = new Set(getState().arabic.done);
    const best = getState().arabic.best;
    root.innerHTML = `
      <p class="page-sub" style="margin:0 0 14px">Aprende a leer árabe desde la primera letra hasta leer Al-Fatiha. Pulsa ${icon('sound', 'inline-ic')} para escuchar.</p>
      <div class="grid-2" style="margin-bottom:16px">
        <button class="quiz-card" data-quiz="letters"><b>Practica letras</b><span>Mejor: ${best.letters ?? '—'}/10</span></button>
        <button class="quiz-card" data-quiz="vocab"><b>Practica palabras</b><span>Mejor: ${best.vocab ?? '—'}/10</span></button>
      </div>
      <ol class="lesson-list">
        ${LESSONS_AR.map((l, i) => `<li><button class="lesson ${done.has(l.id) ? 'done' : ''}" data-l="${l.id}">
          <span class="lnum" aria-hidden="true">${done.has(l.id) ? icon('check') : i + 1}</span>
          <span class="grow"><span class="ltitle">${esc(l.title)}</span></span>${icon('chev')}</button></li>`).join('')}
      </ol>`;
  };

  const openLesson = (id) => {
    const i = LESSONS_AR.findIndex((l) => l.id === id);
    const l = LESSONS_AR[i];
    const next = LESSONS_AR[i + 1];
    openSheet(`${i + 1}. ${l.title}`, `
      <div class="lesson-body">${renderBlocks(l.blocks)}</div>
      ${l.letters ? `<div class="letter-grid">${LETTERS.map((x, k) => `<button class="letter" data-letter="${k}" aria-label="${x.name}"><span class="ar" lang="ar">${x.ch}</span><span>${x.name}</span></button>`).join('')}</div>` : ''}
      <button class="btn block" data-done style="margin-top:18px">${icon('check')}${next ? 'Hecho, siguiente lección' : 'Hecho'}</button>`,
    (body) => {
      bindSay(body);
      body.addEventListener('click', (e) => {
        const lt = e.target.closest('[data-letter]');
        if (lt) openLetter(+lt.dataset.letter, () => openLesson(id));
      });
      body.querySelector('[data-done]').addEventListener('click', () => {
        if (!getState().arabic.done.includes(id)) update((s) => { s.arabic.done.push(id); });
        haptic(12); render();
        if (next) openLesson(next.id); else closeSheet();
      });
    });
  };

  const openLetter = (k, back) => {
    const l = LETTERS[k];
    const f = forms(l);
    openSheet(`${l.name} · ${l.tr}`, `
      <div class="letter-hero"><span class="ar" lang="ar">${l.ch}</span><button class="say" data-say="${l.ch}" aria-label="Escuchar">${icon('sound')}</button></div>
      <p style="margin:0 0 16px">${esc(l.sound)}</p>
      <div class="forms">${Object.entries(f).map(([k2, v]) => `<div><span class="ar" lang="ar">${v}</span><span>${k2}</span></div>`).join('')}</div>
      ${l.join ? '' : '<p class="help" style="margin-top:10px">Esta letra no se une a la siguiente, por eso su forma inicial es igual a la aislada.</p>'}
      <div class="lar" style="margin-top:16px"><div class="lar-top"><p class="ar" lang="ar">${l.ex.ar}</p><button class="say" data-say="${l.ex.ar}" aria-label="Escuchar">${icon('sound')}</button></div>
        <p class="lar-tr">${esc(l.ex.tr)}</p><p class="lar-es">${esc(l.ex.es)}</p></div>
      <div class="grid-2" style="margin-top:18px">
        <button class="btn ghost" data-prev ${k === 0 ? 'disabled' : ''}>${icon('back')}Anterior</button>
        <button class="btn ghost" data-next ${k === LETTERS.length - 1 ? 'disabled' : ''}>Siguiente${icon('chev')}</button>
      </div>
      <button class="btn soft block" data-back style="margin-top:10px">Volver a la lección</button>`,
    (body) => {
      bindSay(body);
      body.querySelector('[data-prev]').addEventListener('click', () => openLetter(k - 1, back));
      body.querySelector('[data-next]').addEventListener('click', () => openLetter(k + 1, back));
      body.querySelector('[data-back]').addEventListener('click', back);
    });
  };

  const openQuiz = (kind) => {
    const pool = kind === 'letters'
      ? LETTERS.map((l) => ({ q: l.ch, a: `${l.name} (${l.tr})`, say: l.ch }))
      : VOCAB.map((v) => ({ q: v.ar, a: v.es, say: v.ar }));
    const qs = shuffle(pool).slice(0, 10);
    let i = 0, score = 0;
    const show = () => {
      if (i >= qs.length) {
        const prev = getState().arabic.best[kind] ?? 0;
        if (score > prev) update((s) => { s.arabic.best[kind] = score; });
        openSheet('Resultado', `<div class="quiz-result"><b class="num">${score}/10</b><p>${score >= 9 ? '¡Excelente! MashaAllah.' : score >= 6 ? 'Muy bien, sigue practicando.' : 'Repasa las lecciones y vuelve a intentarlo.'}</p></div>
          <button class="btn block" data-again>Otra ronda</button>`, (b) => b.querySelector('[data-again]').addEventListener('click', () => openQuiz(kind)));
        render();
        return;
      }
      const cur = qs[i];
      const opts = shuffle([cur.a, ...shuffle(pool.filter((p) => p.a !== cur.a)).slice(0, 3).map((p) => p.a)]);
      openSheet(`Pregunta ${i + 1} de 10`, `
        <p class="muted" style="margin:0 0 6px">${kind === 'letters' ? '¿Qué letra es?' : '¿Qué significa?'}</p>
        <div class="quiz-q"><span class="ar" lang="ar">${esc(cur.q)}</span><button class="say" data-say="${esc(cur.say)}" aria-label="Escuchar">${icon('sound')}</button></div>
        <div class="quiz-opts">${opts.map((o) => `<button class="btn ghost block" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>
        <p class="small muted" style="text-align:center;margin-top:12px">Aciertos: <span class="num">${score}</span></p>`,
      (body) => {
        bindSay(body);
        body.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
          const ok = b.dataset.opt === cur.a;
          if (ok) score++;
          haptic(ok ? 10 : [20, 40, 20]);
          body.querySelectorAll('[data-opt]').forEach((x) => {
            x.disabled = true;
            if (x.dataset.opt === cur.a) x.classList.add('right');
            else if (x === b) x.classList.add('wrong');
          });
          setTimeout(() => { i++; show(); }, ok ? 550 : 1200);
        }));
      });
    };
    show();
  };

  render();
  const onClick = (e) => {
    const l = e.target.closest('[data-l]');
    if (l) return openLesson(l.dataset.l);
    const q = e.target.closest('[data-quiz]');
    if (q) openQuiz(q.dataset.quiz);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

export { say, toast };
