// Tawba: guide to repentance plus a private "days firm" commitment counter.
import { getState, update } from '../store.js';
import { TAWBA, TAWBA_GROUPS, TAWBA_INTRO, RELAPSE_MESSAGES } from '../data/tawba.js';
import { esc, icon, openSheet, closeSheet, toast, haptic } from '../ui.js';
import { todayKey } from '../core.js';
import { renderBlocks, bindSay } from './blocks.js';

const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export function mount(root) {
  const render = () => {
    const t = getState().tawba || {};
    const days = t.start ? daysBetween(t.start, todayKey()) : 0;
    const best = Math.max(t.best || 0, days);
    root.innerHTML = `
      <p class="page-sub" style="margin:0 0 14px">Volver a Allah siempre es posible. Aquí tienes cómo hacerlo bien, qué hacer según cada caso y cómo seguir adelante.</p>
      <div class="lar" style="margin-bottom:16px">
        <div class="lar-top"><p class="ar" lang="ar">${esc(TAWBA_INTRO.ar)}</p><button class="say" data-say="${esc(TAWBA_INTRO.ar)}" aria-label="Escuchar">${icon('sound')}</button></div>
        <p class="lar-tr">${esc(TAWBA_INTRO.tr)}</p><p class="lar-es">${esc(TAWBA_INTRO.es)}</p>
      </div>

      <section class="commit-card" aria-label="Mi compromiso">
        <div class="grow">
          <div class="small" style="font-weight:700">Mi compromiso</div>
          ${t.start
            ? `<div class="commit-days"><b class="num">${days}</b> ${days === 1 ? 'día firme' : 'días firme'}</div>
               <div class="small muted">Mejor racha: <span class="num">${best}</span> · Solo tú lo ves${t.label ? ` · ${esc(t.label)}` : ''}</div>`
            : '<div class="small muted" style="margin-top:2px">Elige algo que quieres dejar y cuenta los días. No hace falta escribir qué es: es solo para ti.</div>'}
        </div>
        ${t.start
          ? '<button class="btn ghost" data-relapse>He recaído</button>'
          : '<button class="btn" data-commit>Empezar hoy</button>'}
      </section>

      ${TAWBA_GROUPS.map((g) => `
        <h2 class="section">${esc(g.label)}</h2>
        <div class="lesson-list">${TAWBA.filter((x) => x.group === g.id).map((x) => `
          <button class="lesson" data-t="${x.id}"><span class="grow"><span class="ltitle">${esc(x.title)}</span></span>${icon('chev')}</button>`).join('')}
        </div>`).join('')}
      <p class="help" style="margin-top:18px">Para tu caso concreto, sobre todo si afecta a otras personas, consulta a un imam o a un sabio de confianza. Puedes preguntar sin dar detalles que te expongan.</p>`;
  };

  const open = (id) => {
    const x = TAWBA.find((t) => t.id === id);
    const list = TAWBA.filter((t) => t.group === x.group);
    const next = list[list.indexOf(x) + 1];
    openSheet(x.title, `<div class="lesson-body">${renderBlocks(x.blocks)}</div>
      ${next ? `<button class="btn soft block" data-next="${next.id}" style="margin-top:16px">Siguiente: ${esc(next.title)}${icon('chev')}</button>` : ''}`,
    (body) => {
      bindSay(body);
      body.querySelector('[data-next]')?.addEventListener('click', (e) => open(e.currentTarget.dataset.next));
    });
  };

  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.t) open(b.dataset.t);
    else if ('commit' in b.dataset) {
      openSheet('Mi compromiso', `
        <p style="margin:0 0 14px;line-height:1.55">Desde hoy cuentas los días que te mantienes firme. Si recaes, lo marcas, te arrepientes y vuelves a empezar sin culpa.</p>
        <label class="field"><span>Un nombre para recordarlo (opcional)</span>
          <input class="input" data-label maxlength="40" placeholder="Por ejemplo: «mi promesa»" autocomplete="off" /></label>
        <p class="help">Se guarda solo en este móvil. Puedes dejarlo en blanco.</p>
        <button class="btn block" data-go>Empezar hoy, bismillah</button>`,
      (body) => {
        body.querySelector('[data-go]').addEventListener('click', () => {
          const label = body.querySelector('[data-label]').value.trim();
          update((s) => { s.tawba = { ...(s.tawba || {}), start: todayKey(), label, best: s.tawba?.best || 0 }; });
          haptic(14);
          closeSheet();
          render();
          toast('Que Allah te dé firmeza');
        });
      });
    } else if ('relapse' in b.dataset) {
      const msg = RELAPSE_MESSAGES[Math.floor(Math.random() * RELAPSE_MESSAGES.length)];
      update((s) => {
        const d = daysBetween(s.tawba.start, todayKey());
        s.tawba.best = Math.max(s.tawba.best || 0, d);
        s.tawba.relapses = (s.tawba.relapses || 0) + 1;
        s.tawba.start = todayKey();
      });
      haptic(10);
      render();
      openSheet('Vuelve a empezar', `<p style="font-size:17px;line-height:1.6;margin:0 0 14px">${esc(msg)}</p>
        <div class="lar"><div class="lar-top"><p class="ar" lang="ar">رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ</p></div>
        <p class="lar-tr">Rabbighfir lī wa tub ʿalayya innaka antat-tawwābur-raḥīm</p>
        <p class="lar-es">Señor mío, perdóname y acepta mi arrepentimiento; Tú eres el que acepta el arrepentimiento, el Misericordioso.</p></div>
        <button class="btn soft block" data-open="pasos" style="margin-top:6px">Cómo arrepentirse, paso a paso</button>`,
      (body) => body.querySelector('[data-open]').addEventListener('click', () => open('pasos')));
    }
  };

  render();
  bindSay(root);
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
