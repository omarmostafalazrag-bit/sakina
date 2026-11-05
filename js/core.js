// Shared domain helpers: today's schedule, formatting, Hijri date, reminders, calendar export.
import { getState } from './store.js';
import { computeTimes, dateInTz, addDays, dateKey, parseKey, PRAYERS } from './prayer-times.js';

export const deviceTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
export const tzOf = () => getState().location?.tz || deviceTz();

export function timesFor(date) {
  const { location, settings } = getState();
  if (!location) return null;
  return computeTimes(date, location.lat, location.lng, { method: settings.method, asr: settings.asr, tune: settings.tune });
}

export const todayDate = () => dateInTz(new Date(), tzOf());
export const todayKey = () => dateKey(todayDate());

export function fmtTime(d) {
  if (!d || isNaN(d)) return '--:--';
  const { settings } = getState();
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: settings.hour12, timeZone: tzOf() }).format(d);
}

/** Next obligatory prayer from now (rolls over to tomorrow's Fajr). */
export function nextPrayer(now = new Date()) {
  const today = todayDate();
  const t = timesFor(today);
  if (!t) return null;
  for (let i = 0; i < PRAYERS.length; i++) {
    const p = PRAYERS[i];
    if (t[p.id] > now) {
      const prevTime = i === 0 ? timesFor(addDays(today, -1)).isha : t[PRAYERS[i - 1].id];
      return { ...p, time: t[p.id], prevTime, tomorrow: false };
    }
  }
  const tm = timesFor(addDays(today, 1));
  return { ...PRAYERS[0], time: tm.fajr, prevTime: t.isha, tomorrow: true };
}

/** The prayer whose time window we're currently in (for "current" highlighting). */
export function currentPrayerId(now = new Date()) {
  const t = timesFor(todayDate());
  if (!t) return null;
  let cur = null;
  for (const p of PRAYERS) if (t[p.id] <= now) cur = p.id;
  return cur;
}

export function countdown(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(m / 60), mm = m % 60;
  if (h === 0) return `${mm} min`;
  return `${h} h ${mm} min`;
}

const HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Zani', 'Yumada al-Ula', 'Yumada al-Ajira', 'Rayab', 'Shaabán', 'Ramadán', 'Shawwal', 'Dhul Qaada', 'Dhul Hiyya'];
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function hijri(date = new Date()) {
  const off = getState().settings.hijriOffset || 0;
  const d = new Date(date.getTime() + off * 86400000);
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: tzOf() }).formatToParts(d);
    const get = (t) => parseInt(parts.find((p) => p.type === t)?.value, 10);
    const ar = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', timeZone: tzOf() }).format(d);
    return { es: `${get('day')} de ${HIJRI_MONTHS[get('month') - 1]} de ${get('year')} H`, ar, month: get('month'), day: get('day') };
  } catch {
    return { es: '', ar: '' };
  }
}

export function gregorian(date = new Date()) {
  return cap(new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tzOf() }).format(date));
}

export function dayScore(key) {
  const rec = getState().prayers[key] || {};
  return PRAYERS.reduce((n, p) => n + (rec[p.id]?.done ? 1 : 0), 0);
}

/* ---------------- Period (hayd) ---------------- */
export const isFemale = () => getState().profile.gender === 'f';

/** True when the day is marked as a period day (women are excused from prayer). */
export function isPeriod(key) {
  if (!isFemale()) return false;
  const { days, ongoing } = getState().period;
  if (days[key]) return true;
  return !!ongoing && key >= ongoing && key <= todayKey();
}

/** Turn an ongoing period into explicit days up to (and including) `endKey`. */
export function materializePeriod(s, endKey) {
  const start = s.period.ongoing;
  if (!start) return;
  let d = parseKey(start);
  for (let i = 0; i < 40 && dateKey(d) <= endKey; i++) { s.period.days[dateKey(d)] = true; d = addDays(d, 1); }
  s.period.ongoing = null;
}

/** Past periods as runs of consecutive days: [{ start, end, length }] (oldest first). */
export function periodRuns() {
  const keys = Object.keys(getState().period.days).filter((k) => getState().period.days[k]).sort();
  const ongoing = getState().period.ongoing;
  const runs = [];
  for (const k of keys) {
    const last = runs[runs.length - 1];
    if (last && dateKey(addDays(parseKey(last.end), 1)) === k) { last.end = k; last.length++; }
    else runs.push({ start: k, end: k, length: 1 });
  }
  if (ongoing) {
    const t = todayKey();
    const len = Math.round((Date.parse(t) - Date.parse(ongoing)) / 86400000) + 1;
    runs.push({ start: ongoing, end: t, length: len, ongoing: true });
  }
  return runs;
}

export function periodStats() {
  const runs = periodRuns();
  const done = runs.filter((r) => !r.ongoing);
  const avgLen = done.length ? Math.round(done.reduce((n, r) => n + r.length, 0) / done.length) : null;
  const gaps = [];
  for (let i = 1; i < runs.length; i++) gaps.push(Math.round((Date.parse(runs[i].start) - Date.parse(runs[i - 1].start)) / 86400000));
  const cycle = gaps.length ? Math.round(gaps.slice(-6).reduce((a, b) => a + b, 0) / Math.min(gaps.length, 6)) : null;
  const last = runs[runs.length - 1];
  const next = cycle && last ? dateKey(addDays(parseKey(last.start), cycle)) : null;
  return { runs, avgLen, cycle, next, last };
}

/** Consecutive days with all five prayers. Period days are neutral (they neither break nor add). */
export function streak() {
  let d = todayDate(), n = 0;
  const k0 = dateKey(d);
  if (dayScore(k0) < 5 && !isPeriod(k0)) d = addDays(d, -1);
  for (let i = 0; i < 3650; i++) {
    const k = dateKey(d);
    if (isPeriod(k)) { d = addDays(d, -1); continue; }
    if (dayScore(k) !== 5) break;
    n++; d = addDays(d, -1);
  }
  return n;
}

/* ---------------- Reminders ---------------- */
let timers = [];

export function scheduleReminders() {
  timers.forEach(clearTimeout);
  timers = [];
  const { settings, location } = getState();
  if (!settings.notify || !location || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const before = (settings.notifyBefore || 0) * 60000;
  const today = todayDate();
  for (const date of [today, addDays(today, 1)]) {
    const t = timesFor(date);
    for (const p of PRAYERS) {
      const fireAt = t[p.id].getTime() - before;
      const delay = fireAt - now;
      if (delay > 0 && delay < 26 * 3600e3) {
        timers.push(setTimeout(() => notify(p, t[p.id], settings.notifyBefore), delay));
      }
    }
  }
}

async function notify(p, time, before) {
  const title = before ? `${p.es} en ${before} min` : `Es la hora de ${p.es}`;
  const body = `${p.ar} · ${fmtTime(time)} · ${getState().location?.name || ''}`;
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) await reg.showNotification(title, { body, tag: `prayer-${p.id}`, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', renotify: true });
    else new Notification(title, { body });
  } catch { /* ignore */ }
}

/* ---------------- Calendar export (.ics) ---------------- */
export function buildIcs(days = 30) {
  const { settings, location } = getState();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sakina//Horarios de rezo//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:Rezos · ${location.name}`];
  let date = todayDate();
  const now = stamp(new Date());
  for (let i = 0; i < days; i++) {
    const t = timesFor(date);
    for (const p of PRAYERS) {
      lines.push('BEGIN:VEVENT', `UID:${dateKey(date)}-${p.id}@sakina`, `DTSTAMP:${now}`, `DTSTART:${stamp(t[p.id])}`, 'DURATION:PT15M',
        `SUMMARY:${p.es} ${p.ar}`, `LOCATION:${location.name.replace(/[,;]/g, ' ')}`, 'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${p.es}`, `TRIGGER:-PT${settings.notifyBefore || 0}M`, 'END:VALARM', 'END:VEVENT');
    }
    date = addDays(date, 1);
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Share of obligatory prayers prayed in a month, up to today; period days excluded. */
export function monthPct(y, m) {
  const tk = todayKey();
  let total = 0, done = 0;
  for (let d = 1; d <= 31; d++) {
    const k = dateKey({ y, m, d });
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCMonth() !== m - 1 || k > tk || isPeriod(k)) continue;
    total += 5; done += dayScore(k);
  }
  return total ? Math.round((done / total) * 100) : 0;
}

/** Hijri month names spanned by a Gregorian month, e.g. "Yumada al-Ula – Yumada al-Ajira 1448". */
export function hijriSpan(y, m) {
  const a = hijri(new Date(Date.UTC(y, m - 1, 1, 12)));
  const last = new Date(Date.UTC(y, m, 0, 12));
  const b = hijri(last);
  const ma = a.es.replace(/^\d+ de /, '').replace(/ de (\d+) H$/, ' $1');
  const mb = b.es.replace(/^\d+ de /, '').replace(/ de (\d+) H$/, ' $1');
  if (ma === mb) return mb;
  const ya = ma.split(' ').pop(), yb = mb.split(' ').pop();
  return ya === yb ? `${ma.replace(/ \d+$/, '')} – ${mb}` : `${ma} – ${mb}`;
}
