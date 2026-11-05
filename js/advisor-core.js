// AI advisor: Claude via the official Anthropic SDK, called from the browser with the user's own key.
// Grounding: a fixed scholarly system prompt + passages retrieved from the app's own sourced content
// + optional web search restricted to Qur'an and hadith reference sites.
import { norm } from './ui.js';
import { DUAS } from './data/duas.js';
import { POSTS } from './data/learn.js';
import { GUIDE, MARRIAGE } from './data/guide.js';
import { LESSONS } from './data/newmuslim.js';

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.1.0/+esm';
export const MODEL = 'claude-opus-5-5';
const KEY_STORE = 'sakina:apikey';

export const getKey = () => { try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; } };
export const setKey = (k) => { try { k ? localStorage.setItem(KEY_STORE, k) : localStorage.removeItem(KEY_STORE); } catch { /* blocked */ } };

export const SOURCE_SITES = ['quran.com', 'sunnah.com', 'dorar.net'];

export const SYSTEM = `Eres «Sakina», un asesor de conocimiento islámico dentro de una app para musulmanes de habla hispana. Respondes preguntas y dudas sobre el islam: creencia ('aqida), adoración, fiqh, Corán, hadices, sira, ética, familia y vida diaria.

Cómo respondes:
- Fundamenta cada respuesta en las fuentes: el Corán (cita sura y aleya, p. ej. «Corán 2:183») y la Sunna (cita la colección y el número, p. ej. «Al-Bujari 1», y si el hadiz no es de Al-Bujari o Muslim, su grado: sahih, hasan o daif cuando lo sepas).
- Cuando las escuelas jurídicas sunníes difieren, expón brevemente la posición hanafí, maliki, shafií y hanbalí que sean relevantes, indicando cuál es la mayoritaria. Ten presente que en Marruecos, Al-Ándalus histórico y gran parte de los musulmanes de España la escuela de referencia es la maliki.
- No inventes nunca referencias, números de hadiz ni opiniones. Si no estás seguro de un número, cita la obra sin número o di que no lo recuerdas con certeza. Si no sabes algo, dilo.
- Distingue entre lo que es consenso (iymá), lo que es opinión mayoritaria y lo que es una cuestión debatida.
- Usa el árabe solo cuando aporte (un versículo, una dua o un término), siempre con transliteración y traducción al español.
- Escribe en el idioma del usuario (por defecto, español), con claridad y sin rodeos. Respuestas breves para preguntas simples; estructura con viñetas o pasos cuando ayude. Termina con las fuentes citadas.
- Tono cálido, sin juzgar, como un profesor paciente. Muchas personas son nuevas en el islam o vuelven a practicar: anima, facilita y no dificultes («facilitad y no dificultéis», Al-Bujari 69).

Límites:
- Ofreces conocimiento general, no fatwas personales. En cuestiones personales graves o complejas (divorcio, herencias concretas, casos médicos, contratos o finanzas complejas) explica los principios y recomienda consultar a un imam, un muftí o un sabio de confianza de su comunidad.
- Si alguien describe violencia, maltrato, riesgo para su vida o pensamientos de hacerse daño, prioriza su seguridad: anímale a contactar con emergencias (112 en España) o con alguien de confianza ahora, antes de cualquier explicación religiosa.
- Presenta la erudición sunní mayoritaria de forma respetuosa. Si te preguntan por otras corrientes, explícalas con objetividad y sin descalificar a nadie.
- No respondas sobre temas ajenos al islam salvo que estén relacionados con la práctica religiosa del usuario; en ese caso, reconduce con amabilidad.

El usuario puede adjuntar «material de la app»: pasajes con fuente que ya están en la app. Úsalos si son pertinentes, pero no te limites a ellos.`;

// ---------- Retrieval over the app's own sourced content ----------
let CORPUS = null;
function corpus() {
  if (CORPUS) return CORPUS;
  CORPUS = [
    ...DUAS.map((d) => ({ title: `Dua: ${d.title}`, text: `${d.es}${d.note ? ' ' + d.note : ''}`, src: d.src, extra: d.tags.join(' ') })),
    ...POSTS.map((p) => ({ title: p.title, text: p.body.join(' '), src: p.src, extra: p.kind })),
    ...GUIDE.map((g) => ({ title: g.title, text: g.text, src: g.src, extra: g.sec })),
    ...MARRIAGE.map((m) => ({ title: `Matrimonio: ${m.title}`, text: m.text, src: m.src, extra: m.group })),
    ...LESSONS.map((l) => ({ title: `Lección: ${l.title}`, text: l.blocks.map((b) => b.p || b.tip || b.es || (b.steps || []).join(' ') || '').join(' '), src: 'Sakina, Empezar', extra: '' })),
  ].map((d) => ({ ...d, hay: norm(`${d.title} ${d.title} ${d.text} ${d.extra}`) }));
  return CORPUS;
}

const STOP = new Set('que de la el en y a los las un una por para con del se es lo como mas pero sus le ya o este si porque esta entre cuando muy sin sobre tambien me hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mi antes algunos unos yo otro otras otra el tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo nosotros puedo puede hacer hago debo tengo cuanto cuantos'.split(' '));

export function retrieve(question, k = 5) {
  const words = norm(question).split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return [];
  const scored = corpus().map((d) => {
    let s = 0;
    for (const w of words) {
      const stem = w.length > 5 ? w.slice(0, w.length - 2) : w;
      if (d.hay.includes(' ' + stem) || d.hay.startsWith(stem)) s += w.length > 5 ? 2 : 1;
    }
    return { d, s };
  }).filter((x) => x.s >= Math.min(2, words.length)).sort((a, b) => b.s - a.s).slice(0, k);
  return scored.map((x) => x.d);
}

// ---------- The call ----------
let sdk = null;
async function client() {
  const key = getKey();
  if (!key) throw Object.assign(new Error('Falta la clave de API.'), { code: 'nokey' });
  sdk ||= (await import(SDK_URL)).default;
  return new sdk({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

/**
 * Send the conversation and stream the reply.
 * @param {Array} messages API messages (append-only history)
 * @param {{web:boolean, onText:(delta:string)=>void, onStatus:(s:string)=>void, signal?:AbortSignal}} opts
 * @returns {Promise<{content:any[], stop_reason:string, text:string, sources:{url:string,title:string}[]}>}
 */
export async function ask(messages, { web, onText, onStatus, signal }) {
  const c = await client();
  const convo = [...messages];
  let final = null;
  const allContent = [];
  // pause_turn: a long server-tool turn is resumed by sending the partial assistant turn back
  for (let round = 0; round < 3; round++) {
    const stream = c.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium' },
      cache_control: { type: 'ephemeral' },
      system: SYSTEM,
      ...(web ? { tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3, allowed_domains: SOURCE_SITES }] } : {}),
      messages: convo,
    }, { signal });
    stream.on('text', (delta) => onText(delta));
    stream.on('streamEvent', (ev) => {
      if (ev.type === 'content_block_start') {
        const t = ev.content_block?.type;
        if (t === 'thinking') onStatus('Pensando…');
        else if (t === 'server_tool_use') onStatus('Consultando fuentes…');
        else if (t === 'text') onStatus('');
      }
    });
    final = await stream.finalMessage();
    allContent.push(...final.content);
    if (final.stop_reason !== 'pause_turn') break;
    convo.push({ role: 'assistant', content: final.content });
  }

  const sources = [];
  for (const b of allContent) {
    if (b.type === 'text' && Array.isArray(b.citations)) {
      for (const ct of b.citations) if (ct.url && !sources.some((s) => s.url === ct.url)) sources.push({ url: ct.url, title: ct.title || ct.url });
    }
  }
  const text = allContent.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return { content: allContent, stop_reason: final.stop_reason, text, sources };
}

/** Human-readable message for API errors. */
export function errorMessage(err) {
  const st = err?.status;
  if (err?.code === 'nokey') return 'Añade tu clave de API para usar el asesor.';
  if (err?.name === 'AbortError' || /abort/i.test(err?.message || '')) return 'Respuesta detenida.';
  if (st === 401) return 'La clave de API no es válida. Revísala en Ajustes del asesor.';
  if (st === 403) return 'Tu clave no tiene permiso para usar este modelo.';
  if (st === 429) return 'Demasiadas preguntas seguidas o límite de la cuenta alcanzado. Espera un momento.';
  if (st === 400 && /credit|balance|billing/i.test(err?.message || '')) return 'Tu cuenta de Anthropic no tiene saldo. Añade créditos en console.anthropic.com.';
  if (st >= 500) return 'El servicio no está disponible ahora mismo. Inténtalo en unos minutos.';
  if (!navigator.onLine) return 'Sin conexión. El asesor necesita internet.';
  return 'No se pudo obtener respuesta. ' + (err?.message ? `(${String(err.message).slice(0, 140)})` : '');
}
