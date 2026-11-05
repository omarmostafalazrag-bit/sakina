// Astronomical prayer-time calculation (after the PrayTimes.org algorithm), fully offline.
// Returns real Date instants; display them in the location's time zone.

const DEG = Math.PI / 180;
const sin = (d) => Math.sin(d * DEG);
const cos = (d) => Math.cos(d * DEG);
const tan = (d) => Math.tan(d * DEG);
const asin = (x) => Math.asin(x) / DEG;
const acos = (x) => Math.acos(x) / DEG;
const atan2 = (y, x) => Math.atan2(y, x) / DEG;
const acot = (x) => Math.atan(1 / x) / DEG;
const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

export const METHODS = {
  MWL:      { name: 'Liga Mundial Musulmana', fajr: 18, isha: 17 },
  Egypt:    { name: 'Autoridad General Egipcia', fajr: 19.5, isha: 17.5 },
  Morocco:  { name: 'Ministerio de Habous (Marruecos)', fajr: 19, isha: 17, maghribMin: 5 },
  Makkah:   { name: 'Umm al-Qura (La Meca)', fajr: 18.5, ishaMin: 90 },
  ISNA:     { name: 'ISNA (Norteamérica)', fajr: 15, isha: 15 },
  Karachi:  { name: 'Univ. de Ciencias Islámicas, Karachi', fajr: 18, isha: 18 },
  France:   { name: 'UOIF (Francia)', fajr: 12, isha: 12 },
  Turkey:   { name: 'Diyanet (Turquía)', fajr: 18, isha: 17 },
  Gulf:     { name: 'Región del Golfo', fajr: 19.5, ishaMin: 90 },
  Kuwait:   { name: 'Kuwait', fajr: 18, isha: 17.5 },
  Qatar:    { name: 'Qatar', fajr: 18, ishaMin: 90 },
  Singapore:{ name: 'MUIS (Singapur, Malasia, Indonesia)', fajr: 20, isha: 18 },
};

export const PRAYERS = [
  { id: 'fajr', es: 'Fajr', ar: 'الفجر' },
  { id: 'dhuhr', es: 'Dhuhr', ar: 'الظهر' },
  { id: 'asr', es: 'Asr', ar: 'العصر' },
  { id: 'maghrib', es: 'Maghrib', ar: 'المغرب' },
  { id: 'isha', es: 'Isha', ar: 'العشاء' },
];

function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
  return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - fix(RA, 24) };
}

/**
 * @param {{y:number,m:number,d:number}} date local calendar date at the location
 * @param {number} lat
 * @param {number} lng
 * @param {{method?:string, asr?:'standard'|'hanafi', tune?:Record<string,number>}} opts
 */
export function computeTimes(date, lat, lng, opts = {}) {
  const M = METHODS[opts.method] || METHODS.MWL;
  const asrFactor = opts.asr === 'hanafi' ? 2 : 1;
  const jDate = julian(date.y, date.m, date.d) - lng / (15 * 24);

  const midDay = (t) => fix(12 - sunPosition(jDate + t).eqt, 24);
  const angleTime = (angle, t, ccw) => {
    const { decl } = sunPosition(jDate + t);
    const T = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
    return midDay(t) + (ccw ? -T : T);
  };
  const asrTime = (factor, t) => {
    const { decl } = sunPosition(jDate + t);
    return angleTime(-acot(factor + tan(Math.abs(lat - decl))), t);
  };

  const guess = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 };
  let t = { ...guess };
  for (let i = 0; i < 2; i++) {
    const p = {};
    for (const k in t) p[k] = (Number.isFinite(t[k]) ? t[k] : guess[k]) / 24;
    t = {
      fajr: angleTime(M.fajr, p.fajr, true),
      sunrise: angleTime(0.833, p.sunrise, true),
      dhuhr: midDay(p.dhuhr),
      asr: asrTime(asrFactor, p.asr),
      sunset: angleTime(0.833, p.sunset),
      isha: M.isha ? angleTime(M.isha, p.isha) : NaN,
    };
  }

  let maghrib = t.sunset + (M.maghribMin || 0) / 60;
  let isha = M.ishaMin ? maghrib + M.ishaMin / 60 : t.isha;
  let fajr = t.fajr;

  // High latitudes: angle-based rule (keeps Fajr/Isha sane in northern summers)
  const night = fix(t.sunrise - t.sunset, 24);
  const fajrPortion = (M.fajr / 60) * night;
  if (!Number.isFinite(fajr) || fix(t.sunrise - fajr, 24) > fajrPortion) fajr = t.sunrise - fajrPortion;
  if (!M.ishaMin) {
    const ishaPortion = (M.isha / 60) * night;
    if (!Number.isFinite(isha) || fix(isha - t.sunset, 24) > ishaPortion) isha = t.sunset + ishaPortion;
  }

  const tz = lng / 15;
  const tune = opts.tune || {};
  const base = Date.UTC(date.y, date.m - 1, date.d);
  const toDate = (h, key) => new Date(base + Math.round((h - tz) * 60 + (tune[key] || 0)) * 60000);

  return {
    fajr: toDate(fajr, 'fajr'),
    sunrise: toDate(t.sunrise, 'sunrise'),
    dhuhr: toDate(t.dhuhr, 'dhuhr'),
    asr: toDate(t.asr, 'asr'),
    maghrib: toDate(maghrib, 'maghrib'),
    isha: toDate(isha, 'isha'),
  };
}

/** Calendar date {y,m,d} of an instant as seen in a given IANA time zone. */
export function dateInTz(instant, tz) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

export function addDays({ y, m, d }, n) {
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

export const dateKey = ({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return { y, m, d }; };

/** Initial bearing from a point to the Kaaba, degrees clockwise from true north. */
export function qiblaBearing(lat, lng) {
  const kLat = 21.4225, kLng = 39.8262;
  const dL = (kLng - lng) * DEG;
  const p1 = lat * DEG, p2 = kLat * DEG;
  const y = Math.sin(dL);
  const x = Math.cos(p1) * Math.tan(p2) - Math.sin(p1) * Math.cos(dL);
  return fix(Math.atan2(y, x) / DEG, 360);
}

export function distanceToKaabaKm(lat, lng) {
  const R = 6371, kLat = 21.4225 * DEG, kLng = 39.8262 * DEG;
  const a = lat * DEG, b = lng * DEG;
  const h = Math.sin((kLat - a) / 2) ** 2 + Math.cos(a) * Math.cos(kLat) * Math.sin((kLng - b) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
