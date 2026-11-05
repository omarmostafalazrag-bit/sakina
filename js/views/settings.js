// Sheets: location picker, settings, qibla compass.
import { getState, update, exportData, importData } from '../store.js';
import { METHODS, PRAYERS, qiblaBearing, distanceToKaabaKm } from '../prayer-times.js';
import { esc, icon, openSheet, closeSheet, toast, download } from '../ui.js';
import { deviceTz, scheduleReminders, buildIcs, todayDate } from '../core.js';
import { refresh, applyTheme } from '../app.js';

/* ---------------- Location ---------------- */
export function openLocation() {
  openSheet('Ubicación', `
    <button class="btn block" data-gps>${icon('locate')}Usar mi ubicación actual</button>
    <p class="help" style="margin:10px 0 18px">Se pide el GPS una vez. Tus coordenadas solo se usan para calcular los horarios.</p>
    <label class="search"><span class="sr">Buscar ciudad</span>${icon('search')}
      <input class="input" type="search" placeholder="Busca tu ciudad: Madrid, Ceuta, Casablanca…" autocomplete="off" data-q /></label>
    <div class="results" data-results></div>`,
  (root) => {
    const input = root.querySelector('[data-q]');
    const results = root.querySelector('[data-results]');
    let timer, ctrl;

    root.querySelector('[data-gps]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      if (!navigator.geolocation) return toast('Este navegador no permite usar la ubicación.');
      btn.disabled = true; btn.lastChild.textContent = 'Buscando tu posición…';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let name = 'Mi ubicación';
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`);
          const j = await r.json();
          name = [j.city || j.locality, j.countryName].filter(Boolean).join(', ') || name;
        } catch { /* offline: keep generic name */ }
        setLocation({ name, lat, lng, tz: deviceTz() });
      }, (err) => {
        btn.disabled = false; btn.lastChild.textContent = 'Usar mi ubicación actual';
        toast(err.code === 1 ? 'Permiso de ubicación denegado. Busca tu ciudad abajo.' : 'No se pudo obtener la ubicación. Busca tu ciudad.');
      }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
    });

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ''; return; }
      timer = setTimeout(async () => {
        ctrl?.abort(); ctrl = new AbortController();
        results.innerHTML = `<p class="muted small">Buscando…</p>`;
        try {
          const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=es&format=json`, { signal: ctrl.signal });
          const j = await r.json();
          const list = j.results || [];
          if (!list.length) { results.innerHTML = `<p class="muted small">No encuentro «${esc(q)}». Prueba con otra ortografía o una ciudad cercana.</p>`; return; }
          results.innerHTML = `<div class="list">${list.map((c, i) => `
            <button class="list-row" data-i="${i}"><div class="grow"><div>${esc(c.name)}</div>
              <div class="meta">${esc([c.admin1, c.country].filter(Boolean).join(', '))}</div></div>${icon('chev')}</button>`).join('')}</div>`;
          results.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => {
            const c = list[+b.dataset.i];
            setLocation({ name: `${c.name}, ${c.country_code || c.country || ''}`.replace(/, $/, ''), lat: c.latitude, lng: c.longitude, tz: c.timezone || deviceTz() });
          }));
        } catch (err) {
          if (err.name !== 'AbortError') results.innerHTML = `<p class="muted small">Sin conexión. Para buscar ciudades hace falta internet; el GPS funciona sin ella.</p>`;
        }
      }, 300);
    });
    setTimeout(() => input.focus({ preventScroll: true }), 380);
  });
}

function setLocation(loc) {
  update((s) => { s.location = loc; });
  closeSheet();
  scheduleReminders();
  refresh();
  toast(`Horarios para ${loc.name}`);
}

/* ---------------- Settings ---------------- */
export function openSettings() {
  const s = getState().settings;
  const methodOpts = Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${s.method === k ? 'selected' : ''}>${esc(m.name)}</option>`).join('');
  const notifSupported = 'Notification' in window;
  const tuneRows = [{ id: 'fajr', es: 'Fajr' }, { id: 'sunrise', es: 'Amanecer' }, ...PRAYERS.slice(1)].map((p) => `
    <label class="field" style="margin:0"><span>${p.es}</span>
      <input class="input num" type="number" inputmode="numeric" min="-30" max="30" step="1" value="${s.tune[p.id] || 0}" data-tune="${p.id}" /></label>`).join('');

  openSheet('Ajustes', `
    <h3 class="group">Cálculo de horarios</h3>
    <label class="field"><span>Método</span><select class="input" data-k="method">${methodOpts}</select></label>
    <p class="help">Elige el que usa tu mezquita o tu país. En España muchas mezquitas usan la Liga Mundial Musulmana; en Marruecos, Habous.</p>
    <div class="field"><span>Asr</span>
      <div class="seg" role="group" aria-label="Escuela para Asr">
        <button data-asr="standard" aria-pressed="${s.asr !== 'hanafi'}">Estándar</button>
        <button data-asr="hanafi" aria-pressed="${s.asr === 'hanafi'}">Hanafi</button>
      </div></div>
    <p class="help">Estándar: escuelas Shafi, Maliki y Hanbali. Hanafi: Asr más tarde.</p>
    <details style="margin-bottom:14px"><summary style="cursor:pointer;font-weight:600;min-height:44px;display:flex;align-items:center">Ajuste fino en minutos</summary>
      <p class="help" style="margin-top:4px">Suma o resta minutos para que coincida con el horario de tu mezquita.</p>
      <div class="grid-2">${tuneRows}</div></details>

    <h3 class="group">Recordatorios</h3>
    <div class="list">
      <div class="list-row"><div class="grow"><div>Avisos de rezo</div><div class="meta">${notifSupported ? 'Avisan mientras la app está abierta o en segundo plano' : 'Este navegador no admite notificaciones'}</div></div>
        <label class="switch"><input type="checkbox" data-notify ${s.notify ? 'checked' : ''} ${notifSupported ? '' : 'disabled'} aria-label="Avisos de rezo" /><span></span></label></div>
      <label class="list-row"><div class="grow">Avisar</div>
        <select class="input" style="width:auto;min-height:40px" data-k="notifyBefore">
          ${[0, 5, 10, 15, 20, 30].map((m) => `<option value="${m}" ${+s.notifyBefore === m ? 'selected' : ''}>${m ? `${m} min antes` : 'A la hora exacta'}</option>`).join('')}
        </select></label>
    </div>
    <p class="help" style="margin-top:10px">Las apps web no pueden despertar al móvil con el sistema cerrado. Para avisos garantizados, añade los horarios de 30 días a tu calendario: tendrán alarma.</p>
    <button class="btn soft block" data-ics>${icon('calendar')}Añadir 30 días al calendario</button>

    <h3 class="group">Pantalla</h3>
    <div class="field"><span>Tema</span><div class="seg" role="group" aria-label="Tema">
      ${[['system', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(([v, l]) => `<button data-theme="${v}" aria-pressed="${s.theme === v}">${l}</button>`).join('')}
    </div></div>
    <div class="list">
      <div class="list-row"><div class="grow">Formato de 12 horas</div>
        <label class="switch"><input type="checkbox" data-h12 ${s.hour12 ? 'checked' : ''} aria-label="Formato de 12 horas" /><span></span></label></div>
      <label class="list-row"><div class="grow"><div>Corrección de fecha hégira</div><div class="meta">Según el avistamiento de la luna en tu país</div></div>
        <select class="input" style="width:auto;min-height:40px" data-k="hijriOffset">
          ${[-2, -1, 0, 1, 2].map((d) => `<option value="${d}" ${+s.hijriOffset === d ? 'selected' : ''}>${d > 0 ? '+' + d : d} ${Math.abs(d) === 1 ? 'día' : 'días'}</option>`).join('')}
        </select></label>
    </div>

    <h3 class="group">Tus datos</h3>
    <p class="help">Todo se guarda solo en este dispositivo. Haz una copia antes de cambiar de móvil o borrar el navegador.</p>
    <div class="grid-2">
      <button class="btn ghost" data-export>${icon('download')}Exportar copia</button>
      <label class="btn ghost" style="cursor:pointer">${icon('upload')}Importar copia<input type="file" accept="application/json,.json" data-import hidden /></label>
    </div>
    <p class="help" style="margin-top:22px;text-align:center">Sakina · horarios calculados en el dispositivo · ${esc(getState().location?.name || '')}</p>
  `, (root) => {
    root.querySelectorAll('[data-k]').forEach((el) => el.addEventListener('change', () => {
      const k = el.dataset.k;
      const v = el.tagName === 'SELECT' && k !== 'method' ? Number(el.value) : el.value;
      update((st) => { st.settings[k] = v; });
      scheduleReminders(); refresh();
    }));
    root.querySelectorAll('[data-tune]').forEach((el) => el.addEventListener('change', () => {
      const v = Math.max(-30, Math.min(30, Math.round(Number(el.value) || 0)));
      el.value = v;
      update((st) => { st.settings.tune[el.dataset.tune] = v; });
      scheduleReminders(); refresh();
    }));
    root.querySelectorAll('[data-asr]').forEach((b) => b.addEventListener('click', () => {
      update((st) => { st.settings.asr = b.dataset.asr; });
      root.querySelectorAll('[data-asr]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      scheduleReminders(); refresh();
    }));
    root.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => {
      update((st) => { st.settings.theme = b.dataset.theme; });
      root.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      applyTheme();
    }));
    root.querySelector('[data-h12]').addEventListener('change', (e) => { update((st) => { st.settings.hour12 = e.target.checked; }); refresh(); });
    root.querySelector('[data-notify]')?.addEventListener('change', async (e) => {
      const on = e.target.checked;
      if (on && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          e.target.checked = false;
          toast('Sin permiso no puedo avisarte. Usa la opción del calendario.');
          return;
        }
      }
      update((st) => { st.settings.notify = on; });
      scheduleReminders();
      toast(on ? 'Avisos activados' : 'Avisos desactivados');
    });
    root.querySelector('[data-ics]').addEventListener('click', () => {
      if (!getState().location) return toast('Primero elige tu ubicación.');
      const d = todayDate();
      download(`rezos-${d.y}-${String(d.m).padStart(2, '0')}.ics`, buildIcs(30), 'text/calendar');
      toast('Abre el archivo para añadirlo a tu calendario');
    });
    root.querySelector('[data-export]').addEventListener('click', () => {
      const d = todayDate();
      download(`sakina-copia-${d.y}-${d.m}-${d.d}.json`, exportData(), 'application/json');
    });
    root.querySelector('[data-import]').addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        importData(await f.text());
        applyTheme(); scheduleReminders(); closeSheet(); refresh();
        toast('Copia restaurada');
      } catch (err) {
        toast(err.message || 'No se pudo leer el archivo.');
      }
    });
  });
}

/* ---------------- Qibla ---------------- */
export function openQibla() {
  const loc = getState().location;
  if (!loc) return openLocation();
  const bearing = qiblaBearing(loc.lat, loc.lng);
  const km = distanceToKaabaKm(loc.lat, loc.lng);
  const hasOrientation = 'DeviceOrientationEvent' in window;

  openSheet('Qibla', `
    <div class="compass" aria-hidden="true">
      <div class="dial" data-dial><span>N</span></div>
      <div class="needle" data-needle style="transform:rotate(${bearing}deg)"><div class="kaaba"></div></div>
      <div class="center"></div>
    </div>
    <div class="deg num" data-deg>${Math.round(bearing)}°</div>
    <p class="muted" style="text-align:center;margin:6px 0 18px">desde el norte, en el sentido de las agujas del reloj · La Meca a <span class="num">${Math.round(km).toLocaleString('es-ES')}</span> km</p>
    ${hasOrientation ? `<button class="btn block" data-live>${icon('compass')}Activar brújula</button>
    <p class="help" style="margin-top:10px">Sostén el móvil en horizontal, lejos de imanes y metales. Si la aguja baila, mueve el móvil dibujando un ocho para calibrar.</p>` : `<p class="help">Tu dispositivo no tiene brújula accesible desde el navegador. Usa el ángulo con una brújula física.</p>`}
  `, (root) => {
    const needle = root.querySelector('[data-needle]');
    const dial = root.querySelector('[data-dial]');
    const deg = root.querySelector('[data-deg]');
    let active = false;
    const onOrient = (e) => {
      let heading = e.webkitCompassHeading;
      if (heading == null && e.absolute && e.alpha != null) heading = 360 - e.alpha;
      if (heading == null) return;
      dial.style.transform = `rotate(${-heading}deg)`;
      needle.style.transform = `rotate(${bearing - heading}deg)`;
      const diff = Math.abs(((bearing - heading + 540) % 360) - 180);
      deg.textContent = diff < 4 ? 'Mirando a la qibla' : `${Math.round(bearing)}°`;
    };
    root.querySelector('[data-live]')?.addEventListener('click', async (e) => {
      if (active) return;
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const r = await DeviceOrientationEvent.requestPermission();
          if (r !== 'granted') return toast('Permiso de brújula denegado.');
        }
        window.addEventListener('deviceorientationabsolute', onOrient);
        window.addEventListener('deviceorientation', onOrient);
        active = true;
        e.currentTarget.textContent = 'Brújula activa';
        e.currentTarget.disabled = true;
        const sheet = document.getElementById('sheet');
        sheet.addEventListener('close', () => {
          window.removeEventListener('deviceorientationabsolute', onOrient);
          window.removeEventListener('deviceorientation', onOrient);
        }, { once: true });
      } catch { toast('No se pudo activar la brújula.'); }
    });
  });
}
