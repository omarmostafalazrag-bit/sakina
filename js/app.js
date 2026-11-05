import { getState } from './store.js';
import { initSheet } from './ui.js';
import { scheduleReminders } from './core.js';
import * as today from './views/today.js';
import * as duas from './views/duas.js';
import * as dhikr from './views/dhikr.js';
import * as learn from './views/learn.js';
import * as sadaqa from './views/sadaqa.js';

const ROUTES = { hoy: today, duas, dikr: dhikr, aprender: learn, sadaqa };
const TITLES = { hoy: 'Hoy', duas: 'Duas', dikr: 'Dikr', aprender: 'Aprender', sadaqa: 'Sadaqa' };
const viewEl = document.getElementById('view');
let cleanup = null;
let currentRoute = null;

function routeName() {
  const r = location.hash.replace(/^#\/?/, '').split(/[?/]/)[0];
  return ROUTES[r] ? r : 'hoy';
}

function show(route, { animate = true } = {}) {
  cleanup?.();
  cleanup = null;
  // Fresh container per view so listeners never pile up
  const host = document.createElement('div');
  viewEl.replaceChildren(host);
  cleanup = ROUTES[route].mount(host) || null;
  document.title = route === 'hoy' ? 'Sakina' : `${TITLES[route]} · Sakina`;
  document.querySelectorAll('.tabbar a').forEach((a) => {
    if (a.dataset.tab === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (animate && route !== currentRoute) {
    viewEl.classList.remove('enter'); void viewEl.offsetWidth; viewEl.classList.add('enter');
    window.scrollTo({ top: 0 });
  }
  currentRoute = route;
}

/** Re-render the current view in place (after settings change). */
export function refresh() { const y = window.scrollY; show(currentRoute || routeName(), { animate: false }); window.scrollTo({ top: y }); }

export function applyTheme() {
  const t = getState().settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = t;
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0E1116' : '#F3EEE4'));
}

window.addEventListener('hashchange', () => { const r = routeName(); if (r === currentRoute) refresh(); else show(r); });
// Re-sync when returning to the app (new day, passed prayers, reminders)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') { scheduleReminders(); if (currentRoute === 'hoy') refresh(); }
});

// The AI advisor was removed: forget any key or chat a previous version stored
try { localStorage.removeItem('sakina:apikey'); localStorage.removeItem('sakina:advisor'); } catch { /* storage blocked */ }

applyTheme();
initSheet();
show(routeName(), { animate: false });
scheduleReminders();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
