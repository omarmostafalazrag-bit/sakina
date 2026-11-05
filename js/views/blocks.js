// Shared renderer for lesson content blocks and Arabic text-to-speech.
import { esc, icon, toast } from '../ui.js';

export function renderBlocks(blocks) {
  let n = 0;
  return blocks.map((b) => {
    if (b.p) return `<p class="lp">${esc(b.p)}</p>`;
    if (b.tip) return `<div class="ltip">${esc(b.tip)}</div>`;
    if (b.steps) return `<ol class="lsteps">${b.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
    if (b.ar) {
      n++;
      return `<div class="lar">
        <div class="lar-top"><p class="ar" lang="ar">${esc(b.ar)}</p>
          <button class="say" data-say="${esc(b.ar)}" aria-label="Escuchar en árabe">${icon('sound')}</button></div>
        ${b.tr ? `<p class="lar-tr">${esc(b.tr)}</p>` : ''}
        ${b.es ? `<p class="lar-es">${esc(b.es)}</p>` : ''}
      </div>`;
    }
    return '';
  }).join('');
}

let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const vs = speechSynthesis.getVoices();
  return vs.find((v) => /^ar(-|_)SA/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };

export function say(text) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no puede leer en voz alta.'); return; }
  voice ||= pickVoice();
  if (!voice) { toast('Instala una voz en árabe en los ajustes de tu móvil para escucharlo.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[۝۞]/g, ' '));
  u.voice = voice; u.lang = voice.lang; u.rate = 0.8;
  speechSynthesis.speak(u);
}

/** Delegate clicks on [data-say] inside a root. */
export function bindSay(root) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-say]');
    if (b) say(b.dataset.say);
  });
}
