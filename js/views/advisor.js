// "Asesor": ask questions about Islam to Claude, grounded in sources.
import { getState } from '../store.js';
import { esc, icon, toast, openSheet, closeSheet } from '../ui.js';
import { ask, retrieve, getKey, setKey, errorMessage, SOURCE_SITES } from '../advisor-core.js';

const STORE = 'sakina:advisor';
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || null; } catch { return null; } };
const save = (c) => { try { localStorage.setItem(STORE, JSON.stringify(c)); } catch { /* full: keep in memory */ } };
const fresh = () => ({ api: [], view: [], web: true });

const SUGGESTIONS = [
  '¿Qué invalida el wudu según las escuelas?',
  '¿Cómo recupero oraciones que no recé?',
  '¿Es obligatorio el hijab? ¿Qué dicen los sabios?',
  '¿Qué dice el islam sobre las hipotecas con interés?',
  '¿Puedo rezar sentado si me duele la rodilla?',
  '¿Qué derechos tiene la esposa sobre su sueldo?',
];

// Small, safe markdown: escape first, then format
function md(src) {
  const lines = esc(src).split('\n');
  let html = '', list = null;
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>').replace(/`(.+?)`/g, '<code>$1</code>');
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    let m;
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { close(); html += `<h4>${inline(m[1])}</h4>`; }
    else if ((m = l.match(/^\s*[-•*]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${inline(m[1])}</li>`; }
    else if (!l.trim()) { close(); }
    else if (/^[؀-ۿ]/.test(l.trim())) { close(); html += `<p class="ar" lang="ar">${l}</p>`; }
    else { close(); html += `<p>${inline(l)}</p>`; }
  }
  close();
  return html;
}

export function mount(root) {
  let convo = load() || fresh();
  let busy = null; // AbortController while streaming

  const render = () => {
    if (!getKey()) { root.innerHTML = setupView(); return; }
    root.innerHTML = `
      <div class="adv-bar">
        <span class="small muted">Respuestas con Corán, hadices y escuelas</span>
        <span class="row" style="gap:6px">
          <button class="icon-btn" data-new aria-label="Nueva conversación">${icon('plus')}</button>
          <button class="icon-btn" data-cfg aria-label="Ajustes del asesor">${icon('sliders')}</button>
        </span>
      </div>
      <div class="chat" data-chat aria-live="polite">
        ${convo.view.length ? convo.view.map(bubble).join('') : emptyView()}
      </div>
      <form class="composer" data-form>
        <label class="sr" for="adv-q">Tu pregunta</label>
        <textarea id="adv-q" class="input" rows="1" placeholder="Escribe tu pregunta…" data-q enterkeyhint="send"></textarea>
        <button class="send" type="submit" aria-label="Enviar">${icon('send', 'send-ic')}</button>
      </form>
      <p class="adv-note">Puede equivocarse. Comprueba las fuentes y consulta a un sabio para casos personales.</p>`;
    scrollEnd();
  };

  const bubble = (m) => m.role === 'user'
    ? `<div class="msg user"><p>${esc(m.text)}</p></div>`
    : `<div class="msg bot ${m.error ? 'err' : ''}">${m.error ? `<p>${esc(m.text)}</p>` : md(m.text)}
        ${m.sources?.length ? `<div class="srcs">${m.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join('')}</div>` : ''}</div>`;

  const emptyView = () => `
    <div class="adv-empty">
      <div class="adv-mark ar" lang="ar">سَكِينَة</div>
      <p>Pregunta tus dudas sobre la fe, la oración, el ayuno, la familia o la vida diaria. Te responderé con el Corán, los hadices y la opinión de las escuelas, citando las fuentes.</p>
      <div class="sugg">${SUGGESTIONS.map((q) => `<button class="chip" data-sugg="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    </div>`;

  const setupView = () => `
    <div class="card adv-setup">
      <h3>Activa el asesor</h3>
      <p>El asesor usa Claude, la inteligencia artificial de Anthropic, con instrucciones para responder como un profesor de ciencias islámicas: cita el Corán, los hadices con su colección y número, y las posiciones de las cuatro escuelas cuando difieren.</p>
      <ol class="lsteps">
        <li>Crea una cuenta en <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> y añade algo de saldo (cada pregunta cuesta unos céntimos).</li>
        <li>En «API Keys», crea una clave y cópiala.</li>
        <li>Pégala aquí. Se guarda solo en este móvil y solo se envía a Anthropic.</li>
      </ol>
      <form data-keyform>
        <label class="field"><span>Clave de API</span>
          <input class="input" type="password" name="key" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" required /></label>
        <button class="btn block" type="submit">Guardar y empezar</button>
      </form>
      <p class="help" style="margin-top:12px">No incluyas esta clave en copias de seguridad ni la compartas: quien la tenga puede gastar tu saldo. Puedes borrarla cuando quieras.</p>
    </div>`;

  const scrollEnd = () => requestAnimationFrame(() => {
    const last = root.querySelector('.chat .msg:last-child');
    last?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  });

  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    const p = getState().profile;
    const refs = retrieve(text);
    const blocks = [{ type: 'text', text }];
    const ctx = [];
    if (!convo.api.length) {
      const who = p.gender === 'f' ? 'una mujer' : p.gender === 'm' ? 'un hombre' : 'una persona';
      ctx.push(`Contexto: quien pregunta es ${who}${p.newMuslim ? ' que es nueva en el islam' : ''}.`);
    }
    if (refs.length) ctx.push('Material de la app que puede ser útil:\n' + refs.map((r) => `- ${r.title}: ${r.text} (${r.src})`).join('\n'));
    if (ctx.length) blocks.push({ type: 'text', text: `<contexto>\n${ctx.join('\n\n')}\n</contexto>` });

    const apiBefore = convo.api.length;
    convo.api.push({ role: 'user', content: blocks });
    convo.view.push({ role: 'user', text });
    save(convo);

    // Draw the user bubble and an empty assistant bubble that fills as it streams
    const chat = root.querySelector('[data-chat]');
    if (!convo.view.length || chat.querySelector('.adv-empty')) chat.innerHTML = '';
    chat.insertAdjacentHTML('beforeend', bubble({ role: 'user', text }));
    chat.insertAdjacentHTML('beforeend', `<div class="msg bot live"><div class="typing" data-status>Pensando…</div><div data-live></div></div>`);
    const live = chat.querySelector('.live [data-live]');
    const status = chat.querySelector('.live [data-status]');
    scrollEnd();
    setBusy(true);

    let acc = '';
    let raf = 0;
    try {
      const res = await ask(convo.api, {
        web: convo.web,
        signal: busy.signal,
        onText: (d) => {
          acc += d;
          status.textContent = '';
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => { live.innerHTML = md(acc); });
        },
        onStatus: (s) => { if (!acc) status.textContent = s || ''; },
      });
      if (res.stop_reason === 'refusal') throw Object.assign(new Error('refusal'), { refusal: true });
      convo.api.push({ role: 'assistant', content: res.content }); // append-only history, blocks unchanged
      convo.view.push({ role: 'bot', text: res.text || '(sin respuesta)', sources: res.sources });
    } catch (err) {
      // Keep history valid: drop the unanswered user turn from the API copy
      convo.api.length = apiBefore;
      const msg = err.refusal ? 'No puedo responder a esta pregunta. Prueba a formularla de otra manera o consulta a un imam.' : errorMessage(err);
      convo.view.push({ role: 'bot', text: msg, error: true });
      if (err?.code === 'nokey' || err?.status === 401) { setBusy(false); render(); return; }
    }
    save(convo);
    setBusy(false);
    render();
  }

  function setBusy(on) {
    busy = on ? new AbortController() : null;
    const btn = root.querySelector('.send');
    if (!btn) return;
    btn.classList.toggle('stop', on);
    btn.setAttribute('aria-label', on ? 'Detener' : 'Enviar');
    btn.innerHTML = on ? '<span class="stop-sq"></span>' : icon('send', 'send-ic');
  }

  function openConfig() {
    openSheet('Ajustes del asesor', `
      <div class="list">
        <label class="list-row"><div class="grow"><div>Verificar en fuentes web</div><div class="meta">Busca en ${SOURCE_SITES.join(', ')} para comprobar citas. Algo más lento y caro.</div></div>
          <span class="switch"><input type="checkbox" data-web ${convo.web ? 'checked' : ''} aria-label="Verificar en fuentes web" /><span></span></span></label>
      </div>
      <h3 class="group">Tu clave</h3>
      <p class="help">Guardada solo en este dispositivo y fuera de las copias de seguridad. Termina en «…${esc(getKey().slice(-4))}».</p>
      <button class="btn danger block" data-delkey>${icon('trash')}Borrar clave de este móvil</button>
      <h3 class="group">Conversación</h3>
      <button class="btn ghost block" data-clear>${icon('reset')}Borrar historial</button>
      <p class="help" style="margin-top:14px">Modelo: Claude Opus 5.5. Cada pregunta se cobra en tu cuenta de Anthropic según su tamaño.</p>`,
    (b) => {
      b.querySelector('[data-web]').addEventListener('change', (e) => { convo.web = e.target.checked; save(convo); });
      b.querySelector('[data-delkey]').addEventListener('click', () => { setKey(''); closeSheet(); render(); toast('Clave borrada'); });
      b.querySelector('[data-clear]').addEventListener('click', () => { convo = { ...fresh(), web: convo.web }; save(convo); closeSheet(); render(); });
    });
  }

  const onClick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.sugg) send(b.dataset.sugg);
    else if ('new' in b.dataset) { if (busy) busy.abort(); convo = { ...fresh(), web: convo.web }; save(convo); render(); }
    else if ('cfg' in b.dataset) openConfig();
    else if (b.classList.contains('send') && busy) { e.preventDefault(); busy.abort(); }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (e.target.matches('[data-keyform]')) {
      const k = String(new FormData(e.target).get('key') || '').trim();
      if (!/^sk-ant-/.test(k)) { toast('La clave debe empezar por «sk-ant-»'); return; }
      setKey(k); render(); toast('Asesor activado'); return;
    }
    if (busy) return;
    const ta = root.querySelector('[data-q]');
    const q = ta.value; ta.value = ''; ta.style.height = '';
    send(q);
  };
  const onKey = (e) => {
    if (e.target.matches('[data-q]') && e.key === 'Enter' && !e.shiftKey && matchMedia('(pointer: fine)').matches) {
      e.preventDefault(); root.querySelector('[data-form]').requestSubmit();
    }
  };
  const onInput = (e) => {
    if (!e.target.matches('[data-q]')) return;
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  render();
  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  root.addEventListener('keydown', onKey);
  root.addEventListener('input', onInput);
  return () => { busy?.abort(); root.removeEventListener('click', onClick); root.removeEventListener('submit', onSubmit); root.removeEventListener('keydown', onKey); root.removeEventListener('input', onInput); };
}
