import { getState, update } from '../store.js';
import { POSTS, KINDS, KIND_LABEL } from '../data/learn.js';
import { esc, icon, haptic, toast } from '../ui.js';
import { todayKey } from '../core.js';

let filter = 'all';

// A stable daily order: today's featured post first, then a rotation so the feed feels fresh each day
function dailyOrder() {
  const day = Math.floor(Date.parse(todayKey()) / 86400000);
  const n = POSTS.length;
  const shift = (day * 7) % n;
  return POSTS.map((_, i) => POSTS[(i + shift) % n]);
}

export function mount(root) {
  const render = () => {
    const { saved, read } = getState().learn;
    const savedSet = new Set(saved), readSet = new Set(read);
    let list = dailyOrder();
    const featured = list[0];
    if (filter === 'saved') list = list.filter((p) => savedSet.has(p.id));
    else if (filter !== 'all') list = list.filter((p) => p.kind === filter);
    const unread = POSTS.filter((p) => !readSet.has(p.id)).length;

    root.innerHTML = `
      <p class="page-sub" style="margin:0 0 12px">Corán, hadices, la vida del Profeta ﷺ y de los profetas. ${unread ? `<span class="num">${unread}</span> lecturas por descubrir.` : 'Lo has leído todo, mashaAllah.'}</p>
      <div class="chips" role="group" aria-label="Temas">
        ${KINDS.map((k) => `<button class="chip" data-kind="${k.id}" aria-pressed="${k.id === filter}">${k.label}</button>`).join('')}
      </div>
      <div class="feed">
        ${list.length ? list.map((p) => post(p, savedSet.has(p.id), readSet.has(p.id), filter === 'all' && p === featured)).join('')
          : `<div class="empty"><h3>Nada guardado todavía</h3><p>Pulsa «Guardar» en cualquier lectura para volver a ella más tarde.</p></div>`}
      </div>`;
  };

  function post(p, saved, isRead, featured) {
    const long = p.body.length > 1;
    return `<article class="post ${featured ? 'featured' : ''}" data-id="${p.id}">
      <div class="kind"><span>${featured ? 'Lectura de hoy · ' : ''}${KIND_LABEL[p.kind]}</span>${!isRead && !featured ? '<span class="read-dot" aria-label="Sin leer"></span>' : ''}</div>
      <h3>${esc(p.title)}</h3>
      ${p.ar ? `<p class="ar" lang="ar">${esc(p.ar)}</p>` : ''}
      <div class="body">
        <p>${esc(p.body[0])}</p>
        ${long ? `<div data-rest hidden>${p.body.slice(1).map((b) => `<p>${esc(b)}</p>`).join('')}</div>` : ''}
      </div>
      ${long ? `<button class="more" data-more aria-expanded="false">Seguir leyendo</button>` : ''}
      <div class="actions">
        <span class="src">${esc(p.src)}</span>
        <span class="row" style="gap:2px">
          <button class="save" data-share aria-label="Compartir">${icon('upload')}</button>
          <button class="save" data-save aria-pressed="${saved}">${icon('bookmark')}${saved ? 'Guardado' : 'Guardar'}</button>
        </span>
      </div>
    </article>`;
  }

  // Mark posts as read when they've been on screen for a moment
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = e.target.dataset.id;
      setTimeout(() => {
        if (!e.target.isConnected) return;
        if (getState().learn.read.includes(id)) return;
        update((s) => { s.learn.read.push(id); });
        e.target.querySelector('.read-dot')?.remove();
      }, 1500);
      seen.unobserve(e.target);
    }
  }, { threshold: 0.6 });

  const observe = () => root.querySelectorAll('.post').forEach((el) => seen.observe(el));

  const onClick = async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.kind) { filter = b.dataset.kind; render(); observe(); window.scrollTo({ top: 0 }); return; }
    const art = b.closest('.post');
    const p = POSTS.find((x) => x.id === art?.dataset.id);
    if ('more' in b.dataset) {
      const rest = art.querySelector('[data-rest]');
      const open = rest.hidden;
      rest.hidden = !open;
      b.textContent = open ? 'Mostrar menos' : 'Seguir leyendo';
      b.setAttribute('aria-expanded', open);
    } else if ('save' in b.dataset) {
      let now;
      update((s) => {
        const i = s.learn.saved.indexOf(p.id);
        if (i >= 0) s.learn.saved.splice(i, 1); else s.learn.saved.push(p.id);
        now = i < 0;
      });
      haptic(8);
      b.setAttribute('aria-pressed', now);
      b.lastChild.textContent = now ? 'Guardado' : 'Guardar';
      if (filter === 'saved') { render(); observe(); }
    } else if ('share' in b.dataset) {
      const text = `${p.title}\n\n${p.ar ? p.ar + '\n\n' : ''}${p.body.join('\n\n')}\n\n— ${p.src}`;
      try {
        if (navigator.share) await navigator.share({ title: p.title, text });
        else { await navigator.clipboard.writeText(text); toast('Copiado para compartir'); }
      } catch { /* cancelled */ }
    }
  };

  render();
  observe();
  root.addEventListener('click', onClick);
  return () => { seen.disconnect(); root.removeEventListener('click', onClick); };
}
