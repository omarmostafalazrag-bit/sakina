// Local-first state: everything lives on the device (localStorage), exportable as JSON.
const KEY = 'sakina:v1';

const defaults = () => ({
  version: 1,
  location: null, // { name, lat, lng, tz }
  profile: { gender: null, newMuslim: false, onboarded: false }, // gender: 'm' | 'f' | null
  period: { days: {}, ongoing: null }, // days: { 'YYYY-MM-DD': true }, ongoing: start key while bleeding
  path: { done: [] },   // new-muslim lessons completed
  arabic: { done: [], best: {} },
  fasts: {},           // 'YYYY-MM-DD': { type }
  qada: 0,             // Ramadan days still to make up
  tawba: { start: null, best: 0, relapses: 0, label: '' }, // private 'days firm' counter
  quran: { page: 29, bookmarks: [], days: {} }, // reading position in the user's own PDF
  journal: {},         // 'YYYY-MM-DD': { mood, reflection, gratitude[], good, fail, improve, dua, free }
  settings: {
    method: 'MWL',
    asr: 'standard',
    tune: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    hour12: false,
    hijriOffset: 0,
    theme: 'system',
    notify: false,
    notifyBefore: 0,
    currency: 'EUR',
  },
  prayers: {},        // 'YYYY-MM-DD': { fajr: { done, jamaah, at } }
  dhikr: { days: {}, total: 0, custom: [] },
  adhkarProgress: {}, // 'YYYY-MM-DD:set': { itemId: count }
  sadaqa: [],         // { id, amount, currency, date, type, to, note }
  learn: { saved: [], read: [] },
  duas: { fav: [] },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const data = JSON.parse(raw);
    const d = defaults();
    return { ...d, ...data, settings: { ...d.settings, ...data.settings, tune: { ...d.settings.tune, ...(data.settings?.tune || {}) } }, dhikr: { ...d.dhikr, ...data.dhikr }, profile: { ...d.profile, ...data.profile }, period: { ...d.period, ...data.period }, path: { ...d.path, ...data.path }, arabic: { ...d.arabic, ...data.arabic }, learn: { ...d.learn, ...data.learn }, duas: { ...d.duas, ...data.duas } };
  } catch {
    return defaults();
  }
}

let state = load();
const subs = new Set();

export const getState = () => state;

export function update(fn) {
  fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep in memory */ }
  subs.forEach((s) => s(state));
}

export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };

export function exportData() {
  return JSON.stringify({ app: 'sakina', exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function importData(json) {
  const data = JSON.parse(json);
  if (data.app !== 'sakina' || typeof data.prayers !== 'object') throw new Error('Este archivo no es una copia de Sakina.');
  delete data.app; delete data.exportedAt;
  localStorage.setItem(KEY, JSON.stringify(data));
  state = load();
  subs.forEach((s) => s(state));
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
