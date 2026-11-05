// Small UI toolkit: escaping, icons, toast, bottom sheet, haptics, search normalisation.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icon = (name, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ');

/** Wrap matches of the query words in <mark>, on already-escaped text. */
export function highlight(text, query) {
  const safe = esc(text);
  const words = norm(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return safe;
  // Build a map from normalised index to original by scanning characters
  const n = norm(text);
  const ranges = [];
  for (const w of words) {
    let i = n.indexOf(w);
    while (i !== -1) { ranges.push([i, i + w.length]); i = n.indexOf(w, i + w.length); }
  }
  if (!ranges.length) return safe;
  ranges.sort((a, b) => a[0] - b[0]);
  let out = '', last = 0;
  for (const [s, e] of ranges) {
    if (s < last) continue;
    out += esc(text.slice(last, s)) + '<mark>' + esc(text.slice(s, e)) + '</mark>';
    last = e;
  }
  return out + esc(text.slice(last));
}

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

export function haptic(ms = 8) {
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}

const sheet = () => document.getElementById('sheet');

/**
 * Open the bottom sheet.
 * @param {string} title
 * @param {string} body HTML
 * @param {(root:HTMLElement)=>void} [onMount]
 */
export function openSheet(title, body, onMount) {
  const d = sheet();
  d.classList.remove('closing');
  d.innerHTML = `
    <div class="sheet-head"><h2 id="sheet-title">${esc(title)}</h2>
      <button class="icon-btn" data-close aria-label="Cerrar">${icon('x')}</button></div>
    <div class="sheet-body">${body}</div>`;
  if (!d.open) d.showModal();
  d.querySelector('[data-close]').addEventListener('click', closeSheet);
  onMount?.(d.querySelector('.sheet-body'));
}

export function closeSheet() {
  const d = sheet();
  if (!d.open) return;
  d.classList.add('closing');
  setTimeout(() => { d.close(); d.classList.remove('closing'); d.innerHTML = ''; }, 230);
}

export function initSheet() {
  const d = sheet();
  // Click on the backdrop closes
  d.addEventListener('click', (e) => { if (e.target === d) closeSheet(); });
  d.addEventListener('cancel', (e) => { e.preventDefault(); closeSheet(); });
  // Drag the handle area down to dismiss (velocity-aware)
  let startY = 0, startT = 0, dy = 0, dragging = false;
  d.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.sheet-head') || e.target.closest('button')) return;
    dragging = true; startY = e.clientY; startT = performance.now(); dy = 0;
    d.style.transition = 'none';
    d.setPointerCapture(e.pointerId);
  });
  d.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dy = e.clientY - startY;
    const y = dy < 0 ? dy * 0.2 : dy; // friction upward
    d.style.transform = `translateY(${y}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    const v = Math.abs(dy) / (performance.now() - startT);
    d.style.transition = '';
    d.style.transform = '';
    if (dy > 120 || (dy > 20 && v > 0.11)) closeSheet();
  };
  d.addEventListener('pointerup', end);
  d.addEventListener('pointercancel', end);
}

export function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export function money(amount, currency = 'EUR') {
  try { return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount); }
  catch { return `${amount.toFixed(2)} ${currency}`; }
}
