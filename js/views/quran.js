// Qur'an: verified Uthmani Arabic text (Tanzil) with Spanish translation, ayah by ayah,
// with Mishary Alafasy's recitation. Text is fetched from api.alquran.cloud and cached on the device.
import { getState, update } from '../store.js';
import { SURAS } from '../data/suras.js';
import { esc, icon, openSheet, closeSheet, toast, haptic, norm } from '../ui.js';
import { todayKey } from '../core.js';
import { fileGet, filePut, fileDel } from '../idb.js';

const API = 'https://api.alquran.cloud/v1';
const AUDIO = (n) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${n}.mp3`;
const AR = 'quran-uthmani';
export const TRANSLATIONS = [
  { id: 'es.garcia', label: 'Isa García', note: 'Traducción comentada, pensada para lectores latinoamericanos (2013)' },
  { id: 'es.cortes', label: 'Julio Cortés', note: 'La traducción clásica en español (1979)' },
  { id: 'es.asad', label: 'Muhammad Asad', note: 'Versión española de Abdurrasak Pérez' },
  { id: 'es.bornez', label: 'Raúl González Bórnez', note: 'Traducción desde el árabe (2008)' },
];
const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const AR_DIGITS = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

export const quranState = () => ({ sura: 1, ayah: 1, tr: 'es.garcia', showTr: true, size: 28, bookmarks: [], days: {}, ...(getState().quran || {}) });
const setQ = (fn) => update((s) => { s.quran = { ...quranState(), ...(s.quran || {}) }; fn(s.quran); });

// The previous version stored a PDF on the device: remove it
fileDel('quran-pdf').catch(() => {});

/* ---------- Data ---------- */
const mem = new Map();
async function loadSura(n, tr) {
  const key = `sura:${n}:${tr}`;
  if (mem.has(key)) return mem.get(key);
  let data = await fileGet(key).catch(() => null);
  if (!data) {
    const r = await fetch(`${API}/surah/${n}/editions/${AR},${tr}`);
    if (!r.ok) throw new Error('net');
    const j = await r.json();
    const [ar, es] = j.data;
    data = ar.ayahs.map((a, i) => ({ n: a.numberInSurah, g: a.number, juz: a.juz, ar: a.text.replace(/^\uFEFF/, ''), es: es.ayahs[i]?.text || '' }));
    filePut(key, data).catch(() => {});
  }
  // Uthmani text includes the basmala in ayah 1 of every sura except 1 and 9: show it as a heading instead
  if (n !== 1 && n !== 9 && data[0]) {
    const words = data[0].ar.split(/\s+/);
    const bare = (w) => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[\u0671\u0622\u0623\u0625]/g, '\u0627');
    if (words.slice(0, 4).map(bare).join(' ') === 'بسم الله الرحمن الرحيم') data = [{ ...data[0], ar: words.slice(4).join(' ') }, ...data.slice(1)];
  }
  mem.set(key, data);
  return data;
}

async function downloadAll(tr, onProgress) {
  onProgress('Descargando el texto árabe…');
  const [a, t] = await Promise.all([fetch(`${API}/quran/${AR}`).then((r) => r.json()), (onProgress('Descargando el texto y la traducción…'), fetch(`${API}/quran/${tr}`).then((r) => r.json()))]);
  const sa = a.data.surahs, st = t.data.surahs;
  for (let i = 0; i < 114; i++) {
    const data = sa[i].ayahs.map((x, k) => ({ n: x.numberInSurah, g: x.number, juz: x.juz, ar: x.text.replace(/^\uFEFF/, ''), es: st[i].ayahs[k]?.text || '' }));
    await filePut(`sura:${i + 1}:${tr}`, data);
    if (i % 10 === 0) onProgress(`Guardando… ${Math.round((i / 114) * 100)}%`);
  }
  setQ((q) => { q.offline = { ...(q.offline || {}), [tr]: true }; });
}

/* ---------- View ---------- */
export function mount(root) {
  const parts = location.hash.replace(/^#\/?coran\/?/, '').split(/[/?]/).filter(Boolean);
  const audio = new Audio();
  audio.preload = 'none';
  let playing = null; // { sura, idx, cont }
  let observer = null;
  let readTimer = new Map();

  const cleanupAudio = () => { audio.pause(); audio.src = ''; playing = null; };

  /* ----- Index ----- */
  function renderIndex() {
    const q = quranState();
    const cur = SURAS[q.sura - 1];
    const read = (q.days?.[todayKey()] || []).length;
    const trLabel = TRANSLATIONS.find((t) => t.id === q.tr)?.label;
    root.innerHTML = `
      <header class="page-head" style="margin-bottom:12px"><div><h1 class="page-title">El Corán</h1>
        <p class="page-sub">Texto árabe verificado con la traducción de ${esc(trLabel)}.</p></div>
        <button class="icon-btn" data-settings aria-label="Ajustes de lectura">${icon('sliders')}</button></header>

      <a class="continue-card" href="#/coran/${q.sura}/${q.ayah}">
        <div class="grow"><div class="small" style="font-weight:700;color:var(--accent)">Continuar leyendo</div>
          <div class="cc-title">${esc(cur[1])} <span class="muted">· ${esc(cur[2])}</span></div>
          <div class="small muted">Aleya ${q.ayah} de ${cur[4]}${read ? ` · hoy has leído ${read} ${read === 1 ? 'aleya' : 'aleyas'}` : ''}</div></div>
        <span class="ar cc-ar" lang="ar">${esc(cur[3])}</span>
      </a>

      <label class="search"><span class="sr">Buscar</span>${icon('search')}
        <input class="input" type="search" placeholder="Sura, «2:255» o palabras del texto" data-q autocomplete="off" enterkeyhint="search" /></label>
      <div data-results></div>

      ${q.bookmarks?.length ? `<h2 class="section">Marcadores</h2><div class="list">${q.bookmarks.map((b, i) => `
        <div class="list-row"><a class="grow link-row" href="#/coran/${b.s}/${b.a}">${esc(SURAS[b.s - 1][1])} ${b.s}:${b.a}</a>
        <button class="icon-btn" data-delmark="${i}" aria-label="Borrar marcador">${icon('x')}</button></div>`).join('')}</div>` : ''}

      <h2 class="section">Suras</h2>
      <div class="list" data-list>${SURAS.map((s) => `
        <a class="list-row sura-row ${s[0] === q.sura ? 'cur' : ''}" href="#/coran/${s[0]}" data-s="${esc(norm(`${s[0]} ${s[1]} ${s[2]}`))}">
          <span class="snum num">${s[0]}</span>
          <span class="grow"><span>${esc(s[1])}</span><span class="meta">${esc(s[2])} · ${s[4]} aleyas · ${s[5]}</span></span>
          <span class="ar sura-ar" lang="ar">${esc(s[3])}</span></a>`).join('')}</div>

      <p class="help" style="margin-top:16px">${q.offline?.[q.tr] ? 'Disponible sin conexión.' : 'Las suras que abres se guardan para leerlas sin conexión.'} Texto árabe: Tanzil (tanzil.net), versión uthmani verificada. Traducción: ${esc(trLabel)}. Recitación: Mishary Alafasy. Servido por alquran.cloud.</p>`;

    const input = root.querySelector('[data-q]');
    input.addEventListener('input', () => {
      const v = input.value.trim();
      const m = v.match(/^(\d{1,3})\s*[:.,\s]\s*(\d{1,3})$/);
      const qn = norm(v);
      root.querySelectorAll('[data-s]').forEach((r) => { r.hidden = !!qn && !m && !r.dataset.s.includes(qn); });
      const res = root.querySelector('[data-results]');
      if (m && SURAS[+m[1] - 1] && +m[2] >= 1 && +m[2] <= SURAS[+m[1] - 1][4]) {
        res.innerHTML = `<a class="btn soft block" href="#/coran/${+m[1]}/${+m[2]}" style="margin-bottom:12px">Ir a ${esc(SURAS[+m[1] - 1][1])} ${+m[1]}:${+m[2]}</a>`;
      } else if (qn.length >= 4) {
        res.innerHTML = `<button class="btn ghost block" data-fulltext style="margin-bottom:12px">${icon('search')}Buscar «${esc(v)}» en el texto</button>`;
      } else res.innerHTML = '';
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') root.querySelector('[data-results] a, [data-results] button')?.click(); });
  }

  async function fullText(v) {
    const q = quranState();
    const words = norm(v).split(/\s+/).filter((w) => w.length > 2);
    const arQ = v.replace(/[ً-ٰٟۖ-ۭ]/g, '');
    const res = root.querySelector('[data-results]');
    res.innerHTML = '<p class="muted small">Buscando…</p>';
    const hits = [];
    let missing = 0;
    for (const s of SURAS) {
      let data = mem.get(`sura:${s[0]}:${q.tr}`) || await fileGet(`sura:${s[0]}:${q.tr}`).catch(() => null);
      if (!data) { missing++; continue; }
      for (const a of data) {
        const t = norm(a.es);
        const okEs = words.length && words.every((w) => t.includes(w));
        const okAr = /[؀-ۿ]/.test(v) && a.ar.replace(/[ً-ٰٟۖ-ۭ]/g, '').includes(arQ);
        if (okEs || okAr) hits.push({ s, a });
        if (hits.length >= 60) break;
      }
      if (hits.length >= 60) break;
    }
    res.innerHTML = `
      ${missing ? `<p class="help">Buscando en las suras guardadas (${114 - missing} de 114). <button class="link-btn" data-dl>Descarga el Corán completo</button> para buscar en todo.</p>` : ''}
      ${hits.length ? `<p class="count-line">${hits.length >= 60 ? 'Más de 60' : hits.length} resultados</p><div class="list" style="margin-bottom:14px">${hits.map(({ s, a }) => `
        <a class="list-row hit" href="#/coran/${s[0]}/${a.n}"><span class="grow"><span class="meta">${esc(s[1])} ${s[0]}:${a.n}</span><span>${esc(a.es.slice(0, 160))}${a.es.length > 160 ? '…' : ''}</span></span></a>`).join('')}</div>`
        : '<p class="muted">Sin resultados.</p>'}`;
  }

  /* ----- Sura ----- */
  async function renderSura(n, focusAyah) {
    const q = quranState();
    const prevSura = q.sura;
    const s = SURAS[n - 1];
    root.innerHTML = `
      <div class="q-top">
        <a class="icon-btn" href="#/coran" aria-label="Índice">${icon('back')}</a>
        <div class="q-title"><b>${esc(s[1])}</b><span>${s[0]} · ${esc(s[2])} · ${s[4]} aleyas · ${s[5]}</span></div>
        <button class="icon-btn" data-playall aria-label="Escuchar la sura">${icon('sound')}</button>
        <button class="icon-btn" data-settings aria-label="Ajustes de lectura">${icon('sliders')}</button>
      </div>
      <div class="sura-head"><span class="ar" lang="ar">سُورَةُ ${esc(s[3])}</span></div>
      ${n !== 1 && n !== 9 ? `<p class="basmala ar" lang="ar">${BASMALA}</p>` : ''}
      <div class="ayahs" data-ayahs style="--qsize:${q.size}px"><p class="muted" style="text-align:center;padding:40px 0">Cargando…</p></div>
      <div class="sura-nav">
        ${n > 1 ? `<a class="btn ghost" href="#/coran/${n - 1}">${icon('back')}${esc(SURAS[n - 2][1])}</a>` : '<span></span>'}
        ${n < 114 ? `<a class="btn ghost" href="#/coran/${n + 1}">${esc(SURAS[n][1])}${icon('chev')}</a>` : '<span></span>'}
      </div>`;
    let data;
    try { data = await loadSura(n, q.tr); }
    catch {
      root.querySelector('[data-ayahs]').innerHTML = '<div class="empty"><h3>Sin conexión</h3><p>Esta sura aún no está guardada en el móvil. Conéctate a internet para abrirla una vez, o descarga el Corán completo desde el índice.</p></div>';
      return;
    }
    const marks = new Set((q.bookmarks || []).map((b) => `${b.s}:${b.a}`));
    root.querySelector('[data-ayahs]').innerHTML = data.map((a) => `
      <article class="ayah" id="a${a.n}" data-n="${a.n}" data-g="${a.g}">
        <p class="ar ayah-ar" lang="ar">${esc(a.ar)} <span class="ayah-num">﴿${AR_DIGITS(a.n)}﴾</span></p>
        ${q.showTr ? `<p class="ayah-es"><span class="num ayah-ref">${n}:${a.n}</span> ${esc(a.es)}</p>` : ''}
        <div class="ayah-actions">
          <button data-play="${a.n}" aria-label="Escuchar aleya ${a.n}">${icon('sound')}</button>
          <button data-mark="${a.n}" aria-pressed="${marks.has(`${n}:${a.n}`)}" aria-label="Marcador en la aleya ${a.n}">${icon('bookmark')}</button>
          <button data-copy="${a.n}" aria-label="Copiar aleya ${a.n}">${icon('copy')}</button>
        </div>
      </article>`).join('');

    const target = focusAyah && root.querySelector(`#a${focusAyah}`);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    else window.scrollTo({ top: 0 });
    setQ((qq) => { qq.sura = n; qq.ayah = focusAyah || (prevSura === n ? qq.ayah : 1); });

    // Track reading position and ayahs read today
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const an = Number(e.target.dataset.n);
        if (e.isIntersecting) {
          readTimer.set(an, setTimeout(() => {
            setQ((qq) => {
              qq.sura = n; qq.ayah = an;
              qq.days ||= {};
              const list = (qq.days[todayKey()] ||= []);
              const k = `${n}:${an}`;
              if (!list.includes(k)) list.push(k);
            });
          }, 2500));
        } else { clearTimeout(readTimer.get(an)); readTimer.delete(an); }
      }
    }, { threshold: 0.6 });
    root.querySelectorAll('.ayah').forEach((el) => observer.observe(el));

    const bySurah = Object.fromEntries(data.map((a) => [a.n, a]));
    const playAyah = (an, cont) => {
      const a = bySurah[an];
      if (!a) { cleanupAudio(); markPlaying(null); return; }
      playing = { idx: an, cont };
      audio.src = AUDIO(a.g);
      audio.play().catch(() => toast('No se pudo reproducir. Comprueba la conexión.'));
      markPlaying(an);
    };
    const markPlaying = (an) => {
      root.querySelectorAll('.ayah.playing').forEach((el) => el.classList.remove('playing'));
      if (an) { const el = root.querySelector(`#a${an}`); el?.classList.add('playing'); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      const pa = root.querySelector('[data-playall]');
      if (pa) pa.classList.toggle('on', !!an);
    };
    audio.onended = () => { if (playing?.cont) playAyah(playing.idx + 1, true); else { markPlaying(null); playing = null; } };

    root.onclick = async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.play) {
        const an = Number(b.dataset.play);
        if (playing?.idx === an && !audio.paused) { audio.pause(); markPlaying(null); playing = null; }
        else playAyah(an, false);
      } else if ('playall' in b.dataset) {
        if (playing) { cleanupAudio(); markPlaying(null); }
        else playAyah(quranState().sura === n ? quranState().ayah : 1, true);
      } else if (b.dataset.mark) {
        const an = Number(b.dataset.mark);
        let on;
        setQ((qq) => {
          qq.bookmarks ||= [];
          const i = qq.bookmarks.findIndex((x) => x.s === n && x.a === an);
          if (i >= 0) { qq.bookmarks.splice(i, 1); on = false; } else { qq.bookmarks.unshift({ s: n, a: an }); qq.bookmarks = qq.bookmarks.slice(0, 30); on = true; }
        });
        b.setAttribute('aria-pressed', on);
        haptic(8);
        toast(on ? `Marcador en ${n}:${an}` : 'Marcador quitado');
      } else if (b.dataset.copy) {
        const a = bySurah[Number(b.dataset.copy)];
        const text = `${a.ar}\n\n${a.es}\n\n— Corán ${n}:${a.n} (${s[1]})`;
        try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('Aleya copiada'); } } catch { /* cancelled */ }
      } else if ('settings' in b.dataset) openSettings(() => renderSura(n, quranState().ayah));
    };
  }

  /* ----- Settings ----- */
  function openSettings(after) {
    const q = quranState();
    openSheet('Lectura del Corán', `
      <h3 class="group" style="margin-top:0">Traducción</h3>
      <div class="list">${TRANSLATIONS.map((t) => `<button class="list-row" data-tr="${t.id}"><div class="grow"><div>${esc(t.label)}</div><div class="meta">${esc(t.note)}</div></div>${q.tr === t.id ? icon('check') : ''}</button>`).join('')}</div>
      <div class="list" style="margin-top:12px"><label class="list-row"><div class="grow">Mostrar la traducción</div>
        <span class="switch"><input type="checkbox" data-showtr ${q.showTr ? 'checked' : ''} aria-label="Mostrar la traducción" /><span></span></span></label></div>
      <h3 class="group">Tamaño del árabe</h3>
      <div class="row" style="justify-content:space-between">
        <button class="icon-btn" data-size="-2" aria-label="Más pequeño">A−</button>
        <span class="ar" lang="ar" data-sample style="font-size:${q.size}px;font-family:var(--font-quran)">بِسْمِ ٱللَّهِ</span>
        <button class="icon-btn" data-size="2" aria-label="Más grande">A+</button>
      </div>
      <h3 class="group">Sin conexión</h3>
      <p class="help">Guarda el Corán completo (unos 4 MB) en este móvil para leerlo y buscar en él sin internet.</p>
      <button class="btn block ${q.offline?.[q.tr] ? 'ghost' : ''}" data-dl>${icon('download')}${q.offline?.[q.tr] ? 'Descargado · volver a descargar' : 'Descargar el Corán completo'}</button>
      <p class="small muted" data-dlstatus style="text-align:center;margin-top:8px"></p>`,
    (body) => {
      body.addEventListener('click', async (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.dataset.tr) { setQ((qq) => { qq.tr = b.dataset.tr; }); mem.clear(); closeSheet(); after(); }
        else if (b.dataset.size) {
          setQ((qq) => { qq.size = Math.max(20, Math.min(44, qq.size + Number(b.dataset.size))); });
          body.querySelector('[data-sample]').style.fontSize = quranState().size + 'px';
          document.querySelector('[data-ayahs]')?.style.setProperty('--qsize', quranState().size + 'px');
        } else if ('dl' in b.dataset) {
          b.disabled = true;
          const st = body.querySelector('[data-dlstatus]');
          try { await downloadAll(quranState().tr, (m) => { st.textContent = m; }); st.textContent = 'Listo: ya puedes leerlo sin conexión.'; navigator.storage?.persist?.().catch(() => {}); }
          catch { st.textContent = 'No se pudo descargar. Comprueba la conexión.'; b.disabled = false; }
        }
      });
      body.querySelector('[data-showtr]').addEventListener('change', (e) => { setQ((qq) => { qq.showTr = e.target.checked; }); closeSheet(); after(); });
    });
  }

  /* ----- Root clicks for the index ----- */
  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b || !root.querySelector('[data-list]')) return;
    if ('settings' in b.dataset) openSettings(renderIndex);
    else if ('fulltext' in b.dataset) fullText(root.querySelector('[data-q]').value);
    else if ('dl' in b.dataset) openSettings(renderIndex);
    else if (b.dataset.delmark) { setQ((q) => { q.bookmarks.splice(Number(b.dataset.delmark), 1); }); renderIndex(); }
  };

  const n = Number(parts[0]);
  if (n >= 1 && n <= 114) renderSura(n, Number(parts[1]) || null);
  else renderIndex();
  root.addEventListener('click', onClick);
  return () => { cleanupAudio(); observer?.disconnect(); readTimer.forEach(clearTimeout); root.onclick = null; root.removeEventListener('click', onClick); };
}

export const suraName = (n) => SURAS[n - 1]?.[1];
