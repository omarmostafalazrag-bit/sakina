// Qur'an reader for the user's own PDF, stored only on the device (IndexedDB) and rendered with pdf.js.
import { getState, update } from '../store.js';
import { SURAS, QURAN_FIRST_PAGE } from '../data/suras.js';
import { esc, icon, openSheet, closeSheet, toast, haptic } from '../ui.js';
import { todayKey } from '../core.js';
import { fileGet, filePut, fileDel } from '../idb.js';

const KEY = 'quran-pdf';
let pdfjs = null;
let doc = null;      // loaded PDFDocumentProxy, kept across visits
let docPages = 0;

async function lib() {
  if (pdfjs) return pdfjs;
  pdfjs = await import('../vendor/pdfjs/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
  return pdfjs;
}

async function loadDoc() {
  if (doc) return doc;
  const blob = await fileGet(KEY);
  if (!blob) return null;
  const p = await lib();
  doc = await p.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
  docPages = doc.numPages;
  return doc;
}

export const suraOfPage = (page) => {
  let cur = null;
  for (const s of SURAS) { if (s[1] <= page) cur = s; else break; }
  return cur;
};

export function quranState() {
  return getState().quran || { page: QURAN_FIRST_PAGE, bookmarks: [], days: {} };
}

export function mount(root) {
  let page = quranState().page || QURAN_FIRST_PAGE;
  let rendering = null;
  let seenTimer = null;
  let zoom = 1;

  const shell = (inner) => `
    <div class="q-top">
      <a class="icon-btn" href="#/hoy" aria-label="Volver">${icon('back')}</a>
      <div class="q-title"><b>El Corán</b><span data-sura></span></div>
      <button class="icon-btn" data-index aria-label="Índice de suras">${icon('book')}</button>
      <button class="icon-btn" data-mark aria-label="Guardar marcador">${icon('bookmark')}</button>
    </div>${inner}`;

  const importView = () => shell(`
    <div class="card adv-setup" style="margin-top:8px">
      <h3>Añade tu Corán</h3>
      <p>Importa el PDF de «El Corán, traducción comentada» que tienes en tu móvil. Se guarda solo en este dispositivo y funciona sin conexión.</p>
      <ol class="lsteps">
        <li>Pasa el archivo <b>es_El_Coran.pdf</b> a tu móvil (AirDrop, iCloud Drive, Google Drive o enviándotelo).</li>
        <li>Pulsa el botón y elígelo en Archivos.</li>
      </ol>
      <label class="btn block" style="cursor:pointer">${icon('upload')}Elegir el PDF<input type="file" accept="application/pdf,.pdf" data-file hidden /></label>
      <p class="help" style="margin-top:12px">La traducción tiene derechos de autor, por eso la app no la incluye: lees tu propia copia.</p>
    </div>`);

  const readerView = () => shell(`
    <div class="q-page" data-pagewrap>
      <canvas data-canvas aria-label="Página del Corán"></canvas>
      <div class="q-loading" data-loading>Cargando…</div>
    </div>
    <div class="q-controls">
      <button class="icon-btn" data-prev aria-label="Página anterior">${icon('back')}</button>
      <button class="q-pageno" data-goto aria-label="Ir a una página"><b class="num" data-pno>${page}</b><span class="num">/ ${docPages}</span></button>
      <button class="icon-btn" data-zoom aria-label="Ampliar">${icon('search')}</button>
      <button class="icon-btn" data-next aria-label="Página siguiente">${icon('chev')}</button>
    </div>
    <p class="q-today small muted" data-today></p>`);

  const showToday = () => {
    const days = quranState().days || {};
    const n = (days[todayKey()] || []).length;
    const el = root.querySelector('[data-today]');
    if (el) el.textContent = n ? `Hoy has leído ${n} ${n === 1 ? 'página' : 'páginas'}` : 'Desliza o usa las flechas para pasar de página';
  };

  async function render() {
    let d = null;
    try { d = await loadDoc(); } catch { d = null; }
    if (!d) { root.innerHTML = importView(); return; }
    root.innerHTML = readerView();
    drawPage();
    bindSwipe();
  }

  async function drawPage() {
    page = Math.min(Math.max(1, page), docPages);
    update((s) => { s.quran = { ...quranState(), page }; });
    const s = suraOfPage(page);
    const sEl = root.querySelector('[data-sura]');
    if (sEl) sEl.textContent = page < QURAN_FIRST_PAGE ? 'Introducción' : s ? `${s[0]}. ${s[2]} · ${s[3]}` : '';
    const pno = root.querySelector('[data-pno]');
    if (pno) pno.textContent = page;
    const canvas = root.querySelector('[data-canvas]');
    const wrap = root.querySelector('[data-pagewrap]');
    if (!canvas) return;
    root.querySelector('[data-loading]').hidden = false;
    rendering?.cancel?.();
    try {
      const pg = await doc.getPage(page);
      const base = pg.getViewport({ scale: 1 });
      const cssW = wrap.clientWidth * zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const vp = pg.getViewport({ scale: (cssW * dpr) / base.width });
      canvas.width = vp.width; canvas.height = vp.height;
      canvas.style.width = cssW + 'px';
      canvas.style.height = (vp.height / dpr) + 'px';
      rendering = pg.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
      await rendering.promise;
      root.querySelector('[data-loading]').hidden = true;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') root.querySelector('[data-loading]').textContent = 'No se pudo mostrar la página.';
    }
    // Count the page as read after a few seconds on it
    clearTimeout(seenTimer);
    const at = page;
    seenTimer = setTimeout(() => {
      if (at !== page || at < QURAN_FIRST_PAGE) return;
      update((st) => {
        const q = (st.quran ||= { page: at, bookmarks: [], days: {} });
        q.days ||= {};
        const list = (q.days[todayKey()] ||= []);
        if (!list.includes(at)) list.push(at);
      });
      showToday();
    }, 6000);
    showToday();
  }

  const go = (n) => { if (n < 1 || n > docPages) return; page = n; haptic(4); drawPage(); window.scrollTo({ top: 0 }); };

  function bindSwipe() {
    const wrap = root.querySelector('[data-pagewrap]');
    let x0 = null, y0 = 0, t0 = 0;
    wrap.addEventListener('pointerdown', (e) => { if (zoom > 1) return; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); });
    wrap.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0, v = Math.abs(dx) / (performance.now() - t0);
      x0 = null;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (Math.abs(dx) > 60 || (Math.abs(dx) > 20 && v > 0.3)) go(page + (dx < 0 ? 1 : -1));
    });
  }

  function openIndex() {
    const cur = suraOfPage(page)?.[0];
    const q = quranState();
    openSheet('Índice', `
      ${q.bookmarks?.length ? `<h3 class="group" style="margin-top:0">Marcadores</h3><div class="list" style="margin-bottom:6px">${q.bookmarks.map((b, i) => {
        const s = suraOfPage(b.page);
        return `<div class="list-row"><button class="grow link-row" data-go="${b.page}">Página ${b.page}${s ? ` · ${esc(s[2])}` : ''}</button><button class="icon-btn" data-delmark="${i}" aria-label="Borrar marcador">${icon('x')}</button></div>`;
      }).join('')}</div>` : ''}
      <label class="search" style="margin-top:4px"><span class="sr">Buscar sura</span>${icon('search')}<input class="input" type="search" placeholder="Buscar sura: Kahf, María, 36…" data-sq autocomplete="off" /></label>
      <div class="list" data-slist>${SURAS.map((s) => `<button class="list-row sura-row ${s[0] === cur ? 'cur' : ''}" data-go="${s[1]}" data-s="${esc(`${s[0]} ${s[2]} ${s[3]}`.toLowerCase())}">
        <span class="snum num">${s[0]}</span><span class="grow"><span>${esc(s[2])}</span><span class="meta">${esc(s[3])}</span></span><span class="meta num">p. ${s[1]}</span></button>`).join('')}</div>
      <button class="btn ghost block" data-remove style="margin-top:18px">${icon('trash')}Quitar el PDF de este móvil</button>`,
    (body) => {
      body.querySelector('[data-sq]').addEventListener('input', (e) => {
        const q2 = e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
        body.querySelectorAll('[data-s]').forEach((r) => { r.hidden = q2 && !r.dataset.s.normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q2); });
      });
      body.addEventListener('click', async (e) => {
        const g = e.target.closest('[data-go]');
        if (g) { closeSheet(); go(Number(g.dataset.go)); return; }
        const dm = e.target.closest('[data-delmark]');
        if (dm) { update((s) => { s.quran.bookmarks.splice(Number(dm.dataset.delmark), 1); }); openIndex(); return; }
        if (e.target.closest('[data-remove]')) {
          if (!confirm('¿Quitar el PDF del Corán de este móvil? Podrás importarlo de nuevo.')) return;
          await fileDel(KEY); doc = null; closeSheet(); render(); toast('PDF quitado');
        }
      });
      requestAnimationFrame(() => body.querySelector('.sura-row.cur')?.scrollIntoView({ block: 'center' }));
    });
  }

  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if ('prev' in b.dataset) go(page - 1);
    else if ('next' in b.dataset) go(page + 1);
    else if ('index' in b.dataset) { if (doc) openIndex(); }
    else if ('zoom' in b.dataset) { zoom = zoom === 1 ? 1.6 : 1; root.querySelector('[data-pagewrap]').classList.toggle('zoomed', zoom > 1); drawPage(); }
    else if ('mark' in b.dataset && doc) {
      update((s) => {
        const q = (s.quran ||= { page, bookmarks: [], days: {} });
        q.bookmarks ||= [];
        if (!q.bookmarks.some((m) => m.page === page)) q.bookmarks.unshift({ page, at: todayKey() });
        q.bookmarks = q.bookmarks.slice(0, 20);
      });
      haptic(10); toast(`Marcador en la página ${page}`);
    } else if ('goto' in b.dataset) {
      const n = Number(prompt(`Ir a la página (1–${docPages})`, page));
      if (n) go(n);
    }
  };

  const onChange = async (e) => {
    if (!e.target.matches('[data-file]')) return;
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { toast('Elige un archivo PDF'); return; }
    root.querySelector('.adv-setup').insertAdjacentHTML('beforeend', '<p class="small muted" data-busy>Guardando en el móvil…</p>');
    try {
      await filePut(KEY, f);
      navigator.storage?.persist?.().catch(() => {});
      doc = null;
      const d = await loadDoc();
      if (d.numPages !== 642) toast('Este PDF no es la edición esperada: el índice de suras puede no coincidir.');
      else toast('Corán guardado. Ya puedes leerlo sin conexión.');
      render();
    } catch {
      root.querySelector('[data-busy]')?.remove();
      toast('No se pudo guardar el PDF. Revisa el espacio libre del móvil.');
    }
  };

  const onKey = (e) => {
    if (!doc || e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') go(page + 1);
    else if (e.key === 'ArrowLeft') go(page - 1);
  };

  root.innerHTML = shell('<div class="q-loading" style="position:static;margin-top:40px">Cargando…</div>');
  render();
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  document.addEventListener('keydown', onKey);
  return () => { clearTimeout(seenTimer); root.removeEventListener('click', onClick); root.removeEventListener('change', onChange); document.removeEventListener('keydown', onKey); };
}
